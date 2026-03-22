// File: src/engine/ENGINE_Events.js
// Description: Processes random world events, calculates weighted probabilities, and applies state mutations.

import { DB_EVENTS } from '../data/DB_Events.js';

// ------------------------------------------------------------------------
// PROBABILITY & SELECTION LOGIC
// ------------------------------------------------------------------------

/**
 * Selects a random event from the specified category based on its weight.
 * @param {String} category - 'travel' or 'monthly'
 * @returns {Object|null} The selected event object, or null if category is invalid.
 */
export const rollForEvent = (category) => {
	const events = DB_EVENTS[category];
	if (!events || events.length === 0) return null;

	// Calculate the total sum of all weights in the category
	const totalWeight = events.reduce((sum, evt) => sum + evt.weight, 0);

	// Generate a random number between 0 and totalWeight
	let randomNum = Math.random() * totalWeight;

	// Subtract weights iteratively until we find the selected event
	for (const evt of events) {
		if (randomNum < evt.weight) {
			return evt;
		}
		randomNum -= evt.weight;
	}

	// Fallback in case of floating point inaccuracies
	return events[events.length - 1];
};

// ------------------------------------------------------------------------
// STATE MUTATION LOGIC
// ------------------------------------------------------------------------

/**
 * Applies the event's effects to the player entity safely and constructs the UI payload.
 * @param {Object} playerEntity - The current state of the player.
 * @param {Object} eventObj - The event object selected by rollForEvent.
 * @returns {Object} Payload containing the updated player state and the detailed event logs.
 */
export const applyEventEffects = (playerEntity, eventObj) => {
	if (!eventObj || !eventObj.effects) {
		return { status: 'SUCCESS', updatedPlayer: playerEntity, eventApplied: null };
	}

	const effects = eventObj.effects;
	const uiChangesArray = []; // Array to store visual feedback for EventView.jsx

	// Helper to log changes to the UI array
	const recordChange = (label, value) => {
		if (value !== 0) {
			uiChangesArray.push({ label, value });
		}
	};

	// 1. Apply Action Points (AP) Modification
	if (effects.apMod !== undefined && effects.apMod !== 0) {
		playerEntity.progression.actionPoints += effects.apMod;
		if (playerEntity.progression.actionPoints < 0) {
			playerEntity.progression.actionPoints = 0;
		}
		recordChange('Action Points', effects.apMod);
	}

	// 2. Apply Food Modification
	if (effects.foodMod !== undefined && effects.foodMod !== 0) {
		playerEntity.inventory.food += effects.foodMod;
		if (playerEntity.inventory.food < 0) {
			playerEntity.inventory.food = 0;
		}
		recordChange('Food Rations', effects.foodMod);
	}

	// 3. Apply Currency Modification
	if (effects.coinMod !== undefined && effects.coinMod !== 0) {
		playerEntity.inventory.silverCoins += effects.coinMod;
		if (playerEntity.inventory.silverCoins < 0) {
			playerEntity.inventory.silverCoins = 0;
		}
		recordChange('Silver Coins', effects.coinMod);
	}

	// 4. Apply Biological (HP) Modification
	if (effects.hpMod !== undefined && effects.hpMod !== 0) {
		playerEntity.biology.hpCurrent += effects.hpMod;

		// Prevent overhealing past max limit
		if (playerEntity.biology.hpCurrent > playerEntity.biology.hpMax) {
			playerEntity.biology.hpCurrent = playerEntity.biology.hpMax;
		}

		recordChange('Health Points (HP)', effects.hpMod);

		// Permadeath check if an event deals lethal damage (e.g., an ambush)
		if (playerEntity.biology.hpCurrent <= 0) {
			playerEntity.biology.hpCurrent = 0;
			return {
				status: 'PERMADEATH',
				reason: `Event_${eventObj.id}`,
				updatedPlayer: playerEntity,
				// Construct final event object for the UI before permadeath triggers
				eventApplied: { title: eventObj.name, description: eventObj.description, changes: uiChangesArray },
			};
		}
	}

	// Standard Success Return with populated changes array
	return {
		status: 'SUCCESS',
		updatedPlayer: playerEntity,
		eventApplied: { title: eventObj.name, description: eventObj.description, changes: uiChangesArray.length > 0 ? uiChangesArray : null },
	};
};

// ------------------------------------------------------------------------
// MASTER EXECUTION FUNCTION
// ------------------------------------------------------------------------

/**
 * Rolls for an event and immediately applies its effects.
 * Designed to be called by ENGINE_World_Travel or ENGINE_Time_Loop.
 * @param {Object} playerEntity - The current state of the player.
 * @param {String} category - 'travel' or 'monthly'
 * @returns {Object} Standardized execution payload.
 */
export const executeRandomEvent = (playerEntity, category) => {
	const selectedEvent = rollForEvent(category);
	return applyEventEffects(playerEntity, selectedEvent);
};
