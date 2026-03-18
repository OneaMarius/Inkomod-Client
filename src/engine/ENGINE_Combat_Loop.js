// File: src/engine/ENGINE_Combat_Loop.js
// Description: State Manager and Loop Execution Engine for MARS Combat with Persistent Wounds.

import { WORLD } from '../data/GameWorld.js';
import { DB_COMBAT } from '../data/DB_Combat.js';
import { resolveSimultaneousTurn } from './ENGINE_Combat_Humanoid.js';
import { resolveCreatureEncounterTurn } from './ENGINE_Combat_Creature.js';

/**
 * Calculates the success of a flee attempt.
 * @param {Object} fleeingEntity
 * @param {Object} chasingEntity
 * @returns {Boolean} True if escape is successful.
 */
export const calculateFleeSuccess = (fleeingEntity, chasingEntity) => {
	const fleeRoll = Math.random() * 100;
	return fleeRoll <= WORLD.COMBAT.actionModifiers.baseFleeChance;
};

/**
 * Evaluates item durability and updates the equipment state boolean.
 */
const applyDegradationAndValidate = (
	entity,
	degradationPayload,
	isAttacker,
) => {
	const equip = entity.equipment;

	const processSlot = (slotKey, degradationAmount, booleanKey) => {
		if (equip[booleanKey] && equip[slotKey]) {
			equip[slotKey].currentDurability -= degradationAmount;
			if (equip[slotKey].currentDurability < 1) {
				equip[slotKey].currentDurability = 0;
				equip[booleanKey] = false;
			}
		}
	};

	if (isAttacker) {
		processSlot('weaponItem', degradationPayload.attackerWeapon, 'hasWeapon');
	} else {
		processSlot('armourItem', degradationPayload.defenderArmour, 'hasArmour');
		processSlot('shieldItem', degradationPayload.defenderShield, 'hasShield');
		processSlot('weaponItem', degradationPayload.defenderWeapon, 'hasWeapon');
		processSlot('helmetItem', degradationPayload.defenderHelmet, 'hasHelmet');
	}
};

/**
 * Calculates and applies permanent max HP reduction based on cumulative damage taken.
 * Executes only when combat finishes.
 */
const applyPersistentWounds = (player) => {
	const totalDmg = player.biology.accumulatedCombatDamage || 0;

	if (totalDmg > 0) {
		const woundPct = WORLD.COMBAT.actionModifiers.woundDamagePct;
		const maxHpLoss = Math.round(totalDmg * woundPct);
		const minCap = WORLD.PLAYER.hpLimits.minCap;

		let newMaxHp = player.biology.hpMax - maxHpLoss;

		if (newMaxHp < minCap) {
			newMaxHp = minCap;
		}

		player.biology.hpMax = newMaxHp;

		if (player.biology.hpCurrent > newMaxHp) {
			player.biology.hpCurrent = newMaxHp;
		}
	}

	// Clean up transient state variable
	delete player.biology.accumulatedCombatDamage;
	return player;
};

/**
 * Evaluates combat termination thresholds based on current HP and DB_Combat rules.
 */
const evaluateCombatEnd = (player, npc, combatType) => {
	const { thresholds } = WORLD.COMBAT;
	const pHP = player.biology.hpCurrent;
	const nHP = npc.biology.hpCurrent;
	const hpDiff = Math.abs(pHP - nHP);

	if (pHP <= 0) return 'LOSE_DEATH';
	if (nHP <= 0) return 'WIN_DEATH';

	if (combatType === 'FF') {
		if (
			nHP <= thresholds.friendlySurrenderHp ||
			(pHP > nHP && hpDiff >= thresholds.friendlySurrenderHpDiff)
		) {
			return 'WIN_SURRENDER';
		}
		if (
			pHP <= thresholds.friendlySurrenderHp ||
			(nHP > pHP && hpDiff >= thresholds.friendlySurrenderHpDiff)
		) {
			return 'LOSE_SURRENDER';
		}
	}

	if (combatType === 'NF') {
		if (
			nHP <= thresholds.normalSurrenderHp ||
			(pHP > nHP && hpDiff >= thresholds.normalSurrenderHpDiff)
		) {
			return 'WIN_SURRENDER';
		}
		if (
			pHP <= thresholds.normalSurrenderHp ||
			(nHP > pHP && hpDiff >= thresholds.normalSurrenderHpDiff)
		) {
			return 'LOSE_SURRENDER';
		}
	}

	return 'CONTINUE';
};

/**
 * Main execution loop for a single combat turn.
 */
