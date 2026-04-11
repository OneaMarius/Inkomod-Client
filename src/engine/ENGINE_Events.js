// File: Client/src/engine/ENGINE_Events.js
// Description: Core engine for processing Narrative Events (SEE & DEE), resolving choices, and mutating state.

import { DB_EVENTS } from '../data/DB_Events.js';
import {
	calculateEventProbability,
	calculateDangerLevel,
} from '../utils/eventProbability.js';
import { generateEventEncounter } from './ENGINE_EventSpawner.js';
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { generateLootItem } from './ENGINE_LootCreation.js';
import { getRandomInt } from '../utils/RandomUtils.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
import { calculateDynamicValue } from '../utils/RewardCalculator.js';
import { WORLD } from '../data/GameWorld.js';

// ============================================================================
// 1. PROBABILITY & SELECTION LOGIC
// ============================================================================

export const rollForEvent = (
	triggerContext,
	playerRank,
	environmentData,
	targetType = null,
) => {
	// 1. Use the flat master array
	const events = DB_EVENTS.events;
	if (!events || events.length === 0) return null;

	const { worldId, currentSeason, activeSeason } = environmentData;
	const season = (currentSeason || activeSeason || 'spring').toLowerCase();
	const zoneData = DB_LOCATIONS_ZONES.find((z) => z.worldId === worldId) || {};

	const validEvents = events.filter((evt) => {
		const cond = evt.conditions;
		if (!cond) return false;

		// 0. TRIGGER CONTEXT FILTER (Core routing logic)
		if (
			!cond.allowedTriggers ||
			!cond.allowedTriggers.includes(triggerContext)
		)
			return false;

		// 1. Type Filter (Danger Check)
		if (targetType) {
			if (targetType === 'NEGATIVE' && evt.eventType !== 'NEGATIVE')
				return false;
			if (targetType === 'POSITIVE_NEUTRAL' && evt.eventType === 'NEGATIVE')
				return false;
		}

		// 2. Rank Check
		const requiredRank = cond.minRank || 1;
		if (playerRank < requiredRank) return false;

		// 3. Season Check
		if (cond.allowedSeasons && cond.allowedSeasons.length > 0) {
			const normalizedSeasons = cond.allowedSeasons.map((s) =>
				s.toLowerCase(),
			);
			if (!normalizedSeasons.includes(season)) return false;
		}

		// 4. Zone Checks
		if (cond.allowedZoneClasses && cond.allowedZoneClasses.length > 0) {
			if (!cond.allowedZoneClasses.includes(zoneData.zoneClass))
				return false;
		}
		if (cond.allowedZoneCategories && cond.allowedZoneCategories.length > 0) {
			if (!cond.allowedZoneCategories.includes(zoneData.zoneCategory))
				return false;
		}
		if (cond.allowedZoneSubclasses && cond.allowedZoneSubclasses.length > 0) {
			if (!cond.allowedZoneSubclasses.includes(zoneData.zoneSubclass))
				return false;
		}
		if (cond.allowedZones && cond.allowedZones.length > 0) {
			const isAllowed = cond.allowedZones.some((zone) =>
				worldId.includes(zone),
			);
			if (!isAllowed) return false;
		}

		return true;
	});

	if (validEvents.length === 0) return null;

	const totalWeight = validEvents.reduce(
		(sum, evt) => sum + (evt.conditions.weight || 0),
		0,
	);
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

	// Helper for Auto-Discard
	const enforceCapacityLimit = (arrayRef, limit, assetType) => {
		if (arrayRef.length > limit) {
			let lowestIndex = 0;

			// Find the lowest value item to discard
			for (let i = 1; i < arrayRef.length; i++) {
				const current = arrayRef[i];
				const lowest = arrayRef[lowestIndex];

				let currentVal = 0;
				let lowestVal = 0;

				if (assetType === 'equipment') {
					currentVal =
						(current.classification?.itemTier || 1) * 10 +
						(current.classification?.itemQuality || 1);
					lowestVal =
						(lowest.classification?.itemTier || 1) * 10 +
						(lowest.classification?.itemQuality || 1);
				} else if (assetType === 'animal') {
					currentVal = current.classification?.entityRank || 1;
					lowestVal = lowest.classification?.entityRank || 1;
				} else if (assetType === 'loot') {
					currentVal = current.economy?.baseCoinValue || 0;
					lowestVal = lowest.economy?.baseCoinValue || 0;
				}

				if (currentVal < lowestVal) {
					lowestIndex = i;
				}
			}

			// Remove the item and record it for the UI
			const discardedItem = arrayRef.splice(lowestIndex, 1)[0];
			const name =
				discardedItem.itemName ||
				discardedItem.entityName ||
				'Unknown Item';
			recordChange('Discarded (Inventory Full)', name);
		}
	};

	// --- INTERCEPT AND PARSE PAYLOAD ---
	const resolvedApMod = calculateDynamicValue('apMod', payload.apMod);
	const resolvedFood = calculateDynamicValue('food', payload.food);
	const resolvedSilverCoins = calculateDynamicValue(
		'silverCoins',
		payload.silverCoins,
	);
	const resolvedHealingPotions = calculateDynamicValue(
		'healingPotions',
		payload.healingPotions,
	);
	const resolvedHonor = calculateDynamicValue('honor', payload.honor);
	const resolvedRenown = calculateDynamicValue('renown', payload.renown);
	const resolvedHpMod = calculateDynamicValue('hpMod', payload.hpMod);

	const resolvedTradeSilver = calculateDynamicValue(
		'tradeSilver',
		payload.tradeSilver,
	);
	const resolvedTradeGold = calculateDynamicValue(
		'tradeGold',
		payload.tradeGold,
	);
	const resolvedStr = calculateDynamicValue('str', payload.str);
	const resolvedAgi = calculateDynamicValue('agi', payload.agi);
	const resolvedInt = calculateDynamicValue('int', payload.int);

	// Apply limits
	if (resolvedApMod !== 0) {
		const newAp = playerEntity.progression.actionPoints + resolvedApMod;
		// Limit max AP to 16 (8 Standard + 8 Overcharge)
		playerEntity.progression.actionPoints = Math.max(0, Math.min(16, newAp));
		recordChange('Action Points', resolvedApMod);
	}
	if (resolvedFood !== 0) {
		playerEntity.inventory.food = Math.max(
			0,
			playerEntity.inventory.food + resolvedFood,
		);
		recordChange('Food Rations', resolvedFood);
	}
	if (resolvedSilverCoins !== 0) {
		playerEntity.inventory.silverCoins = Math.max(
			0,
			playerEntity.inventory.silverCoins + resolvedSilverCoins,
		);
		recordChange('Silver Coins', resolvedSilverCoins);
	}
	if (resolvedHealingPotions !== 0) {
		const previousPotions = playerEntity.inventory.healingPotions || 0;
		const maxPotions = WORLD.PLAYER.inventoryLimits.maxHealingPotions || 25;

		let calculatedPotions = previousPotions + resolvedHealingPotions;

		// Aplicăm limita inferioară (0) și superioară (25)
		calculatedPotions = Math.max(0, Math.min(maxPotions, calculatedPotions));

		playerEntity.inventory.healingPotions = calculatedPotions;

		// Calculăm câte poțiuni au fost adăugate sau scăzute efectiv
		const actualPotionsChange = calculatedPotions - previousPotions;

		if (actualPotionsChange !== 0) {
			recordChange('Healing Potion', actualPotionsChange);
		}
		// Dacă aveam deja 25 și eventul a dat +2, anunțăm că s-au pierdut
		else if (resolvedHealingPotions > 0 && previousPotions === maxPotions) {
			recordChange('Discarded (Potions Full)', resolvedHealingPotions);
		}
	}
	if (resolvedHonor !== 0) {
		playerEntity.progression.honor = Math.max(
			-100,
			Math.min(100, (playerEntity.progression.honor || 0) + resolvedHonor),
		);
		recordChange('Honor', resolvedHonor);
	}
	if (resolvedRenown !== 0) {
		playerEntity.progression.renown = Math.max(
			0,
			Math.min(500, (playerEntity.progression.renown || 0) + resolvedRenown),
		);
		recordChange('Renown', resolvedRenown);
	}

	if (resolvedTradeSilver !== 0) {
		playerEntity.inventory.tradeSilver = Math.max(
			0,
			(playerEntity.inventory.tradeSilver || 0) + resolvedTradeSilver,
		);
		recordChange('Trade Silver', resolvedTradeSilver);
	}
	if (resolvedTradeGold !== 0) {
		playerEntity.inventory.tradeGold = Math.max(
			0,
			(playerEntity.inventory.tradeGold || 0) + resolvedTradeGold,
		);
		recordChange('Trade Gold', resolvedTradeGold);
	}

	if (resolvedStr !== 0) {
		playerEntity.stats.str = Math.max(
			1,
			Math.min(50, (playerEntity.stats.str || 10) + resolvedStr),
		);
		recordChange('Strength', resolvedStr);
	}
	if (resolvedAgi !== 0) {
		playerEntity.stats.agi = Math.max(
			1,
			Math.min(50, (playerEntity.stats.agi || 10) + resolvedAgi),
		);
		recordChange('Agility', resolvedAgi);
	}
	if (resolvedInt !== 0) {
		playerEntity.stats.int = Math.max(
			1,
			Math.min(50, (playerEntity.stats.int || 10) + resolvedInt),
		);
		recordChange('Intelligence', resolvedInt);
	}

	let isPermadeath = false;

	if (resolvedHpMod !== 0) {
		const previousHp = playerEntity.biology.hpCurrent;
		let calculatedHp = previousHp + resolvedHpMod;

		if (calculatedHp < 1) calculatedHp = 1;
		if (calculatedHp > playerEntity.biology.hpMax)
			calculatedHp = playerEntity.biology.hpMax;

		playerEntity.biology.hpCurrent = calculatedHp;

		const actualHpChange = calculatedHp - previousHp;
		if (actualHpChange !== 0) {
			recordChange('Health Points (HP)', actualHpChange);
		}
	}

	// Process procedural generation items
	if (payload.procGen && payload.procGen.items) {
		const limits = WORLD.PLAYER.inventoryLimits;

		payload.procGen.items.forEach((req) => {
			const count = req.count || 1;

			for (let i = 0; i < count; i++) {
				const rankModifier = req.rankModifier || req.tierModifier || 0;
				const baseRank = playerEntity.identity.rank || 1;
				const targetRank = Math.max(
					1,
					Math.min(5, baseRank + rankModifier),
				);

				try {
					let newItem = null;

					if (req.category === 'Physical') {
						newItem = generateItem(req.itemClass, targetRank, 'LOOT');
						if (newItem) {
							playerEntity.inventory.itemSlots.push(newItem);
							enforceCapacityLimit(
								playerEntity.inventory.itemSlots,
								limits.itemSlots,
								'equipment',
							);
						}
					} else if (req.category === 'Animal') {
						if (req.entityClass === 'Mount') {
							newItem = generateHorseMount(targetRank);
						} else {
							newItem = generateAnimalNPC(
								req.entityClass,
								req.subclassKey || null,
								targetRank,
							);
						}
						if (newItem) {
							playerEntity.inventory.animalSlots.push(newItem);
							enforceCapacityLimit(
								playerEntity.inventory.animalSlots,
								limits.animalSlots,
								'animal',
							);
						}
					} else if (req.category === 'Loot') {
						// NOU: Trimitem categoria entității (ex: 'Animal', 'Human') către generator, dacă există în event
						newItem = generateLootItem(req.entityCategory);

						if (newItem) {
							playerEntity.inventory.lootSlots.push(newItem);
							enforceCapacityLimit(
								playerEntity.inventory.lootSlots,
								limits.lootSlots,
								'loot',
							);
						}
					}

					if (newItem) {
						const displayName =
							newItem.itemName || newItem.entityName || 'Unknown Item';
						uiChangesArray.push({
							label: 'Acquired',
							value: displayName,
						});
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

export const executeRandomEvent = (
	playerEntity,
	triggerContext,
	environmentData,
) => {
	const { worldId, currentSeason, currentZoneEconomyLevel } = environmentData;
	const playerRank = playerEntity.identity?.rank || 1;

	let targetEventType = null;

	// Apply Danger Check for Travel and Explore
	if (triggerContext === 'travel' || triggerContext === 'explore') {
		const probability = calculateEventProbability(worldId, currentSeason);

		// If traveling, preserve the chance for an 'Uneventful Journey'
		if (triggerContext === 'travel') {
			const roll = Math.random() * 100;
			if (roll > probability) {
				return {
					status: 'RESOLVED_SEE',
					updatedPlayer: playerEntity,
					eventData: {
						name: 'Uneventful Journey',
						description:
							'You traveled safely to your destination. The paths were quiet.',
						changes: [],
					},
				};
			}
		}

		const dangerRisk = calculateDangerLevel(worldId, currentSeason);
		const dangerRoll = Math.random() * 100;
		targetEventType =
			dangerRoll <= dangerRisk ? 'NEGATIVE' : 'POSITIVE_NEUTRAL';
	}

	let selectedEvent = rollForEvent(
		triggerContext,
		playerRank,
		environmentData,
		targetEventType,
	);

	if (!selectedEvent) {
		selectedEvent = rollForEvent(
			triggerContext,
			playerRank,
			environmentData,
			null,
		);
	}

	if (!selectedEvent) return { status: 'NO_EVENT' };

	let activeEventNpc = null;
	if (selectedEvent.onEncounter && selectedEvent.onEncounter.procGen) {
		activeEventNpc = generateEventEncounter(
			selectedEvent.onEncounter.procGen,
			currentZoneEconomyLevel,
		);
	}

	if (!selectedEvent.choices) {
		// --- NEW LOGIC: Merge staticEffects and procGen into a unified payload ---
		const combinedPayload = {
			...(selectedEvent.staticEffects || {}),
			procGen: selectedEvent.procGen || null,
		};

		// Pass the combined payload so the engine processes both numeric changes and physical items
		const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(
			playerEntity,
			combinedPayload,
		);

		if (isPermadeath) {
			return {
				status: 'PERMADEATH',
				reason: `Event_${selectedEvent.id}`,
				updatedPlayer,
			};
		}

		return {
			status: 'RESOLVED_SEE',
			updatedPlayer,
			eventData: { ...selectedEvent, changes: uiChangesArray },
		};
	} else {
		return {
			status: 'AWAITING_INPUT',
			eventData: selectedEvent,
			activeEventNpc,
		};
	}
};

// ============================================================================
// 4. CHOICE RESOLUTION ENGINE (Triggered by UI Button Click)
// ============================================================================

export const resolveEventChoice = (playerEntity, choice, activeEventNpc) => {
	const playerRank = playerEntity.identity?.rank || 1;
	let isSuccess = false;
	let payloadToApply = null;
	let rollDetails = null;

	switch (choice.checkType) {
		case 'TRADE_OFF':
			const requiredCoins = choice.cost?.silverCoins || 0;
			const requiredFood = choice.cost?.food || 0;

			if (
				playerEntity.inventory.silverCoins >= requiredCoins &&
				playerEntity.inventory.food >= requiredFood
			) {
				playerEntity.inventory.silverCoins -= requiredCoins;
				playerEntity.inventory.food -= requiredFood;
				isSuccess = true;
				payloadToApply = choice.onSuccess;
			} else {
				return { status: 'FAILED_COST', updatedPlayer: playerEntity };
			}
			break;

		case 'LUCK_CHECK':
			const luckRoll = Math.floor(Math.random() * 100);
			const targetChance = choice.successChance || 50;
			isSuccess = luckRoll <= targetChance;
			payloadToApply = isSuccess ? choice.onSuccess : choice.onFailure;

			rollDetails = {
				type: 'LUCK_CHECK',
				roll: luckRoll,
				target: targetChance,
				isSuccess: isSuccess,
			};
			break;

		case 'SKILL_CHECK':
			const playerAttrValue = playerEntity.stats[choice.attribute] || 10;
			const targetDifficulty = choice.difficultyModifier || 0;
			const npcRank = activeEventNpc?.classification?.entityRank || 1;
			const dc = 10 + (npcRank + targetDifficulty) * 5;

			const randomRoll = getRandomInt(-5, 5 + playerRank * 2);
			const scs = playerAttrValue + randomRoll;

			isSuccess = scs >= dc;
			payloadToApply = isSuccess ? choice.onSuccess : choice.onFailure;

			rollDetails = {
				type: 'SKILL_CHECK',
				attribute: choice.attribute.toUpperCase(),
				base: playerAttrValue,
				roll: randomRoll,
				total: scs,
				target: dc,
				isSuccess: isSuccess,
			};
			break;

		case 'COMBAT':
			return {
				status: 'TRIGGER_COMBAT',
				combatRule: choice.combatRule || 'DMF',
				targetNpc: activeEventNpc,
				onSuccessPayload: choice.onSuccess,
				onFailurePayload: choice.onFailure,
			};

		case 'GENERAL':
			isSuccess = true;
			payloadToApply = choice.onSuccess;
			break;

		default:
			console.error(`Unknown checkType: ${choice.checkType}`);
			return { status: 'ERROR', updatedPlayer: playerEntity };
	}

	const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(
		playerEntity,
		payloadToApply,
	);

	if (isPermadeath) {
		return { status: 'PERMADEATH', updatedPlayer };
	}

	return {
		status: 'CHOICE_RESOLVED',
		updatedPlayer,
		resultDescription: payloadToApply?.description || '',
		changes: uiChangesArray,
		rollDetails,
	};
};
