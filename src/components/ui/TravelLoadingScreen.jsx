// File: Client/src/components/ui/TravelLoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import styles from '../../styles/TravelLoading.module.css';
import transitionStyles from '../../styles/TransitionOverlay.module.css';
import { TRAVEL_DURATION_MS } from '../../store/OMD_State_Manager';
import { DB_GAME_TIPS } from '../../data/DB_GameTips';

const TravelLoadingScreen = () => {
    const [activeTip, setActiveTip] = useState('');
    const totalDurationS = TRAVEL_DURATION_MS / 1000;

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * DB_GAME_TIPS.length);
        setActiveTip(DB_GAME_TIPS[randomIndex]);
    }, []);

    return (
        <div 
            className={styles.loadingOverlay}
            style={{ 
                '--travel-total-duration': `${totalDurationS}s`
            }}
        >
            <div className={styles.travelText}>TRAVELING...</div>

            <div className={styles.wheelContainer}>
                <div className={styles.wagonWheel}>🛞</div>
            </div>

            <div className={transitionStyles.transitionTipContainer} style={{ position: 'absolute', bottom: '15%' }}>
                <span className={transitionStyles.transitionTipLabel}>TIP: </span>
                <span className={transitionStyles.transitionTipText}>{activeTip}</span>
            </div>
        </div>
    );
};

export default TravelLoadingScreen;