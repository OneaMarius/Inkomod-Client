// File: Client/src/components/engineViews/GameViewport.jsx
import useGameState from '../../store/OMD_State_Manager';
import {
    DB_LOCATIONS_POIS_Civilized,
    DB_LOCATIONS_POIS_Untamed,
} from '../../data/DB_Locations_POIS';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import Button from '../Button'; // Asigură-te că importul butonului este corect

const GameViewport = ({ onExploreComplete }) => {
    const location = useGameState((state) => state.gameState?.location);
    const activeEntities = useGameState(
        (state) => state.gameState?.activeEntities || [],
    );
    const playerAp = useGameState(
        (state) => state.gameState?.player?.progression?.actionPoints || 0,
    );

    const enterPoi = useGameState((state) => state.enterPoi);
    const exploreUntamed = useGameState((state) => state.exploreUntamed);

    if (!location || !location.currentWorldId)
        return <div>Loading Viewport...</div>;

    const currentNode = DB_LOCATIONS_ZONES.find(
        (node) => node.worldId === location.currentWorldId,
    );
    const zoneName = currentNode?.zoneName || location.currentWorldId;
    const region = currentNode?.zoneClass || 'Unknown';
    const economy = currentNode?.zoneEconomyLevel || 3;
    const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';

    const handleExploreClick = () => {
        const result = exploreUntamed();
        if (result && result.status === 'SUCCESS' && onExploreComplete) {
            onExploreComplete(result);
        }
    };

    // ========================================================================
    // VIEW: INSIDE POI
    // ========================================================================
    if (location.currentPoiId) {
        // Căutăm datele POI-ului atât în baza civilizată cât și în cea untamed
        const currentPoiData =
            DB_LOCATIONS_POIS_Civilized[location.currentPoiId] ||
            DB_LOCATIONS_POIS_Untamed[location.currentPoiId];

        return (
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        borderBottom: '1px solid var(--gold-primary)',
                        paddingBottom: '15px',
                    }}
                >
                    <h2
                        style={{
                            color: 'var(--gold-primary)',
                            textTransform: 'uppercase',
                            margin: '0 0 10px 0',
                        }}
                    >
                        {location.currentPoiId.replace(/_/g, ' ')}
                    </h2>
                    <p style={{ color: '#aaa', margin: 0, fontStyle: 'italic' }}>
                        {currentPoiData
                            ? `Rank ${currentPoiData.classification.poiRank} Establishment`
                            : 'Establishment'}
                    </p>
                </div>

                <div
                    style={{ padding: '10px 0', textAlign: 'center', color: '#ccc' }}
                >
                    <p style={{ marginBottom: '20px' }}>
                        You have entered the{' '}
                        {location.currentPoiId.replace(/_/g, ' ')}.
                    </p>

                    {/* Renderizarea NPC-urilor active */}
                    {activeEntities.length > 0 ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '15px',
                            }}
                        >
                            {activeEntities.map((npc) => (
                                <div
                                    key={npc.id}
                                    style={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        padding: '15px',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: '1px solid #333',
                                            paddingBottom: '8px',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color: '#e0e0e0',
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            {npc.name}
                                        </strong>
                                        <span
                                            style={{
                                                color: 'var(--gold-primary)',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {npc.title}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.9rem',
                                            color: '#888',
                                            marginBottom: '15px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                        }}
                                    >
                                        <div>
                                            Class:{' '}
                                            <span style={{ color: '#aaa' }}>
                                                {npc.entityClass}
                                            </span>
                                        </div>
                                        <div>
                                            HP:{' '}
                                            <span style={{ color: '#aaa' }}>
                                                {npc.biology.hpCurrent} /{' '}
                                                {npc.biology.hpMax}
                                            </span>
                                        </div>
                                        <div>
                                            Wealth:{' '}
                                            <span style={{ color: '#aaa' }}>
                                                {npc.inventory.silverCoins} Coins
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#2a2a2a',
                                            color: '#ccc',
                                            border: '1px solid #444',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#333';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                '#2a2a2a';
                                            e.currentTarget.style.color = '#ccc';
                                        }}
                                        onClick={() =>
                                            console.log('Interacting with:', npc)
                                        }
                                    >
                                        Interact
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                padding: '30px',
                                backgroundColor: '#111',
                                border: '1px dashed #333',
                                color: '#666',
                                fontStyle: 'italic',
                            }}
                        >
                            The establishment is currently empty.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ========================================================================
    // VIEW: OUTSIDE (MAIN ZONE)
    // ========================================================================
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
            }}
        >
            <div
                style={{
                    textAlign: 'center',
                    borderBottom: '1px solid #333',
                    paddingBottom: '15px',
                }}
            >
                <h2
                    style={{
                        color: '#e0e0e0',
                        textTransform: 'uppercase',
                        margin: '0 0 10px 0',
                    }}
                >
                    {zoneName.replace(/_/g, ' ')}
                </h2>
                <p style={{ color: '#888', margin: '0' }}>
                    Region: <span style={{ color: '#aaa' }}>{region}</span> |
                    Economy: <span style={{ color: '#aaa' }}>{economy}</span>
                </p>
            </div>

            <div style={{ marginTop: '10px' }}>
                <h3
                    style={{
                        color: 'var(--gold-primary)',
                        fontSize: '1.1rem',
                        marginBottom: '15px',
                        textAlign: 'center',
                    }}
                >
                    Points of Interest
                </h3>

                {isCivilizedZone ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '10px',
                        }}
                    >
                        {Object.keys(DB_LOCATIONS_POIS_Civilized).map((poiKey) => (
                            <button
                                key={poiKey}
                                onClick={() => enterPoi(poiKey)}
                                disabled={playerAp < 1}
                                style={{
                                    padding: '12px',
                                    backgroundColor: '#222',
                                    border: '1px solid #444',
                                    color: '#ccc',
                                    borderRadius: '4px',
                                    cursor: playerAp < 1 ? 'not-allowed' : 'pointer',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease-in-out',
                                    opacity: playerAp < 1 ? 0.5 : 1,
                                }}
                                onMouseOver={(e) => {
                                    if (playerAp >= 1) {
                                        e.currentTarget.style.borderColor =
                                            'var(--gold-primary)';
                                        e.currentTarget.style.color = '#fff';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (playerAp >= 1) {
                                        e.currentTarget.style.borderColor = '#444';
                                        e.currentTarget.style.color = '#ccc';
                                    }
                                }}
                            >
                                {poiKey.replace(/_/g, ' ')} (1 AP)
                            </button>
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                        }}
                    >
                        <p
                            style={{
                                color: '#666',
                                fontStyle: 'italic',
                                marginBottom: '20px',
                            }}
                        >
                            You are in the untamed wilds. Civilized establishments
                            cannot be found here.
                        </p>
                        <Button
                            onClick={handleExploreClick}
                            disabled={playerAp < 1}
                            variant='primary'
                        >
                            Explore Region (1 AP)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameViewport;