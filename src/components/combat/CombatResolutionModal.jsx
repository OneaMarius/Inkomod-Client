// File: Client/src/components/combat/CombatResolutionModal.jsx
import styles from '../../styles/CombatView.module.css';

const formatCombatOutcome = (outcomeCode) => {
    const outcomeMap = {
        'WIN_SURRENDER': 'WIN by Enemy Surrender',
        'WIN_FLEE': 'WIN by Enemy Fleeing',
        'WIN_DEATH': 'WIN by Enemy Death',
        'LOSE_SURRENDER': 'DEFEAT by Player Surrender',
        'LOSE_FLEE': 'DEFEAT by Player Fleeing',
        'LOSE_DEATH': 'DEFEAT (Player Killed)'
    };
    return outcomeMap[outcomeCode] || outcomeCode.replace('_', ' ');
};

const CombatResolutionModal = ({
    player,
    knightName,
    enemy,
    roundStatus,
    exitCombatEncounterView
}) => {
    let modalTitle = 'Combat Finished';
    let titleClass = styles.drawText;

    if (roundStatus.includes('WIN')) {
        modalTitle = 'Victory';
        titleClass = styles.winText;
    } else if (roundStatus.includes('LOSE')) {
        modalTitle = 'Defeat';
        titleClass = styles.loseText;
    }

    return (
        <div className={styles.resolutionOverlay}>
            <div className={styles.resolutionModal}>
                <h2 className={`${styles.resolutionTitle} ${titleClass}`}>{modalTitle}</h2>

                <div className={styles.resolutionSummaryBox}>
                    <div className={styles.resolutionSummaryHeader}>Combat Summary</div>
                    
                    <div className={styles.resolutionSummaryRow}>
                        <span className={styles.resolutionSummaryLabel}>{knightName || 'You'}:</span>
                        <span className={styles.resolutionSummaryPlayerHp}>
                            {player.biology.hpCurrent} / {player.biology.hpMax} HP
                        </span>
                    </div>
                    
                    <div className={styles.resolutionSummaryRow}>
                        <span className={styles.resolutionSummaryLabel}>{enemy.entityName || enemy.name}:</span>
                        <span className={styles.resolutionSummaryEnemyHp}>
                            {enemy.biology.hpCurrent} / {enemy.biology.hpMax} HP
                        </span>
                    </div>
                    
                    <div className={styles.resolutionSummaryResult}>
                        Result: {formatCombatOutcome(roundStatus)}
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
    );
};

export default CombatResolutionModal;