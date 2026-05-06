// File: src/engine/ENGINE_PlayerCreation.js
// Description: Initializes a new player entity, applies character creation choices, and calculates derived starting logistics.

import { TEMPLATE_PLAYER } from '../data/TEMPLATE_Player.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';

// ========================================================================
// 1. GOD BLESSINGS CONFIGURATION
// ========================================================================
// Define the starting bonuses for each patron god here. 
// You can easily adjust these variables without touching the logic below.
// ========================================================================
// 1. GOD BLESSINGS CONFIGURATION
// ========================================================================
const GOD_BLESSINGS = {
    'PLUTO': { 
        stats: { str: 2, agi: 1, int: 2 }, // Total: +5
        inventory: { silverCoins: 150, food: 15, tradeSilver: 5 },
        progression: { honor: 10, renown: 10 }
    },
    'MIDAS': { 
        stats: { str: -1, agi: 1, int: 5 }, // Total: +5
        inventory: { silverCoins: 750, tradeGold: 3, tradeSilver: 10 },
        progression: { honor: 0, renown: 15 } 
    },
    'THOR': { 
        stats: { str: 5, agi: 2, int: -2 }, // Total: +5
        inventory: { silverCoins: 50, food: 5, healingPotions: 1 },
        progression: { honor: 10, renown: 20 } 
    },
    'ODIN': { 
        stats: { str: 2, agi: 0, int: 3 }, // Total: +5
        inventory: { silverCoins: 100, healingPotions: 1 },
        progression: { honor: 35, renown: 35 } 
    },
    'MARS': { 
        stats: { str: 4, agi: 3, int: -2 }, // Total: +5
        inventory: { food: 5, healingPotions: 3 },
        progression: { honor: -10, renown: 30 } 
    },
    'SAGA': { 
        stats: { str: -2, agi: 2, int: 5 }, // Total: +5
        inventory: { food: 20, healingPotions: 2 },
        progression: { honor: 15, renown: 10 } 
    },
    'CRONOS': { 
        stats: { str: 3, agi: -1, int: 3 }, // Total: +5
        inventory: { food: 30, tradeSilver: 3 },
        progression: { honor: 20, renown: 0 } 
    },
    'LOKI': { 
        stats: { str: -2, agi: 5, int: 2 }, // Total: +5
        inventory: { silverCoins: 350, tradeGold: 1 },
        progression: { honor: -30, renown: 25 } 
    },
    'NONE': { 
        stats: { str: 2, agi: 2, int: 1 }, // Total: +5
        inventory: { silverCoins: 50, food: 10 },
        progression: { honor: 0, renown: 0 } 
    }
};

/**
 * Generates a fresh player state object for a new game instance.
 * @param {Object} creationParams - The parameters selected by the user.
 * @returns {Object} The fully initialized player entity.
 */
export const initializeNewPlayer = (creationParams) => {
    // 1. Deep clone the template to prevent reference mutation
    const playerEntity = JSON.parse(JSON.stringify(TEMPLATE_PLAYER));

    // Ensure the completed quests array exists
    if (!playerEntity.progression.completedQuests) {
        playerEntity.progression.completedQuests = [];
    }

    // 2. Apply Identity parameters
    playerEntity.identity.name = creationParams.name || playerEntity.identity.name;
    playerEntity.identity.age = creationParams.age || playerEntity.identity.age;
    playerEntity.identity.patronGod = creationParams.patronGod || 'None';
    playerEntity.identity.religion = creationParams.religion || 'None';

    // ========================================================================
    // 3. APPLY BONUSES (GOD BLESSINGS)
    // ========================================================================
    const selectedGod = playerEntity.identity.patronGod;
    const blessing = GOD_BLESSINGS[selectedGod];

    if (blessing) {
        // Apply Stat bonuses
        if (blessing.stats) {
            if (blessing.stats.str) playerEntity.stats.str += blessing.stats.str;
            if (blessing.stats.agi) playerEntity.stats.agi += blessing.stats.agi;
            if (blessing.stats.int) playerEntity.stats.int += blessing.stats.int;
        }

        // Apply Inventory bonuses (Coins, Food, Potions, Trade Goods)
        if (blessing.inventory) {
            if (blessing.inventory.silverCoins) playerEntity.inventory.silverCoins += blessing.inventory.silverCoins;
            if (blessing.inventory.food) playerEntity.inventory.food += blessing.inventory.food;
            if (blessing.inventory.healingPotions) playerEntity.inventory.healingPotions += blessing.inventory.healingPotions;
            if (blessing.inventory.tradeGold) playerEntity.inventory.tradeGold += blessing.inventory.tradeGold;
			if (blessing.inventory.tradeSilver) playerEntity.inventory.tradeSilver += blessing.inventory.tradeSilver;
        }

        // Apply Social Progression bonuses (Honor, Renown)
        if (blessing.progression) {
            if (blessing.progression.honor) playerEntity.progression.honor += blessing.progression.honor;
            if (blessing.progression.renown) playerEntity.progression.renown += blessing.progression.renown;
        }
    }

    // ========================================================================
    // 4. DERIVED ATTRIBUTE CALCULATION
    // ========================================================================
    // Recalculates maxCapacity based on the initial STR value and determines initial encumbrance (0).
    const finalizedPlayer = recalculateEncumbrance(playerEntity);

    return finalizedPlayer;
};