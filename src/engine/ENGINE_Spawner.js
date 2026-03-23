// File: Client/src/engine/ENGINE_Spawner.js
// Description: Generates NPC entities based on POI spawn pools, guaranteed slots, and taxonomy.

import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../data/DB_Locations_POIS.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
import { generateHumanNPC } from './ENGINE_HumanCreation.js';

/**
 * Utility function to select a random element from an array.
 */
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * Helper to map the generated equipment IDs into the boolean flags expected by the Combat Engine.
 * Calculates total AD (Attack Damage) and DR (Damage Reduction) based on equipped items.
 */
const formatEntityForCombat = (generatedData) => {
	const { entity, generatedItems } = generatedData;

	let totalAd = 0;
	let totalDr = 0;

	// Calculate actual AD and DR from the procedurally generated equipment
	if (generatedItems && generatedItems.length > 0) {
		generatedItems.forEach((item) => {
			// Check if the item is physically equipped by matching its ID against the entity's equipment slots
			const isEquipped =
				item.entityId === entity.equipment.weaponId ||
				item.entityId === entity.equipment.armourId ||
				item.entityId === entity.equipment.shieldId ||
				item.entityId === entity.equipment.helmetId;

			// Sum the stats based on the GameWorld COMBAT definitions (adp = Attack Damage Power, ddr = Defense Damage Reduction)
			if (isEquipped && item.stats) {
				if (item.stats.adp) totalAd += item.stats.adp;
				if (item.stats.ddr) totalDr += item.stats.ddr;
			}
		});
	}

	// 1. Map innate stats to flat stats and apply calculated total AD and DR
	entity.stats = {
		...entity.stats,
		str: entity.stats.innateStr || 10,
		agi: entity.stats.innateAgi || 10,
		int: entity.stats.innateInt || 10,
		ad: (entity.stats.innateAdp || 0) + totalAd,
		dr: (entity.stats.innateDdr || 0) + totalDr,
	};

	// 2. Map item IDs to boolean flags for the ENGINE_Combat_Humanoid degradation matrix
	entity.equipment = {
		...entity.equipment,
		hasWeapon: !!entity.equipment.weaponId,
		hasArmour: !!entity.equipment.armourId,
		hasShield: !!entity.equipment.shieldId,
		hasHelmet: !!entity.equipment.helmetId,
	};

	// 3. Attach generated items to the inventory so they drop as loot when the NPC dies
	entity.inventory = { ...entity.inventory, itemSlots: generatedItems };

	return entity;
};


/**
 * Generates the entire list of active entities for a given Point of Interest (POI).
 * Now requires currentWorldId to correctly scale enemies to the regional economy.
 */
export const populatePOI = (poiId, poiCategory = 'CIVILIZED', currentWorldId) => {
    const db = poiCategory === 'CIVILIZED' ? DB_LOCATIONS_POIS_Civilized : DB_LOCATIONS_POIS_Untamed;
    const poiData = db[poiId];

    if (!poiData || !poiData.spawns) return [];

    const activeEntities = [];
    
    // NEW LOGIC: Extract the dynamic economy level from the current Zone
    let economyLevel = 1;
    if (currentWorldId) {
        const zoneData = DB_LOCATIONS_ZONES.find(z => z.worldId === currentWorldId);
        if (zoneData && zoneData.zoneEconomyLevel) {
            economyLevel = zoneData.zoneEconomyLevel;
        }
    }

    // ========================================================================
    // 1. Instantiate Guaranteed NPCs
    // ========================================================================
    if (poiData.spawns.guaranteed && poiData.spawns.guaranteed.length > 0) {
        poiData.spawns.guaranteed.forEach((subclass) => {
            try {
                // Pass the economyLevel instead of the static poiRank
                const generatedData = generateHumanNPC(subclass, economyLevel);
                const combatReadyNpc = formatEntityForCombat(generatedData);
                activeEntities.push(combatReadyNpc);
            } catch (error) {
                console.error(`Spawner Error (Guaranteed): Failed to generate [${subclass}]`, error);
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
            let selectedClass = null;

            for (const item of dynamicConfig.pool) {
                roll -= item.classSpawnChance;
                if (roll <= 0) {
                    selectedClass = item.npcClass;
                    break;
                }
            }

            if (selectedClass) {
                const availableSubclasses = DB_NPC_TAXONOMY.Human.subclasses[selectedClass];
                if (availableSubclasses && availableSubclasses.length > 0) {
                    const randomSubclass = getRandomElement(availableSubclasses);
                    try {
                        // Pass the economyLevel instead of the static poiRank
                        const generatedData = generateHumanNPC(randomSubclass, economyLevel);
                        const combatReadyNpc = formatEntityForCombat(generatedData);
                        activeEntities.push(combatReadyNpc);
                    } catch (error) {
                        console.error(`Spawner Error (Dynamic): Failed to generate [${randomSubclass}]`, error);
                    }
                }
            }
        }
    }

    return activeEntities;
};
