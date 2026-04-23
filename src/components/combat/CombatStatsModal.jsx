// File: Client/src/components/combat/CombatStatsModal.jsx
import styles from '../../styles/CombatStatsModal.module.css';

const CombatStatsModal = ({ player, knightName, enemy, pData, nData, playerRank, enemyRank, setIsInfoModalOpen }) => {
	const isEnemyCreature = enemy.classification?.entityCategory === 'Animal' || enemy.classification?.entityCategory === 'Monster';

	// Basic comparison helper for standard integers (Stats, AD, DR, Rank)
	const getCompareClass = (valA, valB) => {
		const numA = parseInt(valA) || 0;
		const numB = parseInt(valB) || 0;
		if (numA > numB) return styles.winValue;
		if (numA < numB) return styles.loseValue;
		return styles.drawValue;
	};

	// Advanced comparison helper for equipment (Tier, then Quality fallback)
	const getEquipCompareClass = (itemA, itemB) => {
		if (isEnemyCreature || !itemA || !itemB) return styles.drawValue;

		const tierA = itemA.classification?.itemTier || 0;
		const tierB = itemB.classification?.itemTier || 0;
		const qualA = itemA.classification?.itemQuality || 0;
		const qualB = itemB.classification?.itemQuality || 0;

		// Compare Tiers first
		if (tierA > tierB) return styles.winValue;
		if (tierA < tierB) return styles.loseValue;

		// If Tiers are equal, compare Quality
		if (qualA > qualB) return styles.winValue;
		if (qualA < qualB) return styles.loseValue;

		// If both are perfectly equal
		return styles.drawValue;
	};

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

	const renderEquipRow = (item, label, isPlayer = true) => {
		const isCreature = !isPlayer && isEnemyCreature;

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

		// Identify the opposing item for the comparison engine
		let opponentItem = null;
		if (isPlayer) {
			const slotIdMap = { Wpn: 'weaponId', Arm: 'armorId', Shd: 'shieldId', Hlm: 'helmetId' };
			opponentItem = enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment[slotIdMap[label]]);
		} else {
			const playerItemMap = { Wpn: 'weaponItem', Arm: 'armorItem', Shd: 'shieldItem', Hlm: 'helmetItem' };
			opponentItem = player.equipment[playerItemMap[label]];
		}

		const compareClass = getEquipCompareClass(item, opponentItem);

		return (
			<div className={styles.equipItemRow}>
				<span className={styles.equipLabel}>{label}:</span>
				<div className={`${styles.smallRankCircle} ${compareClass}`}>{item?.classification?.itemTier || '-'}</div>
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

				{/* NAME */}
				<div className={styles.sectionWrapper}>
					<div className={styles.centerLabel}>Name</div>
					<div className={styles.rowContainer}>
						<div className={styles.column}>
							<span className={styles.nameText}>{knightName || 'You'}</span>
						</div>
						<div className={styles.column}>
							<span className={styles.nameText}>{enemy.entityName || enemy.name}</span>
						</div>
					</div>
				</div>

				{/* RANK */}
				<div className={styles.sectionWrapper}>
					<div className={styles.centerLabel}>Rank</div>
					<div className={styles.rowContainer}>
						<div className={styles.column}>
							<div className={`${styles.rankCircle} ${getCompareClass(playerRank, enemyRank)}`}>{playerRank}</div>
						</div>
						<div className={styles.column}>
							<div className={`${styles.rankCircle} ${getCompareClass(enemyRank, playerRank)}`}>{enemyRank}</div>
						</div>
					</div>
				</div>

				{/* STATS SECTION */}
				<div className={styles.sectionWrapper}>
					<div className={styles.centerLabel}>Attributes</div>
					<div className={styles.rowContainer}>
						<div className={styles.column}>
							<span className={styles.statValue}>
								<span className={getCompareClass(player.stats.str, enemy.stats.str)}>STR:{player.stats.str}</span> |
								<span className={getCompareClass(player.stats.agi, enemy.stats.agi)}> AGI:{player.stats.agi}</span> |
								<span className={getCompareClass(player.stats.int, enemy.stats.int)}> INT:{player.stats.int}</span>
							</span>
						</div>
						<div className={styles.column}>
							<span className={styles.statValue}>
								<span className={getCompareClass(enemy.stats.str, player.stats.str)}>STR:{enemy.stats.str}</span> |
								<span className={getCompareClass(enemy.stats.agi, player.stats.agi)}> AGI:{enemy.stats.agi}</span> |
								<span className={getCompareClass(enemy.stats.int, player.stats.int)}> INT:{enemy.stats.int}</span>
							</span>
						</div>
					</div>
				</div>

				{/* AD SECTION */}
				<div className={styles.sectionWrapper}>
					<div className={styles.centerLabel}>Attack Damage (AD)</div>
					<div className={styles.rowContainer}>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{pData.attrAd}] + Equip[{pData.equipAd}]
							</div>
							<div className={`${styles.totalHighlight} ${getCompareClass(pData.totalAd, nData.totalAd)}`}>{pData.totalAd}</div>
						</div>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{nData.attrAd}] + {isEnemyCreature ? 'Natural' : 'Equip'}[{nData.equipAd}]
							</div>
							<div className={`${styles.totalHighlight} ${getCompareClass(nData.totalAd, pData.totalAd)}`}>{nData.totalAd}</div>
						</div>
					</div>
				</div>

				{/* DR SECTION */}
				<div className={styles.sectionWrapper}>
					<div className={styles.centerLabel}>Damage Reduction (DR)</div>
					<div className={styles.rowContainer}>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{pData.attrDr}] + Equip[{pData.equipDr}]
							</div>
							<div className={`${styles.totalHighlight} ${getCompareClass(pData.totalDr, nData.totalDr)}`}>{pData.totalDr}</div>
						</div>
						<div className={styles.column}>
							<div className={styles.powerBreakdown}>
								Stats[{nData.attrDr}] + {isEnemyCreature ? 'Natural' : 'Equip'}[{nData.equipDr}]
							</div>
							<div className={`${styles.totalHighlight} ${getCompareClass(nData.totalDr, pData.totalDr)}`}>{nData.totalDr}</div>
						</div>
					</div>
				</div>

				{/* EQUIPMENT SECTIONS */}
				<div className={styles.equipmentVerticalStack}>
					<div className={styles.equipSection}>
						<div className={styles.centerLabel}>Your Equipment</div>
						<div className={styles.equipList}>
							{renderEquipRow(player.equipment.weaponItem, 'Wpn', true)}
							{renderEquipRow(player.equipment.armorItem, 'Arm', true)}
							{renderEquipRow(player.equipment.shieldItem, 'Shd', true)}
							{renderEquipRow(player.equipment.helmetItem, 'Hlm', true)}
						</div>
					</div>

					<div className={styles.equipSection}>
						<div className={styles.centerLabel}>{isEnemyCreature ? 'NPC Natural Traits' : 'NPC Equipment'}</div>
						<div className={styles.equipList}>
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.weaponId),
								'Wpn',
								false,
							)}
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.armorId),
								'Arm',
								false,
							)}
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.shieldId),
								'Shd',
								false,
							)}
							{renderEquipRow(
								enemy.inventory?.itemSlots.find((i) => i.entityId === enemy.equipment.helmetId),
								'Hlm',
								false,
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
