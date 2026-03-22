// File: src/engine/ENGINE_Spawner.js
// Description: Generates NPC entities based on POI spawn pools, guaranteed slots, and taxonomy.

import { DB_NPC_HUMANS } from '../data/DB_NPC_Humans.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../data/DB_Locations_POIS.js';

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * Instantiates an NPC based on its subclass name (e.g., 'Innkeeper', 'Blacksmith').
 */
const generateNPC = (subclassName) => {
	const template = DB_NPC_HUMANS[subclassName];
	if (!template) {
		console.warn(`Template missing for NPC Subclass: ${subclassName}`);
		return null;
	}

	const { firstNames, lastNames } = DB_NPC_TAXONOMY.generationConfig;
	const randomFirstName = getRandomElement(firstNames);
	const randomLastName = getRandomElement(lastNames);

	const generatedName = `${randomFirstName} ${randomLastName}`;
	const cleanSubclass = subclassName.replace(/_/g, ' ');

	return {
		// --- STANDARDIZED IDENTITY ---
		entityId: `npc_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
		entityName: generatedName,
		entityDescription: `A ${template.entityClass.toLowerCase()} ${cleanSubclass.toLowerCase()} in the establishment.`,

		// --- STANDARDIZED CLASSIFICATION ---
		classification: { entityArchetype: 'Humanoid', entityCategory: 'Human', entityClass: template.entityClass, entitySubclass: cleanSubclass },

		generationProfile: template.generationProfile,

		// --- STANDARDIZED INTERACTIONS ---
		interactions: { actionTags: template.actionTags || [] },

		// --- STANDARDIZED BIOLOGY ---
		biology: { hpMax: 100, hpCurrent: 100, isDead: false },

		// --- STANDARDIZED WEALTH ---
		inventory: { silverCoins: Math.floor(Math.random() * 50) + 10 },
	};
};

/**
 * Generates the entire list of active entities for a given POI.
 */
export const populatePOI = (poiId, poiCategory = 'CIVILIZED') => {
	const db = poiCategory === 'CIVILIZED' ? DB_LOCATIONS_POIS_Civilized : DB_LOCATIONS_POIS_Untamed;
	const poiData = db[poiId];

	if (!poiData || !poiData.spawns) return [];

	const activeEntities = [];

	// 1. Instantiate Guaranteed NPCs
	if (poiData.spawns.guaranteed && poiData.spawns.guaranteed.length > 0) {
		poiData.spawns.guaranteed.forEach((subclass) => {
			const npc = generateNPC(subclass);
			if (npc) activeEntities.push(npc);
		});
	}

	// 2. Instantiate Dynamic NPCs (Up to max capacity)
	const dynamicConfig = poiData.spawns.dynamic;
	if (dynamicConfig && dynamicConfig.pool && dynamicConfig.pool.length > 0) {
		const remainingSlots = Math.max(0, dynamicConfig.maxCapacity - activeEntities.length);

		// Calculate total weight of the pool for proportional extraction
		const totalWeight = dynamicConfig.pool.reduce((sum, item) => sum + item.classSpawnChance, 0);

		for (let i = 0; i < remainingSlots; i++) {
			let roll = Math.random() * totalWeight;
			let selectedClass = null;

			for (const item of dynamicConfig.pool) {
				roll -= item.classSpawnChance;
				if (roll <= 0) {
					selectedClass = item.npcClass;
					break;
				}
			}

			// Find a random subclass belonging to the selected class (e.g., picking a 'Grocer' from the 'Trade' class)
			if (selectedClass) {
				const availableSubclasses = DB_NPC_TAXONOMY.Human.subclasses[selectedClass];
				if (availableSubclasses && availableSubclasses.length > 0) {
					const randomSubclass = getRandomElement(availableSubclasses);
					const dynamicNpc = generateNPC(randomSubclass);
					if (dynamicNpc) activeEntities.push(dynamicNpc);
				}
			}
		}
	}

	return activeEntities;
};
