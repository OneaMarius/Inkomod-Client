// File: Client/src/components/engineViews/InstantActionView.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import { WORLD } from '../../data/GameWorld.js';
import styles from '../../styles/InstantActionView.module.css';

const InstantActionView = ({ actionTag, npcTarget, onCancel, onConfirm, onForceCombat }) => {
	const player = useGameState((state) => state.gameState.player);
	const regionalExchangeRate = useGameState((state) => state.gameState.location.regionalExchangeRate);

	const [isProcessing, setIsProcessing] = useState(false);
	const [actionResult, setActionResult] = useState(null);

	const actionDef = DB_INTERACTION_ACTIONS[actionTag];
	if (!actionDef || !player || !npcTarget) return null;

	// --- RESOLUTION SCREEN ---
if (actionResult) {
        if (actionResult.status === 'TRIGGER_COMBAT' || actionResult.status === 'TRIGGER_DYNAMIC_EVENT') {
            onCancel();
            return null;
        }

		const isSuccess = actionResult.status === 'SUCCESS';
		const isRiskFailure = actionResult.status === 'FAILED_RISK_CHECK';

		return (
			<div className={styles.overlay}>
				<div className={styles.modal}>
					<div className={styles.header}>
						<h2 className={isSuccess ? styles.chanceGood : styles.chanceBad}>{isSuccess ? 'ACTION SUCCESSFUL' : 'ACTION FAILED'}</h2>
					</div>

<div className={styles.resolutionBody}>
    {isSuccess && (
        <>
            {actionResult.yieldAmount > 0 && (
                <p className={styles.chanceGood}>+{actionResult.yieldAmount} Silver Coins</p>
            )}

            {/* Verificăm explicit existența proprietății pentru a trata cazul cu 0 */}
            {actionResult.hpRestored !== undefined && (
                actionResult.hpRestored > 0 ? (
                    <p className={styles.chanceGood}>+{actionResult.hpRestored} HP Restored</p>
                ) : (
                    <p className={styles.statLabel} style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                        Health already at maximum.
                    </p>
                )
            )}

            {actionResult.apRestored > 0 && (
                <p className={styles.chanceGood}>+{actionResult.apRestored} AP Restored</p>
            )}

            {actionResult.statIncreased && (
                <p className={styles.chanceGood}>+1 {actionResult.statIncreased.toUpperCase()}</p>
            )}

            {actionResult.costApplied > 0 && (
                <p className={styles.chanceBad}>-{actionResult.costApplied} Silver Coins</p>
            )}

            {/* --- NOU: AFIȘĂM ITEM/FOOD ȘI PENALIZARE ONOARE --- */}
            {actionResult.acquiredItem && (
                <p className={styles.chanceGood}>+ {actionResult.acquiredItem}</p>
            )}

            {actionResult.honorChange && (
                <p className={styles.chanceBad}>{actionResult.honorChange} Honor</p>
            )}

            {/* UPDATED: Includem și variabilele noi în verificarea de fall-back */}
            {!actionResult.yieldAmount && 
             actionResult.hpRestored === undefined && 
             !actionResult.statIncreased && 
             !actionResult.apRestored && 
             !actionResult.acquiredItem && 
             !actionResult.honorChange && (
                <p className={styles.chanceGood}>The action was completed successfully.</p>
            )}
        </>
    )}
						{isRiskFailure && (
							<>
								<p className={styles.chanceBad}>You have been detected or failed the attempt.</p>
								<p className={styles.consequenceText}>The target is hostile.</p>
							</>
						)}
						{!isSuccess && !isRiskFailure && <p className={styles.chanceBad}>Error: {actionResult.status}</p>}
					</div>

					<div className={styles.actionSection}>
						{isRiskFailure ? (
							<>
								{actionResult.actionTag === 'Hunt_Animal' && (
									<button
										className={styles.btnCancel}
										onClick={() => {
											setActionResult(null);
											setIsProcessing(false);
											// Trigger evasion attempt logic
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
// Start with the base converted cost
    let silverCost = actionDef.goldCoinBaseCost ? Math.floor(actionDef.goldCoinBaseCost * regionalExchangeRate) : 0;
    
    // Add flags to disable the button if the action is invalid based on state
    let isActionInvalid = false;
    let invalidReason = '';

	if (actionTag.startsWith('Train_')) {
        const playerRank = player.identity.rank || 1;
        silverCost = silverCost * playerRank; // Aplicăm multiplicatorul de rank
        
        // Verificăm și dacă a atins limita de rank pentru a dezactiva butonul
        const statKey = actionTag.split('_')[1].toLowerCase();
        const playerRankIndex = playerRank - 1;
        const currentCap = WORLD.PLAYER.trainingCaps[statKey][playerRankIndex];
        
        if (player.stats[statKey] >= currentCap) {
            isActionInvalid = true;
            invalidReason = `Training capped for Rank ${playerRank}. Reach higher rank to continue.`;
        }
    } else if (actionTag === 'Heal_Player') {
        const missingHp = player.biology.hpMax - player.biology.hpCurrent;
        if (missingHp <= 0) {
            isActionInvalid = true;
            invalidReason = 'Already at maximum operational HP.';
            silverCost = 0; 
        } else {
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

	const requiresSkillCheck = [
		'Target_Assassination',
		'Target_Robbery',
		'Target_Steal_Coin',
		'Target_Steal_Food',
		'Hunt_Animal',
		'Evade_Animal',
		'Evade_Monster',
	].includes(actionTag);

	let successChance = 100;
	let failConsequence = 'None';

if (requiresSkillCheck) {
        const pAgi = player.stats.agi || 10;
        const nAgi = npcTarget.stats?.agi || 10;
        const nInt = npcTarget.stats?.int || 10;
        const pRank = player.identity?.rank || 1;
        const nRank = npcTarget.classification?.entityRank || npcTarget.classification?.poiRank || 1;
        
        // Only penalize if the target is higher rank than the player
        const rankDelta = Math.max(0, nRank - pRank);

        const checkConfig = WORLD.INTERACTION.skillChecks[actionTag];

        if (checkConfig) {
            if (actionTag === 'Target_Steal_Coin' || actionTag === 'Target_Steal_Food') {
                successChance = checkConfig.baseChance + ((pAgi - nInt) * 2) - (rankDelta * checkConfig.rankPenalty);
                failConsequence = 'Normal Combat (Brawl)';
            } else if (actionTag === 'Target_Robbery') {
                successChance = checkConfig.baseChance + ((pAgi - nInt) * 2) - (rankDelta * checkConfig.rankPenalty);
                failConsequence = 'Lethal Combat (Deathmatch)';
            } else if (actionTag === 'Target_Assassination') {
                successChance = checkConfig.baseChance + ((pAgi - nAgi) * 2) - (rankDelta * checkConfig.rankPenalty);
                failConsequence = 'Lethal Combat (Deathmatch)';
            } else if (actionTag.includes('Hunt') || actionTag.includes('Evade')) {
                successChance = checkConfig.baseChance + ((pAgi - nAgi) * 2) - (rankDelta * checkConfig.rankPenalty);
                failConsequence = 'Lethal Combat (Deathmatch)';
            }

            // Apply specific min/max caps per action
            successChance = Math.max(checkConfig.minChance, Math.min(checkConfig.maxChance, successChance));
        }
    }

	const canExecute = hasSufficientAp && hasSufficientCoins;

const handleExecute = () => {
        if (!canExecute || isProcessing) return;
        setIsProcessing(true);

        const result = onConfirm(actionTag, npcTarget.entityId || npcTarget.id, regionalExchangeRate);

        // NOU: Închidem modala instant și pentru Combat și pentru Event Dinamic
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
					<span className={styles.targetName}>Target: {npcTarget.entityName || npcTarget.name}</span>
				</div>

				<div className={styles.descriptionBox}>
					<p>{actionDef.description}</p>
				</div>

				<div className={styles.requirementsGrid}>
					{/* NEW: Show the invalid reason if applicable */}
                    {isActionInvalid && (
                        <div className={`${styles.reqItem} ${styles.unmet}`} style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--danger-red)' }}>{invalidReason}</span>
                        </div>
                    )}
					<div className={`${styles.reqItem} ${hasSufficientAp ? styles.met : styles.unmet}`}>
						<span>AP Cost:</span>
						<span>
							{actionDef.apCost} (Current: {player.progression.actionPoints})
						</span>
					</div>

					{silverCost > 0 && (
						<div className={`${styles.reqItem} ${hasSufficientCoins ? styles.met : styles.unmet}`}>
							<span>Coin Cost:</span>
							<span>
								{silverCost} (Current: {player.inventory.silverCoins})
							</span>
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
						{isProcessing ? 'Executing...' : 'Proceed'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default InstantActionView;
