// File: Client/src/utils/RewardCalculator.js
// Description: Parses dynamic reward objects into strict integers based on GameWorld configurations.

import { WORLD } from '../data/GameWorld.js';
import { getRandomInt } from './RandomUtils.js';

/**
 * Calculates the final integer value for an event payload.
 * @param {string} resourceKey - The state variable being modified (e.g., 'silverCoins', 'hpMod').
 * @param {number|Object} payloadData - Either a hardcoded integer or a dynamic config object { tier, type }.
 * @returns {number} The finalized integer to apply to the player state.
 */
export const calculateDynamicValue = (resourceKey, payloadData) => {
    // 1. Fallback for legacy hardcoded integers
    if (typeof payloadData === 'number') {
        return payloadData;
    }

    // 2. Validate dynamic object structure
    if (!payloadData || typeof payloadData !== 'object' || !payloadData.tier || !payloadData.type) {
        return 0; // Failsafe
    }

    const { tier, type } = payloadData;
    const config = WORLD.DYNAMIC_REWARDS[resourceKey];

    if (!config || !config.tiers[tier]) {
        console.error(`RewardCalculator Error: Missing configuration for [${resourceKey}] at tier [${tier}]`);
        return 0;
    }

    // 3. Extract base and variance rules
    const baseValue = config.tiers[tier].base;
    const varianceRule = config.variance;
    
    let minBounds = baseValue;
    let maxBounds = baseValue;

    // 4. Calculate variance limits
    if (varianceRule.value > 0) {
        let varianceAmount = 0;
        
        if (varianceRule.type === 'percentage') {
            varianceAmount = baseValue * varianceRule.value;
        } else if (varianceRule.type === 'flat') {
            varianceAmount = varianceRule.value;
        }

        minBounds = Math.max(0, baseValue - varianceAmount); // Prevent negative bases
        maxBounds = baseValue + varianceAmount;
    }

    // 5. Generate final value
    let finalValue = getRandomInt(Math.floor(minBounds), Math.ceil(maxBounds));

    // 6. Apply positive/negative modifier
    if (type === 'PENALTY') {
        finalValue = -Math.abs(finalValue);
    } else if (type === 'REWARD') {
        finalValue = Math.abs(finalValue);
    }

    return finalValue;
};