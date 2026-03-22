// File: src/engine/ENGINE_PlayerCreation.js
// Description: Initializes a new player entity, applies character creation choices, and calculates derived starting logistics.

import { TEMPLATE_PLAYER } from '../data/TEMPLATE_Player.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';

/**
 * Generates a fresh player state object for a new game instance.
 * @param {Object} creationParams - The parameters selected by the user.
 * @param {String} creationParams.name - The chosen character name.
 * @param {Number} creationParams.age - The chosen starting age.
 * @param {String} creationParams.patronGod - The chosen Patron God.
 * @param {String} creationParams.religion - The chosen Religion.
 * @returns {Object} The fully initialized player entity.
 */
export const initializeNewPlayer = (creationParams) => {
	// 1. Deep clone the template to prevent reference mutation
	const playerEntity = JSON.parse(JSON.stringify(TEMPLATE_PLAYER));

	// 2. Apply Identity parameters
	playerEntity.identity.name = creationParams.name || playerEntity.identity.name;
	playerEntity.identity.age = creationParams.age || playerEntity.identity.age;
	playerEntity.identity.patronGod = creationParams.patronGod || 'None';
	playerEntity.identity.religion = creationParams.religion || 'None';

	// ========================================================================
	// 3. APPLY BONUSES (FUTURE IMPLEMENTATION)
	// ========================================================================
	// Architecture stub for when Patron God and Religion modifiers are defined.
	// Example logic:
	// if (playerEntity.identity.patronGod === 'Mars') {
	//     playerEntity.stats.str += 2;
	//     playerEntity.stats.ad += 5;
	// }
	// if (playerEntity.identity.religion === 'Old Ways') {
	//     playerEntity.stats.int += 1;
	// }

	// ========================================================================
	// 4. DERIVED ATTRIBUTE CALCULATION
	// ========================================================================
	// Ensure base starting variables correlate with the GameWorld constraints.
	// Recalculates maxCapacity based on the initial STR value and determines initial encumbrance (0).
	const finalizedPlayer = recalculateEncumbrance(playerEntity);

	return finalizedPlayer;
};
