import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { PLUTO_Formulas } from '../../utils/PLUTO_Engine';
import Button from '../Button';
import styles from '../../styles/TravelView.module.css';

const TravelView = ({ triggerSync }) => {
	const currentState = useGameState();
	const executeTravel = useGameState((state) => state.executeTravel);
	const [isProcessing, setIsProcessing] = useState(false);

	const availableRoutes = PLUTO_Formulas.Get_Available_Routes(currentState);

	const handleTransit = async (route) => {
		if (route.Is_Accessible && !isProcessing) {
			setIsProcessing(true);

			try {
				// 1. Mutate local Zustand memory
				executeTravel(route);

				// 2. Trigger the CoreEngine function to execute the API PUT request
				await triggerSync();
			} finally {
				// Ensures the UI unlocks even if the network request fails
				setIsProcessing(false);
			}
		}
	};

	return (
		<div className={styles.container}>
			<h2 className={styles.header}>Transit Matrix</h2>

			{availableRoutes.length === 0 ? (
				<p className={styles.emptyText}>
					No adjacent transit gates detected.
				</p>
			) : (
				<div className={styles.routeList}>
					{availableRoutes.map((route) => (
						<div
							key={route.Destination_ID}
							className={`${styles.routeCard} ${
								route.Is_Accessible
									? styles.accessibleCard
									: styles.inaccessibleCard
							}`}
						>
							<div>
								<div
									className={`${styles.destinationName} ${
										route.Is_Accessible
											? styles.accessibleText
											: styles.inaccessibleText
									}`}
								>
									{route.Destination_Name.replace(/_/g, ' ')}
								</div>
								<div className={styles.gateInfo}>
									Gate: {route.Gate_Name.replace(/_/g, ' ')} | Region:{' '}
									{route.Zone_Class}
								</div>
							</div>

							<div className={styles.actionSection}>
								<div
									className={
										route.Is_Accessible
											? styles.costInfoAccessible
											: styles.costInfoInaccessible
									}
								>
									Cost: {route.Total_AP_Cost} AP |{' '}
									{route.Total_Coin_Cost} Coins
								</div>
								<Button
									onClick={() => handleTransit(route)}
									disabled={!route.Is_Accessible || isProcessing}
								>
									{isProcessing
										? 'Routing...'
										: route.Is_Accessible
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
