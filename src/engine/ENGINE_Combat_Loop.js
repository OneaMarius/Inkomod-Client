// File: src/engine/ENGINE_Combat_Loop.js
// Description: State Manager and Loop Execution Engine for MARS Combat with Persistent Wounds.

import { WORLD } from '../data/GameWorld.js';
import { DB_COMBAT } from '../data/DB_Combat.js';
import { resolveSimultaneousTurn } from './ENGINE_Combat_Humanoid.js';
import { resolveCreatureEncounterTurn } from './ENGINE_Combat_Creature.js';

/**
 * Calculates the success of a flee attempt (Used primarily by NPCs).
 * @param {Object} fleeingEntity
 * @param {Object} chasingEntity
 * @returns {Boolean} True if escape is successful.
 */
export const calculateFleeSuccess = (fleeingEntity, chasingEntity) => {
	const fleeRoll = Math.random() * 100;
	return fleeRoll <= WORLD.COMBAT.actionModifiers.baseFleeChance;
};

/**
 * Evaluates item durability and safely updates the equipment state boolean.
 * Handles both Player (direct object) and NPC (ID pointer to inventory) structures.
 */
const applyDegradationAndValidate = (entity, degradationPayload, isAttacker) => {
	if (!entity || !entity.equipment || !degradationPayload) return;
	const equip = entity.equipment;

	// Helper to find the physical item based on the entity's architecture
	const getEquippedItem = (slotPrefix) => {
		// Player structure: equip.weaponItem
		if (equip[`${slotPrefix}Item`]) return equip[`${slotPrefix}Item`];

		// NPC structure: equip.weaponId pointing to inventory.itemSlots
		const itemId = equip[`${slotPrefix}Id`];
		if (itemId && entity.inventory && entity.inventory.itemSlots) {
			return entity.inventory.itemSlots.find((i) => i.entityId === itemId);
		}
		return null;
	};

	const processSlot = (slotPrefix, degradationAmount, booleanKey) => {
		if (equip[booleanKey]) {
			const item = getEquippedItem(slotPrefix);

			if (item) {
				// Navigate safely to the nested state object
				if (item.state && typeof item.state.currentDurability === 'number') {
					item.state.currentDurability -= degradationAmount || 0;
					if (item.state.currentDurability <= 0) {
						item.state.currentDurability = 0;
						equip[booleanKey] = false; // Item breaks!
					}
				} else if (typeof item.currentDurability === 'number') {
					// Fallback for flat object structures
					item.currentDurability -= degradationAmount || 0;
					if (item.currentDurability <= 0) {
						item.currentDurability = 0;
						equip[booleanKey] = false;
					}
				}
			}
		}
	};

	// Apply specific degradation based on combat role
	if (isAttacker) {
		processSlot('weapon', degradationPayload.attackerWeapon, 'hasWeapon');
	} else {
		processSlot('armor', degradationPayload.defenderArmor, 'hasArmor');
		processSlot('shield', degradationPayload.defenderShield, 'hasShield');
		processSlot('weapon', degradationPayload.defenderWeapon, 'hasWeapon');
		processSlot('helmet', degradationPayload.defenderHelmet, 'hasHelmet');
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
		if (nHP <= thresholds.friendlySurrenderHp || (pHP > nHP && hpDiff >= thresholds.friendlySurrenderHpDiff)) {
			return 'WIN_SURRENDER';
		}
		if (pHP <= thresholds.friendlySurrenderHp || (nHP > pHP && hpDiff >= thresholds.friendlySurrenderHpDiff)) {
			return 'LOSE_SURRENDER';
		}
	}

	if (combatType === 'NF') {
		if (nHP <= thresholds.normalSurrenderHp || (pHP > nHP && hpDiff >= thresholds.normalSurrenderHpDiff)) {
			return 'WIN_SURRENDER';
		}
		if (pHP <= thresholds.normalSurrenderHp || (nHP > pHP && hpDiff >= thresholds.normalSurrenderHpDiff)) {
			return 'LOSE_SURRENDER';
		}
	}

	return 'CONTINUE';
};

/**
 * Main execution loop for a single combat turn.
 */
