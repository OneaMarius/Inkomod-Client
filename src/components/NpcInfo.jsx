// File: Client/src/components/NpcInfo.jsx
import { useState } from 'react';
import { WORLD } from '../data/GameWorld';
import styles from '../styles/NpcInfo.module.css';
import NpcAvatar from './NpcAvatar';
import { getEntityAvatar, getFallbackAvatar } from '../utils/AvatarResolver';

const NpcInfo = ({ npc }) => {
	const [isOpen, setIsOpen] = useState(false);

	if (!npc) return null;

// --- 1. IDENTITY MAPPING ---
	const npcName = npc.entityName || npc.name || 'Unknown Entity';
	const npcArchetype = npc.classification?.entityArchetype || 'Humanoid';
	const npcCategory = npc.classification?.entityCategory || 'Human';
	const npcClass = npc.classification?.entityClass || 'Unknown Class';
	const npcSubclass = npc.classification?.entitySubclass || null;
	const npcRank = npc.classification?.entityRank || npc.classification?.poiRank || 1;

	const npcPrimaryAvatar = getEntityAvatar(npcCategory, npcClass, npcSubclass);
	const npcFallbackAvatar = getFallbackAvatar(npcCategory);

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
			if (item.entityId === npc.equipment.armorId && npc.equipment.hasArmor) {
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

	// --- 4. TAXONOMY / BACKGROUND MAPPING ---
	// Extract actual values stored during entity generation, with safe fallbacks
	const trainingStatus = npc.classification?.combatTraining || 'Unknown';
	const socialStatus = npc.social?.socialClass || 'Unknown';

	// Determine if the entity is capable of having a "Socio-Economic" background
	const isCivilized = npcCategory === 'Human' || npcCategory === 'Nephilim';

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

						<div style={{ display: 'flex', justifyContent: 'center'}}>
							<div style={{ width: '150px', height: '150px' }}>
								<NpcAvatar
									src={npcPrimaryAvatar || '/avatars/default_npc.png'}
									rank={npcRank}
									size='100%'
									alt={npcName}
									onError={(e) => {
										const currentSrc = e.target.src;
										const classFallback = getEntityAvatar(npcCategory, npcClass, null);
										const finalFallback = npcFallbackAvatar || '/avatars/default_npc.png';

										if (classFallback && !currentSrc.includes(classFallback) && !currentSrc.includes(finalFallback)) {
											e.target.src = classFallback;
										} else if (!currentSrc.includes(finalFallback)) {
											e.target.src = finalFallback;
										}
									}}
								/>
							</div>
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

						{/* BACKGROUND SECTION: Only render for civilized entities */}
						{isCivilized && (
							<>
								<div className={styles.sectionTitle}>BACKGROUND</div>
								<div className={styles.statRow}>
									<span className={styles.statLabel}>Combat Training:</span>
									<span className={styles.statValue}>{trainingStatus}</span>
								</div>
								<div className={styles.statRow}>
									<span className={styles.statLabel}>Socio-Economic:</span>
									<span className={styles.statValue}>{socialStatus}</span>
								</div>
							</>
						)}

						{/* CREATURE SECTION: Render alternative stats for animals/monsters */}
						{!isCivilized && (
							<>
								<div className={styles.sectionTitle}>TAXONOMY</div>
								<div className={styles.statRow}>
									<span className={styles.statLabel}>Entity Rank:</span>
									<span className={styles.statValue}>{npcRank}</span>
								</div>
								<div className={styles.statRow}>
									<span className={styles.statLabel}>Behavior:</span>
									<span className={styles.statValue}>{npc.behavior?.behaviorState || 'Wild'}</span>
								</div>
							</>
						)}

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
