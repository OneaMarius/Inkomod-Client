// File: Client/src/components/engineViews/TravelView.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { getAvailableRoutes } from '../../engine/ENGINE_World_Travel.js';
import Button from '../Button';
import styles from '../../styles/TravelView.module.css';

const TravelView = ({ triggerSync, onTravelComplete }) => {
    const gameState = useGameState((state) => state.gameState);
    const executeTravel = useGameState((state) => state.executeTravel);

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (!gameState) return <div className={styles.loadingText}>Loading Matrix...</div>;

    // Generate routes using the travel engine
    const availableRoutes = getAvailableRoutes(
        gameState.player,
        gameState.location.currentWorldId,
        0, // Placeholder for seasonModifier
    );

    const handleTransit = async (route) => {
        if (route.isAccessible && !isProcessing) {
            setIsProcessing(true);
            setErrorMessage('');

            try {
                // 1. Mutate Zustand memory via the engine call
                const result = executeTravel(route.destinationId);

                if (result.status === 'SUCCESS') {
                    // 2. Trigger CoreEngine to perform API PUT (Save Game)
                    await triggerSync();

                    // 3. Send result back to CoreEngine to intercept and handle events
                    if (onTravelComplete) {
                        onTravelComplete(result);
                    }
                } else {
                    setErrorMessage(`Transit Failed: ${result.status}`);
                }
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Transit Matrix</h2>

            {/* Display error messages only. Success events are handled by EventView. */}
            {errorMessage && (
                <div className={styles.errorBox}>
                    {errorMessage}
                </div>
            )}

            {availableRoutes.length === 0 ? (
                <p className={styles.emptyText}>No adjacent transit gates detected.</p>
            ) : (
                <div className={styles.routeList}>
                    {availableRoutes.map((route) => (
                        <div
                            key={route.destinationId}
                            className={`${styles.routeCard} ${route.isAccessible ? styles.accessibleCard : styles.inaccessibleCard}`}
                        >
                            <div className={styles.routeDetails}>
                                <div className={`${styles.destinationName} ${route.isAccessible ? styles.accessibleText : styles.inaccessibleText}`}>
                                    {route.destinationName.replace(/_/g, ' ')}
                                </div>
                                <div className={styles.gateInfo}>
                                    Gate: {route.routeName.replace(/_/g, ' ')} | Region: {route.zoneClass}
                                </div>
                            </div>

                            <div className={styles.actionSection}>
                                <div className={route.isAccessible ? styles.costInfoAccessible : styles.costInfoInaccessible}>
                                    Cost: {route.totalApCost} AP | {route.totalCoinCost} Coins
                                </div>
                                <Button
                                    onClick={() => handleTransit(route)}
                                    disabled={!route.isAccessible || isProcessing}
                                >
                                    {isProcessing ? 'Routing...' : route.isAccessible ? 'Engage Transit' : 'Insufficient Resources'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TravelView;