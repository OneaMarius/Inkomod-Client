// File: Client/src/components/engineViews/QuestsView.jsx
import useGameState from '../../store/OMD_State_Manager';
import styles from '../../styles/QuestsView.module.css';

const QuestsView = () => {
    const player = useGameState((state) => state.gameState?.player);

    if (!player) return null;

    // Citim numărul de trofee direct din inventar
    const trophyCount = player.inventory?.trophySlots?.length || 0;
    const requiredTrophies = 7;
    
    // Calculăm progresul (maxim 100%)
    const progressPct = Math.min(100, (trophyCount / requiredTrophies) * 100);
    const isComplete = trophyCount >= requiredTrophies;

    return (
        <div className={styles.questsContainer}>
            <h1 className={styles.pageTitle}>Active Quests</h1>

            <div className={styles.questCard}>
                <div className={styles.questHeader}>
                    <h2 className={styles.questTitle}>Main Quest: The Cull of the Nephilim</h2>
                    <span className={isComplete ? styles.statusComplete : styles.statusActive}>
                        {isComplete ? 'Ready to Turn In' : 'Active'}
                    </span>
                </div>

                <p className={styles.questLore}>
                    King Midas has decreed that the Nephilim threat must be eradicated. 
                    Only those who prove their strength by bringing back the severed heads of these demigods 
                    will earn the title of Champion of the Realm.
                </p>

                <div className={styles.progressSection}>
                    <div className={styles.progressLabels}>
                        <span>Nephilim Trophies Collected</span>
                        <span style={{ color: isComplete ? 'var(--gold-primary)' : '#fff' }}>
                            {trophyCount} / {requiredTrophies}
                        </span>
                    </div>
                    <div className={styles.progressBarBg}>
                        <div
                            className={styles.progressBarFill}
                            style={{ 
                                width: `${progressPct}%`, 
                                backgroundColor: isComplete ? 'var(--gold-primary)' : '#8b0000',
                                boxShadow: isComplete ? '0 0 10px rgba(212, 175, 55, 0.8)' : 'none'
                            }}
                        ></div>
                    </div>
                </div>

                <div className={styles.questFooter}>
                    {isComplete ? (
                        <p className={styles.footerTextComplete}>
                            You have gathered enough trophies. Return to the Royal Palace in Domikon to claim your glory!
                        </p>
                    ) : (
                        <p className={styles.footerTextActive}>
                            The hunt continues. Search the untamed wilds for the Nephilim.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestsView;