// File: Client/src/components/engineViews/POIActions.jsx
import { useState } from 'react';
import { formatForUI } from '../../utils/NameFormatter.js';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import styles from '../../styles/GameViewport.module.css';

const POIActions = ({ actionTags, player, doInteraction, regionalExchangeRate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const completedQuests = player?.progression?.completedQuests || [];

    // Filter tags: 
    // 1. Remove navigation tags
    // 2. Remove tags that are already in the completedQuests array
    const specialTags = actionTags?.filter((tag) => {
        const isNavigation = tag === 'Enter_Location' || tag === 'Exit_Location';
        const isCompleted = completedQuests.includes(tag);
        return !isNavigation && !isCompleted;
    }) || [];

    const hasActions = specialTags.length > 0;

    return (
        <div className={styles.hostileSection} style={{ marginBottom: '20px' }}>
            <button
                className={`${styles.btnHostileToggle} ${hasActions ? styles.hostileToggleActiveChallenge : styles.hostileToggleDisabled}`}
                onClick={() => hasActions && setIsOpen(!isOpen)}
                disabled={!hasActions}
            >
                <span>📜 Location Actions</span>
                <span>
                    {!hasActions 
                        ? '🔒' 
                        : isOpen ? '▲' : '▼'
                    }
                </span>
            </button>

            {isOpen && hasActions && (
                <div className={styles.hostileActionContainer} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {specialTags.map(tag => {
                        const actionDef = DB_INTERACTION_ACTIONS[tag];
                        if (!actionDef) return null;
                        
                        return (
                            <button
                                key={tag}
                                className={styles.btnAction}
                                onClick={() => doInteraction(tag, null, regionalExchangeRate)}
                                title={actionDef.description}
                            >
                                <span className={styles.actionName}>
                                    {formatForUI(actionDef.actionName || actionDef.id)}
                                </span>
                                <span className={styles.routeIcon}>🏛️</span>
                                <span className={styles.actionCost}>
                                    {actionDef.apCost}<span className={styles.apSymbol}>◈</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default POIActions;