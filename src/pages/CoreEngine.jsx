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

const getSeasonString = (seasonKey) => {
  if (!seasonKey) return 'Unknown';
  return seasonKey.charAt(0).toUpperCase() + seasonKey.slice(1);
};

// Dicționar pentru transformarea numărului lunii în text
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

  const knightId = useGameState((state) => state.knightId);
  const knightName = useGameState((state) => state.knightName);

  const gameState = useGameState((state) => state.gameState);
  const endTurnAction = useGameState((state) => state.endTurn);

  useEffect(() => {
    // Logăm datele ca să vedem ce ajunge efectiv în CoreEngine
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

  // GUARD CLAUSE: Prevents rendering if data is null during the initial cycle
  if (!gameState || !gameState.player) {
    return (
      <div className={styles.engineContainer}>
        <div style={{ color: 'var(--gold-primary)', textAlign: 'center', marginTop: '50px', fontSize: '1.5rem' }}>
          Initializing Core Engine...
        </div>
      </div>
    );
  }

  const time = gameState.time;
  const player = gameState.player;
  const inventory = player.inventory;
  const seasonName = getSeasonString(time.activeSeason);
  // Extragem numele lunii pe baza indexului (scădem 1 deoarece array-ul începe de la 0)
  const currentMonthName = MONTH_NAMES[time.currentMonth - 1] || 'Unknown';

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
        console.log('End Month Event Triggered:', result.eventLog);
      }
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'INVENTORY':
        return <InventoryView />;
      case 'STATS':
        return <ExtendedStatsView />;
      case 'TRAVEL':
        return <TravelView triggerSync={syncDatabase} />;
      case 'VIEWPORT':
      default:
        return <GameViewport />;
    }
  };

  return (
    <div className={styles.engineContainer}>
      {/* TOP SECTION */}
      <div className={styles.topSection}>
        <div className={styles.hudContainer}>
          {/* ROW 1: HP | KNIGHT NAME | AP */}
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

          {/* ROW 2: FOOD | TIMELINE | COINS */}
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
      </div>

      {/* MIDDLE SECTION */}
      <div className={styles.middleSection}>{renderActiveView()}</div>

      {/* BOTTOM SECTION */}
      <div className={styles.bottomSection}>
        {activeView === 'VIEWPORT' ? (
          <>
            <Button
              onClick={() => setActiveView('TRAVEL')}
              variant='secondary'
            >
              Travel
            </Button>
            <Button onClick={processEndTurn} disabled={isProcessingTurn}>
              {isProcessingTurn ? 'Processing...' : 'End Month'}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setActiveView('VIEWPORT')}
            variant='secondary'
          >
            Return to Viewport
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoreEngine;