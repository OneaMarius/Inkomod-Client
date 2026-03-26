// File: Client/src/components/combat/CombatStatsModal.jsx
import styles from '../../styles/CombatView.module.css';

const CombatStatsModal = ({ player, knightName, enemy, pData, nData, playerRank, enemyRank, setIsInfoModalOpen }) => {
	return (
		<div
			className={styles.resolutionOverlay}
			onClick={() => setIsInfoModalOpen(false)}
		>
			<div
				className={`${styles.resolutionModal} ${styles.statsModalContent}`}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className={`${styles.resolutionTitle} ${styles.statsTitle}`}>COMBAT DATA</h2>

				<div className={styles.statsContainer}>
					{/* Player Column */}
					<div className={`${styles.statsColumn} ${styles.statsColumnLeft}`}>
						<div className={styles.statsHeaderWrapper}>
							<div className={styles.statsHeaderName}>{knightName || 'You'}</div>
							<div
								className={styles.rankCircle}
								title='Player Level'
							>
								{playerRank}
							</div>
						</div>
						<div className={styles.statRow}>
							STR: {player.stats?.str || 0} | AGI: {player.stats?.agi || 0} | INT: {player.stats?.int || 0}
						</div>

						<div className={styles.statsEquipHeader}>Equip Ranks</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Wpn:</span> {pData.equippedRanks.weapon}
						</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Arm:</span> {pData.equippedRanks.armour}
						</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Shd:</span> {pData.equippedRanks.shield}
						</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Hlm:</span> {pData.equippedRanks.helmet}
						</div>

						<div className={styles.statsEquipHeader}>Power Output</div>
						<div className={`${styles.statRow} ${styles.statPlayerHighlight}`}>
							AD: [{pData.attrAd}] + [{pData.equipAd}] = {pData.totalAd}
						</div>
						<div className={`${styles.statRow} ${styles.statPlayerHighlight}`}>
							DR: [{pData.attrDr}] + [{pData.equipDr}] = {pData.totalDr}
						</div>
					</div>

					{/* Divider Column */}
					<div className={`${styles.statsDivider} ${styles.statsDividerLarge}`}>VS</div>

					{/* Enemy Column */}
					<div className={`${styles.statsColumn} ${styles.statsColumnLeft}`}>
						<div className={styles.statsHeaderWrapper}>
							<div className={styles.statsHeaderName}>{enemy.entityName || enemy.name || 'Enemy'}</div>
							<div
								className={styles.rankCircle}
								title='Enemy Rank'
							>
								{enemyRank}
							</div>
						</div>
						<div className={styles.statRow}>
							STR: {enemy.stats?.str || 0} | AGI: {enemy.stats?.agi || 0} | INT: {enemy.stats?.int || 0}
						</div>

						<div className={styles.statsEquipHeader}>Equip Ranks</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Wpn:</span> {nData.equippedRanks.weapon}
						</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Arm:</span> {nData.equippedRanks.armour}
						</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Shd:</span> {nData.equippedRanks.shield}
						</div>
						<div className={`${styles.statRow} ${styles.statsEquipRow}`}>
							<span className={styles.statsEquipLabel}>Hlm:</span> {nData.equippedRanks.helmet}
						</div>

						<div className={styles.statsEquipHeader}>Power Output</div>
						<div className={`${styles.statRow} ${styles.statEnemyHighlight}`}>
							AD: [{nData.attrAd}] + [{nData.equipAd}] = {nData.totalAd}
						</div>
						<div className={`${styles.statRow} ${styles.statEnemyHighlight}`}>
							DR: [{nData.attrDr}] + [{nData.equipDr}] = {nData.totalDr}
						</div>
					</div>
				</div>

				<div className={styles.statsFormatText}>Format: [Attribute Bonus] + [Equipment Value] = Total</div>

				<button
					className={`${styles.exitBtn} ${styles.exitBtnMargin}`}
					onClick={() => setIsInfoModalOpen(false)}
				>
					Close
				</button>
			</div>
		</div>
	);
};

export default CombatStatsModal;
