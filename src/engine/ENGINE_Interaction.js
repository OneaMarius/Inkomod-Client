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

export const executeInteraction = (playerEntity, actionTag, targetId, regionalExchangeRate = 10) => {
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

		// --- SKILL CHECKS: HUNTING & EVASION ---
		if (actionTag === 'Hunt_Animal' || actionTag === 'Evade_Animal' || actionTag === 'Evade_Monster') {
			playerEntity.progression.actionPoints -= apCost;

			// Simple Agility vs RNG scaling check (Can be expanded later)
			const agi = playerEntity.stats.agi || 10;
			const successChance = Math.min(90, 30 + agi * 2);
			const roll = Math.random() * 100;

			if (roll <= successChance) {
				return { status: 'SUCCESS', actionTag, updatedPlayer: playerEntity };
			} else {
				// Failure triggers immediate lethal combat (Deathmatch)
				return { status: 'TRIGGER_COMBAT', targetId: targetId, apSpent: 0, combatRule: 'DMF', updatedPlayer: playerEntity };
			}
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
