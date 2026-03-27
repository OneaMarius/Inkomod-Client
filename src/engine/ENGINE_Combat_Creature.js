// File: src/engine/ENGINE_Combat_Creature.js
// Description: Simultaneous MARS Combat resolution engine for Humanoid vs. Creature engagements with state overrides.

import { WORLD } from '../data/GameWorld.js';

/**
 * Calculates the Combat Intelligence (CI) modifier.
 */
const calculateCI = (intStat) => Math.floor(intStat / 5) - 5;

/**
 * Resolves a strike from a Humanoid (Player) to a Creature (Monster/Animal).
 */
const executeHumanoidStrikeOnCreature = (humanoid, creature, combatConfig, overrides = {}) => {
	const { skipAttack = false, forceCritical = false } = overrides;

	if (skipAttack) {
		return {
			hitType: 'none',
			damageDealt: 0,
			probabilities: null,
			rollValue: 0,
			degradation: { attackerWeapon: 0, defenderArmour: 0, defenderShield: 0, defenderWeapon: 0, defenderHelmet: 0 },
		};
	}

	const { multipliers, itemDegradation, coreStats, probabilityModifiers } = combatConfig;
	const pMod = probabilityModifiers;

	const defCI = calculateCI(creature.stats.innateInt);

	// ========================================================================
	// 1. DYNAMIC PROBABILITY POOL (CREATURE MITIGATION)
	// ========================================================================
	// Creature uses innateAgi for Evade and innateDdr to simulate glancing/blocked blows. No Parry.
	const baseEvade = Math.max(
		pMod.baseEvadeChance,
		Math.floor(creature.stats.innateAgi / pMod.evadeDefenderAgiDivisor) + defCI - Math.floor(humanoid.stats.agi / pMod.evadeAttackerAgiDivisor),
	);
	let chanceEvade = baseEvade;

	let chanceBlock = Math.max(0, Math.floor(creature.stats.innateDdr / pMod.blockDefenderDdrDivisor));

	let chanceParry = 0; // Creatures cannot explicitly parry weapons

	// Apply defender stance modifiers (Creature)
	let mitigationStanceMultiplier = 1.0;
	if (overrides.defenderStance === 'DEFENSIVE') {
		mitigationStanceMultiplier = combatConfig.stanceModifiers.defensiveMitigationMultiplier;
	} else if (overrides.defenderStance === 'AGGRESSIVE') {
		mitigationStanceMultiplier = combatConfig.stanceModifiers.aggressiveMitigationMultiplier;
	}

	chanceEvade = Math.floor(chanceEvade * mitigationStanceMultiplier);
	chanceBlock = Math.floor(chanceBlock * mitigationStanceMultiplier);

	// Normalize mitigation
	let totalMitigation = chanceEvade + chanceBlock + chanceParry;
	if (totalMitigation > 100) {
		const scale = 100 / totalMitigation;
		chanceEvade = Math.floor(chanceEvade * scale);
		chanceBlock = Math.floor(chanceBlock * scale);
		totalMitigation = chanceEvade + chanceBlock;
	}

	// ========================================================================
	// 2. VULNERABILITY CONVERSION & RAW CRITICAL THREAT
	// ========================================================================
	const chanceVulnerable = 100 - totalMitigation;

	// Calculate Humanoid Attacker's raw ability to force a critical hit
	let rawCritThreat =
		pMod.baseCritChance + Math.floor(humanoid.stats.int / pMod.critAttackerIntDivisor) + Math.floor(humanoid.stats.str / pMod.critAttackerStrDivisor);
	// Creatures don't wear helmets, so no helmetCritReduction
	rawCritThreat = Math.max(0, rawCritThreat);

	// Creature critical resistance scales smoothly with natural armor (innateDdr)
	// 0 DDR = 100% conversion, 90 DDR = 10% conversion
	let critConversionRate = Math.max(0.1, 1.0 - creature.stats.innateDdr / 100);

	// Attacker's INT boosts precision
	const attackerPrecisionBonus = Math.floor(humanoid.stats.int / pMod.precisionAttackerIntDivisor) / 100;
	critConversionRate = Math.min(1.0, critConversionRate + attackerPrecisionBonus);

	// Apply attacker stance modifiers (Humanoid)
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
	// 3. HIT RESOLUTION ROLL
	// ========================================================================
	let hitType = '';
	let roll = 0;

	if (forceCritical) {
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
	// 4. DAMAGE CALCULATION
	// ========================================================================
	const hitMultiplier = multipliers.hitType[hitType];
	let finalDamage = 0;

	if (hitMultiplier > 0) {
		const clyfPercent = coreStats.damageScalingFactorClyf / 100;
		const rawD = (humanoid.stats.ad * clyfPercent) / 2;
		const nDmgF = 1 - Math.min(creature.stats.innateDdr, coreStats.maxDefenseDamageReduction) / 100;
		finalDamage = Math.floor(Math.max(rawD * nDmgF, coreStats.minFinalDamage) * hitMultiplier);
	}

	// ========================================================================
	// 5. DEGRADATION EXTRACTION (Only Humanoid Weapon degrades)
	// ========================================================================
	const degradationRules = itemDegradation[hitType];

	return {
		hitType: hitType,
		damageDealt: finalDamage,
		probabilities: { evade: chanceEvade, block: chanceBlock, parry: chanceParry, critical: chanceCrit, clean: chanceClean },
		rollValue: roll,
		degradation: {
			attackerWeapon: humanoid.equipment.hasWeapon ? degradationRules.attackerWeapon : 0,
			defenderArmour: 0,
			defenderShield: 0,
			defenderWeapon: 0,
			defenderHelmet: 0,
		},
	};
};

/**
 * Resolves a strike from a Creature (Monster/Animal) to a Humanoid (Player).
 */
const executeCreatureStrikeOnHumanoid = (creature, humanoid, combatConfig, overrides = {}) => {
	const { skipAttack = false, forceCritical = false } = overrides;

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
	const pMod = probabilityModifiers;

	const defCI = calculateCI(humanoid.stats.int);

	// ========================================================================
	// 1. ENCUMBRANCE & AGILITY BONUSES
	// ========================================================================
	const hasArmour = humanoid.equipment.hasArmour;
	const hasHelmet = humanoid.equipment.hasHelmet;
	const hasShield = humanoid.equipment.hasShield;
	const hasWeapon = humanoid.equipment.hasWeapon;

	let evadeBonus = 0;
	if (!hasArmour) evadeBonus += encumbranceBonuses.noArmourEvade;
	if (!hasShield) evadeBonus += encumbranceBonuses.noShieldEvade;
	if (!hasHelmet) evadeBonus += encumbranceBonuses.noHelmetEvade;

	let parryBonus = 0;
	if (!hasShield && hasWeapon) parryBonus += encumbranceBonuses.noShieldParry;

	// ========================================================================
	// 2. DYNAMIC PROBABILITY POOL (HUMANOID MITIGATION)
	// ========================================================================
	const baseEvade = Math.max(
		pMod.baseEvadeChance,
		Math.floor(humanoid.stats.agi / pMod.evadeDefenderAgiDivisor) + defCI - Math.floor(creature.stats.innateAgi / pMod.evadeAttackerAgiDivisor),
	);
	let chanceEvade = baseEvade + evadeBonus;

	let chanceBlock = hasShield ? Math.max(0, pMod.baseBlockChance + Math.floor(humanoid.stats.str / pMod.blockDefenderStrDivisor) + defCI) : 0;

	const baseParry = hasWeapon ? Math.max(0, pMod.baseParryChance + Math.floor(humanoid.stats.agi / pMod.parryDefenderAgiDivisor) + defCI) : 0;
	let chanceParry = hasWeapon ? baseParry + parryBonus : 0;

	// Apply defender stance modifiers (Humanoid)
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

	// Calculate Creature Attacker's raw ability to force a critical hit
	let rawCritThreat =
		pMod.baseCritChance +
		Math.floor(creature.stats.innateInt / pMod.critAttackerIntDivisor) +
		Math.floor(creature.stats.innateStr / pMod.critAttackerStrDivisor) -
		(hasHelmet ? pMod.helmetCritReduction : 0);
	rawCritThreat = Math.max(0, rawCritThreat);

	let critConversionRate = vulnerabilityRates.unprotected;

	if (hasArmour && hasHelmet) {
		critConversionRate = vulnerabilityRates.fullProtection;
	} else if (hasHelmet && !hasArmour) {
		critConversionRate = vulnerabilityRates.helmetOnly;
	} else if (hasArmour && !hasHelmet) {
		critConversionRate = vulnerabilityRates.armourOnly;
	}

	const attackerPrecisionBonus = Math.floor(creature.stats.innateInt / pMod.precisionAttackerIntDivisor) / 100;
	critConversionRate = Math.min(1.0, critConversionRate + attackerPrecisionBonus);

	// Apply attacker stance modifiers (Creature)
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
		const rawD = (creature.stats.innateAdp * clyfPercent) / 2;
		const nDmgF = 1 - Math.min(humanoid.stats.dr, coreStats.maxDefenseDamageReduction) / 100;
		finalDamage = Math.floor(Math.max(rawD * nDmgF, coreStats.minFinalDamage) * hitMultiplier);
	}

	// ========================================================================
	// 6. DEGRADATION EXTRACTION (Only Humanoid Defensive Gear degrades)
	// ========================================================================
	const degradationRules = itemDegradation[hitType];

	return {
		hitType: hitType,
		damageDealt: finalDamage,
		probabilities: { evade: chanceEvade, block: chanceBlock, parry: chanceParry, critical: chanceCrit, clean: chanceClean },
		rollValue: roll,
		degradation: {
			attackerWeapon: 0,
			defenderArmour: hasArmour ? degradationRules.defenderArmour : 0,
			defenderShield: hasShield ? degradationRules.defenderShield : 0,
			defenderWeapon: hasWeapon ? degradationRules.defenderWeapon : 0,
			defenderHelmet: hasHelmet ? degradationRules.defenderHelmet : 0,
		},
	};
};

/**
 * Resolves a simultaneous combat turn between a Humanoid and a Creature.
 */
export const resolveCreatureEncounterTurn = (humanoid, creature, overridesHumanoid = {}, overridesCreature = {}) => {
	const combatConfig = WORLD.COMBAT;

	const humanoidStrike = executeHumanoidStrikeOnCreature(humanoid, creature, combatConfig, overridesHumanoid);
	const creatureStrike = executeCreatureStrikeOnHumanoid(creature, humanoid, combatConfig, overridesCreature);

	return { action_Humanoid_Attacks_Creature: humanoidStrike, action_Creature_Attacks_Humanoid: creatureStrike };
};
