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
 * Instantiates an Animal NPC (excluding Mounts).
 * @param {string} entityClass - Mandatory. 'Domestic' or 'Wild'.
 * @param {string|null} subclassKey - Optional. Key matching DB_NPC_ANIMALS.
 * @param {number|null} requestedRank - Optional. Filters base animals by this native rank.
 * @returns {Object} Instantiated ANIMAL_TEMPLATE object.
 */
export const generateAnimalNPC = (entityClass, subclassKey = null, requestedRank = null) => {
    if (!entityClass) {
        throw new Error(`Animal Engine Error: entityClass parameter is mandatory (e.g., 'Domestic' or 'Wild').`);
    }

    let targetSubclass = null;
    const availableAnimals = Object.keys(DB_NPC_ANIMALS).filter(key => key !== 'Horse');

    if (subclassKey) {
        const tempProfile = DB_NPC_ANIMALS[subclassKey];
        if (!tempProfile) {
            throw new Error(`Animal Engine Error: Invalid subclass [${subclassKey}]`);
        }
        if (tempProfile.classification.entityClass !== entityClass) {
            throw new Error(`Animal Engine Error: Subclass [${subclassKey}] does not belong to Class [${entityClass}]`);
        }
        targetSubclass = subclassKey;
    } else {
        const classCandidates = availableAnimals.filter(key => 
            DB_NPC_ANIMALS[key].classification.entityClass === entityClass
        );

        if (classCandidates.length === 0) {
            throw new Error(`Animal Engine Error: No valid animal profiles found for Class [${entityClass}]`);
        }
        
        let validCandidates = classCandidates;

        if (requestedRank !== null) {
            const targetRank = Math.max(1, Math.min(5, requestedRank));
            const exactMatches = classCandidates.filter(key => 
                (DB_NPC_ANIMALS[key].generationProfile.rank || 1) === targetRank
            );

            if (exactMatches.length > 0) {
                validCandidates = exactMatches;
            } else {
                // Fallback: If exact rank is not found, find the closest available rank
                let minDiff = Infinity;
                let closestMatches = [];
                
                classCandidates.forEach(key => {
                    const rank = DB_NPC_ANIMALS[key].generationProfile.rank || 1;
                    const diff = Math.abs(rank - targetRank);
                    
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestMatches = [key];
                    } else if (diff === minDiff) {
                        closestMatches.push(key);
                    }
                });
                
                validCandidates = closestMatches.length > 0 ? closestMatches : classCandidates;
            }
        }

        targetSubclass = validCandidates[Math.floor(Math.random() * validCandidates.length)];
    }

    const profile = DB_NPC_ANIMALS[targetSubclass];
    const genParams = profile.generationProfile;
    const logParams = profile.logistics;

    const finalRank = genParams.rank || 1;

    const hp = getRandomInt(genParams.baseHpBounds.min, genParams.baseHpBounds.max);

    const adp = getRandomInt(genParams.innateAdpBounds.min, genParams.innateAdpBounds.max);
    const ddr = getRandomInt(genParams.innateDdrBounds.min, genParams.innateDdrBounds.max);
    const str = getRandomInt(genParams.innateStrBounds.min, genParams.innateStrBounds.max);
    const agi = getRandomInt(genParams.innateAgiBounds.min, genParams.innateAgiBounds.max);
    const int = getRandomInt(genParams.innateIntBounds.min, genParams.innateIntBounds.max);

    const entityMass = getRandomInt(logParams.entityMassBounds.min, logParams.entityMassBounds.max);
    
    const conversionFactor = logParams.foodConversionFactor || 1.0;
    const baseYieldPct = WORLD.NPC?.ANIMAL?.massToFoodYieldPct || 0.05; 
    
    const foodYield = Math.max(1, Math.floor(entityMass * baseYieldPct * conversionFactor));

    let finalConsumption = logParams.foodConsumption || 0;
    if (profile.classification.entityClass === 'Mount') {
        finalConsumption = finalConsumption * finalRank;
    }

    const goldPriceOfFood = WORLD.ECONOMY?.baseValues?.goldCoinBaseCostOfFood || 1;
    const dynamicCoinValue = foodYield * goldPriceOfFood;
    
    const lootTableId = profile.economy ? profile.economy.lootTableId : null;

    return {
        entityId: generateUUID(),
        entityName: targetSubclass,
        entityDescription: `A ${profile.classification.entityClass.toLowerCase()} ${targetSubclass.toLowerCase()} roaming the realm.`,
        
        classification: {
            entityArchetype: profile.classification.entityArchetype,
            entityCategory: profile.classification.entityCategory,
            entityClass: profile.classification.entityClass,
            entitySubclass: profile.classification.entitySubclass,
            entityRank: finalRank,
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
            foodConsumption: finalConsumption,
            entityMass: entityMass,
        },
        
        economy: {
            baseCoinValue: dynamicCoinValue,
            lootTableId: lootTableId,
        },
        
        interactions: {
            actionTags: profile.interactions.actionTags,
        },
    };
};