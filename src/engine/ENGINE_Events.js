// File: Client/src/engine/ENGINE_Events.js
// Description: Core engine for processing Narrative Events (SEE & DEE), resolving choices, and mutating state.

import { DB_EVENTS } from '../data/DB_Events.js';
import { calculateEventProbability, calculateDangerLevel } from '../utils/eventProbability.js';
import { generateEventEncounter } from './ENGINE_EventSpawner.js';
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { getRandomInt } from '../utils/RandomUtils.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';

// ============================================================================
// 1. PROBABILITY & SELECTION LOGIC
// ============================================================================

export const rollForEvent = (category, playerRank, environmentData, targetType = null) => {
	const events = DB_EVENTS[category];
	if (!events || events.length === 0) return null;

	const { worldId, currentSeason, activeSeason } = environmentData;
	const season = (currentSeason || activeSeason || 'spring').toLowerCase();
	const zoneData = DB_LOCATIONS_ZONES.find((z) => z.worldId === worldId) || {};

	const validEvents = events.filter((evt) => {
		const cond = evt.conditions;
		if (!cond) return false;

		// 0. Type Filter (If targetType is specified by the Danger Check)
		if (targetType) {
			if (targetType === 'NEGATIVE' && evt.eventType !== 'NEGATIVE') return false;
			// POSITIVE and NEUTRAL are grouped together against NEGATIVE
			if (targetType === 'POSITIVE_NEUTRAL' && evt.eventType === 'NEGATIVE') return false;
		}

		// 1. Rank Check
		const requiredRank = cond.minRank || 1;
		if (playerRank < requiredRank) return false;

		// 2. Season Check
		if (cond.allowedSeasons && cond.allowedSeasons.length > 0) {
			const normalizedSeasons = cond.allowedSeasons.map((s) => s.toLowerCase());
			if (!normalizedSeasons.includes(season)) return false;
		}

		// 3. Zone Class Check
		if (cond.allowedZoneClasses && cond.allowedZoneClasses.length > 0) {
			if (!cond.allowedZoneClasses.includes(zoneData.zoneClass)) return false;
		}

		// 4. Zone Category Check
		if (cond.allowedZoneCategories && cond.allowedZoneCategories.length > 0) {
			if (!cond.allowedZoneCategories.includes(zoneData.zoneCategory)) return false;
		}

		// 5. Zone Subclass Check
		if (cond.allowedZoneSubclasses && cond.allowedZoneSubclasses.length > 0) {
			if (!cond.allowedZoneSubclasses.includes(zoneData.zoneSubclass)) return false;
		}

		// 6. Strict Node Check
		if (cond.allowedZones && cond.allowedZones.length > 0) {
			const isAllowed = cond.allowedZones.some((zone) => worldId.includes(zone));
			if (!isAllowed) return false;
		}

		return true;
	});

	if (validEvents.length === 0) return null;

	const totalWeight = validEvents.reduce((sum, evt) => sum + (evt.conditions.weight || 0), 0);
	let randomNum = Math.random() * totalWeight;

	for (const evt of validEvents) {
		const w = evt.conditions.weight || 0;
		if (randomNum < w) return evt;
		randomNum -= w;
	}

	return validEvents[validEvents.length - 1];
};

// ============================================================================
// 2. UNIVERSAL PAYLOAD APPLICATOR (Mutates State)
// ============================================================================

export const applyPayload = (playerEntity, payload) => {
	if (!payload) return { updatedPlayer: playerEntity, uiChangesArray: [] };

	const uiChangesArray = [];
	const recordChange = (label, value) => {
		if (value !== 0) uiChangesArray.push({ label, value });
	};

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

	if (payload.procGen && payload.procGen.items) {
		payload.procGen.items.forEach((req) => {
			const count = req.count || 1;
			for (let i = 0; i < count; i++) {
				const rank = req.maxTier === 'CURRENT_RANK' ? playerEntity.identity.rank : req.maxTier || 1;
				try {
					const newItem = generateItem(req.category, rank, 'LOOT');
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

	let targetEventType = null;

	// 1. Check Global Probability and Determine Danger Risk
	if (category === 'travel') {
		const probability = calculateEventProbability(worldId, currentSeason);
		const roll = Math.random() * 100;

		if (roll > probability) {
			return {
				status: 'RESOLVED_SEE',
				updatedPlayer: playerEntity,
				eventData: {
					name: 'Uneventful Journey',
					description: 'You traveled safely to your destination. The paths were quiet, and nothing out of the ordinary occurred.',
					changes: [],
				},
			};
		}

		// We are triggering an event. Now we roll to see if it's dangerous based on the zone profile.
		const dangerRisk = calculateDangerLevel(worldId, currentSeason);
		const dangerRoll = Math.random() * 100;

		targetEventType = dangerRoll <= dangerRisk ? 'NEGATIVE' : 'POSITIVE_NEUTRAL';
	}

	// 2. Select Event
	let selectedEvent = rollForEvent(category, playerRank, environmentData, targetEventType);

	// Fallback: If no event of the target type was found for this specific zone, just pick ANY valid event
	if (!selectedEvent) {
		selectedEvent = rollForEvent(category, playerRank, environmentData, null);
	}

	if (!selectedEvent) return { status: 'NO_EVENT' };

	// 3. Pre-process Encounter
	let activeEventNpc = null;
	if (selectedEvent.onEncounter && selectedEvent.onEncounter.procGen) {
		activeEventNpc = generateEventEncounter(selectedEvent.onEncounter.procGen, currentZoneEconomyLevel);
		console.log('DEBUG [Event Generator] - activeEventNpc output:', activeEventNpc);
	}

	// 4. Resolve SEE vs DEE
	if (!selectedEvent.choices) {
		const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(playerEntity, selectedEvent.staticEffects);

		if (isPermadeath) {
			return { status: 'PERMADEATH', reason: `Event_${selectedEvent.id}`, updatedPlayer };
		}

		return { status: 'RESOLVED_SEE', updatedPlayer, eventData: { ...selectedEvent, changes: uiChangesArray } };
	} else {
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
			const requiredCoins = choice.cost?.silverCoins || 0;
			const requiredFood = choice.cost?.food || 0;

			if (playerEntity.inventory.silverCoins >= requiredCoins && playerEntity.inventory.food >= requiredFood) {
				playerEntity.inventory.silverCoins -= requiredCoins;
				playerEntity.inventory.food -= requiredFood;
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
			const targetDifficulty = choice.difficultyModifier || 0;
			const npcRank = activeEventNpc?.classification?.entityRank || 1;
			const dc = 10 + (npcRank + targetDifficulty) * 5;

			const scs = playerAttrValue + getRandomInt(-5, 5 + playerRank * 2);

			isSuccess = scs >= dc;
			payloadToApply = isSuccess ? choice.onSuccess : choice.onFailure;
			break;

		case 'COMBAT':
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

	const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(playerEntity, payloadToApply);

	if (isPermadeath) {
		return { status: 'PERMADEATH', updatedPlayer };
	}

	return { status: 'CHOICE_RESOLVED', updatedPlayer, resultDescription: payloadToApply?.description || '', changes: uiChangesArray };
};
