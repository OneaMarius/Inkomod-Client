// File: src/engine/ENGINE_LootCreation.js
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';
import { formatForUI } from '../utils/NameFormatter.js'; // <-- Adăugat pentru curățarea numelor

export const generateLootItem = () => {
	const nomenclator = DB_ITEM_NOMENCLATURE;

	// Select Random Class, Subclass, and Prefix using the utility function
	const lootClass = getRandomElement(nomenclator.lootClasses);
	const subclasses = nomenclator.lootSubclasses[lootClass];
	const rawLootSubclass = getRandomElement(subclasses);
	const prefix = getRandomElement(nomenclator.lootPrefixes);

	// Curățăm subclasa de eventualele underscore-uri (ex: "Silver_Chalice" -> "Silver Chalice")
	const cleanLootSubclass = formatForUI(rawLootSubclass);

	// Numele final gata pentru a fi afișat în UI
	const finalName = `${prefix} ${cleanLootSubclass}`;

	// Randomize Mass (1 to 5 kg) and Base Coin Value (5 to 30 C)
	const mass = getRandomInt(1, 5);
	const baseValue = getRandomInt(5, 30);

	return {
		entityId: generateUUID(),
		itemName: finalName,
		classification: {
			itemCategory: 'Loot',
			itemClass: formatForUI(lootClass), // Curățăm și clasa, just in case
			itemSubclass: cleanLootSubclass,
			// Loot items don't strictly need a tier, but providing one ensures UI components don't crash
			itemTier: 1,
		},
		stats: { mass: mass },
		economy: { baseCoinValue: baseValue },
	};
};
