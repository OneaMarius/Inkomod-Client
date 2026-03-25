// File: Client/src/components/NpcInfo.jsx
import { useState } from 'react';
import { WORLD } from '../data/GameWorld'; // Required for max combat limits
import styles from '../styles/NpcInfo.module.css';

const NpcInfo = ({ npc }) => {
	const [isOpen, setIsOpen] = useState(false);

	if (!npc) return null;

	// --- 1. IDENTITY MAPPING ---
	const npcName = npc.entityName || npc.name || 'Unknown Entity';
	const npcArchetype = npc.classification?.entityArchetype || 'Humanoid';
	const npcCategory = npc.classification?.entityCategory || 'Human';
	const npcClass = npc.classification?.entityClass || 'Unknown Class';
	const npcRank = npc.classification?.entityRank || npc.classification?.poiRank || 1;

	// --- 2. BIOLOGY / CONDITION MAPPING ---
	const hpCurrent = npc.biology?.hpCurrent || 0;
	const hpMax = npc.biology?.hpMax || 1;
	const hpPercent = (hpCurrent / hpMax) * 100;

	let conditionText = 'Critical';
	let conditionClass = styles.hpCritical;

	if (hpPercent >= 75) {
		conditionText = 'Healthy';
		conditionClass = styles.hpHealthy;
	} else if (hpPercent >= 25) {
		conditionText = 'Injured';
		conditionClass = styles.hpInjured;
	}

	// --- 3. ATTRIBUTES & COMBAT MAPPING (REAL VALUES) ---
	const str = npc.stats?.innateStr || npc.stats?.str || 10;
	const agi = npc.stats?.innateAgi || npc.stats?.agi || 10;
	const int = npc.stats?.innateInt || npc.stats?.int || 10;

	// Base combat stats derived from attributes
	const attrAd = Math.floor(str / 2);
	const attrDr = 5 + Math.floor(agi / 5);

	// Calculate Equipment Bonuses dynamically
	let equipAd = 0;
	let equipDr = 0;

	if (npc.inventory?.itemSlots && npc.equipment) {
		npc.inventory.itemSlots.forEach((item) => {
			if (item.entityId === npc.equipment.weaponId && npc.equipment.hasWeapon) {
				equipAd += item.stats?.adp || 0;
				equipDr += item.stats?.ddr || 0;
			}
			if (item.entityId === npc.equipment.armourId && npc.equipment.hasArmour) {
				equipAd += item.stats?.adp || 0;
				equipDr += item.stats?.ddr || 0;
			}
			if (item.entityId === npc.equipment.shieldId && npc.equipment.hasShield) {
				equipAd += item.stats?.adp || 0;
				equipDr += item.stats?.ddr || 0;
			}
			if (item.entityId === npc.equipment.helmetId && npc.equipment.hasHelmet) {
				equipAd += item.stats?.adp || 0;
				equipDr += item.stats?.ddr || 0;
			}
		});
	}

	// Apply absolute limits defined in GameWorld
	const maxAdp = WORLD.COMBAT?.coreStats?.maxAttackDamagePower || 999;
	const maxDdr = WORLD.COMBAT?.coreStats?.maxDefenseDamageReduction || 999;

	const totalAdp = Math.min(attrAd + equipAd, maxAdp);
	const totalDdr = Math.min(attrDr + equipDr, maxDdr);

	// --- 4. TAXONOMY / RANK MAPPING ---
	let trainingStatus = 'None';
	let socialStatus = 'Poor';

	switch (npcRank) {
		case 5:
			trainingStatus = 'Divine';
			socialStatus = 'Divine';
			break;
		case 4:
			trainingStatus = 'Veteran';
			socialStatus = 'Rich';
			break;
		case 3:
			trainingStatus = 'Trained';
			socialStatus = 'Normal';
			break;
		case 2:
			trainingStatus = 'Basic';
			socialStatus = 'Normal';
			break;
		case 1:
		default:
			trainingStatus = 'None';
			socialStatus = 'Poor';
			break;
	}

	// --- MODAL HANDLERS ---
	const handleOpen = (e) => {
		e.stopPropagation();
		setIsOpen(true);
	};

	const handleClose = (e) => {
		e.stopPropagation();
		setIsOpen(false);
	};

	return (
		<>
			<button
				className={styles.infoBtn}
				onClick={handleOpen}
			>
				(i) Info
			</button>

			{isOpen && (
				<div
					className={styles.modalOverlay}
					onClick={handleClose}
				>
					<div
						className={styles.modalContent}
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className={styles.modalHeader}>{npcName}</h3>
						<div className={styles.modalCategory}>
							{npcArchetype} - {npcCategory} ({npcClass})
						</div>

						<div className={styles.sectionTitle}>BIOMETRICS</div>
						<div className={styles.statRow}>
							<span className={styles.statLabel}>Status:</span>
							<span className={conditionClass}>{conditionText}</span>
						</div>
						<div className={styles.statRow}>
							<span className={styles.statLabel}>
								STR: <span className={styles.statValue}>{str}</span>
							</span>
							<span className={styles.statLabel}>
								AGI: <span className={styles.statValue}>{agi}</span>
							</span>
							<span className={styles.statLabel}>
								INT: <span className={styles.statValue}>{int}</span>
							</span>
						</div>

						<div className={styles.sectionTitle}>COMBAT RATING</div>
						<div className={styles.statRow}>
							<span className={styles.statLabel}>Attack Power (ADP):</span>
							<span className={styles.statValue}>
								{totalAdp}{' '}
								<span style={{ fontSize: '0.8rem', color: '#666' }}>
									({attrAd}+{equipAd})
								</span>
							</span>
						</div>
						<div className={styles.statRow}>
							<span className={styles.statLabel}>Defense (DDR):</span>
							<span className={styles.statValue}>
								{totalDdr}{' '}
								<span style={{ fontSize: '0.8rem', color: '#666' }}>
									({attrDr}+{equipDr})
								</span>
							</span>
						</div>

						<div className={styles.sectionTitle}>BACKGROUND</div>
						<div className={styles.statRow}>
							<span className={styles.statLabel}>Combat Training:</span>
							<span className={styles.statValue}>{trainingStatus}</span>
						</div>
						<div className={styles.statRow}>
							<span className={styles.statLabel}>Socio-Economic:</span>
							<span className={styles.statValue}>{socialStatus}</span>
						</div>

						<button
							className={styles.closeModalBtn}
							onClick={handleClose}
						>
							Close Dossier
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default NpcInfo;
