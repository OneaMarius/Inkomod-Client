import React from 'react';
import styles from '../../styles/TravelLoading.module.css';

const TravelLoadingScreen = () => {
    // Initialize an array of 7 elements to represent the traversal steps
    const steps = Array.from({ length: 7 });

    return (
        <div className={styles.loadingOverlay}>
            {steps.map((_, index) => {
                // Calculate relative positioning to form a diagonal trajectory (bottom-left to top-right)
                const leftPos = 15 + (index * 10);
                const bottomPos = 10 + (index * 12);

                return (
                    <div
                        key={index}
                        className={styles.footstep}
                        style={{
                            left: `${leftPos}%`,
                            bottom: `${bottomPos}%`,
                            // Stagger the animation start time for sequential rendering
                            animationDelay: `${index * 0.4}s` 
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