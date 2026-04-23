// File: Client/src/engine/ENGINE_Spawner.js
// Description: Unified Generator for all NPC entities (Humans, Animals, Monsters, Nephilims).

import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../data/DB_Locations_POIS.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
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
export const populatePOI = (poiId, poiCategory = 'CIVILIZED', currentWorldId) => {
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
		let explicitRank = null; // Added to capture hardcoded ranks from POI definition

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

		// Base rank is driven entirely by the zone's economy, UNLESS an explicit rank is requested
		const baseRank = explicitRank || economyLevel || 1;

		let combatReadyNpc = null;

		switch (category) {
			case 'Human':
				if (!entityClass && !subclass) {
					const availableClasses = Object.keys(DB_NPC_TAXONOMY.Human.subclasses || {});
					if (availableClasses.length > 0) entityClass = getRandomElement(availableClasses);
				}
				if (!subclass && entityClass) {
					const availableSubclasses = DB_NPC_TAXONOMY.Human.subclasses[entityClass];
					if (availableSubclasses && availableSubclasses.length > 0) {
						subclass = getRandomElement(availableSubclasses);
					}
				}

				if (subclass) {
					const rawHuman = generateHumanNPC(subclass, baseRank);
					if (rawHuman) combatReadyNpc = formatEntityForCombat(rawHuman);
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

					// Routing for Mounts vs Standard Animals
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
