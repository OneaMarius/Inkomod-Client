// File: Client/src/engine/ENGINE_Interaction.js
// Description: Validates and executes non-combat state mutations based on DB_Interaction_Actions.

import { WORLD } from '../data/GameWorld.js';
import { DB_INTERACTION_ACTIONS } from '../data/DB_Interaction_Actions.js';
import { QUEST_REGISTRY } from './ENGINE_Quests.js';
import { DB_COMBAT } from '../data/DB_Combat.js';
import { calculateRiskAndCombatScenarios } from '../utils/UnifiedMoralityCalculator.js';

/**
 * Helper to convert abstract gold values to regional silver values.
 */
const convertGoldToSilver = (baseGold, exchangeRate) => {
	return Math.floor(baseGold * exchangeRate);
};

export const executeInteraction = (
	playerEntity,
	actionTag,
	npcTarget,
	regionalExchangeRate = 10,
	amount = 0,
	currentPoiCategory = 'UNTAMED',
) => {
	// Safely extract the ID for routing returns
	const targetId = npcTarget ? npcTarget.entityId || npcTarget.id : null;

	// 1. Fetch the exact configuration from the Single Source of Truth
	const config = DB_INTERACTION_ACTIONS[actionTag];

	if (!config) {
		return { status: 'FAILED_UNKNOWN_ACTION' };
	}

	// 2. Validate AP constraints
	const apCost =
		config.apCost !== undefined
			? config.apCost
			: WORLD.PLAYER?.defaultInteractionApCost || 0;

	if (playerEntity.progression.actionPoints < apCost) {
		return { status: 'FAILED_INSUFFICIENT_AP' };
	}

	// ========================================================================
	// ROUTE: COMBAT
	// ========================================================================
	if (config.executionRoute === 'ROUTE_COMBAT') {
		playerEntity.progression.actionPoints -= apCost;

		// Return the exact combat rule (FF, NF, DMF) straight from the database
		return {
			status: 'TRIGGER_COMBAT',
			targetId: targetId,
			apSpent: apCost,
			combatRule: config.combatRule,
			updatedPlayer: playerEntity,
		};
	}

	// ========================================================================
	// ROUTE: TRADE
	// ========================================================================
	if (config.executionRoute === 'ROUTE_TRADE') {
		playerEntity.progression.actionPoints -= apCost;
		return {
			status: 'TRIGGER_TRADE',
			targetId: targetId,
			apSpent: apCost,
			updatedPlayer: playerEntity,
		};
	}

	// ========================================================================
	// ROUTE: INSTANT (State Mutations & Skill Checks)
	// ========================================================================
	if (config.executionRoute === 'ROUTE_INSTANT') {
		// --- DIRECT COMBAT ACTIONS (EVENT WRAPPERS) ---
		if (
			[
				'Combat_Engage',
				'Combat_Duel',
				'Combat_Training',
				'Combat_Brawl',
			].includes(actionTag)
		) {
			if (!npcTarget) return { status: 'FAILED_NO_TARGET' };

			playerEntity.progression.actionPoints -= apCost;

			let eventName = '';
			let eventDesc = '';
			let resolvedCombatRule = 'DMF';
			let successPayload = {};
			let failurePayload = {};

			// Fetch specific retreat consequences from GameWorld
			const retreatConfig = WORLD.MORALITY.actions[
				`${actionTag}_Retreat`
			] || { honorChange: 0, renownChange: 0, label: 'Retreated' };

			if (actionTag === 'Combat_Engage') {
				eventName = 'Lethal Intent';
				eventDesc = `You draw your weapon, locking eyes with ${npcTarget.entityName || 'the target'}. This is a fight to the death. No quarter will be given.`;
				resolvedCombatRule = 'DMF';
				successPayload = {
					description:
						'You emerged victorious, standing over your fallen foe.',
				};
				failurePayload = {
					description:
						'You fought desperately and barely managed to escape with your life.',
				};
			} else if (actionTag === 'Combat_Duel') {
				eventName = 'Formal Duel';
				eventDesc = `You formally challenge ${npcTarget.entityName || 'the target'} to a duel of honor. Lethal blows are strictly forbidden by custom.`;
				resolvedCombatRule = 'NF';
				successPayload = {
					description:
						'You won the duel, proving your superior technique.',
				};
				failurePayload = {
					description:
						"You yielded the duel, acknowledging your opponent's prowess.",
				};
			} else if (actionTag === 'Combat_Training') {
				eventName = 'Sparring Match';
				eventDesc = `You invite ${npcTarget.entityName || 'the target'} to a friendly sparring match to test your limits and hone your skills.`;
				resolvedCombatRule = 'FF';
				successPayload = {
					str: 1,
					description:
						'You dominated the training session, building your physical strength. (+1 STR)',
				};
				failurePayload = {
					agi: 1,
					description:
						'You were pushed hard and forced to dodge repeatedly, sharpening your reflexes. (+1 AGI)',
				};
			} else if (actionTag === 'Combat_Brawl') {
				eventName = 'Spontaneous Brawl';
				eventDesc = `You provoke ${npcTarget.entityName || 'the target'} into a rough fistfight. Yielding is allowed, but bruises are guaranteed.`;
				resolvedCombatRule = 'NF';
				successPayload = {
					description: 'You beat them down until they yielded the fight.',
				};
				failurePayload = {
					description:
						'You were overwhelmed by their strikes and forced to back down.',
				};
			}

			const combatWrapperEvent = {
				id: `evt_wrapper_${actionTag.toLowerCase()}`,
				name: eventName,
				typology: 'CombatEncounter',
				eventType: 'NEUTRAL',
				description: eventDesc,
				choices: [
					{
						id: 'ch_combat_proceed',
						label: 'Commence Combat',
						checkType: 'COMBAT',
						combatRule: resolvedCombatRule,
						onSuccess: successPayload,
						onFailure: failurePayload,
					},
					{
						id: 'ch_combat_retreat',
						label: 'Step back (Retreat)',
						checkType: 'GENERAL',
						onSuccess: {
							description: retreatConfig.label,
							honor: retreatConfig.honorChange,
							renown: retreatConfig.renownChange,
						},
					},
				],
			};

			return {
				status: 'TRIGGER_DYNAMIC_EVENT',
				eventData: combatWrapperEvent,
				targetId: targetId,
				targetNpc: npcTarget,
				updatedPlayer: playerEntity,
			};
		}
		// --- DYNAMIC QUEST ROUTING ---
		if (QUEST_REGISTRY[actionTag]) {
			// Ensure the array exists in player progression
			if (!playerEntity.progression.completedQuests) {
				playerEntity.progression.completedQuests = [];
			}

			playerEntity.progression.actionPoints -= apCost;
			const result = QUEST_REGISTRY[actionTag].execute(playerEntity);

			// If the quest logic signals completion, store the tag
			if (result.isQuestCompleted) {
				if (!playerEntity.progression.completedQuests.includes(actionTag)) {
					playerEntity.progression.completedQuests.push(actionTag);
				}
			}

			return result;
		}

		// --- HELPER FUNC PENTRU RECOMPENSELE DE LABOR ---
		const applyLaborReward = (player) => {
			let honBonus = 0;
			let renBonus = WORLD.SOCIAL?.renownBonus?.laborActionRenown || 1;
			let statIncreased = null;
			let bonusMessage = null;

			if (player.progression.laborCount === undefined)
				player.progression.laborCount = 0;
			player.progression.laborCount += 1;

			const laborConfig = WORLD.PLAYER.laborRewards;

			if (player.progression.laborCount >= laborConfig.actionsRequired) {
				player.progression.laborCount = 0;

				const pRank = player.identity?.rank || 1;
				const rIndex = pRank - 1;
				const caps = WORLD.PLAYER.trainingCaps;

				const eligibleStats = [];
				if ((player.stats.str || 0) < caps.str[rIndex])
					eligibleStats.push('str');
				if ((player.stats.agi || 0) < caps.agi[rIndex])
					eligibleStats.push('agi');
				if ((player.stats.int || 0) < caps.int[rIndex])
					eligibleStats.push('int');

				if (eligibleStats.length > 0) {
					const chosenStat =
						eligibleStats[
							Math.floor(Math.random() * eligibleStats.length)
						];
					player.stats[chosenStat] += laborConfig.statBonusAmount;
					statIncreased = chosenStat;

					if (chosenStat === 'str')
						bonusMessage = `Months of hard manual labor have built your muscles. (STR)`;
					if (chosenStat === 'agi')
						bonusMessage = `The repetitive and taxing work has honed your reflexes and stamina. (AGI)`;
					if (chosenStat === 'int')
						bonusMessage = `Dealing with different tasks and employers has sharpened your practical wits. (INT)`;
				} else {
					honBonus += laborConfig.fallbackHonor;
					renBonus += laborConfig.fallbackRenown;
					bonusMessage = `Your consistent reliability has earned you deep respect, as your physical limits are already at their peak. (Honor&Renown)`;
				}
			}

			player.progression.honor = Math.min(
				100,
				(player.progression.honor || 0) + honBonus,
			);
			player.progression.renown = Math.min(
				500,
				(player.progression.renown || 0) + renBonus,
			);

			return { renBonus, honBonus, statIncreased, bonusMessage };
		};

		// --- EMPLOYMENT & LOGISTICS ---
		if (actionTag === 'Labor_Coin') {
			const yieldAmount = convertGoldToSilver(
				config.goldCoinBaseYield,
				regionalExchangeRate,
			);
			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins += yieldAmount;

			const reward = applyLaborReward(playerEntity);

			return {
				status: 'SUCCESS',
				yieldAmount,
				renownChange: reward.renBonus,
				honorChange: reward.honBonus > 0 ? reward.honBonus : undefined,
				statIncreased: reward.statIncreased,
				bonusMessage: reward.bonusMessage,
				updatedPlayer: playerEntity,
				removeEntity: true,
			};
		}

		if (actionTag === 'Labor_Food') {
			if (playerEntity.progression.actionPoints < apCost) {
				return { status: 'FAILED_INSUFFICIENT_AP', required: apCost };
			}

			const pStr =
				playerEntity.stats?.innateStr || playerEntity.stats?.str || 10;
			const nRank = npcTarget?.classification?.entityRank || 1;

			const baseYield = nRank * 2;
			const strBonus = Math.floor(pStr / 5);
			const totalFoodYield = baseYield + strBonus;

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.food =
				(playerEntity.inventory.food || 0) + totalFoodYield;

			if (
				npcTarget &&
				npcTarget.inventory &&
				npcTarget.inventory.food !== undefined
			) {
				npcTarget.inventory.food = Math.max(
					0,
					npcTarget.inventory.food - totalFoodYield,
				);
			}

			const reward = applyLaborReward(playerEntity);

			return {
				status: 'SUCCESS',
				yieldAmount: 0,
				acquiredItem: `${totalFoodYield} Food`,
				renownChange: reward.renBonus,
				honorChange: reward.honBonus > 0 ? reward.honBonus : undefined,
				statIncreased: reward.statIncreased,
				bonusMessage: reward.bonusMessage,
				updatedPlayer: playerEntity,
				removeEntity: true,
			};
		}

		if (actionTag === 'Service_Lodging') {
			const cost = convertGoldToSilver(
				config.goldCoinBaseCost,
				regionalExchangeRate,
			);

			if (playerEntity.inventory.silverCoins < cost) {
				return { status: 'FAILED_INSUFFICIENT_FUNDS', required: cost };
			}

			const overchargeLimit = WORLD.PLAYER.maxOverchargeAp || 16;
			const isHpFull =
				playerEntity.biology.hpCurrent >= playerEntity.biology.hpMax;
			const isApFull =
				playerEntity.progression.actionPoints >= overchargeLimit;

			if (isHpFull && isApFull) {
				return { status: 'FAILED_ALREADY_FULL_HP' };
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= cost;

			const previousHp = playerEntity.biology.hpCurrent;
			playerEntity.biology.hpCurrent = Math.min(
				playerEntity.biology.hpMax,
				previousHp + config.hpRestored,
			);
			const actualHpRestored = playerEntity.biology.hpCurrent - previousHp;

			const previousAp = playerEntity.progression.actionPoints;
			playerEntity.progression.actionPoints = Math.min(
				overchargeLimit,
				previousAp + (config.apRestored || 0),
			);
			const actualApRestored =
				playerEntity.progression.actionPoints - previousAp;

			return {
				status: 'SUCCESS',
				costApplied: cost,
				hpRestored: actualHpRestored,
				apRestored: actualApRestored,
				updatedPlayer: playerEntity,
			};
		}

		if (actionTag === 'Rest_Road') {
			if (playerEntity.inventory.food < 1) {
				return { status: 'FAILED_INSUFFICIENT_FOOD', required: 1 };
			}
			if (playerEntity.biology.hpCurrent >= playerEntity.biology.hpMax) {
				return { status: 'FAILED_ALREADY_FULL_HP' };
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.food -= 1;

			const previousHp = playerEntity.biology.hpCurrent;
			playerEntity.biology.hpCurrent = Math.min(
				playerEntity.biology.hpMax,
				previousHp + 5,
			);
			const actualHpRestored = playerEntity.biology.hpCurrent - previousHp;

			return {
				status: 'SUCCESS',
				costApplied: 1,
				hpRestored: actualHpRestored,
				updatedPlayer: playerEntity,
			};
		}

		// --- MAINTENANCE & HEALING ---
		if (actionTag === 'Heal_Mount') {
			const mount = playerEntity.equipment?.mountItem;

			if (!mount) {
				return { status: 'FAILED_NO_MOUNT' };
			}

			const missingHp = mount.biology.hpMax - mount.biology.hpCurrent;
			if (missingHp <= 0) {
				return { status: 'FAILED_ALREADY_FULL' };
			}

			const checkConfig =
				WORLD.INTERACTION.skillChecks[actionTag] ||
				DB_INTERACTION_ACTIONS[actionTag];
			let baseCost = convertGoldToSilver(
				checkConfig.goldCoinBaseCost || 10,
				regionalExchangeRate,
			);
			const costFactor = checkConfig.dynamicCostFactor || 50;
			const finalCost = Math.floor(
				baseCost + (baseCost / costFactor) * missingHp,
			);

			if (playerEntity.inventory.silverCoins < finalCost) {
				return { status: 'FAILED_INSUFFICIENT_FUNDS', required: finalCost };
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= finalCost;

			if (npcTarget && npcTarget.inventory) {
				npcTarget.inventory.silverCoins =
					(npcTarget.inventory.silverCoins || 0) + finalCost;
			}

			mount.biology.hpCurrent = mount.biology.hpMax;

			return {
				status: 'SUCCESS',
				hpRestored: missingHp,
				costApplied: finalCost,
				updatedPlayer: playerEntity,
			};
		}

		if (actionTag === 'Heal_Player') {
			if (playerEntity.biology.hpCurrent >= playerEntity.biology.hpMax) {
				return { status: 'FAILED_ALREADY_FULL_HP' };
			}

			const missingHp =
				playerEntity.biology.hpMax - playerEntity.biology.hpCurrent;
			const baseCostSilver = convertGoldToSilver(
				config.goldCoinBaseCost,
				regionalExchangeRate,
			);

			const costFactor = config.dynamicCostFactor || 50;
			const totalDynamicCost = Math.floor(
				baseCostSilver + (baseCostSilver / costFactor) * missingHp,
			);

			if (playerEntity.inventory.silverCoins < totalDynamicCost) {
				return {
					status: 'FAILED_INSUFFICIENT_FUNDS',
					required: totalDynamicCost,
				};
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= totalDynamicCost;
			playerEntity.biology.hpCurrent = playerEntity.biology.hpMax;

			return {
				status: 'SUCCESS',
				costApplied: totalDynamicCost,
				hpRestored: missingHp,
				updatedPlayer: playerEntity,
			};
		}

		if (actionTag === 'Cure_Player') {
			const hardCap = WORLD.PLAYER.hpLimits.hardCap;

			if (playerEntity.biology.hpMax >= hardCap) {
				return { status: 'FAILED_ALREADY_CURED' };
			}

			const missingHpMax = hardCap - playerEntity.biology.hpMax;
			const baseCostSilver = convertGoldToSilver(
				config.goldCoinBaseCost,
				regionalExchangeRate,
			);

			const costFactor = config.dynamicCostFactor || 50;
			const totalDynamicCost = Math.floor(
				baseCostSilver + (baseCostSilver / costFactor) * missingHpMax,
			);

			if (playerEntity.inventory.silverCoins < totalDynamicCost) {
				return {
					status: 'FAILED_INSUFFICIENT_FUNDS',
					required: totalDynamicCost,
				};
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= totalDynamicCost;
			playerEntity.biology.hpMax = hardCap;

			return {
				status: 'SUCCESS',
				costApplied: totalDynamicCost,
				updatedPlayer: playerEntity,
			};
		}

		// --- ATTRIBUTE PROGRESSION ---
		if (actionTag.startsWith('Train_')) {
			const statKey = actionTag.split('_')[1].toLowerCase();
			const playerRank = playerEntity.identity.rank || 1;

			const baseCostSilver = convertGoldToSilver(
				config.goldCoinBaseCost,
				regionalExchangeRate,
			);
			const scaledCost = Math.min(1000, Math.max(100, baseCostSilver * playerRank));

			const currentStat = playerEntity.stats[statKey];
			const playerRankIndex = playerRank - 1;
			const currentCap = WORLD.PLAYER.trainingCaps[statKey][playerRankIndex];

			if (currentStat >= currentCap) return { status: 'FAILED_STAT_CAPPED' };
			if (playerEntity.inventory.silverCoins < scaledCost)
				return {
					status: 'FAILED_INSUFFICIENT_FUNDS',
					required: scaledCost,
				};

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= scaledCost;
			playerEntity.stats[statKey] += config.statIncrement;

			return {
				status: 'SUCCESS',
				costApplied: scaledCost,
				statIncreased: statKey,
				updatedPlayer: playerEntity,
			};
		}

		// --- SKILL CHECKS: STEALTH & ASSASSINATION ---
		const requiresStealthCheck = [
			'Target_Assassination',
			'Target_Robbery',
			'Target_Steal_Coin',
			'Target_Steal_Food',
			'Target_Ambush',
			'Target_Steal_Animal',
			'Ambush_Animal', // NOU
			'Ambush_Monster', // NOU
			'Ambush_Nephilim', // NOU
		].includes(actionTag);

		if (requiresStealthCheck) {
			if (!npcTarget) return { status: 'FAILED_NO_TARGET' };

			playerEntity.progression.actionPoints -= apCost;

			const pAgi = playerEntity.stats.agi || 10;
			const nAgi = npcTarget.stats?.agi || 10;
			const nInt = npcTarget.stats?.int || 10;
			const pRank = playerEntity.identity?.rank || 1;
			const nRank =
				npcTarget.classification?.entityRank ||
				npcTarget.classification?.poiRank ||
				1;
			const rankDelta = Math.max(0, nRank - pRank);

			const checkConfig = WORLD.INTERACTION.skillChecks[actionTag];
			if (!checkConfig) return { status: 'FAILED_CONFIG_MISSING' };

			let successChance = checkConfig.baseChance;
			let combatRuleFallback = 'NF';

			if (
				actionTag === 'Target_Steal_Coin' ||
				actionTag === 'Target_Steal_Food'
			) {
				successChance +=
					(pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'NF';
			} else if (actionTag === 'Target_Robbery') {
				successChance +=
					(pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'NF';
			} else if (actionTag.includes('Ambush')) {
				successChance +=
					(pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'DMF';
			} else if (actionTag === 'Target_Assassination') {
				successChance +=
					(pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'DMF';
			} else if (actionTag === 'Target_Steal_Animal') {
				successChance +=
					(pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
			}

			successChance = Math.max(
				checkConfig.minChance,
				Math.min(checkConfig.maxChance, successChance),
			);
			const roll = Math.random() * 100;
			const isSuccess = roll <= successChance;

			// ==========================================
			// EȘEC (FAILURE LOGIC)
			// ==========================================
			if (!isSuccess) {
				if (actionTag === 'Target_Steal_Animal') {
					const isUntamed = currentPoiCategory === 'UNTAMED';

					if (isUntamed) {
						// WILDERNESS: Animal reacts directly
						const isHostile =
							npcTarget.behavior?.behaviorState === 'Hostile';
						if (isHostile) {
							return {
								status: 'TRIGGER_COMBAT',
								updatedPlayer: playerEntity,
								targetId: targetId,
								combatRule: 'DMF',
							};
						} else {
							return {
								status: 'FAILED_ESCAPE',
								updatedPlayer: playerEntity,
								targetId: targetId,
							};
						}
					} else {
						// CIVILIZED: Owner intervention
						const animalValue = nRank * 25 * regionalExchangeRate;
						const animalFailureEvent = {
							id: `evt_caught_stealing_animal`,
							name: 'Caught in the Act!',
							typology: 'Encounter',
							eventType: 'NEGATIVE',
							description: `The owner caught you trying to steal the ${npcTarget.entityName || 'animal'}! Guards are approaching.`,
							choices: [
								{
									id: 'ch_caught_flee',
									label: 'Flee the scene',
									checkType: 'GENERAL',
									onSuccess: {
										description:
											'You managed to escape, but word of your crime spreads.',
										honor:
											WORLD.MORALITY.actions
												.stealAnimalFailedHonPenalty || -5,
										renown:
											WORLD.MORALITY.actions
												.stealAnimalFailedRenPenalty || -10,
									},
								},
								{
									id: 'ch_caught_bribe',
									label: `Pay compensation (${animalValue} Coins)`,
									checkType: 'TRADE_OFF',
									cost: { silverCoins: animalValue },
									onSuccess: {
										description:
											'You quickly pay off the owner, claiming it was a misunderstanding. The matter is dropped.',
									},
								},
							],
						};
						return {
							status: 'TRIGGER_DYNAMIC_EVENT',
							eventData: animalFailureEvent,
							targetId: targetId,
							targetNpc: npcTarget,
							updatedPlayer: playerEntity,
						};
					}
				}

				// --- CAZ STANDARD: Furt / Asasinare / Ambuscadă (Cu Combat) ---
				const formattedActionName = actionTag
					.replace('Target_', '')
					.replace('Combat_', '')
					.replace(/_/g, ' ');

				// --- NOU: Calcul centralizat via UnifiedMoralityCalculator ---
				const scenarios = calculateRiskAndCombatScenarios(
					actionTag,
					npcTarget,
					combatRuleFallback,
				);

				const fleeHonPenalty = scenarios.v2_CaughtAndFlee.honor;
				const fleeRenPenalty = scenarios.v2_CaughtAndFlee.renown;

				const fightHonPenalty = scenarios.baseFailureCost.honor;
				const fightRenPenalty = scenarios.baseFailureCost.renown;

				const crimeLabel =
					WORLD.MORALITY.actions[actionTag]?.failure?.label ||
					'Caught in the Act!';

				const failureEvent = {
					id: `evt_caught_${actionTag}`,
					name: crimeLabel,
					typology: 'CombatEncounter',
					eventType: 'NEGATIVE',
					description: `Your attempt to execute a ${formattedActionName} was noticed by the target! They draw their weapon and prepare to strike.`,
					choices: [
						{
							id: 'ch_caught_flee',
							label: 'Flee the scene',
							checkType: 'GENERAL',
							onSuccess: {
								description:
									'You managed to escape, but word of your crimes and cowardice will spread.',
								honor: fleeHonPenalty,
								renown: fleeRenPenalty,
							},
						},
						{
							id: 'ch_caught_fight',
							label: 'Silence them (Combat)',
							checkType: 'COMBAT',
							combatRule: combatRuleFallback,
							onSuccess: {
								description:
									'You fought your way out. The immediate threat is gone, but the stain on your honor remains.',
								honor: fightHonPenalty,
								renown: fightRenPenalty,
							},
							onFailure: {
								description:
									'You succeeded to run away with your life, but the stain on your honor remains.',
								apMod: { tier: 'MINOR', type: 'PENALTY' },
								honor: fightHonPenalty,
								renown: fightRenPenalty,
							},
						},
					],
				};

				return {
					status: 'TRIGGER_DYNAMIC_EVENT',
					eventData: failureEvent,
					targetId: targetId,
					targetNpc: npcTarget,
					updatedPlayer: playerEntity,
				};
			}

			// ==========================================
			// SUCCES (SUCCESS LOGIC)
			// ==========================================

			if (actionTag === 'Target_Steal_Animal') {
				return {
					status: 'TRIGGER_DYNAMIC_EVENT',
					updatedPlayer: playerEntity,
					targetId: targetId,
					targetNpc: npcTarget,
					eventData: {
						name: 'Animal Captured',
						typology: 'Encounter',
						description: `You managed to secure the ${npcTarget.entityName || 'animal'} without alerting anyone. What will you do with it?`,
						choices: [
							{
								label: 'Add to Caravan',
								action: 'ANIMAL_KEEP',
								checkType: 'GENERAL',
								variant: 'primary',
							},
							{
								label: 'Slaughter for Meat',
								action: 'ANIMAL_SLAUGHTER',
								checkType: 'GENERAL',
								variant: 'destructive',
							},
						],
					},
				};
			}

			if (actionTag.includes('Ambush')) {
				const reductionPct =
					WORLD.INTERACTION.stealthYields?.ambushHpReductionPct || 0.3;
				const hpDamage = Math.floor(
					npcTarget.biology.hpCurrent * reductionPct,
				);
				npcTarget.biology.hpCurrent = Math.max(
					1,
					npcTarget.biology.hpCurrent - hpDamage,
				);

				// Extract success morality
				const ambushScenarios = calculateRiskAndCombatScenarios(
					actionTag,
					npcTarget,
					'DMF',
				);
				const successHon = ambushScenarios.v1_Success.honor;
				const successRen = ambushScenarios.v1_Success.renown;

				const ambushSuccessEvent = {
					id: `evt_ambush_success_${actionTag}`, // Unic pentru fiecare
					name: 'Ambush Secured',
					typology: 'CombatEncounter',
					eventType: 'POSITIVE',
					description: `You successfully flank the ${npcTarget.entityName || 'target'} and land a devastating preemptive strike, tearing away ${hpDamage} HP! They are bleeding and disoriented. What is your next move?`,
					choices: [
						{
							id: 'ch_ambush_press',
							label: 'Press the advantage (Fight)',
							checkType: 'COMBAT',
							combatRule: 'DMF',
							onSuccess: {
								honor: successHon,
								renown: successRen,
							},
							onFailure: {
								description:
									'You survived the encounter and managed to escape, but the act of your ambush remains on your record.',
								honor: successHon,
								renown: successRen,
							},
						},
						{
							id: 'ch_ambush_fade',
							label: 'Fade into the shadows (Retreat)',
							checkType: 'GENERAL',
							onSuccess: {
								description:
									'Satisfied with the preemptive strike, you slip away before they can retaliate.',
								honor: successHon,
								renown: successRen,
							},
						},
					],
				};

				return {
					status: 'TRIGGER_DYNAMIC_EVENT',
					eventData: ambushSuccessEvent,
					targetId: targetId,
					targetNpc: npcTarget,
					updatedPlayer: playerEntity,
				};
			}

			// --- SUCCES: Target_Steal_Coin ---
			if (actionTag === 'Target_Steal_Coin') {
				const successConfig = WORLD.MORALITY.actions[actionTag]
					?.success || {
					honorChange: 0,
					renownChange: 0,
					label: 'Success',
				};

				playerEntity.progression.honor = Math.max(
					-100,
					Math.min(
						100,
						(playerEntity.progression.honor || 0) +
							successConfig.honorChange,
					),
				);
				playerEntity.progression.renown = Math.max(
					0,
					Math.min(
						500,
						(playerEntity.progression.renown || 0) +
							successConfig.renownChange,
					),
				);

				let stolenAmount = 0;
				if (npcTarget.inventory?.silverCoins > 0) {
					const yields = WORLD.INTERACTION.stealthYields;
					const stealPercentage =
						yields.coinMinPct +
						Math.random() * (yields.coinMaxPct - yields.coinMinPct);
					stolenAmount = Math.floor(
						npcTarget.inventory.silverCoins * stealPercentage,
					);
					if (stolenAmount < 1 && npcTarget.inventory.silverCoins >= 1)
						stolenAmount = 1;

					playerEntity.inventory.silverCoins += stolenAmount;
					npcTarget.inventory.silverCoins -= stolenAmount;
				}

				return {
					status: 'SUCCESS',
					yieldAmount: stolenAmount,
					honorChange: successConfig.honorChange,
					renownChange: successConfig.renownChange,
					bonusMessage: successConfig.label,
					updatedPlayer: playerEntity,
				};
			}

			// --- SUCCES: Target_Steal_Food ---
			if (actionTag === 'Target_Steal_Food') {
				const successConfig = WORLD.MORALITY.actions[actionTag]
					?.success || {
					honorChange: 0,
					renownChange: 0,
					label: 'Success',
				};

				playerEntity.progression.honor = Math.max(
					-100,
					Math.min(
						100,
						(playerEntity.progression.honor || 0) +
							successConfig.honorChange,
					),
				);
				playerEntity.progression.renown = Math.max(
					0,
					Math.min(
						500,
						(playerEntity.progression.renown || 0) +
							successConfig.renownChange,
					),
				);

				let stolenFood = 0;
				if (npcTarget.inventory?.food > 0) {
					const yields = WORLD.INTERACTION.stealthYields;
					const stealPercentage =
						yields.foodMinPct +
						Math.random() * (yields.foodMaxPct - yields.foodMinPct);
					stolenFood = Math.floor(
						npcTarget.inventory.food * stealPercentage,
					);
					if (stolenFood < 1 && npcTarget.inventory.food >= 1)
						stolenFood = 1;

					playerEntity.inventory.food += stolenFood;
					npcTarget.inventory.food -= stolenFood;
				}

				return {
					status: 'SUCCESS',
					yieldAmount: 0,
					acquiredItem:
						stolenFood > 0 ? `${stolenFood} Food` : 'Nothing of value',
					honorChange: successConfig.honorChange,
					renownChange: successConfig.renownChange,
					bonusMessage: successConfig.label,
					updatedPlayer: playerEntity,
				};
			}

			// --- SUCCES: Target_Robbery ---
			if (actionTag === 'Target_Robbery') {
				const successConfig = WORLD.MORALITY.actions[actionTag]
					?.success || {
					honorChange: 0,
					renownChange: 0,
					label: 'Success',
				};

				playerEntity.progression.honor = Math.max(
					-100,
					Math.min(
						100,
						(playerEntity.progression.honor || 0) +
							successConfig.honorChange,
					),
				);
				playerEntity.progression.renown = Math.max(
					0,
					Math.min(
						500,
						(playerEntity.progression.renown || 0) +
							successConfig.renownChange,
					),
				);

				let stolenCoins = 0,
					stolenFood = 0;
				const yields = WORLD.INTERACTION.stealthYields;

				if (npcTarget.inventory?.silverCoins > 0) {
					const stealPercentageCoins =
						yields.robberyMinPct +
						Math.random() * (yields.robberyMaxPct - yields.robberyMinPct);
					stolenCoins = Math.floor(
						npcTarget.inventory.silverCoins * stealPercentageCoins,
					);
					if (stolenCoins < 1 && npcTarget.inventory.silverCoins >= 1)
						stolenCoins = 1;

					playerEntity.inventory.silverCoins += stolenCoins;
					npcTarget.inventory.silverCoins -= stolenCoins;
				}

				if (npcTarget.inventory?.food > 0) {
					const stealPercentageFood =
						yields.robberyMinPct +
						Math.random() * (yields.robberyMaxPct - yields.robberyMinPct);
					stolenFood = Math.floor(
						npcTarget.inventory.food * stealPercentageFood,
					);
					if (stolenFood < 1 && npcTarget.inventory.food >= 1)
						stolenFood = 1;

					playerEntity.inventory.food += stolenFood;
					npcTarget.inventory.food -= stolenFood;
				}

				return {
					status: 'SUCCESS',
					yieldAmount: stolenCoins,
					acquiredItem: stolenFood > 0 ? `${stolenFood} Food` : null,
					honorChange: successConfig.honorChange,
					renownChange: successConfig.renownChange,
					bonusMessage: successConfig.label,
					updatedPlayer: playerEntity,
				};
			}

			// --- SUCCES: Target_Assassination ---
			if (actionTag === 'Target_Assassination') {
				const successConfig = WORLD.MORALITY.actions[actionTag]
					?.success || {
					honorChange: 0,
					renownChange: 0,
					label: 'Silent Execution',
				};

				playerEntity.progression.honor = Math.max(
					-100,
					Math.min(
						100,
						(playerEntity.progression.honor || 0) +
							successConfig.honorChange,
					),
				);
				playerEntity.progression.renown = Math.max(
					0,
					Math.min(
						500,
						(playerEntity.progression.renown || 0) +
							successConfig.renownChange,
					),
				);

				let lootedCoins = 0,
					lootedFood = 0,
					lootedItemsCount = 0;

				if (npcTarget.inventory?.silverCoins > 0) {
					lootedCoins = npcTarget.inventory.silverCoins;
					playerEntity.inventory.silverCoins += lootedCoins;
					npcTarget.inventory.silverCoins = 0;
				}
				if (npcTarget.inventory?.food > 0) {
					lootedFood = npcTarget.inventory.food;
					playerEntity.inventory.food += lootedFood;
					npcTarget.inventory.food = 0;
				}

				if (!playerEntity.inventory.animalSlots)
					playerEntity.inventory.animalSlots = [];

				if (npcTarget.inventory?.itemSlots?.length > 0) {
					npcTarget.inventory.itemSlots.forEach((item) => {
						lootedItemsCount++;
						const isAnimal =
							item.classification?.entityCategory === 'Animal' ||
							item.classification?.entityClass === 'Mount' ||
							item.classification?.entitySubclass === 'Horse';
						if (isAnimal) playerEntity.inventory.animalSlots.push(item);
						else playerEntity.inventory.itemSlots.push(item);
					});
					npcTarget.inventory.itemSlots = [];

					const limit = WORLD.PLAYER.inventoryLimits.itemSlots || 50;
					while (playerEntity.inventory.itemSlots.length > limit) {
						let lowestIndex = 0;
						for (
							let i = 1;
							i < playerEntity.inventory.itemSlots.length;
							i++
						) {
							const current = playerEntity.inventory.itemSlots[i];
							const lowest =
								playerEntity.inventory.itemSlots[lowestIndex];
							const currentVal =
								(current.classification?.itemTier || 1) * 10 +
								(current.classification?.itemQuality || 1);
							const lowestVal =
								(lowest.classification?.itemTier || 1) * 10 +
								(lowest.classification?.itemQuality || 1);
							if (currentVal < lowestVal) lowestIndex = i;
						}
						playerEntity.inventory.itemSlots.splice(lowestIndex, 1);
					}
				}

				if (npcTarget.equipment?.mountItem) {
					playerEntity.inventory.animalSlots.push(
						npcTarget.equipment.mountItem,
					);
					lootedItemsCount++;
					npcTarget.equipment.mountItem = null;
					if (npcTarget.equipment.hasMount !== undefined)
						npcTarget.equipment.hasMount = false;
				}

				let acquiredString = lootedFood > 0 ? `${lootedFood} Food` : '';
				if (lootedItemsCount > 0) {
					const itemText = `${lootedItemsCount} Item${lootedItemsCount > 1 ? 's' : ''}`;
					acquiredString = acquiredString
						? `${acquiredString} & ${itemText}`
						: itemText;
				}

				return {
					status: 'SUCCESS',
					yieldAmount: lootedCoins,
					acquiredItem: acquiredString || null,
					honorChange: successConfig.honorChange,
					renownChange: successConfig.renownChange,
					bonusMessage: successConfig.label,
					updatedPlayer: playerEntity,
				};
			}
		}

		// --- HUNTING (TARGETED DYNAMIC EVENT) ---
		if (actionTag === 'Hunt_Animal') {
			if (playerEntity.progression.actionPoints < apCost) {
				return { status: 'FAILED_INSUFFICIENT_AP', required: apCost };
			}

			playerEntity.progression.actionPoints -= apCost;

			const targetedHuntEvent = {
				id: 'evt_targeted_hunt_on_demand',
				name: 'Targeted Prey',
				typology: 'Discovery',
				eventType: 'POSITIVE',
				description: `You carefully maneuver around the ${npcTarget.entityName || npcTarget.name || 'animal'}, keeping downwind. It hasn't noticed you yet.`,
				conditions: {},
				staticEffects: null,
				onEncounter: null,
				choices: [
					{
						id: 'ch_thunt_stealth',
						label: 'Aim for a vital spot',
						checkType: 'SKILL_CHECK',
						attribute: 'agi',
						difficultyModifier: 1,
						onSuccess: {
							description:
								'A perfect strike. The beast falls instantly.',
							food: { tier: 'MINOR', type: 'REWARD' },
							renown: { tier: 'MINOR', type: 'REWARD' },
							procGen: {
								items: [
									{
										category: 'Loot',
										entityCategory: 'Animal',
										count: 1,
									},
								],
							},
						},
						onFailure: {
							description:
								'Your shot goes wide. The animal flees, and your reputation as a hunter takes a hit.',
							renown: { tier: 'MINOR', type: 'PENALTY' },
						},
					},
					{
						id: 'ch_thunt_luck',
						label: 'Desperate throw',
						checkType: 'LUCK_CHECK',
						successChance: 25,
						onSuccess: {
							description: 'By pure luck, your weapon finds its mark.',
							food: { tier: 'MINOR', type: 'REWARD' },
							procGen: {
								items: [
									{
										category: 'Loot',
										entityCategory: 'Animal',
										count: 1,
									},
								],
							},
						},
						onFailure: {
							description:
								'The weapon strikes a tree. Local trackers laugh at your incompetence.',
							renown: { tier: 'MODERATE', type: 'PENALTY' },
						},
					},
					{
						id: 'ch_thunt_leave',
						label: 'Lower your weapon',
						checkType: 'GENERAL',
						onSuccess: {
							description:
								'You decide to spare the creature, finding peace in the moment.',
							honor: { tier: 'MINOR', type: 'REWARD' },
						},
					},
				],
			};

			return {
				status: 'TRIGGER_DYNAMIC_EVENT',
				eventData: targetedHuntEvent,
				targetNpc: npcTarget,
				updatedPlayer: playerEntity,
			};
		}

		// --- SKILL CHECKS: EVASION ---
		if (
			actionTag === 'Evade_Animal' ||
			actionTag === 'Evade_Monster' ||
			actionTag === 'Evade_Nephilim'
		) {
			playerEntity.progression.actionPoints -= apCost;

			const pAgi = playerEntity.stats.agi || 10;
			const nAgi = npcTarget.stats?.agi || 10;
			const pRank = playerEntity.identity?.rank || 1;
			const nRank =
				npcTarget.classification?.entityRank ||
				npcTarget.classification?.poiRank ||
				1;
			const rankDelta = Math.max(0, nRank - pRank);

			const checkConfig = WORLD.INTERACTION.skillChecks[actionTag];
			if (!checkConfig) return { status: 'FAILED_CONFIG_MISSING' };

			let successChance =
				checkConfig.baseChance +
				(pAgi - nAgi) * 2 -
				rankDelta * checkConfig.rankPenalty;
			successChance = Math.max(
				checkConfig.minChance,
				Math.min(checkConfig.maxChance, successChance),
			);

			const roll = Math.random() * 100;

			if (roll <= successChance) {
				return {
					status: 'SUCCESS',
					actionTag,
					updatedPlayer: playerEntity,
				};
			} else {
				return {
					status: 'TRIGGER_COMBAT',
					targetId: targetId,
					apSpent: 0,
					combatRule: 'DMF',
					updatedPlayer: playerEntity,
				};
			}
		}

		// --- BRIBERY LOGIC ---
		if (actionTag === 'Target_Bribe') {
			if (!npcTarget) return { status: 'FAILED_NO_TARGET' };

			const npcRank = npcTarget.classification?.entityRank || 1;
			const bribeCost = npcRank * 15 * regionalExchangeRate;

			if (playerEntity.inventory.silverCoins < bribeCost) {
				return { status: 'FAILED_INSUFFICIENT_FUNDS', required: bribeCost };
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= bribeCost;
			npcTarget.inventory.silverCoins =
				(npcTarget.inventory.silverCoins || 0) + bribeCost;

			if (npcTarget.behavior) {
				npcTarget.behavior.state = 'Neutral';
			}

			return {
				status: 'SUCCESS',
				costApplied: bribeCost,
				updatedPlayer: playerEntity,
			};
		}

		if (actionTag === 'Ignore') {
			return { status: 'SUCCESS', actionTag, updatedPlayer: playerEntity };
		}

		// --- CHARITY & DONATION ---
		if (actionTag === 'Donate_Pray') {
			playerEntity.progression.actionPoints -=
				WORLD.MORALITY.actions.donatePrayAp;

			const honBonus = WORLD.MORALITY.actions.donatePrayHonBonus;
			const renBonus = WORLD.MORALITY.actions.donatePrayRenBonus;

			playerEntity.progression.honor = Math.min(
				100,
				(playerEntity.progression.honor || 0) + honBonus,
			);
			playerEntity.progression.renown = Math.min(
				500,
				(playerEntity.progression.renown || 0) + renBonus,
			);

			return {
				status: 'SUCCESS',
				honorChange: honBonus,
				renownChange: renBonus,
				updatedPlayer: playerEntity,
			};
		}

		if (actionTag === 'Donate_Coin') {
			playerEntity.progression.actionPoints -=
				WORLD.MORALITY.actions.donateCoinAp;
			playerEntity.inventory.silverCoins -= amount;

			const honBonusCoins = Math.floor(
				amount / WORLD.MORALITY.actions.donateCoinHonDivisor,
			);
			const renBonusCoins = Math.floor(
				amount / WORLD.MORALITY.actions.donateCoinRenDivisor,
			);

			playerEntity.progression.honor = Math.min(
				100,
				(playerEntity.progression.honor || 0) + honBonusCoins,
			);
			playerEntity.progression.renown = Math.min(
				500,
				(playerEntity.progression.renown || 0) + renBonusCoins,
			);

			return {
				status: 'SUCCESS',
				costApplied: amount,
				honorChange: honBonusCoins,
				renownChange: renBonusCoins,
				updatedPlayer: playerEntity,
			};
		}

		if (actionTag === 'Donate_Food') {
			playerEntity.progression.actionPoints -=
				WORLD.MORALITY.actions.donateFoodAp;
			playerEntity.inventory.food -= amount;

			const honBonusFood = Math.floor(
				amount / WORLD.MORALITY.actions.donateFoodHonDivisor,
			);
			const renBonusFood = Math.floor(
				amount / WORLD.MORALITY.actions.donateFoodRenDivisor,
			);

			playerEntity.progression.honor = Math.min(
				100,
				(playerEntity.progression.honor || 0) + honBonusFood,
			);
			playerEntity.progression.renown = Math.min(
				500,
				(playerEntity.progression.renown || 0) + renBonusFood,
			);

			return {
				status: 'SUCCESS',
				costApplied: amount,
				honorChange: honBonusFood,
				renownChange: renBonusFood,
				updatedPlayer: playerEntity,
			};
		}

		return { status: 'FAILED_ACTION_NOT_IMPLEMENTED' };
	}

	// ========================================================================
	// ROUTE: SPATIAL (Safety Catch)
	// ========================================================================
	if (config.executionRoute === 'ROUTE_SPATIAL') {
		return { status: 'FAILED_INVALID_ROUTING' };
	}

	return { status: 'FAILED_UNKNOWN_ACTION' };
};
