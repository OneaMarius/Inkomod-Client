// File: src/engine/ENGINE_AnimalCreation.js
// Description: Procedural generation engine for wild and domestic animal instantiation.

import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_ANIMALS } from '../data/DB_NPC_Animals.js';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Main logic for instantiating an Animal NPC (excluding Mounts).
 * @param {string} subclassKey - The strict string matching a key in DB_NPC_ANIMALS.
 * @returns {Object} Instantiated ANIMAL_TEMPLATE object.
 */
export const generateAnimalNPC = (subclassKey) => {
    if (subclassKey === 'Horse') {
        throw new Error(`Animal Engine Error: Mounts must be generated using ENGINE_MountCreation.`);
    }

    const profile = DB_NPC_ANIMALS[subclassKey];
    if (!profile) {
        throw new Error(`Animal Engine Error: Invalid subclass [${subclassKey}]`);
    }

    const genParams = profile.generationProfile;
    const logParams = profile.logistics;

    // 1. Resolve Biology
    const hp = getRandomInt(genParams.baseHpBounds.min, genParams.baseHpBounds.max);

    // 2. Resolve Stats
    const adp = getRandomInt(genParams.innateAdpBounds.min, genParams.innateAdpBounds.max);
    const ddr = getRandomInt(genParams.innateDdrBounds.min, genParams.innateDdrBounds.max);
    const str = getRandomInt(genParams.innateStrBounds.min, genParams.innateStrBounds.max);
    const agi = getRandomInt(genParams.innateAgiBounds.min, genParams.innateAgiBounds.max);
    const int = getRandomInt(genParams.innateIntBounds.min, genParams.innateIntBounds.max);

    // 3. Resolve Logistics
    const foodYield = getRandomInt(logParams.foodYieldBounds.min, logParams.foodYieldBounds.max);
    const entityMass = getRandomInt(logParams.entityMassBounds.min, logParams.entityMassBounds.max);
    
    // 4. Resolve Economy
    const baseCoinValue = profile.economy ? profile.economy.baseCoinValue : 0;
    const lootTableId = profile.economy ? profile.economy.lootTableId : null;

    // 5. Construct Template
    const entity = {
        entityId: generateUUID(),
        entityName: subclassKey,
        entityDescription: `A ${profile.classification.entityClass.toLowerCase()} ${subclassKey.toLowerCase()} roaming the realm.`,
        
        classification: {
            entityArchetype: profile.classification.entityArchetype,
            entityCategory: profile.classification.entityCategory,
            entityClass: profile.classification.entityClass,
            entitySubclass: profile.classification.entitySubclass,
            entityRank: genParams.rank,
        },
        
        biology: {
            hpCurrent: hp,
            hpMax: hp,
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
            foodConsumption: genParams.foodConsumptionPerRank ? (genParams.foodConsumptionPerRank * genParams.rank) : 0,
            entityMass: entityMass,
        },
        
        economy: {
            baseCoinValue: baseCoinValue,
            lootTableId: lootTableId,
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
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('ENGINE_AnimalCreation.js')) {
    console.log("==========================================");
    console.log("ENGINE_AnimalCreation TEST INITIALIZED");
    console.log("==========================================");

    try {
        const testWolf = generateAnimalNPC('Wolf');
        console.log("\n[TEST 1] Subclass: Wolf | Class: Wild");
        console.log(JSON.stringify(testWolf, null, 2));

        const testCow = generateAnimalNPC('Cow');
        console.log("\n[TEST 2] Subclass: Cow | Class: Domestic");
        console.log(JSON.stringify(testCow, null, 2));

    } catch (error) {
        console.error("\n[ERROR] Generation failed:", error.message);
    }
}