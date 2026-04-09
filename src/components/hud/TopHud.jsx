// File: Client/src/components/hud/TopHud.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { WORLD } from '../../data/GameWorld';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import styles from '../../styles/CoreEngine.module.css';

const getSeasonString = (seasonKey) => {
    if (!seasonKey) return 'Unknown';
    return seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1);
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TopHud = ({ isStatsModalOpen, setIsStatsModalOpen }) => {
    const gameState = useGameState((state) => state.gameState);
    const knightName = useGameState((state) => state.knightName);

    const [isHudExpanded, setIsHudExpanded] = useState(false);

    if (!gameState || !gameState.player) return null;

    const time = gameState.time;
    const player = gameState.player;
    const inventory = player.inventory || {};
    const location = gameState.location;
    const seasonName = getSeasonString(time.activeSeason);
    const currentMonthName = MONTH_NAMES[time.currentMonth - 1] || 'Unknown';

    const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location.currentWorldId);
    const zoneName = currentNode?.zoneName || 'Streets';
    const regionName = currentNode?.zoneClass || 'Unknown';
    const ecoLevel = currentNode?.zoneEconomyLevel || 1;
    const rer = location.regionalExchangeRate || 10;

    // --- HP CALCULATIONS ---
    const hardCap = WORLD.PLAYER.hpLimits.hardCap;
    const hpCurrent = player.biology.hpCurrent;
    const hpMax = player.biology.hpMax;
    const hpPct = Math.min(100, Math.max(0, Math.round((hpCurrent / hardCap) * 100)));
    const woundPct = Math.min(100, Math.max(0, Math.round(((hardCap - hpMax) / hardCap) * 100)));
    const emptyEndPct = 100 - woundPct;

// --- AP CALCULATIONS (Standard + Overcharge) ---
    const apCurrent = player.progression.actionPoints;
    const apMax = WORLD.PLAYER.maxAp || 8; 
    const maxOvercharge = 8;
    
    let apBgStyle = '';
    
    if (apCurrent <= apMax) {
        // Standard AP logic (Blue Bar)
        const apPct = Math.min(100, Math.max(0, Math.round((apCurrent / apMax) * 100)));
        apBgStyle = `linear-gradient(to right, #1a3a6b ${apPct}%, #1a1a1a ${apPct}%)`;
    } else {
        // Overcharge AP logic (Green Bar overlapping the Blue Bar)
        const overcharge = Math.min(apCurrent - apMax, maxOvercharge);
        const overchargePct = Math.round((overcharge / maxOvercharge) * 100);
        apBgStyle = `linear-gradient(to right, #1a6b2c ${overchargePct}%, #1a3a6b ${overchargePct}%)`;
    }

    return (
        <div className={styles.topSection}>
            <div className={styles.hudContainer}>
                {/* ROW 1: HP / Toggle Button / AP */}
                <div className={styles.hudRow} style={{ alignItems: 'stretch' }}>
                    <div
                        className={`${styles.statBox} ${styles.boxHalf} ${styles.resourceBox}`}
                        style={{ background: `linear-gradient(to right, #6b1a1a 0%, #6b1a1a ${hpPct}%, #1a1a1a ${hpPct}%, #1a1a1a ${emptyEndPct}%, #b49b1b ${emptyEndPct}%, #b49b1b 100%)` }}
                    >
                        <span className={styles.bgWatermark}>HP</span>
                        <span className={styles.statValue}>{hpCurrent} / {hpMax}</span>
                    </div>

                    <button
                        className={styles.hudToggleBtn}
                        onClick={() => setIsHudExpanded(!isHudExpanded)}
                    >
                        {isHudExpanded ? '▲' : '▼'}
                    </button>

                    <div
                        className={`${styles.statBox} ${styles.boxHalf} ${styles.resourceBox}`}
                        style={{ background: apBgStyle }}
                    >
                        <span className={styles.bgWatermark}>AP</span>
                        <span className={styles.statValue}>{apCurrent} / {apMax}</span>
                    </div>
                </div>

                {/* EXPANDABLE PANEL */}
                {isHudExpanded && (
                    <div className={styles.expandedPanel}>
                        <div className={styles.hudRow}>
                            <div className={`${styles.statBox} ${styles.boxFull}`}>
                                <span className={styles.statLabel}>Timeline</span>
                                <span className={styles.statValueText}>
                                    Year {time.currentYear || 1} | Turn {time.currentTurn || 0} | {currentMonthName} | {seasonName}
                                </span>
                            </div>
                        </div>
                        <div className={styles.hudRow}>
                            <div className={`${styles.statBox} ${styles.boxHalf}`}>
                                <span className={styles.statLabel}>Region / Zone</span>
                                <span className={styles.statValueText}>
                                    {regionName} | {zoneName.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className={`${styles.statBox} ${styles.boxHalf}`}>
                                <span className={styles.statLabel}>Economy</span>
                                <span className={styles.statValueText}>
                                    Level: {ecoLevel} | RER: {rer}
                                </span>
                            </div>
                        </div>
                        <div className={styles.hudRow}>
                            <div className={`${styles.statBox} ${styles.boxThird}`}>
                                <span className={styles.statLabel}>Potions</span>
                                <span className={styles.statValueText} style={{ gap: '6px' }}>
                                    <span className={styles.healthIcon}>✚</span>
                                    <span>{inventory.healingPotions || 0}</span>
                                </span>
                            </div>
                            <div className={`${styles.statBox} ${styles.boxThird}`}>
                                <span className={styles.statLabel}>Silver</span>
                                <span className={styles.statValueText} style={{ gap: '6px' }}>
                                    <span className={`${styles.ingotIcon} ${styles.ingotSilver}`}>S</span>
                                    <span>{inventory.tradeSilver || 0}</span>
                                </span>
                            </div>
                            <div className={`${styles.statBox} ${styles.boxThird}`}>
                                <span className={styles.statLabel}>Gold</span>
                                <span className={styles.statValueText} style={{ gap: '6px' }}>
                                    <span className={`${styles.ingotIcon} ${styles.ingotGold}`}>G</span>
                                    <span>{inventory.tradeGold || 0}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ROW 2: Food, Knight Name, Coins */}
                <div className={styles.hudRow}>
                    <div className={`${styles.statBox} ${styles.boxSide}`}>
                        <span className={styles.statLabel}>Food</span>
                        <span className={styles.statValue}>
                            <span className={styles.foodIcon}>🍞</span> {inventory.food || 0}
                        </span>
                    </div>

                    {/* KNIGHT BUTTON: Toggles State from Parent */}
                    <div
                        className={`${styles.interactiveKnightBox} ${styles.boxCenter}`}
                        onClick={() => setIsStatsModalOpen(!isStatsModalOpen)}
                    >
                        <span className={styles.statLabel}>Knight</span>
                        <span className={styles.statValueName}>{knightName}</span>
                    </div>

                    <div className={`${styles.statBox} ${styles.boxSide}`}>
                        <span className={styles.statLabel}>Coins</span>
                        <span className={styles.statValue}>
                            <span className={styles.coinIcon}>c</span> {inventory.silverCoins || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopHud;