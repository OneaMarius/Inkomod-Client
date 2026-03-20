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

	if (!gameState) return <div>Loading Matrix...</div>;

	// Generăm rutele folosind motorul
	const availableRoutes = getAvailableRoutes(
		gameState.player,
		gameState.location.currentWorldId,
		0, // Placeholder pentru seasonModifier
	);

	const handleTransit = async (route) => {
		if (route.isAccessible && !isProcessing) {
			setIsProcessing(true);
			setErrorMessage('');

			try {
				// 1. Mutăm memoria Zustand prin apelul de motor
				const result = executeTravel(route.destinationId);

				if (result.status === 'SUCCESS') {
					// 2. Declanșăm CoreEngine pentru API PUT (Save Game)
					await triggerSync();

					// 3. Trimitem rezultatul înapoi în CoreEngine pentru a intercepta evenimentele
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

			{/* Afișăm doar mesajele de eroare aici. Evenimentele de succes vor fi afișate de EventView */}
			{errorMessage && (
				<div
					style={{
						padding: '10px',
						marginBottom: '15px',
						border: '1px solid #ff4444',
						backgroundColor: '#2a0000',
						color: '#ffdddd',
					}}
				>
					{errorMessage}
				</div>
			)}

			{availableRoutes.length === 0 ? (
				<p className={styles.emptyText}>
					No adjacent transit gates detected.
				</p>
			) : (
				<div className={styles.routeList}>
					{availableRoutes.map((route) => (
						<div
							key={route.destinationId}
							className={`${styles.routeCard} ${
								route.isAccessible
									? styles.accessibleCard
									: styles.inaccessibleCard
							}`}
						>
							<div>
								<div
									className={`${styles.destinationName} ${
										route.isAccessible
											? styles.accessibleText
											: styles.inaccessibleText
									}`}
								>
									{route.destinationName.replace(/_/g, ' ')}
								</div>
								<div className={styles.gateInfo}>
									Gate: {route.routeName.replace(/_/g, ' ')} | Region:{' '}
									{route.zoneClass}
								</div>
							</div>

							<div className={styles.actionSection}>
								<div
									className={
										route.isAccessible
											? styles.costInfoAccessible
											: styles.costInfoInaccessible
									}
								>
									Cost: {route.totalApCost} AP | {route.totalCoinCost}{' '}
									Coins
								</div>
								<Button
									onClick={() => handleTransit(route)}
									disabled={!route.isAccessible || isProcessing}
								>
									{isProcessing
										? 'Routing...'
										: route.isAccessible
											? 'Engage Transit'
											: 'Insufficient Resources'}
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
