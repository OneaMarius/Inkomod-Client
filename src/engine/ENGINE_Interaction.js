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

export const executeInteraction = (
	playerEntity,
	actionTag,
	npcTarget,
	regionalExchangeRate = 10,
	amount = 0, // <--- NOU: Am adăugat parametrul aici!
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
		// --- EMPLOYMENT & LOGISTICS ---
		if (actionTag === 'Labor_Coin') {
			const yieldAmount = convertGoldToSilver(
				config.goldCoinBaseYield,
				regionalExchangeRate,
			);
			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins += yieldAmount;
			return {
				status: 'SUCCESS',
				yieldAmount,
				updatedPlayer: playerEntity,
				removeEntity: true, // <--- NOU: Flag pentru a șterge NPC-ul după muncă
			};
		}

		if (actionTag === 'Labor_Food') {
			// Verify AP
			if (playerEntity.progression.actionPoints < apCost) {
				return { status: 'FAILED_INSUFFICIENT_AP', required: apCost };
			}

			// Calculate yield based on Player Strength and NPC Rank
			const pStr =
				playerEntity.stats?.innateStr || playerEntity.stats?.str || 10;
			const nRank = npcTarget?.classification?.entityRank || 1;

			// Formula: Base 2 food per rank + 1 extra food for every 5 points of Strength
			const baseYield = nRank * 2;
			const strBonus = Math.floor(pStr / 5);
			const totalFoodYield = baseYield + strBonus;

			// Apply mutations
			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.food =
				(playerEntity.inventory.food || 0) + totalFoodYield;

			// Optional: Deduct from NPC if you want strict economy,
			// but usually labor rewards are generated to inject resources into the player's loop.
			if (npcTarget.inventory && npcTarget.inventory.food !== undefined) {
				npcTarget.inventory.food = Math.max(
					0,
					npcTarget.inventory.food - totalFoodYield,
				);
			}

			return {
				status: 'SUCCESS',
				yieldAmount: 0, // No coins yielded
				acquiredItem: `${totalFoodYield} Food`,
				updatedPlayer: playerEntity,
				removeEntity: true, // <--- NOU: Flag pentru a șterge NPC-ul după muncă
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

			// Dacă este deja la maxim cu ambele, nu îl lăsăm să dea banii degeaba
			if (isHpFull && isApFull) {
				return { status: 'FAILED_ALREADY_FULL_HP' }; // Poți schimba acest mesaj în UI ulterior într-unul mai generic de genul "Already fully rested"
			}

			// 1. Aplicăm costurile
			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= cost;

			// 2. Calculăm HP-ul real restaurat
			const previousHp = playerEntity.biology.hpCurrent;
			playerEntity.biology.hpCurrent = Math.min(
				playerEntity.biology.hpMax,
				previousHp + config.hpRestored,
			);
			const actualHpRestored = playerEntity.biology.hpCurrent - previousHp;

			// 3. Calculăm AP-ul real restaurat
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
				apRestored: actualApRestored, // Trimitem și AP-ul restaurat către UI
				updatedPlayer: playerEntity,
			};
		}

		// --- MAINTENANCE & HEALING ---
		if (actionTag === 'Heal_Mount') {
			// CORRECTED: Look for 'mountItem'
			const mount = playerEntity.equipment?.mountItem;

			if (!mount) {
				return { status: 'FAILED_NO_MOUNT' };
			}

			const missingHp = mount.biology.hpMax - mount.biology.hpCurrent;
			if (missingHp <= 0) {
				return { status: 'FAILED_ALREADY_FULL' };
			}

			const config =
				WORLD.INTERACTION.skillChecks[actionTag] ||
				DB_INTERACTION_ACTIONS[actionTag];
			let baseCost = convertGoldToSilver(
				config.goldCoinBaseCost || 10,
				regionalExchangeRate,
			);
			const costFactor = config.dynamicCostFactor || 50;
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

			// Calculăm costul de bază ajustat regional
			const baseCostSilver = convertGoldToSilver(
				config.goldCoinBaseCost,
				regionalExchangeRate,
			);

			// Scalăm costul în funcție de rank-ul jucătorului
			const scaledCost = baseCostSilver * playerRank;

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
				combatRuleFallback = 'DMF';
			} else if (actionTag === 'Target_Assassination') {
				successChance +=
					(pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
				combatRuleFallback = 'DMF';
			}

			successChance = Math.max(
				checkConfig.minChance,
				Math.min(checkConfig.maxChance, successChance),
			);
			const roll = Math.random() * 100;
			const isSuccess = roll <= successChance;

			if (!isSuccess) {
				const isLethal = actionTag === 'Target_Assassination';
				const failHonPenalty = isLethal
					? WORLD.MORALITY.actions.killFailedHonPenalty
					: WORLD.MORALITY.actions.stealFailedHonPenalty;
				const failRenPenalty = isLethal
					? WORLD.MORALITY.actions.killFailedRenPenalty
					: WORLD.MORALITY.actions.stealFailedRenPenalty;

				const formattedActionName = actionTag
					.replace('Target_', '')
					.replace(/_/g, ' ');

				const failureEvent = {
					id: `evt_caught_${actionTag}`,
					name: 'Caught in the Act!',
					typology: 'CombatEncounter',
					eventType: 'NEGATIVE',
					description: `Your attempt to execute a ${formattedActionName} was noticed by the target. They are preparing to strike!`,
					choices: [
						{
							id: 'ch_caught_flee',
							label: 'Flee the scene',
							checkType: 'GENERAL',
							onSuccess: {
								description:
									'You managed to escape, but word of your crimes and cowardice will spread.',
								honor: failHonPenalty,
								renown: failRenPenalty,
							},
						},
						{
							id: 'ch_caught_fight',
							label: 'Silence them (Combat)',
							checkType: 'COMBAT',
							combatRule: combatRuleFallback,
							onSuccess: {
								description:
									'You left no witnesses to your crime, but your soul grows darker.',
								honor: WORLD.MORALITY.actions.killFailedHonPenalty,
							},
							onFailure: {
								description:
									'Justice was served by the blade. You were defeated.',
								hpMod: { tier: 'MAJOR', type: 'PENALTY' },
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

			// --- SUCCESS LOGIC ---
			if (actionTag === 'Target_Steal_Coin') {
				playerEntity.progression.honor = Math.max(
					-100,
					(playerEntity.progression.honor || 0) +
						WORLD.MORALITY.actions.stealSuccessHonPenalty,
				);

				let stolenAmount = 0;
				if (npcTarget.inventory?.silverCoins > 0) {
					const stealPercentage = 0.25 + Math.random() * 0.5;
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
					honorChange: WORLD.MORALITY.actions.stealSuccessHonPenalty,
					updatedPlayer: playerEntity,
				};
			}

			if (actionTag === 'Target_Steal_Food') {
				playerEntity.progression.honor = Math.max(
					-100,
					(playerEntity.progression.honor || 0) +
						WORLD.MORALITY.actions.stealSuccessHonPenalty,
				);

				let stolenFood = 0;
				if (npcTarget.inventory?.food > 0) {
					const stealPercentage = 0.25 + Math.random() * 0.5;
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
					honorChange: WORLD.MORALITY.actions.stealSuccessHonPenalty,
					updatedPlayer: playerEntity,
				};
			}

			if (actionTag === 'Target_Robbery') {
				playerEntity.progression.honor = Math.max(
					-100,
					(playerEntity.progression.honor || 0) +
						WORLD.MORALITY.actions.robberySuccessHonPenalty,
				);

				let stolenCoins = 0;
				let stolenFood = 0;

				if (npcTarget.inventory?.silverCoins > 0) {
					const stealPercentage = 0.5 + Math.random() * 0.5;
					stolenCoins = Math.floor(
						npcTarget.inventory.silverCoins * stealPercentage,
					);
					if (stolenCoins < 1 && npcTarget.inventory.silverCoins >= 1)
						stolenCoins = 1;

					playerEntity.inventory.silverCoins += stolenCoins;
					npcTarget.inventory.silverCoins -= stolenCoins;
				}

				if (npcTarget.inventory?.food > 0) {
					const stealPercentage = 0.5 + Math.random() * 0.5;
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
					yieldAmount: stolenCoins,
					acquiredItem: stolenFood > 0 ? `${stolenFood} Food` : null,
					honorChange: WORLD.MORALITY.actions.robberySuccessHonPenalty,
					updatedPlayer: playerEntity,
				};
			}

			if (actionTag === 'Target_Assassination') {
				playerEntity.progression.honor = Math.max(
					-100,
					(playerEntity.progression.honor || 0) +
						WORLD.MORALITY.actions.killSuccessHonPenalty,
				);

				let lootedCoins = 0;
				let lootedFood = 0;
				let lootedItemsCount = 0;

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

				// Transfer items and mounts securely
				if (!playerEntity.inventory.animalSlots)
					playerEntity.inventory.animalSlots = [];

				if (npcTarget.inventory?.itemSlots?.length > 0) {
					npcTarget.inventory.itemSlots.forEach((item) => {
						lootedItemsCount++;
						const isAnimal =
							item.classification?.entityCategory === 'Animal' ||
							item.classification?.entityClass === 'Mount' ||
							item.classification?.entitySubclass === 'Horse';

						if (isAnimal) {
							playerEntity.inventory.animalSlots.push(item);
						} else {
							playerEntity.inventory.itemSlots.push(item);
						}
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

				// Loot the NPC's equipped mount if they have one
				if (npcTarget.equipment?.mountItem) {
					playerEntity.inventory.animalSlots.push(
						npcTarget.equipment.mountItem,
					);
					lootedItemsCount++;
					npcTarget.equipment.mountItem = null;
					if (npcTarget.equipment.hasMount !== undefined) {
						npcTarget.equipment.hasMount = false;
					}
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
					honorChange: WORLD.MORALITY.actions.killSuccessHonPenalty,
					updatedPlayer: playerEntity,
				};
			}
		}

		// --- SKILL CHECKS: HUNTING & EVASION ---
		if (
			actionTag === 'Hunt_Animal' ||
			actionTag === 'Evade_Animal' ||
			actionTag === 'Evade_Monster'
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
				// Handle reward extraction for successful targeted hunt
				if (actionTag === 'Hunt_Animal') {
					let lootedFood = 0;
					let lootedItemsCount = 0;

					if (npcTarget.inventory?.food > 0) {
						lootedFood = npcTarget.inventory.food;
						playerEntity.inventory.food += lootedFood;
						npcTarget.inventory.food = 0;
					}

					if (npcTarget.inventory?.itemSlots?.length > 0) {
						lootedItemsCount = npcTarget.inventory.itemSlots.length;

						playerEntity.inventory.itemSlots.push(
							...npcTarget.inventory.itemSlots,
						);
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

					let acquiredString = lootedFood > 0 ? `${lootedFood} Food` : '';
					if (lootedItemsCount > 0) {
						const itemText = `${lootedItemsCount} Item${lootedItemsCount > 1 ? 's' : ''}`;
						acquiredString = acquiredString
							? `${acquiredString} & ${itemText}`
							: itemText;
					}

					return {
						status: 'SUCCESS',
						yieldAmount: 0,
						acquiredItem: acquiredString || 'Nothing harvestable',
						actionTag,
						updatedPlayer: playerEntity,
					};
				}

				// Evasion success logic
				return {
					status: 'SUCCESS',
					actionTag,
					updatedPlayer: playerEntity,
				};
			} else {
				if (actionTag === 'Hunt_Animal') {
					// Check if the animal is hostile
					const isHostile =
						npcTarget?.behavior?.behaviorState === 'Hostile';

					if (isHostile) {
						return {
							status: 'FAILED_RISK_CHECK',
							targetId: targetId,
							apSpent: apCost,
							combatRule: 'DMF',
							actionTag: actionTag,
							updatedPlayer: playerEntity,
						};
					} else {
						// NOU: Dacă animalul nu este ostil, fuge.
						// Returnăm statusul special care semnalează UI-ului că animalul a scăpat.
						return {
							status: 'FAILED_ESCAPE',
							targetId: targetId,
							apSpent: apCost,
							actionTag: actionTag,
							updatedPlayer: playerEntity,
						};
					}
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
		}

		// --- BRIBERY LOGIC ---
		if (actionTag === 'Target_Bribe') {
			if (!npcTarget) return { status: 'FAILED_NO_TARGET' };

			// Calculate bribe cost based on NPC rank
			const npcRank = npcTarget.classification?.entityRank || 1;
			const bribeCost = npcRank * 15 * regionalExchangeRate;

			if (playerEntity.inventory.silverCoins < bribeCost) {
				return { status: 'FAILED_INSUFFICIENT_FUNDS', required: bribeCost };
			}

			playerEntity.progression.actionPoints -= apCost;
			playerEntity.inventory.silverCoins -= bribeCost;
			npcTarget.inventory.silverCoins =
				(npcTarget.inventory.silverCoins || 0) + bribeCost;

			// Alter behavior to avoid combat in the future
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
			playerEntity.progression.renown =
				(playerEntity.progression.renown || 0) + renBonus;

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

			const honRenGain = Math.floor(
				amount / WORLD.MORALITY.actions.donateCoinDivisor,
			);

			playerEntity.progression.honor = Math.min(
				100,
				(playerEntity.progression.honor || 0) + honRenGain,
			);
			playerEntity.progression.renown =
				(playerEntity.progression.renown || 0) + honRenGain;

			return {
				status: 'SUCCESS',
				costApplied: amount,
				honorChange: honRenGain,
				renownChange: honRenGain,
				updatedPlayer: playerEntity,
			};
		}

		if (actionTag === 'Donate_Food') {
			playerEntity.progression.actionPoints -=
				WORLD.MORALITY.actions.donateFoodAp;
			playerEntity.inventory.food -= amount;

			const honRenGain = Math.floor(
				amount / WORLD.MORALITY.actions.donateFoodDivisor,
			);

			playerEntity.progression.honor = Math.min(
				100,
				(playerEntity.progression.honor || 0) + honRenGain,
			);
			playerEntity.progression.renown =
				(playerEntity.progression.renown || 0) + honRenGain;

			return {
				status: 'SUCCESS',
				costApplied: amount,
				honorChange: honRenGain,
				renownChange: honRenGain,
				updatedPlayer: playerEntity,
			};
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
