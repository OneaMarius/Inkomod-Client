// File: src/engine/ENGINE_LootCreation.js
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';
import {
	getRandomInt,
	generateUUID,
	getRandomElement,
} from '../utils/RandomUtils.js';
import { formatForUI } from '../utils/NameFormatter.js';

/**
 * Generates a loot item based on the entity's category.
 * @param {String} entityCategory - 'Human', 'Nephilim', 'Animal', 'Monster'
 */
export const generateLootItem = (entityCategory) => {
	const nomenclator = DB_ITEM_NOMENCLATURE;

	// 1. Determine the target category.
	// If none provided, pick one at random from our new lootCategories list.
	const targetCategory =
		entityCategory || getRandomElement(nomenclator.lootCategories);

	// 2. Access the specific pool for this category
	const pool =
		nomenclator.lootPools[targetCategory] || nomenclator.lootPools['Human'];

	// 3. Select a random item definition from the pool
	const itemDef = getRandomElement(pool);

	// 4. Select a random prefix from that specific item's prefix list
	const prefix = getRandomElement(itemDef.prefixes);

	// 5. Clean and format strings
	const cleanName = formatForUI(itemDef.name);
	const finalName = `${prefix} ${cleanName}`;

	// 6. Calculate stats based on category logic
	// We can make Monster/Nephilim loot heavier or more valuable
	let minMass = 1,
		maxMass = 3;
	let minValue = 5,
		maxValue = 20;

	if (targetCategory === 'Monster' || targetCategory === 'Nephilim') {
		minValue = 15;
		maxValue = 50;
		maxMass = 5;
	}

	const mass = getRandomInt(minMass, maxMass);
	const baseValue = getRandomInt(minValue, maxValue);

	return {
		entityId: generateUUID(),
		itemName: finalName,
		classification: {
			itemCategory: 'Loot',
			itemClass: targetCategory, // Use the Entity Category as the Item Class (e.g., 'Animal Loot')
			itemSubclass: cleanName,
			itemTier: 1,
		},
		stats: { mass: mass },
		economy: { baseCoinValue: baseValue },
	};
};
