// File: Client/src/components/ui/EndTurnLoader.jsx
import React, { useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import styles from '../../styles/EndTurnLoader.module.css';
import transitionStyles from '../../styles/TransitionOverlay.module.css';
import { DB_GAME_TIPS } from '../../data/DB_GameTips';

// Mapping 12 realistic seasonal themes, texts, and unique animation styles to each numeric month
const MONTHLY_LOADERS = {
	1: {
		month: 'January',
		icon: '🕯️',
		text: 'Waiting out the deep frost...',
		animClass: styles.animFlicker,
		color: '#38bdf8',
	},
	2: {
		month: 'February',
		icon: '❄️',
		text: 'Ice slowly thaws on the roads...',
		animClass: styles.animSpin,
		color: '#38bdf8',
	},
	3: {
		month: 'March',
		icon: '🌧️',
		text: 'Heavy rains wash the plains...',
		animClass: styles.animRainFall,
		color: '#4ade80',
	},
	4: {
		month: 'April',
		icon: '🌱',
		text: 'Sowing the first spring seeds...',
		animClass: styles.animGrow,
		color: '#4ade80',
	},
	5: {
		month: 'May',
		icon: '🧭',
		text: "Mapping the season's trade routes...",
		animClass: styles.animCompass,
		color: '#4ade80',
	},
	6: {
		month: 'June',
		icon: '☀️',
		text: 'High sun beats down on the paths...',
		animClass: styles.animRotate,
		color: '#facc15',
	},
	7: {
		month: 'July',
		icon: '🏕️',
		text: 'Pitching camp under the clear sky...',
		animClass: styles.animFlicker,
		color: '#facc15',
	},
	8: {
		month: 'August',
		icon: '🌾',
		text: 'Harvesting the golden fields...',
		animClass: styles.animSway,
		color: '#facc15',
	},
	9: {
		month: 'September',
		icon: '🍷',
		text: 'Pressing the late vintage...',
		animClass: styles.animRock,
		color: '#f97316',
	},
	10: {
		month: 'October',
		icon: '🍂',
		text: 'The world turns to rust...',
		animClass: styles.animFall,
		color: '#f97316',
	},
	11: {
		month: 'November',
		icon: '🪵',
		text: 'Stockpiling wood for the frost...',
		animClass: styles.animHit,
		color: '#f97316',
	},
	12: {
		month: 'December',
		icon: '💨',
		text: 'Harsh winds begin to howl...',
		animClass: styles.animWhoosh,
		color: '#38bdf8',
	},
};

const EndTurnLoader = () => {
	const [lockedMonthData] = useState(() => {
		const currentMonth =
			useGameState.getState().gameState?.time?.currentMonth || 1;

		// Calculate the upcoming month. If current is 12, it wraps to 1.
		const nextMonth = (currentMonth % 12) + 1;

		return MONTHLY_LOADERS[nextMonth] || MONTHLY_LOADERS[1];
	});

	const [activeTip, setActiveTip] = useState(null);

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * DB_GAME_TIPS.length);
		setActiveTip(DB_GAME_TIPS[randomIndex]);
	}, []);

	return (
		<div className={styles.overlay}>
			<div className={styles.content}>
				{/* The month name displayed above the icon */}
				<h3
					style={{
						color: lockedMonthData.color,
						fontFamily: '"VT323", monospace',
						fontSize: '1.8rem',
						margin:
							'0 0 -15px 0' /* Negative margin to pull the icon closer */,
						textTransform: 'uppercase',
						letterSpacing: '3px',
						textShadow: `0 0 10px ${lockedMonthData.color}40`,
					}}
				>
					{lockedMonthData.month}
				</h3>

				<div
					className={`${styles.iconContainer} ${lockedMonthData.animClass}`}
				>
					{lockedMonthData.icon}
				</div>

				<h2
					className={styles.loaderText}
					style={{
						color: lockedMonthData.color,
						textShadow: `0 0 10px ${lockedMonthData.color}40`,
					}}
				>
					{lockedMonthData.text}
				</h2>

				<div className={styles.progressBar}>
					<div className={styles.progressFill}></div>
				</div>

				<div
					className={transitionStyles.transitionTipContainer}
					style={{ marginTop: '30px' }}
				>
					{activeTip && (
						<>
							<span className={transitionStyles.transitionTipLabel}>
								TIP {activeTip.number} - {activeTip.label}:{' '}
							</span>
							<span className={transitionStyles.transitionTipText}>
								{activeTip.text}
							</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default EndTurnLoader;
