// File: Client/src/components/combat/CombatHudTop.jsx
import { useState, useEffect } from 'react';
import styles from '../../styles/CombatView.module.css';
import { getEntityAvatar, getFallbackAvatar } from '../../utils/AvatarResolver';
import KnightAvatar from '../KnightAvatar';
import NpcAvatar from '../NpcAvatar';

const SOUND_MAP = {
	clean: '/assets/sounds/hit_normal.wav',
	critical: '/assets/sounds/hit_critical.wav',
	blocked: '/assets/sounds/hit_blocked.wav',
	parried: '/assets/sounds/hit_parry.wav',
	evaded: '/assets/sounds/hit_evade.wav',
};

const playCombatSound = (hitType) => {
	if (!hitType || !SOUND_MAP[hitType] || hitType === 'none') return;
	const audioInstance = new Audio(SOUND_MAP[hitType]);
	audioInstance.play().catch((error) => {
		console.warn('Combat audio prevented by browser policy:', error);
	});
};

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
	const [playerAnim, setPlayerAnim] = useState('');
	const [enemyAnim, setEnemyAnim] = useState('');

	const [playerDmgPop, setPlayerDmgPop] = useState(null);
	const [enemyDmgPop, setEnemyDmgPop] = useState(null);

	const [playerIconPop, setPlayerIconPop] = useState(null);
	const [enemyIconPop, setEnemyIconPop] = useState(null);

	const [playerStatusTag, setPlayerStatusTag] = useState(null);
	const [enemyStatusTag, setEnemyStatusTag] = useState(null);
	const [playerHpGlow, setPlayerHpGlow] = useState(false);

	// --- STATE-URI PT PLAYER ---
	const [playerFullWhiteGlow, setPlayerFullWhiteGlow] = useState(false);
	const [playerDeltaVioletGlow, setPlayerDeltaVioletGlow] = useState(false);
	const [playerDamageDelta, setPlayerDamageDelta] = useState(0);
	const [isPlayerBarShaking, setIsPlayerBarShaking] = useState(false);

	// --- STATE-URI PT NPC (LIPSEAU ÎNAINTE) ---
	const [enemyFullWhiteGlow, setEnemyFullWhiteGlow] = useState(false);
	const [enemyDeltaVioletGlow, setEnemyDeltaVioletGlow] = useState(false);
	const [enemyDamageDelta, setEnemyDamageDelta] = useState(0);
	const [isEnemyBarShaking, setIsEnemyBarShaking] = useState(false);

	const [displayPlayerHp, setDisplayPlayerHp] = useState({
		percent: playerHpPercent,
		current: player?.biology?.hpCurrent || 0,
		max: player?.biology?.hpMax || 0,
		wound: playerWoundPercent,
	});

	const [displayEnemyHp, setDisplayEnemyHp] = useState({ percent: enemyHpPercent, current: enemy?.biology?.hpCurrent || 0, max: enemy?.biology?.hpMax || 0 });

	useEffect(() => {
		if (!visualEvents) {
			setDisplayPlayerHp({
				percent: playerHpPercent,
				current: player?.biology?.hpCurrent || 0,
				max: player?.biology?.hpMax || 0,
				wound: playerWoundPercent,
			});
			setDisplayEnemyHp({ percent: enemyHpPercent, current: enemy?.biology?.hpCurrent || 0, max: enemy?.biology?.hpMax || 0 });
			return;
		}

		// Resetare generală
		setPlayerAnim('');
		setEnemyAnim('');
		setPlayerDmgPop(null);
		setEnemyDmgPop(null);
		setPlayerIconPop(null);
		setEnemyIconPop(null);
		setPlayerHpGlow(false);
		setPlayerStatusTag(null);
		setEnemyStatusTag(null);

		setPlayerFullWhiteGlow(false);
		setPlayerDeltaVioletGlow(false);
		setIsPlayerBarShaking(false);
		setPlayerDamageDelta(0);

		setEnemyFullWhiteGlow(false);
		setEnemyDeltaVioletGlow(false);
		setIsEnemyBarShaking(false);
		setEnemyDamageDelta(0);

		// SECVENȚA 1: NPC Primește Daune
		const sequence1Timer = setTimeout(() => {
			if (visualEvents.playerAction === 'HEAL') {
				setPlayerStatusTag({ text: '+ HEAL', type: 'heal' });
				setPlayerHpGlow(true);
				setDisplayPlayerHp({
					percent: playerHpPercent,
					current: player?.biology?.hpCurrent || 0,
					max: player?.biology?.hpMax || 0,
					wound: playerWoundPercent,
				});
			} else if (visualEvents.playerAction === 'FLEE') {
				setPlayerStatusTag({ text: '🏃 FLEE', type: 'evade' });
			}

			if (visualEvents.npcAction === 'FLEE') {
				setEnemyStatusTag({ text: '🏃 FLEE', type: 'evade' });
			}

			const eHit = visualEvents.enemyHitType;
			if (eHit && eHit !== 'none') {
				playCombatSound(eHit);

				// Logica de Damage Delta pentru INAMIC
				const delta = displayEnemyHp.percent - enemyHpPercent;
				if (delta > 0) {
					setEnemyDamageDelta(delta);
					setEnemyFullWhiteGlow(true);
					setEnemyDeltaVioletGlow(true);
					setTimeout(() => setEnemyFullWhiteGlow(false), 250);
				}

				if (['clean', 'critical', 'blocked', 'parried'].includes(eHit)) {
					setEnemyDmgPop({ val: visualEvents.enemyDamageTaken, type: eHit });
					if (eHit === 'critical') {
						setIsEnemyBarShaking(true);
						setEnemyAnim('critical');
					} else if (eHit === 'clean') {
						setEnemyAnim('hit');
					}
				} else if (eHit === 'evaded') {
					setEnemyAnim('evade');
					setEnemyIconPop('🍃');
				}

				if (eHit === 'blocked') setEnemyStatusTag({ text: '🛡️ BLOCKED', type: 'block' });
				else if (eHit === 'parried') setEnemyStatusTag({ text: '⚔️ PARRIED', type: 'parry' });
				else if (eHit === 'evaded') setEnemyStatusTag({ text: '🍃 EVADED', type: 'evade' });
			}

			setDisplayEnemyHp({ percent: enemyHpPercent, current: enemy?.biology?.hpCurrent || 0, max: enemy?.biology?.hpMax || 0 });
		}, 10);

		// SECVENȚA 2: Jucătorul Primește Daune
		const sequence2Timer = setTimeout(() => {
			const pHit = visualEvents.playerHitType;
			if (pHit && pHit !== 'none') {
				playCombatSound(pHit);

				if (visualEvents.playerAction !== 'HEAL') {
					const delta = displayPlayerHp.percent - playerHpPercent;
					if (delta > 0) {
						setPlayerDamageDelta(delta);
						setPlayerFullWhiteGlow(true);
						setPlayerDeltaVioletGlow(true);
						setTimeout(() => setPlayerFullWhiteGlow(false), 250);
					}
				}

				if (['clean', 'critical', 'blocked', 'parried'].includes(pHit)) {
					setPlayerDmgPop({ val: visualEvents.playerDamageTaken, type: pHit });
					if (visualEvents.playerAction !== 'HEAL') {
						if (pHit === 'critical') {
							setIsPlayerBarShaking(true);
							setPlayerAnim('critical');
						} else if (pHit === 'clean') {
							setPlayerAnim('hit');
						}
					}
				} else if (pHit === 'evaded') {
					setPlayerAnim('evade');
					setPlayerIconPop('🍃');
				}

				if (pHit === 'blocked') setPlayerStatusTag({ text: '🛡️ BLOCKED', type: 'block' });
				else if (pHit === 'parried') setPlayerStatusTag({ text: '⚔️ PARRIED', type: 'parry' });
				else if (pHit === 'evaded') setPlayerStatusTag({ text: '🍃 EVADED', type: 'evade' });
			}

			if (visualEvents.playerAction !== 'HEAL') {
				setDisplayPlayerHp({
					percent: playerHpPercent,
					current: player?.biology?.hpCurrent || 0,
					max: player?.biology?.hpMax || 0,
					wound: playerWoundPercent,
				});
			}
		}, 500);

		const cleanupTimer = setTimeout(() => {
			setPlayerAnim('');
			setEnemyAnim('');
			setPlayerDmgPop(null);
			setEnemyDmgPop(null);
			setPlayerIconPop(null);
			setEnemyIconPop(null);
			setPlayerHpGlow(false);

			setPlayerFullWhiteGlow(false);
			setPlayerDeltaVioletGlow(false);
			setIsPlayerBarShaking(false);

			setEnemyFullWhiteGlow(false);
			setEnemyDeltaVioletGlow(false);
			setIsEnemyBarShaking(false);
		}, 1500);

		return () => {
			clearTimeout(sequence1Timer);
			clearTimeout(sequence2Timer);
			clearTimeout(cleanupTimer);
		};
	}, [visualEvents, playerHpPercent, enemyHpPercent]);

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

	const getCombatTypeColor = (type) => {
		if (!type) return '#ff9800';
		const lowerType = type.toLowerCase();
		if (lowerType.includes('deathmatch') || lowerType.includes('lethal')) return '#ff4d4d';
		if (lowerType.includes('friendly') || lowerType.includes('spar')) return '#4caf50';
		if (lowerType.includes('normal')) return '#4dabf7';
		return '#ff9800';
	};

	const enemyCategory = enemy.classification?.entityCategory || 'Unknown';
	const enemyClass = enemy.classification?.entityClass;
	const enemySubclass = enemy.classification?.entitySubclass;
	const enemyPrimaryAvatar = getEntityAvatar(enemyCategory, enemyClass, enemySubclass);
	const enemyFallbackAvatar = getFallbackAvatar(enemyCategory);

	return (
		<div className={styles.hudTop}>
			{/* ======== JUCĂTOR ======== */}
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
					<div className='vfx-premium-ring'>
						<div
							className={`${styles.portraitImg} ${getPortraitClass(playerAnim)}`}
							style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}
						>
							<KnightAvatar
								src={`/avatars/${player.identity?.avatar || 'default_knight.png'}`}
								visualProfile={visualProfile}
								size='100%'
							/>
						</div>
					</div>
				</div>
				<span className={styles.entityName}>{knightName || player.identity?.name || 'Knight'}</span>

				<div className={`${styles.hpBarContainer} ${getHpBarClass(playerAnim, playerHpGlow)} ${isPlayerBarShaking ? styles.hpBarCriticalShake : ''}`}>
					<div
						className={`${styles.hpBarFill} ${playerFullWhiteGlow ? styles.hpBarFullGlowWhite : ''}`}
						style={{ width: `${displayPlayerHp.percent}%` }}
					></div>

					{/* Glow-ul Delta pentru Player */}
					{playerDeltaVioletGlow && playerDamageDelta > 0 && (
						<div
							className={styles.hpBarDeltaGlowViolet}
							style={{ left: `${playerHpPercent}%`, width: `${playerDamageDelta}%` }}
						></div>
					)}

					{displayPlayerHp.wound > 0 && (
						<div
							className={styles.hpBarWound}
							style={{ width: `${displayPlayerHp.wound}%` }}
						></div>
					)}
					<span className={styles.hpBarText}>
						{displayPlayerHp.current} / {displayPlayerHp.max}
					</span>
				</div>

				<div className={styles.statusTagContainer}>
					{playerStatusTag && <span className={`${styles.statusTag} ${styles['tag' + playerStatusTag.type]}`}>{playerStatusTag.text}</span>}
				</div>
			</div>

			{/* ======== VS ======== */}
			<div className={styles.vsIcon}>
				<div style={{ fontSize: '0.7rem', color: getCombatTypeColor(readableCombatType), marginBottom: '4px', fontWeight: 'bold', textAlign: 'center' }}>
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

			{/* ======== INAMIC ======== */}
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
							src={enemyPrimaryAvatar || '/avatars/default_npc.png'}
							rank={enemy.classification?.entityRank || 1}
							size='100%'
							alt={enemy.entityName || 'Enemy'}
							onError={(e) => {
								const fallback = enemyFallbackAvatar || '/avatars/default_npc.png';
								if (!e.target.src.includes(fallback)) e.target.src = fallback;
							}}
						/>
					</div>
				</div>
				<span className={styles.entityName}>{enemy.entityName || 'Unknown Enemy'}</span>

				{/* Am aplicat clasele de Shake pe bara Inamicului */}
				<div className={`${styles.hpBarContainer} ${getHpBarClass(enemyAnim, false)} ${isEnemyBarShaking ? styles.hpBarCriticalShake : ''}`}>
					{/* Am aplicat Flash-ul Alb Inamicului */}
					<div
						className={`${styles.hpBarFill} ${enemyFullWhiteGlow ? styles.hpBarFullGlowWhite : ''}`}
						style={{ width: `${displayEnemyHp.percent}%` }}
					></div>

					{/* Glow-ul Delta pentru Inamic */}
					{enemyDeltaVioletGlow && enemyDamageDelta > 0 && (
						<div
							className={styles.hpBarDeltaGlowViolet}
							style={{ left: `${enemyHpPercent}%`, width: `${enemyDamageDelta}%` }}
						></div>
					)}

					<span className={styles.hpBarText}>
						{displayEnemyHp.current} / {displayEnemyHp.max}
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
