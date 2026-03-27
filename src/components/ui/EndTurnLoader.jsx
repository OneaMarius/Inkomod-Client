// File: Client/src/components/ui/EndTurnLoader.jsx
import React, { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import styles from '../../styles/EndTurnLoader.module.css';

// Mapping 12 low-fantasy themes, texts, and unique animation styles to each numeric month
const MONTHLY_LOADERS = {
	1: { icon: '🕯️', text: 'Huddling by the hearth...', animClass: styles.animFlicker, color: '#38bdf8' /* Winter */ },
	2: { icon: '🐺', text: 'Wolves circle the perimeter...', animClass: styles.animBreathe, color: '#38bdf8' /* Winter */ },
	3: { icon: '🌧️', text: 'Thaw brings heavy rains...', animClass: styles.animDrift, color: '#4ade80' /* Spring */ },
	4: { icon: '🌱', text: 'Sowing the first seeds...', animClass: styles.animGrow, color: '#4ade80' /* Spring */ },
	5: { icon: '🐎', text: 'Mustering mounts for campaign...', animClass: styles.animGallop, color: '#4ade80' /* Spring */ },
	6: { icon: '☀️', text: 'High sun beats down...', animClass: styles.animRotate, color: '#facc15' /* Summer */ },
	7: { icon: '⚔️', text: 'Campaign season peaks...', animClass: styles.animClash, color: '#facc15' /* Summer */ },
	8: { icon: '🌾', text: 'Harvesting the golden fields...', animClass: styles.animSway, color: '#facc15' /* Summer */ },
	9: { icon: '🍷', text: 'Pressing the vintage...', animClass: styles.animRock, color: '#f97316' /* Autumn */ },
	10: { icon: '🍂', text: 'The world turns to rust...', animClass: styles.animFall, color: '#f97316' /* Autumn */ },
	11: { icon: '🪓', text: 'Stockpiling wood for frost...', animClass: styles.animChop, color: '#f97316' /* Autumn */ },
	12: { icon: '❄️', text: 'First snows take hold...', animClass: styles.animSpin, color: '#38bdf8' /* Winter */ },
};

const EndTurnLoader = () => {
	// Lock the month state on component mount to prevent visual glitches mid-animation
	// getState() reads the store once without subscribing to updates
	const [lockedMonthData] = useState(() => {
		const currentMonth = useGameState.getState().gameState?.time?.currentMonth || 1;
		// Defaulting to Month 1 if data is missing, ensuring the component never crashes
		return MONTHLY_LOADERS[currentMonth] || MONTHLY_LOADERS[1];
	});

	return (
		<div className={styles.overlay}>
			<div className={styles.content}>
				{/* The single, centered icon utilizes the unique animation class defined in the map */}
				<div className={`${styles.iconContainer} ${lockedMonthData.animClass}`}>{lockedMonthData.icon}</div>

				{/* Thematic text, color-coded by season */}
				<h2
					className={styles.loaderText}
					style={{ color: lockedMonthData.color, textShadow: `0 0 10px ${lockedMonthData.color}40` }}
				>
					{lockedMonthData.text}
				</h2>

				{/* Visual feedback progress bar */}
				<div className={styles.progressBar}>
					<div className={styles.progressFill}></div>
				</div>
			</div>
		</div>
	);
};

export default EndTurnLoader;
