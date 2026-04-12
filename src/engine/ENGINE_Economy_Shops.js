// File: src/engine/ENGINE_Economy_Shops.js
// Description: Core logic for commerce, dynamic pricing, and item repairs based on regional exchange rates, global multipliers, player honor, and charisma.

import { WORLD } from '../data/GameWorld.js';
import { calculateDerivedStats } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// PRICING CALCULATORS
// ------------------------------------------------------------------------

const convertGoldToSilver = (baseGoldValue, regionalExchangeRate) => {
	return Math.floor(baseGoldValue * regionalExchangeRate);
};

/**
 * Calculates the final cost for the player to buy an item from a merchant.
 * Formula: BuyPrice = Base * (baseTradeBuyPct - (tradeHonorFactor * Honor) - (Cha / 500))
 */
export const calculateBuyPrice = (
	baseGoldValue,
	regionalExchangeRate,
	playerHonor = 0,
	playerCha = 1,
) => {
	const regionalSilverValue = convertGoldToSilver(
		baseGoldValue,
		regionalExchangeRate,
	);

	const { baseTradeBuyPct, tradeHonorFactor } = WORLD.ECONOMY.tradeMultipliers;
	const chaBonus = playerCha / 500; // CHA 50 = 0.10 (10% discount)

	const dynamicMultiplier =
		baseTradeBuyPct - tradeHonorFactor * playerHonor - chaBonus;

	return Math.floor(regionalSilverValue * Math.max(0, dynamicMultiplier));
};

/**
 * Calculates the revenue the player receives when selling an item.
 * Formula: SellPrice = Base * (baseTradeSellPct + (tradeHonorFactor * Honor) + (Cha / 500))
 */
export const calculateSellPrice = (
	baseGoldValue,
	regionalExchangeRate,
	currentDurability = 100,
	maxDurability = 100,
	playerHonor = 0,
	playerCha = 1,
) => {
	const regionalSilverValue = convertGoldToSilver(
		baseGoldValue,
		regionalExchangeRate,
	);
	const conditionModifier = currentDurability / maxDurability;

	const { baseTradeSellPct, tradeHonorFactor } =
		WORLD.ECONOMY.tradeMultipliers;
	const chaBonus = playerCha / 500; // CHA 50 = 0.10 (10% extra profit)

	const dynamicMultiplier =
		baseTradeSellPct + tradeHonorFactor * playerHonor + chaBonus;

	return Math.floor(
		regionalSilverValue * conditionModifier * Math.max(0, dynamicMultiplier),
	);
};

/**
 * Calculates the cost in silver to repair an item to its maximum durability.
 * Formula: RepairPrice = Base * Damage * (baseTradeRepairPct - (tradeHonorFactor * Honor) - (Cha / 500))
 */
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

	// --- INTERCEPT PENTRU AUR ȘI ARGINT (CUMPĂRARE) ---
	let unitPrice = 0;
	if (
		itemDefinition.inventoryKey === 'tradeGold' ||
		itemDefinition.inventoryKey === 'tradeSilver'
	) {
		unitPrice = Math.floor(baseCost * regionalExchangeRate); // Preț pur
	} else {
		unitPrice = calculateBuyPrice(
			baseCost,
			regionalExchangeRate,
			playerHonor,
			totalCha,
		); // Preț normal cu adaos
	}

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

	if (physicalItemIndex !== null) {
		const targetArray = playerEntity.inventory[targetInventoryCategory];

		if (!targetArray || !targetArray[physicalItemIndex]) {
			return { status: 'FAILED_ITEM_NOT_FOUND' };
		}

		const itemToSell = targetArray[physicalItemIndex];
		const baseCost =
			itemToSell.economy?.baseCoinValue || itemToSell.goldCoinBaseCost || 0;
		const curDur = itemToSell.state?.currentDurability || 100;
		const maxDur = itemToSell.state?.maxDurability || 100;

		// --- INTERCEPT PENTRU AUR ȘI ARGINT (VÂNZARE DIN INVENTAR FIZIC - doar ca siguranță) ---
		if (
			itemToSell.inventoryKey === 'tradeGold' ||
			itemToSell.inventoryKey === 'tradeSilver'
		) {
			revenue = Math.floor(baseCost * regionalExchangeRate);
		} else {
			revenue = calculateSellPrice(
				baseCost,
				regionalExchangeRate,
				curDur,
				maxDur,
				playerHonor,
				totalCha,
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

		// --- INTERCEPT PENTRU AUR ȘI ARGINT (VÂNZARE NUMERICĂ/STACKABLE) ---
		let unitRevenue = 0;
		if (
			itemPayload.inventoryKey === 'tradeGold' ||
			itemPayload.inventoryKey === 'tradeSilver'
		) {
			unitRevenue = Math.floor(baseCost * regionalExchangeRate); // Fără pierdere/markdown la vânzare
		} else {
			unitRevenue = calculateSellPrice(
				baseCost,
				regionalExchangeRate,
				100,
				100,
				playerHonor,
				totalCha,
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

	// NEW: Rank Validation
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
