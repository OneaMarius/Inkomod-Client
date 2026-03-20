// File: Client/src/components/engineViews/MapView.jsx
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations.js';

const MapView = () => {
    const location = useGameState((state) => state.gameState?.location);

    // Query the database for the active node parameters
    const currentNode = DB_LOCATIONS_ZONES.find(
        (node) => node.worldId === location?.currentWorldId
    );

    // Extract values with fallbacks
    const zoneName = currentNode?.zoneName || 'Unknown Zone';
    const zoneClass = currentNode?.zoneClass || 'Unknown';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
            textAlign: 'center'
        }}>
            <h2 style={{ color: 'var(--gold-primary)', marginBottom: '10px' }}>World Map</h2>
            <p>You are currently in:</p>
            <p style={{ fontSize: '1.4rem', color: '#fff', marginTop: '5px' }}>
                {zoneName.replace(/_/g, ' ')}
            </p>
            <p style={{ fontSize: '1.2rem', color: '#fff', marginTop: '5px' }}>
                {zoneClass.replace(/_/g, ' ')} Region
            </p>
            <div style={{ marginTop: '30px', border: '1px dashed #444', padding: '40px', borderRadius: '8px' }}>
                [ Map Interface Under Construction ]
            </div>
        </div>
    );
};

export default MapView;