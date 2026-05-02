// File: Client/src/components/engineViews/ShopView.jsx
import { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { WORLD } from '../../data/GameWorld';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { generateItem } from '../../engine/ENGINE_EquipmentCreation';
import { generateHorseMount } from '../../engine/ENGINE_MountCreation';
import { generateAnimalNPC } from '../../engine/ENGINE_AnimalCreation';
import { generateLootItem } from '../../engine/ENGINE_LootCreation'; // NOU IMPORTAT
import { calculateDerivedStats } from '../../engine/ENGINE_Inventory';
import { calculateRankFromEconomy } from '../../utils/EconomyUtils';
import {
	calculateBuyPrice,
	calculateSellPrice,
	calculateRepairCost,
} from '../../engine/ENGINE_Economy_Shops';

import ConfirmModal from '../ConfirmModal';
import ShopHeaderInfo from '../shop/ShopHeaderInfo';
import ShopEquippedGear from '../shop/ShopEquippedGear';
import ShopInventoryGrid from '../shop/ShopInventoryGrid';
import ShopCartList from '../shop/ShopCartList';

import styles from '../../styles/ShopView.module.css';

const ShopView = () => {
	const gameState = useGameState((state) => state.gameState);
	const doShopTransaction = useGameState((state) => state.doShopTransaction);
	const doUnequipItem = useGameState((state) => state.doUnequipItem);

	const player = gameState?.player;
	const tradeTag = gameState?.activeTradeTag;
	const targetId = gameState?.activeTargetId;
	const isRepairShop = tradeTag === 'Repair_Equipment';
	const regionalExchangeRate = gameState?.location?.regionalExchangeRate || 10;

	// MODIFICAT: Acum Loot Shop-ul se deschide normal pe BUY
	const initialMode = isRepairShop ? 'REPAIR' : 'BUY';
	const [shopMode, setShopMode] = useState(initialMode);

	const [merchantStock, setMerchantStock] = useState([]);
	const [cart, setCart] = useState([]);
	const [isStockGenerated, setIsStockGenerated] = useState(false);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [numericSelections, setNumericSelections] = useState({});
	const [isEquipPanelOpen, setIsEquipPanelOpen] = useState(false);

	const playerHonor = player?.progression?.honor || 0;
	const playerCoins = player?.inventory?.silverCoins || 0;
	const { totalCha } = player
		? calculateDerivedStats(player)
		: { totalCha: 1 };

	// --- LOGICA NOUĂ PENTRU BONUS (Plafonare 25% și Înjumătățire Bancă) ---
	const honorFactor = WORLD.ECONOMY.tradeMultipliers.tradeHonorFactor || 0.002;
	const baseBonusDelta = playerHonor * honorFactor + totalCha / 1000;

	// Plafonăm la +/- 25%
	const clampedBonusDelta = Math.max(-0.25, Math.min(0.25, baseBonusDelta));

	// Înjumătățim dacă e Bancă (max 12.5%)
	const bonusDelta =
		tradeTag === 'Trade_Coin' ? clampedBonusDelta / 2 : clampedBonusDelta;
	const absBonusPct = Number((Math.abs(bonusDelta) * 100).toFixed(1)); // Afișează o zecimală (ex: 12.5%)

	const getRandomInt = (min, max) =>
		Math.floor(Math.random() * (max - min + 1)) + min;

	const limits = WORLD.PLAYER.inventoryLimits;
	const currentPotions = player?.inventory?.healingPotions || 0;
	const currentItemsCount = player?.inventory?.itemSlots?.length || 0;
	const currentAnimalsCount = player?.inventory?.animalSlots?.length || 0;

	let cartPotions = 0;
	let cartItemsCount = 0;
	let cartAnimalsCount = 0;

	if (shopMode === 'BUY') {
		cart.forEach((item) => {
			if (item.inventoryKey === 'healingPotions') {
				cartPotions += item.cartQuantity;
			} else if (!item.isNumeric) {
				const itemClass =
					item.classification?.itemClass ||
					item.classification?.entityClass;
				if (
					['Weapon', 'Armor', 'Shield', 'Helmet'].includes(itemClass) ||
					item.classification?.itemCategory === 'Equipment'
				) {
					cartItemsCount += 1;
				} else if (
					item.classification?.entityCategory === 'Animal' ||
					itemClass === 'Mount'
				) {
					cartAnimalsCount += 1;
				}
			}
		});
	}

	const projectedPotions =
		shopMode === 'BUY' ? currentPotions + cartPotions : currentPotions;
	const projectedItems =
		shopMode === 'BUY'
			? currentItemsCount + cartItemsCount
			: currentItemsCount;
	const projectedAnimals =
		shopMode === 'BUY'
			? currentAnimalsCount + cartAnimalsCount
			: currentAnimalsCount;

	const isPotionOverlimit = projectedPotions > limits.maxHealingPotions;
	const isItemsOverlimit = projectedItems > limits.itemSlots;
	const isAnimalsOverlimit = projectedAnimals > limits.animalSlots;

	const isInventoryFull =
		isPotionOverlimit || isItemsOverlimit || isAnimalsOverlimit;

	let capacityContext = null;
	if (tradeTag === 'Trade_Potion')
		capacityContext = {
			type: 'Potions',
			current: projectedPotions,
			max: limits.maxHealingPotions,
			overlimit: isPotionOverlimit,
		};
	else if (
		['Trade_Weapon', 'Trade_Armor', 'Trade_Shield', 'Trade_Helmet'].includes(
			tradeTag,
		)
	)
		capacityContext = {
			type: 'Backpack',
			current: projectedItems,
			max: limits.itemSlots,
			overlimit: isItemsOverlimit,
		};
	else if (['Trade_Mount', 'Trade_Animal'].includes(tradeTag))
		capacityContext = {
			type: 'Caravan',
			current: projectedAnimals,
			max: limits.animalSlots,
			overlimit: isAnimalsOverlimit,
		};

	useEffect(() => {
		if (!tradeTag || isStockGenerated || isRepairShop) return;

		const newStock = [];
		const shopLimits = WORLD.ECONOMY.shopGeneration;
		const ecoValues = WORLD.ECONOMY.baseValues;

		const currentNode = DB_LOCATIONS_ZONES.find(
			(node) => node.worldId === gameState?.location?.currentWorldId,
		);
		const ecoLevel = currentNode?.zoneEconomyLevel || 1;

		try {
			const activeSeason = gameState?.time?.activeSeason || 'spring';
			const seasonFoodPriceMult =
				WORLD.TIME.seasons[activeSeason]?.foodPriceMult || 1;
			if (tradeTag === 'Trade_Weapon') {
				const count = getRandomInt(
					shopLimits.Weapon.min,
					shopLimits.Weapon.max,
				);
				for (let i = 0; i < count; i++)
					newStock.push(
						generateItem(
							'Weapon',
							calculateRankFromEconomy(ecoLevel),
							'Trade',
						),
					);
			} else if (tradeTag === 'Trade_Armor') {
				const count = getRandomInt(
					shopLimits.Armor.min,
					shopLimits.Armor.max,
				);
				for (let i = 0; i < count; i++)
					newStock.push(
						generateItem(
							'Armor',
							calculateRankFromEconomy(ecoLevel),
							'Trade',
						),
					);
			} else if (tradeTag === 'Trade_Shield') {
				const count = getRandomInt(
					shopLimits.Shield.min,
					shopLimits.Shield.max,
				);
				for (let i = 0; i < count; i++)
					newStock.push(
						generateItem(
							'Shield',
							calculateRankFromEconomy(ecoLevel),
							'Trade',
						),
					);
			} else if (tradeTag === 'Trade_Helmet') {
				const minLimit = shopLimits.Helmet?.min || shopLimits.Armor.min;
				const maxLimit = shopLimits.Helmet?.max || shopLimits.Armor.max;
				const count = getRandomInt(minLimit, maxLimit);
				for (let i = 0; i < count; i++)
					newStock.push(
						generateItem(
							'Helmet',
							calculateRankFromEconomy(ecoLevel),
							'Trade',
						),
					);
			} else if (tradeTag === 'Trade_Mount') {
				const count = getRandomInt(
					shopLimits.Mount.min,
					shopLimits.Mount.max,
				);
				for (let i = 0; i < count; i++)
					newStock.push(
						generateHorseMount(calculateRankFromEconomy(ecoLevel)),
					);
			} else if (tradeTag === 'Trade_Animal') {
				const count = getRandomInt(
					shopLimits.Animal.min,
					shopLimits.Animal.max,
				);
				for (let i = 0; i < count; i++) {
					if (typeof generateAnimalNPC === 'function')
						newStock.push(
							generateAnimalNPC(
								'Domestic',
								null,
								calculateRankFromEconomy(ecoLevel),
							),
						);
				}
			} else if (tradeTag === 'Trade_Loot') {
				// --- MODIFICAT: Magazinul generează Loot pentru jucător ---
				const count = getRandomInt(3, 8); // Poți ajusta limitele din config
				for (let i = 0; i < count; i++) {
					const newLoot = generateLootItem(
						null,
						calculateRankFromEconomy(ecoLevel),
					);
					if (newLoot) newStock.push(newLoot);
				}
			} else if (tradeTag === 'Trade_Food') {
				const baseFoodPrice =
					(ecoValues.goldCoinBaseCostOfFood || 1) * seasonFoodPriceMult;

				newStock.push({
					entityId: 'commodity_food_01',
					itemName: 'Travel Rations',
					isNumeric: true,
					inventoryKey: 'food',
					maxQuantity: getRandomInt(
						shopLimits.Food.min,
						shopLimits.Food.max,
					),
					economy: { baseCoinValue: baseFoodPrice },
				});
			} else if (tradeTag === 'Trade_Potion') {
				newStock.push({
					entityId: 'commodity_potion_01',
					itemName: 'Healing Potion',
					isNumeric: true,
					inventoryKey: 'healingPotions',
					maxQuantity: getRandomInt(
						shopLimits.Potion.min,
						shopLimits.Potion.max,
					),
					economy: {
						baseCoinValue:
							ecoValues.goldCoinBaseCostOfHealingPotion || 25,
					},
				});
			} else if (tradeTag === 'Trade_Coin') {
				if (shopLimits.TradeSilver) {
					newStock.push({
						entityId: 'commodity_silver_ingot',
						itemName: 'Silver Ingot',
						isNumeric: true,
						inventoryKey: 'tradeSilver',
						maxQuantity: getRandomInt(
							shopLimits.TradeSilver.min || 5,
							shopLimits.TradeSilver.max || 20,
						),
						economy: {
							baseCoinValue: ecoValues.goldCoinBaseCostOfSilver || 10,
						},
					});
				}
				if (shopLimits.TradeGold) {
					newStock.push({
						entityId: 'commodity_gold_ingot',
						itemName: 'Gold Ingot',
						isNumeric: true,
						inventoryKey: 'tradeGold',
						maxQuantity: getRandomInt(
							shopLimits.TradeGold.min || 1,
							shopLimits.TradeGold.max || 5,
						),
						economy: {
							baseCoinValue: ecoValues.goldCoinBaseCostOfGold || 100,
						},
					});
				}
			}
		} catch (error) {
			console.error('Shop Generation Error:', error);
		}

		setMerchantStock(newStock);
		setIsStockGenerated(true);
	}, [
		tradeTag,
		isStockGenerated,
		isRepairShop,
		gameState?.location?.regionalEconomyLevel,
	]);

	const getPlayerStockForCurrentShop = () => {
		if (!player || !player.inventory) return [];
		let stock = [];
		const ecoValues = WORLD.ECONOMY.baseValues;

		const activeSeason = gameState?.time?.activeSeason || 'spring';
		const seasonFoodPriceMult =
			WORLD.TIME.seasons[activeSeason]?.foodPriceMult || 1;

		if (isRepairShop) {
			stock = player.inventory.itemSlots.filter(
				(i) => i.state && i.state.currentDurability < i.state.maxDurability,
			);
		} else if (tradeTag === 'Trade_Weapon') {
			stock = player.inventory.itemSlots.filter(
				(i) =>
					i.classification?.itemClass === 'Weapon' ||
					i.itemCategory === 'Weapon',
			);
		} else if (tradeTag === 'Trade_Armor') {
			stock = player.inventory.itemSlots.filter(
				(i) =>
					i.classification?.itemClass === 'Armor' ||
					i.itemCategory === 'Armor',
			);
		} else if (tradeTag === 'Trade_Shield') {
			stock = player.inventory.itemSlots.filter(
				(i) =>
					i.classification?.itemClass === 'Shield' ||
					i.itemCategory === 'Shield',
			);
		} else if (tradeTag === 'Trade_Helmet') {
			stock = player.inventory.itemSlots.filter(
				(i) =>
					i.classification?.itemClass === 'Helmet' ||
					i.itemCategory === 'Helmet',
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
			const baseFoodPrice =
				(ecoValues.goldCoinBaseCostOfFood || 1) * seasonFoodPriceMult;

			stock.push({
				entityId: 'player_commodity_food',
				itemName: 'Travel Rations',
				isNumeric: true,
				inventoryKey: 'food',
				maxQuantity: player.inventory.food,
				economy: { baseCoinValue: baseFoodPrice },
			});
		} else if (
			tradeTag === 'Trade_Potion' &&
			player.inventory.healingPotions > 0
		) {
			stock.push({
				entityId: 'player_commodity_potion',
				itemName: 'Healing Potion',
				isNumeric: true,
				inventoryKey: 'healingPotions',
				maxQuantity: player.inventory.healingPotions,
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

	const addToCart = (item, quantity = 1) => {
		const existingItem = cart.find((c) => c.entityId === item.entityId);
		if (item.isNumeric) {
			if (existingItem)
				setCart(
					cart.map((c) =>
						c.entityId === item.entityId
							? { ...c, cartQuantity: quantity }
							: c,
					),
				);
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

	const getItemPrice = (item) => {
		const baseCost =
			item.economy?.baseCoinValue || item.goldCoinBaseCost || 0;
		const currentDur = item.state?.currentDurability || 100;
		const maxDur = item.state?.maxDurability || 100;

		const isIngot =
			item.inventoryKey === 'tradeGold' ||
			item.inventoryKey === 'tradeSilver';

		// MODIFICAT: Pasăm isIngot și către BUY!
		if (shopMode === 'BUY')
			return calculateBuyPrice(
				baseCost,
				regionalExchangeRate,
				playerHonor,
				totalCha,
				isIngot,
			);
		if (shopMode === 'SELL')
			return calculateSellPrice(
				baseCost,
				regionalExchangeRate,
				currentDur,
				maxDur,
				playerHonor,
				totalCha,
				isIngot,
			);
		if (shopMode === 'REPAIR')
			return calculateRepairCost(
				baseCost,
				regionalExchangeRate,
				currentDur,
				maxDur,
				playerHonor,
				totalCha,
			);
		return 0;
	};

	const getRawItemPrice = (item) => {
		const baseCost =
			item.economy?.baseCoinValue || item.goldCoinBaseCost || 0;
		const currentDur = item.state?.currentDurability || 100;
		const maxDur = item.state?.maxDurability || 100;

		const isIngot =
			item.inventoryKey === 'tradeGold' ||
			item.inventoryKey === 'tradeSilver';

		if (shopMode === 'BUY')
			return calculateBuyPrice(
				baseCost,
				regionalExchangeRate,
				0,
				0,
				isIngot,
			);
		if (shopMode === 'SELL')
			return calculateSellPrice(
				baseCost,
				regionalExchangeRate,
				currentDur,
				maxDur,
				0,
				0,
				isIngot,
			);
		if (shopMode === 'REPAIR')
			return calculateRepairCost(
				baseCost,
				regionalExchangeRate,
				currentDur,
				maxDur,
				0,
				0,
			);
		return 0;
	};

	const calculateCartTotal = () =>
		cart.reduce(
			(sum, item) => sum + getItemPrice(item) * item.cartQuantity,
			0,
		);
	const calculateRawCartTotal = () =>
		cart.reduce(
			(sum, item) => sum + getRawItemPrice(item) * item.cartQuantity,
			0,
		);

	const actualTotal = calculateCartTotal();
	const rawTotal = calculateRawCartTotal();
	const diffCoins = Math.abs(rawTotal - actualTotal);

	const isInsufficientFunds =
		(shopMode === 'BUY' || shopMode === 'REPAIR') &&
		actualTotal > playerCoins;
	const isZeroTotal =
		(shopMode === 'BUY' || shopMode === 'REPAIR') && actualTotal === 0;

	const isConfirmDisabled =
		cart.length === 0 ||
		isInsufficientFunds ||
		isZeroTotal ||
		(shopMode === 'BUY' && isInventoryFull);

	const targetNpc = gameState?.activeEntities?.find(
		(npc) => npc.entityId === targetId,
	);
	const npcRank =
		targetNpc?.classification?.entityRank ||
		targetNpc?.classification?.poiRank ||
		5;
	const merchantName = targetNpc
		? targetNpc.entityName
		: isRepairShop
			? 'Blacksmith'
			: 'Merchant';
	const shopTitle = `${merchantName}'s ${isRepairShop ? 'Workshop' : 'Exchange'}`;

	const handleConfirmTransaction = () => {
		if (shopMode === 'BUY' && isInventoryFull) {
			alert('Transaction blocked: Inventory Limits exceeded.');
			return;
		}

		const success = doShopTransaction(
			cart,
			shopMode,
			regionalExchangeRate,
			npcRank,
		);

		if (success) {
			if (shopMode !== 'REPAIR') {
				setMerchantStock((prevStock) => {
					let newStock = [...prevStock];
					cart.forEach((cartItem) => {
						if (cartItem.isNumeric) {
							const stockIndex = newStock.findIndex(
								(s) => s.inventoryKey === cartItem.inventoryKey,
							);
							if (shopMode === 'BUY' && stockIndex !== -1) {
								newStock[stockIndex] = {
									...newStock[stockIndex],
									maxQuantity:
										newStock[stockIndex].maxQuantity -
										cartItem.cartQuantity,
								};
							} else if (shopMode === 'SELL') {
								if (stockIndex !== -1) {
									newStock[stockIndex] = {
										...newStock[stockIndex],
										maxQuantity:
											newStock[stockIndex].maxQuantity +
											cartItem.cartQuantity,
									};
								} else {
									newStock.push({
										...cartItem,
										entityId: cartItem.entityId.replace(
											'player_',
											'',
										),
										maxQuantity: cartItem.cartQuantity,
									});
								}
							}
						}
					});

					if (shopMode === 'BUY') {
						const purchasedPhysicalIds = cart
							.filter((i) => !i.isNumeric)
							.map((i) => i.entityId);
						newStock = newStock.filter(
							(i) => !purchasedPhysicalIds.includes(i.entityId),
						);
						newStock = newStock.filter(
							(i) => !i.isNumeric || i.maxQuantity > 0,
						);
					} else if (shopMode === 'SELL') {
						const soldPhysicalItems = cart.filter((i) => !i.isNumeric);
						newStock = [...newStock, ...soldPhysicalItems];
					}
					return newStock;
				});
			}

			setCart([]);
			setNumericSelections({});
		}
		setIsConfirmModalOpen(false);
	};

	const activeItems = shopMode === 'BUY' ? merchantStock : playerStock;

	const activeSeason = gameState?.time?.activeSeason || 'spring';
	const seasonFoodPriceMult =
		WORLD.TIME.seasons[activeSeason]?.foodPriceMult || 1;

	const getSeasonalClass = (mult) => {
		if (mult < 0.9) return styles.seasonalGreen;
		if (mult >= 0.9 && mult <= 1.1) return styles.seasonalBlue;
		if (mult > 1.1 && mult <= 1.5) return styles.seasonalYellow;
		return styles.seasonalRed;
	};

	const priceChangePct = Math.round(seasonFoodPriceMult * 100 - 100);
	const isFoodShop = tradeTag === 'Trade_Food';

	return (
		<div className={styles.shopContainer}>
			<ShopHeaderInfo
				shopTitle={shopTitle}
				shopMode={shopMode}
				isRepairShop={isRepairShop}
				bonusDelta={bonusDelta}
				absBonusPct={absBonusPct}
				actualTotal={actualTotal}
				rawTotal={rawTotal}
				playerCoins={playerCoins}
				diffCoins={diffCoins}
				isInsufficientFunds={isInsufficientFunds}
				isZeroTotal={isZeroTotal}
				isConfirmDisabled={isConfirmDisabled}
				cartLength={cart.length}
				capacityContext={capacityContext}
				tradeTag={tradeTag}
				setShopMode={setShopMode}
				setCart={setCart}
				setIsConfirmModalOpen={setIsConfirmModalOpen}
			/>

			{isFoodShop && (
				<div
					className={`${styles.seasonalBanner} ${getSeasonalClass(seasonFoodPriceMult)}`}
				>
					<span className={styles.seasonLabel}>
						Season: {activeSeason.toUpperCase()}
					</span>
					<p className={styles.seasonMessage}>
						{priceChangePct > 0
							? `Food prices have risen by ${priceChangePct}% due to weather conditions.`
							: priceChangePct < 0
								? `A bountiful harvest! Prices dropped by ${Math.abs(priceChangePct)}%.`
								: `Prices are stable this season.`}
					</p>
				</div>
			)}

			<div className={styles.scrollableMiddle}>
				<ShopEquippedGear
					player={player}
					isEquipPanelOpen={isEquipPanelOpen}
					setIsEquipPanelOpen={setIsEquipPanelOpen}
					doUnequipItem={doUnequipItem}
				/>

				<ShopInventoryGrid
					items={activeItems}
					shopMode={shopMode}
					cart={cart}
					numericSelections={numericSelections}
					npcRank={npcRank}
					getItemPrice={getItemPrice}
					onAddToCart={addToCart}
					onRemoveFromCart={removeFromCart}
					onSliderChange={handleNumericSlider}
				/>

				<ShopCartList
					cart={cart}
					getItemPrice={getItemPrice}
					removeFromCart={removeFromCart}
				/>
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
