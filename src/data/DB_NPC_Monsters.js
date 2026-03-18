// File: src/data/DB_NPC_MONSTERS.js
// Description: Behavioral profiles, procedural generation bounds, and action tags for Monster entities.

// ========================================================================
// MARS ENGINE ATTRIBUTE THRESHOLDS
// ========================================================================
// innateStr : Max 50
// innateAgi : Max 50
// innateInt : Max 50
// innateAdp : Max 125 (Procedural Base) -> Max 150 (With Attribute Scaling)
// innateDdr : Max 75  (Procedural Base) -> Max 90  (With Attribute Scaling)
// ========================================================================

export const DB_NPC_MONSTERS = {
    // ========================================================================
    // INITIAL ENTRIES
    // ========================================================================
    Dire_Wolf: {
        classification: {
            entityArchetype: 'Creature',
            entityCategory: 'Monster',
            entityClass: 'Common',
            entitySubclass: 'Dire_Wolf',
        },
        behavior: {
            behaviorState: 'Hostile',
            isAlert: false,
            fleeHpPercentThreshold: 0.10,
        },
        logistics: {
            resourceTag: 'Monster_Parts',
            foodYieldBounds: { min: 3, max: 5 },
            foodConsumption: 0,
            entityMassBounds: { min: 130, max: 170 },
        },
        economy: {
            baseCoinValue: 0,
            lootTableId: 'loot_monster_dire_wolf',
        },
        generationProfile: {
            rankRange: [1, 5],
            baseHpBounds: { min: 100, max: 140 },
            hpPerRankBounds: { min: 15, max: 25 },
            adpBounds: {
                min: [20, 40, 60, 80, 100],
                max: [30, 50, 70, 90, 110], // Absolute max limit: 125
            },
            ddrBounds: {
                min: [10, 20, 30, 35, 45],
                max: [20, 30, 40, 45, 55],  // Absolute max limit: 75
            },
            strBounds: {
                min: [10, 15, 20, 25, 30],
                max: [15, 20, 25, 30, 40],  // Absolute max limit: 50
            },
            agiBounds: {
                min: [20, 25, 30, 35, 40],
                max: [25, 30, 35, 45, 50],  // Absolute max limit: 50
            },
            intBounds: {
                min: [5, 10, 15, 20, 25],
                max: [10, 15, 20, 25, 30],  // Absolute max limit: 50
            },
        },
        interactions: {
            actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'],
        },
    },
    Cave_Troll: {
        classification: {
            entityArchetype: 'Creature',
            entityCategory: 'Monster',
            entityClass: 'Elite',
            entitySubclass: 'Cave_Troll',
        },
        behavior: {
            behaviorState: 'Hostile',
            isAlert: false,
            fleeHpPercentThreshold: 0.00,
        },
        logistics: {
            resourceTag: 'Trophy',
            foodYieldBounds: { min: 1, max: 3 },
            foodConsumption: 0,
            entityMassBounds: { min: 550, max: 650 },
        },
        economy: {
            baseCoinValue: 0,
            lootTableId: 'loot_monster_cave_troll',
        },
        generationProfile: {
            rankRange: [1, 5],
            baseHpBounds: { min: 320, max: 380 },
            hpPerRankBounds: { min: 40, max: 60 },
            adpBounds: {
                min: [50, 65, 80, 95, 105],
                max: [60, 75, 90, 105, 120], // Absolute max limit: 125
            },
            ddrBounds: {
                min: [35, 45, 55, 60, 65],
                max: [45, 55, 65, 70, 75],   // Absolute max limit: 75
            },
            strBounds: {
                min: [25, 30, 35, 40, 45],
                max: [30, 35, 40, 45, 50],   // Absolute max limit: 50
            },
            agiBounds: {
                min: [5, 10, 15, 20, 25],
                max: [10, 15, 20, 25, 30],   // Absolute max limit: 50
            },
            intBounds: {
                min: [1, 2, 3, 4, 5],
                max: [3, 5, 7, 9, 12],       // Absolute max limit: 50
            },
        },
        interactions: {
            actionTags: ['Fight_Monster', 'Evade_Monster', 'Ignore'],
        },
    },
};