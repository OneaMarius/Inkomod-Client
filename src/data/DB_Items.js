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

// ========================================================================
// UNIQUE QUEST ITEMS & TROPHIES
// ========================================================================

export const DB_NEPHILIM_TROPHIES = {
	Wolfscar: {
		entityId: 'trophy_wolfscar',
		itemName: 'Head of Wolfscar',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Wolfscar', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 5 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Gloomfeather: {
		entityId: 'trophy_gloomfeather',
		itemName: 'Head of Gloomfeather',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Gloomfeather', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 4 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Ironcog: {
		entityId: 'trophy_ironcog',
		itemName: 'Head of Ironcog',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Ironcog', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 8 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Twinspawn: {
		entityId: 'trophy_twinspawn',
		itemName: 'Head of Twinspawn',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Twinspawn', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 6 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Cinderheart: {
		entityId: 'trophy_cinderheart',
		itemName: 'Head of Cinderheart',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Cinderheart', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 7 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Dunejackal: {
		entityId: 'trophy_dunejackal',
		itemName: 'Head of Dunejackal',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Dunejackal', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 5 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Drakescale: {
		entityId: 'trophy_drakescale',
		itemName: 'Head of Drakescale',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Drakescale', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 10 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Viperfang: {
		entityId: 'trophy_viperfang',
		itemName: 'Head of Viperfang',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Viperfang', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 4 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Ganeshai: {
		entityId: 'trophy_ganeshai',
		itemName: 'Head of Ganeshai',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Ganeshai', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 12 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Cloudshrike: {
		entityId: 'trophy_cloudshrike',
		itemName: 'Head of Cloudshrike',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Cloudshrike', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 3 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Carrionbeak: {
		entityId: 'trophy_carrionbeak',
		itemName: 'Head of Carrionbeak',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Carrionbeak', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 4 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Ironhoof: {
		entityId: 'trophy_ironhoof',
		itemName: 'Head of Ironhoof',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Ironhoof', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 9 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Croctusk: {
		entityId: 'trophy_croctusk',
		itemName: 'Head of Croctusk',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Croctusk', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 11 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Venomstalker: {
		entityId: 'trophy_venomstalker',
		itemName: 'Head of Venomstalker',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Venomstalker', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 5 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Hivelord: {
		entityId: 'trophy_hivelord',
		itemName: 'Head of Hivelord',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Hivelord', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 6 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
	Ogreblood: {
		entityId: 'trophy_ogreblood',
		itemName: 'Head of Ogreblood',
		classification: { itemCategory: 'Trophy', itemClass: 'Nephilim_Head', itemSubclass: 'Ogreblood', itemTier: 5 },
		stats: { adp: 0, ddr: 0, mass: 10 },
		state: null,
		economy: { baseCoinValue: 0 },
	},
};

// Funcție utilitară pentru a extrage un trofeu o copie fresh
export const getNephilimTrophy = (subclassName) => {
	// subclassName trebuie sa fie cu litera mare, ex: 'Wolfscar'
	const nameFormatted = subclassName.charAt(0).toUpperCase() + subclassName.slice(1).toLowerCase();
	const baseTrophy = DB_NEPHILIM_TROPHIES[nameFormatted];

	if (baseTrophy) {
		// Returnăm o copie adâncă pentru a nu modifica baza de date când o băgăm în inventar
		return JSON.parse(JSON.stringify(baseTrophy));
	}
	return null;
};
