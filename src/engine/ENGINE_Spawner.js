// File: Client/src/engine/ENGINE_Spawner.js
// Description: Unified Generator for all NPC entities (Humans, Animals, Monsters, Nephilims).

import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../data/DB_Locations_POIS.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
import { DB_NPC_HUMANS } from '../data/DB_NPC_Humans.js';
import { generateHumanNPC } from './ENGINE_HumanCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';
import { generateMonsterNPC } from './ENGINE_MonsterCreation.js';
import { generateNephilimNPC } from './ENGINE_NephilimCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { formatEntityForCombat } from '../utils/EntityFormatter.js';
import { getRandomElement } from '../utils/RandomUtils.js';

/**
 * Generates the entire list of active entities for a given Point of Interest (POI).
 */
/**
 * Generates the entire list of active entities for a given Point of Interest (POI).
 */
export const populatePOI = (poiId, poiCategory = 'CIVILIZED', currentWorldId, playerRank = 1) => {
	const db = poiCategory === 'CIVILIZED' ? DB_LOCATIONS_POIS_Civilized : DB_LOCATIONS_POIS_Untamed;
	const poiData = db[poiId];

	if (!poiData) {
		console.error(`[CRITICAL ERROR] POI with ID [${poiId}] not found in database!`);
		return [];
	}

	if (!poiData.spawns) {
		console.error(`[CRITICAL ERROR] POI [${poiId}] does not have 'spawns' property defined!`);
		return [];
	}

	const activeEntities = [];

	// --- NEW: Tracking array to prevent human duplicates ---
	const spawnedHumanSubclasses = [];

	// Extract dynamic economy level from the current Zone
	let economyLevel = 1;
	if (currentWorldId) {
		const zoneData = DB_LOCATIONS_ZONES.find((z) => z.worldId === currentWorldId);
		if (zoneData && zoneData.zoneEconomyLevel) {
			economyLevel = zoneData.zoneEconomyLevel;
		}
	}

	// ========================================================================
	// HELPER: Centralized Routing Engine
	// ========================================================================
	const spawnEntity = (spawnDefinition) => {
		let category = 'Human';
		let entityClass = null;
		let subclass = null;
		let explicitRank = null;

		// 1. Backwards Compatibility
		if (typeof spawnDefinition === 'string') {
			subclass = spawnDefinition;
		}
		// 2. New Format
		else if (typeof spawnDefinition === 'object') {
			category = spawnDefinition.npcCategory || 'Human';
			entityClass = spawnDefinition.npcClass;
			subclass = spawnDefinition.npcSubclass;
			explicitRank = spawnDefinition.npcRank;
		}

		const scaledEconomyRank = Math.max(economyLevel, playerRank);
		const baseRank = explicitRank || scaledEconomyRank || 1;

		let combatReadyNpc = null;

		let profileConstraints = {};
		if (typeof spawnDefinition === 'object') {
			profileConstraints = {
				socialClass: spawnDefinition.socialClass || null,
				honorClass: spawnDefinition.honorClass || null,
				reputationClass: spawnDefinition.reputationClass || null,
				combatTraining: spawnDefinition.combatTraining || null,
			};
		}

		switch (category) {
			case 'Human':
				let availableSubclasses = [];

				if (subclass) {
					// Guaranteed spawn - bypasses filters
					availableSubclasses = [subclass];
				} else if (entityClass) {
					// Dynamic pool cu clasă specificată
					availableSubclasses = DB_NPC_TAXONOMY.Human.subclasses[entityClass] || [];
				} else {
					// Fallback absolut
					const availableClasses = Object.keys(DB_NPC_TAXONOMY.Human.subclasses || {});
					if (availableClasses.length > 0) {
						entityClass = getRandomElement(availableClasses);
						availableSubclasses = DB_NPC_TAXONOMY.Human.subclasses[entityClass] || [];
					}
				}

				// --- NEW: ANTI-DUPLICATION FILTER ---
				if (!subclass && availableSubclasses.length > 0) {
					availableSubclasses = availableSubclasses.filter((subKey) => !spawnedHumanSubclasses.includes(subKey));
				}

				// --- APPLY DEMOGRAPHIC CONSTRAINTS (Rule 1) ---
				if (Object.keys(profileConstraints).length > 0 && availableSubclasses.length > 1) {
					availableSubclasses = availableSubclasses.filter((subKey) => {
						const safeKey = subKey.replace(/ /g, '_');
						const dbProfile = DB_NPC_HUMANS[safeKey]?.generationProfile;

						if (!dbProfile) return false;

						if (profileConstraints.socialClass && !profileConstraints.socialClass.includes(dbProfile.socialClass)) return false;
						if (profileConstraints.honorClass && !profileConstraints.honorClass.includes(dbProfile.honorClass)) return false;
						if (profileConstraints.reputationClass && !profileConstraints.reputationClass.includes(dbProfile.reputationClass)) return false;
						if (profileConstraints.combatTraining && !profileConstraints.combatTraining.includes(dbProfile.combatTraining)) return false;

						return true;
					});
				}

				// --- HARD FAIL (Rule 2) ---
				if (availableSubclasses.length === 0) {
					console.warn(`[Spawner] Constraint logic returned 0 valid subclasses for Class: ${entityClass}. Slot left empty.`);
					return null;
				}

				// Selecție finală și generare
				const selectedSubclass = getRandomElement(availableSubclasses);
				const rawHuman = generateHumanNPC(selectedSubclass, baseRank);

				if (rawHuman) {
					combatReadyNpc = formatEntityForCombat(rawHuman);
					// --- NEW: Record the successful dynamic spawn ---
					spawnedHumanSubclasses.push(selectedSubclass);
				}
				break;

			case 'Animal':
				if (!entityClass) {
					const availableClasses = Object.keys(DB_NPC_TAXONOMY.Animal.subclasses || {});
					if (availableClasses.length > 0) entityClass = getRandomElement(availableClasses);
				}

				if (entityClass) {
					const animalVariance = Math.floor(Math.random() * 3) - 1;
					const animalTargetRank = Math.max(1, Math.min(5, baseRank + animalVariance));

					let rawAnimal = null;

					if (entityClass === 'Mount' || subclass === 'Horse') {
						rawAnimal = generateHorseMount(animalTargetRank);
					} else {
						rawAnimal = generateAnimalNPC(entityClass, subclass || null, animalTargetRank);
					}

					if (rawAnimal) combatReadyNpc = formatEntityForCombat({ entity: rawAnimal, generatedItems: [] });
				} else {
					console.warn(`Spawner Routing Error: Failed to assign random class for Animal.`);
				}
				break;

			case 'Monster':
				if (!entityClass) {
					const availableClasses = Object.keys(DB_NPC_TAXONOMY.Monster.subclasses || {});
					if (availableClasses.length > 0) entityClass = getRandomElement(availableClasses);
				}

				if (entityClass) {
					const monsterVariance = Math.floor(Math.random() * 3) - 1;
					const monsterTargetRank = Math.max(1, Math.min(5, baseRank + monsterVariance));

					const rawMonster = generateMonsterNPC(entityClass, subclass || null, monsterTargetRank);
					if (rawMonster) combatReadyNpc = formatEntityForCombat({ entity: rawMonster, generatedItems: [] });
				} else {
					console.warn(`Spawner Routing Error: Failed to assign random class for Monster.`);
				}
				break;

			case 'Nephilim':
				if (!entityClass) {
					const availableClasses = Object.keys(DB_NPC_TAXONOMY.Nephilim.subclasses || {});
					if (availableClasses.length > 0) entityClass = getRandomElement(availableClasses);
				}

				if (!subclass && entityClass) {
					const availableSubclasses = DB_NPC_TAXONOMY.Nephilim.subclasses[entityClass];
					if (availableSubclasses && availableSubclasses.length > 0) {
						subclass = getRandomElement(availableSubclasses);
					}
				}

				if (subclass) {
					const rawNephilim = generateNephilimNPC(subclass);
					if (rawNephilim) combatReadyNpc = formatEntityForCombat(rawNephilim);
				} else {
					console.warn(`Spawner Routing Error: Failed to assign random subclass for Nephilim.`);
				}
				break;

			default:
				console.warn(`Spawner Routing Error: Unknown category [${category}]`);
		}

		return combatReadyNpc;
	};

	// ========================================================================
	// 1. Instantiate Guaranteed NPCs
	// ========================================================================
	if (poiData.spawns.guaranteed && poiData.spawns.guaranteed.length > 0) {
		poiData.spawns.guaranteed.forEach((itemDef) => {
			try {
				const npc = spawnEntity(itemDef);
				if (npc && npc.classification) {
					activeEntities.push(npc);

					// --- NEW: Record guaranteed human spawns to prevent dynamic duplicates ---
					if (npc.classification.entityCategory === 'Human') {
						spawnedHumanSubclasses.push(npc.classification.entitySubclass);
					}
				}
			} catch (error) {
				console.error(`Spawner Exception (Guaranteed):`, error);
			}
		});
	}

	// ========================================================================
	// 2. Instantiate Dynamic NPCs
	// ========================================================================
	const dynamicConfig = poiData.spawns.dynamic;
	if (dynamicConfig && dynamicConfig.pool && dynamicConfig.pool.length > 0) {
		const remainingSlots = Math.max(0, dynamicConfig.maxCapacity - activeEntities.length);
		const totalWeight = dynamicConfig.pool.reduce((sum, item) => sum + item.classSpawnChance, 0);

		for (let i = 0; i < remainingSlots; i++) {
			let roll = Math.random() * totalWeight;
			let selectedPoolItem = null;

			for (const item of dynamicConfig.pool) {
				roll -= item.classSpawnChance;
				if (roll <= 0) {
					selectedPoolItem = item;
					break;
				}
			}

			if (selectedPoolItem) {
				try {
					const npc = spawnEntity(selectedPoolItem);
					if (npc && npc.classification) {
						activeEntities.push(npc);
					}
				} catch (error) {
					console.error(`Spawner Exception (Dynamic):`, error);
				}
			}
		}
	}

	return activeEntities;
};
