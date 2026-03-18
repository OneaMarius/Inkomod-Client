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
    const regionalSilverValue = convertGoldToSilver(baseGoldValue, regionalExchangeRate);
    return Math.floor(regionalSilverValue * WORLD.ECONOMY.tradeMultipliers.tradeBuyPct);
};

/**
 * Calculates the revenue the player receives when selling an item.
 * Factors in the durability degradation of physical equipment.
 */
export const calculateSellPrice = (baseGoldValue, regionalExchangeRate, currentDurability = 100, maxDurability = 100) => {
    const regionalSilverValue = convertGoldToSilver(baseGoldValue, regionalExchangeRate);
    const conditionModifier = currentDurability / maxDurability;
    return Math.floor(regionalSilverValue * conditionModifier * WORLD.ECONOMY.tradeMultipliers.tradeSellPct);
};

/**
 * Calculates the cost in silver to repair an item to its maximum durability.
 */
export const calculateRepairCost = (baseGoldValue, regionalExchangeRate, currentDurability, maxDurability) => {
    if (currentDurability >= maxDurability) return 0;
    
    const regionalSilverValue = convertGoldToSilver(baseGoldValue, regionalExchangeRate);
    const damagePercentage = 1 - (currentDurability / maxDurability);
    
    return Math.ceil(regionalSilverValue * damagePercentage * WORLD.ECONOMY.tradeMultipliers.tradeRepairPct);
};

// ------------------------------------------------------------------------
// TRANSACTION EXECUTORS
// ------------------------------------------------------------------------

/**
 * Executes a purchase transaction.
 * Note: Encumbrance is inherently uncapped during transactions. 
 * Penalties for exceeding maxCapacity are processed by the Travel Engine.
 * @param {Object} playerEntity - The current state of the player.
 * @param {Object} itemDefinition - The database template of the item being bought.
 * @param {Number} quantity - Amount to purchase.
 * @param {Number} regionalExchangeRate - The active POI's exchange rate.
 * @param {String} targetInventoryCategory - 'numeric', 'itemSlots', 'animalSlots', 'lootSlots'
 * @returns {Object} Result payload of the transaction.
 */
export const executeBuyTransaction = (playerEntity, itemDefinition, quantity, regionalExchangeRate, targetInventoryCategory) => {
    const unitPrice = calculateBuyPrice(itemDefinition.goldCoinBaseCost, regionalExchangeRate);
    const totalCost = unitPrice * quantity;

    if (playerEntity.inventory.silverCoins < totalCost) {
        return { status: 'FAILED_INSUFFICIENT_FUNDS', totalCost };
    }

    // Deduct currency
    playerEntity.inventory.silverCoins -= totalCost;

    // Inject into inventory
    if (targetInventoryCategory === 'numeric') {
        const numericKey = itemDefinition.inventoryKey; // e.g., 'food', 'healingPotions', 'tradeSilver'
        playerEntity.inventory[numericKey] += quantity;
    } else {
        // Generate isolated physical item objects
        for (let i = 0; i < quantity; i++) {
            const physicalItem = {
                ...itemDefinition,
                currentDurability: itemDefinition.maxDurability || 100,
                isEquipped: false
            };
            playerEntity.inventory[targetInventoryCategory].push(physicalItem);
        }
    }

    return { 
        status: 'SUCCESS', 
        totalCost, 
        unitPrice, 
        updatedPlayer: playerEntity 
    };
};

/**
 * Executes a sell transaction.
 * @param {Object} playerEntity - The current state of the player.
 * @param {Object} itemPayload - Details of the item being sold (contains baseGoldValue and durability).
 * @param {Number} quantity - Amount to sell (used strictly for numeric items).
 * @param {Number} regionalExchangeRate - The active POI's exchange rate.
 * @param {String} targetInventoryCategory - The array name or numeric key from which to remove the item.
 * @param {Number} physicalItemIndex - The index of the item in the physical array (null if numeric).
 * @returns {Object} Result payload of the transaction.
 */
export const executeSellTransaction = (playerEntity, itemPayload, quantity, regionalExchangeRate, targetInventoryCategory, physicalItemIndex = null) => {
    let revenue = 0;

    if (physicalItemIndex !== null) {
        // 1. Handling Physical Array Items (Weapons, Armour, specific Loot objects)
        const targetArray = playerEntity.inventory[targetInventoryCategory];
        
        if (!targetArray || !targetArray[physicalItemIndex]) {
            return { status: 'FAILED_ITEM_NOT_FOUND' };
        }

        const itemToSell = targetArray[physicalItemIndex];
        revenue = calculateSellPrice(
            itemToSell.goldCoinBaseCost, 
            regionalExchangeRate, 
            itemToSell.currentDurability, 
            itemToSell.maxDurability
        );

        // Remove the specific item from the array
        targetArray.splice(physicalItemIndex, 1);

    } else {
        // 2. Handling Numeric Counters (Food, TradeSilver, etc.)
        if (playerEntity.inventory[targetInventoryCategory] < quantity) {
            return { status: 'FAILED_INSUFFICIENT_QUANTITY' };
        }

        const unitRevenue = calculateSellPrice(itemPayload.goldCoinBaseCost, regionalExchangeRate, 100, 100);
        revenue = unitRevenue * quantity;

        // Deduct the quantity from the numeric counter
        playerEntity.inventory[targetInventoryCategory] -= quantity;
    }

    // Add revenue to player's wallet
    playerEntity.inventory.silverCoins += revenue;

    return { 
        status: 'SUCCESS', 
        revenueGenerated: revenue, 
        updatedPlayer: playerEntity 
    };
};

/**
 * Processes a repair transaction for a specific piece of equipment.
 */
export const executeRepairTransaction = (playerEntity, regionalExchangeRate, targetInventoryCategory, physicalItemIndex) => {
    const targetArray = playerEntity.inventory[targetInventoryCategory];
    
    if (!targetArray || !targetArray[physicalItemIndex]) {
        return { status: 'FAILED_ITEM_NOT_FOUND' };
    }

    const itemToRepair = targetArray[physicalItemIndex];
    
    if (itemToRepair.currentDurability >= itemToRepair.maxDurability) {
        return { status: 'FAILED_ALREADY_MAX_DURABILITY' };
    }

    const repairCost = calculateRepairCost(
        itemToRepair.goldCoinBaseCost, 
        regionalExchangeRate, 
        itemToRepair.currentDurability, 
        itemToRepair.maxDurability
    );

    if (playerEntity.inventory.silverCoins < repairCost) {
        return { status: 'FAILED_INSUFFICIENT_FUNDS', repairCost };
    }

    // Deduct cost and restore durability
    playerEntity.inventory.silverCoins -= repairCost;
    itemToRepair.currentDurability = itemToRepair.maxDurability;

    return { 
        status: 'SUCCESS', 
        repairCost, 
        updatedPlayer: playerEntity 
    };
};