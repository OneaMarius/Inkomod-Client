// File: Client/src/engine/ENGINE_EventSpawner.js
// Description: Parses event procGen instructions and funnels them into the correct generation engine.

import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_NPC_HUMANS } from '../data/DB_NPC_Humans.js';
import { generateHumanNPC } from './ENGINE_HumanCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';
import { generateMonsterNPC } from './ENGINE_MonsterCreation.js';
import { generateNephilimNPC } from './ENGINE_NephilimCreation.js'; // <-- IMPORT NOU
import { formatEntityForCombat } from '../utils/EntityFormatter.js';
import { getRandomInt, getRandomElement } from '../utils/RandomUtils.js';

// 1. Modifică semnătura funcției principale
export const generateEventEncounter = (procGenData, currentZoneEconomyLevel, playerRank = 1) => {
	if (!procGenData) return null;

	// Route logic based on entity type (pasează playerRank mai departe)
	if (procGenData.type === 'NPC_HUMAN') {
		return generateHumanEncounter(procGenData, currentZoneEconomyLevel, playerRank);
	} else if (procGenData.type === 'NPC_ANIMAL') {
		return generateAnimalEncounter(procGenData, currentZoneEconomyLevel, playerRank);
	} else if (procGenData.type === 'NPC_MONSTER') {
		return generateMonsterEncounter(procGenData, currentZoneEconomyLevel, playerRank);
	} else if (procGenData.type === 'NPC_NEPHILIM') {
		return generateNephilimEncounter(procGenData);
	} else {
		console.warn(`ENGINE_EventSpawner: Unknown procGen type [${procGenData.type}]`);
		return null;
	}
};

// ============================================================================
// 1. HUMAN ROUTER
// ============================================================================
const generateHumanEncounter = (procGenData, currentZoneEconomyLevel) => {
	const {
		categories = [],
		classes = [],
		subclasses = [],
		rankModifier = 0,
		// Extragem constrângerile opționale din eveniment
		socialClass = null,
		honorClass = null,
		reputationClass = null,
		combatTraining = null,
	} = procGenData;

	let selectedSubclass = null;
	let pool = [];

	// 1. Populăm pool-ul inițial
	if (subclasses.length > 0) {
		pool = [...subclasses]; // Guaranteed via event
	} else if (classes.length > 0) {
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
	} else if (categories.length > 0) {
		categories.forEach((category) => {
			const taxonomyCategory = DB_NPC_TAXONOMY[category];
			if (taxonomyCategory && taxonomyCategory.subclasses) {
				Object.values(taxonomyCategory.subclasses).forEach((subclassArray) => {
					pool.push(...subclassArray);
				});
			}
		});
	}

	// 2. Aplicăm constrângerile de profil dacă sunt definite în eveniment
	const hasConstraints = socialClass || honorClass || reputationClass || combatTraining;

	if (hasConstraints && pool.length > 1) {
		// Importăm DB_NPC_HUMANS la începutul fișierului pentru a avea acces la profiluri
		pool = pool.filter((subKey) => {
			const safeKey = subKey.replace(/ /g, '_');
			const dbProfile = DB_NPC_HUMANS[safeKey]?.generationProfile;
			if (!dbProfile) return false;

			if (socialClass && !socialClass.includes(dbProfile.socialClass)) return false;
			if (honorClass && !honorClass.includes(dbProfile.honorClass)) return false;
			if (reputationClass && !reputationClass.includes(dbProfile.reputationClass)) return false;
			if (combatTraining && !combatTraining.includes(dbProfile.combatTraining)) return false;

			return true;
		});
	}

	// 3. Fallback Hard Fail
	if (pool.length === 0) {
		console.warn('ENGINE_EventSpawner: Event constraints resulted in 0 valid Human subclasses.');
		return null; // Returnăm null și oprim întâlnirea
	}

	selectedSubclass = getRandomElement(pool);

	const scaledEconomyRank = Math.max(currentZoneEconomyLevel, playerRank);
	let baseRankTarget = scaledEconomyRank + rankModifier;
	const finalBaseRank = Math.max(1, Math.min(5, baseRankTarget));

	try {
		const rawNpcData = generateHumanNPC(selectedSubclass, finalBaseRank);
		return formatEntityForCombat(rawNpcData);
	} catch (error) {
		console.error(`ENGINE_EventSpawner: Failed to generate Human [${selectedSubclass}]`, error);
		return null;
	}
};

// ============================================================================
// 2. ANIMAL ROUTER
// ============================================================================
const generateAnimalEncounter = (procGenData, currentZoneEconomyLevel) => {
	// THE FIX: Extragem 'classes' în loc de 'entityClass', cu fallback pe ['Wild']
	const { classes = ['Wild'], subclasses = [], rankModifier = 0 } = procGenData;

	// Alegem o clasă la întâmplare din array (ex: 'WildHostile')
	const targetClass = classes.length > 0 ? getRandomElement(classes) : 'Wild';
	const targetSubclass = subclasses.length > 0 ? getRandomElement(subclasses) : null;

	const variance = getRandomInt(-1, 1);
	const scaledEconomyRank = Math.max(currentZoneEconomyLevel, playerRank);
	let rawRank = scaledEconomyRank + variance + rankModifier;
	const finalRank = Math.max(1, Math.min(5, rawRank));

	try {
		// generateAnimalNPC returns the entity object DIRECTLY, passing the correct targetClass
		const rawAnimalData = generateAnimalNPC(targetClass, targetSubclass, finalRank);

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
	const scaledEconomyRank = Math.max(currentZoneEconomyLevel, playerRank);
	let rawRank = scaledEconomyRank + variance + rankModifier;
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
