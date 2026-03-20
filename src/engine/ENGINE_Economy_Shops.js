// File: src/engine/ENGINE_Economy_Shops.js
// Description: Core logic for commerce, dynamic pricing, and item repairs based on regional exchange rates and global multipliers.

import { WORLD } from '../data/GameWorld.js';

// ------------------------------------------------------------------------
// PRICING CALCULATORS
// ------------------------------------------------------------------------

/**
 * Converts the abstract Gold base value into physical Silver coins.
 */
const convertGoldToSilver = (baseGoldValue, regionalExchangeRate) => {
	return Math.floor(baseGoldValue * regionalExchangeRate);
};

/**
 * Calculates the final cost for the player to buy an item from a merchant.
 */
export const calculateBuyPrice = (baseGoldValue, regionalExchangeRate) => {
	const regionalSilverValue = convertGoldToSilver(
		baseGoldValue,
		regionalExchangeRate,
	);
	return Math.floor(
		regionalSilverValue * WORLD.ECONOMY.tradeMultipliers.tradeBuyPct,
	);
};

/**
 * Calculates the revenue the player receives when selling an item.
 * Factors in the durability degradation of physical equipment.
 */
export const calculateSellPrice = (
	baseGoldValue,
	regionalExchangeRate,
	currentDurability = 100,
	maxDurability = 100,
) => {
	const regionalSilverValue = convertGoldToSilver(
		baseGoldValue,
		regionalExchangeRate,
	);
	const conditionModifier = currentDurability / maxDurability;
	return Math.floor(
		regionalSilverValue *
			conditionModifier *
			WORLD.ECONOMY.tradeMultipliers.tradeSellPct,
	);
};

/**
 * Calculates the cost in silver to repair an item to its maximum durability.
 */
export const calculateRepairCost = (
	baseGoldValue,
	regionalExchangeRate,
	currentDurability,
	maxDurability,
) => {
	if (currentDurability >= maxDurability) return 0;

	const regionalSilverValue = convertGoldToSilver(
		baseGoldValue,
		regionalExchangeRate,
	);
	const damagePercentage = 1 - currentDurability / maxDurability;

	return Math.ceil(
		regionalSilverValue *
			damagePercentage *
			WORLD.ECONOMY.tradeMultipliers.tradeRepairPct,
	);
};

// ------------------------------------------------------------------------
// TRANSACTION EXECUTORS
// ------------------------------------------------------------------------

/**
 * Executes a purchase transaction.
 * Note: Encumbrance is inherently uncapped during transactions.
 * Penalties for exceeding maxCapacity are processed by the Travel Engine.
 */
export const executeBuyTransaction = (
	playerEntity,
	itemDefinition,
	quantity,
	regionalExchangeRate,
	targetInventoryCategory,
) => {
	// Extragere sigură a costului
	const baseCost =
		itemDefinition.economy?.baseCoinValue ||
		itemDefinition.goldCoinBaseCost ||
		0;
	const unitPrice = calculateBuyPrice(baseCost, regionalExchangeRate);
	const totalCost = unitPrice * quantity;

	if (playerEntity.inventory.silverCoins < totalCost) {
		return { status: 'FAILED_INSUFFICIENT_FUNDS', totalCost };
	}

	// Deduct currency
	playerEntity.inventory.silverCoins -= totalCost;

	// Inject into inventory
	if (targetInventoryCategory === 'numeric') {
		const numericKey = itemDefinition.inventoryKey;
		playerEntity.inventory[numericKey] =
			(playerEntity.inventory[numericKey] || 0) + quantity;
	} else {
		// Generate isolated physical item objects
		for (let i = 0; i < quantity; i++) {
			const physicalItem = {
				...itemDefinition,
				isEquipped: false,
			};

			// Asigură prezența block-ului de stare dacă obiectul necesită durabilitate și nu îl are nativ
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

/**
 * Executes a sell transaction.
 */
export const executeSellTransaction = (
	playerEntity,
	itemPayload,
	quantity,
	regionalExchangeRate,
	targetInventoryCategory,
	physicalItemIndex = null,
) => {
	let revenue = 0;

	if (physicalItemIndex !== null) {
		// 1. Handling Physical Array Items (Weapons, Armour, Loot objects)
		const targetArray = playerEntity.inventory[targetInventoryCategory];

		if (!targetArray || !targetArray[physicalItemIndex]) {
			return { status: 'FAILED_ITEM_NOT_FOUND' };
		}

		const itemToSell = targetArray[physicalItemIndex];

		// Extragere sigură a costului și a stării
		const baseCost =
			itemToSell.economy?.baseCoinValue || itemToSell.goldCoinBaseCost || 0;
		const curDur = itemToSell.state?.currentDurability || 100;
		const maxDur = itemToSell.state?.maxDurability || 100;

		revenue = calculateSellPrice(
			baseCost,
			regionalExchangeRate,
			curDur,
			maxDur,
		);

		// Remove the specific item from the array
		targetArray.splice(physicalItemIndex, 1);
	} else {
		// 2. Handling Numeric Counters (Food, TradeSilver, etc.)
		if (playerEntity.inventory[targetInventoryCategory] < quantity) {
			return { status: 'FAILED_INSUFFICIENT_QUANTITY' };
		}

		const baseCost =
			itemPayload.economy?.baseCoinValue ||
			itemPayload.goldCoinBaseCost ||
			0;
		const unitRevenue = calculateSellPrice(
			baseCost,
			regionalExchangeRate,
			100,
			100,
		);
		revenue = unitRevenue * quantity;

		// Deduct the quantity from the numeric counter
		playerEntity.inventory[targetInventoryCategory] -= quantity;
	}

	// Add revenue to player's wallet
	playerEntity.inventory.silverCoins += revenue;

	return {
		status: 'SUCCESS',
		revenueGenerated: revenue,
		updatedPlayer: playerEntity,
	};
};

/**
 * Processes a repair transaction for a specific piece of equipment.
 */
export const executeRepairTransaction = (
	playerEntity,
	regionalExchangeRate,
	targetInventoryCategory,
	physicalItemIndex,
) => {
	const targetArray = playerEntity.inventory[targetInventoryCategory];

	if (!targetArray || !targetArray[physicalItemIndex]) {
		return { status: 'FAILED_ITEM_NOT_FOUND' };
	}

	const itemToRepair = targetArray[physicalItemIndex];
	const curDur = itemToRepair.state?.currentDurability || 100;
	const maxDur = itemToRepair.state?.maxDurability || 100;

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
	);

	if (playerEntity.inventory.silverCoins < repairCost) {
		return { status: 'FAILED_INSUFFICIENT_FUNDS', repairCost };
	}

	// Deduct cost and restore durability
	playerEntity.inventory.silverCoins -= repairCost;
	itemToRepair.state.currentDurability = maxDur;

	return {
		status: 'SUCCESS',
		repairCost,
		updatedPlayer: playerEntity,
	};
};
