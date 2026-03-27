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

	// Generate routes using the travel engine module
	const availableRoutes = getAvailableRoutes(gameState.player, gameState.location.currentWorldId, 0);

	const handleTransit = async (route) => {
		if (route.isAccessible && !isProcessing) {
			setIsProcessing(true);
			setErrorMessage('');

			try {
				// Mutate state memory via engine execution
				const result = executeTravel(route.destinationId);

				if (result.status === 'SUCCESS') {
					// Trigger synchronization for save state
					await triggerSync();

					// Dispatch result to event handler
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

			{errorMessage && <div className={styles.errorBox}>{errorMessage}</div>}

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
									{/* Gate and Region separated into distinct rows */}
									<span className={styles.infoRow}>Gate: {route.routeName.replace(/_/g, ' ')}</span>
									<span className={styles.infoRow}>Region: {route.zoneClass}</span>
								</div>
							</div>

							<div className={styles.actionSection}>
								<div className={route.isAccessible ? styles.costInfoAccessible : styles.costInfoInaccessible}>
									<span className={styles.apHighlight}>{route.totalApCost} AP</span> <span className={styles.separator}>|</span>{' '}
									{route.totalCoinCost}<span className={styles.coinIcon}>C</span>
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
