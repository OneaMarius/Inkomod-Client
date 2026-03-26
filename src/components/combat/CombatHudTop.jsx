// File: Client/src/components/combat/CombatHudTop.jsx
import styles from '../../styles/CombatView.module.css';
import playerImg from '../../assets/player.png';
import npcImg from '../../assets/npc.png';

const CombatHudTop = ({
    player,
    knightName,
    enemy,
    playerHpPercent,
    playerWoundPercent,
    enemyHpPercent,
    setIsInfoModalOpen
}) => {
    return (
        <div className={styles.hudTop}>
            {/* Player Side */}
            <div className={styles.portraitBox}>
                <img src={playerImg} alt='Player' className={styles.portraitImg} />
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

            {/* Middle Controls */}
            <div className={styles.vsIcon}>
                <span>⚔️</span>
                <button
                    className={styles.statsBtn}
                    onClick={() => setIsInfoModalOpen(true)}
                >
                    Stats
                </button>
            </div>

            {/* Enemy Side */}
            <div className={styles.portraitBox}>
                <img src={npcImg} alt='Enemy' className={styles.portraitImg} />
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
    );
};

export default CombatHudTop;