export const processCombatTurn = (playerEntity, npcEntity, combatType, playerAction, playerStance = 'BALANCED') => {
	let combatStatus = 'CONTINUE';

	// NPCs currently only use BALANCED, but this prepares the engine for dynamic updates
	const npcStance = 'BALANCED';

	// Inject the stances into the overrides correctly (Cross-wired)
	const playerOverrides = {
		skipAttack: false,
		forceCritical: false,
		attackerStance: playerStance,
		defenderStance: npcStance, // NPC defends with their stance
	};

	const npcOverrides = {
		skipAttack: false,
		forceCritical: false,
		attackerStance: npcStance,
		defenderStance: playerStance, // Player defends with the stance they selected
	};

	// Initialize tracking variable if it doesn't exist
	if (playerEntity.biology.accumulatedCombatDamage === undefined) {
		playerEntity.biology.accumulatedCombatDamage = 0;
	}

	// ========================================================================
	// 1. NPC DECISION LOGIC
	// ========================================================================
	let npcAction = 'FIGHT';
	const npcHpPercent = npcEntity.biology.hpCurrent / npcEntity.biology.hpMax;

	// Safely extract the threshold with a 15% fallback if the behavior object is undefined
	const fleeThreshold = npcEntity.behavior?.fleeHpPercentThreshold !== undefined ? npcEntity.behavior.fleeHpPercentThreshold : 0.15;

	if (npcHpPercent <= fleeThreshold) {
		npcAction = 'FLEE';
	}

	// ========================================================================
	// 2. RESOLVE NON-OFFENSIVE ACTIONS & OVERRIDES
	// ========================================================================

	// Immediate intercept for SURRENDER action
	if (playerAction === 'SURRENDER') {
		const emptyStrikePayload = {
			hitType: 'none',
			damageDealt: 0,
			degradation: { attackerWeapon: 0, defenderArmor: 0, defenderShield: 0, defenderHelmet: 0 },
		};

		const surrenderLogString = `[Surrender] You have laid down your arms and yielded to the enemy.`;

		return {
			combatStatus: 'LOSE_SURRENDER',
			playerEntity: applyPersistentWounds(playerEntity),
			npcEntity: npcEntity,
			log: {
				playerAction: 'SURRENDER',
				npcAction: npcAction,
				playerStrikePayload: emptyStrikePayload,
				npcStrikePayload: emptyStrikePayload,
				actionLog: surrenderLogString, // Transparent UI feedback
			},
		};
	}

	if (playerAction === 'HEAL') {
		if ((combatType === 'DMF' || combatType === 'NF') && playerEntity.inventory.healingPotions > 0) {
			playerOverrides.skipAttack = true;

			// Force the NPC's incoming attack to be blocked
			npcOverrides.forceBlock = true;

			playerEntity.inventory.healingPotions -= 1;

			const healAmount = WORLD.COMBAT.actionModifiers.healHpAmount || 25;
			const oldHp = playerEntity.biology.hpCurrent;
			playerEntity.biology.hpCurrent = Math.min(playerEntity.biology.hpMax, playerEntity.biology.hpCurrent + healAmount);
			const actualHeal = playerEntity.biology.hpCurrent - oldHp;

			// Transparent UI feedback
			playerOverrides.actionLog = `[Heal] Consumed 1 Healing Potion. Recovered +${actualHeal} HP. Taking a defensive stance to block incoming attacks.`;
		} else {
			playerAction = 'FIGHT_FALLBACK';
		}
	}

	// Transparent Flee Logic for PLAYER
	if (playerAction === 'FLEE') {
		playerOverrides.skipAttack = true;

		const baseFleeChance = WORLD.COMBAT.actionModifiers.baseFleeChance || 50;
		const playerAgi = playerEntity.stats.agi || 10;
		const npcAgi = npcEntity.stats.agi || 10;

		// Calculate dynamic threshold based on Agility delta
		const agiDelta = (playerAgi - npcAgi) * 2;

		// Calculate Desperation Bonus: +50% of the missing HP percentage
		const missingHpPct = Math.floor((1 - playerEntity.biology.hpCurrent / playerEntity.biology.hpMax) * 100);
		const desperationBonus = Math.floor(missingHpPct * 0.5);

		let targetThreshold = baseFleeChance + agiDelta + desperationBonus;

		// Hard limits: 5% minimum chance, 95% maximum chance
		targetThreshold = Math.max(5, Math.min(95, targetThreshold));

		const roll = Math.floor(Math.random() * 100) + 1;
		const isSuccess = roll <= targetThreshold;

		// Construct mathematical breakdown string for the UI
		const fleeLogString = `[Flee Check] Roll: ${roll} | Target: <= ${targetThreshold}% (Base ${baseFleeChance}% + AGI Diff ${agiDelta > 0 ? '+' + agiDelta : agiDelta}% + Desperation +${desperationBonus}%)`;

		if (isSuccess) {
			return {
				combatStatus: 'LOSE_FLEE',
				playerEntity: applyPersistentWounds(playerEntity),
				npcEntity: npcEntity,
				log: { playerAction: 'FLEE', npcAction: 'none', fleeLog: fleeLogString, isFleeSuccess: true },
			};
		} else {
			// Failure: Continue to NPC strike phase, bypassing player offensive action
			playerAction = 'FAILED_FLEE';
			playerOverrides.actionLog = `${fleeLogString} -> FAILED! You couldn't escape.`;
			// Automatic critical for NPC removed. Enemy attacks normally.
		}
	}

	// Transparent Flee Logic for NPC
	if (npcAction === 'FLEE') {
		npcOverrides.skipAttack = true;

		const baseFleeChance = WORLD.COMBAT.actionModifiers.baseFleeChance || 50;
		const playerAgi = playerEntity.stats.agi || 10;
		const npcAgi = npcEntity.stats.agi || 10;

		const agiDelta = (npcAgi - playerAgi) * 2;

		const missingHpPct = Math.floor((1 - npcEntity.biology.hpCurrent / npcEntity.biology.hpMax) * 100);
		const desperationBonus = Math.floor(missingHpPct * 0.5);

		let targetThreshold = baseFleeChance + agiDelta + desperationBonus;
		targetThreshold = Math.max(5, Math.min(95, targetThreshold));

		const roll = Math.floor(Math.random() * 100) + 1;
		const isSuccess = roll <= targetThreshold;

		const npcFleeLogString = `[Enemy Flee Check] Roll: ${roll} | Target: <= ${targetThreshold}% (Base ${baseFleeChance}% + AGI Diff ${agiDelta > 0 ? '+' + agiDelta : agiDelta}% + Desperation +${desperationBonus}%)`;

		if (isSuccess) {
			return {
				combatStatus: 'WIN_FLEE',
				playerEntity: applyPersistentWounds(playerEntity),
				npcEntity,
				log: { playerAction: 'none', npcAction: 'FLEE', fleeLog: npcFleeLogString, isFleeSuccess: true },
			};
		} else {
			npcAction = 'FAILED_FLEE';
			npcOverrides.actionLog = `${npcFleeLogString} -> FAILED! The enemy failed to escape.`;
			// Automatic critical for Player removed. Player attacks normally.
		}
	}

	// If both attempted to flee and both failed, it ends in a mutual disengagement
	if ((playerAction === 'FLEE' || playerAction === 'FAILED_FLEE') && (npcAction === 'FLEE' || npcAction === 'FAILED_FLEE')) {
		return {
			combatStatus: 'DRAW_FLEE',
			playerEntity: applyPersistentWounds(playerEntity),
			npcEntity,
			log: {
				playerAction: 'FLEE',
				npcAction: 'FLEE',
				fleeLog: '[Mutual Flee] Both combatants successfully disengaged from the fight.',
				isFleeSuccess: true,
			},
		};
	}

	// ========================================================================
	// 3. EXECUTE COMBAT MATHEMATICS
	// ========================================================================
	const npcCategory = npcEntity.classification.entityCategory;
	let turnResults;

	if (npcCategory === 'Animal' || npcCategory === 'Monster') {
		turnResults = resolveCreatureEncounterTurn(playerEntity, npcEntity, playerOverrides, npcOverrides);
	} else {
		turnResults = resolveSimultaneousTurn(playerEntity, npcEntity, playerOverrides, npcOverrides);
	}

	const playerStrikePayload = turnResults.action_FighterA_Attacks_B || turnResults.action_Humanoid_Attacks_Creature;
	const npcStrikePayload = turnResults.action_FighterB_Attacks_A || turnResults.action_Creature_Attacks_Humanoid;

	// --- NOU: INTERCEPTOR PENTRU GARANTAREA LOVITURILOR (Heal, Event-uri, etc.) ---
	if (npcOverrides.forceBlock) {
		npcStrikePayload.hitType = 'blocked';
		npcStrikePayload.damageDealt = 0;
	} else if (npcOverrides.forceMiss) {
		npcStrikePayload.hitType = 'miss';
		npcStrikePayload.damageDealt = 0;
	}

	if (playerOverrides.forceBlock) {
		playerStrikePayload.hitType = 'blocked';
		playerStrikePayload.damageDealt = 0;
	} else if (playerOverrides.forceMiss) {
		playerStrikePayload.hitType = 'miss';
		playerStrikePayload.damageDealt = 0;
	}

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
	applyDegradationAndValidate(playerEntity, playerStrikePayload.degradation, true);
	applyDegradationAndValidate(playerEntity, npcStrikePayload.degradation, false);

	applyDegradationAndValidate(npcEntity, npcStrikePayload.degradation, true);
	applyDegradationAndValidate(npcEntity, playerStrikePayload.degradation, false);

	// ========================================================================
	// 6. EVALUATE COMBAT OUTCOME
	// ========================================================================
	combatStatus = evaluateCombatEnd(playerEntity, npcEntity, combatType);

	if (combatStatus !== 'CONTINUE') {
		const permitted = DB_COMBAT.permittedOutcomes[npcCategory]?.[combatType] || [];
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
			actionLog: playerOverrides.actionLog || npcOverrides.actionLog || null,
		},
	};
};
