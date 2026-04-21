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
    evaded: '/assets/sounds/hit_evade.wav'
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

    useEffect(() => {
        if (!visualEvents) return;

        setPlayerAnim('');
        setEnemyAnim('');
        setPlayerDmgPop(null);
        setEnemyDmgPop(null);
        setPlayerIconPop(null);
        setEnemyIconPop(null);
        setPlayerHpGlow(false);
        setPlayerStatusTag(null);
        setEnemyStatusTag(null);

        const sequence1Timer = setTimeout(() => {
            if (visualEvents.playerAction === 'HEAL') {
                setPlayerStatusTag({ text: '+ HEAL', type: 'heal' });
                setPlayerHpGlow(true);
            } else if (visualEvents.playerAction === 'FLEE') {
                setPlayerStatusTag({ text: '🏃 FLEE', type: 'evade' });
            }

            if (visualEvents.npcAction === 'FLEE') {
                setEnemyStatusTag({ text: '🏃 FLEE', type: 'evade' });
            }

            const eHit = visualEvents.enemyHitType;
            if (eHit && eHit !== 'none') {
                playCombatSound(eHit);

                if (['clean', 'critical', 'blocked', 'parried'].includes(eHit)) {
                    setEnemyDmgPop({ val: visualEvents.enemyDamageTaken, type: eHit });
                    if (eHit === 'clean' || eHit === 'critical') {
                        setEnemyAnim(eHit === 'critical' ? 'critical' : 'hit');
                    }
                } else if (eHit === 'evaded') {
                    setEnemyAnim('evade');
                    setEnemyIconPop('🍃');
                }

                if (eHit === 'blocked') {
                    setEnemyStatusTag({ text: '🛡️ BLOCKED', type: 'block' });
                } else if (eHit === 'parried') {
                    setEnemyStatusTag({ text: '⚔️ PARRIED', type: 'parry' });
                } else if (eHit === 'evaded') {
                    setEnemyStatusTag({ text: '🍃 EVADED', type: 'evade' });
                }
            }
        }, 10);

        const sequence2Timer = setTimeout(() => {
            const pHit = visualEvents.playerHitType;
            if (pHit && pHit !== 'none') {
                playCombatSound(pHit);

                if (['clean', 'critical', 'blocked', 'parried'].includes(pHit)) {
                    setPlayerDmgPop({ val: visualEvents.playerDamageTaken, type: pHit });
                    if (visualEvents.playerAction !== 'HEAL' && (pHit === 'clean' || pHit === 'critical')) {
                        setPlayerAnim(pHit === 'critical' ? 'critical' : 'hit');
                    }
                } else if (pHit === 'evaded') {
                    setPlayerAnim('evade');
                    setPlayerIconPop('🍃');
                }

                if (pHit === 'blocked') {
                    setPlayerStatusTag({ text: '🛡️ BLOCKED', type: 'block' });
                } else if (pHit === 'parried') {
                    setPlayerStatusTag({ text: '⚔️ PARRIED', type: 'parry' });
                } else if (pHit === 'evaded') {
                    setPlayerStatusTag({ text: '🍃 EVADED', type: 'evade' });
                }
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
        }, 1500); 

        return () => {
            clearTimeout(sequence1Timer);
            clearTimeout(sequence2Timer);
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

    const getCombatTypeColor = (type) => {
        if (!type) return '#ff9800';
        const lowerType = type.toLowerCase();

        if (lowerType.includes('deathmatch') || lowerType.includes('lethal')) {
            return '#ff4d4d'; 
        }
        if (lowerType.includes('friendly') || lowerType.includes('spar')) {
            return '#4caf50'; 
        }
        if (lowerType.includes('normal')) {
            return '#4dabf7'; 
        }

        return '#ff9800';
    };

    const enemyCategory = enemy.classification?.entityCategory || 'Unknown';
    const enemyClass = enemy.classification?.entityClass;
    const enemySubclass = enemy.classification?.entitySubclass;

    const enemyPrimaryAvatar = getEntityAvatar(enemyCategory, enemyClass, enemySubclass);
    const enemyFallbackAvatar = getFallbackAvatar(enemyCategory);

    return (
        <div className={styles.hudTop}>
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
                                src={`/avatars/${player.identity?.avatar || player.avatar || 'default_knight.png'}`}
                                visualProfile={visualProfile}
                                size='100%'
                            />
                        </div>
                    </div>
                </div>
                <span className={styles.entityName}>{knightName || player.identity?.name || player.name || 'Unknown Knight'}</span>

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

            <div className={styles.vsIcon}>
                <div
                    style={{
                        fontSize: '0.7rem',
                        color: getCombatTypeColor(readableCombatType),
                        marginBottom: '4px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        whiteSpace: 'nowrap',
                        width: 'max-content',
                        textAlign: 'center',
                        margin: '0 auto 4px auto',
                    }}
                >
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
                            rank={enemy.classification?.entityRank || enemy.classification?.poiRank || 1}
                            size='100%'
                            alt={enemy.entityName || enemy.name || 'Enemy'}
                            onError={(e) => {
                                const fallback = enemyFallbackAvatar || '/avatars/default_npc.png';
                                if (!e.target.src.includes(fallback)) {
                                    e.target.src = fallback;
                                } else if (!e.target.src.includes('default_npc.png')) {
                                    e.target.src = '/avatars/default_npc.png';
                                }
                            }}
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