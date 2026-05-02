// File: Client/src/components/ui/TransitionOverlay.jsx
import React, { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import styles from '../../styles/TransitionOverlay.module.css';
import { DB_GAME_TIPS } from '../../data/DB_GameTips';

const TransitionOverlay = ({ type, durationMs, payload }) => {
    const [activeTip, setActiveTip] = useState('');
    const [loadProgress, setLoadProgress] = useState(0);
    const [iconsVisible, setIconsVisible] = useState(false);
    
    const activeEntities = useGameState((state) => state.gameState?.activeEntities || []);
    const durationSec = durationMs / 1000;

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * DB_GAME_TIPS.length);
        setActiveTip(DB_GAME_TIPS[randomIndex]);

        let preloaderTimeout;
        let forcedProgressInterval;

        if (type === 'ENTER_POI') {
            preloaderTimeout = setTimeout(() => {
                setIconsVisible(true);
                let loadedCount = 0;
                
                const imagesToLoad = [`/pois/${payload}.jpg`];
                activeEntities.forEach(npc => {
                   if(npc.avatarId) imagesToLoad.push(`/assets/avatars/${npc.avatarId}.jpg`);
                });

                const totalImages = imagesToLoad.length;
                
                if (totalImages === 0) {
                     setLoadProgress(100);
                     return;
                }

                imagesToLoad.forEach((src) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => {
                        loadedCount++;
                        setLoadProgress(Math.floor((loadedCount / totalImages) * 100));
                    };
                    img.onerror = () => {
                         loadedCount++;
                         setLoadProgress(Math.floor((loadedCount / totalImages) * 100));
                    }
                });

                const msPerPercent = (durationMs - 200) / 100;
                let fallbackProgress = 0;
                forcedProgressInterval = setInterval(() => {
                    fallbackProgress++;
                    setLoadProgress((prev) => Math.max(prev, fallbackProgress));
                    if (fallbackProgress >= 100) clearInterval(forcedProgressInterval);
                }, msPerPercent);

            }, 200);
        }

        return () => {
            clearTimeout(preloaderTimeout);
            clearInterval(forcedProgressInterval);
        };
    }, [type, payload, durationMs, activeEntities]);

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
                        
                        {iconsVisible && (
                            <div
                                style={{
                                    marginTop: '25px',
                                    display: 'flex',
                                    gap: '20px', // Mărit spațiul între iconițe
                                    fontSize: '2rem', // Mărită dimensiunea iconițelor
                                    filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.4))'
                                }}
                            >
                                <div className={styles.animatedElement} style={{ animationDelay: '0s' }}>🗝️</div>
                                <div className={styles.animatedElement} style={{ animationDelay: '0.2s' }}>🚪</div>
                                <div className={styles.animatedElement} style={{ animationDelay: '0.4s' }}>🕯️</div>
                            </div>
                        )}

                        <div className={styles.loadingBarContainer}>
                            <div 
                                className={styles.loadingBarFill} 
                                style={{ width: `${loadProgress}%` }}
                            ></div>
                        </div>
                        <div className={styles.loadingText}>
                            ASSETS LOADED: {loadProgress}%
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