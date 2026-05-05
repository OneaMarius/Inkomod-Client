// File: src/engine/ENGINE_LootCreation.js
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';
import { formatForUI } from '../utils/NameFormatter.js';

// --- THE SCALING MATRIX ---
const LOOT_SCALING_CONFIG = {
	Human: {
		1: { minVal: 10, maxVal: 20, minMass: 1, maxMass: 2 },
		2: { minVal: 20, maxVal: 40, minMass: 1, maxMass: 2 },
		3: { minVal: 30, maxVal: 60, minMass: 1, maxMass: 3 },
		4: { minVal: 40, maxVal: 80, minMass: 1, maxMass: 3 },
		5: { minVal: 50, maxVal: 100, minMass: 2, maxMass: 3 },
	},
	Animal: {
		1: { minVal: 5, maxVal: 25, minMass: 1, maxMass: 2 },
		2: { minVal: 15, maxVal: 45, minMass: 2, maxMass: 3 },
		3: { minVal: 25, maxVal: 75, minMass: 3, maxMass: 4 },
		4: { minVal: 50, maxVal: 100, minMass: 4, maxMass: 5 },
		5: { minVal: 75, maxVal: 125, minMass: 5, maxMass: 6 },
	},
	Monster: {
		1: { minVal: 25, maxVal: 50, minMass: 1, maxMass: 3 },
		2: { minVal: 50, maxVal: 100, minMass: 2, maxMass: 4 },
		3: { minVal: 75, maxVal: 150, minMass: 3, maxMass: 5 },
		4: { minVal: 100, maxVal: 200, minMass: 4, maxMass: 6 },
		5: { minVal: 125, maxVal: 250, minMass: 5, maxMass: 7 },
	},
	Nephilim: {
		1: { minVal: 50, maxVal: 100, minMass: 1, maxMass: 2 },
		2: { minVal: 75, maxVal: 150, minMass: 3, maxMass: 4 },
		3: { minVal: 100, maxVal: 200, minMass: 5, maxMass: 6 },
		4: { minVal: 150, maxVal: 300, minMass: 7, maxMass: 8 },
		5: { minVal: 250, maxVal: 500, minMass: 9, maxMass: 10 },
	},
};

/**
 * Generates a loot item based on the entity's category and rank.
 * @param {String} entityCategory - 'Human', 'Nephilim', 'Animal', 'Monster'
 * @param {Number} rank - The rank of the entity dropping the loot (1 to 5)
 */
export const generateLootItem = (entityCategory, rank = 1) => {
	const nomenclator = DB_ITEM_NOMENCLATURE;

	const targetCategory = entityCategory || getRandomElement(nomenclator.lootCategories);
	const pool = nomenclator.lootPools[targetCategory] || nomenclator.lootPools['Human'];
	const itemDef = getRandomElement(pool);

	// Clamp the rank to ensure it stays within the 1-5 boundary
	const clampedRank = Math.max(1, Math.min(5, Math.floor(rank)));

	// Determine the prefix based on the clamped rank (Index 0 for Rank 1, Index 4 for Rank 5)
	const prefixIndex = clampedRank - 1;
	const prefix = itemDef.prefixes[prefixIndex];

	const cleanName = formatForUI(itemDef.name);
	const finalName = `${prefix} ${cleanName}`;

	const limits = LOOT_SCALING_CONFIG[targetCategory][clampedRank];

	const mass = getRandomInt(limits.minMass, limits.maxMass);
	const baseValue = getRandomInt(limits.minVal, limits.maxVal);

	return {
		entityId: generateUUID(),
		itemName: finalName,
		classification: { itemCategory: 'Loot', itemClass: targetCategory, itemSubclass: cleanName, itemTier: clampedRank },
		stats: { mass: mass },
		economy: { baseCoinValue: baseValue },
	};
};
