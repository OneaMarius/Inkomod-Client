// File: Client/src/engine/ENGINE_Spawner.js
// Description: Unified Generator for all NPC entities (Humans, Animals, Monsters, Nephilims).

import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../data/DB_Locations_POIS.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
import { generateHumanNPC } from './ENGINE_HumanCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';
import { generateMonsterNPC } from './ENGINE_MonsterCreation.js';
import { generateNephilimNPC } from './ENGINE_NephilimCreation.js';
import { formatEntityForCombat } from '../utils/EntityFormatter.js';
import { getRandomElement } from '../utils/RandomUtils.js';

/**
 * Generates the entire list of active entities for a given Point of Interest (POI).
 * Now safely handles legacy Human strings AND new complex taxonomy objects.
 */
export const populatePOI = (poiId, poiCategory = 'CIVILIZED', currentWorldId) => {
	console.log(`[DEBUG] Spawner chemat pentru: ID=${poiId}, Categorie=${poiCategory}`);

	const db = poiCategory === 'CIVILIZED' ? DB_LOCATIONS_POIS_Civilized : DB_LOCATIONS_POIS_Untamed;
	const poiData = db[poiId];

	if (!poiData) {
		console.error(`[EROARE CRITICĂ] Nu am găsit POI-ul cu ID [${poiId}] în baza de date! Verifică DB_Locations_POIS.js`);
		return [];
	}

	if (!poiData.spawns) {
		console.error(`[EROARE CRITICĂ] POI-ul [${poiId}] nu are proprietatea 'spawns' definită!`);
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

		// 1. Backwards Compatibility: If it's just a string, it's a Human subclass (e.g., 'Blacksmith')
		if (typeof spawnDefinition === 'string') {
			subclass = spawnDefinition;
		}
		// 2. New Format: If it's an object, extract taxonomy
		else if (typeof spawnDefinition === 'object') {
			category = spawnDefinition.npcCategory || 'Human'; // Default to Human
			entityClass = spawnDefinition.npcClass;
			subclass = spawnDefinition.npcSubclass;
		}

		let combatReadyNpc = null;

		switch (category) {
			case 'Human':
				// If dynamic pool provides a class (e.g., 'Trade') but no subclass, pick a random subclass
				if (!subclass && entityClass) {
					const availableSubclasses = DB_NPC_TAXONOMY.Human.subclasses[entityClass];
					if (availableSubclasses && availableSubclasses.length > 0) {
						subclass = getRandomElement(availableSubclasses);
					}
				}

				if (subclass) {
					const rawHuman = generateHumanNPC(subclass, economyLevel);
					if (rawHuman) combatReadyNpc = formatEntityForCombat(rawHuman);
				}
				break;

			case 'Animal':
				if (entityClass) {
					// Apply a -1, 0, or +1 variance to the base economy level
					const animalVariance = Math.floor(Math.random() * 3) - 1;
					const animalTargetRank = Math.max(1, Math.min(5, economyLevel + animalVariance));

					const rawAnimal = generateAnimalNPC(entityClass, subclass || null, animalTargetRank);
					if (rawAnimal) combatReadyNpc = formatEntityForCombat({ entity: rawAnimal, generatedItems: [] });
				} else {
					console.warn(`Spawner Routing Error: Animal category requires at least an npcClass (e.g., 'Wild').`);
				}
				break;

			case 'Monster':
				if (entityClass) {
					// Apply a -1, 0, or +1 variance to the base economy level
					const monsterVariance = Math.floor(Math.random() * 3) - 1;
					const monsterTargetRank = Math.max(1, Math.min(5, economyLevel + monsterVariance));

					const rawMonster = generateMonsterNPC(entityClass, subclass || null, monsterTargetRank);
					if (rawMonster) combatReadyNpc = formatEntityForCombat({ entity: rawMonster, generatedItems: [] });
				} else {
					console.warn(`Spawner Routing Error: Monster category requires at least an npcClass (e.g., 'Beast').`);
				}
				break;

			case 'Nephilim':
				if (subclass) {
					const rawNephilim = generateNephilimNPC(subclass);
					if (rawNephilim) combatReadyNpc = formatEntityForCombat(rawNephilim);
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
				} else {
					console.error(`Spawner Error: Failed to generate guaranteed entity for`, itemDef);
				}
			} catch (error) {
				console.error(`Spawner Exception (Guaranteed):`, error);
			}
		});
	}

	// ========================================================================
	// 2. Instantiate Dynamic NPCs (Up to POI max capacity)
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
