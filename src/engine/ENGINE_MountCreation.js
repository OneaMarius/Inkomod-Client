// File: src/engine/ENGINE_MountCreation.js
// Description: Procedural generation engine for Mount instantiation (Horses).

import { WORLD } from '../data/GameWorld.js';
// Presupunem că datele pe care mi le-ai dat sunt în acest fișier:
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
 * Main logic for instantiating a Mount NPC.
 * @param {number} rank - Integer between 1 and 5, dictating the entityRank.
 * @returns {Object} Instantiated ANIMAL_TEMPLATE object for a Horse.
 */
export const generateHorseMount = (rank) => {
    const profile = DB_NPC_ANIMALS.Horse; // Extragem baza de date
    if (!profile) throw new Error(`Mount Engine Error: Horse profile not found.`);

    const finalRank = Math.max(profile.generationProfile.rankRange[0], Math.min(rank, profile.generationProfile.rankRange[1]));
    const rankIndex = finalRank - 1;
    const genParams = profile.generationProfile;

    // 1. Calculate HP
    const maxHp = genParams.baseHp + (finalRank * genParams.hpPerRank);

    // 2. Calculate Attributes
    const str = getRandomInt(genParams.strBounds.min[rankIndex], genParams.strBounds.max[rankIndex]);
    const agi = getRandomInt(genParams.agiBounds.min[rankIndex], genParams.agiBounds.max[rankIndex]);

    // 3. Calculate Economy
    // Presupunem că baseCoinValue este prețul de bază în argint
    const coinValue = profile.economy.baseCoinValue * finalRank;
    
    // Nomenclator simplu pentru cai
    const horseNames = ["Mare", "Stallion", "Courser", "Charger", "Destrier"];
    const rankName = horseNames[rankIndex] || "Horse";

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
            resourceTag: profile.logistics.resourceTag,
            foodYield: profile.logistics.foodYield,
            foodConsumption: genParams.foodConsumptionPerRank * finalRank,
            entityMass: profile.logistics.entityMass,
        },
        
        economy: {
            baseCoinValue: coinValue,
            lootTableId: profile.economy.lootTableId,
        },
        
        interactions: {
            actionTags: profile.interactions.actionTags,
        },
    };
};