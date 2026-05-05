// File: src/engine/ENGINE_Loot_Drop.js
import { generateLootItem } from './ENGINE_LootCreation.js';

export const generateDynamicLoot = (npcCategory, tableLootRewardPct, rankMultiplier = 1, playerRank = 1) => {
	const lootArray = [];

	if (!tableLootRewardPct || tableLootRewardPct <= 0) {
		return lootArray;
	}

	const dropRoll = Math.random();

	if (dropRoll <= tableLootRewardPct) {
		const newLoot = generateLootItem(npcCategory, rankMultiplier);
		if (newLoot) {
			lootArray.push({ ...newLoot, entityId: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` });
		}

		if (rankMultiplier >= 3 && playerRank <= rankMultiplier && Math.random() > 0.5) {
			const bonusLoot = generateLootItem(npcCategory, rankMultiplier);
			if (bonusLoot) {
				lootArray.push({ ...bonusLoot, entityId: `loot_bonus_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` });
			}
		}
	}

	return lootArray;
};
