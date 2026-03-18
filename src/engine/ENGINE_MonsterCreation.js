// File: src/engine/ENGINE_MonsterCreation.js
// Description: Procedural generation engine for Monster instantiation.

import { DB_NPC_MONSTERS } from './DB_NPC_MONSTERS.js';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Main logic for instantiating a Monster NPC.
 * @param {string} subclassKey - The strict string matching a key in DB_NPC_MONSTERS.
 * @param {number} requestedRank - Integer dictating the target entityRank (1-5).
 * @returns {Object} Instantiated entity object.
 */
export const generateMonsterNPC = (subclassKey, requestedRank) => {
    const profile = DB_NPC_MONSTERS[subclassKey];
    if (!profile) {
        throw new Error(`Monster Engine Error: Invalid subclass [${subclassKey}]`);
    }

    const genParams = profile.generationProfile;
    const logParams = profile.logistics;

    // 1. Resolve Rank
    const finalRank = Math.max(genParams.rankRange[0], Math.min(requestedRank, genParams.rankRange[1]));
    const rankIndex = finalRank - 1;

    // 2. Resolve Biology (HP)
    const baseHp = getRandomInt(genParams.baseHpBounds.min, genParams.baseHpBounds.max);
    const hpPerRank = getRandomInt(genParams.hpPerRankBounds.min, genParams.hpPerRankBounds.max);
    const totalHp = baseHp + (finalRank * hpPerRank);

    // 3. Resolve Stats
    const adp = getRandomInt(genParams.adpBounds.min[rankIndex], genParams.adpBounds.max[rankIndex]);
    const ddr = getRandomInt(genParams.ddrBounds.min[rankIndex], genParams.ddrBounds.max[rankIndex]);
    const str = getRandomInt(genParams.strBounds.min[rankIndex], genParams.strBounds.max[rankIndex]);
    const agi = getRandomInt(genParams.agiBounds.min[rankIndex], genParams.agiBounds.max[rankIndex]);
    const int = getRandomInt(genParams.intBounds.min[rankIndex], genParams.intBounds.max[rankIndex]);

    // 4. Resolve Logistics
    const foodYield = getRandomInt(logParams.foodYieldBounds.min, logParams.foodYieldBounds.max);
    const entityMass = getRandomInt(logParams.entityMassBounds.min, logParams.entityMassBounds.max);

    // 5. Construct Template
    const entityNameDisplay = subclassKey.replace('_', ' ');

    const entity = {
        entityId: generateUUID(),
        entityName: `Rank ${finalRank} ${entityNameDisplay}`,
        entityDescription: `A ${profile.classification.entityClass.toLowerCase()} ${entityNameDisplay.toLowerCase()} found in the wilderness.`,
        
        classification: {
            entityArchetype: profile.classification.entityArchetype,
            entityCategory: profile.classification.entityCategory,
            entityClass: profile.classification.entityClass,
            entitySubclass: profile.classification.entitySubclass,
            entityRank: finalRank,
        },
        
        biology: {
            hpCurrent: totalHp,
            hpMax: totalHp,
        },
        
        stats: {
            innateAdp: adp,
            innateDdr: ddr,
            innateStr: str,
            innateAgi: agi,
            innateInt: int,
        },
        
        behavior: {
            behaviorState: profile.behavior.behaviorState,
            isAlert: profile.behavior.isAlert,
            fleeHpPercentThreshold: profile.behavior.fleeHpPercentThreshold,
        },
        
        logistics: {
            resourceTag: logParams.resourceTag,
            foodYield: foodYield,
            foodConsumption: logParams.foodConsumption,
            entityMass: entityMass,
        },
        
        economy: {
            baseCoinValue: profile.economy.baseCoinValue,
            lootTableId: profile.economy.lootTableId,
        },
        
        interactions: {
            actionTags: profile.interactions.actionTags,
        },
    };

    return entity;
};

// ========================================================================
// TEST EXECUTION BLOCK
// ========================================================================
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('ENGINE_MonsterCreation.js')) {
    console.log("==========================================");
    console.log("ENGINE_MonsterCreation TEST INITIALIZED");
    console.log("==========================================");

    try {
        const testDireWolf = generateMonsterNPC('Dire_Wolf', 3);
        console.log("\n[TEST 1] Subclass: Dire_Wolf | Rank: 3");
        console.log(JSON.stringify(testDireWolf, null, 2));

        const testCaveTroll = generateMonsterNPC('Cave_Troll', 5);
        console.log("\n[TEST 2] Subclass: Cave_Troll | Rank: 5");
        console.log(JSON.stringify(testCaveTroll, null, 2));

    } catch (error) {
        console.error("\n[ERROR] Generation failed:", error.message);
    }
}