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
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';

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
	const doUnequipItem = useGameState((state) => state.doUnequipItem);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [numericSelections, setNumericSelections] = useState({});
	const [isEquipPanelOpen, setIsEquipPanelOpen] = useState(false);

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
		// Retrieve accurate economy level from the database using the current world ID
		const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === gameState?.location?.currentWorldId);
		const ecoLevel = currentNode?.zoneEconomyLevel || 1;

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
	// NEW: Calculate the NPC's rank (defaults to 5 if it's a generic unranked blacksmith)
	const npcRank = targetNpc?.classification?.entityRank || targetNpc?.classification?.poiRank || 5;
	const merchantName = targetNpc ? targetNpc.entityName : isRepairShop ? 'Blacksmith' : 'Merchant';
	const shopTitle = `${merchantName}'s ${isRepairShop ? 'Workshop' : 'Exchange'}`;

	const handleConfirmTransaction = () => {
		const success = doShopTransaction(cart, shopMode, regionalExchangeRate, npcRank);

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

	const renderEquippedItems = () => {
		if (!player || !player.equipment) return null;

		const eq = player.equipment;
		const equippedList = [
			{ label: 'Weapon', item: eq.weaponItem, key: 'Weapon' },
			{ label: 'Armour', item: eq.armourItem, key: 'Armour' },
			{ label: 'Shield', item: eq.shieldItem, key: 'Shield' },
			{ label: 'Helmet', item: eq.helmetItem, key: 'Helmet' },
			{ label: 'Mount', item: eq.mountItem, key: 'Mount' }, // NEW: Added Mount
		].filter((e) => e.item);

		if (equippedList.length === 0) return null;

		return (
			<div style={{ marginBottom: '20px', background: '#111', border: '1px solid #333', borderRadius: '4px' }}>
				{/* Accordion Header */}
				<div
					onClick={() => setIsEquipPanelOpen(!isEquipPanelOpen)}
					style={{
						padding: '10px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						cursor: 'pointer',
						background: '#1a1a1a',
						borderBottom: isEquipPanelOpen ? '1px solid #333' : 'none',
						borderRadius: isEquipPanelOpen ? '4px 4px 0 0' : '4px',
					}}
				>
					<h3 style={{ fontSize: '1.1rem', color: '#aaa', margin: 0, fontFamily: 'VT323' }}>Equipped Gear (Unequip to Sell/Repair)</h3>
					<span style={{ color: 'var(--gold-primary)', fontSize: '0.9rem' }}>{isEquipPanelOpen ? '▲' : '▼'}</span>
				</div>

				{/* Collapsible Content */}
				{isEquipPanelOpen && (
					<div style={{ padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
						{equippedList.map((eqObj) => {
							// Extract rank dynamically from either an item or an entity (like a mount)
							const itemRank = eqObj.item.classification?.itemTier || eqObj.item.classification?.entityRank || '-';

							return (
								<div
									key={eqObj.key}
									style={{
										display: 'flex',
										alignItems: 'center',
										background: '#000',
										padding: '6px 10px',
										border: '1px solid #222',
										borderRadius: '4px',
										gap: '10px',
									}}
								>
									<span style={{ color: '#888', fontSize: '0.9rem', fontFamily: 'VT323', width: '45px' }}>{eqObj.label}:</span>

									{/* Rank Circle Icon */}
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: '22px',
											height: '22px',
											borderRadius: '50%',
											backgroundColor: '#111',
											color: 'var(--gold-primary)',
											border: '1px solid var(--gold-primary)',
											fontSize: '0.9rem',
											fontWeight: 'bold',
											fontFamily: 'VT323',
											flexShrink: 0,
											boxShadow: '0 0 4px rgba(180, 155, 27, 0.2)',
										}}
									>
										{itemRank}
									</div>

									<span
										style={{
											flex: 1,
											color: '#ddd',
											fontSize: '0.9rem',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											fontFamily: 'VT323',
										}}
									>
										{eqObj.item.itemName || eqObj.item.entityName}
									</span>

									<button
										onClick={() => doUnequipItem(eqObj.key)}
										style={{
											background: '#2a0000',
											color: '#ffaaaa',
											border: '1px solid #ff4444',
											padding: '2px 8px',
											cursor: 'pointer',
											borderRadius: '3px',
											fontSize: '0.8rem',
											fontFamily: 'VT323',
										}}
									>
										Unequip
									</button>
								</div>
							);
						})}
					</div>
				)}
			</div>
		);
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

			// NEW: Rank constraint logic
			const itemTier = item.classification?.itemTier || 1;
			const cannotRepair = shopMode === 'REPAIR' && itemTier > npcRank;

			return (
				<div
					key={item.entityId || index}
					style={{ position: 'relative' }}
				>
					<ShopItemCard
						item={item}
						shopMode={shopMode}
						price={price}
						inCart={!!inCart}
						selectedQty={selectedQty}
						onAddToCart={cannotRepair ? () => alert(`This Rank ${itemTier} item is too advanced for a Rank ${npcRank} Blacksmith to repair.`) : addToCart}
						onRemoveFromCart={removeFromCart}
						onSliderChange={handleNumericSlider}
					/>

					{/* Visual Overlay for items too advanced to repair */}
					{cannotRepair && (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								backgroundColor: 'rgba(0,0,0,0.65)',
								zIndex: 10,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								pointerEvents: 'none',
								borderRadius: '4px',
							}}
						>
							<span
								style={{
									color: '#ff4444',
									background: '#111',
									padding: '4px 10px',
									border: '1px solid #ff4444',
									fontWeight: 'bold',
									fontFamily: 'VT323',
									fontSize: '1.2rem',
								}}
							>
								Requires Rank {itemTier} Blacksmith
							</span>
						</div>
					)}
				</div>
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
				{/* NEW: Inject the Equipment management panel here */}
				{renderEquippedItems()}
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
