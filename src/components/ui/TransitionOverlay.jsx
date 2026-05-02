// File: Client/src/components/ui/TransitionOverlay.jsx
import React, { useState, useEffect } from 'react';
import styles from '../../styles/TransitionOverlay.module.css';
import { DB_GAME_TIPS } from '../../data/DB_GameTips';

const TransitionOverlay = ({ type, durationMs, payload }) => {
    const [activeTip, setActiveTip] = useState('');
    const durationSec = durationMs / 1000;

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * DB_GAME_TIPS.length);
        setActiveTip(DB_GAME_TIPS[randomIndex]);
    }, []);

    const renderContent = () => {
        switch (type) {
            case 'ENTER_POI': {
                const formattedTitle = payload
                    ? payload.replace(/_/g, ' ').toUpperCase()
                    : 'ESTABLISHMENT';
                return (
                    <>
                        <div
                            className={styles.transitionTitle}
                            style={{ color: 'var(--gold-primary)' }}
                        >
                            ENTERING {formattedTitle}
                        </div>
                        <div
                            style={{
                                marginTop: '20px',
                                display: 'flex',
                                gap: '15px',
                                color: 'var(--gold-primary)',
                                fontWeight: 'bold'
                            }}
                        >
                            <div
                                className={styles.animatedElement}
                                style={{ animationDelay: '0s' }}
                            >
                                /
                            </div>
                            <div
                                className={styles.animatedElement}
                                style={{ animationDelay: '0.2s' }}
                            >
                                /
                            </div>
                            <div
                                className={styles.animatedElement}
                                style={{ animationDelay: '0.4s' }}
                            >
                                /
                            </div>
                        </div>
                        <div className={styles.transitionTipContainer}>
                            <span className={styles.transitionTipLabel}>TIP: </span>
                            <span className={styles.transitionTipText}>{activeTip}</span>
                        </div>
                    </>
                );
            }
            default:
                return <div className={styles.transitionTitle}>LOADING...</div>;
        }
    };

    return (
        <div
            className={styles.overlayContainer}
            style={{
                '--transition-duration': `${durationSec}s`,
            }}
        >
            {renderContent()}
        </div>
    );
};

export default TransitionOverlay;