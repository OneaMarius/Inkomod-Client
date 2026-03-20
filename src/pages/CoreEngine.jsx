// File: Client/src/pages/CoreEngine.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../styles/CoreEngine.module.css';

// Import the modular view components
import GameViewport from '../components/engineViews/GameViewport';
import InventoryView from '../components/engineViews/InventoryView';
import ExtendedStatsView from '../components/engineViews/ExtendedStatsView';
import TravelView from '../components/engineViews/TravelView';
import EventView from '../components/engineViews/EventView';
import CombatView from '../components/engineViews/CombatView';
import ShopView from '../components/engineViews/ShopView';
import MapView from '../components/engineViews/MapView';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';

const getSeasonString = (seasonKey) => {
	if (!seasonKey) return 'Unknown';
	return seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1);
};

const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const CoreEngine = () => {
	const navigate = useNavigate();
	const [isProcessingTurn, setIsProcessingTurn] = useState(false);
	const [activeView, setActiveView] = useState('VIEWPORT');
	const [pendingEvent, setPendingEvent] = useState(null);

	// UI Control States
	const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
	const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
	const [isSaveNoticeOpen, setIsSaveNoticeOpen] = useState(false);

	const knightId = useGameState((state) => state.knightId);
	const knightName = useGameState((state) => state.knightName);
	const gameState = useGameState((state) => state.gameState);

	const endTurnAction = useGameState((state) => state.endTurn);
	const exitPoi = useGameState((state) => state.exitPoi);
	const enterPoi = useGameState((state) => state.enterPoi);

	useEffect(() => {
		if (!knightId || !gameState) {
			console.warn('Redirecting to main-menu because data is missing!');
			navigate('/main-menu');
		}
	}, [knightId, gameState, navigate]);

	useEffect(() => {
		if (gameState && gameState.currentView) {
			if (
				activeView !== 'EVENT' ||
				gameState.currentView === 'COMBAT' ||
				gameState.currentView === 'TRADE'
			) {
				setActiveView(gameState.currentView);
			}
		}
	}, [gameState?.currentView]);

	if (!gameState || !gameState.player) {
		return (
			<div className={styles.engineContainer}>
				<div
					style={{
						color: 'var(--gold-primary)',
						textAlign: 'center',
						marginTop: '50px',
						fontSize: '1.5rem',
					}}
				>
					Initializing Core Engine...
				</div>
			</div>
		);
	}

	const time = gameState.time;
	const player = gameState.player;
	const inventory = player.inventory;
	const location = gameState.location;
	const seasonName = getSeasonString(time.activeSeason);
	const currentMonthName = MONTH_NAMES[time.currentMonth - 1] || 'Unknown';

	const currentNode = DB_LOCATIONS_ZONES.find(
		(node) => node.worldId === location.currentWorldId,
	);
	const zoneName =
		currentNode?.zoneName || location.currentWorldId || 'Streets';

	const syncDatabase = async () => {
		try {
			const currentState = useGameState.getState();
			const payload = {
				time: currentState.gameState.time,
				location: currentState.gameState.location,
				player: currentState.gameState.player,
			};
			await api.put(`/knights/${currentState.knightId}`, payload);
			console.log('Database synchronized.');
		} catch (error) {
			console.error('Synchronization failure.', error);
		}
	};

	const processEndTurn = async () => {
		if (isProcessingTurn) return;
		setIsProcessingTurn(true);

		try {
			const result = endTurnAction();

			if (result && result.status === 'PERMADEATH') {
				alert(`You have died. Reason: ${result.reason}`);
				navigate('/main-menu');
				return;
			}

			await syncDatabase();

			if (result && result.eventLog) {
				setPendingEvent(result.eventLog);
				setActiveView('EVENT');
			}
		} finally {
			setIsProcessingTurn(false);
		}
	};

	// --- Menu Modal Handlers ---
	const handleManualSave = async () => {
		await syncDatabase();
		setIsMenuModalOpen(false);
		setIsSaveNoticeOpen(true);

		setTimeout(() => {
			setIsSaveNoticeOpen(false);
		}, 1000);
	};

	const initExitSequence = () => {
		setIsMenuModalOpen(false);
		setIsExitConfirmOpen(true);
	};

	const confirmExit = () => {
		setIsExitConfirmOpen(false);
		navigate('/main-menu');
	};

	const cancelExit = () => {
		setIsExitConfirmOpen(false);
		setIsMenuModalOpen(true);
	};
	// ---------------------------

	const handleTravelComplete = (travelResult) => {
		if (travelResult && travelResult.eventLog) {
			setPendingEvent(travelResult.eventLog);
			setActiveView('EVENT');
		} else {
			setActiveView('VIEWPORT');
		}
	};

	const handleExploreComplete = (exploreResult) => {
		if (exploreResult && exploreResult.eventLog) {
			const eventData = { ...exploreResult.eventLog };

			if (eventData.type === 'EXPLORE_SUCCESS') {
				eventData.choices = [
					{
						label: 'Enter Location',
						action: 'ENTER_POI',
						poiId: eventData.discoveredPoi,
					},
					{ label: 'Leave Area', action: 'LEAVE', variant: 'secondary' },
				];
			}

			setPendingEvent(eventData);
			setActiveView('EVENT');
		}
	};

	const handleEventChoice = (choice) => {
		if (choice.action === 'ENTER_POI') {
			enterPoi(choice.poiId, 'UNTAMED', 0);
			clearEventAndResume();
		} else if (choice.action === 'LEAVE') {
			clearEventAndResume();
		}
	};

	const clearEventAndResume = () => {
		setPendingEvent(null);
		setActiveView(gameState.currentView || 'VIEWPORT');
	};

	const handleLocalNav = (viewName) => {
		if (
			gameState.currentView === 'COMBAT' ||
			gameState.currentView === 'TRADE'
		) {
			console.warn('Navigation locked during active encounter.');
			return;
		}
		setActiveView(viewName);
	};

	const renderActiveView = () => {
		switch (activeView) {
			case 'EVENT':
				return (
					<EventView
						eventData={pendingEvent}
						onAcknowledge={clearEventAndResume}
						onChoice={handleEventChoice}
					/>
				);
			case 'INVENTORY':
				return <InventoryView />;
			case 'STATS':
				return <ExtendedStatsView />;
			case 'TRAVEL':
				return (
					<TravelView
						triggerSync={syncDatabase}
						onTravelComplete={handleTravelComplete}
					/>
				);
			case 'COMBAT':
				return <CombatView />;
			case 'TRADE':
				return <ShopView />;
			case 'MAP':
				return <MapView />;
			case 'VIEWPORT':
			default:
				return <GameViewport onExploreComplete={handleExploreComplete} />;
		}
	};

	const isEncounterActive = activeView === 'COMBAT' || activeView === 'TRADE';

	return (
		<div className={styles.engineContainer}>
			{/* --- TOP HUD SECTION --- */}
			<div className={styles.topSection}>
				<div className={styles.hudContainer}>
					<div className={styles.hudRow}>
						<div className={`${styles.statBox} ${styles.boxSide}`}>
							<span className={styles.statLabel}>HP</span>
							<span className={styles.statValue}>
								{player.biology.hpCurrent} / {player.biology.hpMax}
							</span>
						</div>

						<div
							className={`${styles.interactiveKnightBox} ${styles.boxCenter}`}
							onClick={() => handleLocalNav('STATS')}
						>
							<span className={styles.statLabel}>Knight</span>
							<span className={styles.statValueName}>{knightName}</span>
						</div>

						<div className={`${styles.statBox} ${styles.boxSide}`}>
							<span className={styles.statLabel}>AP</span>
							<span className={styles.statValue}>
								{player.progression.actionPoints} / 8
							</span>
						</div>
					</div>

					<div className={styles.hudRow}>
						<div className={`${styles.statBox} ${styles.boxSide}`}>
							<span className={styles.statLabel}>Food</span>
							<span className={styles.statValue}>{inventory.food}</span>
						</div>
						<div className={`${styles.statBox} ${styles.boxCenter}`}>
							<span className={styles.statLabel}>Timeline</span>
							<span className={styles.statValue}>
								Turn {time.currentTurn || 0} | {currentMonthName} |{' '}
								{seasonName}
							</span>
						</div>
						<div className={`${styles.statBox} ${styles.boxSide}`}>
							<span className={styles.statLabel}>
								<span style={{ marginRight: '6px' }}>&#x1FA99;</span>
								Coins
							</span>
							<span className={styles.statValue}>
								{inventory.silverCoins}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* --- MIDDLE RENDER SECTION --- */}
			<div className={styles.middleSection}>{renderActiveView()}</div>

			{/* --- BOTTOM ACTIONS & NAV SECTION --- */}
			{activeView !== 'EVENT' && !isEncounterActive && (
				<div className={styles.bottomSection}>
					<div className={styles.actionZone}>
						{activeView === 'VIEWPORT' ? (
							location.currentPoiId ? (
								<Button onClick={exitPoi} variant='secondary'>
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
						) : (
							<Button
								onClick={() => handleLocalNav('VIEWPORT')}
								variant='secondary'
							>
								Return to Viewport
							</Button>
						)}
					</div>

					<div className={styles.navZone}>
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
						<button
							className={`${styles.navButton} ${activeView === 'MAP' ? styles.navActive : ''}`}
							onClick={() => handleLocalNav('MAP')}
						>
							Map
						</button>
					</div>
				</div>
			)}

			{/* Modals & Overlays */}
			{isMenuModalOpen && (
				<div className={styles.modalOverlay}>
					<div className={styles.menuModal}>
						<h2>Game Menu</h2>
						<Button onClick={handleManualSave} variant='primary'>
							Save Game
						</Button>
						<Button onClick={initExitSequence} variant='destructive'>
							Exit to Main Menu
						</Button>
						<Button
							onClick={() => setIsMenuModalOpen(false)}
							variant='secondary'
						>
							Resume Game
						</Button>
					</div>
				</div>
			)}

			{isSaveNoticeOpen && (
				<div className={styles.modalOverlay}>
					<div className={styles.saveNoticePopup}>Game Saved</div>
				</div>
			)}

			<ConfirmModal
				isOpen={isExitConfirmOpen}
				title='Exit Game'
				message='Are you sure you want to exit to the Main Menu? Unsaved progress for the current month will be lost.'
				confirmText='Exit'
				cancelText='Cancel'
				onConfirm={confirmExit}
				onCancel={cancelExit}
			/>
		</div>
	);
};

export default CoreEngine;
