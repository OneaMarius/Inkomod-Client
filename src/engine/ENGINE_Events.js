// File: Client/src/engine/ENGINE_Events.js
// Description: Core engine for processing Narrative Events (SEE & DEE), resolving choices, and mutating state.

import { DB_EVENTS } from '../data/DB_Events.js';
import { calculateEventProbability } from '../utils/eventProbability.js';
import { generateEventEncounter } from './ENGINE_EventSpawner.js';
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { getRandomInt } from '../utils/RandomUtils.js';

// ============================================================================
// 1. PROBABILITY & SELECTION LOGIC
// ============================================================================

export const rollForEvent = (category, playerRank, worldId) => {
	const events = DB_EVENTS[category];
	if (!events || events.length === 0) return null;

	// Filter events by conditions (minRank and allowedZones if strictly defined)
	const validEvents = events.filter((evt) => {
		if (evt.conditions.minRank && playerRank < evt.conditions.minRank) return false;
		if (evt.conditions.allowedZones && evt.conditions.allowedZones.length > 0) {
			// Check if the worldId contains the allowed zone string (e.g., 'WILD_2' includes 'WILD')
			const isAllowed = evt.conditions.allowedZones.some((zone) => worldId.includes(zone));
			if (!isAllowed) return false;
		}
		return true;
	});

	if (validEvents.length === 0) return null;

	const totalWeight = validEvents.reduce((sum, evt) => sum + evt.conditions.weight, 0);
	let randomNum = Math.random() * totalWeight;

	for (const evt of validEvents) {
		if (randomNum < evt.conditions.weight) return evt;
		randomNum -= evt.conditions.weight;
	}

	return validEvents[validEvents.length - 1];
};

// ============================================================================
// 2. UNIVERSAL PAYLOAD APPLICATOR (Mutates State)
// ============================================================================

/**
 * Universally applies a payload (staticEffects, onSuccess, or onFailure) to the player.
 * Also handles procedural generation requests inside the payload.
 */
export const applyPayload = (playerEntity, payload) => {
	if (!payload) return { updatedPlayer: playerEntity, uiChangesArray: [] };

	const uiChangesArray = [];
	const recordChange = (label, value) => {
		if (value !== 0) uiChangesArray.push({ label, value });
	};

	// --- STANDARD RESOURCES ---
	if (payload.apMod) {
		playerEntity.progression.actionPoints = Math.max(0, playerEntity.progression.actionPoints + payload.apMod);
		recordChange('Action Points', payload.apMod);
	}
	if (payload.food) {
		playerEntity.inventory.food = Math.max(0, playerEntity.inventory.food + payload.food);
		recordChange('Food Rations', payload.food);
	}
	if (payload.silverCoins) {
		playerEntity.inventory.silverCoins = Math.max(0, playerEntity.inventory.silverCoins + payload.silverCoins);
		recordChange('Silver Coins', payload.silverCoins);
	}
	if (payload.healingPotions) {
		playerEntity.inventory.healingPotions = Math.max(0, (playerEntity.inventory.healingPotions || 0) + payload.healingPotions);
		recordChange('Healing Potion', payload.healingPotions);
	}
	if (payload.honor) {
		playerEntity.progression.honor = (playerEntity.progression.honor || 0) + payload.honor;
		recordChange('Honor', payload.honor);
	}
	if (payload.renown) {
		playerEntity.progression.renown = (playerEntity.progression.renown || 0) + payload.renown;
		recordChange('Renown', payload.renown);
	}

	// --- BIOLOGY (HP) & PERMADEATH ---
	let isPermadeath = false;
	if (payload.hpMod) {
		playerEntity.biology.hpCurrent += payload.hpMod;
		if (playerEntity.biology.hpCurrent > playerEntity.biology.hpMax) {
			playerEntity.biology.hpCurrent = playerEntity.biology.hpMax;
		}
		recordChange('Health Points (HP)', payload.hpMod);

		if (playerEntity.biology.hpCurrent <= 0) {
			playerEntity.biology.hpCurrent = 0;
			isPermadeath = true;
		}
	}

	// --- PROCEDURAL GENERATION (Items/Loot) ---
	if (payload.procGen && payload.procGen.items) {
		payload.procGen.items.forEach((req) => {
			const count = req.count || 1;
			for (let i = 0; i < count; i++) {
				const rank = req.maxTier === 'CURRENT_RANK' ? playerEntity.identity.rank : req.maxTier || 1;
				try {
					const newItem = generateItem(req.category, rank, 'LOOT');
					// REPARAT: Protectie in caz ca generatorul de iteme esueaza sau returneaza null
					if (newItem) {
						playerEntity.inventory.itemSlots.push(newItem);
						uiChangesArray.push({ label: 'Looted Item', value: newItem.itemName || newItem.name || 'Unknown Item' });
					} else {
						console.warn(`Event tried to gen item category [${req.category}] but engine returned null.`);
					}
				} catch (e) {
					console.error('Failed to procGen item in event:', e);
				}
			}
		});
	}

	return { updatedPlayer: playerEntity, uiChangesArray, isPermadeath };
};

