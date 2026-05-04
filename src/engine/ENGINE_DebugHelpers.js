// File: Client/src/engine/ENGINE_DebugHelpers.js
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';
import { generateLootItem } from './ENGINE_LootCreation.js';
import { getNephilimTrophy } from '../data/DB_Items.js'; 

import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';

export const DebugFactory = {
    createRandomEquipment: () => {
        const categories = DB_ITEM_NOMENCLATURE.categories;
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        return generateItem(randomCat, null, 'Loot');
    },

    createRandomMount: () => {
        return generateHorseMount();
    },

    createRandomDomestic: () => {
        const domesticTypes = DB_NPC_TAXONOMY.Animal.subclasses.Domestic;
        const randomType = domesticTypes[Math.floor(Math.random() * domesticTypes.length)];
        return generateAnimalNPC('Domestic', randomType);
    },

    createRandomLoot: () => {
        const randomRank = Math.floor(Math.random() * 5) + 1;
        return generateLootItem(null, randomRank);
    },

    // Separated resource generation
    createCoins: () => {
        return { coins: 1000 };
    },

    createFood: () => {
        return { food: 100 };
    },

    createRandomTrophy: () => {
        const nephilimTargets = [
            'Wolfscar', 'Gloomfeather', 'Ironcog', 
            'Twinspawn', 'Cinderheart', 'Dunejackal', 
            'Drakescale', 'Viperfang', 'Ganeshai',
            'Cloudshrike', 'Carrionbeak', 'Ironhoof',
            'Croctusk', 'Venomstalker', 'Hivelord', 'Ogreblood'
        ];
        
        const randomTarget = nephilimTargets[Math.floor(Math.random() * nephilimTargets.length)];
        const trophy = getNephilimTrophy(randomTarget);

        if (trophy) {
            return { ...trophy, entityId: `debug_trophy_${Date.now()}_${Math.random()}` };
        }

        return {
            entityId: `debug_trophy_${Date.now()}_${Math.random()}`,
            itemName: `Head of ${randomTarget}`,
            classification: { 
                itemCategory: 'Trophy', 
                itemClass: 'Nephilim_Head', 
                itemSubclass: randomTarget, 
                itemTier: 5 
            },
            stats: { adp: 0, ddr: 0, mass: 5 },
            state: null,
            economy: { baseCoinValue: 0 }
        };
    },
};