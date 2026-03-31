// File: src/engine/ENGINE_Combat_Creature.js
// Description: Simultaneous MARS Combat resolution engine for Humanoid vs. Creature engagements.

import { WORLD } from '../data/GameWorld.js';
import { calculateHitProbabilities, rollHitResult, calculateDamageDealt } from './ENGINE_Combat_Math.js';

const executeHumanoidStrikeOnCreature = (humanoid, creature, combatConfig, overrides = {}) => {
	const { skipAttack = false, forceCritical = false, attackerStance = 'BALANCED', defenderStance = 'BALANCED' } = overrides;

	if (skipAttack) {
		return {
			hitType: 'none',
			damageDealt: 0,
			probabilities: null,
			rollValue: 0,
			degradation: { attackerWeapon: 0, defenderArmour: 0, defenderShield: 0, defenderWeapon: 0, defenderHelmet: 0 },
		};
	}

	const isDefenderCreature = true;
	const probabilities = calculateHitProbabilities(humanoid, creature, combatConfig, attackerStance, defenderStance, isDefenderCreature);
	const { hitType, rollValue } = rollHitResult(probabilities, forceCritical);
	const finalDamage = calculateDamageDealt(humanoid.stats.ad, creature.stats.dr, hitType, combatConfig);

	const degRules = combatConfig.itemDegradation[hitType];

	return {
		hitType,
		damageDealt: finalDamage,
		probabilities,
		rollValue,
		degradation: {
			attackerWeapon: humanoid.equipment?.hasWeapon ? degRules.attackerWeapon : 0,
			defenderArmour: 0,
			defenderShield: 0,
			defenderWeapon: 0,
			defenderHelmet: 0,
		},
	};
};

const executeCreatureStrikeOnHumanoid = (creature, humanoid, combatConfig, overrides = {}) => {
	const { skipAttack = false, forceCritical = false, attackerStance = 'BALANCED', defenderStance = 'BALANCED' } = overrides;

	if (skipAttack) {
		return {
			hitType: 'none',
			damageDealt: 0,
			probabilities: null,
			rollValue: 0,
			degradation: { attackerWeapon: 0, defenderArmour: 0, defenderShield: 0, defenderWeapon: 0, defenderHelmet: 0 },
		};
	}

	const isDefenderCreature = false; // The Humanoid is defending
	const probabilities = calculateHitProbabilities(creature, humanoid, combatConfig, attackerStance, defenderStance, isDefenderCreature);
	const { hitType, rollValue } = rollHitResult(probabilities, forceCritical);
	const finalDamage = calculateDamageDealt(creature.stats.ad, humanoid.stats.dr, hitType, combatConfig);

	const degRules = combatConfig.itemDegradation[hitType];

	return {
		hitType,
		damageDealt: finalDamage,
		probabilities,
		rollValue,
		degradation: {
			attackerWeapon: 0, // Creature has no weapon to break
			defenderArmour: humanoid.equipment?.hasArmour ? degRules.defenderArmour : 0,
			defenderShield: humanoid.equipment?.hasShield ? degRules.defenderShield : 0,
			defenderWeapon: humanoid.equipment?.hasWeapon ? degRules.defenderWeapon : 0,
			defenderHelmet: humanoid.equipment?.hasHelmet ? degRules.defenderHelmet : 0,
		},
	};
};

export const resolveCreatureEncounterTurn = (humanoid, creature, overridesHumanoid = {}, overridesCreature = {}) => {
	const combatConfig = WORLD.COMBAT;
	const humanoidStrike = executeHumanoidStrikeOnCreature(humanoid, creature, combatConfig, overridesHumanoid);
	const creatureStrike = executeCreatureStrikeOnHumanoid(creature, humanoid, combatConfig, overridesCreature);

	return { action_Humanoid_Attacks_Creature: humanoidStrike, action_Creature_Attacks_Humanoid: creatureStrike };
};
