// File: src/engine/ENGINE_MountCreation.js
// Description: Procedural generation engine for Mount instantiation.

// ========================================================================
// IMPORTS
// ========================================================================
import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_ANIMALS } from '../data/DB_NPC_Animals.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';

/**
 * Instantiates a Mount NPC with deterministic naming and Q-Rating.
 * @param {number|null} requestedRank - Optional rank boundary (1-5).
 * @returns {Object} Instantiated ANIMAL_TEMPLATE object.
 */
export const generateHorseMount = (requestedRank = null) => {
	// ------------------------------------------------------------------------
	// 1. INITIALIZATION & SANITIZATION
	// ------------------------------------------------------------------------
	const profile = DB_NPC_ANIMALS.Horse;
	if (!profile) throw new Error(`Mount Engine Error: Horse profile not found.`);

	let finalRank;
	if (requestedRank !== null) {
		finalRank = Math.max(profile.generationProfile.rankRange[0], Math.min(requestedRank, profile.generationProfile.rankRange[1]));
	} else {
		const minRank = profile.generationProfile.rankRange[0];
		const maxRank = profile.generationProfile.rankRange[1];
		finalRank = getRandomInt(minRank, maxRank);
	}

	const rankIndex = finalRank - 1;
	const genParams = profile.generationProfile;
	const logParams = profile.logistics;

	// ------------------------------------------------------------------------
	// 2. STAT GENERATION
	// ------------------------------------------------------------------------
	const maxHp = genParams.baseHp + finalRank * genParams.hpPerRank;
	const str = getRandomInt(genParams.strBounds.min[rankIndex], genParams.strBounds.max[rankIndex]);
	const agi = getRandomInt(genParams.agiBounds.min[rankIndex], genParams.agiBounds.max[rankIndex]);
	const entityMass = getRandomInt(logParams.entityMassBounds.min, logParams.entityMassBounds.max);

	// ------------------------------------------------------------------------
	// 3. QUALITY RATING EVALUATION (Q1 - Q4)
	// ------------------------------------------------------------------------
	const maxStr = genParams.strBounds.max[rankIndex] || 0;
	const maxAgi = genParams.agiBounds.max[rankIndex] || 0;
	const maxPotential = maxStr + maxAgi;
	const actualTotal = str + agi;

	let qualityScore = 1.0;
	if (maxPotential > 0) {
		qualityScore = actualTotal / maxPotential;
	}

	let entityQuality = 1;

	// Map the quality score to the 4 established tiers
	if (qualityScore <= 0.4) {
		entityQuality = 1; // Q1 (Green)
	} else if (qualityScore <= 0.7) {
		entityQuality = 2; // Q2 (Blue)
	} else if (qualityScore <= 0.9) {
		entityQuality = 3; // Q3 (Purple)
	} else {
		entityQuality = 4; // Q4 (Gold)
	}

	// ------------------------------------------------------------------------
	// 4. DYNAMIC NOMENCLATURE & DESCRIPTION
	// ------------------------------------------------------------------------
	const nomenclature = DB_NPC_TAXONOMY.Animal.nomenclature.Mount.Horse;
	const baseNames = nomenclature.baseNamesByRank[rankIndex] || ['Horse'];
	const baseName = getRandomElement(baseNames);

	let adjectiveList;
	let generatedDescription;

	// Determine the dominant stat to assign a descriptive adjective and description
	if (str > agi + 2) {
		adjectiveList = nomenclature.adjectives.strength;
		generatedDescription = nomenclature.descriptions.strength;
	} else if (agi > str + 2) {
		adjectiveList = nomenclature.adjectives.agility;
		generatedDescription = nomenclature.descriptions.agility;
	} else {
		adjectiveList = nomenclature.adjectives.balanced;
		generatedDescription = nomenclature.descriptions.balanced;
	}

	const adjective = getRandomElement(adjectiveList);
	const generatedName = `${adjective} ${baseName}`;

	// ------------------------------------------------------------------------
	// 5. ECONOMY RESOLUTION
	// ------------------------------------------------------------------------
	const conversionFactor = logParams.foodConversionFactor || 1.0;
	const baseYieldPct = WORLD.NPC?.ANIMAL?.massToFoodYieldPct || 0.05;
	const foodYield = Math.max(1, Math.floor(entityMass * baseYieldPct * conversionFactor));

	const goldPriceOfFood = WORLD.ECONOMY?.baseValues?.goldCoinBaseCostOfFood || 1;
	const meatValue = foodYield * goldPriceOfFood;

	const goldPrice = WORLD.ECONOMY?.baseValues?.coinRegionalBaseCost || 1;
	const eipPerAgi = WORLD.NPC?.ANIMAL?.MOUNT?.eipPerAgi || 1;
	const eipPerStr = WORLD.NPC?.ANIMAL?.MOUNT?.eipPerStr || 2;
	const eipMountBonus = WORLD.NPC?.ANIMAL?.MOUNT?.eipMountBonus || 10;

	const utilityValue = Math.floor(str * eipPerStr * goldPrice + agi * eipPerAgi * goldPrice + finalRank * eipMountBonus * goldPrice);
	const finalCoinValue = meatValue + utilityValue;

	// ------------------------------------------------------------------------
	// 6. ENTITY ASSEMBLY
	// ------------------------------------------------------------------------
	return {
		entityId: generateUUID(),
		entityName: generatedName,
		entityDescription: generatedDescription,
		classification: {
			entityArchetype: profile.classification.entityArchetype,
			entityCategory: profile.classification.entityCategory,
			entityClass: profile.classification.entityClass,
			entitySubclass: profile.classification.entitySubclass,
			entityRank: finalRank,
			entityQuality: entityQuality, // Embedded Q-Rating for UI rendering
		},
		biology: { hpCurrent: maxHp, hpMax: maxHp },
		stats: { innateAdp: genParams.innateAdp, innateDdr: genParams.innateDdr, innateStr: str, innateAgi: agi, innateInt: genParams.innateInt },
		behavior: {
			behaviorState: profile.behavior.behaviorState,
			isAlert: profile.behavior.isAlert,
			fleeHpPercentThreshold: profile.behavior.fleeHpPercentThreshold,
		},
		logistics: { resourceTag: logParams.resourceTag, foodYield: foodYield, foodConsumption: logParams.foodConsumption * finalRank, entityMass: entityMass },
		economy: { baseCoinValue: finalCoinValue, lootTableId: profile.economy ? profile.economy.lootTableId : null },
		interactions: { actionTags: profile.interactions.actionTags },
	};
};