export const processCombatTurn = (
	playerEntity,
	npcEntity,
	combatType,
	playerAction,
) => {
	let combatStatus = 'CONTINUE';
	const playerOverrides = { skipAttack: false, forceCritical: false };
	const npcOverrides = { skipAttack: false, forceCritical: false };

	// Initialize tracking variable if it doesn't exist
	if (playerEntity.biology.accumulatedCombatDamage === undefined) {
		playerEntity.biology.accumulatedCombatDamage = 0;
	}

	// ========================================================================
	// 1. NPC DECISION LOGIC
	// ========================================================================
	let npcAction = 'FIGHT';
	const npcHpPercent = npcEntity.biology.hpCurrent / npcEntity.biology.hpMax;

	if (npcHpPercent <= npcEntity.behavior.fleeHpPercentThreshold) {
		npcAction = 'FLEE';
	}

	// ========================================================================
	// 2. RESOLVE NON-OFFENSIVE ACTIONS & OVERRIDES
	// ========================================================================
	if (playerAction === 'HEAL') {
		if (combatType === 'DMF' && playerEntity.inventory.healingPotions > 0) {
			playerOverrides.skipAttack = true;
			playerEntity.inventory.healingPotions -= 1;

			playerEntity.biology.hpCurrent = Math.min(
				playerEntity.biology.hpMax,
				playerEntity.biology.hpCurrent +
					WORLD.COMBAT.actionModifiers.healHpAmount,
			);
		} else {
			playerAction = 'FIGHT_FALLBACK';
		}
	}

	if (playerAction === 'FLEE') {
		playerOverrides.skipAttack = true;
		const success = calculateFleeSuccess(playerEntity, npcEntity);
		if (success) {
			return {
				combatStatus: 'LOSE_FLEE',
				playerEntity: applyPersistentWounds(playerEntity),
				npcEntity,
				log: null,
			};
		} else {
			npcOverrides.forceCritical = true;
		}
	}

	if (npcAction === 'FLEE') {
		npcOverrides.skipAttack = true;
		const success = calculateFleeSuccess(npcEntity, playerEntity);
		if (success) {
			return {
				combatStatus: 'WIN_FLEE',
				playerEntity: applyPersistentWounds(playerEntity),
				npcEntity,
				log: null,
			};
		} else {
			playerOverrides.forceCritical = true;
		}
	}

	if (playerAction === 'FLEE' && npcAction === 'FLEE') {
		return {
			combatStatus: 'DRAW_FLEE',
			playerEntity: applyPersistentWounds(playerEntity),
			npcEntity,
			log: null,
		};
	}

	// ========================================================================
	// 3. EXECUTE COMBAT MATHEMATICS
	// ========================================================================
	const npcCategory = npcEntity.classification.entityCategory;
	let turnResults;

	if (npcCategory === 'Animal' || npcCategory === 'Monster') {
		turnResults = resolveCreatureEncounterTurn(
			playerEntity,
			npcEntity,
			playerOverrides,
			npcOverrides,
		);
	} else {
		turnResults = resolveSimultaneousTurn(
			playerEntity,
			npcEntity,
			playerOverrides,
			npcOverrides,
		);
	}

	const playerStrikePayload =
		turnResults.action_FighterA_Attacks_B ||
		turnResults.action_Humanoid_Attacks_Creature;
	const npcStrikePayload =
		turnResults.action_FighterB_Attacks_A ||
		turnResults.action_Creature_Attacks_Humanoid;

	// ========================================================================
	// 4. APPLY BIOLOGICAL DAMAGE & TRACKING
	// ========================================================================
	npcEntity.biology.hpCurrent -= playerStrikePayload.damageDealt;
	playerEntity.biology.hpCurrent -= npcStrikePayload.damageDealt;

	// Track total physical damage received before healing mitigation
	playerEntity.biology.accumulatedCombatDamage += npcStrikePayload.damageDealt;

	if (npcEntity.biology.hpCurrent < 0) npcEntity.biology.hpCurrent = 0;
	if (playerEntity.biology.hpCurrent < 0) playerEntity.biology.hpCurrent = 0;

	// ========================================================================
	// 5. APPLY DEGRADATION & VALIDATE EQUIPMENT DESTRUCTION
	// ========================================================================
	applyDegradationAndValidate(
		playerEntity,
		playerStrikePayload.degradation,
		true,
	);
	applyDegradationAndValidate(
		playerEntity,
		npcStrikePayload.degradation,
		false,
	);

	applyDegradationAndValidate(npcEntity, npcStrikePayload.degradation, true);
	applyDegradationAndValidate(
		npcEntity,
		playerStrikePayload.degradation,
		false,
	);

	// ========================================================================
	// 6. EVALUATE COMBAT OUTCOME
	// ========================================================================
	combatStatus = evaluateCombatEnd(playerEntity, npcEntity, combatType);

	if (combatStatus !== 'CONTINUE') {
		const permitted =
			DB_COMBAT.permittedOutcomes[npcCategory]?.[combatType] || [];
		if (!permitted.includes(combatStatus)) {
			if (combatStatus.includes('SURRENDER')) {
				combatStatus = combatStatus.replace('SURRENDER', 'DEATH');
			}
		}

		// Finalize Wounds upon any combat termination state
		applyPersistentWounds(playerEntity);
	}

	// ========================================================================
	// 7. RETURN STATE PAYLOAD
	// ========================================================================
	return {
		combatStatus: combatStatus,
		playerEntity: playerEntity,
		npcEntity: npcEntity,
		log: {
			playerAction: playerAction,
			npcAction: npcAction,
			playerStrikePayload: playerStrikePayload,
			npcStrikePayload: npcStrikePayload,
		},
	};
};

/*
 * ========================================================================
 * INTEGRATION NOTES FOR THE GLOBAL STATE MANAGER
 * ========================================================================
 * 1. TURN EXECUTION: Stateless between rounds. Must be called per input.
 * 2. STATE PERSISTENCE: Overwrite global player/NPC objects with the returned data.
 * 3. EQUIPMENT DESTRUCTION: Listen for `hasWeapon`/etc. flags turning false.
 * 4. COMBAT TERMINATION: If `combatStatus` !== 'CONTINUE', trigger UI resolution.
 * 5. PERSISTENT WOUNDS: `playerEntity.biology.hpMax` will be dynamically reduced
 * on combat termination if sufficient damage was accrued. UI must reflect
 * the new cap visually.
 * ========================================================================
 */
