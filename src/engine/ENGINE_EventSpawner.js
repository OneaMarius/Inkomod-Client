// File: Client/src/engine/ENGINE_EventSpawner.js
// Description: Parses event procGen instructions and funnels them into the correct generation engine.

import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { generateHumanNPC } from './ENGINE_HumanCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';
import { generateMonsterNPC } from './ENGINE_MonsterCreation.js';
import { generateNephilimNPC } from './ENGINE_NephilimCreation.js'; // <-- IMPORT NOU
import { formatEntityForCombat } from '../utils/EntityFormatter.js';
import { getRandomInt, getRandomElement } from '../utils/RandomUtils.js';

export const generateEventEncounter = (procGenData, currentZoneEconomyLevel) => {
	if (!procGenData) return null;

	// Route logic based on entity type
	if (procGenData.type === 'NPC_HUMAN') {
		return generateHumanEncounter(procGenData, currentZoneEconomyLevel);
	} else if (procGenData.type === 'NPC_ANIMAL') {
		return generateAnimalEncounter(procGenData, currentZoneEconomyLevel);
	} else if (procGenData.type === 'NPC_MONSTER') {
		return generateMonsterEncounter(procGenData, currentZoneEconomyLevel);
	} else if (procGenData.type === 'NPC_NEPHILIM') {
		return generateNephilimEncounter(procGenData); // <-- RUTA NOUĂ
	} else {
		console.warn(`ENGINE_EventSpawner: Unknown procGen type [${procGenData.type}]`);
		return null;
	}
};

// ============================================================================
// 1. HUMAN ROUTER
// ============================================================================
const generateHumanEncounter = (procGenData, currentZoneEconomyLevel) => {
	const { categories = [], classes = [], subclasses = [], rankModifier = 0 } = procGenData;
	let selectedSubclass = null;

	if (subclasses.length > 0) {
		selectedSubclass = getRandomElement(subclasses);
	} else if (classes.length > 0) {
		const pool = [];
		categories.forEach((category) => {
			const taxonomyCategory = DB_NPC_TAXONOMY[category];
			if (taxonomyCategory && taxonomyCategory.subclasses) {
				classes.forEach((cls) => {
					if (taxonomyCategory.subclasses[cls]) {
						pool.push(...taxonomyCategory.subclasses[cls]);
					}
				});
			}
		});
		selectedSubclass = getRandomElement(pool);
	} else if (categories.length > 0) {
		const pool = [];
		categories.forEach((category) => {
			const taxonomyCategory = DB_NPC_TAXONOMY[category];
			if (taxonomyCategory && taxonomyCategory.subclasses) {
				Object.values(taxonomyCategory.subclasses).forEach((subclassArray) => {
					pool.push(...subclassArray);
				});
			}
		});
		selectedSubclass = getRandomElement(pool);
	}

	if (!selectedSubclass) {
		console.warn('ENGINE_EventSpawner: Failed to resolve Human subclass. Defaulting to Thug.');
		selectedSubclass = 'Thug';
	}

	// THE FIX: Removed the `variance` variable.
	// We only apply the event's rankModifier to the base economy.
	// ENGINE_HumanCreation will safely apply its own +/- 1 variance to this base number.
	let baseRankTarget = currentZoneEconomyLevel + rankModifier;
	const finalBaseRank = Math.max(1, Math.min(5, baseRankTarget));

	try {
		const rawNpcData = generateHumanNPC(selectedSubclass, finalBaseRank);
		return formatEntityForCombat(rawNpcData);
	} catch (error) {
		console.error(`ENGINE_EventSpawner: Failed to generate Human [${selectedSubclass}] at base rank [${finalBaseRank}]`, error);
		return null;
	}
};

// ============================================================================
// 2. ANIMAL ROUTER
// ============================================================================
const generateAnimalEncounter = (procGenData, currentZoneEconomyLevel) => {
	const { entityClass = 'Wild', subclasses = [], rankModifier = 0 } = procGenData;

	const targetSubclass = subclasses.length > 0 ? getRandomElement(subclasses) : null;

	const variance = getRandomInt(-1, 1);
	let rawRank = currentZoneEconomyLevel + variance + rankModifier;
	const finalRank = Math.max(1, Math.min(5, rawRank));

	try {
		// generateAnimalNPC returns the entity object DIRECTLY
		const rawAnimalData = generateAnimalNPC(entityClass, targetSubclass, finalRank);

		// Wrap it in the standard payload structure expected by formatEntityForCombat
		const wrappedPayload = { entity: rawAnimalData, generatedItems: [] };
		return formatEntityForCombat(wrappedPayload);
	} catch (error) {
		console.error(`ENGINE_EventSpawner: Failed to generate Animal [${targetSubclass || 'Random'}]`, error);
		return null;
	}
};

// ============================================================================
// 3. MONSTER ROUTER
// ============================================================================
// ============================================================================
// 3. MONSTER ROUTER
// ============================================================================
const generateMonsterEncounter = (procGenData, currentZoneEconomyLevel) => {
    // Folosim 'classes' ca array, cu un fallback de siguranță pe ['Beast']
    const { classes = ['Beast'], subclasses = [], rankModifier = 0 } = procGenData;

    // Alegem o clasă la întâmplare din cele oferite
    const targetClass = classes.length > 0 ? getRandomElement(classes) : 'Beast';
    const targetSubclass = subclasses.length > 0 ? getRandomElement(subclasses) : null;

    const variance = getRandomInt(-1, 1);
    let rawRank = currentZoneEconomyLevel + variance + rankModifier;
    const finalRank = Math.max(1, Math.min(5, rawRank));

    try {
        // Trimitem clasa aleasă către motorul de generare
        const rawMonsterData = generateMonsterNPC(targetClass, targetSubclass, finalRank);

        const wrappedPayload = { entity: rawMonsterData, generatedItems: [] };
        return formatEntityForCombat(wrappedPayload);
    } catch (error) {
        console.error(`ENGINE_EventSpawner: Failed to generate Monster [${targetSubclass || 'Random'}]`, error);
        return null;
    }
};

// ============================================================================
// 4. NEPHILIM ROUTER
// ============================================================================
const generateNephilimEncounter = (procGenData) => {
	const { subclasses = [] } = procGenData;
	let selectedSubclass = null;

	if (subclasses.length > 0) {
		selectedSubclass = getRandomElement(subclasses);
	} else {
		// Fallback procedural dacă evenimentul nu cere o subclasă specifică
		const pool = DB_NPC_TAXONOMY?.Nephilim?.subclasses?.Demigod || ['Scion_Of_Odin'];
		selectedSubclass = getRandomElement(pool);
	}

	try {
		// generateNephilimNPC returnează direct formatul corect { entity, generatedItems }
		const rawNephilimData = generateNephilimNPC(selectedSubclass);
		return formatEntityForCombat(rawNephilimData);
	} catch (error) {
		console.error(`ENGINE_EventSpawner: Failed to generate Nephilim [${selectedSubclass}]`, error);
		return null;
	}
};
