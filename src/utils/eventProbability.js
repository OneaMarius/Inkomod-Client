// File: Client/src/utils/eventProbability.js
// Description: Utility to calculate the total probability and danger level of an event triggering based on location taxonomy, economy level, and seasonal multipliers.

import { WORLD } from '../data/GameWorld.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';

/**
 * Calculates the exact chance (percentage) of a random event occurring.
 * Formula: (Category + Class + Subclass + Economy) * SeasonMultiplier
 * @param {String} worldId - The ID of the zone the player is in (e.g., 'WILD_2')
 * @param {String} activeSeason - The current season string ('spring', 'summer', 'autumn', 'winter')
 * @returns {Number} The final probability percentage (0 - 100)
 */
export const calculateEventProbability = (worldId, activeSeason = 'spring') => {
	// 1. Find the target zone in the database
	const targetZone = DB_LOCATIONS_ZONES.find((zone) => zone.worldId === worldId);

	if (!targetZone) {
		console.warn(`[Event System] worldId ${worldId} not found in DB_LOCATIONS_ZONES. Returning baseline 15%.`);
		return 15;
	}

	// 2. Extract taxonomy and economy level
	const { zoneCategory, zoneClass, zoneSubclass, zoneEconomyLevel } = targetZone;

	// 3. Retrieve values from GameWorld constants
	const chances = WORLD.EVENTS.triggerChances;

	const catChance = chances.zoneCategory[zoneCategory] || 0;
	const classChance = chances.zoneClass[zoneClass] || chances.zoneClass.DEFAULT || 0;
	const subclassChance = chances.zoneSubclass[zoneSubclass] || chances.zoneSubclass.DEFAULT || 0;

	// Extract economy chance using the numeric level. Default to level 3 (average) if undefined.
	const economyLevel = zoneEconomyLevel !== undefined ? zoneEconomyLevel : 3;
	const economyChance = chances.zoneEconomyLevel ? chances.zoneEconomyLevel[economyLevel] || 0 : 0;

	// Ensure season exists, fallback to summer (1.0)
	const normalizedSeason = activeSeason.toLowerCase();
	const seasonMultiplier = chances.seasonMultiplier[normalizedSeason] !== undefined ? chances.seasonMultiplier[normalizedSeason] : 1.0;

	// 4. Calculate final probability
	let rawProbability = (catChance + classChance + subclassChance + economyChance) * seasonMultiplier;

	// 5. Clamp the minimum and maximum boundaries (0% to 100%)
	const finalProbability = Math.max(0, Math.min(100, rawProbability));

	return finalProbability;
};

/**
 * Calculates the danger level (percentage) of an event being NEGATIVE.
 * Formula: (Category + Class + Subclass + Economy) * SeasonMultiplier
 * @param {String} worldId - The ID of the zone the player is in (e.g., 'WILD_2')
 * @param {String} activeSeason - The current season string ('spring', 'summer', 'autumn', 'winter')
 * @returns {Number} The final danger level percentage (0 - 100)
 */
export const calculateDangerLevel = (worldId, activeSeason = 'spring') => {
	const targetZone = DB_LOCATIONS_ZONES.find((zone) => zone.worldId === worldId);

	if (!targetZone) {
		return 25;
	}

	const { zoneCategory, zoneClass, zoneSubclass, zoneEconomyLevel } = targetZone;
	const danger = WORLD.EVENTS.dangerLevels;

	const catDanger = danger.zoneCategory[zoneCategory] || 0;
	const classDanger = danger.zoneClass[zoneClass] || danger.zoneClass.DEFAULT || 0;
	const subclassDanger = danger.zoneSubclass[zoneSubclass] || danger.zoneSubclass.DEFAULT || 0;

	const economyLevel = zoneEconomyLevel !== undefined ? zoneEconomyLevel : 3;
	const economyDanger = danger.zoneEconomyLevel ? danger.zoneEconomyLevel[economyLevel] || 0 : 0;

	const normalizedSeason = activeSeason.toLowerCase();
	const seasonMultiplier = danger.seasonMultiplier[normalizedSeason] !== undefined ? danger.seasonMultiplier[normalizedSeason] : 1.0;

	// --- ADAUGĂ ACESTE LINII DE DEBUG ---
	console.log(`[DEBUG Calc Danger] Zone: ${worldId} | Season: ${normalizedSeason} | EcoLevel: ${economyLevel}`);
	console.log(
		`[DEBUG Calc Danger] Valorile -> Cat: ${catDanger}, Class: ${classDanger}, Sub: ${subclassDanger}, Eco: ${economyDanger}, Multiplier: ${seasonMultiplier}`,
	);
	// ------------------------------------

	let rawDanger = (catDanger + classDanger + subclassDanger + economyDanger) * seasonMultiplier;
	return Math.max(0, Math.min(100, rawDanger));
};
