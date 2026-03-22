// File: src/data/DB_NPC_Monsters.js
// Description: Behavioral profiles, procedural generation bounds, and action tags for Monster entities.

// ========================================================================
// MARS ENGINE ATTRIBUTE THRESHOLDS
// ========================================================================
// innateStr : Max 50
// innateAgi : Max 50
// innateInt : Max 50
// innateAdp : Max 125 (Procedural Base)
// innateDdr : Max 75  (Procedural Base)
// ========================================================================

export const DB_NPC_MONSTERS = {
	Dire_Wolf: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Beast', entitySubclass: 'Dire_Wolf' },
		behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.15 },
		logistics: {
			resourceTag: 'Monster_Parts',
			foodConversionFactor: 1.2, // Edible beast
			foodConsumption: 0,
			entityMassBounds: { min: 130, max: 180 },
		},
		economy: { baseCoinValue: 0, lootTableId: 'loot_monster_dire_wolf' },
		generationProfile: {
			rankRange: [1, 5],
			baseHpBounds: { min: 80, max: 100 },
			hpPerRankBounds: { min: 15, max: 25 },
			adpBounds: { min: [20, 40, 60, 80, 100], max: [30, 50, 70, 90, 110] },
			ddrBounds: { min: [10, 20, 30, 35, 45], max: [20, 30, 40, 45, 55] },
			strBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 40] },
			agiBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 45, 50] },
			intBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 30] },
		},
		interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
	},

	Cave_Troll: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Giant', entitySubclass: 'Cave_Troll' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.05 },
		logistics: {
			resourceTag: 'Trophy',
			foodConversionFactor: 0.5, // Poor quality food yield
			foodConsumption: 0,
			entityMassBounds: { min: 550, max: 700 },
		},
		economy: { baseCoinValue: 0, lootTableId: 'loot_monster_cave_troll' },
		generationProfile: {
			rankRange: [1, 5],
			baseHpBounds: { min: 200, max: 250 },
			hpPerRankBounds: { min: 40, max: 60 },
			adpBounds: { min: [30, 45, 60, 75, 90], max: [45, 60, 75, 90, 110] },
			ddrBounds: { min: [25, 35, 45, 55, 65], max: [35, 45, 55, 65, 75] },
			strBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 50] },
			agiBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 30] },
			intBounds: { min: [2, 4, 6, 8, 10], max: [4, 6, 8, 10, 15] },
		},
		interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
	},

	Undead_Warrior: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Undead', entitySubclass: 'Undead_Warrior' },
		behavior: {
			behaviorState: 'Hostile',
			isAlert: true,
			fleeHpPercentThreshold: 0.0, // Undead do not flee
		},
		logistics: {
			resourceTag: 'Trophy',
			foodConversionFactor: 0.0, // Undead yield no food
			foodConsumption: 0,
			entityMassBounds: { min: 70, max: 90 },
		},
		economy: { baseCoinValue: 0, lootTableId: 'loot_monster_undead' },
		generationProfile: {
			rankRange: [1, 5],
			baseHpBounds: { min: 50, max: 70 },
			hpPerRankBounds: { min: 10, max: 20 },
			adpBounds: { min: [15, 30, 45, 60, 75], max: [30, 45, 60, 75, 90] },
			ddrBounds: { min: [15, 25, 35, 45, 55], max: [25, 35, 45, 55, 65] },
			strBounds: { min: [12, 18, 24, 30, 36], max: [18, 24, 30, 36, 45] },
			agiBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 35] },
			intBounds: { min: [1, 2, 3, 5, 8], max: [2, 3, 5, 8, 12] },
		},
		interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
	},

	Giant_Spider: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Beast', entitySubclass: 'Giant_Spider' },
		behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.25 },
		logistics: {
			resourceTag: 'Monster_Parts',
			foodConversionFactor: 0.2, // Very low edible yield
			foodConsumption: 0,
			entityMassBounds: { min: 60, max: 110 },
		},
		economy: { baseCoinValue: 0, lootTableId: 'loot_monster_spider' },
		generationProfile: {
			rankRange: [1, 5],
			baseHpBounds: { min: 40, max: 60 },
			hpPerRankBounds: { min: 10, max: 15 },
			adpBounds: {
				min: [25, 45, 65, 85, 105],
				max: [45, 65, 85, 105, 125], // High attack potential
			},
			ddrBounds: { min: [5, 15, 25, 35, 45], max: [15, 25, 35, 45, 55] },
			strBounds: { min: [8, 12, 16, 20, 25], max: [12, 16, 20, 25, 35] },
			agiBounds: {
				min: [25, 30, 35, 40, 45],
				max: [30, 35, 40, 45, 50], // Extremely agile
			},
			intBounds: { min: [3, 6, 9, 12, 15], max: [6, 9, 12, 15, 20] },
		},
		interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
	},

	Goblin_Scavenger: {
		classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Goblinoid', entitySubclass: 'Goblin_Scavenger' },
		behavior: {
			behaviorState: 'Hostile',
			isAlert: true,
			fleeHpPercentThreshold: 0.4, // High flee tendency
		},
		logistics: {
			resourceTag: 'Monster_Parts',
			foodConversionFactor: 0.0, // Humanoid/Goblinoid yields no food
			foodConsumption: 0,
			entityMassBounds: { min: 40, max: 60 },
		},
		economy: { baseCoinValue: 0, lootTableId: 'loot_monster_goblin' },
		generationProfile: {
			rankRange: [1, 5],
			baseHpBounds: { min: 35, max: 55 },
			hpPerRankBounds: { min: 10, max: 15 },
			adpBounds: { min: [15, 25, 35, 45, 55], max: [25, 35, 45, 55, 65] },
			ddrBounds: { min: [10, 20, 30, 40, 50], max: [20, 30, 40, 50, 60] },
			strBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 30] },
			agiBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 45] },
			intBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 35] },
		},
		interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
	},
};
