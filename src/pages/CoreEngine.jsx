// File: Client/src/pages/CoreEngine.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import styles from '../styles/CoreEngine.module.css';

// Import the modular view components
import GameViewport from '../components/engineViews/GameViewport';
import InventoryView from '../components/engineViews/InventoryView';
import ExtendedStatsView from '../components/engineViews/ExtendedStatsView';
import TravelView from '../components/engineViews/TravelView';
import EventView from '../components/engineViews/EventView';
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

  const knightId = useGameState((state) => state.knightId);
  const knightName = useGameState((state) => state.knightName);
  const gameState = useGameState((state) => state.gameState);
  
  const endTurnAction = useGameState((state) => state.endTurn);
  const exitPoi = useGameState((state) => state.exitPoi);
  const enterPoi = useGameState((state) => state.enterPoi); // Added enterPoi dispatcher

  useEffect(() => {
    console.log('Core Engine Check -> knightId:', knightId);
    console.log(
      'Core Engine Check -> gameState:',
      gameState ? 'Există' : 'Lipsește',
    );

    if (!knightId || !gameState) {
      console.warn('Redirecting to main-menu because data is missing!');
      navigate('/main-menu');
    }
  }, [knightId, gameState, navigate]);

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

  // Retrieve current zone data to format the exit button text
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

  const handleTravelComplete = (travelResult) => {
    if (travelResult && travelResult.eventLog) {
      setPendingEvent(travelResult.eventLog);
      setActiveView('EVENT');
    } else {
      setActiveView('VIEWPORT');
    }
  };

  // NOU: Procesează log-ul întors de explorare
  const handleExploreComplete = (exploreResult) => {
    if (exploreResult && exploreResult.eventLog) {
      const eventData = { ...exploreResult.eventLog };
      
      // Dacă am găsit cu succes ceva, injectăm butoanele
      if (eventData.type === 'EXPLORE_SUCCESS') {
        eventData.choices = [
          { label: 'Enter Location', action: 'ENTER_POI', poiId: eventData.discoveredPoi },
          { label: 'Leave Area', action: 'LEAVE', variant: 'secondary' }
        ];
      }
      
      setPendingEvent(eventData);
      setActiveView('EVENT');
    }
  };

  // NOU: Procesează alegerea jucătorului din Eveniment
  const handleEventChoice = (choice) => {
    if (choice.action === 'ENTER_POI') {
      // Cost AP 0 pentru că deja a fost dedus la Explore
      enterPoi(choice.poiId, 'UNTAMED', 0);
      clearEventAndResume();
    } else if (choice.action === 'LEAVE') {
      clearEventAndResume();
    }
  };

  const clearEventAndResume = () => {
    setPendingEvent(null);
    setActiveView('VIEWPORT');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'EVENT':
        return (
          <EventView
            eventData={pendingEvent}
            onAcknowledge={clearEventAndResume}
            onChoice={handleEventChoice} // Pasăm funcția către componenta UI
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
      case 'VIEWPORT':
      default:
        // Pasăm onExploreComplete mai departe către buton
        return <GameViewport onExploreComplete={handleExploreComplete} />;
    }
  };

  return (
    <div className={styles.engineContainer}>
      <div className={styles.topSection}>
        <div className={styles.hudContainer}>
          <div className={styles.hudRow}>
            <div className={`${styles.statBox} ${styles.boxSide}`}>
              <span className={styles.statLabel}>HP</span>
              <span className={styles.statValue}>
                {player.biology.hpCurrent} / {player.biology.hpMax}
              </span>
            </div>
            <div className={`${styles.statBox} ${styles.boxCenter}`}>
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
                {time.currentYear} | {currentMonthName} | {seasonName}
              </span>
            </div>
            <div className={`${styles.statBox} ${styles.boxSide}`}>
              <span className={styles.statLabel}>
                <span style={{ marginRight: '6px' }}>&#x1FA99;</span>{' '}
                Coins
              </span>
              <span className={styles.statValue}>
                {inventory.silverCoins}
              </span>
            </div>
          </div>
        </div>

        {activeView !== 'EVENT' && (
          <div className={styles.navBar}>
            <button
              className={`${styles.navButton} ${activeView === 'VIEWPORT' ? styles.navActive : ''}`}
              onClick={() => setActiveView('VIEWPORT')}
            >
              Viewport
            </button>
            <button
              className={`${styles.navButton} ${activeView === 'INVENTORY' ? styles.navActive : ''}`}
              onClick={() => setActiveView('INVENTORY')}
            >
              Inventory
            </button>
            <button
              className={`${styles.navButton} ${activeView === 'STATS' ? styles.navActive : ''}`}
              onClick={() => setActiveView('STATS')}
            >
              Stats
            </button>
          </div>
        )}
      </div>

      <div className={styles.middleSection}>{renderActiveView()}</div>

      {activeView !== 'EVENT' && (
        <div className={styles.bottomSection}>
          {activeView === 'VIEWPORT' ? (
            location.currentPoiId ? (
              <Button onClick={exitPoi} variant='secondary'>
                Exit to {zoneName.replace(/_/g, ' ')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setActiveView('TRAVEL')}
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
              onClick={() => setActiveView('VIEWPORT')}
              variant='secondary'
            >
              Return to Viewport
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CoreEngine;