// File: Client/src/components/engineViews/ShopView.jsx
import { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { WORLD } from '../../data/GameWorld';
import { generateItem } from '../../engine/ENGINE_EquipmentCreation';
import { generateHorseMount } from '../../engine/ENGINE_MountCreation';
import { generateAnimalNPC } from '../../engine/ENGINE_AnimalCreation';
import { calculateDerivedStats } from '../../engine/ENGINE_Inventory';
import { calculateRankFromEconomy } from '../../utils/EconomyUtils';
import { calculateBuyPrice, calculateSellPrice, calculateRepairCost } from '../../engine/ENGINE_Economy_Shops';
import Button from '../Button';
import ShopItemCard from '../ShopItemCard';
import styles from '../../styles/ShopView.module.css';
import ConfirmModal from '../ConfirmModal';

const ShopView = () => {
	const gameState = useGameState((state) => state.gameState);
	const cancelEncounter = useGameState((state) => state.cancelEncounter);

	const tradeTag = gameState?.activeTradeTag;

	const isRepairShop = tradeTag === 'Repair_Equipment';
	const [shopMode, setShopMode] = useState(isRepairShop ? 'REPAIR' : 'BUY');

	const [merchantStock, setMerchantStock] = useState([]);
	const [cart, setCart] = useState([]);
	const [isStockGenerated, setIsStockGenerated] = useState(false);
	const doShopTransaction = useGameState((state) => state.doShopTransaction);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [numericSelections, setNumericSelections] = useState({});

	const player = gameState?.player;
	const targetId = gameState?.activeTargetId;

	const regionalExchangeRate = useGameState((state) => state.gameState?.location?.regionalExchangeRate) || 10;

	const playerHonor = player?.progression?.honor || 0;
	const playerCoins = player?.inventory?.silverCoins || 0;
	const { totalCha } = player ? calculateDerivedStats(player) : { totalCha: 1 };

	const honorFactor = WORLD.ECONOMY.tradeMultipliers.tradeHonorFactor || 0.025;
	const bonusDelta = playerHonor * honorFactor + totalCha / 500;
	const absBonusPct = Math.round(Math.abs(bonusDelta) * 100);

	const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

	// 1. Generate Merchant Stock
	useEffect(() => {
		if (!tradeTag || isStockGenerated || isRepairShop) return;

		const newStock = [];
		const limits = WORLD.ECONOMY.shopGeneration;
		const ecoValues = WORLD.ECONOMY.baseValues;
		const ecoLevel = gameState?.location?.regionalEconomyLevel || 1;

		try {
			if (tradeTag === 'Trade_Weapon') {
				const count = getRandomInt(limits.Weapon.min, limits.Weapon.max);
				for (let i = 0; i < count; i++) newStock.push(generateItem('Weapon', calculateRankFromEconomy(ecoLevel), 'Trade'));
			} else if (tradeTag === 'Trade_Armour') {
				const count = getRandomInt(limits.Armour.min, limits.Armour.max);
				for (let i = 0; i < count; i++) newStock.push(generateItem('Armour', calculateRankFromEconomy(ecoLevel), 'Trade'));
			} else if (tradeTag === 'Trade_Shield') {
				const count = getRandomInt(limits.Shield.min, limits.Shield.max);
				for (let i = 0; i < count; i++) newStock.push(generateItem('Shield', calculateRankFromEconomy(ecoLevel), 'Trade'));
			} else if (tradeTag === 'Trade_Helmet') {
				const minLimit = limits.Helmet?.min || limits.Armour.min;
				const maxLimit = limits.Helmet?.max || limits.Armour.max;
				const count = getRandomInt(minLimit, maxLimit);
				for (let i = 0; i < count; i++) newStock.push(generateItem('Helmet', calculateRankFromEconomy(ecoLevel), 'Trade'));
			} else if (tradeTag === 'Trade_Mount') {
				const count = getRandomInt(limits.Mount.min, limits.Mount.max);
				for (let i = 0; i < count; i++) newStock.push(generateHorseMount(calculateRankFromEconomy(ecoLevel)));
			} else if (tradeTag === 'Trade_Animal') {
				const count = getRandomInt(limits.Animal.min, limits.Animal.max);
				for (let i = 0; i < count; i++) {
					if (typeof generateAnimalNPC === 'function') newStock.push(generateAnimalNPC('Domestic', null, calculateRankFromEconomy(ecoLevel)));
				}
			} else if (tradeTag === 'Trade_Food') {
				newStock.push({
					entityId: 'commodity_food_01',
					itemName: 'Travel Rations',
					isNumeric: true,
					inventoryKey: 'food',
					maxQuantity: getRandomInt(limits.Food.min, limits.Food.max),
					economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfFood || 1 },
				});
			} else if (tradeTag === 'Trade_Potion') {
				newStock.push({
					entityId: 'commodity_potion_01',
					itemName: 'Healing Potion',
					isNumeric: true,
					inventoryKey: 'healingPotions', // CORRECTED SCHEMA KEY
					maxQuantity: getRandomInt(limits.Potion.min, limits.Potion.max),
					economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfHealingPotion || 25 },
				});
			} else if (tradeTag === 'Trade_Coin') {
				newStock.push({
					entityId: 'commodity_silver_ingot',
					itemName: 'Silver Ingot',
					isNumeric: true,
					inventoryKey: 'tradeSilver',
					maxQuantity: getRandomInt(limits.TradeSilver?.min || 5, limits.TradeSilver?.max || 20),
					economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfSilver || 10 },
				});
				newStock.push({
					entityId: 'commodity_gold_ingot',
					itemName: 'Gold Ingot',
					isNumeric: true,
					inventoryKey: 'tradeGold',
					maxQuantity: getRandomInt(limits.TradeGold?.min || 1, limits.TradeGold?.max || 5),
					economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfGold || 100 },
				});
			}
		} catch (error) {
			console.error('Shop Generation Error:', error);
		}

		setMerchantStock(newStock);
		setIsStockGenerated(true);
	}, [tradeTag, isStockGenerated, isRepairShop, gameState?.location?.regionalEconomyLevel]);

	// 2. Construct Player Inventory
	const getPlayerStockForCurrentShop = () => {
		if (!player || !player.inventory) return [];
		let stock = [];
		const ecoValues = WORLD.ECONOMY.baseValues;

		if (isRepairShop) {
			stock = player.inventory.itemSlots.filter((i) => i.state && i.state.currentDurability < i.state.maxDurability);
		} else if (tradeTag === 'Trade_Weapon') {
			stock = player.inventory.itemSlots.filter((i) => i.classification?.itemClass === 'Weapon' || i.itemCategory === 'Weapon');
		} else if (tradeTag === 'Trade_Armour') {
			stock = player.inventory.itemSlots.filter((i) => i.classification?.itemClass === 'Armour' || i.itemCategory === 'Armour');
		} else if (tradeTag === 'Trade_Shield') {
			stock = player.inventory.itemSlots.filter((i) => i.classification?.itemClass === 'Shield' || i.itemCategory === 'Shield');
		} else if (tradeTag === 'Trade_Helmet') {
			stock = player.inventory.itemSlots.filter((i) => i.classification?.itemClass === 'Helmet' || i.itemCategory === 'Helmet');
		} else if (tradeTag === 'Trade_Mount') {
			stock = player.inventory.animalSlots.filter((i) => i.classification?.entityClass === 'Mount');
		} else if (tradeTag === 'Trade_Animal') {
			stock = player.inventory.animalSlots.filter((i) => i.classification?.entityClass !== 'Mount');
		} else if (tradeTag === 'Trade_Loot') {
			stock = player.inventory.lootSlots;
		} else if (tradeTag === 'Trade_Food' && player.inventory.food > 0) {
			stock.push({
				entityId: 'player_commodity_food',
				itemName: 'Travel Rations',
				isNumeric: true,
				inventoryKey: 'food',
				maxQuantity: player.inventory.food,
				economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfFood || 1 },
			});
		} else if (tradeTag === 'Trade_Potion' && player.inventory.healingPotions > 0) {
			// CORRECTED SCHEMA KEY
			stock.push({
				entityId: 'player_commodity_potion',
				itemName: 'Healing Potion',
				isNumeric: true,
				inventoryKey: 'healingPotions', // CORRECTED SCHEMA KEY
				maxQuantity: player.inventory.healingPotions, // CORRECTED SCHEMA KEY
				economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfHealingPotion || 25 },
			});
		} else if (tradeTag === 'Trade_Coin') {
			if (player.inventory.tradeSilver > 0) {
				stock.push({
					entityId: 'player_commodity_silver',
					itemName: 'Silver Ingot',
					isNumeric: true,
					inventoryKey: 'tradeSilver',
					maxQuantity: player.inventory.tradeSilver,
					economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfSilver || 10 },
				});
			}
			if (player.inventory.tradeGold > 0) {
				stock.push({
					entityId: 'player_commodity_gold',
					itemName: 'Gold Ingot',
					isNumeric: true,
					inventoryKey: 'tradeGold',
					maxQuantity: player.inventory.tradeGold,
					economy: { baseCoinValue: ecoValues.goldCoinBaseCostOfGold || 100 },
				});
			}
		}
		return stock;
	};

	const playerStock = getPlayerStockForCurrentShop();

	// 3. Cart Functions
	const addToCart = (item, quantity = 1) => {
		const existingItem = cart.find((c) => c.entityId === item.entityId);
		if (item.isNumeric) {
			if (existingItem) setCart(cart.map((c) => (c.entityId === item.entityId ? { ...c, cartQuantity: quantity } : c)));
			else setCart([...cart, { ...item, cartQuantity: quantity }]);
		} else {
			if (!existingItem) setCart([...cart, { ...item, cartQuantity: 1 }]);
		}
	};

	const removeFromCart = (itemId) => {
		setCart(cart.filter((item) => item.entityId !== itemId));
	};

	const handleNumericSlider = (itemId, value) => {
		setNumericSelections({ ...numericSelections, [itemId]: parseInt(value) });
	};

	// 4. Pricing System
	const getItemPrice = (item) => {
		const baseCost = item.economy?.baseCoinValue || item.goldCoinBaseCost || 0;
		const currentDur = item.state?.currentDurability || 100;
		const maxDur = item.state?.maxDurability || 100;

		if (shopMode === 'BUY') {
			return calculateBuyPrice(baseCost, regionalExchangeRate, playerHonor, totalCha);
		} else if (shopMode === 'SELL') {
			return calculateSellPrice(baseCost, regionalExchangeRate, currentDur, maxDur, playerHonor, totalCha);
		} else if (shopMode === 'REPAIR') {
			return calculateRepairCost(baseCost, regionalExchangeRate, currentDur, maxDur, playerHonor, totalCha);
		}
		return 0;
	};

	const getRawItemPrice = (item) => {
		const baseCost = item.economy?.baseCoinValue || item.goldCoinBaseCost || 0;
		const currentDur = item.state?.currentDurability || 100;
		const maxDur = item.state?.maxDurability || 100;

		if (shopMode === 'BUY') {
			return calculateBuyPrice(baseCost, regionalExchangeRate, 0, 0);
		} else if (shopMode === 'SELL') {
			return calculateSellPrice(baseCost, regionalExchangeRate, currentDur, maxDur, 0, 0);
		} else if (shopMode === 'REPAIR') {
			return calculateRepairCost(baseCost, regionalExchangeRate, currentDur, maxDur, 0, 0);
		}
		return 0;
	};

	const calculateCartTotal = () => cart.reduce((sum, item) => sum + getItemPrice(item) * item.cartQuantity, 0);
	const calculateRawCartTotal = () => cart.reduce((sum, item) => sum + getRawItemPrice(item) * item.cartQuantity, 0);

	const targetNpc = gameState?.activeEntities?.find((npc) => npc.entityId === targetId);

	const merchantName = targetNpc ? targetNpc.entityName : isRepairShop ? 'Blacksmith' : 'Merchant';
	const shopTitle = `${merchantName}'s ${isRepairShop ? 'Workshop' : 'Exchange'}`;

	const handleConfirmTransaction = () => {
		const success = doShopTransaction(cart, shopMode, regionalExchangeRate);

		if (success) {
			if (shopMode !== 'REPAIR') {
				setMerchantStock((prevStock) => {
					let newStock = [...prevStock];
					cart.forEach((cartItem) => {
						if (cartItem.isNumeric) {
							const stockIndex = newStock.findIndex((s) => s.inventoryKey === cartItem.inventoryKey);
							if (shopMode === 'BUY' && stockIndex !== -1) {
								newStock[stockIndex] = { ...newStock[stockIndex], maxQuantity: newStock[stockIndex].maxQuantity - cartItem.cartQuantity };
							} else if (shopMode === 'SELL') {
								if (stockIndex !== -1) {
									newStock[stockIndex] = { ...newStock[stockIndex], maxQuantity: newStock[stockIndex].maxQuantity + cartItem.cartQuantity };
								} else {
									newStock.push({ ...cartItem, entityId: cartItem.entityId.replace('player_', ''), maxQuantity: cartItem.cartQuantity });
								}
							}
						}
					});

					if (shopMode === 'BUY') {
						const purchasedPhysicalIds = cart.filter((i) => !i.isNumeric).map((i) => i.entityId);
						newStock = newStock.filter((i) => !purchasedPhysicalIds.includes(i.entityId));
						newStock = newStock.filter((i) => !i.isNumeric || i.maxQuantity > 0);
					} else if (shopMode === 'SELL') {
						const soldPhysicalItems = cart.filter((i) => !i.isNumeric);
						newStock = [...newStock, ...soldPhysicalItems];
					}
					return newStock;
				});
			}

			setCart([]);
			setNumericSelections({});
		} else {
			alert('Transaction failed! Check your coins or capacity.');
		}
		setIsConfirmModalOpen(false);
	};

	const renderActiveInventory = () => {
		const activeItems = shopMode === 'BUY' ? merchantStock : playerStock;

		if (activeItems.length === 0) {
			return (
				<div className={styles.emptyState}>
					{shopMode === 'BUY'
						? 'The merchant has nothing to offer.'
						: shopMode === 'REPAIR'
							? 'You have no damaged equipment to repair.'
							: 'You have no matching items to sell.'}
				</div>
			);
		}

		return activeItems.map((item, index) => {
			const price = getItemPrice(item);
			const inCart = cart.find((c) => c.entityId === item.entityId);
			const selectedQty = numericSelections[item.entityId] || 1;

			return (
				<ShopItemCard
					key={item.entityId || index}
					item={item}
					shopMode={shopMode}
					price={price}
					inCart={!!inCart}
					selectedQty={selectedQty}
					onAddToCart={addToCart}
					onRemoveFromCart={removeFromCart}
					onSliderChange={handleNumericSlider}
				/>
			);
		});
	};

	const actualTotal = calculateCartTotal();
	const rawTotal = calculateRawCartTotal();
	const diffCoins = Math.abs(rawTotal - actualTotal);

	const isInsufficientFunds = (shopMode === 'BUY' || shopMode === 'REPAIR') && actualTotal > playerCoins;
	const isZeroTotal = (shopMode === 'BUY' || shopMode === 'REPAIR') && actualTotal === 0;

	const isConfirmDisabled = cart.length === 0 || isInsufficientFunds || isZeroTotal;

	return (
		<div className={styles.shopContainer}>
			<div className={styles.fixedTop}>
				<h2 className={styles.title}>{shopTitle}</h2>

				{bonusDelta !== 0 && (
					<div className={`${styles.bonusText} ${bonusDelta > 0 ? styles.textPositive : styles.textNegative}`}>
						{shopMode === 'BUY' || shopMode === 'REPAIR'
							? bonusDelta > 0
								? `-${absBonusPct}% (Reputation Discount)`
								: `+${absBonusPct}% (Reputation Penalty)`
							: bonusDelta > 0
								? `+${absBonusPct}% (Reputation Bonus)`
								: `-${absBonusPct}% (Reputation Penalty)`}
					</div>
				)}

				{!isRepairShop && (
					<div className={styles.modeButtons}>
						<button
							className={`${styles.modeBtn} ${shopMode === 'BUY' ? styles.modeBtnActive : styles.modeBtnInactive}`}
							onClick={() => {
								setShopMode('BUY');
								setCart([]);
							}}
						>
							BUY
						</button>
						<button
							className={`${styles.modeBtn} ${shopMode === 'SELL' ? styles.modeBtnActive : styles.modeBtnInactive}`}
							onClick={() => {
								setShopMode('SELL');
								setCart([]);
							}}
						>
							SELL
						</button>
					</div>
				)}
				{isRepairShop && (
					<div className={styles.modeButtons}>
						<button className={`${styles.modeBtn} ${styles.modeBtnActive}`}>REPAIR SHOP</button>
					</div>
				)}

				<div className={styles.checkoutBox}>
					<div className={styles.checkoutTotal}>
						<span className={styles.checkoutLabel}>Estimated Total:</span>
						<span className={styles.checkoutValue}>{actualTotal} Coins</span>
					</div>

					<div className={styles.infoRow}>
						<span>Your Wallet:</span>
						<span className={isInsufficientFunds ? styles.textNegative : styles.textPositive}>{playerCoins} Coins</span>
					</div>

					{cart.length > 0 && diffCoins > 0 && (
						<div className={`${styles.infoRow} ${bonusDelta > 0 ? styles.textPositive : styles.textNegative}`}>
							<span>{bonusDelta > 0 ? 'Reputation Savings:' : 'Reputation Penalty:'}</span>
							<span>
								{bonusDelta > 0 ? '+' : '-'}
								{diffCoins} Coins
							</span>
						</div>
					)}

					{isInsufficientFunds && <div className={styles.warningText}>Not enough coins! Remove some items.</div>}

					{isZeroTotal && cart.length > 0 && <div className={styles.warningText}>Transaction total is 0. Nothing to process.</div>}

					<Button
						variant='primary'
						className={styles.confirmBtn}
						disabled={isConfirmDisabled}
						onClick={() => {
							if (!isConfirmDisabled) setIsConfirmModalOpen(true);
						}}
					>
						Confirm {shopMode === 'BUY' ? 'Purchase' : shopMode === 'REPAIR' ? 'Repair' : 'Sale'}
					</Button>
				</div>
			</div>

			<div className={styles.scrollableMiddle}>
				<div className={styles.inventorySection}>
					<h3 className={styles.sectionHeader}>
						{shopMode === 'BUY' ? "Merchant's Stock" : shopMode === 'REPAIR' ? 'Damaged Equipment' : 'Your Inventory'}
					</h3>
					<div className={styles.inventoryList}>{renderActiveInventory()}</div>
				</div>

				{cart.length > 0 && (
					<div className={styles.cartSection}>
						<div className={styles.cartContainer}>
							<h3 className={styles.cartTitle}>Items in Cart</h3>
							<div className={styles.cartList}>
								{cart.map((item) => (
									<div
										key={item.entityId}
										className={styles.cartItem}
									>
										<span className={styles.cartItemName}>
											{item.cartQuantity > 1 ? `${item.cartQuantity}x ` : ''}
											{item.itemName || item.entityName}
										</span>
										<div className={styles.cartItemMeta}>
											<span className={styles.cartItemPrice}>{getItemPrice(item) * item.cartQuantity} C</span>
											<button
												onClick={() => removeFromCart(item.entityId)}
												className={styles.removeBtn}
											>
												×
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>

			<ConfirmModal
				isOpen={isConfirmModalOpen}
				title={`Confirm ${shopMode === 'BUY' ? 'Purchase' : shopMode === 'REPAIR' ? 'Repair' : 'Sale'}`}
				message={`Are you sure you want to proceed? Total ${shopMode === 'BUY' || shopMode === 'REPAIR' ? 'Cost' : 'Revenue'}: ${actualTotal} Coins.`}
				confirmText='Accept'
				cancelText='Cancel'
				onConfirm={handleConfirmTransaction}
				onCancel={() => setIsConfirmModalOpen(false)}
			/>
		</div>
	);
};

export default ShopView;
