// File: Client/src/engine/ENGINE_Events.js
// Description: Core engine for processing Narrative Events (SEE & DEE), resolving choices, and mutating state.

import { DB_EVENTS } from '../data/DB_Events.js';
import { calculateEventProbability, calculateDangerLevel } from '../utils/eventProbability.js';
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

export const rollForEvent = (triggerContext, playerRank, environmentData, targetType = null) => {
	// 1. Use the flat master array
	const events = DB_EVENTS.events;
	if (!events || events.length === 0) return null;

	const { worldId, activeSeason } = environmentData;
	const season = (activeSeason || 'spring').toLowerCase();
	const zoneData = DB_LOCATIONS_ZONES.find((z) => z.worldId === worldId) || {};

	const validEvents = events.filter((evt) => {
		const cond = evt.conditions;
		if (!cond) return false;

		// 0. TRIGGER CONTEXT FILTER (Core routing logic)
		if (!cond.allowedTriggers || !cond.allowedTriggers.includes(triggerContext)) return false;

		// 1. Type Filter (Danger Check)
		if (targetType) {
			if (targetType === 'NEGATIVE' && evt.eventType !== 'NEGATIVE') return false;
			if (targetType === 'POSITIVE_NEUTRAL' && evt.eventType === 'NEGATIVE') return false;
		}

		// 2. Rank Check
		const requiredRank = cond.minRank || 1;
		if (playerRank < requiredRank) return false;

		// 3. Season Check
		if (cond.allowedSeasons && cond.allowedSeasons.length > 0) {
			const normalizedSeasons = cond.allowedSeasons.map((s) => s.toLowerCase());
			if (!normalizedSeasons.includes(season)) return false;
		}

		// 4. Zone Checks
		if (cond.allowedZoneClasses && cond.allowedZoneClasses.length > 0) {
			if (!cond.allowedZoneClasses.includes(zoneData.zoneClass)) return false;
		}
		if (cond.allowedZoneCategories && cond.allowedZoneCategories.length > 0) {
			if (!cond.allowedZoneCategories.includes(zoneData.zoneCategory)) return false;
		}
		if (cond.allowedZoneSubclasses && cond.allowedZoneSubclasses.length > 0) {
			if (!cond.allowedZoneSubclasses.includes(zoneData.zoneSubclass)) return false;
		}
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

// UPDATE: Added activeEventNpc and environmentData to parameters for dynamic yields
export const applyPayload = (playerEntity, payload, activeEventNpc = null, environmentData = {}) => {
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
					currentVal = (current.classification?.itemTier || 1) * 10 + (current.classification?.itemQuality || 1);
					lowestVal = (lowest.classification?.itemTier || 1) * 10 + (lowest.classification?.itemQuality || 1);
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
			const name = discardedItem.itemName || discardedItem.entityName || 'Unknown Item';
			recordChange('Discarded (Inventory Full)', name);
		}
	};

	// --- INTERCEPT AND PARSE PAYLOAD ---
	const resolvedApMod = calculateDynamicValue('apMod', payload.apMod);
	const resolvedSilverCoins = calculateDynamicValue('silverCoins', payload.silverCoins);
	const resolvedHealingPotions = calculateDynamicValue('healingPotions', payload.healingPotions);
	const resolvedHonor = calculateDynamicValue('honor', payload.honor);
	const resolvedRenown = calculateDynamicValue('renown', payload.renown);
	const resolvedHpMod = calculateDynamicValue('hpMod', payload.hpMod);

	const resolvedTradeSilver = calculateDynamicValue('tradeSilver', payload.tradeSilver);
	const resolvedTradeGold = calculateDynamicValue('tradeGold', payload.tradeGold);
	const resolvedStr = calculateDynamicValue('str', payload.str);
	const resolvedAgi = calculateDynamicValue('agi', payload.agi);
	const resolvedInt = calculateDynamicValue('int', payload.int);

	// UPDATE: DYNAMIC FOOD YIELD LOGIC
	let resolvedFood = calculateDynamicValue('food', payload.food);

	if (payload.food && payload.food.type === 'DYNAMIC_YIELD' && activeEventNpc && activeEventNpc.logistics?.foodYield) {
		const baseFood = activeEventNpc.logistics.foodYield;
		const season = (environmentData.activeSeason || 'summer').toLowerCase();
		// Extract seasonal multiplier, default to 1.0
		const seasonFoodMult = WORLD.TIME?.seasons?.[season]?.huntAnimalFoodCapacityMult || 1.0;

		resolvedFood = Math.floor(baseFood * seasonFoodMult);
	}

	// Apply limits and calculate actual changes
	if (resolvedApMod !== 0) {
		const previousAp = playerEntity.progression.actionPoints;
		playerEntity.progression.actionPoints = Math.max(0, Math.min(16, previousAp + resolvedApMod));
		const actualApChange = playerEntity.progression.actionPoints - previousAp;
		if (actualApChange !== 0) recordChange('Action Points', actualApChange);
	}

	if (resolvedFood !== 0) {
		const previous = playerEntity.inventory.food || 0;
		playerEntity.inventory.food = Math.max(0, previous + resolvedFood);
		const actualChange = playerEntity.inventory.food - previous;

		if (actualChange !== 0) recordChange('Food Rations', actualChange);
		else if (resolvedFood < 0 && previous === 0) uiChangesArray.push({ label: 'Spared', value: 'No Food to lose' });
	}

	if (resolvedSilverCoins !== 0) {
		const previous = playerEntity.inventory.silverCoins || 0;
		playerEntity.inventory.silverCoins = Math.max(0, previous + resolvedSilverCoins);
		const actualChange = playerEntity.inventory.silverCoins - previous;

		if (actualChange !== 0) recordChange('Silver Coins', actualChange);
		else if (resolvedSilverCoins < 0 && previous === 0) uiChangesArray.push({ label: 'Spared', value: 'No Coins to lose' });
	}

	if (resolvedTradeSilver !== 0) {
		const previous = playerEntity.inventory.tradeSilver || 0;
		playerEntity.inventory.tradeSilver = Math.max(0, previous + resolvedTradeSilver);
		const actualChange = playerEntity.inventory.tradeSilver - previous;

		if (actualChange !== 0) recordChange('Trade Silver', actualChange);
		else if (resolvedTradeSilver < 0 && previous === 0) uiChangesArray.push({ label: 'Spared', value: 'No Trade Silver to lose' });
	}

	if (resolvedTradeGold !== 0) {
		const previous = playerEntity.inventory.tradeGold || 0;
		playerEntity.inventory.tradeGold = Math.max(0, previous + resolvedTradeGold);
		const actualChange = playerEntity.inventory.tradeGold - previous;

		if (actualChange !== 0) recordChange('Trade Gold', actualChange);
		else if (resolvedTradeGold < 0 && previous === 0) uiChangesArray.push({ label: 'Spared', value: 'No Trade Gold to lose' });
	}

	if (resolvedHealingPotions !== 0) {
		const previousPotions = playerEntity.inventory.healingPotions || 0;
		const maxPotions = WORLD.PLAYER.inventoryLimits.maxHealingPotions || 25;
		let calculatedPotions = previousPotions + resolvedHealingPotions;
		calculatedPotions = Math.max(0, Math.min(maxPotions, calculatedPotions));
		playerEntity.inventory.healingPotions = calculatedPotions;

		const actualPotionsChange = calculatedPotions - previousPotions;

		if (actualPotionsChange !== 0) {
			recordChange('Healing Potion', actualPotionsChange);
		} else if (resolvedHealingPotions > 0 && previousPotions === maxPotions) {
			recordChange('Discarded (Potions Full)', resolvedHealingPotions);
		} else if (resolvedHealingPotions < 0 && previousPotions === 0) {
			uiChangesArray.push({ label: 'Spared', value: 'No Potions to lose' });
		}
	}

	if (payload.renown) {
		const resolvedRenown = calculateDynamicValue('renown', payload.renown);

		if (resolvedRenown !== 0) {
			const previous = playerEntity.progression.renown || 0;
			// Aici se aplică matematica (scăderea sau adunarea) o singură dată
			playerEntity.progression.renown = Math.max(0, Math.min(500, previous + resolvedRenown));

			const actualChange = playerEntity.progression.renown - previous;

			// Aici se trimite textul către UI o singură dată
			if (actualChange !== 0) {
				recordChange('Renown', actualChange);
			}
		}
	}

	if (resolvedStr !== 0) {
		const previous = playerEntity.stats.str || 10;
		playerEntity.stats.str = Math.max(1, Math.min(50, previous + resolvedStr));
		const actualChange = playerEntity.stats.str - previous;
		if (actualChange !== 0) recordChange('Strength', actualChange);
	}

	if (resolvedAgi !== 0) {
		const previous = playerEntity.stats.agi || 10;
		playerEntity.stats.agi = Math.max(1, Math.min(50, previous + resolvedAgi));
		const actualChange = playerEntity.stats.agi - previous;
		if (actualChange !== 0) recordChange('Agility', actualChange);
	}

	if (resolvedInt !== 0) {
		const previous = playerEntity.stats.int || 10;
		playerEntity.stats.int = Math.max(1, Math.min(50, previous + resolvedInt));
		const actualChange = playerEntity.stats.int - previous;
		if (actualChange !== 0) recordChange('Intelligence', actualChange);
	}

	let isPermadeath = false;

	if (resolvedHpMod !== 0) {
		const previousHp = playerEntity.biology.hpCurrent;
		let calculatedHp = previousHp + resolvedHpMod;

		if (calculatedHp < 1) calculatedHp = 1;
		if (calculatedHp > playerEntity.biology.hpMax) calculatedHp = playerEntity.biology.hpMax;

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
				const targetRank = Math.max(1, Math.min(5, baseRank + rankModifier));

				try {
					let newItem = null;

					if (req.category === 'Physical') {
						newItem = generateItem(req.itemClass, targetRank, 'LOOT');
						if (newItem) {
							playerEntity.inventory.itemSlots.push(newItem);
							enforceCapacityLimit(playerEntity.inventory.itemSlots, limits.itemSlots, 'equipment');
						}
					} else if (req.category === 'Animal') {
						if (req.entityClass === 'Mount') {
							newItem = generateHorseMount(targetRank);
						} else {
							newItem = generateAnimalNPC(req.entityClass, req.subclassKey || null, targetRank);
						}
						if (newItem) {
							playerEntity.inventory.animalSlots.push(newItem);
							enforceCapacityLimit(playerEntity.inventory.animalSlots, limits.animalSlots, 'animal');
						}
					} else if (req.category === 'Loot') {
						newItem = generateLootItem(req.entityCategory);

						if (newItem) {
							playerEntity.inventory.lootSlots.push(newItem);
							enforceCapacityLimit(playerEntity.inventory.lootSlots, limits.lootSlots, 'loot');
						}
					}

					if (newItem) {
						const displayName = newItem.itemName || newItem.entityName || 'Unknown Item';
						uiChangesArray.push({ label: 'Acquired', value: displayName });
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

export const executeRandomEvent = (playerEntity, triggerContext, environmentData) => {
	const { worldId, activeSeason, currentZoneEconomyLevel } = environmentData;
	const playerRank = playerEntity.identity?.rank || 1;

	let targetEventType = null;

	// Apply Danger Check for Travel and Explore
	if (triggerContext === 'travel' || triggerContext === 'explore') {
		const probability = calculateEventProbability(worldId, activeSeason);

		// If traveling, preserve the chance for an 'Uneventful Journey'
		if (triggerContext === 'travel') {
			const roll = Math.random() * 100;
			if (roll > probability) {
				return {
					status: 'RESOLVED_SEE',
					updatedPlayer: playerEntity,
					eventData: { name: 'Uneventful Journey', description: 'You traveled safely to your destination. The paths were quiet.', changes: [] },
				};
			}
		}

		const dangerRisk = calculateDangerLevel(worldId, activeSeason);
		const dangerRoll = Math.random() * 100;
		targetEventType = dangerRoll <= dangerRisk ? 'NEGATIVE' : 'POSITIVE_NEUTRAL';
	}

	let selectedEvent = rollForEvent(triggerContext, playerRank, environmentData, targetEventType);

	if (!selectedEvent) {
		selectedEvent = rollForEvent(triggerContext, playerRank, environmentData, null);
	}

	if (!selectedEvent) return { status: 'NO_EVENT' };

	let activeEventNpc = null;
	if (selectedEvent.onEncounter && selectedEvent.onEncounter.procGen) {
		activeEventNpc = generateEventEncounter(selectedEvent.onEncounter.procGen, currentZoneEconomyLevel);
	}

	if (!selectedEvent.choices) {
		// --- NEW LOGIC: Merge staticEffects and procGen into a unified payload ---
		const combinedPayload = { ...(selectedEvent.staticEffects || {}), procGen: selectedEvent.procGen || null };

		// UPDATE: Pass activeEventNpc and environmentData for potential dynamic calculations
		const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(playerEntity, combinedPayload, activeEventNpc, environmentData);

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

// UPDATE: Added environmentData parameter
export const resolveEventChoice = (playerEntity, choice, activeEventNpc, environmentData = {}) => {
	const playerRank = playerEntity.identity?.rank || 1;
	let isSuccess = false;
	let payloadToApply = null;
	let rollDetails = null;

	if (choice.action === 'ANIMAL_KEEP') {
		const limits = WORLD.PLAYER?.inventoryLimits || { animalSlots: 10 };

		if (playerEntity.inventory.animalSlots.length < limits.animalSlots) {
			const capturedAnimal = { ...activeEventNpc, entityId: `captured_${Date.now()}_${Math.random()}` };
			playerEntity.inventory.animalSlots.push(capturedAnimal);

			return {
				status: 'CHOICE_RESOLVED',
				updatedPlayer: playerEntity,
				resultDescription: `You have successfully added the ${activeEventNpc.entityName || 'animal'} to your caravan.`,
				changes: [{ label: 'Acquired', value: `1 ${activeEventNpc.entityName || 'Animal'}` }],
			};
		} else {
			return {
				status: 'CHOICE_RESOLVED',
				updatedPlayer: playerEntity,
				resultDescription: `Your caravan is at maximum capacity. You had to release the animal.`,
				changes: [],
			};
		}
	}

	if (choice.action === 'ANIMAL_SLAUGHTER') {
		const mass = activeEventNpc.logistics?.entityMass || 50;
		const meatYield = Math.floor(mass / 5) || 1;

		playerEntity.inventory.food = (playerEntity.inventory.food || 0) + meatYield;

		return {
			status: 'CHOICE_RESOLVED',
			updatedPlayer: playerEntity,
			resultDescription: `The butchering process yielded a substantial amount of meat.`,
			changes: [{ label: 'Acquired', value: `${meatYield} Food` }],
		};
	}

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
			const luckRoll = Math.floor(Math.random() * 100);
			const targetChance = choice.successChance || 50;
			isSuccess = luckRoll <= targetChance;
			payloadToApply = isSuccess ? choice.onSuccess : choice.onFailure;

			rollDetails = { type: 'LUCK_CHECK', roll: luckRoll, target: targetChance, isSuccess: isSuccess };
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
		case 'STANDARD_INTERACTION':
			return { status: 'EXIT_TO_INTERACTION', targetNpc: activeEventNpc };
		case 'GENERAL':
			isSuccess = true;
			payloadToApply = choice.onSuccess;
			break;

		default:
			console.error(`Unknown checkType: ${choice.checkType}`);
			return { status: 'ERROR', updatedPlayer: playerEntity };
	}

	// UPDATE: Pass activeEventNpc and environmentData down to applyPayload
	const { updatedPlayer, uiChangesArray, isPermadeath } = applyPayload(playerEntity, payloadToApply, activeEventNpc, environmentData);

	if (isPermadeath) {
		return { status: 'PERMADEATH', updatedPlayer };
	}

	// NEW: Intercept Victory Flag
	if (payloadToApply && payloadToApply.triggerVictory) {
		return { status: 'VICTORY', reason: payloadToApply.triggerVictory, updatedPlayer };
	}

	return { status: 'CHOICE_RESOLVED', updatedPlayer, resultDescription: payloadToApply?.description || '', changes: uiChangesArray, rollDetails };
};
