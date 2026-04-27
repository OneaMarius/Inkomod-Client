// File: Client/src/pages/CoreEngine.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateLegacyScore } from '../utils/ScoreCalculator';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../styles/CoreEngine.module.css';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import deathStyles from '../styles/DeathSequence.module.css';
import { WORLD } from '../data/GameWorld';

// Import HUD Components
import TopHud from '../components/hud/TopHud';
import BottomNav from '../components/hud/BottomNav';
import ExtendedStatsView from '../components/engineViews/ExtendedStatsView';
import EndTurnLoader from '../components/ui/EndTurnLoader';
import AlertModal from '../components/AlertModal';
import MonthlyReportModal from '../components/ui/MonthlyReportModal';

// Import modular view components
import GameViewport from '../components/engineViews/GameViewport';
import InventoryView from '../components/engineViews/InventoryView';
import TravelView from '../components/engineViews/TravelView';
import EventView from '../components/engineViews/EventView';
import CombatView from '../components/engineViews/CombatView';
import ShopView from '../components/engineViews/ShopView';
import MapView from '../components/engineViews/MapView';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';

// Import Transition Component
import VideoTransition from '../components/VideoTransition';

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

	// Transition State
	const [showExitTransition, setShowExitTransition] = useState(false);

	// Death sequence state
	const [deathPhase, setDeathPhase] = useState('NONE');
	const [deathReason, setDeathReason] = useState('');
	const [victoryPhase, setVictoryPhase] = useState('NONE');
	const [victoryReason, setVictoryReason] = useState('');

	// Load Game states
	const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
	const [saves, setSaves] = useState([]);
	const [isSavesLoading, setIsSavesLoading] = useState(false);
	const [selectedSaveId, setSelectedSaveId] = useState(null);
	const [isDeleteSaveConfirmOpen, setIsDeleteSaveConfirmOpen] = useState(false);

	// 2. Global State (Zustand)
	const knightId = useGameState((state) => state.knightId);
	const gameState = useGameState((state) => state.gameState);
	const endTurnAction = useGameState((state) => state.endTurn);
	const enterPoi = useGameState((state) => state.enterPoi);

	// Narrative Event State Handlers
	const activeEventData = useGameState((state) => state.activeEventData);
	const activeEventNpc = useGameState((state) => state.activeEventNpc);
	const activeEventResolution = useGameState((state) => state.activeEventResolution);
	const submitEventChoice = useGameState((state) => state.submitEventChoice);
	const closeEventView = useGameState((state) => state.closeEventView);

	// Monthly Report Handlers
	const monthlyReportData = useGameState((state) => state.monthlyReportData);
	const closeMonthlyReport = useGameState((state) => state.closeMonthlyReport);

	// Sequence Timer: Transitions from PRE_MODAL to POST_MODAL automatically
	useEffect(() => {
		if (deathPhase === 'PRE_MODAL') {
			const timer = setTimeout(() => {
				executePermadeath();
			}, 4500); // 4.5 seconds to read the narrative text before wipe
			return () => clearTimeout(timer);
		}
	}, [deathPhase]);

	useEffect(() => {
		if (victoryPhase === 'PRE_MODAL') {
			const timer = setTimeout(() => {
				executeVictory();
			}, 6000);
			return () => clearTimeout(timer);
		}
	}, [victoryPhase]);

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

		if (gameState.currentView === 'DEAD') {
			setDeathReason('Slain in Combat');
			setDeathPhase('PRE_MODAL');
			setActiveView('VIEWPORT');
		} else if (gameState.currentView === 'VICTORY') {
			setVictoryReason(gameState.victoryReason || 'Champion of the Realm');
			setVictoryPhase('PRE_MODAL');
			setActiveView('VIEWPORT');
		} else if (gameState.currentView !== 'VIEWPORT') {
			setActiveView(gameState.currentView);
		} else if (gameState.currentView === 'VIEWPORT' && ['EVENT', 'COMBAT', 'TRADE'].includes(activeView)) {
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
			setSyncError('');
		} catch (error) {
			console.error('Synchronization failure.', error);
			const cleanError = getStandardErrorMessage(error);
			setSyncError(`Save Failed: ${cleanError}`);
		}
	};

	const executePermadeath = async () => {
		setDeathPhase('POST_MODAL');

		try {
			const currentState = useGameState.getState();
			const player = currentState.gameState.player;
			const time = currentState.gameState.time;
			const currentLocation = currentState.gameState.location;
			const currentUser = useAuthStore.getState().user;
			const currentUserName = currentUser?.username || 'UnknownPlayer';

			const enemy = currentState.lastKiller || currentState.activeCombatEnemy;
			const killerName =
				deathReason === WORLD.PROGRESSION_LOOP.deathReasons.COMBAT && enemy ? enemy.entityName || enemy.name || 'Unknown Assailant' : 'None';
			const killerAvatar = deathReason === WORLD.PROGRESSION_LOOP.deathReasons.COMBAT && enemy && enemy.avatar ? enemy.avatar : 'default_npc.png';

			const finalScore = calculateLegacyScore(player, time, deathReason);

			const currentWorldId = currentLocation.currentWorldId;
			let deathZoneName = 'The Wilderness';
			let deathRegionClass = 'Unknown';

			if (currentWorldId) {
				const zoneData = DB_LOCATIONS_ZONES.find((z) => z.worldId === currentWorldId);
				if (zoneData) {
					deathZoneName = (zoneData.zoneName || 'Unknown Zone').replace(/_/g, ' ');
					deathRegionClass = zoneData.zoneClass || 'Unknown Region';
				} else {
					deathRegionClass = currentWorldId.split('_')[0];
				}
			}

			const legacyPayload = {
				username: currentUserName,
				playerAvatar: currentUser?.avatar || 'default_player.png',

				knightName: player.identity.name,
				knightAvatar: player.identity.avatar || 'default_knight.png',
				patronGod: player.identity.patronGod,
				religion: player.identity.religion,
				reputationClass: player.progression.reputationClass,

				dateCreated: currentState.gameState.createdAt || new Date(),
				causeOfDeath: deathReason,
				killerName: killerName,
				killerAvatar: killerAvatar,

				killerRank: enemy?.classification?.entityRank || enemy?.classification?.poiRank || 1,

				deathZone: deathZoneName,
				deathRegion: deathRegionClass,
				deathYear: time.currentYear,
				deathSeason: time.activeSeason,

				age: player.identity.age,
				totalTurns: time.totalMonthsPassed || 0,
				rank: player.identity.rank,
				honor: player.progression.honor,
				renown: player.progression.renown,

				inventory: {
					silverCoins: player.inventory.silverCoins || 0,
					tradeSilver: player.inventory.tradeSilver || 0,
					tradeGold: player.inventory.tradeGold || 0,
					food: player.inventory.food || 0,
					healingPotions: player.inventory.healingPotions || 0,
					caravanSize: player.inventory.animalSlots ? player.inventory.animalSlots.length : 0,
					backpackSize: player.inventory.itemSlots ? player.inventory.itemSlots.length : 0,
				},

				equipment: { weapon: 'Unarmed', armor: 'None', shield: 'None', helmet: 'None', mount: 'None' },

				finalScore: finalScore,
			};
			await api.post('/legacy', legacyPayload);
			await api.delete(`/knights/${knightId}`);
		} catch (error) {
			console.error('Failed to process permadeath sequence or delete save.', error);
		}

		setTimeout(() => {
			useGameState.getState().clearSession();
			navigate('/main-menu');
		}, 7000);
	};

	const executeVictory = async () => {
		setVictoryPhase('POST_MODAL');

		try {
			const currentState = useGameState.getState();
			const player = currentState.gameState.player;
			const time = currentState.gameState.time;
			const currentUser = useAuthStore.getState().user;
			const currentUserName = currentUser?.username || 'UnknownPlayer';

			const finalScore = calculateLegacyScore(player, time, victoryReason);

			const legacyPayload = {
				username: currentUserName,
				playerAvatar: currentUser?.avatar || 'default_player.png',
				knightName: player.identity.name,
				knightAvatar: player.identity.avatar || 'default_knight.png',
				patronGod: player.identity.patronGod,
				religion: player.identity.religion,
				reputationClass: player.progression.reputationClass,
				dateCreated: currentState.gameState.createdAt || new Date(),
				causeOfDeath: 'Survived',
				killerName: victoryReason,
				killerAvatar: 'victory_icon.png',
				deathZone: 'Royal Palace',
				deathRegion: 'Capital',
				deathYear: time.currentYear,
				deathSeason: time.activeSeason,
				age: player.identity.age,
				totalTurns: time.totalMonthsPassed || 0,
				rank: player.identity.rank,
				honor: player.progression.honor,
				renown: player.progression.renown,
				inventory: {
					silverCoins: player.inventory.silverCoins || 0,
					tradeSilver: player.inventory.tradeSilver || 0,
					tradeGold: player.inventory.tradeGold || 0,
					food: player.inventory.food || 0,
					healingPotions: player.inventory.healingPotions || 0,
					caravanSize: player.inventory.animalSlots ? player.inventory.animalSlots.length : 0,
					backpackSize: player.inventory.itemSlots ? player.inventory.itemSlots.length : 0,
				},
				equipment: { weapon: 'Unequipped', armor: 'Unequipped', shield: 'Unequipped', helmet: 'Unequipped', mount: 'Unequipped' },
				finalScore: finalScore,
			};

			await api.post('/legacy', legacyPayload);
			await api.delete(`/knights/${knightId}`);
		} catch (error) {
			console.error('Victory sequence transaction failed.', error);
		}

		setTimeout(() => {
			useGameState.getState().clearSession();
			navigate('/main-menu');
		}, 7000);
	};

	const processEndTurn = async () => {
		if (isProcessingTurn) return;

		setIsProcessingTurn(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			const result = endTurnAction();

			if (result && result.status === 'PERMADEATH') {
				setDeathReason(result.reason || 'Starvation');
				setDeathPhase('PRE_MODAL');
				setIsProcessingTurn(false);
				return;
			}

			const fadeOutDelay = new Promise((resolve) => setTimeout(resolve, 300));
			await Promise.all([syncDatabase(), fadeOutDelay]);
		} finally {
			setIsProcessingTurn(false);
		}
	};

	const handleManualSave = async () => {
		await syncDatabase();
		// Am eliminat setIsMenuModalOpen(false) pentru a menține modalul deschis
		if (!syncError) {
			setIsSaveNoticeOpen(true);
			setTimeout(() => setIsSaveNoticeOpen(false), 1000); // Am mărit timpul la 2 secunde pentru a fi mai vizibil
		}
	};

	// NOU: Funcție pentru Save and Exit
	const handleSaveAndExit = async () => {
		await syncDatabase();
		if (!syncError) {
			setIsMenuModalOpen(false);
			setShowExitTransition(true); // Declanșează tranziția video și apoi exit
		}
	};

	// Fetch and display saves modal
	const openLoadGameModal = async () => {
		setIsMenuModalOpen(false);
		setIsLoadModalOpen(true);
		setIsSavesLoading(true);
		setSelectedSaveId(null);
		try {
			const response = await api.get('/knights');
			setSaves(response.data);
		} catch (err) {
			const standardizedError = getStandardErrorMessage(err);
			setSyncError(`Failed to fetch saves: ${standardizedError}`);
		} finally {
			setIsSavesLoading(false);
		}
	};

	// Execute load for selected save
	const handleLoadSelectedSave = async () => {
		if (!selectedSaveId) return;
		const selectedSaveData = saves.find((save) => save._id === selectedSaveId);

		if (selectedSaveData) {
			try {
				await api.patch(`/knights/${selectedSaveId}/play`);
			} catch (error) {
				console.error('Failed to synchronize timestamp', error);
			}
			useGameState.getState().loadGame(selectedSaveData);
			setIsLoadModalOpen(false);
			setActiveView('VIEWPORT');
		}
	};

	// Execute delete for selected save
	const executeDeleteSave = async () => {
		try {
			await api.delete(`/knights/${selectedSaveId}`);
			setSaves(saves.filter((save) => save._id !== selectedSaveId));
			setSelectedSaveId(null);
			setIsDeleteSaveConfirmOpen(false);
		} catch (err) {
			const standardizedError = getStandardErrorMessage(err);
			setSyncError(`Failed to delete save: ${standardizedError}`);
			setIsDeleteSaveConfirmOpen(false);
		}
	};

	const initExitSequence = () => {
		setIsMenuModalOpen(false);
		setIsExitConfirmOpen(true);
	};

	const confirmExit = () => {
		setIsExitConfirmOpen(false);
		setShowExitTransition(true);
	};

	const executeExit = () => {
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
			if (exploreResult.eventLog.status === 'AWAITING_INPUT' || exploreResult.eventLog.status === 'RESOLVED_SEE') {
				return;
			}

			const eventData = { ...exploreResult.eventLog };

			if (eventData.type === 'EXPLORE_SUCCESS') {
				eventData.choices = [
					{ label: 'Enter Location', action: 'ENTER_POI', poiId: eventData.discoveredPoi },
					{ label: 'Leave Area', action: 'LEAVE', variant: 'secondary' },
				];
			}

			useGameState.setState((state) => ({
				activeEventData: null,
				activeEventNpc: null,
				activeEventResolution: null,
				gameState: { ...state.gameState, currentView: 'EVENT' },
			}));

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
		} else {
			submitEventChoice(choice);
		}
	};

	const clearEventAndResume = () => {
		setPendingEvent(null);
		useGameState.setState((state) => ({
			activeEventResolution: null,
			activeEventData: null,
			activeEventNpc: null,
			gameState: { ...state.gameState, currentView: 'VIEWPORT' },
		}));
		setActiveView('VIEWPORT');
	};

	const handleEventAcknowledge = () => {
		if (pendingEvent) {
			clearEventAndResume();
		} else {
			closeEventView();
			useGameState.setState((state) => ({
				activeEventResolution: null,
				activeEventData: null,
				activeEventNpc: null,
				gameState: { ...state.gameState, currentView: 'VIEWPORT' },
			}));
			setActiveView('VIEWPORT');
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

	// --- HELPER PENTRU CULOAREA MÂNCĂRII ---
	const getFoodColorClass = (consumed) => {
		if (!consumed || consumed <= 5) return styles.textSuccess; // 0 - 5: Verde
		if (consumed >= 6 && consumed <= 10) return styles.textInfo; // 6 - 10: Albastru
		if (consumed >= 11 && consumed <= 15) return styles.textWarning; // 11 - 15: Portocaliu
		return styles.textDanger; // 16+: Roșu
	};

	return (
		<>
			{showExitTransition && (
				<VideoTransition
					videoSrc='/assets/videos/inkomod-transition2.mp4'
					onTransitionPoint={executeExit}
				/>
			)}

			<div className={styles.engineContainer}>
				{isProcessingTurn && <EndTurnLoader />}

				{syncError && (
					<div
						className='system-error-box'
						style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, width: '90%', maxWidth: '400px' }}
					>
						<span className='error-icon'></span>
						{syncError}
					</div>
				)}

				<TopHud
					isStatsModalOpen={isStatsModalOpen}
					setIsStatsModalOpen={setIsStatsModalOpen}
				/>

				<div className={styles.mainContentWrapper}>
					<div className={styles.middleSection}>
						<GameViewport onExploreComplete={handleExploreComplete} />
					</div>

					{activeView !== 'VIEWPORT' && (
						<div className={styles.viewOverlay}>
							{activeView === 'EVENT' && (
								<EventView
									eventData={pendingEvent || activeEventData}
									activeEventNpc={activeEventNpc}
									resolutionData={activeEventResolution}
									onAcknowledge={handleEventAcknowledge}
									onChoice={handleEventChoice}
									playerData={gameState?.player}
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

					{isStatsModalOpen && (
						<div className={styles.statsOverlayCentral}>
							<ExtendedStatsView onClose={() => setIsStatsModalOpen(false)} />
						</div>
					)}
				</div>

				<BottomNav
					activeView={activeView}
					zoneName={zoneName}
					isProcessingTurn={isProcessingTurn}
					handleLocalNav={handleLocalNav}
					processEndTurn={processEndTurn}
					setIsMenuModalOpen={setIsMenuModalOpen}
				/>

				{isMenuModalOpen && (
					<div className={styles.modalOverlay}>
						<div className={styles.menuModal}>
							<h2>Game Menu</h2>

							<Button
								onClick={() => setIsMenuModalOpen(false)}
								variant='blue'
								disabled={showExitTransition}
							>
								Resume Game
							</Button>

							<Button
								onClick={handleManualSave}
								variant='primary'
								disabled={showExitTransition}
							>
								Save Game
							</Button>

							<Button
								onClick={openLoadGameModal}
								variant='primary'
								disabled={showExitTransition}
							>
								Load Game
							</Button>

							<Button
								onClick={handleSaveAndExit}
								variant='green'
								disabled={showExitTransition}
							>
								Save & Exit to Menu
							</Button>

							<Button
								onClick={initExitSequence}
								variant='destructive'
								disabled={showExitTransition}
							>
								Exit Game
							</Button>
						</div>
					</div>
				)}

				{isLoadModalOpen && (
					<div className={styles.modalOverlay}>
						<div
							className={styles.menuModal}
							style={{ minWidth: '400px' }}
						>
							<h2 style={{ color: 'var(--gold-primary)', marginBottom: '15px' }}>Select Chronicles</h2>
							{isSavesLoading ? (
								<p style={{ color: '#aaa', textAlign: 'center' }}>Reading chronicles...</p>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', marginBottom: '20px' }}>
									{saves.map((knight) => (
										<div
											key={knight._id}
											onClick={() => setSelectedSaveId(knight._id)}
											style={{
												padding: '10px',
												border: selectedSaveId === knight._id ? '2px solid var(--gold-primary)' : '1px solid #333',
												borderRadius: '4px',
												backgroundColor: selectedSaveId === knight._id ? 'rgba(212, 175, 55, 0.1)' : '#111',
												cursor: 'pointer',
											}}
										>
											<div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#fff' }}>
												<span>{knight.knightName}</span>
												<span>Rank {knight.player?.identity?.rank || 1}</span>
											</div>
											<div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
												<span>Loc: {knight.location?.currentZoneName || knight.location?.currentWorldId || 'Unknown'}</span>
												<span>Last Played: {new Date(knight.lastPlayed).toLocaleDateString()}</span>
											</div>
										</div>
									))}
									{saves.length === 0 && <p style={{ color: '#aaa', textAlign: 'center' }}>No saved chronicles found.</p>}
								</div>
							)}

							<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								<Button
									onClick={handleLoadSelectedSave}
									disabled={!selectedSaveId}
									variant='primary'
								>
									Continue Journey
								</Button>
								<Button
									onClick={() => setIsDeleteSaveConfirmOpen(true)}
									disabled={!selectedSaveId}
									variant='destructive'
								>
									Delete Chronicle
								</Button>
								<Button
									onClick={() => {
										setIsLoadModalOpen(false);
										setIsMenuModalOpen(true);
									}}
									variant='secondary'
								>
									Back to Menu
								</Button>
							</div>
						</div>
					</div>
				)}

				<ConfirmModal
					isOpen={isDeleteSaveConfirmOpen}
					title='Destroy Chronicle?'
					message='This action will permanently erase this Knight from history. It cannot be undone.'
					confirmText='Erase'
					cancelText='Keep'
					onConfirm={executeDeleteSave}
					onCancel={() => setIsDeleteSaveConfirmOpen(false)}
				/>

				{isSaveNoticeOpen && (
					<div className={styles.modalOverlay}>
						<div className={styles.saveNoticePopup}>Game Saved</div>
					</div>
				)}

				{monthlyReportData && (
					<MonthlyReportModal
						monthlyReportData={monthlyReportData}
						closeMonthlyReport={closeMonthlyReport}
						getFoodColorClass={getFoodColorClass}
						styles={styles}
					/>
				)}

				{deathPhase !== 'NONE' && (
					<div
						className={`${deathStyles.fullscreenOverlay} ${deathPhase === 'POST_MODAL' ? deathStyles.postModalBackground : deathStyles.blackBackground}`}
					>
						{deathPhase === 'PRE_MODAL' && (
							<>
								<div className={deathStyles.deathIcon}>
									{deathReason === 'Starvation' ? '🦴 x 💀' : deathReason === 'Old Age' ? '⏳ x 💀' : '⚔️ x 💀'}
								</div>
								<div className={deathStyles.deathText}>{deathReason.toUpperCase()}</div>
								<div
									className={deathStyles.legacyText}
									style={{ marginTop: '20px', color: '#aaa', fontSize: '1.1rem' }}
								>
									Your journey has come to an end.
								</div>
							</>
						)}

						{deathPhase === 'POST_MODAL' && (
							<>
								<div className={deathStyles.permaDeathTitle}>PERMADEATH</div>
								<div className={deathStyles.legacyText}>Your legacy has been erased from the matrix.</div>
							</>
						)}
					</div>
				)}

				{victoryPhase !== 'NONE' && (
					<div
						className={`${deathStyles.fullscreenOverlay} ${victoryPhase === 'POST_MODAL' ? deathStyles.postModalBackground : deathStyles.blackBackground}`}
						style={{ backgroundColor: victoryPhase === 'POST_MODAL' ? '#000' : 'rgba(212, 175, 55, 0.95)' }}
					>
						{victoryPhase === 'PRE_MODAL' && (
							<>
								<div
									className={deathStyles.deathIcon}
									style={{ color: '#000', textShadow: 'none' }}
								>
									👑
								</div>
								<div
									className={deathStyles.deathText}
									style={{ color: '#000', textShadow: 'none' }}
								>
									{victoryReason.toUpperCase()}
								</div>
								<div
									className={deathStyles.legacyText}
									style={{ marginTop: '20px', color: '#111', fontSize: '1.2rem', fontWeight: 'bold' }}
								>
									Your legend has been cemented in history.
								</div>
							</>
						)}

						{victoryPhase === 'POST_MODAL' && (
							<>
								<div
									className={deathStyles.permaDeathTitle}
									style={{ color: 'var(--gold-primary)' }}
								>
									ALPHA COMPLETED
								</div>
								<div className={deathStyles.legacyText}>The realm is safe. Your score has been recorded.</div>
							</>
						)}
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
		</>
	);
};

export default CoreEngine;
