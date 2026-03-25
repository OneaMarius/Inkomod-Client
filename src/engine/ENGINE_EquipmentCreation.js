// File: src/engine/ENGINE_EquipmentCreation.js
// Description: Procedural generation engine for weapons, armours, shields, and helmets.

// ========================================================================
// IMPORTS
// ========================================================================
import { WORLD } from '../data/GameWorld.js';
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';

/**
 * Instantiates an equipment item template with deterministic naming and Q-Rating.
 * @param {string} itemClass - 'Weapon', 'Armour', 'Shield', or 'Helmet'
 * @param {number|null} itemTier - Optional. Integer between 1 and 5. Random if null.
 * @param {string} generationContext - 'Trade', 'NPC', or 'Loot'
 * @returns {Object} Instantiated ITEM_TEMPLATE object
 */
export const generateItem = (itemClass, itemTier = null, generationContext = 'Trade') => {
	// ------------------------------------------------------------------------
	// 1. INITIALIZATION & SANITIZATION
	// ------------------------------------------------------------------------
	const safeClass = itemClass.toUpperCase();
	const safeClassLower = itemClass.toLowerCase();
	const safeContext = generationContext.toLowerCase();
	const maxAllowedTier = WORLD.ITEM?.GENERAL?.maxTier || 5;

	// Resolve Tier
	let tier;
	if (itemTier !== null && itemTier !== undefined) {
		tier = Math.max(1, Math.min(itemTier, maxAllowedTier));
	} else {
		tier = getRandomInt(1, maxAllowedTier);
	}
	const tierIndex = tier - 1;

	// Load category configuration
	const categoryConfig = WORLD.ITEM[safeClass];
	if (!categoryConfig) {
		throw new Error(`THOR Engine Error: Invalid itemClass [${itemClass}]`);
	}

	// ------------------------------------------------------------------------
	// 2. STAT GENERATION
	// ------------------------------------------------------------------------
	const adp = getRandomInt(categoryConfig.adpBounds.min[tierIndex], categoryConfig.adpBounds.max[tierIndex]);
	const ddr = getRandomInt(categoryConfig.ddrBounds.min[tierIndex], categoryConfig.ddrBounds.max[tierIndex]);

	// ------------------------------------------------------------------------
	// 3. QUALITY RATING EVALUATION (Q1 - Q4)
	// ------------------------------------------------------------------------
	const maxAdp = categoryConfig.adpBounds.max[tierIndex] || 0;
	const maxDdr = categoryConfig.ddrBounds.max[tierIndex] || 0;

	const maxPotential = maxAdp + maxDdr;
	const actualTotal = adp + ddr;

	let qualityScore = 1.0;
	if (maxPotential > 0) {
		qualityScore = actualTotal / maxPotential;
	}

	let prefixList;
	let itemQuality = 1;

	// Map the quality score to the 4 established tiers
	if (qualityScore <= 0.4) {
		prefixList = DB_ITEM_NOMENCLATURE.qualityPrefixes.poor;
		itemQuality = 1; // Q1 (Green)
	} else if (qualityScore <= 0.7) {
		prefixList = DB_ITEM_NOMENCLATURE.qualityPrefixes.average;
		itemQuality = 2; // Q2 (Blue)
	} else if (qualityScore <= 0.9) {
		prefixList = DB_ITEM_NOMENCLATURE.qualityPrefixes.good;
		itemQuality = 3; // Q3 (Purple)
	} else {
		prefixList = DB_ITEM_NOMENCLATURE.qualityPrefixes.excellent;
		itemQuality = 4; // Q4 (Gold)
	}

	// ------------------------------------------------------------------------
	// 4. DETERMINISTIC NOMENCLATURE
	// ------------------------------------------------------------------------
	const prefix = getRandomElement(prefixList);
	const material = DB_ITEM_NOMENCLATURE.materials[safeClassLower][tierIndex] || 'Unknown';
	const typeCategory = getRandomElement(DB_ITEM_NOMENCLATURE.types[safeClassLower]) || 'Item';

	const generatedName = `${prefix} ${material} ${typeCategory}`;

	// ------------------------------------------------------------------------
	// 5. DURABILITY & STATE
	// ------------------------------------------------------------------------
	let conditionRoll = 100;
	const genParams = WORLD.ITEM.GENERAL.generationContexts;

	if (safeContext === 'trade') {
		conditionRoll = genParams.trade.conditionBase;
	} else if (safeContext === 'npc') {
		const minCond = genParams.npc.minCondition + tier * genParams.npc.conditionPerRank;
		conditionRoll = getRandomInt(Math.min(minCond, 100), 100);
	} else if (safeContext === 'loot') {
		const minCond = genParams.loot.maxCondition - tier * genParams.loot.penaltyPerTier;
		conditionRoll = getRandomInt(Math.max(minCond, 1), 100);
	}

	const maxDurability = WORLD.ITEM.GENERAL.fullDurability;
	const currentDurability = Math.floor(maxDurability * (conditionRoll / 100));

	// ------------------------------------------------------------------------
	// 6. ECONOMY RESOLUTION
	// ------------------------------------------------------------------------
	const goldPrice = WORLD.ECONOMY.baseValues.coinRegionalBaseCost;
	const eipAdpMult = WORLD.ITEM.GENERAL.eipPerAdp;
	const eipDdrMult = WORLD.ITEM.GENERAL.eipPerDdr;

	const baseCoinValue = Math.floor(adp * eipAdpMult * goldPrice + ddr * eipDdrMult * goldPrice);

	// ------------------------------------------------------------------------
	// 7. ENTITY ASSEMBLY
	// ------------------------------------------------------------------------
	return {
		entityId: generateUUID(),
		itemName: generatedName,
		classification: {
			itemCategory: 'Physical',
			itemClass: itemClass,
			itemSubclass: typeCategory,
			itemTier: tier,
			itemQuality: itemQuality, // Embedded Q-Rating for UI rendering
		},
		stats: { adp: adp, ddr: ddr, mass: categoryConfig.baseMass },
		state: { currentDurability: currentDurability, maxDurability: maxDurability },
		economy: { baseCoinValue: baseCoinValue },
	};
};
