// File: Client/src/components/hud/BottomNav.jsx
import useGameState from '../../store/OMD_State_Manager';
import Button from '../Button';
import styles from '../../styles/CoreEngine.module.css';

const BottomNav = ({ activeView, zoneName, isProcessingTurn, handleLocalNav, processEndTurn, setIsMenuModalOpen }) => {
	const location = useGameState((state) => state.gameState?.location);
	const exitPoi = useGameState((state) => state.exitPoi);
	const cancelEncounter = useGameState((state) => state.cancelEncounter);

	if (!location) return null;

	const isEncounterActive = activeView === 'COMBAT' || activeView === 'TRADE';

	// Hide bottom bar completely in these specific views
	if (activeView === 'EVENT' || activeView === 'COMBAT') return null;

	return (
		<div className={styles.bottomSection}>
			<div className={styles.actionZone}>
				{activeView === 'VIEWPORT' ? (
					location.currentPoiId ? (
						<Button
							onClick={exitPoi}
							variant='secondary'
						>
							Exit to {zoneName.replace(/_/g, ' ')}
						</Button>
					) : (
						<>
							<Button
								onClick={() => handleLocalNav('TRAVEL')}
								variant='secondary'
							>
								Travel
							</Button>
							<Button
								onClick={processEndTurn}
								disabled={isProcessingTurn}
							>
								{isProcessingTurn ? 'Processing...' : 'End Month'}
							</Button>
						</>
					)
				) : activeView === 'TRADE' ? (
					<Button
						onClick={cancelEncounter}
						variant='secondary'
					>
						Leave Shop
					</Button>
				) : (
					<Button
						onClick={() => handleLocalNav('VIEWPORT')}
						variant='secondary'
					>
						Return to Viewport
					</Button>
				)}
			</div>

			{/* --- NAV ZONE --- */}
			{!isEncounterActive && (
				<div className={styles.navZone}>
					<button
						className={`${styles.navButton} ${activeView === 'MAP' ? styles.navActive : ''}`}
						onClick={() => handleLocalNav('MAP')}
					>
						Map
					</button>
					<button
						className={`${styles.navButton} ${activeView === 'INVENTORY' ? styles.navActive : ''}`}
						onClick={() => handleLocalNav('INVENTORY')}
					>
						Inventory
					</button>
					<button
						className={styles.navButton}
						onClick={() => setIsMenuModalOpen(true)}
					>
						Menu
					</button>
				</div>
			)}
		</div>
	);
};

export default BottomNav;
