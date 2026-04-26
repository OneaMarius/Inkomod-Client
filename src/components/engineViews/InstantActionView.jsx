// File: Client/src/components/engineViews/InstantActionView.jsx

import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import { WORLD } from '../../data/GameWorld.js';
import styles from '../../styles/InstantActionView.module.css';
import { calculateCombatMorality } from '../../utils/MoralityCalculator.js';

const InstantActionView = ({ actionTag, npcTarget, onCancel, onConfirm, onForceCombat }) => {
	const player = useGameState((state) => state.gameState.player);
	const regionalExchangeRate = useGameState((state) => state.gameState.location.regionalExchangeRate);

	const [isProcessing, setIsProcessing] = useState(false);
	const [actionResult, setActionResult] = useState(null);
	const [sliderValue, setSliderValue] = useState(0);

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
										<p
											className={styles.statLabel}
											style={{ opacity: 0.6, fontSize: '0.9rem' }}
										>
											Health already at maximum.
										</p>
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

								{/* 2. TEXTUL BONUSULUI (Centrat, așezat sub câștigurile normale) */}
								{actionResult.bonusMessage && (
									<p
										style={{
											fontStyle: 'italic',
											marginTop: '15px',
											marginBottom: '10px',
											fontSize: '1rem',
											color: '#60a5fa',
											textAlign: 'center' /* Aceasta centrează textul */,
										}}
									>
										"{actionResult.bonusMessage}"
									</p>
								)}

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
			} else if (actionTag === 'Target_Assassination') {
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

	// --- FIX: Includem explicit acțiunile de Ambush și Assassination ---
	const isCombatAction =
		(actionDef.executionRoute === 'ROUTE_COMBAT' || actionTag.includes('Combat_') || actionTag === 'Target_Assassination') && !actionTag.includes('Evade');
	let combatRuleTitle = '';
	let combatRuleDesc = '';
	let threatLabel = '';
	let threatColor = '';

	// --- Variabile pentru UI Moralitate ---
	let expectedConsequences = null;
	let borderColor = '#888';
	let textColor = '#aaa';
	let titleText = 'COMBAT ENCOUNTER';

	if (isCombatAction && npcTarget) {
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

		// Asigurăm un fallback pentru Ambush/Assassination care poate nu au combatRule definit
		const resolvedCombatRule = actionDef.combatRule || 'DMF';

		switch (resolvedCombatRule) {
			case 'DMF':
				combatRuleTitle = 'Deathmatch (Lethal)';
				combatRuleDesc = `No surrender. Fleeing only possible below ${WORLD.COMBAT.thresholds.deathmatchFleeHp} HP.`;
				break;
			case 'NF':
				combatRuleTitle = 'Normal Fight (Standard)';
				combatRuleDesc = `Combatants will yield at ${WORLD.COMBAT.thresholds.normalSurrenderHp} HP. Lethal blows are avoided.`;
				break;
			case 'FF':
				combatRuleTitle = 'Sparring / Friendly (Non-Lethal)';
				combatRuleDesc = `Training bout. Combat ends at ${WORLD.COMBAT.thresholds.friendlySurrenderHp} HP. Absolutely no lethal risk.`;
				break;
			default:
				combatRuleTitle = resolvedCombatRule;
				combatRuleDesc = 'Standard combat procedures apply.';
				break;
		}

		// --- NOU: Calculăm moralitatea înainte de luptă ---
		expectedConsequences = calculateCombatMorality(npcTarget, resolvedCombatRule);

		if (expectedConsequences.honorChange < 0) {
			if (resolvedCombatRule === 'DMF' || actionTag === 'Target_Assassination') {
				// Crimă Letală
				borderColor = '#ef4444'; // Red
				textColor = '#ef4444';
				titleText = '⚠️ CRIME WARNING (LETHAL)';
			} else {
				// Infracțiune Non-Letală (Assault, Brawl)
				borderColor = '#fbbf24'; // Orange/Amber
				textColor = '#fbbf24';
				titleText = '⚠️ INFRACTION (ASSAULT)';
			}
		} else if (expectedConsequences.honorChange > 0) {
			borderColor = '#10b981'; // Green
			textColor = '#10b981';
			titleText = '🛡️ SANCTIONED TARGET';
		}
	}

	let canExecute = hasSufficientAp && hasSufficientCoins && hasSufficientFood && !isActionInvalid;
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
						<div
							className={`${styles.reqItem} ${styles.unmet}`}
							style={{ gridColumn: '1 / -1', justifyContent: 'center' }}
						>
							<span style={{ color: 'var(--danger-red)' }}>{invalidReason}</span>
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
						<div
							className={styles.reqItem}
							style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}
						>
							<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
								<span>
									Select Amount: <span style={{ color: 'var(--accent-gold)' }}>{sliderValue}</span> {isDonateCoin ? 'Coins' : 'Food'}
								</span>
								<span style={{ opacity: 0.6 }}>Max: {maxSliderValue}</span>
							</div>
							<input
								type='range'
								min='0'
								max={maxSliderValue}
								value={sliderValue}
								onChange={(e) => setSliderValue(Number(e.target.value))}
								style={{ width: '100%', cursor: 'pointer' }}
							/>
							{sliderValue > 0 && (
								<div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '5px' }}>
									<span className={styles.chanceGood}>+{dynamicHon} Honor</span>
									<span className={styles.chanceGood}>+{dynamicRen} Renown</span>
								</div>
							)}
						</div>
					)}

					{actionTag === 'Donate_Pray' && (
						<div
							className={styles.reqItem}
							style={{ gridColumn: '1 / -1', justifyContent: 'center', gap: '20px' }}
						>
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

				{requiresSkillCheck && (
					<div className={styles.skillCheckSection}>
						<h4 className={styles.riskHeader}>Risk Assessment</h4>
						<div className={styles.riskRow}>
							<span>Success Probability:</span>
							<span className={successChance >= 50 ? styles.chanceGood : styles.chanceBad}>{successChance}%</span>
						</div>
						<div className={styles.riskRow}>
							<span>Failure Consequence:</span>
							<span className={styles.consequenceText}>{failConsequence}</span>
						</div>
					</div>
				)}

				{isCombatAction && npcTarget && (
					<div className={styles.skillCheckSection}>
						<h4 className={styles.riskHeader}>Combat Assessment</h4>

						<div className={styles.riskRow}>
							<span>Threat Level:</span>
							<span style={{ color: threatColor, fontWeight: 'bold' }}>{threatLabel}</span>
						</div>

						<div
							className={styles.riskRow}
							style={{ alignItems: 'flex-start' }}
						>
							<span>Rules of Engagement:</span>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
								<span style={{ color: 'var(--accent-gold)' }}>{combatRuleTitle}</span>
								<span style={{ fontSize: '0.85rem', opacity: 0.8, maxWidth: '200px', marginTop: '4px' }}>{combatRuleDesc}</span>
							</div>
						</div>

						{/* --- NOU: PANOUL DINAMIC DE MORALITATE --- */}
						{expectedConsequences && (
							<div
								style={{
									border: `1px solid ${borderColor}`,
									backgroundColor: '#111',
									padding: '15px',
									borderRadius: '4px',
									textAlign: 'center',
									marginTop: '15px',
								}}
							>
								<div
									style={{ color: textColor, fontFamily: '"VT323", monospace', fontSize: '1.4rem', marginBottom: '10px', textTransform: 'uppercase' }}
								>
									{titleText}
								</div>

								<div style={{ color: '#ccc', fontSize: '1rem', marginBottom: '10px' }}>
									{
										/* FIX: Folosim .label în loc de .crimeLabel */
										expectedConsequences.label
											? `Engaging this target is considered: ${expectedConsequences.label}.`
											: 'This target is considered fair game.'
									}
								</div>

								<div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontFamily: '"VT323", monospace', fontSize: '1.2rem' }}>
									{expectedConsequences.honorChange !== 0 && (
										<span style={{ color: expectedConsequences.honorChange > 0 ? '#10b981' : '#ef4444' }}>
											Honor: {expectedConsequences.honorChange > 0 ? '+' : ''}
											{expectedConsequences.honorChange}
										</span>
									)}

									{expectedConsequences.renownChange !== 0 && (
										<span style={{ color: expectedConsequences.renownChange > 0 ? '#10b981' : '#ef4444' }}>
											Renown: {expectedConsequences.renownChange > 0 ? '+' : ''}
											{expectedConsequences.renownChange}
										</span>
									)}

									{expectedConsequences.honorChange === 0 && expectedConsequences.renownChange === 0 && (
										<span style={{ color: '#888' }}>No significant reputation changes expected.</span>
									)}
								</div>
							</div>
						)}
					</div>
				)}

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
