// File: Client/src/engine/ENGINE_AnimalCreation.js
// Description: Procedural generation engine for wild and domestic animal instantiation.

import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_ANIMALS } from '../data/DB_NPC_Animals.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js'; // <-- IMPORT NOU PENTRU TAXONOMIE
import { getRandomInt, generateUUID } from '../utils/RandomUtils.js';
import { formatForDB, formatForUI } from '../utils/NameFormatter.js';

/**
 * Instantiates an Animal NPC (excluding Mounts).
 * @param {string} entityClass - Mandatory. Can be base class ('Domestic', 'Wild') or behavioral ('WildFriendly', 'WildHostile').
 * @param {string|null} subclassKey - Optional. Explicit subclass to generate (e.g., 'Boar').
 * @param {number|null} requestedRank - Optional. Filters base animals by this native rank.
 * @returns {Object} Instantiated ANIMAL_TEMPLATE object.
 */
export const generateAnimalNPC = (entityClass, subclassKey = null, requestedRank = null) => {
	if (!entityClass) {
		throw new Error(`Animal Engine Error: entityClass parameter is mandatory.`);
	}

	let targetSubclass = null;

	if (subclassKey) {
		// Dacă s-a cerut un animal specific (ex: misiune), îl căutăm direct
		const dbSafeKey = formatForDB(subclassKey);

		const tempProfile = DB_NPC_ANIMALS[dbSafeKey];
		if (!tempProfile) {
			throw new Error(`Animal Engine Error: Invalid subclass [${dbSafeKey}]`);
		}
		targetSubclass = dbSafeKey;
	} else {
		// --- NOUA LOGICĂ BAZATĂ PE TAXONOMIE ---
		// 1. Găsim toate subclasele care corespund clasei cerute (ex: WildFriendly)
		const taxonomySubclasses = DB_NPC_TAXONOMY.Animal.subclasses[entityClass];

		if (!taxonomySubclasses || taxonomySubclasses.length === 0) {
			throw new Error(`Animal Engine Error: No taxonomy subclasses defined for Class [${entityClass}]`);
		}

		// 2. Convertim lista din Taxonomie în format SafeDB (cu underscore) și validăm cu DB_NPC_ANIMALS
		let classCandidates = taxonomySubclasses.map((sub) => formatForDB(sub)).filter((dbKey) => DB_NPC_ANIMALS[dbKey] && dbKey !== 'Horse'); // Excludem caii, ei au generator separat

		if (classCandidates.length === 0) {
			throw new Error(`Animal Engine Error: No valid database profiles found for Taxonomy Class [${entityClass}]`);
		}

		let validCandidates = classCandidates;

		// 3. Sistemul de filtrare pe Rank (Găsim cel mai apropiat rank dacă nu există meci perfect)
		if (requestedRank !== null) {
			const targetRank = Math.max(1, Math.min(5, requestedRank));
			const exactMatches = classCandidates.filter((key) => (DB_NPC_ANIMALS[key].generationProfile.rank || 1) === targetRank);

			if (exactMatches.length > 0) {
				validCandidates = exactMatches;
			} else {
				let minDiff = Infinity;
				let closestMatches = [];

				classCandidates.forEach((key) => {
					const rank = DB_NPC_ANIMALS[key].generationProfile.rank || 1;
					const diff = Math.abs(rank - targetRank);

					if (diff < minDiff) {
						minDiff = diff;
						closestMatches = [key];
					} else if (diff === minDiff) {
						closestMatches.push(key);
					}
				});

				validCandidates = closestMatches.length > 0 ? closestMatches : classCandidates;
			}
		}

		// 4. Alegem un animal la întâmplare din lista finală validă
		targetSubclass = validCandidates[Math.floor(Math.random() * validCandidates.length)];
	}

	const profile = DB_NPC_ANIMALS[targetSubclass];
	const genParams = profile.generationProfile;
	const logParams = profile.logistics;

	const finalRank = genParams.rank || 1;

	const hp = getRandomInt(genParams.baseHpBounds.min, genParams.baseHpBounds.max);

	const adp = getRandomInt(genParams.innateAdpBounds.min, genParams.innateAdpBounds.max);
	const ddr = getRandomInt(genParams.innateDdrBounds.min, genParams.innateDdrBounds.max);
	const str = getRandomInt(genParams.innateStrBounds.min, genParams.innateStrBounds.max);
	const agi = getRandomInt(genParams.innateAgiBounds.min, genParams.innateAgiBounds.max);
	const int = getRandomInt(genParams.innateIntBounds.min, genParams.innateIntBounds.max);

	const entityMass = getRandomInt(logParams.entityMassBounds.min, logParams.entityMassBounds.max);

	const conversionFactor = logParams.foodConversionFactor || 1.0;
	const baseYieldPct = WORLD.NPC?.ANIMAL?.massToFoodYieldPct || 0.05;

	const foodYield = Math.max(1, Math.floor(entityMass * baseYieldPct * conversionFactor));

	let finalConsumption = logParams.foodConsumption || 0;
	if (profile.classification.entityClass === 'Mount') {
		finalConsumption = finalConsumption * finalRank;
	}

	const goldPriceOfFood = WORLD.ECONOMY?.baseValues?.goldCoinBaseCostOfFood || 1;
	const dynamicCoinValue = foodYield * goldPriceOfFood;

	const lootTableId = profile.economy ? profile.economy.lootTableId : null;

	// Generăm numele lizibil pentru UI (ex: "Water Buffalo")
	const uiName = formatForUI(targetSubclass);

	return {
		entityId: generateUUID(),
		entityName: uiName,
		entityDescription: `A ${profile.classification.entityClass.toLowerCase()} ${uiName.toLowerCase()} roaming the realm.`,

		classification: {
			entityArchetype: profile.classification.entityArchetype,
			entityCategory: profile.classification.entityCategory,
			entityClass: profile.classification.entityClass,
			entitySubclass: uiName,
			entityRank: finalRank,
		},

		biology: { hpCurrent: hp, hpMax: hp },

		stats: { innateAdp: adp, innateDdr: ddr, innateStr: str, innateAgi: agi, innateInt: int },

		behavior: {
			behaviorState: profile.behavior.behaviorState,
			isAlert: profile.behavior.isAlert,
			fleeHpPercentThreshold: profile.behavior.fleeHpPercentThreshold,
		},

		logistics: { resourceTag: logParams.resourceTag, foodYield: foodYield, foodConsumption: finalConsumption, entityMass: entityMass },

		economy: { baseCoinValue: dynamicCoinValue, lootTableId: lootTableId },

		interactions: { actionTags: profile.interactions.actionTags },
	};
};
