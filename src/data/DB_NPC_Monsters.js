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
    // ========================================================================
    // CLASS: BEAST
    // ========================================================================
    Manticore: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Beast', entitySubclass: 'Manticore' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.15 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.5, foodConsumption: 0, entityMassBounds: { min: 300, max: 450 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_manticore' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 120, max: 160 }, hpPerRankBounds: { min: 25, max: 35 },
            adpBounds: { min: [30, 50, 70, 90, 105], max: [50, 70, 90, 105, 125] },
            ddrBounds: { min: [10, 20, 30, 40, 50], max: [20, 30, 40, 50, 60] },
            strBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 45] },
            agiBounds: { min: [10, 15, 25, 30, 40], max: [15, 25, 30, 40, 50] },
            intBounds: { min: [5, 8, 12, 15, 20], max: [8, 12, 15, 20, 25] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Griffin: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Beast', entitySubclass: 'Griffin' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.20 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.8, foodConsumption: 0, entityMassBounds: { min: 400, max: 550 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_griffin' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 110, max: 150 }, hpPerRankBounds: { min: 20, max: 30 },
            adpBounds: { min: [25, 45, 65, 85, 100], max: [45, 65, 85, 100, 120] },
            ddrBounds: { min: [15, 25, 35, 45, 55], max: [25, 35, 45, 55, 65] },
            strBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 50] },
            agiBounds: { min: [15, 20, 30, 35, 40], max: [20, 30, 35, 40, 50] },
            intBounds: { min: [4, 7, 10, 14, 18], max: [7, 10, 14, 18, 22] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Chimera: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Beast', entitySubclass: 'Chimera' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.10 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.3, foodConsumption: 0, entityMassBounds: { min: 450, max: 600 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_chimera' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 140, max: 180 }, hpPerRankBounds: { min: 30, max: 40 },
            adpBounds: { min: [35, 55, 75, 95, 110], max: [55, 75, 95, 110, 125] },
            ddrBounds: { min: [20, 30, 40, 50, 60], max: [30, 40, 50, 60, 70] },
            strBounds: { min: [25, 30, 35, 40, 45], max: [30, 35, 40, 45, 50] },
            agiBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
            intBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 30] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },

    // ========================================================================
    // CLASS: GIANT
    // ========================================================================
    Jotun: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Giant', entitySubclass: 'Jotun' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.05 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.1, foodConsumption: 0, entityMassBounds: { min: 900, max: 1200 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_jotun' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 250, max: 300 }, hpPerRankBounds: { min: 50, max: 70 },
            adpBounds: { min: [40, 60, 80, 100, 115], max: [60, 80, 100, 115, 125] },
            ddrBounds: { min: [30, 40, 50, 60, 65], max: [40, 50, 60, 65, 75] },
            strBounds: { min: [30, 35, 40, 45, 48], max: [35, 40, 45, 48, 50] },
            agiBounds: { min: [2, 4, 6, 8, 10], max: [4, 6, 8, 10, 15] },
            intBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Cyclops: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Giant', entitySubclass: 'Cyclops' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.10 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.2, foodConsumption: 0, entityMassBounds: { min: 700, max: 950 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_cyclops' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 200, max: 250 }, hpPerRankBounds: { min: 40, max: 60 },
            adpBounds: { min: [35, 55, 75, 90, 105], max: [55, 75, 90, 105, 120] },
            ddrBounds: { min: [20, 30, 40, 50, 60], max: [30, 40, 50, 60, 70] },
            strBounds: { min: [25, 30, 35, 40, 45], max: [30, 35, 40, 45, 50] },
            agiBounds: { min: [5, 8, 12, 16, 20], max: [8, 12, 16, 20, 25] },
            intBounds: { min: [4, 6, 8, 10, 12], max: [6, 8, 10, 12, 15] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Fomorian: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Giant', entitySubclass: 'Fomorian' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.05 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 800, max: 1100 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_fomorian' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 220, max: 280 }, hpPerRankBounds: { min: 45, max: 65 },
            adpBounds: { min: [40, 60, 80, 95, 110], max: [60, 80, 95, 110, 125] },
            ddrBounds: { min: [25, 35, 45, 55, 65], max: [35, 45, 55, 65, 75] },
            strBounds: { min: [28, 33, 38, 43, 46], max: [33, 38, 43, 46, 50] },
            agiBounds: { min: [4, 7, 10, 14, 18], max: [7, 10, 14, 18, 22] },
            intBounds: { min: [8, 12, 16, 20, 24], max: [12, 16, 20, 24, 30] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },

    // ========================================================================
    // CLASS: UNDEAD
    // ========================================================================
    Wight: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Undead', entitySubclass: 'Wight' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.0 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 60, max: 85 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_wight' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 70, max: 100 }, hpPerRankBounds: { min: 15, max: 25 },
            adpBounds: { min: [20, 40, 60, 80, 95], max: [40, 60, 80, 95, 110] },
            ddrBounds: { min: [20, 30, 40, 50, 60], max: [30, 40, 50, 60, 70] },
            strBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 40] },
            agiBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 40] },
            intBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 40] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Wraith: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Undead', entitySubclass: 'Wraith' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.0 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 0, max: 5 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_wraith' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 40, max: 60 }, hpPerRankBounds: { min: 10, max: 15 },
            adpBounds: { min: [30, 50, 70, 90, 110], max: [50, 70, 90, 110, 125] },
            ddrBounds: { min: [5, 15, 25, 35, 45], max: [15, 25, 35, 45, 55] },
            strBounds: { min: [0, 5, 10, 15, 20], max: [5, 10, 15, 20, 25] },
            agiBounds: { min: [30, 35, 40, 45, 48], max: [35, 40, 45, 48, 50] },
            intBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 50] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Banshee: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Undead', entitySubclass: 'Banshee' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.0 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 0, max: 5 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_banshee' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 50, max: 70 }, hpPerRankBounds: { min: 10, max: 20 },
            adpBounds: { min: [35, 55, 75, 95, 115], max: [55, 75, 95, 115, 125] },
            ddrBounds: { min: [10, 20, 30, 40, 50], max: [20, 30, 40, 50, 60] },
            strBounds: { min: [0, 2, 5, 8, 12], max: [2, 5, 8, 12, 15] },
            agiBounds: { min: [25, 30, 35, 40, 45], max: [30, 35, 40, 45, 50] },
            intBounds: { min: [25, 30, 35, 40, 45], max: [30, 35, 40, 45, 50] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },

    // ========================================================================
    // CLASS: GOBLINOID
    // ========================================================================
    Goblin: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Goblinoid', entitySubclass: 'Goblin' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.40 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 35, max: 50 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_goblin' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 35, max: 55 }, hpPerRankBounds: { min: 10, max: 15 },
            adpBounds: { min: [15, 25, 35, 45, 55], max: [25, 35, 45, 55, 65] },
            ddrBounds: { min: [10, 20, 30, 40, 50], max: [20, 30, 40, 50, 60] },
            strBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 30] },
            agiBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 45] },
            intBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 35] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Hobgoblin: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Goblinoid', entitySubclass: 'Hobgoblin' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.25 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 75, max: 100 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_hobgoblin' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 60, max: 80 }, hpPerRankBounds: { min: 15, max: 20 },
            adpBounds: { min: [25, 40, 55, 70, 85], max: [40, 55, 70, 85, 100] },
            ddrBounds: { min: [20, 30, 40, 50, 60], max: [30, 40, 50, 60, 70] },
            strBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 40] },
            agiBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 40] },
            intBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 40] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Bugbear: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Goblinoid', entitySubclass: 'Bugbear' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.15 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 120, max: 160 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_bugbear' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 90, max: 120 }, hpPerRankBounds: { min: 20, max: 30 },
            adpBounds: { min: [30, 45, 60, 75, 90], max: [45, 60, 75, 90, 110] },
            ddrBounds: { min: [15, 25, 35, 45, 55], max: [25, 35, 45, 55, 65] },
            strBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 45] },
            agiBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 40] },
            intBounds: { min: [8, 12, 16, 20, 24], max: [12, 16, 20, 24, 30] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },

    // ========================================================================
    // CLASS: ELEMENTAL
    // ========================================================================
    Golem: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Elemental', entitySubclass: 'Golem' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.0 },
        logistics: { resourceTag: 'Minerals', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 1500, max: 3000 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_golem' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 300, max: 400 }, hpPerRankBounds: { min: 60, max: 80 },
            adpBounds: { min: [25, 40, 55, 70, 85], max: [40, 55, 70, 85, 100] },
            ddrBounds: { min: [40, 50, 60, 65, 70], max: [50, 60, 65, 70, 75] },
            strBounds: { min: [35, 40, 45, 48, 50], max: [40, 45, 48, 50, 50] },
            agiBounds: { min: [1, 2, 3, 5, 7], max: [2, 3, 5, 7, 10] },
            intBounds: { min: [1, 2, 3, 4, 5], max: [2, 3, 4, 5, 8] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Djinn: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Elemental', entitySubclass: 'Djinn' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.10 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 0, max: 0 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_djinn' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 100, max: 140 }, hpPerRankBounds: { min: 25, max: 35 },
            adpBounds: { min: [40, 60, 80, 100, 115], max: [60, 80, 100, 115, 125] },
            ddrBounds: { min: [15, 25, 35, 45, 55], max: [25, 35, 45, 55, 65] },
            strBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
            agiBounds: { min: [25, 35, 40, 45, 48], max: [35, 40, 45, 48, 50] },
            intBounds: { min: [30, 35, 40, 45, 48], max: [35, 40, 45, 48, 50] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Gargoyle: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Elemental', entitySubclass: 'Gargoyle' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.0 },
        logistics: { resourceTag: 'Minerals', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 400, max: 600 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_gargoyle' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 120, max: 160 }, hpPerRankBounds: { min: 20, max: 30 },
            adpBounds: { min: [25, 45, 65, 80, 95], max: [45, 65, 80, 95, 110] },
            ddrBounds: { min: [30, 40, 50, 60, 65], max: [40, 50, 60, 65, 75] },
            strBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 45] },
            agiBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
            intBounds: { min: [5, 10, 15, 20, 25], max: [10, 15, 20, 25, 30] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },

    // ========================================================================
    // CLASS: CURSED
    // ========================================================================
    Vampire: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Cursed', entitySubclass: 'Vampire' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.15 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 65, max: 90 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_vampire' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 100, max: 130 }, hpPerRankBounds: { min: 20, max: 30 },
            adpBounds: { min: [40, 60, 80, 100, 115], max: [60, 80, 100, 115, 125] },
            ddrBounds: { min: [20, 30, 40, 50, 60], max: [30, 40, 50, 60, 70] },
            strBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 45] },
            agiBounds: { min: [25, 30, 35, 40, 45], max: [30, 35, 40, 45, 50] },
            intBounds: { min: [25, 30, 35, 40, 45], max: [30, 35, 40, 45, 50] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Werewolf: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Cursed', entitySubclass: 'Werewolf' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.15 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.5, foodConsumption: 0, entityMassBounds: { min: 130, max: 180 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_werewolf' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 110, max: 140 }, hpPerRankBounds: { min: 25, max: 35 },
            adpBounds: { min: [35, 55, 75, 95, 110], max: [55, 75, 95, 110, 125] },
            ddrBounds: { min: [15, 25, 35, 45, 50], max: [25, 35, 45, 50, 60] },
            strBounds: { min: [25, 30, 35, 40, 45], max: [30, 35, 40, 45, 50] },
            agiBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 48] },
            intBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Hag: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Cursed', entitySubclass: 'Hag' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.25 },
        logistics: { resourceTag: 'Trophy', foodConversionFactor: 0.0, foodConsumption: 0, entityMassBounds: { min: 55, max: 80 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_hag' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 80, max: 110 }, hpPerRankBounds: { min: 15, max: 25 },
            adpBounds: { min: [30, 50, 70, 90, 110], max: [50, 70, 90, 110, 125] },
            ddrBounds: { min: [15, 25, 35, 45, 55], max: [25, 35, 45, 55, 65] },
            strBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
            agiBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 40] },
            intBounds: { min: [25, 35, 40, 45, 48], max: [35, 40, 45, 48, 50] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },

    // ========================================================================
    // CLASS: DRACONID
    // ========================================================================
    Wyvern: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Draconid', entitySubclass: 'Wyvern' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.10 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.6, foodConsumption: 0, entityMassBounds: { min: 500, max: 800 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_wyvern' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 180, max: 230 }, hpPerRankBounds: { min: 35, max: 45 },
            adpBounds: { min: [45, 65, 85, 105, 120], max: [65, 85, 105, 120, 125] },
            ddrBounds: { min: [25, 35, 45, 55, 65], max: [35, 45, 55, 65, 75] },
            strBounds: { min: [30, 35, 40, 45, 48], max: [35, 40, 45, 48, 50] },
            agiBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 45] },
            intBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Basilisk: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Draconid', entitySubclass: 'Basilisk' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.15 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.4, foodConsumption: 0, entityMassBounds: { min: 200, max: 350 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_basilisk' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 140, max: 180 }, hpPerRankBounds: { min: 25, max: 35 },
            adpBounds: { min: [35, 55, 75, 95, 110], max: [55, 75, 95, 110, 125] },
            ddrBounds: { min: [20, 30, 40, 50, 60], max: [30, 40, 50, 60, 70] },
            strBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 45] },
            agiBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 40] },
            intBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 40] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    },
    Cockatrice: {
        classification: { entityArchetype: 'Creature', entityCategory: 'Monster', entityClass: 'Draconid', entitySubclass: 'Cockatrice' },
        behavior: { behaviorState: 'Hostile', isAlert: true, fleeHpPercentThreshold: 0.20 },
        logistics: { resourceTag: 'Monster_Parts', foodConversionFactor: 0.3, foodConsumption: 0, entityMassBounds: { min: 80, max: 150 } },
        economy: { baseCoinValue: 0, lootTableId: 'loot_monster_cockatrice' },
        generationProfile: {
            rankRange: [1, 5], baseHpBounds: { min: 90, max: 120 }, hpPerRankBounds: { min: 20, max: 30 },
            adpBounds: { min: [30, 50, 70, 90, 110], max: [50, 70, 90, 110, 125] },
            ddrBounds: { min: [15, 25, 35, 45, 50], max: [25, 35, 45, 50, 60] },
            strBounds: { min: [15, 20, 25, 30, 35], max: [20, 25, 30, 35, 40] },
            agiBounds: { min: [20, 25, 30, 35, 40], max: [25, 30, 35, 40, 45] },
            intBounds: { min: [10, 15, 20, 25, 30], max: [15, 20, 25, 30, 35] },
        },
        interactions: { actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
    }
};