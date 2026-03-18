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

export const executeInteraction = (playerEntity, actionTag, regionalExchangeRate = 10) => {
    // ------------------------------------------------------------------------
    // 1. EMPLOYMENT: Labor_Coin
    // ------------------------------------------------------------------------
    if (actionTag === 'Labor_Coin') {
        const config = DB_ACTIONS.employmentLabor.Labor_Coin;
        
        if (playerEntity.progression.actionPoints < config.apCost) {
            return { status: 'FAILED_INSUFFICIENT_AP' };
        }

        const yieldAmount = convertGoldToSilver(config.goldCoinBaseGain, regionalExchangeRate);

        playerEntity.progression.actionPoints -= config.apCost;
        playerEntity.inventory.silverCoins += yieldAmount;
        
        return { status: 'SUCCESS', yieldAmount, updatedPlayer: playerEntity };
    }

    // ------------------------------------------------------------------------
    // 2. LOGISTICS: Service_Lodging
    // ------------------------------------------------------------------------
    if (actionTag === 'Service_Lodging') {
        const config = DB_ACTIONS.utilityLogistics.Service_Lodging;
        const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);

        if (playerEntity.progression.actionPoints < config.apCost) {
            return { status: 'FAILED_INSUFFICIENT_AP' };
        }

        if (playerEntity.inventory.silverCoins < cost) {
            return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
        }

        if (playerEntity.biology.hpCurrent >= playerEntity.biology.hpMax) {
            return { status: 'FAILED_ALREADY_FULL_HP' };
        }

        playerEntity.progression.actionPoints -= config.apCost;
        playerEntity.inventory.silverCoins -= cost;

        playerEntity.biology.hpCurrent = Math.min(
            playerEntity.biology.hpMax,
            playerEntity.biology.hpCurrent + config.hpRestored
        );

        return { status: 'SUCCESS', costApplied: cost, hpRestored: config.hpRestored, updatedPlayer: playerEntity };
    }

    // ------------------------------------------------------------------------
    // 3. MAINTENANCE: Cure_Player
    // ------------------------------------------------------------------------
    if (actionTag === 'Cure_Player') {
        const config = DB_ACTIONS.maintenanceRestoration.Cure_Player;
        const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
        const hardCap = WORLD.PLAYER.hpLimits.hardCap;

        if (playerEntity.biology.hpMax >= hardCap) {
            return { status: 'FAILED_ALREADY_CURED' };
        }

        if (playerEntity.progression.actionPoints < config.apCost) {
            return { status: 'FAILED_INSUFFICIENT_AP' };
        }

        if (playerEntity.inventory.silverCoins < cost) {
            return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
        }

        playerEntity.progression.actionPoints -= config.apCost;
        playerEntity.inventory.silverCoins -= cost;
        playerEntity.biology.hpMax = hardCap;

        return { status: 'SUCCESS', costApplied: cost, updatedPlayer: playerEntity };
    }

    // ------------------------------------------------------------------------
    // 4. PROGRESSION: Train_STR, Train_AGI, Train_INT
    // ------------------------------------------------------------------------
    if (actionTag.startsWith('Train_')) {
        const statKey = actionTag.split('_')[1].toLowerCase(); // Extracts 'str', 'agi', or 'int'
        const config = DB_ACTIONS.attributeProgression[actionTag];
        
        if (!config) return { status: 'FAILED_INVALID_ACTION' };

        const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
        const currentStat = playerEntity.stats[statKey];
        
        // Rank-based cap resolution
        const playerRankIndex = (playerEntity.identity.rank || 1) - 1;
        const currentCap = WORLD.PLAYER.trainingCaps[statKey][playerRankIndex];

        if (currentStat >= currentCap) {
            return { status: 'FAILED_STAT_CAPPED' };
        }

        if (playerEntity.progression.actionPoints < config.apCost) {
            return { status: 'FAILED_INSUFFICIENT_AP' };
        }

        if (playerEntity.inventory.silverCoins < cost) {
            return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
        }

        playerEntity.progression.actionPoints -= config.apCost;
        playerEntity.inventory.silverCoins -= cost;
        playerEntity.stats[statKey] += config.statIncrement;

        return { status: 'SUCCESS', costApplied: cost, statIncreased: statKey, updatedPlayer: playerEntity };
    }

    return { status: 'FAILED_UNKNOWN_ACTION' };
};