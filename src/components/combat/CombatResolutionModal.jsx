// File: Client/src/components/combat/CombatResolutionModal.jsx
import styles from '../../styles/CombatView.module.css';
import { DB_COMBAT } from '../../data/DB_Combat.js';
import useGameState from '../../store/OMD_State_Manager.js';

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

const CombatResolutionModal = ({ player, knightName, enemy, roundStatus, exitCombatEncounterView }) => {
	// Retrieve the current combat type (NF, FF, DMF) to fetch the correct rules
	const activeCombatType = useGameState((state) => state.activeCombatType);

	let modalTitle = 'Combat Finished';
	let titleClass = styles.drawText;

	if (roundStatus.includes('WIN')) {
		modalTitle = 'Victory';
		titleClass = styles.winText;
	} else if (roundStatus.includes('LOSE')) {
		modalTitle = 'Defeat';
		titleClass = styles.loseText;
	}

	// --- CALCULATE EXPECTED CONSEQUENCES ---
	const enemyCategory = enemy?.classification?.entityCategory || 'Human';
	const ruleData = DB_COMBAT.resolutionConsequences[enemyCategory]?.[activeCombatType]?.[roundStatus];

	const expRenown = ruleData?.renModifier || 0;
	const expHonor = ruleData?.honModifier || 0;
	const expCoinsWon = ruleData?.coinYieldPct > 0 && enemy?.inventory?.silverCoins ? Math.floor(enemy.inventory.silverCoins * ruleData.coinYieldPct) : 0;
	const expCoinsLost = ruleData?.coinPenaltyPct > 0 && player?.inventory?.silverCoins ? Math.floor(player.inventory.silverCoins * ruleData.coinPenaltyPct) : 0;
	const expFood = ruleData?.foodYieldPct > 0 && enemy?.logistics?.foodYield ? Math.floor(enemy.logistics.foodYield * ruleData.foodYieldPct) : 0;
	const lostItems = ruleData?.playerEquipmentLoss;

	// --- EXTRACT EXACT LOOTED EQUIPMENT NAMES ---
	const lootedEquipment = [];
	if (ruleData?.equipmentDrop && enemy?.inventory?.itemSlots) {
		const equipIds = [enemy.equipment?.weaponId, enemy.equipment?.armourId, enemy.equipment?.shieldId, enemy.equipment?.helmetId].filter(Boolean);

		equipIds.forEach((id) => {
			const item = enemy.inventory.itemSlots.find((i) => i.entityId === id);
			if (item) lootedEquipment.push(item.itemName || item.name);
		});
	}

	const hasRandomLoot = ruleData?.tableLootYieldPct > 0 && enemy?.inventory?.lootSlots?.length > 0;

	return (
		<div className={styles.resolutionOverlay}>
			<div className={styles.resolutionModal}>
				<h2 className={`${styles.resolutionTitle} ${titleClass}`}>{modalTitle}</h2>

				<div className={styles.resolutionSummaryBox}>
					<div className={styles.resolutionSummaryHeader}>Combat Summary</div>

					<div className={styles.resolutionSummaryRow}>
						<span className={styles.resolutionSummaryLabel}>{knightName || 'You'}:</span>
						<span className={styles.resolutionSummaryPlayerHp}>
							{player.biology.hpCurrent} / {player.biology.hpMax} HP
						</span>
					</div>

					<div className={styles.resolutionSummaryRow}>
						<span className={styles.resolutionSummaryLabel}>{enemy.entityName || enemy.name}:</span>
						<span className={styles.resolutionSummaryEnemyHp}>
							{enemy.biology.hpCurrent} / {enemy.biology.hpMax} HP
						</span>
					</div>

					<div className={styles.resolutionSummaryResult}>Result: {formatCombatOutcome(roundStatus)}</div>

					{/* --- DYNAMIC REWARDS & PENALTIES UI --- */}
					{ruleData && (
						<div style={{ marginTop: '20px', borderTop: '1px dashed #444', paddingTop: '15px' }}>
							<div style={{ color: '#aaa', marginBottom: '10px', fontSize: '1.2rem', textTransform: 'uppercase' }}>Consequences:</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '1.2rem', fontFamily: "'VT323', monospace" }}>
								{expRenown !== 0 && (
									<span style={{ color: expRenown > 0 ? '#10b981' : '#ef4444' }}>Renown {expRenown > 0 ? `+${expRenown}` : expRenown}</span>
								)}

								{expHonor !== 0 && (
									<span style={{ color: expHonor > 0 ? '#10b981' : '#ef4444' }}>Honor {expHonor > 0 ? `+${expHonor}` : expHonor}</span>
								)}

								{expCoinsWon > 0 && <span style={{ color: '#fffa7b' }}>+{expCoinsWon} Silver Coins</span>}

								{expCoinsLost > 0 && <span style={{ color: '#ef4444' }}>-{expCoinsLost} Silver Coins</span>}

								{expFood > 0 && <span style={{ color: '#10b981' }}>+{expFood} Food Supplies</span>}

								{/* Render the exact list of stolen equipment */}
								{lootedEquipment.length > 0 && (
									<div style={{ color: '#3b82f6', display: 'flex', flexDirection: 'column' }}>
										<span>Looted Equipment:</span>
										{lootedEquipment.map((itemName, index) => (
											<span
												key={index}
												style={{ marginLeft: '15px', fontSize: '1.1rem' }}
											>
												- {itemName}
											</span>
										))}
									</div>
								)}

								{/* Render notification for random monster/stash loot */}
								{hasRandomLoot && <span style={{ color: '#3b82f6' }}>+ Harvested random materials</span>}

								{lostItems && <span style={{ color: '#ef4444' }}>Lost Equipped Gear</span>}

								{/* Fallback if nothing happens */}
								{expRenown === 0 &&
									expHonor === 0 &&
									expCoinsWon === 0 &&
									expCoinsLost === 0 &&
									expFood === 0 &&
									lootedEquipment.length === 0 &&
									!hasRandomLoot &&
									!lostItems && <span style={{ color: '#888' }}>No significant changes.</span>}
							</div>
						</div>
					)}
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
