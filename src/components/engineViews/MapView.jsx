// File: Client/src/components/engineViews/MapView.jsx
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations.js';
import styles from '../../styles/MapView.module.css';

const MapView = () => {
    const location = useGameState((state) => state.gameState?.location);

    // Query the database for the active node parameters
    const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location?.currentWorldId);

    // Extract values with fallbacks
    const zoneName = currentNode?.zoneName || 'Unknown Zone';
    const zoneClass = currentNode?.zoneClass || 'Unknown';

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>World Map</h2>
            
            <div className={styles.locationInfo}>
                <p className={styles.subText}>You are currently in:</p>
                <p className={styles.zoneName}>{zoneName.replace(/_/g, ' ')}</p>
                <p className={styles.regionName}>{zoneClass.replace(/_/g, ' ')} Region</p>
            </div>

            <div className={styles.placeholderBox}>
                [ Map Interface Under Construction ]
            </div>
        </div>
    );
};

export default MapView;