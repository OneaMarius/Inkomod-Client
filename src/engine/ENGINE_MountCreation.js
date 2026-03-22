// File: src/engine/ENGINE_MountCreation.js
// Description: Procedural generation engine for Mount instantiation.

import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_ANIMALS } from '../data/DB_NPC_Animals.js';

const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Instantiates a Mount NPC.
 * @param {number|null} requestedRank - Optional rank boundary (1-5).
 * @returns {Object} Instantiated ANIMAL_TEMPLATE object.
 */
export const generateHorseMount = (requestedRank = null) => {
    const profile = DB_NPC_ANIMALS.Horse;
    if (!profile)
        throw new Error(`Mount Engine Error: Horse profile not found.`);

    let finalRank;
    if (requestedRank !== null) {
        finalRank = Math.max(
            profile.generationProfile.rankRange[0],
            Math.min(requestedRank, profile.generationProfile.rankRange[1]),
        );
    } else {
        const minRank = profile.generationProfile.rankRange[0];
        const maxRank = profile.generationProfile.rankRange[1];
        finalRank = getRandomInt(minRank, maxRank);
    }

    const rankIndex = finalRank - 1;
    const genParams = profile.generationProfile;
    const logParams = profile.logistics;

    const maxHp = genParams.baseHp + finalRank * genParams.hpPerRank;

    const str = getRandomInt(
        genParams.strBounds.min[rankIndex],
        genParams.strBounds.max[rankIndex],
    );
    const agi = getRandomInt(
        genParams.agiBounds.min[rankIndex],
        genParams.agiBounds.max[rankIndex],
    );

    const entityMass = getRandomInt(
        logParams.entityMassBounds.min,
        logParams.entityMassBounds.max,
    );

    const conversionFactor = logParams.foodConversionFactor || 1.0;
    const baseYieldPct = WORLD.NPC?.ANIMAL?.massToFoodYieldPct || 0.05;
    const foodYield = Math.max(
        1,
        Math.floor(entityMass * baseYieldPct * conversionFactor),
    );

    // Hybrid Economy Calculation
    const goldPriceOfFood = WORLD.ECONOMY?.baseValues?.goldCoinBaseCostOfFood || 1;
    const meatValue = foodYield * goldPriceOfFood; 

    const goldPrice = WORLD.ECONOMY?.baseValues?.coinRegionalBaseCost || 1;
    const eipPerAgi = WORLD.NPC?.ANIMAL?.MOUNT?.eipPerAgi || 1;
    const eipPerStr = WORLD.NPC?.ANIMAL?.MOUNT?.eipPerStr || 2;
    const eipMountBonus = WORLD.NPC?.ANIMAL?.MOUNT?.eipMountBonus || 10;

    const utilityValue = Math.floor(
        str * eipPerStr * goldPrice +
            agi * eipPerAgi * goldPrice +
            finalRank * eipMountBonus * goldPrice,
    );

    const finalCoinValue = meatValue + utilityValue; 

    const horseNames = ['Mare', 'Stallion', 'Courser', 'Charger', 'Destrier'];
    const rankName = horseNames[rankIndex] || 'Horse';

    return {
        entityId: generateUUID(),
        entityName: `Rank ${finalRank} ${rankName}`,
        entityDescription: `A sturdy mount bred for travel and endurance.`,
        classification: {
            entityArchetype: profile.classification.entityArchetype,
            entityCategory: profile.classification.entityCategory,
            entityClass: profile.classification.entityClass,
            entitySubclass: profile.classification.entitySubclass,
            entityRank: finalRank,
        },
        biology: {
            hpCurrent: maxHp,
            hpMax: maxHp,
        },
        stats: {
            innateAdp: genParams.innateAdp,
            innateDdr: genParams.innateDdr,
            innateStr: str,
            innateAgi: agi,
            innateInt: genParams.innateInt,
        },
        behavior: {
            behaviorState: profile.behavior.behaviorState,
            isAlert: profile.behavior.isAlert,
            fleeHpPercentThreshold: profile.behavior.fleeHpPercentThreshold,
        },
        logistics: {
            resourceTag: logParams.resourceTag,
            foodYield: foodYield,
            foodConsumption: logParams.foodConsumption * finalRank,
            entityMass: entityMass,
        },
        economy: {
            baseCoinValue: finalCoinValue,
            lootTableId: profile.economy ? profile.economy.lootTableId : null,
        },
        interactions: {
            actionTags: profile.interactions.actionTags,
        },
    };
};