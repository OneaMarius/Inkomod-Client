// File: Client/src/engine/ENGINE_Interaction.js
// Description: Validates and executes non-combat state mutations based on DB_Interaction_Actions.

import { WORLD } from '../data/GameWorld.js';
import { DB_INTERACTION_ACTIONS } from '../data/DB_Interaction_Actions.js';

/**
 * Helper to convert abstract gold values to regional silver values.
 */
const convertGoldToSilver = (baseGold, exchangeRate) => {
	return Math.floor(baseGold * exchangeRate);
};

export const executeInteraction = (playerEntity, actionTag, npcTarget, regionalExchangeRate = 10) => {
	// Safely extract the ID for routing returns
	const targetId = npcTarget ? npcTarget.entityId || npcTarget.id : null;

	// 1. Fetch the exact configuration from the Single Source of Truth
	const config = DB_INTERACTION_ACTIONS[actionTag];

	if (!config) {
		return { status: 'FAILED_UNKNOWN_ACTION' };
	}

	// 2. Validate AP constraints
	const apCost = config.apCost !== undefined ? config.apCost : WORLD.PLAYER?.defaultInteractionApCost || 0;

	if (playerEntity.progression.actionPoints < apCost) {
		return { status: 'FAILED_INSUFFICIENT_AP' };
	}

	// ========================================================================
	// ROUTE: COMBAT
	// ========================================================================
	if (config.executionRoute === 'ROUTE_COMBAT') {
		playerEntity.progression.actionPoints -= apCost;

		// Return the exact combat rule (FF, NF, DMF) straight from the database
		return { status: 'TRIGGER_COMBAT', targetId: targetId, apSpent: apCost, combatRule: config.combatRule, updatedPlayer: playerEntity };
	}

	// ========================================================================
	// ROUTE: TRADE
	// ========================================================================
	if (config.executionRoute === 'ROUTE_TRADE') {
		playerEntity.progression.actionPoints -= apCost;
		return { status: 'TRIGGER_TRADE', targetId: targetId, apSpent: apCost, updatedPlayer: playerEntity };
	}

	// ========================================================================
	// ROUTE: INSTANT (State Mutations & Skill Checks)
	// ========================================================================
	if (config.executionRoute === 'ROUTE_INSTANT') {
		// --- EMPLOYMENT & LOGISTICS ---
		if (actionTag === 'Labor_Coin') {
			const yieldAmount = convertGoldToSilver(config.goldCoinBaseYield, regionalExchangeRate);
			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins += yieldAmount;
			return { status: 'SUCCESS', yieldAmount, updatedPlayer: playerEntity };
		}

		if (actionTag === 'Service_Lodging') {
			const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
			if (playerEntity.inventory.silverCoins < cost) return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
			if (playerEntity.biology.hpCurrent >= playerEntity.biology.hpMax) return { status: 'FAILED_ALREADY_FULL_HP' };

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= cost;
			playerEntity.biology.hpCurrent = Math.min(playerEntity.biology.hpMax, playerEntity.biology.hpCurrent + config.hpRestored);
			return { status: 'SUCCESS', costApplied: cost, hpRestored: config.hpRestored, updatedPlayer: playerEntity };
		}

		// --- MAINTENANCE & HEALING ---
		if (actionTag === 'Heal_Player') {
			const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
			if (playerEntity.inventory.silverCoins < cost) return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
			if (playerEntity.biology.hpCurrent >= playerEntity.biology.hpMax) return { status: 'FAILED_ALREADY_FULL_HP' };

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= cost;
			playerEntity.biology.hpCurrent = playerEntity.biology.hpMax; // Restores operational HP up to the wound limit
			return { status: 'SUCCESS', costApplied: cost, updatedPlayer: playerEntity };
		}

		if (actionTag === 'Cure_Player') {
			const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
			const hardCap = WORLD.PLAYER.hpLimits.hardCap;
			if (playerEntity.biology.hpMax >= hardCap) return { status: 'FAILED_ALREADY_CURED' };
			if (playerEntity.inventory.silverCoins < cost) return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= cost;
			playerEntity.biology.hpMax = hardCap;
			return { status: 'SUCCESS', costApplied: cost, updatedPlayer: playerEntity };
		}

		// --- ATTRIBUTE PROGRESSION ---
		if (actionTag.startsWith('Train_')) {
			const statKey = actionTag.split('_')[1].toLowerCase();
			const cost = convertGoldToSilver(config.goldCoinBaseCost, regionalExchangeRate);
			const currentStat = playerEntity.stats[statKey];

			const playerRankIndex = (playerEntity.identity.rank || 1) - 1;
			const currentCap = WORLD.PLAYER.trainingCaps[statKey][playerRankIndex];

			if (currentStat >= currentCap) return { status: 'FAILED_STAT_CAPPED' };
			if (playerEntity.inventory.silverCoins < cost) return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= cost;
			playerEntity.stats[statKey] += config.statIncrement;
			return { status: 'SUCCESS', costApplied: cost, statIncreased: statKey, updatedPlayer: playerEntity };
		}

		// --- SKILL CHECKS: STEALTH & ASSASSINATION ---
		const requiresStealthCheck = ['Target_Assassination', 'Target_Robbery', 'Target_Steal_Coin', 'Target_Steal_Food'].includes(actionTag);

		if (requiresStealthCheck) {
			if (!npcTarget) return { status: 'FAILED_NO_TARGET' };

			playerEntity.progression.actionPoints -= apCost;

			const pAgi = playerEntity.stats.agi || 10;
			const nAgi = npcTarget.stats?.agi || 10;
			const nInt = npcTarget.stats?.int || 10;
			const pRank = playerEntity.identity?.rank || 1;
			const nRank = npcTarget.classification?.entityRank || npcTarget.classification?.poiRank || 1;
			const rankDelta = Math.max(0, nRank - pRank);

			const checkConfig = WORLD.INTERACTION.skillChecks[actionTag];
			if (!checkConfig) return { status: 'FAILED_CONFIG_MISSING' };

			let successChance = checkConfig.baseChance;
			let combatRuleFallback = 'NF';

			if (actionTag === 'Target_Steal_Coin' || actionTag === 'Target_Steal_Food') {
				successChance += (pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'NF';
			} else if (actionTag === 'Target_Robbery') {
				successChance += (pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'DMF';
			} else if (actionTag === 'Target_Assassination') {
				successChance += (pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'DMF';
			}

			successChance = Math.max(checkConfig.minChance, Math.min(checkConfig.maxChance, successChance));
			const roll = Math.random() * 100;
			const isSuccess = roll <= successChance;

			if (!isSuccess) {
				return {
					status: 'FAILED_RISK_CHECK',
					targetId: targetId,
					apSpent: apCost,
					combatRule: combatRuleFallback,
					actionTag: actionTag,
					updatedPlayer: playerEntity,
				};
			}

			// [Success logic remains unchanged here...]
			if (actionTag === 'Target_Steal_Coin') {
				playerEntity.progression.honor = Math.max(-100, (playerEntity.progression.honor || 0) - 1);
				let stolenAmount = 0;
				if (npcTarget.inventory?.silverCoins > 0) {
					const stealPercentage = 0.1 + Math.random() * 0.2;
					stolenAmount = Math.floor(npcTarget.inventory.silverCoins * stealPercentage);
					if (stolenAmount < 1 && npcTarget.inventory.silverCoins >= 1) stolenAmount = 1;
					playerEntity.inventory.silverCoins += stolenAmount;
					npcTarget.inventory.silverCoins -= stolenAmount;
				}
				return { status: 'SUCCESS', yieldAmount: stolenAmount, updatedPlayer: playerEntity };
			}

			if (actionTag === 'Target_Steal_Food') {
				playerEntity.progression.honor = Math.max(-100, (playerEntity.progression.honor || 0) - 1);
				return { status: 'SUCCESS', updatedPlayer: playerEntity };
			}

			if (actionTag === 'Target_Robbery') {
				playerEntity.progression.honor = Math.max(-100, (playerEntity.progression.honor || 0) - 2);
				if (npcTarget.inventory?.itemSlots?.length > 0) {
					const randomIndex = Math.floor(Math.random() * npcTarget.inventory.itemSlots.length);
					const stolenItem = npcTarget.inventory.itemSlots.splice(randomIndex, 1)[0];
					if (playerEntity.inventory.itemSlots.length < (WORLD.PLAYER.inventoryLimits.itemSlots || 50)) {
						playerEntity.inventory.itemSlots.push(stolenItem);
					}
				}
				return { status: 'SUCCESS', updatedPlayer: playerEntity };
			}

			if (actionTag === 'Target_Assassination') {
				playerEntity.progression.honor = Math.max(-100, (playerEntity.progression.honor || 0) - 5);
				let lootedCoins = 0;
				if (npcTarget.inventory?.silverCoins > 0) {
					lootedCoins = npcTarget.inventory.silverCoins;
					playerEntity.inventory.silverCoins += lootedCoins;
					npcTarget.inventory.silverCoins = 0;
				}
				return { status: 'SUCCESS', yieldAmount: lootedCoins, updatedPlayer: playerEntity };
			}
		}

		// --- SKILL CHECKS: HUNTING & EVASION ---
		if (actionTag === 'Hunt_Animal' || actionTag === 'Evade_Animal' || actionTag === 'Evade_Monster') {
			playerEntity.progression.actionPoints -= apCost;

			const pAgi = playerEntity.stats.agi || 10;
			const nAgi = npcTarget.stats?.agi || 10;
			const pRank = playerEntity.identity?.rank || 1;
			const nRank = npcTarget.classification?.entityRank || npcTarget.classification?.poiRank || 1;
			const rankDelta = Math.max(0, nRank - pRank);

			const checkConfig = WORLD.INTERACTION.skillChecks[actionTag];
			if (!checkConfig) return { status: 'FAILED_CONFIG_MISSING' };

			let successChance = checkConfig.baseChance + (pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
			successChance = Math.max(checkConfig.minChance, Math.min(checkConfig.maxChance, successChance));

			const roll = Math.random() * 100;

			if (roll <= successChance) {
				return { status: 'SUCCESS', actionTag, updatedPlayer: playerEntity };
			} else {
				if (actionTag === 'Hunt_Animal') {
					return {
						status: 'FAILED_RISK_CHECK',
						targetId: targetId,
						apSpent: apCost,
						combatRule: 'DMF',
						actionTag: actionTag,
						updatedPlayer: playerEntity,
					};
				} else {
					return { status: 'TRIGGER_COMBAT', targetId: targetId, apSpent: 0, combatRule: 'DMF', updatedPlayer: playerEntity };
				}
			}
		}

		// --- BRIBERY LOGIC ---
		if (actionTag === 'Target_Bribe') {
			if (!npcTarget) return { status: 'FAILED_NO_TARGET' };

			// Calculate bribe cost based on NPC rank
			const npcRank = npcTarget.classification?.entityRank || 1;
			const bribeCost = npcRank * 15 * regionalExchangeRate;

			if (playerEntity.inventory.silverCoins < bribeCost) {
				return { status: 'FAILED_INSUFFICIENT_FUNDS', required: bribeCost };
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= bribeCost;
			npcTarget.inventory.silverCoins = (npcTarget.inventory.silverCoins || 0) + bribeCost;

			// Alter behavior to avoid combat in the future
			if (npcTarget.behavior) {
				npcTarget.behavior.state = 'Neutral';
			}

			return { status: 'SUCCESS', costApplied: bribeCost, updatedPlayer: playerEntity };
		}

		if (actionTag === 'Ignore') {
			return { status: 'SUCCESS', actionTag, updatedPlayer: playerEntity };
		}

		// Catch-all for actions mapped but lacking specific programmatic logic yet
		return { status: 'FAILED_ACTION_NOT_IMPLEMENTED' };
	}

	// ========================================================================
	// ROUTE: SPATIAL (Safety Catch)
	// ========================================================================
	if (config.executionRoute === 'ROUTE_SPATIAL') {
		// Spatial actions should be routed through GameManager's native map logic.
		// If they reach the NPC Interaction Engine, routing is misconfigured.
		return { status: 'FAILED_INVALID_ROUTING' };
	}

	return { status: 'FAILED_UNKNOWN_ACTION' };
};
