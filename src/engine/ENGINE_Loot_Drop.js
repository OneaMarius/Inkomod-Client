// File: src/engine/ENGINE_Loot_Drop.js
// Description: Extracts and calculates loot payload based on combat outcome, DB_Combat modifiers, and NPC inventory state.

import { DB_COMBAT } from '../data/DB_Combat.js';
import { DB_LOOT } from '../data/DB_Loot.js';

/**
 * Generates the physical and numeric loot payload dropped by a defeated or fleeing NPC.
 * * @param {Object} npcEntity - The entity data structure from which loot is extracted.
 * @param {String} combatType - 'FF', 'NF', 'DMF'
 * @param {String} combatOutcome - e.g., 'WIN_DEATH', 'WIN_SURRENDER'
 * @returns {Object} lootPayload - Contains calculated numeric values and arrays of physical items.
 */
export const generateCombatLoot = (npcEntity, combatType, combatOutcome) => {
    const npcCategory = npcEntity.classification.entityCategory;
    const consequence = DB_COMBAT.resolutionConsequences[npcCategory]?.[combatType]?.[combatOutcome];

    const lootPayload = {
        silverCoins: 0,
        food: 0,
        tradeItems: [], // Array of string IDs representing physical loot items
        equipment: [],  // Array of functional gear objects
    };

    if (!consequence) return lootPayload;

    // Entity Rank used as a basic multiplier for numeric yields (if applicable)
    const rankMultiplier = npcEntity.identity.entityRank || npcEntity.identity.rank || 1;

    // ========================================================================
    // 1. NUMERIC RESOURCE EXTRACTION (Coins & Food)
    // ========================================================================
    if (npcCategory === 'Human' || npcCategory === 'Nephilim') {
        const coinYield = consequence.coinYieldPct || 0;
        // Extrapolating food yield concept for humanoids if applicable in future states
        const foodYield = consequence.foodYieldPct || consequence.coinYieldPct || 0; 
        
        if (npcEntity.inventory) {
            lootPayload.silverCoins = Math.floor((npcEntity.inventory.silverCoins || 0) * coinYield);
            lootPayload.food = Math.floor((npcEntity.inventory.food || 0) * foodYield);
        }
    } else if (npcCategory === 'Animal') {
        const foodYield = consequence.foodYieldPct || 0;
        if (npcEntity.logistics) {
            // Animal food yield scales with their base yield, rank, and the combat outcome percentage
            lootPayload.food = Math.floor((npcEntity.logistics.foodYield || 0) * rankMultiplier * foodYield);
        }
    }

    // ========================================================================
    // 2. LOOT TABLE EXTRACTION (Strictly 1 Item)
    // ========================================================================
    if (consequence.tableLootYieldPct > 0 && npcEntity.economy && npcEntity.economy.lootTableId) {
        const tableId = npcEntity.economy.lootTableId;
        const lootTableDef = DB_LOOT.lootTables[tableId];
        
        if (lootTableDef && lootTableDef.itemId) {
            lootPayload.tradeItems.push(lootTableDef.itemId);
        }
    }

    // ========================================================================
    // 3. EQUIPMENT EXTRACTION
    // ========================================================================
    if (consequence.equipmentDrop === true && npcEntity.equipment) {
        const gearSlots = ['weaponItem', 'shieldItem', 'armourItem', 'helmetItem'];
        
        gearSlots.forEach(slot => {
            const item = npcEntity.equipment[slot];
            // Only extract items that survived the combat degradation process
            if (item && item.currentDurability > 0) {
                lootPayload.equipment.push(item);
            }
        });
    }

    return lootPayload;
};