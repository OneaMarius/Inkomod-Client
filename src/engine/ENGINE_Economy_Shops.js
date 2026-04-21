// File: src/engine/ENGINE_Economy_Shops.js

import { WORLD } from '../data/GameWorld.js';
import { calculateDerivedStats } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// PRICING CALCULATORS
// ------------------------------------------------------------------------

const convertGoldToSilver = (baseGoldValue, regionalExchangeRate) => {
	return Math.floor(baseGoldValue * regionalExchangeRate);
};

export const calculateBuyPrice = (baseGoldValue, regionalExchangeRate, playerHonor = 0, playerCha = 1) => {
	const regionalSilverValue = convertGoldToSilver(baseGoldValue, regionalExchangeRate);

	const { baseTradeBuyPct, tradeHonorFactor } = WORLD.ECONOMY.tradeMultipliers;
	const chaBonus = playerCha / 500;

	const dynamicMultiplier = baseTradeBuyPct - tradeHonorFactor * playerHonor - chaBonus;

	return Math.floor(regionalSilverValue * Math.max(0, dynamicMultiplier));
};

export const calculateSellPrice = (
	baseGoldValue,
	regionalExchangeRate,
	currentDurability = 100,
	maxDurability = 100,
	playerHonor = 0,
	playerCha = 1,
	isIngot = false,
) => {
	const regionalSilverValue = convertGoldToSilver(baseGoldValue, regionalExchangeRate);
	const conditionModifier = currentDurability / maxDurability;

	const { baseTradeSellPct, ingotTradeSellPct, tradeHonorFactor } = WORLD.ECONOMY.tradeMultipliers;

	// Apply specific multiplier for ingots if available, otherwise use standard
	const basePct = isIngot && ingotTradeSellPct !== undefined ? ingotTradeSellPct : baseTradeSellPct;

	const chaBonus = playerCha / 500;

	const dynamicMultiplier = basePct + tradeHonorFactor * playerHonor + chaBonus;

	return Math.floor(regionalSilverValue * conditionModifier * Math.max(0, dynamicMultiplier));
};

export const calculateRepairCost = (baseGoldValue, regionalExchangeRate, currentDurability, maxDurability, playerHonor = 0, playerCha = 1) => {
	if (currentDurability >= maxDurability) return 0;

	const regionalSilverValue = convertGoldToSilver(baseGoldValue, regionalExchangeRate);
	const damagePercentage = 1 - currentDurability / maxDurability;

	const { baseTradeRepairPct, tradeHonorFactor } = WORLD.ECONOMY.tradeMultipliers;
	const chaBonus = playerCha / 500;

	const dynamicMultiplier = baseTradeRepairPct - tradeHonorFactor * playerHonor - chaBonus;

	return Math.ceil(regionalSilverValue * damagePercentage * Math.max(0, dynamicMultiplier));
};

// ------------------------------------------------------------------------
// TRANSACTION EXECUTORS
// ------------------------------------------------------------------------

export const executeBuyTransaction = (playerEntity, itemDefinition, quantity, regionalExchangeRate, targetInventoryCategory) => {
	const playerHonor = playerEntity.progression?.honor || 0;
	const { totalCha } = calculateDerivedStats(playerEntity);

	const baseCost = itemDefinition.economy?.baseCoinValue || itemDefinition.goldCoinBaseCost || 0;

	const unitPrice = calculateBuyPrice(baseCost, regionalExchangeRate, playerHonor, totalCha);

	const totalCost = unitPrice * quantity;

	if (playerEntity.inventory.silverCoins < totalCost) {
		return { status: 'FAILED_INSUFFICIENT_FUNDS', totalCost };
	}

	playerEntity.inventory.silverCoins -= totalCost;

	if (targetInventoryCategory === 'numeric') {
		const numericKey = itemDefinition.inventoryKey;
		playerEntity.inventory[numericKey] = (playerEntity.inventory[numericKey] || 0) + quantity;
	} else {
		for (let i = 0; i < quantity; i++) {
			const physicalItem = { ...itemDefinition, isEquipped: false };

			if (!physicalItem.state && (physicalItem.classification?.itemCategory === 'Equipment' || physicalItem.classification?.itemClass === 'Weapon')) {
				physicalItem.state = { currentDurability: itemDefinition.maxDurability || 100, maxDurability: itemDefinition.maxDurability || 100 };
			}
			playerEntity.inventory[targetInventoryCategory].push(physicalItem);
		}
	}

	return { status: 'SUCCESS', totalCost, unitPrice, updatedPlayer: playerEntity };
};

export const executeSellTransaction = (playerEntity, itemPayload, quantity, regionalExchangeRate, targetInventoryCategory, physicalItemIndex = null) => {
	let revenue = 0;
	const playerHonor = playerEntity.progression?.honor || 0;
	const { totalCha } = calculateDerivedStats(playerEntity);

	if (physicalItemIndex !== null) {
		const targetArray = playerEntity.inventory[targetInventoryCategory];

		if (!targetArray || !targetArray[physicalItemIndex]) {
			return { status: 'FAILED_ITEM_NOT_FOUND' };
		}

		const itemToSell = targetArray[physicalItemIndex];
		const baseCost = itemToSell.economy?.baseCoinValue || itemToSell.goldCoinBaseCost || 0;
		const curDur = itemToSell.state?.currentDurability || 100;
		const maxDur = itemToSell.state?.maxDurability || 100;

		const isIngot = itemToSell.inventoryKey === 'tradeGold' || itemToSell.inventoryKey === 'tradeSilver';

		revenue = calculateSellPrice(baseCost, regionalExchangeRate, curDur, maxDur, playerHonor, totalCha, isIngot);

		targetArray.splice(physicalItemIndex, 1);
	} else {
		if (playerEntity.inventory[targetInventoryCategory] < quantity) {
			return { status: 'FAILED_INSUFFICIENT_QUANTITY' };
		}

		const baseCost = itemPayload.economy?.baseCoinValue || itemPayload.goldCoinBaseCost || 0;

		const isIngot = itemPayload.inventoryKey === 'tradeGold' || itemPayload.inventoryKey === 'tradeSilver';

		const unitRevenue = calculateSellPrice(baseCost, regionalExchangeRate, 100, 100, playerHonor, totalCha, isIngot);

		revenue = unitRevenue * quantity;
		playerEntity.inventory[targetInventoryCategory] -= quantity;
	}

	playerEntity.inventory.silverCoins += revenue;

	return { status: 'SUCCESS', revenueGenerated: revenue, updatedPlayer: playerEntity };
};

export const executeRepairTransaction = (playerEntity, regionalExchangeRate, targetInventoryCategory, physicalItemIndex, npcRank = 5) => {
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

	const baseCost = itemToRepair.economy?.baseCoinValue || itemToRepair.goldCoinBaseCost || 0;

	const repairCost = calculateRepairCost(baseCost, regionalExchangeRate, curDur, maxDur, playerHonor, totalCha);

	if (playerEntity.inventory.silverCoins < repairCost) {
		return { status: 'FAILED_INSUFFICIENT_FUNDS', repairCost };
	}

	playerEntity.inventory.silverCoins -= repairCost;
	itemToRepair.state.currentDurability = maxDur;

	return { status: 'SUCCESS', repairCost, updatedPlayer: playerEntity };
};
