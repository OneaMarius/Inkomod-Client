// File: Client/src/components/ui/TransitionOverlay.jsx
import React, { useState, useEffect } from 'react';
import transitionStyles from '../../styles/TransitionOverlay.module.css';
import { DB_GAME_TIPS } from '../../data/DB_GameTips';

const TransitionOverlay = ({ type, durationMs, payload }) => {
	const [progress, setProgress] = useState(0);

	const durationSec = durationMs / 1000;

	// Tip initialization
	const [activeTip, setActiveTip] = useState(null);
	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * DB_GAME_TIPS.length);
		setActiveTip(DB_GAME_TIPS[randomIndex]);
	}, []);

	// Progress percentage calculation
	useEffect(() => {
		// The bar fills during the first 85% of the total duration
		const fillDurationMs = durationMs * 0.85;
		const intervalTime = fillDurationMs / 100;
		let currentProgress = 0;

		const progressInterval = setInterval(() => {
			currentProgress += 1;
			if (currentProgress >= 100) {
				currentProgress = 100;
				clearInterval(progressInterval);
			}
			setProgress(currentProgress);
		}, intervalTime);

		return () => clearInterval(progressInterval);
	}, [durationMs]);

	const renderContent = () => {
		switch (type) {
			case 'ENTER_POI': {
				const formattedTitle = payload
					? payload.replace(/_/g, ' ').toUpperCase()
					: 'ESTABLISHMENT';
				return (
					<>
						<div
							className={transitionStyles.transitionTitle}
							style={{ color: 'var(--gold-primary)' }}
						>
							ENTERING {formattedTitle}
						</div>

						<div
							style={{
								marginTop: '25px',
								display: 'flex',
								gap: '20px',
								fontSize: '2rem',
								filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.4))',
							}}
						>
							<div
								className={transitionStyles.animatedElement}
								style={{ animationDelay: '0s' }}
							>
								🗝️
							</div>
							<div
								className={transitionStyles.animatedElement}
								style={{ animationDelay: '0.2s' }}
							>
								🚪
							</div>
							<div
								className={transitionStyles.animatedElement}
								style={{ animationDelay: '0.4s' }}
							>
								🕯️
							</div>
						</div>

						<div className={transitionStyles.loadingBarContainer}>
							<div className={transitionStyles.loadingBarFill}></div>
						</div>

						{/* The synchronized percentage text */}
						<div className={transitionStyles.loadingText}>
							ASSETS LOADED: {progress}%
						</div>

						<div className={transitionStyles.transitionTipContainer}>
							{activeTip && (
								<>
									<span
										className={transitionStyles.transitionTipLabel}
									>
										TIP {activeTip.number} - {activeTip.label}:{' '}
									</span>
									<span className={transitionStyles.transitionTipText}>
										{activeTip.text}
									</span>
								</>
							)}
						</div>
					</>
				);
			}
			default:
				return (
					<div className={transitionStyles.transitionTitle}>
						LOADING...
					</div>
				);
		}
	};

	return (
		<div
			className={transitionStyles.overlayContainer}
			style={{
				'--transition-duration': `${durationSec}s`,
			}}
		>
			{renderContent()}
		</div>
	);
};

export default TransitionOverlay;
