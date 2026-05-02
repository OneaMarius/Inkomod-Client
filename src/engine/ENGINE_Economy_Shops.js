// File: src/engine/ENGINE_Economy_Shops.js

import { WORLD } from '../data/GameWorld.js';
import { calculateDerivedStats } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// PRICING CALCULATORS
// ------------------------------------------------------------------------

const convertGoldToSilver = (baseGoldValue, regionalExchangeRate) => {
	return Math.floor(baseGoldValue * regionalExchangeRate);
};

// File: src/engine/ENGINE_Economy_Shops.js

export const calculateBuyPrice = (baseCost, rer, playerHonor, playerCha, isIngot = false) => {
    const { baseTradeBuyPct, tradeHonorFactor } = WORLD.ECONOMY.tradeMultipliers;
    
    // 1. Calculăm bonusul de reputație (Plafonat la 25%)
    let repModifier = (playerHonor * (tradeHonorFactor || 0.002)) + (playerCha / 1000);
    repModifier = Math.max(-0.25, Math.min(0.25, repModifier));
    
    // 2. Înjumătățim bonusul pentru lingouri (Bancă)
    if (isIngot) {
        repModifier = repModifier / 2;
    }

    // 3. Multiplicatorul final (100% - bonus)
    const dynamicMultiplier = baseTradeBuyPct - repModifier;
    
    // 4. Calculul prețului: (Cost de bază * RER) * Multiplicator
    let finalPrice = Math.floor(baseCost * rer * dynamicMultiplier);
    
    return Math.max(1, finalPrice);
};

export const calculateSellPrice = (baseCost, rer, curDur, maxDur, playerHonor, playerCha, isIngot = false) => {
    const { baseTradeSellPct, ingotTradeSellPct, tradeHonorFactor } = WORLD.ECONOMY.tradeMultipliers;
    
    // 1. Calculăm bonusul de reputație (Plafonat la 25%)
    let repModifier = (playerHonor * (tradeHonorFactor || 0.002)) + (playerCha / 1000);
    repModifier = Math.max(-0.25, Math.min(0.25, repModifier));
    
    // 2. Înjumătățim bonusul pentru lingouri
    if (isIngot) {
        repModifier = repModifier / 2;
    }

    // 3. Rata de bază (75% lingouri, 50% restul) + Bonus
    const basePct = isIngot ? ingotTradeSellPct : baseTradeSellPct;
    const dynamicMultiplier = basePct + repModifier;
    
    // 4. Calculul prețului: (Cost de bază * RER) * Multiplicator
    let baseEnginePrice = (baseCost * rer) * dynamicMultiplier;
    
    // 5. Aplicăm penalitatea de durabilitate (doar pentru echipamente)
    if (!isIngot) {
        const durabilityRatio = Math.max(0, curDur / maxDur);
        baseEnginePrice = baseEnginePrice * durabilityRatio;
    }

    return Math.max(1, Math.floor(baseEnginePrice));
};

export const calculateRepairCost = (
	baseGoldValue,
	regionalExchangeRate,
	currentDurability,
	maxDurability,
	playerHonor = 0,
	playerCha = 1,
) => {
	if (currentDurability >= maxDurability) return 0;

	const regionalSilverValue = convertGoldToSilver(
		baseGoldValue,
		regionalExchangeRate,
	);
	const damagePercentage = 1 - currentDurability / maxDurability;

	const { baseTradeRepairPct, tradeHonorFactor } =
		WORLD.ECONOMY.tradeMultipliers;
	const chaBonus = playerCha / 500;

	const dynamicMultiplier =
		baseTradeRepairPct - tradeHonorFactor * playerHonor - chaBonus;

	return Math.ceil(
		regionalSilverValue * damagePercentage * Math.max(0, dynamicMultiplier),
	);
};

// ------------------------------------------------------------------------
// TRANSACTION EXECUTORS
// ------------------------------------------------------------------------

export const executeBuyTransaction = (
	playerEntity,
	itemDefinition,
	quantity,
	regionalExchangeRate,
	targetInventoryCategory,
) => {
	const playerHonor = playerEntity.progression?.honor || 0;
	const { totalCha } = calculateDerivedStats(playerEntity);

	const baseCost =
		itemDefinition.economy?.baseCoinValue ||
		itemDefinition.goldCoinBaseCost ||
		0;

	const unitPrice = calculateBuyPrice(
		baseCost,
		regionalExchangeRate,
		playerHonor,
		totalCha,
	);

	const totalCost = unitPrice * quantity;

	if (playerEntity.inventory.silverCoins < totalCost) {
		return { status: 'FAILED_INSUFFICIENT_FUNDS', totalCost };
	}

	playerEntity.inventory.silverCoins -= totalCost;

	if (targetInventoryCategory === 'numeric') {
		const numericKey = itemDefinition.inventoryKey;
		playerEntity.inventory[numericKey] =
			(playerEntity.inventory[numericKey] || 0) + quantity;
	} else {
		for (let i = 0; i < quantity; i++) {
			const physicalItem = { ...itemDefinition, isEquipped: false };

			if (
				!physicalItem.state &&
				(physicalItem.classification?.itemCategory === 'Equipment' ||
					physicalItem.classification?.itemClass === 'Weapon')
			) {
				physicalItem.state = {
					currentDurability: itemDefinition.maxDurability || 100,
					maxDurability: itemDefinition.maxDurability || 100,
				};
			}
			playerEntity.inventory[targetInventoryCategory].push(physicalItem);
		}
	}

	return {
		status: 'SUCCESS',
		totalCost,
		unitPrice,
		updatedPlayer: playerEntity,
	};
};

