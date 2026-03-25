// File: src/data/DB_Items.js
// Description: Item templates, static consumables, and fixed-stat artifacts.

// The mandatory schema that the THOR engine must output when generating an item.
export const ITEM_TEMPLATE = {
	entityId: '', // UUID generated at runtime
	itemName: '', // Procedurally generated string
	classification: {
		itemCategory: '', // Physical, Consumable, Quest
		itemClass: '', // Weapon, Armour, Shield, Helmet
		itemSubclass: '', // Sword, Kite Shield, Plate, etc.
		itemTier: 1, // 1 to 5
	},
	stats: {
		adp: 0, // Attack Damage Power
		ddr: 0, // Defense Damage Reduction
		mass: 0, // Base mass from WORLD.ITEM
	},
	state: { currentDurability: 100, maxDurability: 100 },
	economy: {
		baseCoinValue: 0, // Calculated via EIP
	},
};

// Items that bypass procedural generation
export const DB_ITEMS_STATIC = [
	{
		itemId: 'consumable_salve_01',
		itemName: 'Basic Healing Salve',
		classification: { itemCategory: 'Consumable', itemClass: 'Medical' },
		stats: { healingValue: 15, mass: 1 },
		economy: { baseCoinValue: 20 },
	},
	// Quest items, keys, specific materials
];

// Hand-crafted legendary gear that ignores normal tier boundaries
export const DB_ITEMS_ARTIFACTS = [
	{
		itemId: 'artifact_sword_01',
		itemName: 'The Kingslayer',
		classification: { itemCategory: 'Physical', itemClass: 'Weapon', itemSubclass: 'Sword', itemTier: 5 },
		stats: {
			adp: 150, // Exceeds standard bounds
			ddr: 5,
			mass: 6,
		},
		state: {
			currentDurability: 200, // Unbreakable or highly durable
			maxDurability: 200,
		},
		economy: { baseCoinValue: 5000 },
	},
];

// Description: Taxonomy and nomenclature database for physical items and equipment.

export const DB_ITEM_NOMENCLATURE = {
	categories: ['Weapon', 'Shield', 'Armour', 'Helmet'],
	// 1. Materials strictly bound to Tier (1 to 5)
	materials: {
		weapon: ['Copper', 'Bronze', 'Iron', 'Steel', 'Meteoric'],
		shield: ['Wood', 'Hide', 'Iron', 'Steel', 'Obsidian'],
		armour: ['Cloth', 'Leather', 'Chainmail', 'Scale', 'Plate'],
		helmet: ['Leather', 'Bronze', 'Iron', 'Steel', 'Meteoric'],
	},

	// 2. Base item types (Single words)
	types: {
		weapon: ['Sword', 'Axe', 'Mace', 'Spear', 'Dagger'],
		shield: ['Buckler', 'Targe', 'Heater', 'Kite', 'Tower'],
		armour: ['Tunic', 'Gambeson', 'Hauberk', 'Cuirass', 'Brigandine'],
		helmet: ['Hood', 'Coif', 'Sallet', 'Armet', 'Helm'],
	},

	// 3. Quality prefixes determined by stat generation percentage
	qualityPrefixes: {
		poor: ['Flawed', 'Crude', 'Shoddy', 'Dull'],
		average: ['Basic', 'Common', 'Standard', 'Plain'],
		good: ['Fine', 'Solid', 'Sturdy', 'Honed'],
		excellent: ['Exquisite', 'Flawless', 'Perfect', 'Masterwork'],
	},

	// Nomenclature for Loot (Trade Materials)
	lootClasses: ['Furs', 'Minerals', 'Textiles', 'Woods'],
	lootSubclasses: {
		Furs: ['Wolf Pelt', 'Bear Skin', 'Fox Fur', 'Boar Hide'],
		Minerals: ['Iron Ore', 'Copper Ore', 'Coal Slab', 'Raw Silver'],
		Textiles: ['Linen Bolt', 'Wool Roll', 'Silk Bundle'],
		Woods: ['Pine Logs', 'Oak Timber', 'Ironwood Branches'],
	},
	lootPrefixes: ['Raw', 'Unrefined', 'High Quality', 'Pristine', 'Torn', 'Common'],
};
