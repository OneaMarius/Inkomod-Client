// File: Client/src/engine/ENGINE_DebugHelpers.js
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';
import { generateLootItem } from './ENGINE_LootCreation.js'; // <-- Import nou

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
        return generateLootItem();
    },

    createRandomResources: () => {
        return { coins: Math.floor(Math.random() * 50) + 10, food: Math.floor(Math.random() * 20) + 10 };
    },
};
