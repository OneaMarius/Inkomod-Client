// File: Client/src/components/combat/CombatStatsModal.jsx
import styles from '../../styles/CombatStatsModal.module.css';

const CombatStatsModal = ({ player, knightName, enemy, pData, nData, playerRank, enemyRank, setIsInfoModalOpen }) => {
	const isEnemyCreature = enemy.classification?.entityCategory === 'Animal' || enemy.classification?.entityCategory === 'Monster';

	const getQualityClass = (item) => {
		const q = item?.classification?.itemQuality;
		switch (q) {
			case 1:
				return 'textQ1';
			case 2:
				return 'textQ2';
			case 3:
				return 'textQ3';
			case 4:
				return 'textQ4';
			default:
				return 'textQ2';
		}
	};

	const renderEquipRow = (item, label, isCreature = false) => {
		if (isCreature)
			return (
				<div className={styles.equipItemRow}>
					<span className={styles.equipLabel}>{label}:</span>
					<span className={styles.noneText}>Natural Traits</span>
				</div>
			);

		if (!item)
			return (
				<div className={styles.equipItemRow}>
					<span className={styles.equipLabel}>{label}:</span>
					<span className={styles.noneText}>Empty</span>
				</div>
			);

		return (
			<div className={styles.equipItemRow}>
				<span className={styles.equipLabel}>{label}:</span>
				<div className={styles.smallRankCircle}>{item?.classification?.itemTier || '-'}</div>
				<span className={`${styles.itemName} ${getQualityClass(item)}`}>{item.itemName}</span>
			</div>
		);
	};

	return (
		<div
			className={styles.overlay}
			onClick={() => setIsInfoModalOpen(false)}
		>
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className={styles.mainTitle}>COMBAT DATA</h2>

				{/* NAME & RANK & STATS */}
				{[
					{ label: 'Name', left: knightName || 'You', right: enemy.entityName || enemy.name },
					{ label: 'Rank', left: <div className={styles.rankCircle}>{playerRank}</div>, right: <div className={styles.rankCircle}>{enemyRank}</div> },
					{
						label: 'Stats',
						left: `STR:${player.stats.str} | AGI:${player.stats.agi} | INT:${player.stats.int}`,
						right: `STR:${enemy.stats.str} | AGI:${enemy.stats.agi} | INT:${enemy.stats.int}`,
					},
				].map((sec) => (
					<div
						className={styles.sectionWrapper}
						key={sec.label}
					>
						<div className={styles.centerLabel}>{sec.label}</div>
						<div className={styles.rowContainer}>
							<div className={styles.column}>{sec.left}</div>
							<div className={styles.column}>{sec.right}</div>
						</div>
					</div>
				))}

				{/* POWER OUTPUTS - Centered Totals on 2nd line */}
				<div className={styles.sectionWrapper}>
					<div className={styles.centerLabel}>Attack Damage (AD)</div>
					<div className={styles.rowContainer}>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{pData.attrAd}] + Equip[{pData.equipAd}]
							</div>
							<div className={styles.totalHighlight}>{pData.totalAd}</div>
						</div>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{nData.attrAd}] + {isEnemyCreature ? 'Natural' : 'Equip'}[{nData.equipAd}]
							</div>
							<div className={styles.totalHighlight}>{nData.totalAd}</div>
						</div>
					</div>
				</div>

				<div className={styles.sectionWrapper}>
					<div className={styles.centerLabel}>Damage Reduction (DR)</div>
					<div className={styles.rowContainer}>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{pData.attrDr}] + Equip[{pData.equipDr}]
							</div>
							<div className={styles.totalHighlight}>{pData.totalDr}</div>
						</div>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{nData.attrDr}] + {isEnemyCreature ? 'Natural' : 'Equip'}[{nData.equipDr}]
							</div>
							<div className={styles.totalHighlight}>{nData.totalDr}</div>
						</div>
					</div>
				</div>

				{/* EQUIPMENT SECTIONS - VERTICAL STACK */}
				<div className={styles.equipmentVerticalStack}>
					<div className={styles.equipSection}>
						<div className={styles.centerLabel}>Your Equipment</div>
						<div className={styles.equipList}>
							{renderEquipRow(player.equipment.weaponItem, 'Wpn')}
							{renderEquipRow(player.equipment.armourItem, 'Arm')}
							{renderEquipRow(player.equipment.shieldItem, 'Shd')}
							{renderEquipRow(player.equipment.helmetItem, 'Hlm')}
						</div>
					</div>

					<div className={styles.equipSection}>
						<div className={styles.centerLabel}>{isEnemyCreature ? 'NPC Natural Traits' : 'NPC Equipment'}</div>
						<div className={styles.equipList}>
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.weaponId),
								'Wpn',
								isEnemyCreature,
							)}
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.armourId),
								'Arm',
								isEnemyCreature,
							)}
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.shieldId),
								'Shd',
								isEnemyCreature,
							)}
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.helmetId),
								'Hlm',
								isEnemyCreature,
							)}
						</div>
					</div>
				</div>

				<button
					className={styles.closeBtn}
					onClick={() => setIsInfoModalOpen(false)}
				>
					CLOSE
				</button>
			</div>
		</div>
	);
};

export default CombatStatsModal;
