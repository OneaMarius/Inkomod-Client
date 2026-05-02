// File: Client/src/components/ui/TravelLoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import styles from '../../styles/TravelLoading.module.css';
import transitionStyles from '../../styles/TransitionOverlay.module.css';
import { TRAVEL_DURATION_MS } from '../../store/OMD_State_Manager';
import { DB_GAME_TIPS } from '../../data/DB_GameTips';

const TravelLoadingScreen = () => {
    const [activeTip, setActiveTip] = useState('');
    const totalDurationS = TRAVEL_DURATION_MS / 1000;

    const hasMount = useGameState((state) => state.gameState?.player?.equipment?.hasMount);
    const location = useGameState((state) => state.gameState?.location);
    const activeSeason = useGameState((state) => state.gameState?.time?.activeSeason || 'spring');

    const currentNode = DB_LOCATIONS_ZONES.find(
        (node) => node.worldId === location?.currentWorldId
    );
    const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';
    const isWinter = activeSeason === 'winter';

    let activePathClass = styles.pathUntamed;
    if (isCivilizedZone) {
        activePathClass = isWinter ? styles.pathCivilizedWinter : styles.pathCivilized;
    } else {
        activePathClass = isWinter ? styles.pathUntamedWinter : styles.pathUntamed;
    }

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

            <div className={`${styles.travelPathContainer} ${activePathClass}`}>
                <div className={styles.travelEntity}>
                    {hasMount ? (
                        <img 
                            src="/assets/ui/knightOnHorse.png" 
                            alt="Riding" 
                            className={styles.entityMount} 
                        />
                    ) : (
                        <img 
                            src="/assets/ui/knightOnFoot.png" 
                            alt="Walking" 
                            className={styles.entityWalk} 
                        />
                    )}
                </div>
            </div>

            <div className={transitionStyles.transitionTipContainer} style={{ position: 'absolute', bottom: '15%' }}>
                <span className={transitionStyles.transitionTipLabel}>TIP: </span>
                <span className={transitionStyles.transitionTipText}>{activeTip}</span>
            </div>
        </div>
    );
};

export default TravelLoadingScreen;