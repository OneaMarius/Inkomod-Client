// File: Client/src/components/engineViews/InstantActionView.jsx

import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import { WORLD } from '../../data/GameWorld.js';
import { DB_COMBAT } from '../../data/DB_Combat.js';
import styles from '../../styles/InstantActionView.module.css';
import { calculateCombatMorality } from '../../utils/MoralityCalculator.js';

const InstantActionView = ({ actionTag, npcTarget, onCancel, onConfirm, onForceCombat }) => {
	const player = useGameState((state) => state.gameState.player);
	const regionalExchangeRate = useGameState((state) => state.gameState.location.regionalExchangeRate);

	const [isProcessing, setIsProcessing] = useState(false);
	const [actionResult, setActionResult] = useState(null);
	const [sliderValue, setSliderValue] = useState(0);
	const [activeTab, setActiveTab] = useState('RISK');

	const actionDef = DB_INTERACTION_ACTIONS[actionTag];
	if (!actionDef || !player) return null;

	// Safety check: Only require npcTarget if the action specifically targets an NPC
	if (actionDef.targetType === 'NPC' && !npcTarget) return null;

	// --- RESOLUTION SCREEN ---
	if (actionResult) {
		if (actionResult.status === 'TRIGGER_COMBAT' || actionResult.status === 'TRIGGER_DYNAMIC_EVENT') {
			onCancel();
			return null;
		}

		const isSuccess = actionResult.status === 'SUCCESS';
		const isRiskFailure = actionResult.status === 'FAILED_RISK_CHECK' || actionResult.status === 'FAILED_ESCAPE';

		return (
			<div className={styles.overlay}>
				<div className={styles.modal}>
					<div className={styles.header}>
						<h2 className={isSuccess ? styles.chanceGood : styles.chanceBad}>{isSuccess ? 'ACTION SUCCESSFUL' : 'ACTION FAILED'}</h2>
					</div>

					<div className={styles.resolutionBody}>
						{isSuccess && (
							<>
								{actionResult.yieldAmount > 0 && <p className={styles.chanceGood}>+{actionResult.yieldAmount} Silver Coins</p>}

								{actionResult.hpRestored !== undefined &&
									(actionResult.hpRestored > 0 ? (
										<p className={styles.chanceGood}>+{actionResult.hpRestored} HP Restored</p>
									) : (
										<p className={styles.dimmedText}>Health already at maximum.</p>
									))}

								{actionResult.apRestored > 0 && <p className={styles.chanceGood}>+{actionResult.apRestored} AP Restored</p>}

								{actionResult.statIncreased && <p className={styles.chanceGood}>+1 {actionResult.statIncreased.toUpperCase()}</p>}

								{actionResult.honorChange ? (
									<p className={actionResult.honorChange > 0 ? styles.chanceGood : styles.chanceBad}>
										{actionResult.honorChange > 0 ? `+${actionResult.honorChange}` : actionResult.honorChange} Honor
									</p>
								) : null}

								{actionResult.renownChange ? (
									<p className={actionResult.renownChange > 0 ? styles.chanceGood : styles.chanceBad}>
										{actionResult.renownChange > 0 ? `+${actionResult.renownChange}` : actionResult.renownChange} Renown
									</p>
								) : null}

								{actionResult.acquiredItem && <p className={styles.chanceGood}>+ {actionResult.acquiredItem}</p>}

								{actionResult.costApplied > 0 && (
									<p className={styles.chanceBad}>
										-{actionResult.costApplied} {['Donate_Food', 'Rest_Road'].includes(actionTag) ? 'Food' : 'Silver Coins'}
									</p>
								)}

								{/* Bonus narrative text */}
								{actionResult.bonusMessage && <p className={styles.bonusMessage}>"{actionResult.bonusMessage}"</p>}

								{!actionResult.yieldAmount &&
									actionResult.hpRestored === undefined &&
									!actionResult.statIncreased &&
									!actionResult.apRestored &&
									!actionResult.acquiredItem &&
									!actionResult.honorChange &&
									!actionResult.renownChange && <p className={styles.chanceGood}>The action was completed successfully.</p>}
							</>
						)}
						{isRiskFailure && (
							<>
								<p className={styles.chanceBad}>You have been detected or failed the attempt.</p>
								<p className={styles.consequenceText}>
									{actionResult.status === 'FAILED_ESCAPE' ? 'The animal was startled and fled the area.' : 'The target is hostile and is attacking!'}
								</p>
							</>
						)}
						{!isSuccess && !isRiskFailure && <p className={styles.chanceBad}>Error: {actionResult.status}</p>}
					</div>

					<div className={styles.actionSection}>
						{isRiskFailure ? (
							actionResult.status === 'FAILED_ESCAPE' ? (
								<button
									className={styles.btnExecute}
									onClick={onCancel}
								>
									Accept Loss
								</button>
							) : (
								<>
									{actionResult.actionTag === 'Hunt_Animal' && (
										<button
											className={styles.btnCancel}
											onClick={() => {
												setActionResult(null);
												setIsProcessing(false);
												const result = onConfirm('Evade_Animal', npcTarget.entityId || npcTarget.id, regionalExchangeRate);
												if (result.status === 'TRIGGER_COMBAT') {
													onCancel();
												} else {
													setActionResult(result);
												}
											}}
										>
											Attempt Evasion
										</button>
									)}
									<button
										className={styles.btnExecute}
										onClick={() => onForceCombat(npcTarget, actionResult.combatRule)}
									>
										Defend Yourself
									</button>
								</>
							)
						) : (
							<button
								className={styles.btnExecute}
								onClick={onCancel}
							>
								Continue
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	// --- PREVIEW / DECISION SCREEN ---
	let silverCost = actionDef.goldCoinBaseCost ? Math.floor(actionDef.goldCoinBaseCost * regionalExchangeRate) : 0;
	let foodCost = actionTag === 'Rest_Road' ? 1 : 0;

	let isActionInvalid = false;
	let invalidReason = '';

	const isDonateCoin = actionTag === 'Donate_Coin';
	const isDonateFood = actionTag === 'Donate_Food';
	const isSlidingAction = isDonateCoin || isDonateFood;

	const maxSliderValue = isDonateCoin ? player.inventory.silverCoins : isDonateFood ? player.inventory.food : 0;

	let dynamicHon = 0;
	let dynamicRen = 0;

	if (isDonateCoin) {
		dynamicHon = Math.floor(sliderValue / WORLD.MORALITY.actions.donateCoinHonDivisor);
		dynamicRen = Math.floor(sliderValue / WORLD.MORALITY.actions.donateCoinRenDivisor);
	} else if (isDonateFood) {
		dynamicHon = Math.floor(sliderValue / WORLD.MORALITY.actions.donateFoodHonDivisor);
		dynamicRen = Math.floor(sliderValue / WORLD.MORALITY.actions.donateFoodRenDivisor);
	} else if (actionTag === 'Donate_Pray') {
		dynamicHon = WORLD.MORALITY.actions.donatePrayHonBonus;
		dynamicRen = WORLD.MORALITY.actions.donatePrayRenBonus;
	}

	if (actionTag.startsWith('Train_')) {
		const playerRank = player.identity.rank || 1;
		silverCost = silverCost * playerRank;

		const statKey = actionTag.split('_')[1].toLowerCase();
		const playerRankIndex = playerRank - 1;
		const currentCap = WORLD.PLAYER.trainingCaps[statKey][playerRankIndex];

		if (player.stats[statKey] >= currentCap) {
			isActionInvalid = true;
			invalidReason = `Training capped for Rank ${playerRank}. Reach higher rank to continue.`;
		}
	} else if (actionTag === 'Heal_Mount') {
		const mount = player.equipment?.mountItem;
		if (!mount) {
			isActionInvalid = true;
			invalidReason = 'You do not have an active mount.';
			silverCost = 0;
		} else {
			const missingHp = mount.biology.hpMax - mount.biology.hpCurrent;
			if (missingHp <= 0) {
				isActionInvalid = true;
				invalidReason = 'Mount is already at maximum health.';
				silverCost = 0;
			} else {
				const costFactor = actionDef.dynamicCostFactor || 50;
				silverCost = Math.floor(silverCost + (silverCost / costFactor) * missingHp);
			}
		}
	} else if (actionTag === 'Heal_Player' || actionTag === 'Rest_Road') {
		const missingHp = player.biology.hpMax - player.biology.hpCurrent;
		if (missingHp <= 0) {
			isActionInvalid = true;
			invalidReason = 'Already at maximum operational HP.';
			silverCost = 0;
		} else if (actionTag === 'Heal_Player') {
			const costFactor = actionDef.dynamicCostFactor || 50;
			silverCost = Math.floor(silverCost + (silverCost / costFactor) * missingHp);
		}
	} else if (actionTag === 'Cure_Player') {
		const hardCap = WORLD.PLAYER.hpLimits.hardCap;
		const missingHpMax = hardCap - player.biology.hpMax;
		if (missingHpMax <= 0) {
			isActionInvalid = true;
			invalidReason = 'No permanent wounds to cure.';
			silverCost = 0;
		} else {
			const costFactor = actionDef.dynamicCostFactor || 50;
			silverCost = Math.floor(silverCost + (silverCost / costFactor) * missingHpMax);
		}
	}

	const silverYield = actionDef.goldCoinBaseYield ? actionDef.goldCoinBaseYield * regionalExchangeRate : 0;
	const hasSufficientAp = player.progression.actionPoints >= actionDef.apCost;
	const hasSufficientCoins = player.inventory.silverCoins >= silverCost;
	const hasSufficientFood = player.inventory.food >= foodCost;

	// Actions that require probability assessment
	const requiresSkillCheck = [
		'Target_Assassination',
		'Target_Robbery',
		'Target_Steal_Coin',
		'Target_Steal_Food',
		'Target_Steal_Animal',
		'Hunt_Animal',
		'Evade_Animal',
		'Evade_Monster',
		'Evade_Nephilim',
		'Combat_Ambush',
	].includes(actionTag);

	let successChance = 100;
	let failConsequence = 'None';

	const pRank = player.identity?.rank || 1;
	const nRank = npcTarget?.classification?.entityRank || npcTarget?.classification?.poiRank || 1;

	if (requiresSkillCheck && npcTarget) {
		const pAgi = player.stats.agi || 10;
		const nAgi = npcTarget.stats?.agi || 10;
		const nInt = npcTarget.stats?.int || 10;
		const rankDelta = Math.max(0, nRank - pRank);
		const checkConfig = WORLD.INTERACTION.skillChecks[actionTag];

		if (checkConfig) {
			if (actionTag === 'Target_Steal_Coin' || actionTag === 'Target_Steal_Food') {
				successChance = checkConfig.baseChance + (pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				failConsequence = 'Normal Combat (Brawl)';
			} else if (actionTag === 'Target_Robbery') {
				successChance = checkConfig.baseChance + (pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				failConsequence = 'Lethal Combat (Deathmatch)';
			} else if (actionTag === 'Target_Assassination' || actionTag === 'Combat_Ambush') {
				successChance = checkConfig.baseChance + (pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
				failConsequence = 'Lethal Combat (Deathmatch)';
			} else if (actionTag === 'Hunt_Animal') {
				successChance = checkConfig.baseChance + (pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
				if (npcTarget.behavior?.behaviorState === 'Hostile') {
					failConsequence = 'Animal Attacks (Deathmatch)';
				} else {
					failConsequence = 'Animal Escapes (No Combat)';
				}
			} else if (actionTag === 'Target_Steal_Animal') {
				successChance = checkConfig.baseChance + (pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				failConsequence = 'Guards Alerted / Animal Attacks (Combat)';
			} else if (actionTag === 'Evade_Animal' || actionTag === 'Evade_Monster' || actionTag === 'Evade_Nephilim') {
				successChance = checkConfig.baseChance + (pAgi - nAgi) * 2 - rankDelta * checkConfig.rankPenalty;
				failConsequence = 'Lethal Combat (Deathmatch)';
			}
			successChance = Math.max(checkConfig.minChance, Math.min(checkConfig.maxChance, successChance));
		}
	}

	// Define actions that trigger combat assessment
	const isCombatAction =
		(actionDef.executionRoute === 'ROUTE_COMBAT' || actionTag.includes('Combat_') || actionTag === 'Target_Assassination') && !actionTag.includes('Evade');
	let combatRuleTitle = '';
	let combatRuleDesc = '';
	let threatLabel = '';
	let threatColor = '';

	// Morality UI states
	let lethalCons = null;
	let nonLethalCons = null;
	let moralityBorderClass = styles.moralityBorderNeutral;
	let moralityTextClass = styles.moralityTextNeutral;
	let titleText = 'COMBAT ENCOUNTER';

	const showsCombatAssessment = isCombatAction || ['Target_Steal_Coin', 'Target_Steal_Food', 'Target_Robbery'].includes(actionTag);

	// Declare variable in outer scope for UI accessibility
	let resolvedCombatRule = actionDef.combatRule;
	let expectedHon = 0;
	let expectedRen = 0;

	if (showsCombatAssessment && npcTarget) {
		const rankDiff = pRank - nRank;
		if (rankDiff >= 1) {
			threatLabel = 'Trivial (Lower Rank)';
			threatColor = '#4ade80';
		} else if (rankDiff === 0) {
			threatLabel = 'Even Match (Equal Rank)';
			threatColor = '#60a5fa';
		} else if (rankDiff === -1) {
			threatLabel = 'High Threat (+1 Rank)';
			threatColor = '#fbbf24';
		} else {
			threatLabel = 'Deadly (+2 Rank or higher)';
			threatColor = '#f87171';
		}

		// Determine combat type on stealth failure
		if (!resolvedCombatRule) {
			if (actionTag === 'Target_Robbery' || actionTag === 'Target_Assassination' || actionTag === 'Combat_Ambush' || actionTag.includes('Evade')) {
				resolvedCombatRule = 'DMF';
			} else if (actionTag === 'Target_Steal_Coin' || actionTag === 'Target_Steal_Food') {
				resolvedCombatRule = 'NF';
			} else {
				resolvedCombatRule = 'DMF';
			}
		}

		switch (resolvedCombatRule) {
			case 'DMF':
				combatRuleTitle = 'Deathmatch (Lethal)';
				combatRuleDesc = `No surrender allowed. Fleeing is permitted. Fight to the death.`;
				break;
			case 'NF':
				combatRuleTitle = 'Normal Fight (Non-Lethal)';
				combatRuleDesc = `Combatants yield at ${WORLD.COMBAT.thresholds.normalSurrenderHp} HP. Fleeing is permitted. Lethal blows are avoided.`;
				break;
			case 'FF':
				combatRuleTitle = 'Friendly Fight (Non-Lethal)';
				combatRuleDesc = `Combatants yield at ${WORLD.COMBAT.thresholds.friendlySurrenderHp} HP. Fleeing is permitted. No lethal risk.`;
				break;
			default:
				combatRuleTitle = resolvedCombatRule;
				combatRuleDesc = 'Standard combat procedures apply.';
				break;
		}

		// Extract rewards directly from DB_COMBAT
		const entityCategory = npcTarget.classification?.entityCategory || 'Human';
		let outcomeKey = 'WIN_DEATH';
		if (resolvedCombatRule === 'FF' || resolvedCombatRule === 'NF') {
			outcomeKey = 'WIN_SURRENDER';
		}

		const combatConsequences = DB_COMBAT.resolutionConsequences[entityCategory]?.[resolvedCombatRule]?.[outcomeKey];
		if (combatConsequences) {
			expectedHon = combatConsequences.honModifier || 0;
			expectedRen = combatConsequences.renModifier || 0;
		}

		// Extract both scenarios for Preview
		lethalCons = calculateCombatMorality(npcTarget, 'DMF');
		nonLethalCons = calculateCombatMorality(npcTarget, 'NF');

		if (lethalCons.honorChange < 0) {
			moralityBorderClass = styles.moralityBorderBad;
			moralityTextClass = styles.moralityTextBad;
			titleText = '⚠️ CRIME WARNING';
		} else if (lethalCons.honorChange > 0) {
			moralityBorderClass = styles.moralityBorderGood;
			moralityTextClass = styles.moralityTextGood;
			titleText = '🛡️ SANCTIONED TARGET';
		}
	}

	// --- HP THRESHOLD WARNING ---
	let hasEnoughHp = true;
	let hpWarningMessage = '';

	if (requiresSkillCheck || isCombatAction) {
		let potentialCombatRule = actionDef.combatRule;

		if (!potentialCombatRule && requiresSkillCheck) {
			if (actionTag === 'Target_Robbery' || actionTag === 'Target_Assassination' || actionTag === 'Combat_Ambush' || actionTag.includes('Evade')) {
				potentialCombatRule = 'DMF';
			} else if (actionTag === 'Target_Steal_Coin' || actionTag === 'Target_Steal_Food') {
				potentialCombatRule = 'NF';
			}
		}

		// Validate against GameWorld limits
		if (potentialCombatRule === 'DMF' && player.biology.hpCurrent < WORLD.COMBAT.thresholds.baseHpDMF) {
			hasEnoughHp = false;
			hpWarningMessage = `Critically Wounded: Need ${WORLD.COMBAT.thresholds.baseHpDMF} HP to risk Lethal Combat.`;
		} else if (potentialCombatRule === 'FF' && player.biology.hpCurrent < WORLD.COMBAT.thresholds.baseHpFF) {
			hasEnoughHp = false;
			hpWarningMessage = `Too Wounded: Need ${WORLD.COMBAT.thresholds.baseHpFF} HP to safely Spar.`;
		}
	}

	let canExecute = hasSufficientAp && hasSufficientCoins && hasSufficientFood && !isActionInvalid && hasEnoughHp;
	if (isSlidingAction && sliderValue === 0) {
		canExecute = false;
	}

	const handleExecute = () => {
		if (!canExecute || isProcessing) return;
		setIsProcessing(true);

		const targetPayload = npcTarget ? npcTarget.entityId || npcTarget.id : 'environment';
		const result = onConfirm(actionTag, targetPayload, regionalExchangeRate, sliderValue);

		if (result.status === 'TRIGGER_COMBAT' || result.status === 'TRIGGER_DYNAMIC_EVENT') {
			onCancel();
		} else {
			setActionResult(result);
			setIsProcessing(false);
		}
	};

	let combatRuleColorClass = styles.textAccentGold;
	if (resolvedCombatRule === 'DMF') combatRuleColorClass = styles.textDanger;
	else if (resolvedCombatRule === 'NF') combatRuleColorClass = styles.textWarning;
	else if (resolvedCombatRule === 'FF') combatRuleColorClass = styles.textGood;

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<h2>{actionDef.id.replace(/_/g, ' ')}</h2>
					{actionDef.targetType === 'NPC' && npcTarget && <span className={styles.targetName}>Target: {npcTarget.entityName || npcTarget.name}</span>}
				</div>

				<div className={styles.descriptionBox}>
					<p>{actionDef.description}</p>
				</div>

				<div className={styles.requirementsGrid}>
					{isActionInvalid && (
						<div className={`${styles.reqItem} ${styles.unmet} ${styles.fullWidthReqItem}`}>
							<span className={styles.textDangerVar}>{invalidReason}</span>
						</div>
					)}
					<div className={`${styles.reqItem} ${hasSufficientAp ? styles.met : styles.unmet}`}>
						<span>AP Cost:</span>
						<span>
							{actionDef.apCost} (Current: {player.progression.actionPoints})
						</span>
					</div>

					{silverCost > 0 && !isSlidingAction && (
						<div className={`${styles.reqItem} ${hasSufficientCoins ? styles.met : styles.unmet}`}>
							<span>Coin Cost:</span>
							<span>
								{silverCost} (Current: {player.inventory.silverCoins})
							</span>
						</div>
					)}

					{foodCost > 0 && !isSlidingAction && (
						<div className={`${styles.reqItem} ${hasSufficientFood ? styles.met : styles.unmet}`}>
							<span>Food Cost:</span>
							<span>
								{foodCost} (Current: {player.inventory.food})
							</span>
						</div>
					)}

					{isSlidingAction && (
						<div className={`${styles.reqItem} ${styles.sliderReqItem}`}>
							<div className={styles.sliderHeader}>
								<span>
									Select Amount: <span className={styles.sliderValue}>{sliderValue}</span> {isDonateCoin ? 'Coins' : 'Food'}
								</span>
								<span className={styles.sliderMax}>Max: {maxSliderValue}</span>
							</div>
							<input
								type='range'
								min='0'
								max={maxSliderValue}
								value={sliderValue}
								onChange={(e) => setSliderValue(Number(e.target.value))}
								className={styles.sliderInput}
							/>
							{sliderValue > 0 && (
								<div className={styles.sliderResults}>
									<span className={styles.chanceGood}>+{dynamicHon} Honor</span>
									<span className={styles.chanceGood}>+{dynamicRen} Renown</span>
								</div>
							)}
						</div>
					)}

					{actionTag === 'Donate_Pray' && (
						<div className={`${styles.reqItem} ${styles.prayResults}`}>
							<span className={styles.chanceGood}>+{dynamicHon} Honor</span>
							<span className={styles.chanceGood}>+{dynamicRen} Renown</span>
						</div>
					)}

					{silverYield > 0 && (
						<div className={`${styles.reqItem} ${styles.yield}`}>
							<span>Coin Yield:</span>
							<span>+{silverYield}</span>
						</div>
					)}
				</div>

				{/* --- UNIFIED ASSESSMENT SECTION (TABS) --- */}
				{(requiresSkillCheck || (showsCombatAssessment && npcTarget)) && (
					<div className={styles.skillCheckSection}>
						{/* RENDER TABS ONLY IF BOTH ASSESSMENTS EXIST */}
						{requiresSkillCheck && showsCombatAssessment && npcTarget ? (
							<div className={styles.tabWrapper}>
								<button
									className={`${styles.tabButton} ${activeTab === 'RISK' ? styles.tabButtonActiveRisk : ''}`}
									onClick={() => setActiveTab('RISK')}
								>
									Risk Assessment
								</button>
								<button
									className={`${styles.tabButton} ${activeTab === 'COMBAT' ? styles.tabButtonActiveCombat : ''}`}
									onClick={() => setActiveTab('COMBAT')}
								>
									Combat Assessment
								</button>
							</div>
						) : (
							<h4 className={styles.riskHeader}>{requiresSkillCheck ? 'Risk Assessment' : 'Combat Assessment'}</h4>
						)}

						{/* TAB CONTENT: RISK ASSESSMENT */}
						{requiresSkillCheck && (activeTab === 'RISK' || !showsCombatAssessment || !npcTarget) && (
							<div>
								<div className={styles.riskRow}>
									<span>Success Probability:</span>
									<span className={successChance >= 50 ? styles.chanceGood : styles.chanceBad}>{successChance}%</span>
								</div>
								<div className={styles.riskRow}>
									<span>Failure Consequence:</span>
									<span className={styles.consequenceText}>{failConsequence}</span>
								</div>

								{/* Action Details */}
								{['Target_Steal_Coin', 'Target_Steal_Food', 'Target_Robbery', 'Target_Assassination', 'Combat_Ambush'].includes(actionTag) && (
									<div className={styles.actionDetailsBox}>
										{actionTag === 'Target_Steal_Coin' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> Steal between{' '}
												<span className={styles.textGood}>
													{WORLD.INTERACTION.stealthYields.coinMinPct * 100}%</span> and <span className={styles.textGood}> {WORLD.INTERACTION.stealthYields.coinMaxPct * 100}%
												</span>{' '}
												of target's available <span className={styles.textWarning}>coins</span>.
											</div>
										)}
										{actionTag === 'Target_Steal_Food' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> Steal between{' '}
												<span className={styles.textGood}>
													{WORLD.INTERACTION.stealthYields.foodMinPct * 100}% </span> and <span className={styles.textGood}>{WORLD.INTERACTION.stealthYields.foodMaxPct * 100}%
												</span>{' '}
												of target's available <span className={styles.textOrange}>food</span>.
											</div>
										)}
										{actionTag === 'Target_Robbery' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> Steal between{' '}
												<span className={styles.textGood}>
													{WORLD.INTERACTION.stealthYields.robberyMinPct * 100}% </span> and <span className={styles.textGood}> {WORLD.INTERACTION.stealthYields.robberyMaxPct * 100}%
												</span>{' '}
												of target's <span className={styles.textWarning}>coins</span> and <span className={styles.textOrange}>food</span>.
											</div>
										)}
										{actionTag === 'Combat_Ambush' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> Reduces target's current{' '}
												<span className={styles.textDanger}>HP</span> by{' '}
												<span className={styles.textGood}>{WORLD.INTERACTION.stealthYields.ambushHpReductionPct * 100}%</span> before combat
												initiates. No resources are stolen.
											</div>
										)}
										{actionTag === 'Target_Assassination' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> <span className={styles.textDanger}>Instantly kills</span>{' '}
												the target, transferring their <span className={styles.textEpic}>entire inventory and equipment</span>.
											</div>
										)}
									</div>
								)}
							</div>
						)}

						{/* TAB CONTENT: COMBAT ASSESSMENT */}
						{showsCombatAssessment && npcTarget && (activeTab === 'COMBAT' || !requiresSkillCheck) && (
							<div>
								<div className={styles.riskRow}>
									<span>Threat Level:</span>
									<span style={{ color: threatColor, fontWeight: 'bold' }}>{threatLabel}</span>
								</div>
								<div className={styles.riskRow}>
									<span>Target HP:</span>
									<span className={styles.textWhite}>{npcTarget.biology?.hpCurrent || '?'}</span>
								</div>

								{/* COMBAT TYPE & RULES */}
								<div className={styles.riskRow}>
									<span>Combat Type:</span>
									<span className={`${styles.combatTypeRule} ${combatRuleColorClass}`}>{combatRuleTitle}</span>
								</div>

								<div className={`${styles.riskRow} ${styles.combatRuleWrapper}`}>
									<span>Combat Rules:</span>
									<div className={styles.combatRuleTextWrapper}>
										<span className={styles.combatRuleText}>{combatRuleDesc}</span>
									</div>
								</div>

								{/* Expected Victory Spoils */}
								<div className={styles.victorySpoilsWrapper}>
									<span className={styles.victorySpoilsTitle}>Expected Victory Spoils</span>
									<div className={styles.victorySpoilsStats}>
										<span className={expectedHon > 0 ? styles.chanceGood : expectedHon < 0 ? styles.chanceBad : styles.chanceNeutral}>
											Honor: {expectedHon > 0 ? '+' : ''}
											{expectedHon}
										</span>
										<span className={expectedRen > 0 ? styles.chanceGood : expectedRen < 0 ? styles.chanceBad : styles.chanceNeutral}>
											Renown: {expectedRen > 0 ? '+' : ''}
											{expectedRen}
										</span>
									</div>
								</div>

								{/* Split View for Combat Morality */}
								{lethalCons && nonLethalCons && (
									<div className={`${styles.moralityContainer} ${moralityBorderClass}`}>
										<div className={`${styles.moralityTitle} ${moralityTextClass}`}>{titleText}</div>
										<div className={`${styles.moralityRow} ${styles.moralityRowBordered}`}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>On Engagement (Assault)</span>
												<span className={styles.moralityRowValue}>{nonLethalCons.label || 'Standard Encounter'}</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span
													className={
														nonLethalCons.honorChange > 0
															? styles.chanceGood
															: nonLethalCons.honorChange < 0
																? styles.chanceBad
																: styles.chanceNeutral
													}
												>
													H: {nonLethalCons.honorChange > 0 ? '+' : ''}
													{nonLethalCons.honorChange}
												</span>
												<span
													className={
														nonLethalCons.renownChange > 0
															? styles.chanceGood
															: nonLethalCons.renownChange < 0
																? styles.chanceBad
																: styles.chanceNeutral
													}
												>
													R: {nonLethalCons.renownChange > 0 ? '+' : ''}
													{nonLethalCons.renownChange}
												</span>
											</div>
										</div>
										<div className={styles.moralityRow}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>If Target is Killed</span>
												<span className={styles.moralityRowValue}>{lethalCons.label || 'Standard Kill'}</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span
													className={
														lethalCons.honorChange > 0 ? styles.chanceGood : lethalCons.honorChange < 0 ? styles.chanceBad : styles.chanceNeutral
													}
												>
													H: {lethalCons.honorChange > 0 ? '+' : ''}
													{lethalCons.honorChange}
												</span>
												<span
													className={
														lethalCons.renownChange > 0
															? styles.chanceGood
															: lethalCons.renownChange < 0
																? styles.chanceBad
																: styles.chanceNeutral
													}
												>
													R: {lethalCons.renownChange > 0 ? '+' : ''}
													{lethalCons.renownChange}
												</span>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{!hasEnoughHp && <div className={styles.hpWarning}>⚠️ {hpWarningMessage}</div>}

				<div className={styles.actionSection}>
					<button
						className={styles.btnCancel}
						onClick={onCancel}
						disabled={isProcessing}
					>
						Abort
					</button>
					<button
						className={styles.btnExecute}
						onClick={handleExecute}
						disabled={!canExecute || isProcessing}
					>
						{isProcessing ? 'Executing...' : isCombatAction ? 'Engage' : 'Proceed'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default InstantActionView;
