// File: src/engine/ENGINE_EquipmentCreation.js
// Description: Procedural generation engine for weapons, armours, shields, and helmets.

import { WORLD } from '../data/GameWorld.js';
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';

/**
 * Utility function to generate a pseudo-random integer within bounds.
 */
const getRandomInt = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Utility function to pick a random element from an array.
 */
const getRandomElement = (arr) => {
	return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Generates a standard UUID v4 string for entity identification.
 */
const generateUUID = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

/**
 * Main THOR Engine logic for instantiating an equipment item.
 * @param {string} itemClass - 'Weapon', 'Armour', 'Shield', or 'Helmet'
 * @param {number|null} itemTier - Optional. Integer between 1 and 5. If null, generated randomly.
 * @param {string} generationContext - 'Trade', 'NPC', or 'Loot'
 * @returns {Object} Instantiated ITEM_TEMPLATE object
 */
export const generateItem = (
	itemClass,
	itemTier = null,
	generationContext = 'Trade',
) => {
	// 1. Sanitize inputs and establish baseline pointers
	const safeClass = itemClass.toUpperCase();
	const safeClassLower = itemClass.toLowerCase();
	const safeContext = generationContext.toLowerCase();

	const maxAllowedTier = WORLD.ITEM?.GENERAL?.maxTier || 5;

	// Ensure tier is within engine limits, or randomize if null
	let tier;
	if (itemTier !== null && itemTier !== undefined) {
		tier = Math.max(1, Math.min(itemTier, maxAllowedTier));
	} else {
		tier = getRandomInt(1, maxAllowedTier);
	}

	const tierIndex = tier - 1; // 0-indexed for array lookups

	// Fetch categorical boundaries
	const categoryConfig = WORLD.ITEM[safeClass];
	if (!categoryConfig)
		throw new Error(`THOR Engine Error: Invalid itemClass [${itemClass}]`);

	// 2. Resolve Base Stats (ADP & DDR)
	const adp = getRandomInt(
		categoryConfig.adpBounds.min[tierIndex],
		categoryConfig.adpBounds.max[tierIndex],
	);

	const ddr = getRandomInt(
		categoryConfig.ddrBounds.min[tierIndex],
		categoryConfig.ddrBounds.max[tierIndex],
	);

	// 3. Resolve Nomenclature (Name Generation)
	const nomenclature = DB_ITEM_NOMENCLATURE; // 2. Update this reference
	const prefix = getRandomElement(nomenclature.prefixes[safeClassLower]);
	const typeCategory = getRandomElement(nomenclature.classes[safeClassLower]);
	const subclass = getRandomElement(
		nomenclature.subclasses[safeClassLower][typeCategory.toLowerCase()],
	);
	const suffix = getRandomElement(nomenclature.suffixes);

	const generatedName = `${prefix} ${subclass} ${suffix}`;

	// 4. Resolve Durability based on Generation Context
	let conditionRoll = 100;
	const genParams = WORLD.ITEM.GENERAL.generationContexts;

	if (safeContext === 'trade') {
		conditionRoll = genParams.trade.conditionBase;
	} else if (safeContext === 'npc') {
		const minCond =
			genParams.npc.minCondition + tier * genParams.npc.conditionPerRank;
		conditionRoll = getRandomInt(Math.min(minCond, 100), 100);
	} else if (safeContext === 'loot') {
		const minCond =
			genParams.loot.maxCondition - tier * genParams.loot.penaltyPerTier;
		conditionRoll = getRandomInt(Math.max(minCond, 1), 100);
	}

	const maxDurability = WORLD.ITEM.GENERAL.fullDurability;
	const currentDurability = Math.floor(maxDurability * (conditionRoll / 100));

	// 5. Calculate Economy (EIP - Economic Index Points)
	const goldPrice = WORLD.ECONOMY.baseValues.coinRegionalBaseCost;
	const eipAdpMult = WORLD.ITEM.GENERAL.eipPerAdp;
	const eipDdrMult = WORLD.ITEM.GENERAL.eipPerDdr;

	const baseCoinValue = Math.floor(
		adp * eipAdpMult * goldPrice + ddr * eipDdrMult * goldPrice,
	);

	// 6. Construct and Return the Entity Template
	return {
		entityId: generateUUID(),
		itemName: generatedName,
		classification: {
			itemCategory: 'Physical',
			itemClass: itemClass, // Original casing ('Weapon', etc.)
			itemSubclass: subclass, // Extracted from nomenclature (e.g., 'Kite Shield')
			itemTier: tier,
		},
		stats: {
			adp: adp,
			ddr: ddr,
			mass: categoryConfig.baseMass,
		},
		state: {
			currentDurability: currentDurability,
			maxDurability: maxDurability,
		},
		economy: {
			baseCoinValue: baseCoinValue,
		},
	};
};
