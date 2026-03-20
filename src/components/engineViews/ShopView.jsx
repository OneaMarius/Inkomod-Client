// File: Client/src/components/engineViews/ShopView.jsx
import { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { WORLD } from '../../data/GameWorld';
import { generateItem } from '../../engine/ENGINE_EquipmentCreation';
import { generateHorseMount } from '../../engine/ENGINE_MountCreation';
import { generateAnimalNPC } from '../../engine/ENGINE_AnimalCreation';
import {
	calculateBuyPrice,
	calculateSellPrice,
} from '../../engine/ENGINE_Economy_Shops';
import Button from '../Button';
import ShopItemCard from '../ShopItemCard'; // IMPORT COMPONENTA NOUĂ
import styles from '../../styles/ShopView.module.css';
import ConfirmModal from '../ConfirmModal';

const ShopView = () => {
	const gameState = useGameState((state) => state.gameState);
	const cancelEncounter = useGameState((state) => state.cancelEncounter);

	const [shopMode, setShopMode] = useState('BUY'); // 'BUY', 'SELL', 'REPAIR'
	const [merchantStock, setMerchantStock] = useState([]);
	const [cart, setCart] = useState([]);
	const [isStockGenerated, setIsStockGenerated] = useState(false);
	const doShopTransaction = useGameState((state) => state.doShopTransaction);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [numericSelections, setNumericSelections] = useState({});

	const player = gameState?.player;
	const targetId = gameState?.activeTargetId;
	const tradeTag = gameState?.activeTradeTag;

	// Extrage rata economică dinamică din locația curentă
	const regionalExchangeRate =
		useGameState(
			(state) => state.gameState?.location?.regionalExchangeRate,
		) || 10;

	const getRandomInt = (min, max) =>
		Math.floor(Math.random() * (max - min + 1)) + min;

	// 1. GENERATE MERCHANT STOCK
	useEffect(() => {
		if (!tradeTag || isStockGenerated) return;

		const newStock = [];
		const limits = WORLD.ECONOMY.shopGeneration;
		const ecoValues = WORLD.ECONOMY.baseValues;

		try {
			if (tradeTag === 'Trade_Weapon') {
				const count = getRandomInt(limits.Weapon.min, limits.Weapon.max);
				for (let i = 0; i < count; i++)
					newStock.push(generateItem('Weapon', null, 'Trade'));
			} else if (tradeTag === 'Trade_Armour') {
				const count = getRandomInt(limits.Armour.min, limits.Armour.max);
				for (let i = 0; i < count; i++)
					newStock.push(generateItem('Armour', null, 'Trade'));
			} else if (tradeTag === 'Trade_Shield') {
				const count = getRandomInt(limits.Shield.min, limits.Shield.max);
				for (let i = 0; i < count; i++)
					newStock.push(generateItem('Shield', null, 'Trade'));
			} else if (tradeTag === 'Trade_Mount') {
				const count = getRandomInt(limits.Mount.min, limits.Mount.max);
				for (let i = 0; i < count; i++) newStock.push(generateHorseMount());
			} else if (tradeTag === 'Trade_Animal') {
				const count = getRandomInt(limits.Animal.min, limits.Animal.max);
				for (let i = 0; i < count; i++) {
					if (typeof generateAnimalNPC === 'function') {
						newStock.push(generateAnimalNPC('Domestic'));
					}
				}
			} else if (tradeTag === 'Trade_Food') {
				newStock.push({
					entityId: 'commodity_food_01',
					itemName: 'Travel Rations',
					isNumeric: true,
					inventoryKey: 'food',
					maxQuantity: getRandomInt(limits.Food.min, limits.Food.max),
					economy: {
						baseCoinValue: ecoValues.goldCoinBaseCostOfFood || 1,
					},
				});
			} else if (tradeTag === 'Trade_Potion') {
				newStock.push({
					entityId: 'commodity_potion_01',
					itemName: 'Healing Potion',
					isNumeric: true,
					inventoryKey: 'potions',
					maxQuantity: getRandomInt(limits.Potion.min, limits.Potion.max),
					economy: {
						baseCoinValue:
							ecoValues.goldCoinBaseCostOfHealingPotion || 25,
					},
				});
			} else if (tradeTag === 'Trade_Coin') {
				newStock.push({
					entityId: 'commodity_silver_ingot',
					itemName: 'Silver Ingot',
					isNumeric: true,
					inventoryKey: 'tradeSilver',
					maxQuantity: getRandomInt(
						limits.TradeSilver?.min || 5,
						limits.TradeSilver?.max || 20,
					),
					economy: {
						baseCoinValue: ecoValues.goldCoinBaseCostOfSilver || 10,
					},
				});
				newStock.push({
					entityId: 'commodity_gold_ingot',
					itemName: 'Gold Ingot',
					isNumeric: true,
					inventoryKey: 'tradeGold',
					maxQuantity: getRandomInt(
						limits.TradeGold?.min || 1,
						limits.TradeGold?.max || 5,
					),
					economy: {
						baseCoinValue: ecoValues.goldCoinBaseCostOfGold || 100,
					},
				});
			} else if (tradeTag.startsWith('Repair_')) {
				setShopMode('REPAIR');
			}
		} catch (error) {
			console.error('Shop Generation Error:', error);
		}

		setMerchantStock(newStock);
		setIsStockGenerated(true);
	}, [tradeTag, isStockGenerated]);

	// 2. CONSTRUCT PLAYER INVENTORY
	const getPlayerStockForCurrentShop = () => {
		if (!player || !player.inventory) return [];
		let stock = [];
		const ecoValues = WORLD.ECONOMY.baseValues;

		if (tradeTag === 'Trade_Weapon') {
			stock = player.inventory.itemSlots.filter(
				(i) =>
					i.classification?.itemClass === 'Weapon' ||
					i.classification?.entityClass === 'Weapon' ||
					i.itemCategory === 'Weapon',
			);
		} else if (tradeTag === 'Trade_Armour') {
			stock = player.inventory.itemSlots.filter(
				(i) =>
					i.classification?.itemClass === 'Armour' ||
					i.classification?.entityClass === 'Armour' ||
					i.itemCategory === 'Armour',
			);
		} else if (tradeTag === 'Trade_Shield') {
			stock = player.inventory.itemSlots.filter(
				(i) =>
					i.classification?.itemClass === 'Shield' ||
					i.classification?.entityClass === 'Shield' ||
					i.itemCategory === 'Shield',
			);
		} else if (tradeTag === 'Trade_Mount') {
			stock = player.inventory.animalSlots.filter(
				(i) => i.classification?.entityClass === 'Mount',
			);
		} else if (tradeTag === 'Trade_Animal') {
			stock = player.inventory.animalSlots.filter(
				(i) => i.classification?.entityClass !== 'Mount',
			);
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
		} else if (tradeTag === 'Trade_Potion' && player.inventory.potions > 0) {
			stock.push({
				entityId: 'player_commodity_potion',
				itemName: 'Healing Potion',
				isNumeric: true,
				inventoryKey: 'potions',
				maxQuantity: player.inventory.potions,
				economy: {
					baseCoinValue: ecoValues.goldCoinBaseCostOfHealingPotion || 25,
				},
			});
		} else if (tradeTag === 'Trade_Coin') {
			if (player.inventory.tradeSilver > 0) {
				stock.push({
					entityId: 'player_commodity_silver',
					itemName: 'Silver Ingot',
					isNumeric: true,
					inventoryKey: 'tradeSilver',
					maxQuantity: player.inventory.tradeSilver,
					economy: {
						baseCoinValue: ecoValues.goldCoinBaseCostOfSilver || 10,
					},
				});
			}
			if (player.inventory.tradeGold > 0) {
				stock.push({
					entityId: 'player_commodity_gold',
					itemName: 'Gold Ingot',
					isNumeric: true,
					inventoryKey: 'tradeGold',
					maxQuantity: player.inventory.tradeGold,
					economy: {
						baseCoinValue: ecoValues.goldCoinBaseCostOfGold || 100,
					},
				});
			}
		}
		return stock;
	};

	const playerStock = getPlayerStockForCurrentShop();

	// 3. CART FUNCTIONS
	const addToCart = (item, quantity = 1) => {
		const existingItem = cart.find((c) => c.entityId === item.entityId);

		if (item.isNumeric) {
			if (existingItem) {
				setCart(
					cart.map((c) =>
						c.entityId === item.entityId
							? { ...c, cartQuantity: quantity }
							: c,
					),
				);
			} else {
				setCart([...cart, { ...item, cartQuantity: quantity }]);
			}
		} else {
			if (!existingItem) {
				setCart([...cart, { ...item, cartQuantity: 1 }]);
			}
		}
	};

	const removeFromCart = (itemId) => {
		setCart(cart.filter((item) => item.entityId !== itemId));
	};

	const handleNumericSlider = (itemId, value) => {
		setNumericSelections({ ...numericSelections, [itemId]: parseInt(value) });
	};

	// 4. PRICING SYSTEM
	const getItemPrice = (item) => {
		const baseCost =
			item.economy?.baseCoinValue || item.goldCoinBaseCost || 0;

		if (shopMode === 'BUY') {
			return calculateBuyPrice(baseCost, regionalExchangeRate);
		} else if (shopMode === 'SELL') {
			const currentDur = item.state?.currentDurability || 100;
			const maxDur = item.state?.maxDurability || 100;
			return calculateSellPrice(
				baseCost,
				regionalExchangeRate,
				currentDur,
				maxDur,
			);
		}
		return 0;
	};

	const calculateCartTotal = () => {
		return cart.reduce((sum, item) => {
			const unitPrice = getItemPrice(item);
			return sum + unitPrice * item.cartQuantity;
		}, 0);
	};

	const targetNpc = gameState?.activeEntities?.find(
		(npc) => npc.entityId === targetId,
	);
	const merchantName = targetNpc ? targetNpc.entityName : 'Merchant';

	const handleConfirmTransaction = () => {
		const success = doShopTransaction(cart, shopMode, regionalExchangeRate);

		if (success) {
			setMerchantStock((prevStock) => {
				let newStock = [...prevStock];

				cart.forEach((cartItem) => {
					if (cartItem.isNumeric) {
						// REPARAȚIE: Căutăm după inventoryKey (ex: 'potions'), nu după entityId
						const stockIndex = newStock.findIndex(
							(s) => s.inventoryKey === cartItem.inventoryKey,
						);

						if (shopMode === 'BUY') {
							if (stockIndex !== -1) {
								newStock[stockIndex] = {
									...newStock[stockIndex],
									maxQuantity:
										newStock[stockIndex].maxQuantity -
										cartItem.cartQuantity,
								};
							}
						} else if (shopMode === 'SELL') {
							if (stockIndex !== -1) {
								// Dacă comerciantul are deja acest tip de item, îi creștem stocul
								newStock[stockIndex] = {
									...newStock[stockIndex],
									maxQuantity:
										newStock[stockIndex].maxQuantity +
										cartItem.cartQuantity,
								};
							} else {
								// Dacă vinzi ceva ce el nu are (dar magazinul permite tipul respectiv)
								// Curățăm ID-ul de "player_" înainte să-l adăugăm la comerciant
								const merchantVersion = {
									...cartItem,
									entityId: cartItem.entityId.replace('player_', ''),
									maxQuantity: cartItem.cartQuantity,
								};
								newStock.push(merchantVersion);
							}
						}
					}
				});

				// Gestionare Iteme Fizice (Unice)
				if (shopMode === 'BUY') {
					const purchasedPhysicalIds = cart
						.filter((i) => !i.isNumeric)
						.map((i) => i.entityId);

					newStock = newStock.filter(
						(i) => !purchasedPhysicalIds.includes(i.entityId),
					);

					// Eliminăm din listă itemele numerice care au ajuns la stoc 0
					newStock = newStock.filter(
						(i) => !i.isNumeric || i.maxQuantity > 0,
					);
				} else if (shopMode === 'SELL') {
					const soldPhysicalItems = cart.filter((i) => !i.isNumeric);
					newStock = [...newStock, ...soldPhysicalItems];
				}

				return newStock;
			});

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
						: 'You have no matching items to sell.'}
				</div>
			);
		}

		return activeItems.map((item, index) => {
			const price = getItemPrice(item);
			const inCart = cart.find((c) => c.entityId === item.entityId);
			const selectedQty = numericSelections[item.entityId] || 1;

			// Randează noul component curat
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

	return (
		<div className={styles.shopContainer}>
			<div className={styles.fixedTop}>
				<h2 className={styles.title}>{merchantName}'s Exchange</h2>

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
					{tradeTag?.startsWith('Repair_') && (
						<button
							className={`${styles.modeBtn} ${shopMode === 'REPAIR' ? styles.modeBtnActive : styles.modeBtnInactive}`}
							onClick={() => {
								setShopMode('REPAIR');
								setCart([]);
							}}
						>
							REPAIR
						</button>
					)}
				</div>

				<div className={styles.checkoutBox}>
					<div className={styles.checkoutTotal}>
						<span className={styles.checkoutLabel}>Estimated Total:</span>
						<span className={styles.checkoutValue}>
							{calculateCartTotal()} Coins
						</span>
					</div>
					<Button
						variant='primary'
						className={styles.confirmBtn}
						disabled={cart.length === 0}
						onClick={() => setIsConfirmModalOpen(true)}
					>
						Confirm {shopMode === 'BUY' ? 'Purchase' : 'Sale'}
					</Button>
				</div>
			</div>

			<div className={styles.scrollableMiddle}>
				<div className={styles.inventorySection}>
					<h3 className={styles.sectionHeader}>
						{shopMode === 'BUY' ? "Merchant's Stock" : 'Your Inventory'}
					</h3>
					<div className={styles.inventoryList}>
						{renderActiveInventory()}
					</div>
				</div>

				{cart.length > 0 && (
					<div className={styles.cartSection}>
						<div className={styles.cartContainer}>
							<h3 className={styles.cartTitle}>Items in Cart</h3>
							<div className={styles.cartList}>
								{cart.map((item) => (
									<div key={item.entityId} className={styles.cartItem}>
										<span className={styles.cartItemName}>
											{item.cartQuantity > 1
												? `${item.cartQuantity}x `
												: ''}
											{item.itemName || item.entityName}
										</span>
										<div className={styles.cartItemMeta}>
											<span className={styles.cartItemPrice}>
												{getItemPrice(item) * item.cartQuantity} C
											</span>
											<button
												onClick={() =>
													removeFromCart(item.entityId)
												}
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

			<div className={styles.fixedBottom}>
				<div className={styles.inventorySection}>
					<Button
						onClick={cancelEncounter}
						variant='secondary'
						className={styles.leaveBtn}
					>
						Leave Shop
					</Button>
				</div>
			</div>

			<ConfirmModal
				isOpen={isConfirmModalOpen}
				title={`Confirm ${shopMode === 'BUY' ? 'Purchase' : 'Sale'}`}
				message={`Are you sure you want to proceed? Total ${shopMode === 'BUY' ? 'Cost' : 'Revenue'}: ${calculateCartTotal()} Coins.`}
				confirmText='Accept'
				cancelText='Cancel'
				onConfirm={handleConfirmTransaction}
				onCancel={() => setIsConfirmModalOpen(false)}
			/>
		</div>
	);
};

export default ShopView;
