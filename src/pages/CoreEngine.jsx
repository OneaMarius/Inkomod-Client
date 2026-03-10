import { useNavigate } from 'react-router-dom';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import styles from '../styles/CoreEngine.module.css';

const CoreEngine = () => {
  const navigate = useNavigate();
  
  // Extract specific nodes from the Zustand store
  const knightName = useGameState((state) => state.knightName);
  const engineGod = useGameState((state) => state.engineGod);
  const religion = useGameState((state) => state.religion);
  const location = useGameState((state) => state.location);
  const player = useGameState((state) => state.player);
  const clearSession = useGameState((state) => state.clearSession);

  // Fallback verification: if no knight name is in memory, redirect to menu
  if (!knightName) {
    navigate('/main-menu');
    return null;
  }

  const handleExitToMenu = () => {
    clearSession();
    navigate('/main-menu');
  };

  return (
    <div className={`screen-container ${styles.enginePage}`}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Iron Nature Engine</h1>
        <div>Turn: 1</div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Tier 1: Identity Data */}
        <div className={styles.dataPanel}>
          <h2 className={styles.panelTitle}>Entity Identity</h2>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Knight Name:</span>
            <span className={styles.dataValue}>{knightName}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Patron God:</span>
            <span className={styles.dataValue}>{engineGod}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Religion:</span>
            <span className={styles.dataValue}>{religion}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Rank:</span>
            <span className={styles.dataValue}>{player.identity.rank}</span>
          </div>
        </div>

        {/* Tier 2: Biological Data */}
        <div className={styles.dataPanel}>
          <h2 className={styles.panelTitle}>Biological Parameters</h2>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>HP:</span>
            <span className={styles.dataValue}>{player.biology.hpCurrent} / {player.biology.hpMax}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>STR | AGI | INT:</span>
            <span className={styles.dataValue}>
              {player.biology.str} | {player.biology.agi} | {player.biology.int}
            </span>
          </div>
        </div>

        {/* Tier 3: Spatial Data */}
        <div className={styles.dataPanel}>
          <h2 className={styles.panelTitle}>Spatial Matrices</h2>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Current Zone:</span>
            <span className={styles.dataValue}>{location.currentZoneName}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Zone Class:</span>
            <span className={styles.dataValue}>{location.currentZoneClass}</span>
          </div>
        </div>
      </div>

      <div className={styles.actionFooter}>
        <Button onClick={handleExitToMenu} variant="secondary">
          Exit to Menu
        </Button>
      </div>
    </div>
  );
};

export default CoreEngine;