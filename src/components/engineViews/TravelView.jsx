// File: Client/src/components/engineViews/TravelView.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { getAvailableRoutes } from '../../engine/ENGINE_World_Travel.js';
import Button from '../Button';
import styles from '../../styles/TravelView.module.css';
import { WORLD } from '../../data/GameWorld.js';

const TravelView = ({ triggerSync, onTravelComplete }) => {
	const gameState = useGameState((state) => state.gameState);
	const executeTravel = useGameState((state) => state.executeTravel);

	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	if (!gameState) return <div className={styles.loadingText}>Loading Matrix...</div>;

	// Extragem toate resursele necesare pentru validări individuale în UI
	const currentPlayerRank = gameState.player?.identity?.rank || 1;
	const currentPlayerAp = gameState.player?.progression?.actionPoints || 0;
	const currentPlayerCoins = gameState.player?.inventory?.silverCoins || 0;

	// Extragem sezonul și modificatorul de AP din GameWorld
	const activeSeason = gameState?.time?.activeSeason || 'spring';
	const seasonApModifier = WORLD.TIME.seasons[activeSeason]?.extraApForTravel || 0;
	// Generate routes using the travel engine module (acum pasăm seasonApModifier în loc de 0)
	const availableRoutes = getAvailableRoutes(gameState.player, gameState.location.currentWorldId, seasonApModifier);

	const handleTransit = async (route) => {
		if (route.isAccessible && !isProcessing) {
			setIsProcessing(true);
			setErrorMessage('');

			try {
				const result = executeTravel(route.destinationId);

				if (result.status === 'SUCCESS') {
					await triggerSync();
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
			{/* NOU: Feedback vizual pentru penalizările de sezon */}
			{seasonApModifier > 0 && (
				<div style={{ color: '#fbbf24', textAlign: 'center', margin: '0px 20px', fontStyle: 'italic', fontSize: '0.9rem' }}>
					⚠️ Seasonal Conditions ({activeSeason}): Base travel costs increased by +{seasonApModifier} AP.
				</div>
			)}
			{errorMessage && <div className={styles.errorBox}>{errorMessage}</div>}

			{availableRoutes.length === 0 ? (
				<p className={styles.emptyText}>No adjacent transit gates detected.</p>
			) : (
				<div className={styles.routeList}>
					{availableRoutes.map((route) => {
						// Verificări individuale pentru colorare selectivă
						const isRankBlocked = currentPlayerRank < route.requiredRank;
						const isApBlocked = currentPlayerAp < route.totalApCost;
						const isCoinBlocked = currentPlayerCoins < route.totalCoinCost;

						return (
							<div
								key={route.destinationId}
								className={`${styles.routeCard} ${route.isAccessible ? styles.accessibleCard : styles.inaccessibleCard}`}
							>
								<div className={styles.routeDetails}>
									<div className={`${styles.destinationName} ${route.isAccessible ? styles.accessibleText : styles.inaccessibleText}`}>
										{route.destinationName.replace(/_/g, ' ')}
									</div>
									<div className={styles.gateInfo}>
										<span className={styles.infoRow}>Gate: {route.routeName.replace(/_/g, ' ')}</span>
										<span className={styles.infoRow}>Region: {route.zoneClass}</span>
									</div>
								</div>

								<div className={styles.actionSection}>
									{/* Am folosit costInfoAccessible ca bază pentru a evita ca CSS-ul global de eroare să facă tot textul roșu din start */}
									<div
										className={styles.costInfoAccessible}
										style={{ marginBottom: '10px' }}
									>
										<span style={{ color: isApBlocked ? '#f44336' : 'inherit' }}>
											<span className={styles.apHighlight}>{route.totalApCost} AP</span>
										</span>
										<span className={styles.separator}>|</span>{' '}
										<span style={{ color: isCoinBlocked ? '#f44336' : 'inherit' }}>
											{route.totalCoinCost}
											<span className={styles.coinIcon}>C</span>
										</span>
										{route.requiredRank > 0 && (
											<>
												<span className={styles.separator}>|</span>
												<span style={{ color: isRankBlocked ? '#f44336' : 'inherit' }}>Rank {route.requiredRank}</span>
											</>
										)}
									</div>

									<Button
										onClick={() => handleTransit(route)}
										disabled={!route.isAccessible || isProcessing}
									>
										{isProcessing
											? 'Routing...'
											: route.isAccessible
												? 'Engage Transit'
												: isRankBlocked
													? 'Rank Too Low'
													: isApBlocked
														? 'Insufficient AP'
														: 'Insufficient Coins'}
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default TravelView;
