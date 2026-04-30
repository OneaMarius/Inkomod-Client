// File: Client/src/components/engineViews/CombatResolutionModal.jsx

import styles from '../../styles/CombatResolutionModal.module.css';
import useGameState from '../../store/OMD_State_Manager.js';
import { getNpcMoralityPenalty } from '../../utils/UnifiedMoralityCalculator.js';

const formatCombatOutcome = (outcomeCode) => {
	const outcomeMap = {
		WIN_SURRENDER: 'WIN by Enemy Surrender',
		WIN_FLEE: 'WIN by Enemy Fleeing',
		WIN_DEATH: 'WIN by Enemy Death',
		LOSE_SURRENDER: 'DEFEAT by Player Surrender',
		LOSE_FLEE: 'DEFEAT by Player Fleeing',
		LOSE_DEATH: 'DEFEAT (Player Killed)',
	};
	return outcomeMap[outcomeCode] || outcomeCode.replace('_', ' ');
};

const CombatResolutionModal = ({
	player,
	knightName,
	enemy,
	roundStatus,
	exitCombatEncounterView,
}) => {
	// Preluăm obiectul final de rezultate generat de motor
	const combatResult = useGameState((state) => state.combatResult);
	const rewards = combatResult?.rewards || [];
	const losses = combatResult?.losses || [];

	// --- LOG AICI ---
	console.log("UI RENDER - Modal Deschis. Ce am in combatResult?", combatResult);

	let modalTitle = 'Combat Finished';
	let titleClass = styles.drawText;

	if (roundStatus.includes('WIN')) {
		modalTitle = 'Victory';
		titleClass = styles.winText;
	} else if (roundStatus.includes('LOSE')) {
		modalTitle = 'Defeat';
		titleClass = styles.loseText;
	}

	// Calculăm doar eticheta crimei local, pentru feedback narativ (restul calculelor sunt deja în motor)
	let crimeLabel = null;
	if (roundStatus !== 'LOSE_DEATH') {
		const isLethal = roundStatus === 'WIN_DEATH';
		const moralityResult = getNpcMoralityPenalty(enemy, isLethal);
		crimeLabel = moralityResult.label;
	}

	return (
		<div className={styles.resolutionOverlay}>
			<div className={styles.resolutionModal}>
				<h2 className={`${styles.resolutionTitle} ${titleClass}`}>
					{modalTitle}
				</h2>

				<div className={styles.resolutionSummaryBox}>
					<div className={styles.resolutionSummaryHeader}>
						Combat Summary
					</div>

					<div className={styles.resolutionSummaryRow}>
						<span className={styles.resolutionSummaryLabel}>
							{knightName || 'You'}:
						</span>
						<span className={styles.resolutionSummaryPlayerHp}>
							{player.biology.hpCurrent} / {player.biology.hpMax} HP
						</span>
					</div>

					<div className={styles.resolutionSummaryRow}>
						<span className={styles.resolutionSummaryLabel}>
							{enemy?.entityName || enemy?.name || 'Enemy'}:
						</span>
						<span className={styles.resolutionSummaryEnemyHp}>
							{enemy?.biology?.hpCurrent || 0} /{' '}
							{enemy?.biology?.hpMax || 0} HP
						</span>
					</div>

					<div className={styles.resolutionSummaryResult}>
						Result: {formatCombatOutcome(roundStatus)}
					</div>

					<div
						style={{
							marginTop: '20px',
							borderTop: '1px dashed #444',
							paddingTop: '15px',
						}}
					>
						<div
							style={{
								color: '#aaa',
								marginBottom: '10px',
								fontSize: '1.2rem',
								textTransform: 'uppercase',
							}}
						>
							Consequences:
						</div>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '6px',
								fontSize: '1.2rem',
								fontFamily: "'VT323', monospace",
							}}
						>
							{crimeLabel && (
								<span style={{ color: '#ef4444', marginBottom: '5px' }}>
									⚠️ Crime: {crimeLabel}
								</span>
							)}

							{/* --- REWARDS SECTION --- */}
							{rewards.map((reward, index) => {
								const isNegative =
									typeof reward.value === 'number' && reward.value < 0;
								const color = isNegative
									? '#ef4444'
									: reward.label === 'Honor' ||
										  reward.label === 'Renown' ||
										  reward.label === 'Food Rations'
										? '#10b981'
										: reward.label === 'Silver Coins'
											? '#fffa7b'
											: reward.label === 'Trophy'
												? '#fbbf24'
												: '#3b82f6';

								const sign =
									!isNegative && typeof reward.value === 'number'
										? '+'
										: '';

								return (
									<span
										key={`rew-${index}`}
										style={{
											color,
											textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
										}}
									>
										{reward.label === 'Acquired' ||
										reward.label === 'Salvaged' ||
										reward.label === 'Trophy'
											? `+ ${reward.value} (${reward.label})`
											: `${reward.label} ${sign}${reward.value}`}
									</span>
								);
							})}

							{/* --- LOSSES SECTION --- */}
							{losses.length > 0 && (
								<div
									style={{
										marginTop: '10px',
										paddingTop: '10px',
										borderTop: '1px dashed #ef4444',
										display: 'flex',
										flexDirection: 'column',
										gap: '4px',
									}}
								>
									<span
										style={{
											color: '#ef4444',
											fontSize: '1.2rem',
											textTransform: 'uppercase',
											marginBottom: '4px',
										}}
									>
										Losses & Attrition:
									</span>
									{losses.map((loss, index) => (
										<span
											key={`loss-${index}`}
											style={{
												color: '#ef4444',
												textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
											}}
										>
											- {loss.label}: {loss.value}
										</span>
									))}
								</div>
							)}

							{rewards.length === 0 &&
								losses.length === 0 &&
								!crimeLabel && (
									<span style={{ color: '#888' }}>
										No significant changes.
									</span>
								)}
						</div>
					</div>
				</div>

				<button
					className={styles.exitBtn}
					onClick={exitCombatEncounterView}
				>
					Confirm & Exit
				</button>
			</div>
		</div>
	);
};

export default CombatResolutionModal;
