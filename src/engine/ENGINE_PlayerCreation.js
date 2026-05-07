// File: src/engine/ENGINE_PlayerCreation.js
// Description: Initializes a new player entity, applies character creation choices, and calculates derived starting logistics.

import { TEMPLATE_PLAYER } from '../data/TEMPLATE_Player.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';
// NOU: Importăm WORLD pentru a citi variabilele globale
import { WORLD } from '../data/GameWorld.js';

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

	// NOU: Citim setările direct din dicționarul global WORLD
	const blessing = WORLD.PLAYER.GOD_BLESSINGS[selectedGod];

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
