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
 * @param {string} entityClass - Mandatory. 'Domestic' or 'Wild'.
 * @param {string|null} subclassKey - Optional. The strict string matching a key in DB_NPC_ANIMALS.
 * @returns {Object} Instantiated ANIMAL_TEMPLATE object.
 */
export const generateAnimalNPC = (entityClass, subclassKey = null) => {
    if (!entityClass) {
        throw new Error(`Animal Engine Error: entityClass parameter is mandatory (e.g., 'Domestic' or 'Wild').`);
    }

    let targetSubclass = null;

    // Filtrăm toate animalele, excluzând caii (Mounts)
    const availableAnimals = Object.keys(DB_NPC_ANIMALS).filter(key => key !== 'Horse');

    if (subclassKey) {
        // Validăm dacă subclasa oferită există și dacă aparține clasei cerute
        const tempProfile = DB_NPC_ANIMALS[subclassKey];
        if (!tempProfile) {
            throw new Error(`Animal Engine Error: Invalid subclass [${subclassKey}]`);
        }
        if (tempProfile.classification.entityClass !== entityClass) {
            throw new Error(`Animal Engine Error: Subclass [${subclassKey}] does not belong to Class [${entityClass}]`);
        }
        targetSubclass = subclassKey;
    } else {
        // Alegem random un animal care face parte din clasa cerută
        const classCandidates = availableAnimals.filter(key => 
            DB_NPC_ANIMALS[key].classification.entityClass === entityClass
        );

        if (classCandidates.length === 0) {
            throw new Error(`Animal Engine Error: No valid animal profiles found for Class [${entityClass}]`);
        }
        
        targetSubclass = classCandidates[Math.floor(Math.random() * classCandidates.length)];
    }

    const profile = DB_NPC_ANIMALS[targetSubclass];
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
        entityName: targetSubclass,
        entityDescription: `A ${profile.classification.entityClass.toLowerCase()} ${targetSubclass.toLowerCase()} roaming the realm.`,
        
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