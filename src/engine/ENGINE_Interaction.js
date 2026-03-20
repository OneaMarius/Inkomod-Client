// File: src/engine/ENGINE_Interaction.js
// Description: Validates and executes non-combat state mutations based on DB_Actions.

import { WORLD } from '../data/GameWorld.js';
import { DB_ACTIONS } from '../data/DB_Actions.js';

/**
 * Helper to convert abstract gold values to regional silver values.
 */
const convertGoldToSilver = (baseGold, exchangeRate) => {
    return Math.floor(baseGold * exchangeRate);
};

/**
 * Helper to dynamically find the action configuration across all DB categories.
 */
const findActionConfig = (actionTag) => {
    for (const category in DB_ACTIONS) {
        if (DB_ACTIONS[category][actionTag]) {
            return DB_ACTIONS[category][actionTag];
        }
    }
    return null;
};

export const executeInteraction = (playerEntity, actionTag, targetId, regionalExchangeRate = 10) => {
    const config = findActionConfig(actionTag);
    
    // Fallback to global default AP cost if the action config or apCost property is missing
    const apCost = config?.apCost !== undefined 
        ? config.apCost 
        : (WORLD.PLAYER?.defaultInteractionApCost || 0);

    if (playerEntity.progression.actionPoints < apCost) {
        return { status: 'FAILED_INSUFFICIENT_AP' };
    }

    // ------------------------------------------------------------------------
    // 1. COMBAT TRIGGERS (Added Combat_ and Target_ prefixes)
    // ------------------------------------------------------------------------
    if (
        actionTag.startsWith('Fight_') || 
        actionTag.startsWith('Combat_') || 
        actionTag.startsWith('Target_') || 
        actionTag.startsWith('Hunt_') || 
        actionTag === 'Evade_Animal'
    ) {
        playerEntity.progression.actionPoints -= apCost;
        return { 
            status: 'TRIGGER_COMBAT', 
            targetId: targetId, 
            apSpent: apCost, 
            updatedPlayer: playerEntity 
        };
    }

    // ------------------------------------------------------------------------
    // 2. ECONOMY / TRADE TRIGGERS (Added Trade_ prefix)
    // ------------------------------------------------------------------------
    if (actionTag.startsWith('Trade_') || ['Trade', 'Buy_Animal', 'Sell_Animal'].includes(actionTag)) {
        playerEntity.progression.actionPoints -= apCost;
        return { 
            status: 'TRIGGER_TRADE', 
            targetId: targetId, 
            apSpent: apCost, 
            updatedPlayer: playerEntity 
        };
    }

    // ------------------------------------------------------------------------
    // 3. EMPLOYMENT: Labor_Coin
    // ------------------------------------------------------------------------
    if (actionTag === 'Labor_Coin' && config) {
        const yieldAmount = convertGoldToSilver(config.goldCoinBaseGain, regionalExchangeRate);
        playerEntity.progression.actionPoints -= apCost;
        playerEntity.inventory.silverCoins += yieldAmount;
        return { status: 'SUCCESS', yieldAmount, updatedPlayer: playerEntity };
    }

    // ------------------------------------------------------------------------
    // 4. LOGISTICS: Service_Lodging
    // ------------------------------------------------------------------------
    if (actionTag === 'Service_Lodging' && config) {
        const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
        
        if (playerEntity.inventory.silverCoins < cost) {
            return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
        }
        if (playerEntity.biology.hpCurrent >= playerEntity.biology.hpMax) {
            return { status: 'FAILED_ALREADY_FULL_HP' };
        }

        playerEntity.progression.actionPoints -= apCost;
        playerEntity.inventory.silverCoins -= cost;
        playerEntity.biology.hpCurrent = Math.min(
            playerEntity.biology.hpMax,
            playerEntity.biology.hpCurrent + config.hpRestored
        );

        return { status: 'SUCCESS', costApplied: cost, hpRestored: config.hpRestored, updatedPlayer: playerEntity };
    }

    // ------------------------------------------------------------------------
    // 5. MAINTENANCE: Cure_Player
    // ------------------------------------------------------------------------
    if (actionTag === 'Cure_Player' && config) {
        const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
        const hardCap = WORLD.PLAYER.hpLimits.hardCap;
        
        if (playerEntity.biology.hpMax >= hardCap) {
            return { status: 'FAILED_ALREADY_CURED' };
        }
        if (playerEntity.inventory.silverCoins < cost) {
            return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
        }

        playerEntity.progression.actionPoints -= apCost;
        playerEntity.inventory.silverCoins -= cost;
        playerEntity.biology.hpMax = hardCap;

        return { status: 'SUCCESS', costApplied: cost, updatedPlayer: playerEntity };
    }

    // ------------------------------------------------------------------------
    // 6. PROGRESSION: Train_STR, Train_AGI, Train_INT
    // ------------------------------------------------------------------------
    if (actionTag.startsWith('Train_') && config) {
        const statKey = actionTag.split('_')[1].toLowerCase();
        const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
        const currentStat = playerEntity.stats[statKey];
        
        const playerRankIndex = (playerEntity.identity.rank || 1) - 1;
        const currentCap = WORLD.PLAYER.trainingCaps[statKey][playerRankIndex];

        if (currentStat >= currentCap) {
            return { status: 'FAILED_STAT_CAPPED' };
        }
        if (playerEntity.inventory.silverCoins < cost) {
            return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
        }

        playerEntity.progression.actionPoints -= apCost;
        playerEntity.inventory.silverCoins -= cost;
        playerEntity.stats[statKey] += config.statIncrement;

        return { status: 'SUCCESS', costApplied: cost, statIncreased: statKey, updatedPlayer: playerEntity };
    }

    return { status: 'FAILED_UNKNOWN_ACTION' };
};