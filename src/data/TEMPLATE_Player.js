// File: src/data/TEMPLATE_Player.js
// Description: Initial blueprint and state data structure for the Player entity.

export const TEMPLATE_PLAYER = {
	identity: {
		name: 'Unknown Knight',
		age: 18, // Starting age before progression aging mechanics apply
		patronGod: 'None', // Selected during character creation
		religion: 'None', // Selected during character creation
		rank: 1, // Current progression tier
	},

	biology: {
		hpCurrent: 100, // Matches WORLD.PLAYER.hpLimits.starting
		hpMax: 100,
		isStarving: false, // Flag for applying WORLD.PLAYER.healingRates.starving
	},

	stats: {
		str: 10, // Base starting stat (Tier 1 cap)
		agi: 10, // Base starting stat
		int: 10, // Base starting stat
		ad: 10, // Base Attack Damage (unarmed/base logic)
		dr: 0, // Base Defense Damage Reduction (naked)
	},

	progression: {
		actionPoints: 8, // Matches WORLD.PLAYER.baseAp
		honor: 0,
		renown: 0,
		reputationClass: 'Neutral',
	},

	logistics: {
		currentEncumbrance: 0, // Dynamic calculation: sum of physical arrays + numeric mass ratios
		maxCapacity: 50, // Base capacity, recalculates dynamically based on STR
	},

	equipment: {
		// Boolean flags utilized directly by the combat probability pools
		hasWeapon: false,
		hasShield: false,
		hasArmor: false,
		hasHelmet: false,
		hasMount: false,

		// Direct references to the equipped item objects (for AD/DR calculation and degradation)
		weaponItem: null,
		shieldItem: null,
		armorItem: null,
		helmetItem: null,
		mountItem: null,
	},

	inventory: {
		// --------------------------------------------------------------------
		// Numeric Counters (Fake Slots) - Subject to mass ratio conversions
		// --------------------------------------------------------------------
		silverCoins: 0, // Base physical currency
		goldCoins: 0, // Abstract standard / high-tier currency
		food: 0, // Daily upkeep consumable
		healingPotions: 0, // Combat consumable (+25 HP)
		tradeSilver: 0, // Regional trade good
		tradeGold: 0, // Regional trade good

		// --------------------------------------------------------------------
		// Physical Arrays - Subject to WORLD.PLAYER.inventoryLimits
		// --------------------------------------------------------------------
		animalSlots: [], // Array of stored animal/livestock objects (Max 10)
		itemSlots: [], // Array of stored equippable gear (Max 20)
		lootSlots: [], // Array of non-equippable monster parts/trophies (Max 15)
	},
};
