import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import styles from '../styles/CoreEngine.module.css';

// Import the modular view components
import GameViewport from '../components/engineViews/GameViewport';
import InventoryView from '../components/engineViews/InventoryView';
import ExtendedStatsView from '../components/engineViews/ExtendedStatsView';
import TravelView from '../components/engineViews/TravelView'; // Import the new view

const getSeasonString = (month) => {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Autumn';
  return 'Winter';
};

const CoreEngine = () => {
  const navigate = useNavigate();
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  
  const [activeView, setActiveView] = useState('VIEWPORT');

  const knightId = useGameState((state) => state.knightId);
  const knightName = useGameState((state) => state.knightName);
  const time = useGameState((state) => state.time);
  const player = useGameState((state) => state.player);
  
  const endTurnAction = useGameState((state) => state.endTurn);

  if (!knightId) {
    navigate('/main-menu');
    return null;
  }

  const seasonName = getSeasonString(time.currentMonth);

  // Centralized Database Synchronization Logic
  const syncDatabase = async () => {
    try {
      const currentState = useGameState.getState();
      const payload = {
        time: currentState.time,
        location: currentState.location,
        player: currentState.player
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
      endTurnAction();
      await syncDatabase();
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
        // Pass the sync function to TravelView
        return <TravelView triggerSync={syncDatabase} />;
      case 'VIEWPORT':
      default:
        return <GameViewport />;
    }
  };

  return (
    <div className={styles.engineContainer}>
      {/* TOP SECTION: 20% */}
      <div className={styles.topSection}>
        <div className={styles.hudBar}>
          <div className={styles.hudSection}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Knight</span>
              <span className={styles.statValue}>{knightName}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>AP</span>
              <span className={styles.statValue}>
                {player.biology.currentAp} / 8
              </span>
            </div>
          </div>

          <div className={styles.hudSection}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Turn</span>
              <span className={styles.statValue}>{time.currentTurn}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Month</span>
              <span className={styles.statValue}>{time.currentMonth}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Season</span>
              <span className={styles.statValue}>{seasonName}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.navBar}>
          <button 
            className={styles.navButton} 
            onClick={() => setActiveView('VIEWPORT')}
            style={{ borderColor: activeView === 'VIEWPORT' ? 'var(--gold-primary)' : '' }}
          >
            Viewport
          </button>
          <button 
            className={styles.navButton} 
            onClick={() => setActiveView('INVENTORY')}
            style={{ borderColor: activeView === 'INVENTORY' ? 'var(--gold-primary)' : '' }}
          >
            Inventory
          </button>
          <button 
            className={styles.navButton} 
            onClick={() => setActiveView('STATS')}
            style={{ borderColor: activeView === 'STATS' ? 'var(--gold-primary)' : '' }}
          >
            Stats
          </button>
        </div>
      </div>

      {/* MIDDLE SECTION: 60% */}
      <div className={styles.middleSection}>
        {renderActiveView()}
      </div>

      {/* BOTTOM SECTION: 20% */}
      <div className={styles.bottomSection}>
        {activeView === 'VIEWPORT' ? (
          <>
            <Button onClick={() => setActiveView('TRAVEL')} variant="secondary">
              Travel
            </Button>
            <Button onClick={processEndTurn} disabled={isProcessingTurn}>
              {isProcessingTurn ? 'Processing...' : 'End Turn'}
            </Button>
          </>
        ) : (
          <Button onClick={() => setActiveView('VIEWPORT')} variant="secondary">
            Return to Viewport
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoreEngine;