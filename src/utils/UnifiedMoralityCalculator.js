// File: Client/src/utils/UnifiedMoralityCalculator.js
// Description: Single Source of Truth for calculating cumulative morality across Actions, Fleeing, and Combat.

import { WORLD } from '../data/GameWorld.js';
import { DB_COMBAT } from '../data/DB_Combat.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';

/**
 * Helper: Calculates the specific moral penalty for attacking/killing a specific NPC type.
 * @param {Object} npcEntity 
 * @param {boolean} isLethal 
 * @returns {Object} { honorChange: number, renownChange: number, label: string }
 */
export const getNpcMoralityPenalty = (npcEntity, isLethal) => {
	const defaultResult = { honorChange: 0, renownChange: 0, label: 'Standard Encounter' };
	if (!npcEntity || !npcEntity.classification) return defaultResult;

	const category = npcEntity.classification.entityCategory;
	let entityClass = npcEntity.classification.entityClass;
	const entitySubclass = npcEntity.classification.entitySubclass;

	const config = WORLD.MORALITY.combatConsequences;
	const categoryConfig = config[category];
	if (!categoryConfig) return defaultResult;

	let finalConfig = null;

	if (category === 'Human') {
		finalConfig = categoryConfig[entityClass] || categoryConfig.DEFAULT_CIVILIAN;
	} else if (category === 'Animal') {
		if (entityClass === 'Wild' && entitySubclass) {
			const isHostile = DB_NPC_TAXONOMY.Animal.subclasses.WildHostile?.includes(entitySubclass);
			const isFriendly = DB_NPC_TAXONOMY.Animal.subclasses.WildFriendly?.includes(entitySubclass);
			if (isHostile) entityClass = 'WildHostile';
			else if (isFriendly) entityClass = 'WildFriendly';
		}
		finalConfig = categoryConfig[entityClass] || categoryConfig.WildHostile;
	} else {
		finalConfig = categoryConfig.DEFAULT;
	}

	const outcomeKey = isLethal ? 'lethal' : 'nonLethal';
	return finalConfig[outcomeKey] || defaultResult;
};

/**
 * Main Engine: Calculates all potential morality outcomes (V1, V2, V3) for a given action and target.
 * @param {string} actionTag - Action from DB_Interaction_Actions
 * @param {Object} npcEntity - Target entity
 * @param {string} combatRule - 'DMF', 'NF', or 'FF'
 * @returns {Object} Complete assessment matrix
 */
export const calculateRiskAndCombatScenarios = (actionTag, npcEntity, combatRule = 'DMF') => {
	// 1. Fetch base action configurations
	const actionConfig = WORLD.MORALITY.actions[actionTag] || null;
	const globalFleeConfig = WORLD.MORALITY.actions.globalFleeFromCrime || { honorChange: 0, renownChange: 0 };
	
	// Default base costs (0 for direct combat actions)
	let baseSuccess = { honorChange: 0, renownChange: 0, label: 'Success' };
	let baseFailure = { honorChange: 0, renownChange: 0, label: 'Failure' };

	if (actionConfig) {
		if (actionConfig.success) baseSuccess = { ...actionConfig.success };
		if (actionConfig.failure) baseFailure = { ...actionConfig.failure };
	}

	// 2. V1 & V2: Risk Assessment (Stealth & Escape paths)
	const v1_Success = {
		honor: baseSuccess.honorChange,
		renown: baseSuccess.renownChange,
		label: baseSuccess.label
	};

	const v2_CaughtAndFlee = {
		honor: baseFailure.honorChange + globalFleeConfig.honorChange,
		renown: baseFailure.renownChange + globalFleeConfig.renownChange,
		label: 'Caught and Escaped'
	};

	// 3. V3: Combat Escalation Paths
	const v3_Combat = {
		lethalWin: { honor: 0, renown: 0 },
		nonLethalWin: { honor: 0, renown: 0 },
		defeatFlee: { honor: 0, renown: 0 }
	};

	if (npcEntity) {
		const category = npcEntity.classification?.entityCategory || 'Human';
		const combatMatrix = DB_COMBAT.resolutionConsequences[category]?.[combatRule] || {};

		// Extract base combat rewards/penalties
		const dbWinDeath = combatMatrix.WIN_DEATH || { honModifier: 0, renModifier: 0 };
		const dbWinFlee = combatMatrix.WIN_FLEE || combatMatrix.WIN_SURRENDER || { honModifier: 0, renModifier: 0 };
		const dbLoseFlee = combatMatrix.LOSE_FLEE || combatMatrix.LOSE_SURRENDER || { honModifier: 0, renModifier: 0 };

		// Extract NPC-specific morality modifiers
		const npcPenaltyLethal = getNpcMoralityPenalty(npcEntity, true);
		const npcPenaltyNonLethal = getNpcMoralityPenalty(npcEntity, false);

		// V3 - Scenario A: Lethal Victory (Win by Death)
		v3_Combat.lethalWin.honor = baseFailure.honorChange + dbWinDeath.honModifier + npcPenaltyLethal.honorChange;
		v3_Combat.lethalWin.renown = baseFailure.renownChange + dbWinDeath.renModifier + npcPenaltyLethal.renownChange;

		// V3 - Scenario B: Tactical Victory (NPC Flees/Surrenders)
		v3_Combat.nonLethalWin.honor = baseFailure.honorChange + dbWinFlee.honModifier + npcPenaltyNonLethal.honorChange;
		v3_Combat.nonLethalWin.renown = baseFailure.renownChange + dbWinFlee.renModifier + npcPenaltyNonLethal.renownChange;

		// V3 - Scenario C: Defeat (Player Flees/Surrenders)
		v3_Combat.defeatFlee.honor = baseFailure.honorChange + dbLoseFlee.honModifier + npcPenaltyNonLethal.honorChange;
		v3_Combat.defeatFlee.renown = baseFailure.renownChange + dbLoseFlee.renModifier + npcPenaltyNonLethal.renownChange;
	}

	return {
		baseFailureCost: { honor: baseFailure.honorChange, renown: baseFailure.renownChange },
		v1_Success,
		v2_CaughtAndFlee,
		v3_Combat
	};
};