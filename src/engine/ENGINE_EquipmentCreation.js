// File: src/engine/THOR_EquipmentEngine.js
// Description: Procedural generation engine for weapons, armours, shields, and helmets.

import { WORLD } from '../data/GameWorld.js';

/**
 * Utility function to generate a pseudo-random integer within bounds.
 */
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Utility function to pick a random element from an array.
 */
const getRandomElement = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Generates a standard UUID v4 string for entity identification.
 */
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Main THOR Engine logic for instantiating an equipment item.
 * * @param {string} itemClass - 'Weapon', 'Armour', 'Shield', or 'Helmet'
 * @param {number} itemTier - Integer between 1 and 5 (represents NPC_Rank or Player_Rank)
 * @param {string} generationContext - 'Trade', 'NPC', or 'Loot'
 * @returns {Object} Instantiated ITEM_TEMPLATE object
 */
export const generateItem = (itemClass, itemTier, generationContext) => {
    // 1. Sanitize inputs and establish baseline pointers
    const safeClass = itemClass.toUpperCase();
    const safeClassLower = itemClass.toLowerCase();
    const safeContext = generationContext.toLowerCase();
    
    // Ensure tier is within engine limits
    const tier = Math.max(1, Math.min(itemTier, WORLD.ITEM.GENERAL.maxTier));
    const tierIndex = tier - 1; // 0-indexed for array lookups

    // Fetch categorical boundaries
    const categoryConfig = WORLD.ITEM[safeClass];
    if (!categoryConfig) throw new Error(`THOR Engine Error: Invalid itemClass [${itemClass}]`);

    // 2. Resolve Base Stats (ADP & DDR)
    const adp = getRandomInt(
        categoryConfig.adpBounds.min[tierIndex], 
        categoryConfig.adpBounds.max[tierIndex]
    );
    
    const ddr = getRandomInt(
        categoryConfig.ddrBounds.min[tierIndex], 
        categoryConfig.ddrBounds.max[tierIndex]
    );

    // 3. Resolve Nomenclature (Name Generation)
    const nomenclature = WORLD.ITEM.nomenclature;
    const prefix = getRandomElement(nomenclature.prefixes[safeClassLower]);
    const typeCategory = getRandomElement(nomenclature.classes[safeClassLower]); 
    const subclass = getRandomElement(nomenclature.subclasses[safeClassLower][typeCategory.toLowerCase()]);
    const suffix = getRandomElement(nomenclature.suffixes);
    
    const generatedName = `${prefix} ${subclass} ${suffix}`;

    // 4. Resolve Durability based on Generation Context
    let conditionRoll = 100;
    const genParams = WORLD.ITEM.GENERAL.generationContexts;

    if (safeContext === 'trade') {
        conditionRoll = genParams.trade.conditionBase;
    } else if (safeContext === 'npc') {
        const minCond = genParams.npc.minCondition + (tier * genParams.npc.conditionPerRank);
        conditionRoll = getRandomInt(Math.min(minCond, 100), 100);
    } else if (safeContext === 'loot') {
        const minCond = genParams.loot.maxCondition - (tier * genParams.loot.penaltyPerTier);
        conditionRoll = getRandomInt(Math.max(minCond, 1), 100);
    }

    const maxDurability = WORLD.ITEM.GENERAL.fullDurability;
    const currentDurability = Math.floor(maxDurability * (conditionRoll / 100));

    // 5. Calculate Economy (EIP - Economic Index Points)
    const goldPrice = WORLD.ECONOMY.baseValues.coinRegionalBaseCost;
    const eipAdpMult = WORLD.ITEM.GENERAL.eipPerAdp;
    const eipDdrMult = WORLD.ITEM.GENERAL.eipPerDdr;
    
    const baseCoinValue = Math.floor(
        (adp * eipAdpMult * goldPrice) + (ddr * eipDdrMult * goldPrice)
    );

    // 6. Construct and Return the Entity Template
    return {
        entityId: generateUUID(),
        itemName: generatedName,
        classification: {
            itemCategory: 'Physical',
            itemClass: itemClass,       // Original casing ('Weapon', etc.)
            itemSubclass: subclass,     // Extracted from nomenclature (e.g., 'Kite Shield')
            itemTier: tier,
        },
        stats: {
            adp: adp,
            ddr: ddr,
            mass: categoryConfig.baseMass,
        },
        state: {
            currentDurability: currentDurability,
            maxDurability: maxDurability,
        },
        economy: {
            baseCoinValue: baseCoinValue,
        }
    };
};


// ========================================================================
// TEST EXECUTION BLOCK
// ========================================================================
// if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('ENGINE_EquipmentCreation.js')) {
//     console.log("==========================================");
//     console.log("ENGINE_EquipmentCreation TEST INITIALIZED");
//     console.log("==========================================");

//     try {
//         const testTrade = generateItem('Weapon', 5, 'Trade');
//         console.log("\n[TEST 1] Context: Trade | Class: Weapon | Tier: 5");
//         console.log(JSON.stringify(testTrade, null, 2));

//         const testLoot = generateItem('Armour', 5, 'Loot');
//         console.log("\n[TEST 2] Context: Loot | Class: Armour | Tier: 5");
//         console.log(JSON.stringify(testLoot, null, 2));

//         const testNpc = generateItem('Helmet', 5, 'NPC');
//         console.log("\n[TEST 3] Context: NPC | Class: Helmet | Tier: 5");
//         console.log(JSON.stringify(testNpc, null, 2));

//     } catch (error) {
//         console.error("\n[ERROR] Generation failed:", error.message);
//     }
// }