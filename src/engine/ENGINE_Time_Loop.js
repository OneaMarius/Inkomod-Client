// File: src/engine/ENGINE_Time_Loop.js
// Description: Master execution engine for the End Month (Turn) sequence.
// Handles biological upkeep, seasonal transitions, aging, and resource regeneration.

import { WORLD } from '../data/GameWorld.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// HELPER FORMULAS
// ------------------------------------------------------------------------

/**
 * Determines the active season based on the current month.
 */
const determineSeason = (month) => {
    const seasons = WORLD.TIME.seasons;
    if (month >= seasons.spring.startMonth && month <= seasons.spring.endMonth) return 'spring';
    if (month >= seasons.summer.startMonth && month <= seasons.summer.endMonth) return 'summer';
    if (month >= seasons.autumn.startMonth && month <= seasons.autumn.endMonth) return 'autumn';
    return 'winter';
};

/**
 * Calculates the total food required for the player and all owned animals for one month.
 */
const calculateMonthlyFoodRequirement = (playerEntity, seasonKey) => {
    let baseFood = WORLD.PLAYER.baseFoodNeed;

    // Helper to calculate animal food
    const getAnimalFood = (animal) => {
        // Fallback default values if the database properties are missing
        const consumptionBase = animal.biology?.foodConsumptionPerRank || 1;
        const rank = animal.identity?.rank || 1;
        return consumptionBase * rank;
    };

    // Add equipped mount consumption
    if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
        baseFood += getAnimalFood(playerEntity.equipment.mountItem);
    }

    // Add caravan (animalSlots) consumption
    if (playerEntity.inventory.animalSlots && playerEntity.inventory.animalSlots.length > 0) {
        playerEntity.inventory.animalSlots.forEach(animal => {
            baseFood += getAnimalFood(animal);
        });
    }

    const seasonMultiplier = WORLD.TIME.seasons[seasonKey].foodConsumptionMult;
    
    // Result is rounded up to the nearest integer
    return Math.ceil(baseFood * seasonMultiplier);
};

// ------------------------------------------------------------------------
// MAIN EXECUTION LOOP
// ------------------------------------------------------------------------

/**
 * Executes the End Month transition.
 * @param {Object} playerEntity - The current state of the player.
 * @param {Object} timeState - The global time tracker (e.g., gameState.time).
 * @returns {Object} Payload containing the updated player, time state, and death flags.
 */
export const executeEndMonth = (playerEntity, timeState) => {
    let isDead = false;
    let deathReason = null;

    // ========================================================================
    // 1. TIME PROGRESSION & SEASON RESOLUTION
    // ========================================================================
    timeState.currentMonth += 1;
    timeState.totalMonthsPassed += 1;

    if (timeState.currentMonth > WORLD.TIME.monthsPerYear) {
        timeState.currentMonth = 1;
    }

    timeState.activeSeason = determineSeason(timeState.currentMonth);

    // ========================================================================
    // 2. AGING & MORTALITY DEGRADATION
    // ========================================================================
    const age = playerEntity.identity.age;
    const tiers = WORLD.PLAYER.aging.mortalityTiers;
    
    // Calculate monthly death probability based on annual risk
    let monthlyDeathRisk = 0;
    if (age <= tiers[0].maxAge) monthlyDeathRisk = tiers[0].annualRisk / 12;
    else if (age <= tiers[1].maxAge) monthlyDeathRisk = tiers[1].annualRisk / 12;
    else monthlyDeathRisk = tiers[2].annualRisk / 12;

    const deathRoll = Math.random();
    if (deathRoll <= monthlyDeathRisk) {
        return { status: 'PERMADEATH', reason: 'Natural_Causes', updatedPlayer: playerEntity, updatedTime: timeState };
    }

    // Annual Aging (Triggers on the defined YearChangeMonth)
    if (timeState.currentMonth === WORLD.TIME.yearChangeMonth) {
        playerEntity.identity.age += 1;
        
        // Apply stat degradation if past the threshold
        if (playerEntity.identity.age > WORLD.PLAYER.aging.statLossThreshold) {
            const loss = WORLD.PLAYER.aging.annualStatPenalty;
            
            playerEntity.stats.str = Math.max(1, playerEntity.stats.str - loss);
            playerEntity.stats.agi = Math.max(1, playerEntity.stats.agi - loss);
            playerEntity.stats.int = Math.max(1, playerEntity.stats.int - loss);
            
            playerEntity.biology.hpMax = Math.max(
                WORLD.PLAYER.hpLimits.minCap, 
                playerEntity.biology.hpMax - loss
            );

            // Cap current HP to new max if necessary
            if (playerEntity.biology.hpCurrent > playerEntity.biology.hpMax) {
                playerEntity.biology.hpCurrent = playerEntity.biology.hpMax;
            }
        }
    }

    // ========================================================================
    // 3. BIOLOGICAL RESOLUTION (STARVATION & HEALING)
    // ========================================================================
    const requiredFood = calculateMonthlyFoodRequirement(playerEntity, timeState.activeSeason);
    
    if (playerEntity.inventory.food >= requiredFood) {
        // Player meets food requirements
        playerEntity.inventory.food -= requiredFood;
        playerEntity.biology.isStarving = false;
        
        // Basic healing application (+25 HP)
        playerEntity.biology.hpCurrent = Math.min(
            playerEntity.biology.hpMax,
            playerEntity.biology.hpCurrent + 25
        );
    } else {
        // Player is starving
        playerEntity.inventory.food = 0; // Consume whatever is left
        playerEntity.biology.isStarving = true;
        
        // Apply starvation damage to player
        playerEntity.biology.hpCurrent += WORLD.PLAYER.healingRates.starving; // Value is negative (-10)
        
        if (playerEntity.biology.hpCurrent <= 0) {
            return { status: 'PERMADEATH', reason: 'Starvation', updatedPlayer: playerEntity, updatedTime: timeState };
        }

        // Apply starvation penalty to equipped mount
        if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
            playerEntity.equipment.mountItem.hpCurrent += WORLD.PLAYER.healingRates.starving;
            if (playerEntity.equipment.mountItem.hpCurrent <= 0) {
                playerEntity.equipment.mountItem.hpCurrent = 0;
                playerEntity.equipment.hasMount = false; // Mount dies
            }
        }
        
        // Optional Future Expansion: Splicing caravan animals if they starve to death
    }

    // ========================================================================
    // 4. RESOURCE REGENERATION & LOGISTICS
    // ========================================================================
    playerEntity.progression.actionPoints = WORLD.PLAYER.maxAp;

    // Recalculate encumbrance as food mass has changed (and possibly the mount died)
    recalculateEncumbrance(playerEntity);

    return { 
        status: 'SUCCESS', 
        foodConsumed: requiredFood,
        updatedPlayer: playerEntity, 
        updatedTime: timeState 
    };
};