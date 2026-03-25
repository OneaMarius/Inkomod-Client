// File: Client/src/components/engineViews/CombatView.jsx
import { useEffect, useRef, useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import styles from '../../styles/CombatView.module.css';
import { WORLD } from '../../data/GameWorld.js';

// Importing placeholder assets
import playerImg from '../../assets/player.png';
import npcImg from '../../assets/npc.png';

const CombatView = () => {
    // Extract required state from the global store
    const player = useGameState((state) => state.gameState.player);
    const knightName = useGameState((state) => state.knightName);
    const location = useGameState((state) => state.gameState.location);
    const enemy = useGameState((state) => state.activeCombatEnemy);
    const activeCombatType = useGameState((state) => state.activeCombatType);
    const logMessages = useGameState((state) => state.combatLogMessages);
    const roundStatus = useGameState((state) => state.combatRoundStatus);
    const permittedActions = useGameState((state) => state.playerActionsPermitted);

    // Extract dispatcher functions
    const executeCombatRound = useGameState((state) => state.executeCombatRound);
    const exitCombatEncounterView = useGameState((state) => state.exitCombatEncounterView);

    // Component State
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // NEW: Target the scrollable container directly
    const logContainerRef = useRef(null);

    // Auto-scroll logic fixed for Mobile Viewports
    useEffect(() => {
        if (logContainerRef.current) {
            // Internally scroll the container instead of pushing the viewport
            logContainerRef.current.scrollTo({
                top: logContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [logMessages]);

    // Mobile view scroll reset
    useEffect(() => {
        window.scrollTo(0, 0);
        return () => window.scrollTo(0, 0);
    }, []);

    // Guard clause for missing state
    if (!player || !enemy) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>ERROR: Combat data missing.</div>;
    }

    // --- HP CALCULATIONS ---
    const hardCap = WORLD.PLAYER.hpLimits.hardCap;

    // Calculate percentage of current HP relative to the absolute maximum
    const playerHpPercent = Math.max(0, (player.biology.hpCurrent / hardCap) * 100);
    const playerWoundPercent = Math.max(0, ((hardCap - player.biology.hpMax) / hardCap) * 100);
    const enemyHpPercent = Math.max(0, (enemy.biology.hpCurrent / enemy.biology.hpMax) * 100);

    // Format Combat Type for Display
    let readableCombatType = 'Standard Combat';
    if (activeCombatType === 'FF') readableCombatType = 'Friendly Duel';
    if (activeCombatType === 'DMF') readableCombatType = 'Deathmatch';

    // Format Zone Name for Display
    const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location.currentWorldId);
    const zoneName = currentNode?.zoneName ? currentNode.zoneName.replace(/_/g, ' ') : 'Unknown Region';

    // Resolution Modal processing
    const isCombatFinished = roundStatus !== 'CONTINUE';
    let modalTitle = 'Combat Finished';
    let titleClass = styles.drawText;

    if (roundStatus.includes('WIN')) {
        modalTitle = 'Victory';
        titleClass = styles.winText;
    } else if (roundStatus.includes('LOSE')) {
        modalTitle = 'Defeat';
        titleClass = styles.loseText;
    }

    // Fallback data structures in case component renders before state updates
    const emptyBreakdown = {
        equipAd: 0,
        attrAd: 0,
        totalAd: 0,
        equipDr: 0,
        attrDr: 0,
        totalDr: 0,
        equippedRanks: { weapon: '-', armour: '-', shield: '-', helmet: '-' },
    };
    const pData = player.combatBreakdown || emptyBreakdown;
    const nData = enemy.combatBreakdown || emptyBreakdown;

    // Fallback for Player level/rank, defaults to 'P' if no level system exists yet
    const playerRank = player.progression?.level || 'P';
    const enemyRank = enemy.classification?.entityRank || enemy.classification?.poiRank || '?';

    return (
        <div className={styles.combatContainer}>
            {/* 1. HUD TOP SECTION */}
            <div className={styles.hudTop}>
                <div className={styles.portraitBox}>
                    <img
                        src={playerImg}
                        alt='Player'
                        className={styles.portraitImg}
                    />
                    <span className={styles.entityName}>{knightName || player.name || 'Unknown Knight'}</span>
                    <div className={styles.hpBarContainer}>
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
                </div>

                <div className={styles.vsIcon}>
                    <span>⚔️</span>
                    <button
                        className={styles.statsBtn}
                        onClick={() => setIsInfoModalOpen(true)}
                    >
                        Stats
                    </button>
                </div>

                <div className={styles.portraitBox}>
                    <img
                        src={npcImg}
                        alt='Enemy'
                        className={styles.portraitImg}
                    />
                    <span className={styles.entityName}>{enemy.entityName || enemy.name || 'Unknown Enemy'}</span>
                    <div className={styles.hpBarContainer}>
                        <div
                            className={styles.hpBarFill}
                            style={{ width: `${enemyHpPercent}%` }}
                        ></div>
                        <span className={styles.hpBarText}>
                            {enemy.biology.hpCurrent} / {enemy.biology.hpMax}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. INFO BANNER */}
            <div className={styles.infoBanner}>
                <span>
                    Rule: <span className={styles.highlightText}>{readableCombatType}</span>
                </span>
                <span>
                    Zone: <span className={styles.highlightText}>{zoneName}</span>
                </span>
            </div>

            {/* 3. BATTLE LOG MIDDLE SECTION */}
            {/* NEW: Attached the ref here and removed the empty bottom div */}
            <div className={styles.logMiddle} ref={logContainerRef}>
                {logMessages.map((msg, index) => (
                    <p
                        key={index}
                        className={styles.logEntry}
                    >
                        {msg}
                    </p>
                ))}
            </div>

            {/* 4. ACTION BUTTONS BOTTOM SECTION */}
            <div className={styles.actionsBottom}>
                <button
                    className={styles.actionBtn}
                    onClick={() => executeCombatRound('FIGHT')}
                    disabled={isCombatFinished || !permittedActions.canFight}
                >
                    FIGHT
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => executeCombatRound('HEAL')}
                    disabled={isCombatFinished || !permittedActions.canHeal}
                >
                    HEAL
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => executeCombatRound('SURRENDER')}
                    disabled={isCombatFinished || !permittedActions.canSurrender}
                >
                    SURRENDER
                </button>
                <button
                    className={styles.actionBtn}
                    onClick={() => executeCombatRound('FLEE')}
                    disabled={isCombatFinished || !permittedActions.canFlee}
                >
                    FLEE
                </button>
            </div>

            {/* 5. ENHANCED RESOLUTION OVERLAY */}
            {isCombatFinished && (
                <div className={styles.resolutionOverlay}>
                    <div className={styles.resolutionModal}>
                        <h2 className={`${styles.resolutionTitle} ${titleClass}`}>{modalTitle}</h2>

                        <div style={{ marginBottom: '20px', fontSize: '1.2rem', fontFamily: 'VT323', textAlign: 'left', padding: '0 10px' }}>
                            <div style={{ color: '#fff', borderBottom: '1px solid #444', paddingBottom: '5px', textAlign: 'center' }}>Combat Summary</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                                <span style={{ color: '#aaa' }}>{knightName || 'You'}:</span>
                                <span style={{ color: '#4ade80' }}>
                                    {player.biology.hpCurrent} / {player.biology.hpMax} HP
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ color: '#aaa' }}>{enemy.entityName || enemy.name}:</span>
                                <span style={{ color: '#f87171' }}>
                                    {enemy.biology.hpCurrent} / {enemy.biology.hpMax} HP
                                </span>
                            </div>
                            <div style={{ marginTop: '20px', fontSize: '1.1rem', color: '#fbbf24', fontStyle: 'italic', textAlign: 'center' }}>
                                Result: {roundStatus.replace('_', ' ')}
                            </div>
                        </div>

                        <button
                            className={styles.exitBtn}
                            onClick={exitCombatEncounterView}
                        >
                            Confirm & Exit
                        </button>
                    </div>
                </div>
            )}

            {/* 6. ADVANCED STATS COMPARISON MODAL */}
            {isInfoModalOpen && (
                <div
                    className={styles.resolutionOverlay}
                    onClick={() => setIsInfoModalOpen(false)}
                >
                    <div
                        className={styles.resolutionModal}
                        style={{ width: '90%', maxWidth: '800px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            className={styles.resolutionTitle}
                            style={{ color: 'var(--gold-primary)', marginBottom: '20px' }}
                        >
                            COMBAT DATA
                        </h2>

                        <div className={styles.statsContainer}>
                            {/* Player Column */}
                            <div
                                className={styles.statsColumn}
                                style={{ textAlign: 'left', paddingLeft: '5px' }}
                            >
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

                                <div style={{ color: '#aaa', borderBottom: '1px dashed #444', marginTop: '15px', marginBottom: '5px' }}>Equip Ranks</div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Wpn:</span> {pData.equippedRanks.weapon}
                                </div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Arm:</span> {pData.equippedRanks.armour}
                                </div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Shd:</span> {pData.equippedRanks.shield}
                                </div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Hlm:</span> {pData.equippedRanks.helmet}
                                </div>

                                <div style={{ color: '#aaa', borderBottom: '1px dashed #444', marginTop: '15px', marginBottom: '5px' }}>Power Output</div>
                                <div className={`${styles.statRow} ${styles.statPlayerHighlight}`}>
                                    AD: [{pData.attrAd}] + [{pData.equipAd}] = {pData.totalAd}
                                </div>
                                <div className={`${styles.statRow} ${styles.statPlayerHighlight}`}>
                                    DR: [{pData.attrDr}] + [{pData.equipDr}] = {pData.totalDr}
                                </div>
                            </div>

                            {/* Divider Column */}
                            <div
                                className={styles.statsDivider}
                                style={{ fontSize: '1.5rem' }}
                            >
                                VS
                            </div>

                            {/* Enemy Column */}
                            <div
                                className={styles.statsColumn}
                                style={{ textAlign: 'left', paddingLeft: '5px' }}
                            >
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

                                <div style={{ color: '#aaa', borderBottom: '1px dashed #444', marginTop: '15px', marginBottom: '5px' }}>Equip Ranks</div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Wpn:</span> {nData.equippedRanks.weapon}
                                </div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Arm:</span> {nData.equippedRanks.armour}
                                </div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Shd:</span> {nData.equippedRanks.shield}
                                </div>
                                <div
                                    className={styles.statRow}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    <span style={{ color: '#888' }}>Hlm:</span> {nData.equippedRanks.helmet}
                                </div>

                                <div style={{ color: '#aaa', borderBottom: '1px dashed #444', marginTop: '15px', marginBottom: '5px' }}>Power Output</div>
                                <div className={`${styles.statRow} ${styles.statEnemyHighlight}`}>
                                    AD: [{nData.attrAd}] + [{nData.equipAd}] = {nData.totalAd}
                                </div>
                                <div className={`${styles.statRow} ${styles.statEnemyHighlight}`}>
                                    DR: [{nData.attrDr}] + [{nData.equipDr}] = {nData.totalDr}
                                </div>
                            </div>
                        </div>

                        <div style={{ color: '#666', fontSize: '1rem', marginTop: '15px', textAlign: 'center' }}>
                            Format: [Attribute Bonus] + [Equipment Value] = Total
                        </div>

                        <button
                            className={styles.exitBtn}
                            style={{ marginTop: '20px' }}
                            onClick={() => setIsInfoModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombatView;