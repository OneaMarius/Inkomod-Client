// File: Client/src/components/hud/BottomNav.jsx
import useGameState from '../../store/OMD_State_Manager';
import Button from '../Button';
// Am schimbat importul pentru a folosi noul modul CSS
import styles from '../../styles/BottomNav.module.css';

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
							variant='blue'
						>
							Exit to {zoneName.replace(/_/g, ' ')}
						</Button>
					) : (
						<>
							<Button
								onClick={() => handleLocalNav('TRAVEL')}
								variant='blue'
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
						variant='blue'
					>
						Return to Viewport
					</Button>
				)}
			</div>

			{/* --- NAV ZONE --- */}
			{!isEncounterActive && (
				<div className={styles.navZone}>
					<Button
						className={`${styles.navButton} ${activeView === 'MAP' ? styles.navActive : ''}`}
						onClick={() => handleLocalNav('MAP')}
						variant='secondary'
					>
						<img
							src='/assets/icons/map.png'
							alt='Map'
							className={styles.navIcon}
						/>
					</Button>

					<Button
						className={`${styles.navButton} ${activeView === 'INVENTORY' ? styles.navActive : ''}`}
						onClick={() => handleLocalNav('INVENTORY')}
						variant='secondary'
					>
						<img
							src='/assets/icons/inventory.png'
							alt='Inventory'
							className={styles.navIcon}
						/>
					</Button>

					{/* --- NOU: Butonul pentru Quests --- */}
					<Button
						className={`${styles.navButton} ${activeView === 'QUESTS' ? styles.navActive : ''}`}
						onClick={() => handleLocalNav('QUESTS')}
						variant='secondary'
					>
						<img
							src='/assets/icons/quests.png'
							alt='Quests'
							className={styles.navIcon}
						/>
					</Button>

					<Button
						className={styles.navButton}
						onClick={() => setIsMenuModalOpen(true)}
						variant='secondary'
					>
						<img
							src='/assets/icons/menu.png'
							alt='Menu'
							className={styles.navIcon}
						/>
					</Button>
				</div>
			)}
		</div>
	);
};

export default BottomNav;
