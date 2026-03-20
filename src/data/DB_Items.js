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
	state: {
		currentDurability: 100,
		maxDurability: 100,
	},
	economy: {
		baseCoinValue: 0, // Calculated via EIP
	},
};

// Items that bypass procedural generation
export const DB_ITEMS_STATIC = [
	{
		itemId: 'consumable_salve_01',
		itemName: 'Basic Healing Salve',
		classification: {
			itemCategory: 'Consumable',
			itemClass: 'Medical',
		},
		stats: {
			healingValue: 15,
			mass: 1,
		},
		economy: {
			baseCoinValue: 20,
		},
	},
	// Quest items, keys, specific materials
];

// Hand-crafted legendary gear that ignores normal tier boundaries
export const DB_ITEMS_ARTIFACTS = [
	{
		itemId: 'artifact_sword_01',
		itemName: 'The Kingslayer',
		classification: {
			itemCategory: 'Physical',
			itemClass: 'Weapon',
			itemSubclass: 'Sword',
			itemTier: 5,
		},
		stats: {
			adp: 150, // Exceeds standard bounds
			ddr: 5,
			mass: 6,
		},
		state: {
			currentDurability: 200, // Unbreakable or highly durable
			maxDurability: 200,
		},
		economy: {
			baseCoinValue: 5000,
		},
	},
];

// Description: Taxonomy and nomenclature database for physical items and equipment.

export const DB_ITEM_NOMENCLATURE = {
	categories: ['Weapon', 'Shield', 'Helmet', 'Armour'],
	suffixes: [
		'of the King',
		'of Thor',
		'of the Bear',
		'of the Vanguard',
		'of Zeus',
		'of the Shadows',
		'of Iron Nature',
		'of the Old Days',
		'of the Knight',
		'of Mars',
		'of Odin',
		'of the Wolf',
		'of the Boar',
		'of the Stag',
		'of the Forest',
		'of the Mountains',
		'of the Defender',
		'of the Champion',
		'of the Ancients',
		'of the Wilds',
		'of Athena',
		'of Apollo',
		'of the Crusader',
		'of the Warlord',
		'of the Forge',
		'of the Dawn',
		'of the Eclipse',
	],
	classes: {
		weapon: ['Blunt', 'Sharp'],
		shield: ['Wood', 'Iron', 'Steel'],
		armour: ['Cloth', 'Leather', 'Bronze', 'Iron', 'Steel', 'Gold'],
		helmet: ['Cloth', 'Leather', 'Bronze', 'Iron', 'Steel', 'Gold'],
	},
	subclasses: {
		weapon: {
			blunt: ['Mace', 'Hammer', 'Club', 'Morningstar'],
			sharp: ['Sword', 'Axe', 'Dagger', 'Spear'],
		},
		shield: {
			wood: ['Wooden Buckler', 'Kite Shield', 'Targe'],
			iron: ['Iron Buckler', 'Heater Shield', 'Iron Tower Shield'],
			steel: ['Steel Kite Shield', 'Heavy Steel Shield', 'Pavise'],
		},
		armour: {
			cloth: ['Robes', 'Tunic', 'Gambeson'],
			leather: ['Leather Tunic', 'Brigandine', 'Cuirbouilli'],
			bronze: ['Bronze Cuirass', 'Bronze Scales'],
			iron: ['Iron Hauberk', 'Chainmail', 'Iron Cuirass'],
			steel: ['Steel Plate', 'Steel Half-Plate'],
			gold: ['Golden Chestplate', 'Golden Regalia'],
		},
		helmet: {
			cloth: ['Hood', 'Cowl'],
			leather: ['Leather Cap', 'Coif'],
			bronze: ['Bronze Helm', 'Bronze Crest'],
			iron: ['Iron Bascinet', 'Iron Sallet', 'Skullcap'],
			steel: ['Steel Greathelm', 'Steel Visor', 'Armet'],
			gold: ['Golden Crown', 'Golden Mask'],
		},
	},
	prefixes: {
		weapon: [
			'Heavy',
			'Swift',
			'Balanced',
			'Strong',
			'Powerful',
			'Light',
			'Ancient',
			'Masterwork',
		],
		armour: [
			'Sturdy',
			'Reinforced',
			'Light',
			'Imposing',
			'Ancient',
			'Masterwork',
		],
		shield: [
			'Heavy',
			'Defensive',
			'Balanced',
			'Stalwart',
			'Ancient',
			'Masterwork',
		],
		helmet: ['Sturdy', 'Plated', 'Light', 'Visored', 'Ancient', 'Masterwork'],
	},
};
