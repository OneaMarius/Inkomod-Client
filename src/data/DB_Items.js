// File: src/data/DB_Items.js
// Description: Item templates, static consumables, and fixed-stat artifacts.

// The mandatory schema that the THOR engine must output when generating an item.
export const ITEM_TEMPLATE = {
    entityId: '',           // UUID generated at runtime
    itemName: '',           // Procedurally generated string
    classification: {
        itemCategory: '',   // Physical, Consumable, Quest
        itemClass: '',      // Weapon, Armour, Shield, Helmet
        itemSubclass: '',   // Sword, Kite Shield, Plate, etc.
        itemTier: 1,        // 1 to 5
    },
    stats: {
        adp: 0,             // Attack Damage Power
        ddr: 0,             // Defense Damage Reduction
        mass: 0,            // Base mass from WORLD.ITEM
    },
    state: {
        currentDurability: 100,
        maxDurability: 100,
    },
    economy: {
        baseCoinValue: 0,   // Calculated via EIP
    }
};

// Items that bypass procedural generation
export const DB_ITEMS_STATIC = [
    {
        itemId: 'consumable_salve_01',
        itemName: 'Basic Healing Salve',
        classification: {
            itemCategory: 'Consumable',
            itemClass: 'Medical',
        },
        stats: {
            healingValue: 15,
            mass: 1,
        },
        economy: {
            baseCoinValue: 20,
        }
    },
    // Quest items, keys, specific materials
];

// Hand-crafted legendary gear that ignores normal tier boundaries
export const DB_ITEMS_ARTIFACTS = [
    {
        itemId: 'artifact_sword_01',
        itemName: 'The Kingslayer',
        classification: {
            itemCategory: 'Physical',
            itemClass: 'Weapon',
            itemSubclass: 'Sword',
            itemTier: 5,
        },
        stats: {
            adp: 150, // Exceeds standard bounds
            ddr: 5,
            mass: 6,
        },
        state: {
            currentDurability: 200, // Unbreakable or highly durable
            maxDurability: 200,
        },
        economy: {
            baseCoinValue: 5000,
        }
    }
];