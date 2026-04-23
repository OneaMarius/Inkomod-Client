// File: src/engine/ENGINE_Combat_Math.js
// Description: Pure mathematical helpers for combat resolution and UI probability previews.

export const calculateCombatCI = (intStat) => Math.floor(intStat / 5) - 5;

/**
 * Calculates hit probabilities (0-100) based on stats, stances, and entity types.
 * Can be used by the Combat Engines or directly by the UI for previewing chances.
 */
export const calculateHitProbabilities = (attacker, defender, combatConfig, attackerStance, defenderStance, isDefenderCreature = false) => {
	const pMod = combatConfig.probabilityModifiers;
	const defCI = calculateCombatCI(defender.stats.int);

	let chanceEvade = 0,
		chanceBlock = 0,
		chanceParry = 0;
	const hasArmor = defender.equipment?.hasArmor || false;
	const hasHelmet = defender.equipment?.hasHelmet || false;
	const hasShield = defender.equipment?.hasShield || false;
	const hasWeapon = defender.equipment?.hasWeapon || false;

	// 1. MITIGATION CALCULATION
	if (isDefenderCreature) {
		chanceEvade = Math.max(
			pMod.baseEvadeChance,
			Math.floor(defender.stats.agi / pMod.evadeDefenderAgiDivisor) + defCI - Math.floor(attacker.stats.agi / pMod.evadeAttackerAgiDivisor),
		);
		chanceBlock = Math.max(0, Math.floor(defender.stats.dr / pMod.blockDefenderDdrDivisor));
		chanceParry = 0; // Creatures do not parry
	} else {
		let evadeBonus =
			(!hasArmor ? combatConfig.encumbranceBonuses.noArmorEvade : 0) +
			(!hasShield ? combatConfig.encumbranceBonuses.noShieldEvade : 0) +
			(!hasHelmet ? combatConfig.encumbranceBonuses.noHelmetEvade : 0);
		let parryBonus = !hasShield && hasWeapon ? combatConfig.encumbranceBonuses.noShieldParry : 0;

		chanceEvade =
			Math.max(
				pMod.baseEvadeChance,
				Math.floor(defender.stats.agi / pMod.evadeDefenderAgiDivisor) + defCI - Math.floor(attacker.stats.agi / pMod.evadeAttackerAgiDivisor),
			) + evadeBonus;
		chanceBlock = hasShield ? Math.max(0, pMod.baseBlockChance + Math.floor(defender.stats.str / pMod.blockDefenderStrDivisor) + defCI) : 0;
		chanceParry = hasWeapon ? Math.max(0, pMod.baseParryChance + Math.floor(defender.stats.agi / pMod.parryDefenderAgiDivisor) + defCI) + parryBonus : 0;
	}

	// Apply Defensive Stance (pentru apărător)
	let mitigationMultiplier = 1.0;
	if (defenderStance === 'DEFENSIVE') mitigationMultiplier = combatConfig.stanceModifiers.defensiveMitigationMultiplier;
	else if (defenderStance === 'AGGRESSIVE') mitigationMultiplier = combatConfig.stanceModifiers.aggressiveMitigationMultiplier;

	chanceEvade = Math.floor(chanceEvade * mitigationMultiplier);
	chanceBlock = Math.floor(chanceBlock * mitigationMultiplier);
	chanceParry = Math.floor(chanceParry * mitigationMultiplier);

	let totalMitigation = chanceEvade + chanceBlock + chanceParry;

	// --- NOU: Shift direct de procente bazat pe Stance-ul Atacatorului ---
	let accuracyShift = 0;
	if (attackerStance === 'AGGRESSIVE') {
		accuracyShift = combatConfig.stanceModifiers.aggressiveAccuracyShift || 10;
	} else if (attackerStance === 'DEFENSIVE') {
		accuracyShift = combatConfig.stanceModifiers.defensiveAccuracyShift || -10;
	}

	// Scădem "accuracyShift" din apărarea inamicului.
	// Dacă ești Aggressive (+10), apărarea lui scade cu 10. Dacă ești Defensive (-10), apărarea lui crește cu 10.
	let newMitigation = totalMitigation - accuracyShift;
	newMitigation = Math.max(0, Math.min(100, newMitigation)); // Menținem logic între 0 și 100

	// Rescalăm dinamic Evade, Block și Parry ca să ocupe noua dimensiune a feliei de apărare
	if (totalMitigation > 0 && newMitigation !== totalMitigation) {
		const scale = newMitigation / totalMitigation;
		chanceEvade = Math.round(chanceEvade * scale);
		chanceBlock = Math.round(chanceBlock * scale);
		chanceParry = Math.round(chanceParry * scale);
		totalMitigation = chanceEvade + chanceBlock + chanceParry;
	} else if (totalMitigation === 0 && newMitigation > 0) {
		// Dacă inamicul nu avea apărare deloc, dar tu ataci Defensive și îi dai 10% șansă să scape
		chanceEvade = newMitigation;
		totalMitigation = newMitigation;
	} else if (newMitigation === 0) {
		chanceEvade = 0;
		chanceBlock = 0;
		chanceParry = 0;
		totalMitigation = 0;
	}

	// Fallback original pentru siguranță
	if (totalMitigation > 100) {
		const scale = 100 / totalMitigation;
		chanceEvade = Math.floor(chanceEvade * scale);
		chanceBlock = Math.floor(chanceBlock * scale);
		chanceParry = Math.floor(chanceParry * scale);
		totalMitigation = chanceEvade + chanceBlock + parry;
	}

	// 2. CRITICAL THREAT CALCULATION
	const chanceVulnerable = 100 - totalMitigation;

	let rawCritThreat =
		pMod.baseCritChance + Math.floor(attacker.stats.int / pMod.critAttackerIntDivisor) + Math.floor(attacker.stats.str / pMod.critAttackerStrDivisor);
	if (!isDefenderCreature && hasHelmet) rawCritThreat -= pMod.helmetCritReduction;
	rawCritThreat = Math.max(0, rawCritThreat);

	let critConversionRate = 0;
	if (isDefenderCreature) {
		critConversionRate = Math.max(0.1, 1.0 - defender.stats.dr / 100);
	} else {
		critConversionRate = combatConfig.vulnerabilityRates.unprotected;
		if (hasArmor && hasHelmet) critConversionRate = combatConfig.vulnerabilityRates.fullProtection;
		else if (hasHelmet && !hasArmor) critConversionRate = combatConfig.vulnerabilityRates.helmetOnly;
		else if (hasArmor && !hasHelmet) critConversionRate = combatConfig.vulnerabilityRates.armorOnly;
	}

	const attackerPrecisionBonus = Math.floor(attacker.stats.int / pMod.precisionAttackerIntDivisor) / 100;
	critConversionRate = Math.min(1.0, critConversionRate + attackerPrecisionBonus);

	// Apply Offensive Stance
	let offensiveMultiplier = 1.0;
	if (attackerStance === 'AGGRESSIVE') offensiveMultiplier = combatConfig.stanceModifiers.aggressiveCritMultiplier;
	else if (attackerStance === 'DEFENSIVE') offensiveMultiplier = combatConfig.stanceModifiers.defensiveCritMultiplier;

	rawCritThreat = Math.floor(rawCritThreat * offensiveMultiplier);
	critConversionRate = Math.min(1.0, critConversionRate * offensiveMultiplier);

	let chanceCrit = rawCritThreat + Math.floor(chanceVulnerable * critConversionRate);
	chanceCrit = Math.min(chanceCrit, chanceVulnerable);

	const chanceClean = chanceVulnerable - chanceCrit;

	return { evade: chanceEvade, block: chanceBlock, parry: chanceParry, critical: chanceCrit, clean: chanceClean };
};

