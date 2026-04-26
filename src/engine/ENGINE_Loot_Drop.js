// File: src/engine/ENGINE_Loot_Drop.js
// Description: Extracts and calculates loot payload based on combat outcome, DB_Combat modifiers, and NPC inventory state.

import { DB_COMBAT } from '../data/DB_Combat.js';
import { generateLootItem } from './ENGINE_LootCreation.js'; // <-- IMPORTĂM NOUL GENERATOR
import { getNephilimTrophy } from '../data/DB_Items.js';

/**
 * Generates the physical and numeric loot payload dropped by a defeated or fleeing NPC.
 * @param {Object} npcEntity - The entity data structure from which loot is extracted.
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
		tradeItems: [], // Acum va conține OBIECTE GENERATE, nu doar ID-uri string
		equipment: [], // Array of functional gear objects
	};

	if (!consequence) return lootPayload;

	// Entity Rank used as a basic multiplier for numeric yields (if applicable)
	const rankMultiplier = npcEntity.identity?.entityRank || npcEntity.identity?.rank || npcEntity.classification?.entityRank || 1;

	// ========================================================================
	// 1. NUMERIC RESOURCE EXTRACTION (Coins & Food)
	// ========================================================================
	if (npcCategory === 'Human' || npcCategory === 'Nephilim') {
		const coinYield = consequence.coinYieldPct || 0;
		const foodYield = consequence.foodYieldPct || consequence.coinYieldPct || 0;

		if (npcEntity.inventory) {
			lootPayload.silverCoins = Math.floor((npcEntity.inventory.silverCoins || 0) * coinYield);
			lootPayload.food = Math.floor((npcEntity.inventory.food || 0) * foodYield);
		}
	} else if (npcCategory === 'Animal' || npcCategory === 'Monster') {
		const foodYield = consequence.foodYieldPct || 0;
		if (npcEntity.logistics) {
			lootPayload.food = Math.floor((npcEntity.logistics.foodYield || 0) * rankMultiplier * foodYield);
		}
	}

	// ========================================================================
	// 2. DYNAMIC LOOT GENERATION (Înlocuiește vechiul sistem static)
	// ========================================================================
	// Verificăm dacă consecința de combat permite un drop de loot (ex: la DEATH permite, la FLEE nu prea)
	if (consequence.tableLootYieldPct > 0) {
		// Dăm cu zarul să vedem dacă "pică" ceva (ex: tableLootYieldPct poate fi 0.5 adică 50%)
		const dropRoll = Math.random();

		if (dropRoll <= consequence.tableLootYieldPct) {
			// GENERĂM OBIECTUL BAZAT PE CATEGORIA NPC-ULUI
			const newLoot = generateLootItem(npcCategory);
			lootPayload.tradeItems.push(newLoot);

			// Opțional: Dacă NPC-ul are rank mare (Boss/Elite), poate da 2 iteme
			if (rankMultiplier >= 3 && Math.random() > 0.5) {
				lootPayload.tradeItems.push(generateLootItem(npcCategory));
			}
		}
	}

	// --- NOU: DROP GARANTAT PENTRU CAP DE NEPHILIM ---
	// Dacă inamicul este Nephilim și lupta s-a terminat cu moartea lui, primești trofeul
	if (npcCategory === 'Nephilim' && combatOutcome === 'WIN_DEATH') {
		const nephilimName = npcEntity.classification.entitySubclass;
		const trophyItem = getNephilimTrophy(nephilimName);

		if (trophyItem) {
			lootPayload.tradeItems.push(trophyItem);
		}
	}

	// ========================================================================
	// 3. EQUIPMENT EXTRACTION
	// ========================================================================
	if (consequence.equipmentDrop === true && npcEntity.equipment) {
		const gearSlots = ['weaponItem', 'shieldItem', 'armorItem', 'helmetItem'];

		gearSlots.forEach((slot) => {
			const item = npcEntity.equipment[slot];
			// Only extract items that survived the combat degradation process
			if (item && item.currentDurability > 0) {
				lootPayload.equipment.push(item);
			}
		});
	}

	return lootPayload;
};
