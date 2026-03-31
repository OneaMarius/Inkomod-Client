// File: src/engine/ENGINE_Combat_Humanoid.js
// Description: Simultaneous MARS Combat resolution engine for Humanoids.

import { WORLD } from '../data/GameWorld.js';
import { calculateHitProbabilities, rollHitResult, calculateDamageDealt } from './ENGINE_Combat_Math.js';

const executeStrike = (attacker, defender, combatConfig, overrides = {}) => {
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

	const isDefenderCreature = false;
	const probabilities = calculateHitProbabilities(attacker, defender, combatConfig, attackerStance, defenderStance, isDefenderCreature);
	const { hitType, rollValue } = rollHitResult(probabilities, forceCritical);
	const finalDamage = calculateDamageDealt(attacker.stats.ad, defender.stats.dr, hitType, combatConfig);

	const degRules = combatConfig.itemDegradation[hitType];

	return {
		hitType,
		damageDealt: finalDamage,
		probabilities,
		rollValue,
		degradation: {
			attackerWeapon: attacker.equipment?.hasWeapon ? degRules.attackerWeapon : 0,
			defenderArmour: defender.equipment?.hasArmour ? degRules.defenderArmour : 0,
			defenderShield: defender.equipment?.hasShield ? degRules.defenderShield : 0,
			defenderWeapon: defender.equipment?.hasWeapon ? degRules.defenderWeapon : 0,
			defenderHelmet: defender.equipment?.hasHelmet ? degRules.defenderHelmet : 0,
		},
	};
};

export const resolveSimultaneousTurn = (fighterA, fighterB, overridesA = {}, overridesB = {}) => {
	const combatConfig = WORLD.COMBAT;
	const strikeFromA = executeStrike(fighterA, fighterB, combatConfig, overridesA);
	const strikeFromB = executeStrike(fighterB, fighterA, combatConfig, overridesB);

	return { action_FighterA_Attacks_B: strikeFromA, action_FighterB_Attacks_A: strikeFromB };
};
