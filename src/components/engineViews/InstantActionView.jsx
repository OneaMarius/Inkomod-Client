// File: Client/src/components/engineViews/InstantActionView.jsx

import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import { WORLD } from '../../data/GameWorld.js';
import styles from '../../styles/InstantActionView.module.css';
import { calculateRiskAndCombatScenarios } from '../../utils/UnifiedMoralityCalculator.js';

const InstantActionView = ({ actionTag, npcTarget, onCancel, onConfirm, onForceCombat }) => {
	const player = useGameState((state) => state.gameState.player);
	const regionalExchangeRate = useGameState((state) => state.gameState.location.regionalExchangeRate);

	const [isProcessing, setIsProcessing] = useState(false);
	const [actionResult, setActionResult] = useState(null);
	const [sliderValue, setSliderValue] = useState(0);
	const [activeTab, setActiveTab] = useState('RISK');

	const actionDef = DB_INTERACTION_ACTIONS[actionTag];
	if (!actionDef || !player) return null;

	// Safety check
	if (actionDef.targetType === 'NPC' && !npcTarget) return null;

	if (actionResult) {
		if (actionResult.status === 'TRIGGER_COMBAT' || actionResult.status === 'TRIGGER_DYNAMIC_EVENT') {
			onCancel(false);
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
						{!isSuccess && !isRiskFailure && <p className={styles.chanceBad}>ERROR: {actionResult.status}</p>}
					</div>

					<div className={styles.actionSection}>
						{isRiskFailure ? (
							actionResult.status === 'FAILED_ESCAPE' ? (
								<button
									className={styles.btnExecute}
									onClick={() => onCancel(false)}
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
													onCancel(false);
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
								onClick={() => onCancel(false)}
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

	// Definim rank-urile chiar de la început
	const pRank = player.identity?.rank || 1;
	const nRank = npcTarget?.classification?.entityRank || npcTarget?.classification?.poiRank || 1;

	let silverCost = actionDef.goldCoinBaseCost ? Math.floor(actionDef.goldCoinBaseCost * regionalExchangeRate) : 0;
	if (actionTag === 'Target_Bribe') {
		silverCost = nRank * 15 * regionalExchangeRate;
	}
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

	const requiresSkillCheck = [
		'Target_Assassination',
		'Target_Robbery',
		'Target_Steal_Coin',
		'Target_Steal_Food',
		'Target_Steal_Animal',
		'Target_Bribe',
		'Hunt_Animal',
		'Evade_Animal',
		'Evade_Monster',
		'Evade_Nephilim',
		'Target_Ambush',
		'Ambush_Animal',
		'Ambush_Monster',
		'Ambush_Nephilim',
	].includes(actionTag);

	let successChance = 100;
	let failConsequence = 'None';

	let resolvedCombatRule = actionDef.combatRule;

	if (requiresSkillCheck || actionDef.executionRoute === 'ROUTE_COMBAT' || actionTag.includes('Combat_')) {
		if (!resolvedCombatRule) {
			if (actionTag === 'Target_Robbery' || actionTag === 'Target_Assassination' || actionTag === 'Target_Ambush' || actionTag.includes('Evade')) {
				resolvedCombatRule = 'DMF';
			} else if (actionTag === 'Target_Steal_Coin' || actionTag === 'Target_Steal_Food') {
				resolvedCombatRule = 'NF';
			} else {
				resolvedCombatRule = 'DMF';
			}
		}
	}

	let unifiedScenarios = null;
	const showsCombatAssessment =
		(actionDef.executionRoute === 'ROUTE_COMBAT' ||
			actionTag.includes('Combat_') ||
			actionTag === 'Target_Assassination' ||
			['Target_Steal_Coin', 'Target_Steal_Food', 'Target_Robbery'].includes(actionTag) ||
			actionTag.includes('Ambush')) &&
		!actionTag.includes('Evade');

	if (npcTarget && (requiresSkillCheck || showsCombatAssessment)) {
		unifiedScenarios = calculateRiskAndCombatScenarios(actionTag, npcTarget, resolvedCombatRule || 'DMF');
	}

if (requiresSkillCheck && npcTarget) {
		const pAgi = player.stats.agi || 10;
		const nAgi = npcTarget.stats?.agi || 10;
		const nInt = npcTarget.stats?.int || 10;
		const rankDelta = Math.max(0, nRank - pRank);
		const checkConfig = WORLD.INTERACTION.skillChecks[actionTag];

		if (actionTag === 'Target_Bribe') {
			// Calcul independent pentru mită, nu necesită checkConfig
			const pInt = player.stats?.int || 10;
			const pHonor = player.progression?.honor || 0;
			const pRenown = player.progression?.renown || 0;
			const rawCha = Math.floor(pHonor / 10 + pRenown / 20 + pInt / 2);
			const totalCha = Math.max(1, Math.min(50, rawCha));
			
			successChance = 50 + ((totalCha - nInt) * 3) - (rankDelta * 10);
			successChance = Math.max(10, Math.min(95, successChance));
			failConsequence = 'Silver Confiscated, Target Hostile (Event)';

		} else if (checkConfig) {
			// Calcul pentru restul acțiunilor de stealth (care folosesc checkConfig)
			if (actionTag === 'Target_Steal_Coin' || actionTag === 'Target_Steal_Food') {
				successChance = checkConfig.baseChance + (pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				failConsequence = 'Normal Combat (Brawl)';
			} else if (actionTag === 'Target_Robbery') {
				successChance = checkConfig.baseChance + (pAgi - nInt) * 2 - rankDelta * checkConfig.rankPenalty;
				failConsequence = 'Lethal Combat (Deathmatch)';
			} else if (actionTag === 'Target_Assassination' || actionTag.includes('Ambush')) {
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

	const isCombatAction =
		(actionDef.executionRoute === 'ROUTE_COMBAT' || actionTag.includes('Combat_') || actionTag === 'Target_Assassination') && !actionTag.includes('Evade');

	let combatRuleTitle = '';
	let combatRuleDesc = '';
	let threatLabel = '';
	let threatColor = '';

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
	}

	let hasEnoughHp = true;
	let hpWarningMessage = '';

	if (requiresSkillCheck || isCombatAction) {
		if (resolvedCombatRule === 'DMF' && player.biology.hpCurrent < WORLD.COMBAT.thresholds.baseHpDMF) {
			hasEnoughHp = false;
			hpWarningMessage = `Critically Wounded: Need ${WORLD.COMBAT.thresholds.baseHpDMF} HP to risk Lethal Combat.`;
		} else if (resolvedCombatRule === 'FF' && player.biology.hpCurrent < WORLD.COMBAT.thresholds.baseHpFF) {
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

		// DEBUG LOGS
		// console.log('=== EXECUTE BUTTON PRESSED ===');
		// console.log('1. Action Tag:', actionTag);
		// console.log('2. Raw NPC Object:', npcTarget);
		// console.log(
		// 	'3. Evaluated ID to send:',
		// 	npcTarget ? npcTarget.entityId || npcTarget.id : 'environment',
		// );

		let targetPayload = 'environment';
		if (npcTarget) {
			targetPayload = npcTarget.entityId || npcTarget.id || 'environment';
		}

		// console.log('3. Evaluated Payload Sent to Engine:', targetPayload);

		const result = onConfirm(actionTag, targetPayload, regionalExchangeRate, sliderValue);

		// console.log('4. Engine Result received:', result);

		if (result.status === 'TRIGGER_COMBAT' || result.status === 'TRIGGER_DYNAMIC_EVENT') {
			onCancel(false);
		} else {
			setActionResult(result);
			setIsProcessing(false);
		}
	};

	let combatRuleColorClass = styles.textAccentGold;
	if (resolvedCombatRule === 'DMF') combatRuleColorClass = styles.textDanger;
	else if (resolvedCombatRule === 'NF') combatRuleColorClass = styles.textWarning;
	else if (resolvedCombatRule === 'FF') combatRuleColorClass = styles.textGood;

	const getStatColor = (val) => {
		if (val > 0) return styles.chanceGood;
		if (val < 0) return styles.chanceBad;
		return styles.chanceNeutral;
	};

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

				{(requiresSkillCheck || (showsCombatAssessment && npcTarget)) && (
					<div className={styles.skillCheckSection}>
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

						{requiresSkillCheck && (activeTab === 'RISK' || !showsCombatAssessment || !npcTarget) && (
							<div>
								<div className={styles.riskRow}>
									<span>Success Probability:</span>
									<span className={successChance >= 50 ? styles.chanceGood : styles.chanceBad}>{successChance}%</span>
								</div>
								<div className={styles.riskRow}>
									<span>Failure Escalation:</span>
									<span className={styles.consequenceText}>{failConsequence}</span>
								</div>

								{unifiedScenarios && actionTag !== 'Target_Bribe' && (
									<div
										className={styles.moralityContainer}
										style={{ marginTop: '15px', borderColor: '#333' }}
									>
										<div
											className={styles.moralityTitle}
											style={{ color: '#aaa' }}
										>
											PREDICTED MORAL IMPACT
										</div>

										<div className={`${styles.moralityRow} ${styles.moralityRowBordered}`}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>V1: If Successful (Stealth)</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span
													className={getStatColor(unifiedScenarios.v1_Success.honor)}
													style={{ whiteSpace: 'nowrap' }}
												>
													H: {unifiedScenarios.v1_Success.honor > 0 ? '+' : ''}
													{unifiedScenarios.v1_Success.honor}
												</span>
												<span
													className={getStatColor(unifiedScenarios.v1_Success.renown)}
													style={{ whiteSpace: 'nowrap' }}
												>
													R: {unifiedScenarios.v1_Success.renown > 0 ? '+' : ''}
													{unifiedScenarios.v1_Success.renown}
												</span>
											</div>
										</div>

										<div className={styles.moralityRow}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>V2: If Caught & Flee Immediately</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span
													className={getStatColor(unifiedScenarios.v2_CaughtAndFlee.honor)}
													style={{ whiteSpace: 'nowrap' }}
												>
													H: {unifiedScenarios.v2_CaughtAndFlee.honor > 0 ? '+' : ''}
													{unifiedScenarios.v2_CaughtAndFlee.honor}
												</span>
												<span
													className={getStatColor(unifiedScenarios.v2_CaughtAndFlee.renown)}
													style={{ whiteSpace: 'nowrap' }}
												>
													R: {unifiedScenarios.v2_CaughtAndFlee.renown > 0 ? '+' : ''}
													{unifiedScenarios.v2_CaughtAndFlee.renown}
												</span>
											</div>
										</div>
									</div>
								)}

								{/* --- PREDICȚIA MORALĂ PENTRU MITĂ --- */}
								{actionTag === 'Target_Bribe' && (
									<div
										className={styles.moralityContainer}
										style={{ marginTop: '15px', borderColor: '#333' }}
									>
										<div
											className={styles.moralityTitle}
											style={{ color: '#aaa' }}
										>
											PREDICTED MORAL IMPACT
										</div>

										<div className={`${styles.moralityRow} ${styles.moralityRowBordered}`}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>If Successful</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span
													className={styles.chanceBad}
													style={{ whiteSpace: 'nowrap' }}
												>
													H: -{Math.floor(silverCost / (WORLD.MORALITY.actions.bribeCoinHonDivisor || 25))}
												</span>
												<span
													className={styles.chanceGood}
													style={{ whiteSpace: 'nowrap' }}
												>
													R: +{Math.floor(silverCost / (WORLD.MORALITY.actions.bribeCoinRenDivisor || 15))}
												</span>
											</div>
										</div>

										<div className={styles.moralityRow}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>If Rejected (Caught)</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span
													className={styles.chanceBad}
													style={{ whiteSpace: 'nowrap' }}
												>
													H: {WORLD.MORALITY.actions.Target_Bribe?.failure?.honorChange || -10}
												</span>
												<span
													className={styles.chanceBad}
													style={{ whiteSpace: 'nowrap' }}
												>
													R: {WORLD.MORALITY.actions.Target_Bribe?.failure?.renownChange || -5}
												</span>
											</div>
										</div>
									</div>
								)}

								{(['Target_Steal_Coin', 'Target_Steal_Food', 'Target_Robbery', 'Target_Assassination'].includes(actionTag) ||
									actionTag.includes('Ambush')) && (
									<div className={styles.actionDetailsBox}>
										{actionTag === 'Target_Bribe' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> The target accepts your illicit coin. Their hostility is{' '}
												<span className={styles.textGood}>neutralized</span>, allowing safe passage or interaction.
											</div>
										)}
										{actionTag === 'Target_Steal_Coin' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> Steal between{' '}
												<span className={styles.textGood}>{WORLD.INTERACTION.stealthYields.coinMinPct * 100}%</span> and{' '}
												<span className={styles.textGood}> {WORLD.INTERACTION.stealthYields.coinMaxPct * 100}%</span> of target's available{' '}
												<span className={styles.textWarning}>coins</span>.
											</div>
										)}
										{actionTag === 'Target_Steal_Food' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> Steal between{' '}
												<span className={styles.textGood}>{WORLD.INTERACTION.stealthYields.foodMinPct * 100}% </span> and{' '}
												<span className={styles.textGood}>{WORLD.INTERACTION.stealthYields.foodMaxPct * 100}%</span> of target's available{' '}
												<span className={styles.textOrange}>food</span>.
											</div>
										)}
										{actionTag === 'Target_Robbery' && (
											<div className={styles.actionDetailRow}>
												<span className={styles.textAccentGold}>Success Result:</span> Steal between{' '}
												<span className={styles.textGood}>{WORLD.INTERACTION.stealthYields.robberyMinPct * 100}% </span> and{' '}
												<span className={styles.textGood}> {WORLD.INTERACTION.stealthYields.robberyMaxPct * 100}%</span> of target's{' '}
												<span className={styles.textWarning}>coins</span> and <span className={styles.textOrange}>food</span>.
											</div>
										)}
										{actionTag.includes('Ambush') && (
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

								{unifiedScenarios && (
									<div
										className={styles.moralityContainer}
										style={{ marginTop: '15px', borderColor: '#333' }}
									>
										<div
											className={styles.moralityTitle}
											style={{ color: '#f87171' }}
										>
											V3: COMBAT RESOLUTION (CUMULATIVE)
										</div>

										<div className={`${styles.moralityRow} ${styles.moralityRowBordered}`}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>Victory (Lethal)</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span className={getStatColor(unifiedScenarios.v3_Combat.lethalWin.honor)}>
													H: {unifiedScenarios.v3_Combat.lethalWin.honor > 0 ? '+' : ''}
													{unifiedScenarios.v3_Combat.lethalWin.honor}
												</span>
												<span className={getStatColor(unifiedScenarios.v3_Combat.lethalWin.renown)}>
													R: {unifiedScenarios.v3_Combat.lethalWin.renown > 0 ? '+' : ''}
													{unifiedScenarios.v3_Combat.lethalWin.renown}
												</span>
											</div>
										</div>

										<div className={`${styles.moralityRow} ${styles.moralityRowBordered}`}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>Victory (NPC Flees/Yields)</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span className={getStatColor(unifiedScenarios.v3_Combat.nonLethalWin.honor)}>
													H: {unifiedScenarios.v3_Combat.nonLethalWin.honor > 0 ? '+' : ''}
													{unifiedScenarios.v3_Combat.nonLethalWin.honor}
												</span>
												<span className={getStatColor(unifiedScenarios.v3_Combat.nonLethalWin.renown)}>
													R: {unifiedScenarios.v3_Combat.nonLethalWin.renown > 0 ? '+' : ''}
													{unifiedScenarios.v3_Combat.nonLethalWin.renown}
												</span>
											</div>
										</div>

										<div className={styles.moralityRow}>
											<div className={styles.moralityRowTextWrapper}>
												<span className={styles.moralityRowTitle}>Defeat (Player Flees/Yields)</span>
											</div>
											<div className={styles.moralityRowStats}>
												<span className={getStatColor(unifiedScenarios.v3_Combat.defeatFlee.honor)}>
													H: {unifiedScenarios.v3_Combat.defeatFlee.honor > 0 ? '+' : ''}
													{unifiedScenarios.v3_Combat.defeatFlee.honor}
												</span>
												<span className={getStatColor(unifiedScenarios.v3_Combat.defeatFlee.renown)}>
													R: {unifiedScenarios.v3_Combat.defeatFlee.renown > 0 ? '+' : ''}
													{unifiedScenarios.v3_Combat.defeatFlee.renown}
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
						onClick={() => onCancel(true)}
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
