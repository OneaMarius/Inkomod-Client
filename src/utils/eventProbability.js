// File: Client/src/utils/eventProbability.js
// Description: Utility to calculate the total probability of an event triggering based on location taxonomy and seasonal multipliers.

import { WORLD } from '../data/GameWorld.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';

/**
 * Calculates the exact chance (percentage) of a random event occurring.
 * Formula: (Category + Class + Subclass) * SeasonMultiplier
 * * @param {String} worldId - The ID of the zone the player is in (e.g., 'WILD_2')
 * @param {String} currentSeason - The current season string ('spring', 'summer', 'autumn', 'winter')
 * @returns {Number} The final probability percentage (0 - 100)
 */
export const calculateEventProbability = (worldId, currentSeason = 'summer') => {
	// 1. Find the target zone in the database
	const targetZone = DB_LOCATIONS_ZONES.find((zone) => zone.worldId === worldId);

	if (!targetZone) {
		console.warn(`[Event System] worldId ${worldId} not found in DB_LOCATIONS_ZONES. Returning baseline 15%.`);
		return 15;
	}

	// 2. Extract taxonomy
	const { zoneCategory, zoneClass, zoneSubclass } = targetZone;

	// 3. Retrieve values from GameWorld constants
	const chances = WORLD.EVENTS.triggerChances;

	const catChance = chances.zoneCategory[zoneCategory] || 0;
	const classChance = chances.zoneClass[zoneClass] || chances.zoneClass.DEFAULT || 0;
	const subclassChance = chances.zoneSubclass[zoneSubclass] || chances.zoneSubclass.DEFAULT || 0;

	// Ensure season exists, fallback to summer (1.0)
	const normalizedSeason = currentSeason.toLowerCase();
	const seasonMultiplier = chances.seasonMultiplier[normalizedSeason] !== undefined ? chances.seasonMultiplier[normalizedSeason] : 1.0;

	// 4. Calculate final probability
	let rawProbability = (catChance + classChance + subclassChance) * seasonMultiplier;

	// 5. Clamp the minimum and maximum boundaries (0% to 100%)
	const finalProbability = Math.max(0, Math.min(100, rawProbability));

	return finalProbability;
};
