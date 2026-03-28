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
		if (actionResult.status === 'TRIGGER_COMBAT') {
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
								{actionResult.yieldAmount && <p className={styles.chanceGood}>+{actionResult.yieldAmount} Silver Coins</p>}
								{actionResult.hpRestored && <p className={styles.chanceGood}>+{actionResult.hpRestored} HP Restored</p>}
								{actionResult.statIncreased && <p className={styles.chanceGood}>+1 {actionResult.statIncreased.toUpperCase()}</p>}
								{actionResult.costApplied && <p className={styles.chanceBad}>-{actionResult.costApplied} Silver Coins</p>}
								{!actionResult.yieldAmount && !actionResult.hpRestored && !actionResult.statIncreased && (
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
	const silverCost = actionDef.goldCoinBaseCost ? actionDef.goldCoinBaseCost * regionalExchangeRate : 0;
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

		if (result.status === 'TRIGGER_COMBAT') {
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
