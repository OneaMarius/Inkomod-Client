// File: src/engine/ENGINE_LootCreation.js
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';
import {
	getRandomInt,
	generateUUID,
	getRandomElement,
} from '../utils/RandomUtils.js';
import { formatForUI } from '../utils/NameFormatter.js';

// --- THE SCALING MATRIX ---
const LOOT_SCALING_CONFIG = {
	Human: {
		1: { minVal: 2, maxVal: 8, minMass: 1, maxMass: 2 },
		2: { minVal: 8, maxVal: 18, minMass: 1, maxMass: 2 },
		3: { minVal: 18, maxVal: 35, minMass: 1, maxMass: 3 },
		4: { minVal: 35, maxVal: 65, minMass: 1, maxMass: 3 },
		5: { minVal: 65, maxVal: 120, minMass: 2, maxMass: 3 },
	},
	Animal: {
		1: { minVal: 1, maxVal: 5, minMass: 1, maxMass: 3 },
		2: { minVal: 5, maxVal: 15, minMass: 2, maxMass: 4 },
		3: { minVal: 15, maxVal: 30, minMass: 2, maxMass: 5 },
		4: { minVal: 30, maxVal: 55, minMass: 3, maxMass: 6 },
		5: { minVal: 55, maxVal: 100, minMass: 3, maxMass: 8 },
	},
	Monster: {
		1: { minVal: 5, maxVal: 15, minMass: 1, maxMass: 3 },
		2: { minVal: 15, maxVal: 35, minMass: 2, maxMass: 4 },
		3: { minVal: 35, maxVal: 70, minMass: 2, maxMass: 5 },
		4: { minVal: 70, maxVal: 130, minMass: 3, maxMass: 6 },
		5: { minVal: 130, maxVal: 250, minMass: 4, maxMass: 8 },
	},
	Nephilim: {
		1: { minVal: 10, maxVal: 25, minMass: 1, maxMass: 2 },
		2: { minVal: 25, maxVal: 60, minMass: 1, maxMass: 3 },
		3: { minVal: 60, maxVal: 120, minMass: 2, maxMass: 4 },
		4: { minVal: 120, maxVal: 220, minMass: 2, maxMass: 5 },
		5: { minVal: 220, maxVal: 400, minMass: 3, maxMass: 6 },
	},
};

/**
 * Generates a loot item based on the entity's category and rank.
 * @param {String} entityCategory - 'Human', 'Nephilim', 'Animal', 'Monster'
 * @param {Number} rank - The rank of the entity dropping the loot (1 to 5)
 */
export const generateLootItem = (entityCategory, rank = 1) => {
	const nomenclator = DB_ITEM_NOMENCLATURE;

	const targetCategory =
		entityCategory || getRandomElement(nomenclator.lootCategories);
	const pool =
		nomenclator.lootPools[targetCategory] || nomenclator.lootPools['Human'];
	const itemDef = getRandomElement(pool);
	const prefix = getRandomElement(itemDef.prefixes);
	const cleanName = formatForUI(itemDef.name);
	const finalName = `${prefix} ${cleanName}`;

	// --- NEW: CLAMP RANK AND FETCH SCALING DATA ---
	const clampedRank = Math.max(1, Math.min(5, Math.floor(rank)));
	const limits = LOOT_SCALING_CONFIG[targetCategory][clampedRank];

	const mass = getRandomInt(limits.minMass, limits.maxMass);
	// Base Value is the true value at a Neutral RER (e.g. 10)
	const baseValue = getRandomInt(limits.minVal, limits.maxVal);

	return {
		entityId: generateUUID(),
		itemName: finalName,
		classification: {
			itemCategory: 'Loot',
			itemClass: targetCategory,
			itemSubclass: cleanName,
			itemTier: clampedRank, // Use the clamped rank here instead of '1'
		},
		stats: { mass: mass },
		economy: { baseCoinValue: baseValue },
	};
};
