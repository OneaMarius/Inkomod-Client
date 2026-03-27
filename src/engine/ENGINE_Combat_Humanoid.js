// File: src/engine/ENGINE_Combat_Humanoid.js
// Description: Simultaneous MARS Combat resolution engine for Humanoid engagements with encumbrance/agility bonuses and state overrides.

import { WORLD } from '../data/GameWorld.js';

const calculateCI = (intStat) => Math.floor(intStat / 5) - 5;

const executeStrike = (attacker, defender, combatConfig, overrides = {}) => {
	const { skipAttack = false, forceCritical = false } = overrides;

	// ========================================================================
	// 0. CHECK OVERRIDES (HEAL / FLEE)
	// ========================================================================
	if (skipAttack) {
		return {
			hitType: 'none',
			damageDealt: 0,
			probabilities: null,
			rollValue: 0,
			degradation: { attackerWeapon: 0, defenderArmour: 0, defenderShield: 0, defenderWeapon: 0, defenderHelmet: 0 },
		};
	}

	const { multipliers, itemDegradation, coreStats, probabilityModifiers, encumbranceBonuses, vulnerabilityRates } = combatConfig;

	const defCI = calculateCI(defender.stats.int);

	// ========================================================================
	// 1. ENCUMBRANCE & AGILITY BONUSES
	// ========================================================================
	const hasArmour = defender.equipment.hasArmour;
	const hasHelmet = defender.equipment.hasHelmet;
	const hasShield = defender.equipment.hasShield;
	const hasWeapon = defender.equipment.hasWeapon;

	let evadeBonus = 0;
	if (!hasArmour) evadeBonus += encumbranceBonuses.noArmourEvade;
	if (!hasShield) evadeBonus += encumbranceBonuses.noShieldEvade;
	if (!hasHelmet) evadeBonus += encumbranceBonuses.noHelmetEvade;

	let parryBonus = 0;
	if (!hasShield && hasWeapon) parryBonus += encumbranceBonuses.noShieldParry;

	// ========================================================================
	// 2. DYNAMIC PROBABILITY POOL (MITIGATION)
	// ========================================================================
	const baseEvade = Math.max(
		probabilityModifiers.baseEvadeChance,
		Math.floor(defender.stats.agi / probabilityModifiers.evadeDefenderAgiDivisor) +
			defCI -
			Math.floor(attacker.stats.agi / probabilityModifiers.evadeAttackerAgiDivisor),
	);
	let chanceEvade = baseEvade + evadeBonus;

	let chanceBlock = hasShield
		? Math.max(0, probabilityModifiers.baseBlockChance + Math.floor(defender.stats.str / probabilityModifiers.blockDefenderStrDivisor) + defCI)
		: 0;

	const baseParry = hasWeapon
		? Math.max(0, probabilityModifiers.baseParryChance + Math.floor(defender.stats.agi / probabilityModifiers.parryDefenderAgiDivisor) + defCI)
		: 0;
	let chanceParry = hasWeapon ? baseParry + parryBonus : 0;

	// Apply defender stance modifiers
	let mitigationStanceMultiplier = 1.0;
	if (overrides.defenderStance === 'DEFENSIVE') {
		mitigationStanceMultiplier = combatConfig.stanceModifiers.defensiveMitigationMultiplier;
	} else if (overrides.defenderStance === 'AGGRESSIVE') {
		mitigationStanceMultiplier = combatConfig.stanceModifiers.aggressiveMitigationMultiplier;
	}

	chanceEvade = Math.floor(chanceEvade * mitigationStanceMultiplier);
	chanceBlock = Math.floor(chanceBlock * mitigationStanceMultiplier);
	chanceParry = Math.floor(chanceParry * mitigationStanceMultiplier);

	let totalMitigation = chanceEvade + chanceBlock + chanceParry;
	if (totalMitigation > 100) {
		const scale = 100 / totalMitigation;
		chanceEvade = Math.floor(chanceEvade * scale);
		chanceBlock = Math.floor(chanceBlock * scale);
		chanceParry = Math.floor(chanceParry * scale);
		totalMitigation = chanceEvade + chanceBlock + chanceParry;
	}

	// ========================================================================
	// 3. VULNERABILITY CONVERSION & RAW CRITICAL THREAT
	// ========================================================================
	const chanceVulnerable = 100 - totalMitigation;

	let rawCritThreat =
		probabilityModifiers.baseCritChance +
		Math.floor(attacker.stats.int / probabilityModifiers.critAttackerIntDivisor) +
		Math.floor(attacker.stats.str / probabilityModifiers.critAttackerStrDivisor) -
		(hasHelmet ? probabilityModifiers.helmetCritReduction : 0);
	rawCritThreat = Math.max(0, rawCritThreat);

	let critConversionRate = vulnerabilityRates.unprotected;
	if (hasArmour && hasHelmet) {
		critConversionRate = vulnerabilityRates.fullProtection;
	} else if (hasHelmet && !hasArmour) {
		critConversionRate = vulnerabilityRates.helmetOnly;
	} else if (hasArmour && !hasHelmet) {
		critConversionRate = vulnerabilityRates.armourOnly;
	}

	const attackerPrecisionBonus = Math.floor(attacker.stats.int / probabilityModifiers.precisionAttackerIntDivisor) / 100;
	critConversionRate = Math.min(1.0, critConversionRate + attackerPrecisionBonus);

	// Apply attacker stance modifiers
	let offensiveStanceMultiplier = 1.0;
	if (overrides.attackerStance === 'AGGRESSIVE') {
		offensiveStanceMultiplier = combatConfig.stanceModifiers.aggressiveCritMultiplier;
	} else if (overrides.attackerStance === 'DEFENSIVE') {
		offensiveStanceMultiplier = combatConfig.stanceModifiers.defensiveCritMultiplier;
	}

	rawCritThreat = Math.floor(rawCritThreat * offensiveStanceMultiplier);
	critConversionRate = Math.min(1.0, critConversionRate * offensiveStanceMultiplier);

	let chanceCrit = rawCritThreat + Math.floor(chanceVulnerable * critConversionRate);
	chanceCrit = Math.min(chanceCrit, chanceVulnerable);
	const chanceClean = chanceVulnerable - chanceCrit;

	// ========================================================================
	// 4. HIT RESOLUTION ROLL
	// ========================================================================
	let hitType = '';
	let roll = 0;

	if (forceCritical) {
		// If the opponent failed to flee, the strike is a guaranteed critical.
		hitType = 'critical';
		roll = 100;
	} else {
		roll = Math.floor(Math.random() * 100) + 1;
		if (roll <= chanceEvade) hitType = 'evaded';
		else if (roll <= chanceEvade + chanceBlock) hitType = 'blocked';
		else if (roll <= chanceEvade + chanceBlock + chanceParry) hitType = 'parried';
		else if (roll <= chanceEvade + chanceBlock + chanceParry + chanceCrit) hitType = 'critical';
		else hitType = 'clean';
	}

	// ========================================================================
	// 5. DAMAGE CALCULATION
	// ========================================================================
	const hitMultiplier = multipliers.hitType[hitType];
	let finalDamage = 0;

	if (hitMultiplier > 0) {
		const clyfPercent = coreStats.damageScalingFactorClyf / 100;
		const rawD = (attacker.stats.ad * clyfPercent) / 2;
		const nDmgF = 1 - Math.min(defender.stats.dr, coreStats.maxDefenseDamageReduction) / 100;
		finalDamage = Math.floor(Math.max(rawD * nDmgF, coreStats.minFinalDamage) * hitMultiplier);
	}

	// ========================================================================
	// 6. DEGRADATION EXTRACTION
	// ========================================================================
	const degradationRules = itemDegradation[hitType];

	return {
		hitType: hitType,
		damageDealt: finalDamage,
		probabilities: { evade: chanceEvade, block: chanceBlock, parry: chanceParry, critical: chanceCrit, clean: chanceClean },
		rollValue: roll,
		degradation: {
			attackerWeapon: attacker.equipment.hasWeapon ? degradationRules.attackerWeapon : 0,
			defenderArmour: hasArmour ? degradationRules.defenderArmour : 0,
			defenderShield: hasShield ? degradationRules.defenderShield : 0,
			defenderWeapon: hasWeapon ? degradationRules.defenderWeapon : 0,
			defenderHelmet: hasHelmet ? degradationRules.defenderHelmet : 0,
		},
	};
};

export const resolveSimultaneousTurn = (fighterA, fighterB, overridesA = {}, overridesB = {}) => {
	const combatConfig = WORLD.COMBAT;

	const strikeFromA = executeStrike(fighterA, fighterB, combatConfig, overridesA);
	const strikeFromB = executeStrike(fighterB, fighterA, combatConfig, overridesB);

	return { action_FighterA_Attacks_B: strikeFromA, action_FighterB_Attacks_A: strikeFromB };
};
