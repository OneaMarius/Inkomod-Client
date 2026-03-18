// File: src/data/DB_Loot.js
// Description: Centralized database for loot tables defining the specific item drops for each NPC category.

export const DB_LOOT = {
    // ------------------------------------------------------------------------
    // LOOT TABLES
    // Referenced by the NPC's economy.lootTableId. 
    // Contains the specific trade good or item identifier generated upon death.
    // ------------------------------------------------------------------------
    lootTables: {
        table_animal_base: {
            itemId: 'item_animal_loot'
        },
        
        table_monster_base: {
            itemId: 'item_monster_loot'
        },
        
        table_human_base: {
            itemId: 'item_human_loot'
        },
        
        table_nephilim_base: {
            itemId: 'item_nephilim_loot'
        }
    }
};