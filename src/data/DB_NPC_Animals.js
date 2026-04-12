// File: src/data/DB_NPC_Animals.js
// Description: Taxonomy, behavioral profiles, resource classification, and stat modifiers for Animal entities.

export const DB_NPC_ANIMALS = {
	// ========================================================================
	// CLASS: WILD (Untamed regions) - Minimum 2 per Rank (1-5)
	// ========================================================================

	// --- RANK 1: Small Wild Game ---
	Hare: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Hare' },
		behavior: { behaviorState: 'Friendly', isAlert: true, fleeHpPercentThreshold: 0.99 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 2, max: 4 }, foodConversionFactor: 12.0 },
		generationProfile: {
			rank: 1,
			baseHpBounds: { min: 11, max: 15 },
			innateAdpBounds: { min: 0, max: 0 },
			innateDdrBounds: { min: 0, max: 0 },
			innateStrBounds: { min: 0, max: 1 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore'] },
	},
	Pheasant: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Pheasant' },
		behavior: { behaviorState: 'Friendly', isAlert: true, fleeHpPercentThreshold: 0.99 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 1, max: 2 }, foodConversionFactor: 15.0 },
		generationProfile: {
			rank: 1,
			baseHpBounds: { min: 8, max: 12 },
			innateAdpBounds: { min: 0, max: 0 },
			innateDdrBounds: { min: 0, max: 0 },
			innateStrBounds: { min: 0, max: 1 },
			innateAgiBounds: { min: 30, max: 40 },
			innateIntBounds: { min: 2, max: 4 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore'] },
	},

	// --- RANK 2: Medium Wild Game ---
	Fox: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Fox' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.9 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 5, max: 10 }, foodConversionFactor: 8.0 },
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 18, max: 25 },
			innateAdpBounds: { min: 7, max: 10 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 3, max: 5 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 15, max: 20 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore'] },
	},
	Deer: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Deer' },
		behavior: { behaviorState: 'Friendly', isAlert: true, fleeHpPercentThreshold: 0.9 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 60, max: 100 }, foodConversionFactor: 2.5 },
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 26, max: 35 },
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 11, max: 15 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 7, max: 10 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore'] },
	},

	// --- RANK 3: Large / Dangerous Game ---
	Boar: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Boar' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.15 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 70, max: 120 }, foodConversionFactor: 2.0 },
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 45, max: 60 },
			innateAdpBounds: { min: 26, max: 35 },
			innateDdrBounds: { min: 26, max: 35 },
			innateStrBounds: { min: 30, max: 40 },
			innateAgiBounds: { min: 18, max: 25 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},
	Wolf: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Wolf' },
		behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.2 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 30, max: 50 }, foodConversionFactor: 3.0 },
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 37, max: 50 },
			innateAdpBounds: { min: 33, max: 45 },
			innateDdrBounds: { min: 18, max: 25 },
			innateStrBounds: { min: 22, max: 30 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 11, max: 15 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},
	Elk: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Elk' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.6 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 150, max: 250 }, foodConversionFactor: 2.0 },
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 45, max: 65 },
			innateAdpBounds: { min: 10, max: 15 },
			innateDdrBounds: { min: 10, max: 15 },
			innateStrBounds: { min: 25, max: 35 },
			innateAgiBounds: { min: 30, max: 40 },
			innateIntBounds: { min: 7, max: 12 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},

	// --- RANK 4: Massive Predators & Game ---
	Bear: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Bear' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.15 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 150, max: 300 }, foodConversionFactor: 1.5 },
		generationProfile: {
			rank: 4,
			baseHpBounds: { min: 60, max: 80 },
			innateAdpBounds: { min: 56, max: 75 },
			innateDdrBounds: { min: 33, max: 45 },
			innateStrBounds: { min: 37, max: 50 },
			innateAgiBounds: { min: 22, max: 30 },
			innateIntBounds: { min: 7, max: 10 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},
	Moose: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Moose' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.2 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 300, max: 500 }, foodConversionFactor: 1.5 },
		generationProfile: {
			rank: 4,
			baseHpBounds: { min: 70, max: 90 },
			innateAdpBounds: { min: 40, max: 55 },
			innateDdrBounds: { min: 20, max: 30 },
			innateStrBounds: { min: 45, max: 60 },
			innateAgiBounds: { min: 15, max: 25 },
			innateIntBounds: { min: 5, max: 8 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},
	Bison: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Bison' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.4 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 400, max: 800 }, foodConversionFactor: 1.2 },
		generationProfile: {
			rank: 4,
			baseHpBounds: { min: 80, max: 100 },
			innateAdpBounds: { min: 30, max: 40 },
			innateDdrBounds: { min: 40, max: 55 },
			innateStrBounds: { min: 50, max: 70 },
			innateAgiBounds: { min: 10, max: 20 },
			innateIntBounds: { min: 4, max: 7 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},

	// --- RANK 5: Apex Predators / Giants ---
	Dire_Wolf: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Dire Wolf' },
		behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.1 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 60, max: 90 }, foodConversionFactor: 2.5 },
		generationProfile: {
			rank: 5,
			baseHpBounds: { min: 90, max: 120 },
			innateAdpBounds: { min: 65, max: 85 },
			innateDdrBounds: { min: 30, max: 40 },
			innateStrBounds: { min: 45, max: 60 },
			innateAgiBounds: { min: 50, max: 65 },
			innateIntBounds: { min: 15, max: 20 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},
	Grizzly_Bear: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Wild', entitySubclass: 'Grizzly Bear' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.1 },
		logistics: { resourceTag: 'Wild_Game', foodConsumption: 0, entityMassBounds: { min: 250, max: 450 }, foodConversionFactor: 1.3 },
		generationProfile: {
			rank: 5,
			baseHpBounds: { min: 120, max: 150 },
			innateAdpBounds: { min: 80, max: 100 },
			innateDdrBounds: { min: 50, max: 65 },
			innateStrBounds: { min: 60, max: 80 },
			innateAgiBounds: { min: 30, max: 40 },
			innateIntBounds: { min: 10, max: 15 },
		},
		interactions: { actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'] },
	},

	// ========================================================================
	// CLASS: DOMESTIC (Civilized nodes only) - Minimum 2 per Rank (1-5)
	// ========================================================================

	// --- RANK 1: Poultry ---
	Chicken: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Chicken' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.99 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 1, entityMassBounds: { min: 1, max: 3 }, foodConversionFactor: 12.0 },
		generationProfile: {
			rank: 1,
			baseHpBounds: { min: 5, max: 10 },
			innateAdpBounds: { min: 0, max: 0 },
			innateDdrBounds: { min: 0, max: 0 },
			innateStrBounds: { min: 0, max: 1 },
			innateAgiBounds: { min: 20, max: 30 },
			innateIntBounds: { min: 1, max: 2 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},
	Goose: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Goose' },
		behavior: { behaviorState: 'Friendly', isAlert: true, fleeHpPercentThreshold: 0.8 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 1, entityMassBounds: { min: 4, max: 7 }, foodConversionFactor: 10.0 },
		generationProfile: {
			rank: 1,
			baseHpBounds: { min: 10, max: 15 },
			innateAdpBounds: { min: 1, max: 3 },
			innateDdrBounds: { min: 0, max: 2 },
			innateStrBounds: { min: 2, max: 4 },
			innateAgiBounds: { min: 15, max: 25 },
			innateIntBounds: { min: 2, max: 4 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},

	// --- RANK 2: Small Livestock ---
	Pig: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Pig' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.5 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 1, entityMassBounds: { min: 50, max: 150 }, foodConversionFactor: 2.5 },
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 30, max: 50 },
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 7, max: 10 },
			innateStrBounds: { min: 15, max: 20 },
			innateAgiBounds: { min: 11, max: 15 },
			innateIntBounds: { min: 5, max: 8 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},
	Sheep: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Sheep' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.8 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 1, entityMassBounds: { min: 40, max: 70 }, foodConversionFactor: 2.5 },
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 25, max: 35 },
			innateAdpBounds: { min: 0, max: 2 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 7, max: 12 },
			innateAgiBounds: { min: 15, max: 20 },
			innateIntBounds: { min: 3, max: 6 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},
	Goat: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Goat' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.7 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 1, entityMassBounds: { min: 30, max: 50 }, foodConversionFactor: 3.0 },
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 25, max: 35 },
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 11, max: 15 },
			innateAgiBounds: { min: 22, max: 30 },
			innateIntBounds: { min: 7, max: 10 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},

	// --- RANK 3: Standard Cattle ---
	Cow: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Cow' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.5 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 2, entityMassBounds: { min: 400, max: 600 }, foodConversionFactor: 1.0 },
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 50, max: 70 },
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 11, max: 15 },
			innateStrBounds: { min: 30, max: 45 },
			innateAgiBounds: { min: 3, max: 5 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},
	Ox: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Ox' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.4 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 2, entityMassBounds: { min: 500, max: 700 }, foodConversionFactor: 1.0 },
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 60, max: 80 },
			innateAdpBounds: { min: 5, max: 10 },
			innateDdrBounds: { min: 15, max: 20 },
			innateStrBounds: { min: 40, max: 55 },
			innateAgiBounds: { min: 2, max: 4 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},

	// --- RANK 4: Heavy Beasts of Burden ---
	Water_Buffalo: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Water Buffalo' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.3 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 3, entityMassBounds: { min: 600, max: 900 }, foodConversionFactor: 0.9 },
		generationProfile: {
			rank: 4,
			baseHpBounds: { min: 80, max: 110 },
			innateAdpBounds: { min: 15, max: 25 },
			innateDdrBounds: { min: 20, max: 30 },
			innateStrBounds: { min: 50, max: 70 },
			innateAgiBounds: { min: 2, max: 5 },
			innateIntBounds: { min: 4, max: 6 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},
	Yak: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Yak' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.4 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 2, entityMassBounds: { min: 300, max: 500 }, foodConversionFactor: 1.1 },
		generationProfile: {
			rank: 4,
			baseHpBounds: { min: 70, max: 95 },
			innateAdpBounds: { min: 10, max: 20 },
			innateDdrBounds: { min: 15, max: 25 },
			innateStrBounds: { min: 45, max: 60 },
			innateAgiBounds: { min: 5, max: 10 },
			innateIntBounds: { min: 4, max: 6 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},

	// --- RANK 5: Prime / Royal Livestock ---
	Prize_Bull: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Prize Bull' },
		behavior: { behaviorState: 'Friendly', isAlert: true, fleeHpPercentThreshold: 0.2 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 4, entityMassBounds: { min: 800, max: 1100 }, foodConversionFactor: 0.8 },
		generationProfile: {
			rank: 5,
			baseHpBounds: { min: 100, max: 130 },
			innateAdpBounds: { min: 40, max: 60 },
			innateDdrBounds: { min: 30, max: 40 },
			innateStrBounds: { min: 60, max: 85 },
			innateAgiBounds: { min: 10, max: 15 },
			innateIntBounds: { min: 5, max: 8 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},
	Aurochs: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Domestic', entitySubclass: 'Aurochs' },
		behavior: { behaviorState: 'Friendly', isAlert: true, fleeHpPercentThreshold: 0.2 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 4, entityMassBounds: { min: 700, max: 1000 }, foodConversionFactor: 0.9 },
		generationProfile: {
			rank: 5,
			baseHpBounds: { min: 110, max: 140 },
			innateAdpBounds: { min: 45, max: 65 },
			innateDdrBounds: { min: 35, max: 45 },
			innateStrBounds: { min: 65, max: 90 },
			innateAgiBounds: { min: 12, max: 18 },
			innateIntBounds: { min: 6, max: 9 },
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal'] },
	},

	// ========================================================================
	// CLASS: MOUNT (Dynamic Rank 1-5)
	// ========================================================================
	Horse: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Animal', entityClass: 'Mount', entitySubclass: 'Horse' },
		behavior: { behaviorState: 'Friendly', isAlert: false, fleeHpPercentThreshold: 0.5 },
		logistics: { resourceTag: 'Livestock', foodConsumption: 1, entityMassBounds: { min: 400, max: 600 }, foodConversionFactor: 1.0 },
		generationProfile: {
			rankRange: [1, 5],
			baseHp: 50,
			hpPerRank: 10,
			strBounds: { min: [5, 15, 20, 25, 30], max: [15, 25, 35, 45, 50] },
			agiBounds: { min: [5, 15, 20, 25, 30], max: [15, 25, 35, 45, 50] },
			innateAdp: 0,
			innateDdr: 0,
			innateInt: 10,
		},
		interactions: { actionTags: ['Slaughter_Animal', 'Sell_Animal', 'Buy_Animal', 'Steal_Animal', 'Mount_Animal', 'Dismount_Animal'] },
	},
};
