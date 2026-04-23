// File: src/data/DB_Items.js
// Description: Item templates, static consumables, and fixed-stat artifacts.

// The mandatory schema that the THOR engine must output when generating an item.
export const ITEM_TEMPLATE = {
	entityId: '', // UUID generated at runtime
	itemName: '', // Procedurally generated string
	classification: {
		itemCategory: '', // Physical, Consumable, Quest
		itemClass: '', // Weapon, Armor, Shield, Helmet
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
	categories: ['Weapon', 'Shield', 'Armor', 'Helmet'],
	// 1. Materials strictly bound to Tier (1 to 5)
	materials: {
		weapon: ['Copper', 'Bronze', 'Iron', 'Steel', 'Meteoric'],
		shield: ['Wood', 'Hide', 'Iron', 'Steel', 'Obsidian'],
		armor: ['Cloth', 'Leather', 'Chainmail', 'Scale', 'Plate'],
		helmet: ['Leather', 'Bronze', 'Iron', 'Steel', 'Meteoric'],
	},

	// 2. Base item types (Single words)
	types: {
		weapon: ['Sword', 'Axe', 'Mace', 'Spear', 'Dagger'],
		shield: ['Buckler', 'Targe', 'Heater', 'Kite', 'Tower'],
		armor: ['Tunic', 'Gambeson', 'Hauberk', 'Cuirass', 'Brigandine'],
		helmet: ['Hood', 'Coif', 'Sallet', 'Armet', 'Helm'],
	},

	// 3. Quality prefixes determined by stat generation percentage
	qualityPrefixes: {
		poor: ['Flawed', 'Crude', 'Shoddy', 'Dull'],
		average: ['Basic', 'Common', 'Standard', 'Plain'],
		good: ['Fine', 'Solid', 'Sturdy', 'Honed'],
		excellent: ['Exquisite', 'Flawless', 'Perfect', 'Masterwork'],
	},

	// 4. Dynamic Loot Pools based on Entity Category
	lootCategories: ['Human', 'Nephilim', 'Animal', 'Monster'],

	lootPools: {
		Human: [
			{ name: 'Pouch', prefixes: ['Tattered', 'Leather', 'Heavy', 'Empty'] },
			{ name: 'Ring', prefixes: ['Tarnished', 'Silver', 'Brass', 'Engraved'] },
			{ name: 'Keepsake', prefixes: ['Wooden', 'Carved', 'Blood-stained', 'Forgotten'] },
			{ name: 'Cloth Scrap', prefixes: ['Silk', 'Linen', 'Dirty', 'Fine'] },
			{ name: 'Whetstone', prefixes: ['Chipped', 'Smooth', 'Used', 'Standard'] },
			{ name: 'Badge', prefixes: ['Rusted', 'Dented', 'Polished', 'Broken'] },
			{ name: 'Locket', prefixes: ['Closed', 'Smashed', 'Silver', 'Ornate'] },
			{ name: 'Dice', prefixes: ['Bone', 'Wood', 'Loaded', 'Worn'] },
		],
		Nephilim: [
			{ name: 'Shard', prefixes: ['Luminous', 'Shattered', 'Resonant', 'Ethereal'] },
			{ name: 'Ember', prefixes: ['Dying', 'Pulsing', 'Void', 'Divine'] },
			{ name: 'Dust', prefixes: ['Celestial', 'Profane', 'Glittering', 'Coagulated'] },
			{ name: 'Relic', prefixes: ['Ancient', 'Fractured', 'Glowing', 'Dark'] },
			{ name: 'Tear', prefixes: ['Crystallized', 'Petrified', 'Shining', 'Opaque'] },
			{ name: 'Sigil', prefixes: ['Carved', 'Burning', 'Obsidian', 'Gold'] },
		],
		Animal: [
			{ name: 'Pelt', prefixes: ['Torn', 'Intact', 'Pristine', 'Matted'] },
			{ name: 'Hide', prefixes: ['Thick', 'Scarred', 'Tough', 'Ruined'] },
			{ name: 'Fang', prefixes: ['Chipped', 'Sharp', 'Yellowed', 'Massive'] },
			{ name: 'Claw', prefixes: ['Dull', 'Curved', 'Broken', 'Lethal'] },
			{ name: 'Bone', prefixes: ['Cracked', 'Bleached', 'Heavy', 'Splintered'] },
			{ name: 'Sinew', prefixes: ['Dried', 'Strong', 'Taut', 'Snapped'] },
			{ name: 'Horn', prefixes: ['Jagged', 'Smooth', 'Broken', 'Twisted'] },
		],
		Monster: [
			{ name: 'Ichor', prefixes: ['Putrid', 'Glowing', 'Thick', 'Foul'] },
			{ name: 'Ash', prefixes: ['Smoldering', 'Cold', 'Cursed', 'Grey'] },
			{ name: 'Essence', prefixes: ['Fading', 'Corrupted', 'Volatile', 'Trapped'] },
			{ name: 'Scale', prefixes: ['Hardened', 'Slimy', 'Cracked', 'Iridescent'] },
			{ name: 'Flesh', prefixes: ['Rotten', 'Petrified', 'Mutated', 'Charred'] },
			{ name: 'Eye', prefixes: ['Vile', 'Blind', 'Staring', 'Glassy'] },
			{ name: 'Marrow', prefixes: ['Blackened', 'Crystallized', 'Oozing', 'Frozen'] },
		],
	},
};