// ============================================================================
// 3. MASTER EVENT ENTRY POINT (Triggered on Travel/EndTurn)
// ============================================================================

export const executeRandomEvent = (playerEntity, category, environmentData) => {
	const { worldId, currentSeason, currentZoneEconomyLevel } = environmentData;
	const playerRank = playerEntity.identity?.rank || 1;

	// 1. Check Global Probability
	const probability = calculateEventProbability(worldId, currentSeason);
	const roll = Math.random() * 100;

	if (roll > probability) {
		return { status: 'NO_EVENT' };
	}

	// 2. Select Event
	const selectedEvent = rollForEvent(category, playerRank, worldId);
	if (!selectedEvent) return { status: 'NO_EVENT' };

	// 3. Pre-process Encounter (If applicable)
	let activeEventNpc = null;
	if (selectedEvent.onEncounter && selectedEvent.onEncounter.procGen) {
		activeEventNpc = generateEventEncounter(selectedEvent.onEncounter.procGen, currentZoneEconomyLevel);
	}

	// 4. Resolve SEE vs DEE
	if (!selectedEvent.choices) {
		// SEE (Static Event) - Resolve immediately
		const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(playerEntity, selectedEvent.staticEffects);

		if (isPermadeath) {
			return { status: 'PERMADEATH', reason: `Event_${selectedEvent.id}`, updatedPlayer };
		}

		return { status: 'RESOLVED_SEE', updatedPlayer, eventData: { ...selectedEvent, changes: uiChangesArray } };
	} else {
		// DEE (Dynamic Event) - Pause and await input
		return { status: 'AWAITING_INPUT', eventData: selectedEvent, activeEventNpc };
	}
};

// ============================================================================
// 4. CHOICE RESOLUTION ENGINE (Triggered by UI Button Click)
// ============================================================================

export const resolveEventChoice = (playerEntity, choice, activeEventNpc) => {
	const playerRank = playerEntity.identity?.rank || 1;
	let isSuccess = false;
	let payloadToApply = null;

	switch (choice.checkType) {
		case 'TRADE_OFF':
			// Verify funds (Validation should ideally happen in UI, but we enforce it here)
			const requiredCoins = choice.cost?.silverCoins || 0;
			if (playerEntity.inventory.silverCoins >= requiredCoins) {
				playerEntity.inventory.silverCoins -= requiredCoins;
				isSuccess = true;
				payloadToApply = choice.onSuccess;
			} else {
				return { status: 'FAILED_COST', updatedPlayer: playerEntity };
			}
			break;

		case 'LUCK_CHECK':
			const roll = Math.random() * 100;
			isSuccess = roll <= (choice.successChance || 50);
			payloadToApply = isSuccess ? choice.onSuccess : choice.onFailure;
			break;

		case 'SKILL_CHECK':
			const playerAttrValue = playerEntity.stats[choice.attribute] || 10;
			// Target DC scaling: Base 10 + (NPC Rank/Difficulty * 5)
			const targetDifficulty = choice.difficultyModifier || 0;
			const npcRank = activeEventNpc?.classification?.entityRank || 1;
			const dc = 10 + (npcRank + targetDifficulty) * 5;

			// Skill Check Score = Attr + RNG
			const scs = playerAttrValue + getRandomInt(-5, 5 + playerRank * 2);

			isSuccess = scs >= dc;
			payloadToApply = isSuccess ? choice.onSuccess : choice.onFailure;
			break;

		case 'COMBAT':
			// Halt event processing and hand over to Combat Engine
			return {
				status: 'TRIGGER_COMBAT',
				combatRule: choice.combatRule || 'DMF',
				targetNpc: activeEventNpc,
				onSuccessPayload: choice.onSuccess,
				onFailurePayload: choice.onFailure,
			};

		default:
			console.error(`Unknown checkType: ${choice.checkType}`);
			return { status: 'ERROR', updatedPlayer: playerEntity };
	}

	// Apply the determined payload
	const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(playerEntity, payloadToApply);

	if (isPermadeath) {
		return { status: 'PERMADEATH', updatedPlayer };
	}

	return { status: 'CHOICE_RESOLVED', updatedPlayer, resultDescription: payloadToApply?.description || '', changes: uiChangesArray };
};
