// File: src/data/DB_NPC_Animals.js
// Description: Taxonomy, behavioral profiles, resource classification, and stat modifiers for Animal entities.

// ========================================================================
// MARS ENGINE ATTRIBUTE THRESHOLDS
// ========================================================================
// innateStr : Max 50
// innateAgi : Max 50
// innateInt : Max 50
// innateAdp : Max 125 (Procedural Base) -> Max 150 (With Attribute Scaling)
// innateDdr : Max 75  (Procedural Base) -> Max 90  (With Attribute Scaling)
// ========================================================================

export const DB_NPC_ANIMALS = {
	// ========================================================================
	// CLASS: WILD (Untamed regions)
	// ========================================================================
	Bear: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Wild',
			entitySubclass: 'Bear',
		},
		behavior: {
			behaviorState: 'Hostile',
			isAlert: false,
			fleeHpPercentThreshold: 0.15,
		},
		logistics: {
			resourceTag: 'Wild_Game',
			foodYieldBounds: { min: 12, max: 16 },
			foodConsumption: 0,
			entityMassBounds: { min: 187, max: 250 },
		},
		generationProfile: {
			rank: 4,
			baseHpBounds: { min: 60, max: 80 },
			innateAdpBounds: { min: 56, max: 75 },
			innateDdrBounds: { min: 33, max: 45 },
			innateStrBounds: { min: 37, max: 50 },
			innateAgiBounds: { min: 22, max: 30 },
			innateIntBounds: { min: 7, max: 10 },
		},
		interactions: {
			actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'],
		},
	},
	Boar: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Wild',
			entitySubclass: 'Boar',
		},
		behavior: {
			behaviorState: 'Hostile',
			isAlert: false,
			fleeHpPercentThreshold: 0.15,
		},
		logistics: {
			resourceTag: 'Wild_Game',
			foodYieldBounds: { min: 7, max: 10 },
			foodConsumption: 0,
			entityMassBounds: { min: 75, max: 100 },
		},
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 45, max: 60 },
			innateAdpBounds: { min: 26, max: 35 },
			innateDdrBounds: { min: 26, max: 35 },
			innateStrBounds: { min: 30, max: 40 },
			innateAgiBounds: { min: 18, max: 25 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: {
			actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'],
		},
	},
	Wolf: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Wild',
			entitySubclass: 'Wolf',
		},
		behavior: {
			behaviorState: 'Hostile',
			isAlert: false,
			fleeHpPercentThreshold: 0.2,
		},
		logistics: {
			resourceTag: 'Wild_Game',
			foodYieldBounds: { min: 4, max: 6 },
			foodConsumption: 0,
			entityMassBounds: { min: 30, max: 40 },
		},
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 37, max: 50 },
			innateAdpBounds: { min: 33, max: 45 },
			innateDdrBounds: { min: 18, max: 25 },
			innateStrBounds: { min: 22, max: 30 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 11, max: 15 },
		},
		interactions: {
			actionTags: ['Hunt_Animal', 'Ignore', 'Fight_Animal', 'Evade_Animal'],
		},
	},
	Deer: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Wild',
			entitySubclass: 'Deer',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.9,
		},
		logistics: {
			resourceTag: 'Wild_Game',
			foodYieldBounds: { min: 6, max: 8 },
			foodConsumption: 0,
			entityMassBounds: { min: 52, max: 70 },
		},
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 26, max: 35 },
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 11, max: 15 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 7, max: 10 },
		},
		interactions: {
			actionTags: ['Hunt_Animal', 'Ignore'],
		},
	},
	Fox: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Wild',
			entitySubclass: 'Fox',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.9,
		},
		logistics: {
			resourceTag: 'Wild_Game',
			foodYieldBounds: { min: 3, max: 4 },
			foodConsumption: 0,
			entityMassBounds: { min: 7, max: 10 },
		},
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 18, max: 25 },
			innateAdpBounds: { min: 7, max: 10 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 3, max: 5 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 15, max: 20 },
		},
		interactions: {
			actionTags: ['Hunt_Animal', 'Ignore'],
		},
	},
	Hare: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Wild',
			entitySubclass: 'Hare',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.99,
		},
		logistics: {
			resourceTag: 'Wild_Game',
			foodYieldBounds: { min: 1, max: 2 },
			foodConsumption: 0,
			entityMassBounds: { min: 2, max: 3 },
		},
		generationProfile: {
			rank: 1,
			baseHpBounds: { min: 11, max: 15 },
			innateAdpBounds: { min: 0, max: 0 },
			innateDdrBounds: { min: 0, max: 0 },
			innateStrBounds: { min: 0, max: 1 },
			innateAgiBounds: { min: 37, max: 50 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: {
			actionTags: ['Hunt_Animal', 'Ignore'],
		},
	},

	// ========================================================================
	// CLASS: DOMESTIC (Civilized nodes only)
	// ========================================================================
	Cow: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Domestic',
			entitySubclass: 'Cow',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.5,
		},
		logistics: {
			resourceTag: 'Livestock',
			foodYieldBounds: { min: 13, max: 18 },
			foodConsumption: 0,
			entityMassBounds: { min: 300, max: 400 },
		},
		economy: {
			baseCoinValue: 25,
			lootTableId: null,
		},
		generationProfile: {
			rank: 3,
			baseHpBounds: { min: 56, max: 75 },
			foodConsumptionPerRank: 1,
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 11, max: 15 },
			innateStrBounds: { min: 37, max: 50 },
			innateAgiBounds: { min: 3, max: 5 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: {
			actionTags: [
				'Slaughter_Animal',
				'Sell_Animal',
				'Buy_Animal',
				'Steal_Animal',
			],
		},
	},
	Pig: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Domestic',
			entitySubclass: 'Pig',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.5,
		},
		logistics: {
			resourceTag: 'Livestock',
			foodYieldBounds: { min: 9, max: 12 },
			foodConsumption: 0,
			entityMassBounds: { min: 75, max: 100 },
		},
		economy: {
			baseCoinValue: 20,
			lootTableId: null,
		},
		generationProfile: {
			rank: 2,
			baseHpBounds: { min: 37, max: 50 },
			foodConsumptionPerRank: 1,
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 7, max: 10 },
			innateStrBounds: { min: 15, max: 20 },
			innateAgiBounds: { min: 11, max: 15 },
			innateIntBounds: { min: 7, max: 10 },
		},
		interactions: {
			actionTags: [
				'Slaughter_Animal',
				'Sell_Animal',
				'Buy_Animal',
				'Steal_Animal',
			],
		},
	},
	Sheep: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Domestic',
			entitySubclass: 'Sheep',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.8,
		},
		logistics: {
			resourceTag: 'Livestock',
			foodYieldBounds: { min: 4, max: 6 },
			foodConsumption: 0,
			entityMassBounds: { min: 37, max: 50 },
		},
		economy: {
			baseCoinValue: 15,
			lootTableId: null,
		},
		generationProfile: {
			rank: 1,
			baseHpBounds: { min: 18, max: 25 },
			foodConsumptionPerRank: 1,
			innateAdpBounds: { min: 0, max: 0 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 7, max: 10 },
			innateAgiBounds: { min: 15, max: 20 },
			innateIntBounds: { min: 3, max: 5 },
		},
		interactions: {
			actionTags: [
				'Slaughter_Animal',
				'Sell_Animal',
				'Buy_Animal',
				'Steal_Animal',
			],
		},
	},
	Goat: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Domestic',
			entitySubclass: 'Goat',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.7,
		},
		logistics: {
			resourceTag: 'Livestock',
			foodYieldBounds: { min: 4, max: 6 },
			foodConsumption: 0,
			entityMassBounds: { min: 30, max: 40 },
		},
		economy: {
			baseCoinValue: 15,
			lootTableId: null,
		},
		generationProfile: {
			rank: 1,
			baseHpBounds: { min: 18, max: 25 },
			foodConsumptionPerRank: 1,
			innateAdpBounds: { min: 3, max: 5 },
			innateDdrBounds: { min: 3, max: 5 },
			innateStrBounds: { min: 11, max: 15 },
			innateAgiBounds: { min: 22, max: 30 },
			innateIntBounds: { min: 7, max: 10 },
		},
		interactions: {
			actionTags: [
				'Slaughter_Animal',
				'Sell_Animal',
				'Buy_Animal',
				'Steal_Animal',
			],
		},
	},

	// ========================================================================
	// CLASS: MOUNT
	// ========================================================================
	Horse: {
		classification: {
			entityArchetype: 'Creature',
			entityCategory: 'Animal',
			entityClass: 'Mount',
			entitySubclass: 'Horse',
		},
		behavior: {
			behaviorState: 'Friendly',
			isAlert: false,
			fleeHpPercentThreshold: 0.5,
		},
		logistics: {
			resourceTag: 'Livestock',
			foodYield: 12,
			foodConsumption: 0,
			entityMass: 500,
		},
		economy: {
			baseCoinValue: 50,
			lootTableId: null,
		},
		generationProfile: {
			rankRange: [1, 5],
			baseHp: 50,
			hpPerRank: 10,
			foodConsumptionPerRank: 1,
			strBounds: {
				min: [5, 15, 20, 25, 30],
				max: [15, 25, 35, 45, 50],
			},
			agiBounds: {
				min: [5, 15, 20, 25, 30],
				max: [15, 25, 35, 45, 50],
			},
			innateAdp: 0,
			innateDdr: 0,
			innateInt: 10,
		},
		interactions: {
			actionTags: [
				'Slaughter_Animal',
				'Sell_Animal',
				'Buy_Animal',
				'Steal_Animal',
				'Mount_Animal',
				'Dismount_Animal',
			],
		},
	},
};