/**
 * Evaluates the final hit type based on probabilities and RNG.
 */
export const rollHitResult = (probabilities, forceCritical = false) => {
	if (forceCritical) return { hitType: 'critical', rollValue: 100 };

	const roll = Math.floor(Math.random() * 100) + 1;
	const { evade, block, parry, critical } = probabilities;

	let hitType = 'clean';
	if (roll <= evade) hitType = 'evaded';
	else if (roll <= evade + block) hitType = 'blocked';
	else if (roll <= evade + block + parry) hitType = 'parried';
	else if (roll <= evade + block + parry + critical) hitType = 'critical';

	return { hitType, rollValue: roll };
};

/**
 * Calculates the final damage applied to HP based on hit type and defense.
 */
export const calculateDamageDealt = (attackerAd, defenderDr, hitType, combatConfig) => {
	const hitMultiplier = combatConfig.multipliers.hitType[hitType];
	if (hitMultiplier <= 0) return 0;

	const clyfPercent = combatConfig.coreStats.damageScalingFactorClyf / 100;
	const rawD = (attackerAd * clyfPercent) / 2;
	const nDmgF = 1 - Math.min(defenderDr, combatConfig.coreStats.maxDefenseDamageReduction) / 100;

	return Math.floor(Math.max(rawD * nDmgF, combatConfig.coreStats.minFinalDamage) * hitMultiplier);
};
