// File: Client/src/components/combat/CombatHudTop.jsx
import { useState, useEffect } from 'react';
import styles from '../../styles/CombatView.module.css';
import { getEntityAvatar, getFallbackAvatar } from '../../utils/AvatarResolver';
import KnightAvatar from '../KnightAvatar';
import NpcAvatar from '../NpcAvatar';

const CombatHudTop = ({
	player,
	knightName,
	enemy,
	playerHpPercent,
	playerWoundPercent,
	enemyHpPercent,
	setIsInfoModalOpen,
	visualEvents,
	readableCombatType,
	visualProfile = { visualProfile },
}) => {
	// Zone A: Avatar Animations, Floating Damage, and Overlay Icons
	const [playerAnim, setPlayerAnim] = useState('');
	const [enemyAnim, setEnemyAnim] = useState('');

	const [playerDmgPop, setPlayerDmgPop] = useState(null);
	const [enemyDmgPop, setEnemyDmgPop] = useState(null);

	const [playerIconPop, setPlayerIconPop] = useState(null);
	const [enemyIconPop, setEnemyIconPop] = useState(null);

	// Zone B: Persistent Sub-Bar Status Tags & HP Glow
	const [playerStatusTag, setPlayerStatusTag] = useState(null);
	const [enemyStatusTag, setEnemyStatusTag] = useState(null);
	const [playerHpGlow, setPlayerHpGlow] = useState(false);

	useEffect(() => {
		if (!visualEvents) return;

		// Reset all visual states
		setPlayerAnim('');
		setEnemyAnim('');
		setPlayerDmgPop(null);
		setEnemyDmgPop(null);
		setPlayerIconPop(null);
		setEnemyIconPop(null);
		setPlayerHpGlow(false);
		setPlayerStatusTag(null);
		setEnemyStatusTag(null);

		const triggerTimer = setTimeout(() => {
			// Player Zone A (Damage, Evasion, Overlay Icons)
			const pHit = visualEvents.playerHitType;
			if (['clean', 'critical', 'blocked', 'parried'].includes(pHit)) {
				setPlayerDmgPop({ val: visualEvents.playerDamageTaken, type: pHit });
				if (visualEvents.playerAction !== 'HEAL' && (pHit === 'clean' || pHit === 'critical')) {
					setPlayerAnim(pHit === 'critical' ? 'critical' : 'hit');
				}
			} else if (pHit === 'evaded') {
				setPlayerAnim('evade');
				setPlayerIconPop('🍃');
			}

			// Enemy Zone A (Damage, Evasion, Overlay Icons)
			const eHit = visualEvents.enemyHitType;
			if (['clean', 'critical', 'blocked', 'parried'].includes(eHit)) {
				setEnemyDmgPop({ val: visualEvents.enemyDamageTaken, type: eHit });
				if (eHit === 'clean' || eHit === 'critical') {
					setEnemyAnim(eHit === 'critical' ? 'critical' : 'hit');
				}
			} else if (eHit === 'evaded') {
				setEnemyAnim('evade');
				setEnemyIconPop('🍃');
			}

			// Player Zone B (Persistent Status Tags)
			if (visualEvents.playerAction === 'HEAL') {
				setPlayerStatusTag({ text: '+ HEAL', type: 'heal' });
				setPlayerHpGlow(true);
			} else if (visualEvents.playerAction === 'FLEE') {
				setPlayerStatusTag({ text: '🏃 FLEE', type: 'evade' });
			} else if (pHit === 'blocked') {
				setPlayerStatusTag({ text: '🛡️ BLOCKED', type: 'block' });
			} else if (pHit === 'parried') {
				setPlayerStatusTag({ text: '⚔️ PARRIED', type: 'parry' });
			} else if (pHit === 'evaded') {
				setPlayerStatusTag({ text: '🍃 EVADED', type: 'evade' });
			}

			// Enemy Zone B (Persistent Status Tags)
			if (visualEvents.npcAction === 'FLEE') {
				setEnemyStatusTag({ text: '🏃 FLEE', type: 'evade' });
			} else if (eHit === 'blocked') {
				setEnemyStatusTag({ text: '🛡️ BLOCKED', type: 'block' });
			} else if (eHit === 'parried') {
				setEnemyStatusTag({ text: '⚔️ PARRIED', type: 'parry' });
			} else if (eHit === 'evaded') {
				setEnemyStatusTag({ text: '🍃 EVADED', type: 'evade' });
			}
		}, 10);

		const cleanupTimer = setTimeout(() => {
			setPlayerAnim('');
			setEnemyAnim('');
			setPlayerDmgPop(null);
			setEnemyDmgPop(null);
			setPlayerIconPop(null);
			setEnemyIconPop(null);
			setPlayerHpGlow(false);
		}, 1200);

		return () => {
			clearTimeout(triggerTimer);
			clearTimeout(cleanupTimer);
		};
	}, [visualEvents]);

	const getPortraitClass = (animState) => {
		if (animState === 'critical') return styles.portraitCritical;
		if (animState === 'hit') return styles.portraitTakingDamage;
		if (animState === 'evade') return styles.portraitEvading;
		return '';
	};

	const getHpBarClass = (animState, isHealing) => {
		if (isHealing) return styles.hpBarHealingPulse;
		if (animState === 'critical' || animState === 'hit') return styles.hpBarTakingDamage;
		return '';
	};

	const getFloatingDamageData = (popData) => {
		let textContent = '';
		let cssClass = styles.floatingDamage;

		if (popData.type === 'critical') {
			textContent = `💥🩸 ${popData.val}`;
			cssClass = styles.floatingDamageCrit;
		} else if (popData.type === 'clean') {
			textContent = `💥 ${popData.val}`;
		} else if (popData.type === 'blocked') {
			textContent = `🛡️ ${popData.val}`;
			cssClass = styles.floatingDamageMitigated;
		} else if (popData.type === 'parried') {
			textContent = `⚔️ ${popData.val}`;
			cssClass = styles.floatingDamageMitigated;
		}

		return { textContent, cssClass };
	};

	// Dynamic Avatar Resolution for Enemy
	const enemyCategory = enemy.classification?.entityCategory || 'Monster';
	const enemySubclass = enemy.classification?.entitySubclass || 'Unknown';
	const enemyPrimaryAvatar = getEntityAvatar(enemyCategory, enemySubclass);
	const enemyFallbackAvatar = getFallbackAvatar(enemyCategory);

	return (
		<div className={styles.hudTop}>
			{/* Player Side */}
			<div className={styles.portraitBox}>
				<div style={{ position: 'relative' }}>
					{playerIconPop && (
						<div className={styles.combatPopTextContainer}>
							<span className={styles.combatPopIcon}>{playerIconPop}</span>
						</div>
					)}
					{playerDmgPop && (
						<div className={styles.floatingDamageContainer}>
							<span className={getFloatingDamageData(playerDmgPop).cssClass}>{getFloatingDamageData(playerDmgPop).textContent}</span>
						</div>
					)}
					<div
						className={`${styles.portraitImg} ${getPortraitClass(playerAnim)}`}
						style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}
					>
						<KnightAvatar
							src={`/avatars/${player.avatar || 'default_knight.png'}`}
							visualProfile={visualProfile}
							size='100%'
						/>
					</div>
				</div>
				<span className={styles.entityName}>{knightName || player.name || 'Unknown Knight'}</span>

				<div className={`${styles.hpBarContainer} ${getHpBarClass(playerAnim, playerHpGlow)}`}>
					<div
						className={styles.hpBarFill}
						style={{ width: `${playerHpPercent}%` }}
					></div>
					{playerWoundPercent > 0 && (
						<div
							className={styles.hpBarWound}
							style={{ width: `${playerWoundPercent}%` }}
						></div>
					)}
					<span className={styles.hpBarText}>
						{player.biology.hpCurrent} / {player.biology.hpMax}
					</span>
				</div>

				<div className={styles.statusTagContainer}>
					{playerStatusTag && <span className={`${styles.statusTag} ${styles['tag' + playerStatusTag.type]}`}>{playerStatusTag.text}</span>}
				</div>
			</div>

			{/* Middle Controls */}
			<div className={styles.vsIcon}>
				<div style={{ fontSize: '0.7rem', color: '#ff9800', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
					{readableCombatType ? readableCombatType.toUpperCase() : ''}
				</div>
				<span>VS</span>
				<button
					className={styles.statsBtn}
					onClick={() => setIsInfoModalOpen(true)}
				>
					Stats
				</button>
			</div>

			{/* Enemy Side */}
			<div className={styles.portraitBox}>
				<div style={{ position: 'relative' }}>
					{enemyIconPop && (
						<div className={styles.combatPopTextContainer}>
							<span className={styles.combatPopIcon}>{enemyIconPop}</span>
						</div>
					)}
					{enemyDmgPop && (
						<div className={styles.floatingDamageContainer}>
							<span className={getFloatingDamageData(enemyDmgPop).cssClass}>{getFloatingDamageData(enemyDmgPop).textContent}</span>
						</div>
					)}
					<div
						className={`${styles.portraitImg} ${getPortraitClass(enemyAnim)}`}
						style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}
					>
						<NpcAvatar
							src={enemyPrimaryAvatar}
							primaryFallback={enemyFallbackAvatar}
							secondaryFallback='/avatars/default_npc.png'
							rank={enemy.classification?.entityRank || 1} // Extragem rank-ul din obiectul inamicului
							size='100%'
						/>
					</div>
				</div>
				<span className={styles.entityName}>{enemy.entityName || enemy.name || 'Unknown Enemy'}</span>

				<div className={`${styles.hpBarContainer} ${getHpBarClass(enemyAnim, false)}`}>
					<div
						className={styles.hpBarFill}
						style={{ width: `${enemyHpPercent}%` }}
					></div>
					<span className={styles.hpBarText}>
						{enemy.biology.hpCurrent} / {enemy.biology.hpMax}
					</span>
				</div>

				<div className={styles.statusTagContainer}>
					{enemyStatusTag && <span className={`${styles.statusTag} ${styles['tag' + enemyStatusTag.type]}`}>{enemyStatusTag.text}</span>}
				</div>
			</div>
		</div>
	);
};

export default CombatHudTop;
