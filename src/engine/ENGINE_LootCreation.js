// File: src/engine/ENGINE_LootCreation.js
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';

export const generateLootItem = () => {
	const nomenclator = DB_ITEM_NOMENCLATURE;

	// Select Random Class
	const lootClass = nomenclator.lootClasses[Math.floor(Math.random() * nomenclator.lootClasses.length)];

	// Select Random Subclass
	const subclasses = nomenclator.lootSubclasses[lootClass];
	const lootSubclass = subclasses[Math.floor(Math.random() * subclasses.length)];

	// Select Random Prefix
	const prefix = nomenclator.lootPrefixes[Math.floor(Math.random() * nomenclator.lootPrefixes.length)];

	const finalName = `${prefix} ${lootSubclass}`;

	// Randomize Mass (1 to 5 kg) and Base Coin Value (5 to 30 C)
	const mass = getRandomInt(1, 5);
	const baseValue = getRandomInt(5, 30);

	return {
		entityId: generateUUID(),
		itemName: finalName,
		classification: {
			itemCategory: 'Loot',
			itemClass: lootClass,
			itemSubclass: lootSubclass,
			// Loot items don't strictly need a tier, but providing one ensures UI components don't crash
			itemTier: 1,
		},
		stats: { mass: mass },
		economy: { baseCoinValue: baseValue },
	};
};
