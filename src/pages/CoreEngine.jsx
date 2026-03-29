// File: Client/src/pages/CoreEngine.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../styles/CoreEngine.module.css';
import { getStandardErrorMessage } from '../utils/ErrorHandler';

// Import HUD Components
import TopHud from '../components/hud/TopHud';
import BottomNav from '../components/hud/BottomNav';
import ExtendedStatsView from '../components/engineViews/ExtendedStatsView';
import EndTurnLoader from '../components/ui/EndTurnLoader'; // Added Import

// Import modular view components
import GameViewport from '../components/engineViews/GameViewport';
import InventoryView from '../components/engineViews/InventoryView';
import TravelView from '../components/engineViews/TravelView';
import EventView from '../components/engineViews/EventView';
import CombatView from '../components/engineViews/CombatView';
import ShopView from '../components/engineViews/ShopView';
import MapView from '../components/engineViews/MapView';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';

const CoreEngine = () => {
	const navigate = useNavigate();

	// 1. Local State
	const [isProcessingTurn, setIsProcessingTurn] = useState(false);
	const [activeView, setActiveView] = useState('VIEWPORT');
	const [pendingEvent, setPendingEvent] = useState(null);
	const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
	const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
	const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
	const [isSaveNoticeOpen, setIsSaveNoticeOpen] = useState(false);
	const [syncError, setSyncError] = useState('');

	// 2. Global State (Zustand)
	const knightId = useGameState((state) => state.knightId);
	const gameState = useGameState((state) => state.gameState);
	const endTurnAction = useGameState((state) => state.endTurn);
	const enterPoi = useGameState((state) => state.enterPoi);

	// --- NEW: Narrative Event State Handlers ---
	const activeEventData = useGameState((state) => state.activeEventData);
	const activeEventNpc = useGameState((state) => state.activeEventNpc);
	const activeEventResolution = useGameState((state) => state.activeEventResolution);
	const submitEventChoice = useGameState((state) => state.submitEventChoice);
	const closeEventView = useGameState((state) => state.closeEventView);

	// --- LATEST: Monthly Report Handlers ---
	const monthlyReportData = useGameState((state) => state.monthlyReportData);
	const closeMonthlyReport = useGameState((state) => state.closeMonthlyReport);

	// 3. Effects
	useEffect(() => {
		setIsStatsModalOpen(false);
	}, [gameState?.currentView]);

	// Viewport Height Fix for Mobile
	useEffect(() => {
		const setFixedViewport = () => {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		};
		setFixedViewport();
		window.addEventListener('resize', setFixedViewport);
		return () => window.removeEventListener('resize', setFixedViewport);
	}, []);

	// Session validation
	useEffect(() => {
		if (!knightId || !gameState) {
			console.warn('Redirecting to main-menu because data is missing.');
			navigate('/main-menu');
		}
	}, [knightId, gameState, navigate]);

	// View routing listener
	useEffect(() => {
		if (!gameState || !gameState.currentView) return;

		if (gameState.currentView !== 'VIEWPORT') {
			// Force interface to show global blocking events (Combat, Narrative, Trade)
			setActiveView(gameState.currentView);
		} else if (gameState.currentView === 'VIEWPORT' && ['EVENT', 'COMBAT', 'TRADE'].includes(activeView)) {
			// Close the overlay only if returning to the map from a blocking event
			setActiveView('VIEWPORT');
		}
	}, [gameState?.currentView]);

	if (!gameState || !gameState.player) {
		return (
			<div className={styles.engineContainer}>
				<div style={{ color: 'var(--gold-primary)', textAlign: 'center', marginTop: '50px', fontSize: '1.5rem' }}>Initializing Core Engine...</div>
			</div>
		);
	}

	const location = gameState.location;
	const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location.currentWorldId);
	const zoneName = currentNode?.zoneName || 'Streets';

	const syncDatabase = async () => {
		try {
			const currentState = useGameState.getState();
			const payload = { time: currentState.gameState.time, location: currentState.gameState.location, player: currentState.gameState.player };
			await api.put(`/knights/${currentState.knightId}`, payload);
			console.log('Database synchronized.');
			setSyncError('');
		} catch (error) {
			console.error('Synchronization failure.', error);
			const cleanError = getStandardErrorMessage(error);
			setSyncError(`Save Failed: ${cleanError}`);
		}
	};

	const processEndTurn = async () => {
		if (isProcessingTurn) return;

		// 1. Mount the loader component
		setIsProcessingTurn(true);

		try {
			// 2. Wait for the primary 2-second visual delay (progress bar loading)
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// 3. Execute game engine state mutations
			const result = endTurnAction();

			if (result && result.status === 'PERMADEATH') {
				alert(`You have died. Reason: ${result.reason}`);
				navigate('/main-menu');
				return;
			}

			// 5. Concurrently run DB sync and wait 300ms for the CSS fade-out to finish
			const fadeOutDelay = new Promise((resolve) => setTimeout(resolve, 300));
			await Promise.all([syncDatabase(), fadeOutDelay]);
		} finally {
			// 6. Unmount the loader strictly after the fade-out completes
			setIsProcessingTurn(false);
		}
	};

	const handleManualSave = async () => {
		await syncDatabase();
		setIsMenuModalOpen(false);

		if (!syncError) {
			setIsSaveNoticeOpen(true);
			setTimeout(() => setIsSaveNoticeOpen(false), 1000);
		}
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

	const handleTravelComplete = (travelResult) => {
		const currentGlobalView = useGameState.getState().gameState.currentView;
		if (currentGlobalView !== 'EVENT') {
			setActiveView('VIEWPORT');
		}
	};

	const handleExploreComplete = (exploreResult) => {
		if (exploreResult && exploreResult.eventLog) {
			const eventData = { ...exploreResult.eventLog };
			if (eventData.type === 'EXPLORE_SUCCESS') {
				eventData.choices = [
					{ label: 'Enter Location', action: 'ENTER_POI', poiId: eventData.discoveredPoi },
					{ label: 'Leave Area', action: 'LEAVE', variant: 'secondary' },
				];
			}
			setPendingEvent(eventData);
			setActiveView('EVENT');
		}
	};

	const handleEventChoice = (choice) => {
		// Intercept system actions from synthetic events (like Exploration POIs)
		if (choice.action === 'ENTER_POI') {
			enterPoi(choice.poiId, 'UNTAMED', 0);
			clearEventAndResume();
		} else if (choice.action === 'LEAVE') {
			clearEventAndResume();
		} else {
			// Standard narrative events (Combat, Trade, Skill Check) go to the math engine
			submitEventChoice(choice);
		}
	};

	// Așa închidem evenimentele locale de Explore
	const clearEventAndResume = () => {
		setPendingEvent(null);
		useGameState.getState().gameState.currentView = 'VIEWPORT';
		setActiveView('VIEWPORT');
	};

	// Așa închidem evenimentele narative globale (Travel/EndMonth) și distrugem ecranul negru
	const handleEventAcknowledge = () => {
		if (pendingEvent) {
			clearEventAndResume(); // Eveniment de explorare locală
		} else {
			closeEventView(); // Curăță variabilele globale din Zustand
			setActiveView('VIEWPORT'); // Forțează dispariția overlay-ului negru
		}
	};

	const handleLocalNav = (viewName) => {
		if (gameState.currentView === 'COMBAT' || gameState.currentView === 'TRADE') {
			console.warn('Navigation locked during active encounter.');
			return;
		}
		setIsStatsModalOpen(false);
		setActiveView(viewName);
	};

	return (
		<div className={styles.engineContainer}>
			{/* Seasonal Loader Overlay */}
			{isProcessingTurn && <EndTurnLoader />}

			{/* Non-Blocking Sync Error Alert */}
			{syncError && (
				<div
					className='system-error-box'
					style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, width: '90%', maxWidth: '400px' }}
				>
					<span className='error-icon'></span>
					{syncError}
				</div>
			)}

			{/* Componentized Top HUD */}
			<TopHud
				isStatsModalOpen={isStatsModalOpen}
				setIsStatsModalOpen={setIsStatsModalOpen}
			/>

			{/* Middle Render Section */}
			<div className={styles.mainContentWrapper}>
				{/* Base Layer: Viewport remains permanently mounted to cache background assets */}
				<div className={styles.middleSection}>
					<GameViewport onExploreComplete={handleExploreComplete} />
				</div>

				{/* Overlay Layers: Rendered conditionally over the Viewport */}
				{activeView !== 'VIEWPORT' && (
					<div className={styles.viewOverlay}>
						{activeView === 'EVENT' && (
							<EventView
								eventData={pendingEvent || activeEventData}
								activeEventNpc={activeEventNpc}
								resolutionData={activeEventResolution}
								onAcknowledge={handleEventAcknowledge}
								onChoice={handleEventChoice}
							/>
						)}
						{activeView === 'INVENTORY' && <InventoryView />}
						{activeView === 'TRAVEL' && (
							<TravelView
								triggerSync={syncDatabase}
								onTravelComplete={handleTravelComplete}
							/>
						)}
						{activeView === 'COMBAT' && <CombatView />}
						{activeView === 'TRADE' && <ShopView />}
						{activeView === 'MAP' && <MapView />}
					</div>
				)}

				{/* Stats Overlay */}
				{isStatsModalOpen && (
					<div className={styles.statsOverlayCentral}>
						<ExtendedStatsView onClose={() => setIsStatsModalOpen(false)} />
					</div>
				)}
			</div>

			{/* Componentized Bottom Navigation */}
			<BottomNav
				activeView={activeView}
				zoneName={zoneName}
				isProcessingTurn={isProcessingTurn}
				handleLocalNav={handleLocalNav}
				processEndTurn={processEndTurn}
				setIsMenuModalOpen={setIsMenuModalOpen}
			/>

			{/* System Modals */}
			{isMenuModalOpen && (
				<div className={styles.modalOverlay}>
					<div className={styles.menuModal}>
						<h2>Game Menu</h2>
						<Button
							onClick={handleManualSave}
							variant='primary'
						>
							Save Game
						</Button>
						<Button
							onClick={initExitSequence}
							variant='destructive'
						>
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

			{/* --- NEW: MONTHLY LOGISTICS REPORT MODAL --- */}
			{monthlyReportData && (
				<div
					className={styles.modalOverlay}
					style={{ zIndex: 1500 }}
				>
					<div
						className={styles.menuModal}
						style={{ border: '1px solid var(--gold-primary)', minWidth: '300px' }}
					>
						<h2 style={{ color: 'var(--gold-primary)', marginBottom: '10px' }}>Monthly Report</h2>
						<p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
							A summary of your survival logistics over the past month.
						</p>

						<div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
							{/* Food Consumption Row */}
							<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
								<span style={{ color: '#ccc' }}>Food Consumed:</span>
								<span style={{ color: monthlyReportData.isStarving ? 'var(--danger-red)' : '#fff' }}>
									{monthlyReportData.foodConsumed > 0 ? `-${monthlyReportData.foodConsumed}` : '0'}
								</span>
							</div>

							{/* HP Change Row */}
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<span style={{ color: '#ccc' }}>Health (HP):</span>
								<span style={{ color: monthlyReportData.hpChange >= 0 ? 'var(--success-green)' : 'var(--danger-red)', fontWeight: 'bold' }}>
									{monthlyReportData.hpChange > 0 ? `+${monthlyReportData.hpChange}` : monthlyReportData.hpChange}
								</span>
							</div>
						</div>

						{monthlyReportData.isStarving && (
							<div style={{ color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
								WARNING: Insufficient food. You are starving.
							</div>
						)}

						<Button
							onClick={closeMonthlyReport}
							variant='primary'
							style={{ width: '100%' }}
						>
							Acknowledge
						</Button>
					</div>
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
