import React from 'react';
import styles from '../../styles/TravelLoading.module.css';
import { TRAVEL_DURATION_MS } from '../../store/OMD_State_Manager';

const TravelLoadingScreen = () => {
    // Limited to 5 instances
    const steps = Array.from({ length: 5 });

    // Calculate dynamic times in seconds
    const totalDurationS = TRAVEL_DURATION_MS / 1000;
    const stepDurationS = totalDurationS * 0.5; 
    const stepDelayFactor = totalDurationS * 0.15; 

    return (
        <div 
            className={styles.loadingOverlay}
            style={{ 
                '--travel-total-duration': `${totalDurationS}s`,
                '--travel-step-duration': `${stepDurationS}s`
            }}
        >
            {/* Central upper text element */}
            <div className={styles.travelText}>TRAVELING...</div>

            {steps.map((_, index) => {
                // Horizontal distribution from 25% to 73% viewport width
                const leftPos = 5 + (index * 19); 

                return (
                    <div
                        key={index}
                        className={styles.footstep}
                        style={{
                            left: `${leftPos}%`,
                            top: '60%', // Fixed vertical alignment
                            animationDelay: `${index * stepDelayFactor}s` 
                        }}
                    >
                        👣
                    </div>
                );
            })}
        </div>
    );
};

export default TravelLoadingScreen;