export const executeSellTransaction = (
	playerEntity,
	itemPayload,
	quantity,
	regionalExchangeRate,
	targetInventoryCategory,
	physicalItemIndex = null,
) => {
	let revenue = 0;
	const playerHonor = playerEntity.progression?.honor || 0;
	const { totalCha } = calculateDerivedStats(playerEntity);
	const NEUTRAL_RER = 10;

	if (physicalItemIndex !== null) {
		const targetArray = playerEntity.inventory[targetInventoryCategory];

		if (!targetArray || !targetArray[physicalItemIndex]) {
			return { status: 'FAILED_ITEM_NOT_FOUND' };
		}

		const itemToSell = targetArray[physicalItemIndex];
		const baseCost =
			itemToSell.economy?.baseCoinValue || itemToSell.goldCoinBaseCost || 0;

		const isLoot =
			itemToSell.classification?.itemCategory === 'Loot' ||
			itemToSell.classification?.itemCategory === 'Trophy';

		if (isLoot) {
			revenue = Math.floor(baseCost * (regionalExchangeRate / NEUTRAL_RER));
			if (baseCost > 0 && revenue < 1) {
				revenue = 1;
			}
		} else {
			const curDur = itemToSell.state?.currentDurability || 100;
			const maxDur = itemToSell.state?.maxDurability || 100;
			const isIngot =
				itemToSell.inventoryKey === 'tradeGold' ||
				itemToSell.inventoryKey === 'tradeSilver';

			revenue = calculateSellPrice(
				baseCost,
				regionalExchangeRate,
				curDur,
				maxDur,
				playerHonor,
				totalCha,
				isIngot,
			);
		}

		targetArray.splice(physicalItemIndex, 1);
	} else {
		if (playerEntity.inventory[targetInventoryCategory] < quantity) {
			return { status: 'FAILED_INSUFFICIENT_QUANTITY' };
		}

		const baseCost =
			itemPayload.economy?.baseCoinValue ||
			itemPayload.goldCoinBaseCost ||
			0;
		const isLoot =
			itemPayload.classification?.itemCategory === 'Loot' ||
			itemPayload.classification?.itemCategory === 'Trophy';

		let unitRevenue = 0;

		if (isLoot) {
			unitRevenue = Math.floor(
				baseCost * (regionalExchangeRate / NEUTRAL_RER),
			);
			if (baseCost > 0 && unitRevenue < 1) {
				unitRevenue = 1;
			}
		} else {
			const isIngot =
				itemPayload.inventoryKey === 'tradeGold' ||
				itemPayload.inventoryKey === 'tradeSilver';
			unitRevenue = calculateSellPrice(
				baseCost,
				regionalExchangeRate,
				100,
				100,
				playerHonor,
				totalCha,
				isIngot,
			);
		}

		revenue = unitRevenue * quantity;
		playerEntity.inventory[targetInventoryCategory] -= quantity;
	}

	playerEntity.inventory.silverCoins += revenue;

	return {
		status: 'SUCCESS',
		revenueGenerated: revenue,
		updatedPlayer: playerEntity,
	};
};

export const executeRepairTransaction = (
	playerEntity,
	regionalExchangeRate,
	targetInventoryCategory,
	physicalItemIndex,
	npcRank = 5,
) => {
	const playerHonor = playerEntity.progression?.honor || 0;
	const { totalCha } = calculateDerivedStats(playerEntity);

	const targetArray = playerEntity.inventory[targetInventoryCategory];

	if (!targetArray || !targetArray[physicalItemIndex]) {
		return { status: 'FAILED_ITEM_NOT_FOUND' };
	}

	const itemToRepair = targetArray[physicalItemIndex];
	const curDur = itemToRepair.state?.currentDurability || 100;
	const maxDur = itemToRepair.state?.maxDurability || 100;

	const itemTier = itemToRepair.classification?.itemTier || 1;
	if (itemTier > npcRank) {
		return { status: 'FAILED_NPC_RANK_TOO_LOW' };
	}

	if (curDur >= maxDur) {
		return { status: 'FAILED_ALREADY_MAX_DURABILITY' };
	}

	const baseCost =
		itemToRepair.economy?.baseCoinValue || itemToRepair.goldCoinBaseCost || 0;

	const repairCost = calculateRepairCost(
		baseCost,
		regionalExchangeRate,
		curDur,
		maxDur,
		playerHonor,
		totalCha,
	);

	if (playerEntity.inventory.silverCoins < repairCost) {
		return { status: 'FAILED_INSUFFICIENT_FUNDS', repairCost };
	}

	playerEntity.inventory.silverCoins -= repairCost;
	itemToRepair.state.currentDurability = maxDur;

	return { status: 'SUCCESS', repairCost, updatedPlayer: playerEntity };
};
