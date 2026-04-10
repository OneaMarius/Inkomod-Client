// File: Client/src/components/engineViews/GameViewport.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_POIS_Civilized, DB_LOCATIONS_POIS_Untamed } from '../../data/DB_Locations_POIS';
import { DB_LOCATIONS_ZONES } from '../../data/DB_Locations';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import Button from '../Button';
import NpcInfo from '../NpcInfo';
import styles from '../../styles/GameViewport.module.css';
import InstantActionView from './InstantActionView';
import { WORLD } from '../../data/GameWorld';

const GameViewport = ({ onExploreComplete }) => {
    const location = useGameState((state) => state.gameState?.location);
    const activeEntities = useGameState((state) => state.gameState?.activeEntities || []);
    const playerAp = useGameState((state) => state.gameState?.player?.progression?.actionPoints || 0);
    const [pendingInstantAction, setPendingInstantAction] = useState(null);
    const startCombatEncounter = useGameState((state) => state.startCombatEncounter);
    const enterPoi = useGameState((state) => state.enterPoi);
    const exploreUntamed = useGameState((state) => state.exploreUntamed);
    const doHunt = useGameState((state) => state.doHunt);
    const doInteraction = useGameState((state) => state.doInteraction);

    const [selectedInteractNpc, setSelectedInteractNpc] = useState(null);

    if (!location || !location.currentWorldId) return <div>Loading Viewport...</div>;

    const currentNode = DB_LOCATIONS_ZONES.find((node) => node.worldId === location.currentWorldId);
    const zoneName = currentNode?.zoneName || location.currentWorldId;
    const region = currentNode?.zoneClass || 'Unknown';
    const economy = currentNode?.zoneEconomyLevel || 1;
    const isCivilizedZone = currentNode?.zoneCategory === 'CIVILIZED';

    const exchangeRate = location.regionalExchangeRate || 10;

    const handleExploreClick = () => {
        const result = exploreUntamed();
        if (result && result.status === 'SUCCESS' && onExploreComplete) {
            onExploreComplete(result);
        }
    };

    const handleHuntClick = () => {
        const result = doHunt();
        if (result && result.status === 'SUCCESS' && onExploreComplete) {
            onExploreComplete(result); 
        }
    };

    const handleActionClick = (tag, targetId) => {
        const actionDef = DB_INTERACTION_ACTIONS[tag];
        const regionalExchangeRate = location.regionalExchangeRate || 10;

        if (actionDef && (actionDef.executionRoute === 'ROUTE_INSTANT' || actionDef.executionRoute === 'ROUTE_COMBAT')) {
            setPendingInstantAction({ tag, target: selectedInteractNpc });
            setSelectedInteractNpc(null);
        } else {
            doInteraction(tag, targetId, regionalExchangeRate);
            setSelectedInteractNpc(null);
        }
    };

    // ========================================================================
    // VIEW: INSIDE POI
    // ========================================================================
    if (location.currentPoiId) {
        const currentPoiData = DB_LOCATIONS_POIS_Civilized[location.currentPoiId] || DB_LOCATIONS_POIS_Untamed[location.currentPoiId];

        return (
            <div className={styles.viewportContainer}>
                <div className={`${styles.header} ${styles.headerPoi}`}>
                    <h2 className={`${styles.title} ${styles.titlePoi}`}>{location.currentPoiId.replace(/_/g, ' ')}</h2>
                    <p className={`${styles.subtitle} ${styles.subtitlePoi}`}>
                        {currentPoiData ? `Rank ${currentPoiData.classification.poiRank} Establishment` : 'Establishment'}
                    </p>
                </div>

                <div className={styles.description}>
                    <p style={{ marginBottom: '20px' }}>You have entered the {location.currentPoiId.replace(/_/g, ' ')}.</p>

                    {activeEntities.length > 0 ? (
                        <div className={styles.gridNpc}>
                            {activeEntities.map((npc, index) => {
                                const npcRank = npc.classification?.entityRank || npc.classification?.poiRank || '?';

                                return (
                                    <div
                                        key={npc.entityId || npc.id || index}
                                        className={styles.npcCard}
                                    >
                                        <div className={styles.npcHeader}>
                                            <strong className={styles.npcName}>{npc.entityName || npc.name || 'Unknown Entity'}</strong>

                                            <div className={styles.npcMetaRight}>
                                                <div
                                                    className='badgeContainer'
                                                    style={{ margin: '0 10px', flexShrink: 0 }}
                                                >
                                                    <div
                                                        className='badgeCircle badgeRank'
                                                        title='Entity Rank'
                                                    >
                                                        R{npcRank}
                                                    </div>
                                                    {npc.classification?.entityQuality && (
                                                        <div
                                                            className={`badgeCircle badgeQ${npc.classification.entityQuality}`}
                                                            title='Entity Quality'
                                                        >
                                                            Q{npc.classification.entityQuality}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={styles.npcSubclass}>{npc.classification?.entitySubclass || npc.title || 'Unknown'}</span>
                                            </div>
                                        </div>

                                        <div className={styles.cardActions}>
                                            <NpcInfo npc={npc} />
                                            <button
                                                className={styles.btnInteract}
                                                onClick={() => setSelectedInteractNpc(npc)}
                                            >
                                                Interact
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>The establishment is currently empty.</div>
                    )}
                </div>

                {selectedInteractNpc && (
                    <div
                        className={styles.interactModalOverlay}
                        onClick={() => setSelectedInteractNpc(null)}
                    >
                        <div
                            className={styles.interactModalContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className={styles.interactHeader}>Interact: {selectedInteractNpc.entityName || selectedInteractNpc.name}</h3>

                            {selectedInteractNpc.interactions?.actionTags?.map((tag) => {
                                const actionDef = DB_INTERACTION_ACTIONS[tag];

                                if (!actionDef) return null;

                                const isApSufficient = playerAp >= actionDef.apCost;

                                const getRouteIcon = (route) => {
                                    switch (route) {
                                        case 'ROUTE_TRADE': return '💰';
                                        case 'ROUTE_COMBAT': return '⚔️';
                                        case 'ROUTE_INSTANT': return '⚡';
                                        case 'ROUTE_SPATIAL': return '🗺️';
                                        default: return '❓';
                                    }
                                };

                                let costClass = styles.costPaid;
                                if (actionDef.apCost === 0) {
                                    costClass = styles.costFree;
                                } else if (!isApSufficient) {
                                    costClass = styles.costUnmet;
                                }

                                return (
                                    <button
                                        key={tag}
                                        className={styles.btnAction}
                                        onClick={() => handleActionClick(tag, selectedInteractNpc.entityId || selectedInteractNpc.id)}
                                        title={actionDef.description}
                                        disabled={!isApSufficient}
                                    >
                                        <span className={styles.actionName}>{tag.replace(/_/g, ' ')}</span>
                                        <span className={styles.routeIcon}>{getRouteIcon(actionDef.executionRoute)}</span>
                                        <span className={`${styles.actionCost} ${costClass}`}>{actionDef.apCost} AP</span>
                                    </button>
                                );
                            })}

                            <button
                                className={styles.btnCancel}
                                onClick={() => setSelectedInteractNpc(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {pendingInstantAction && (
                    <InstantActionView
                        actionTag={pendingInstantAction.tag}
                        npcTarget={pendingInstantAction.target}
                        onCancel={() => setPendingInstantAction(null)}
                        onConfirm={(actionTag, targetId, exchangeRate, amount) => doInteraction(actionTag, targetId, exchangeRate, amount)}
                        onForceCombat={(npc, rule) => {
                            startCombatEncounter(npc, rule);
                            setPendingInstantAction(null);
                        }}
                    />
                )}
            </div>
        );
    }

    // ========================================================================
    // VIEW: OUTSIDE (MAIN ZONE)
    // ========================================================================
    const bgImagePath = `/regions/${location.currentWorldId}.jpg`;

    return (
        <div
            className={`${styles.viewportContainer} ${styles.viewportZone}`}
            style={{ '--bg-img': `url("${bgImagePath}")` }}
        >
            <div className={styles.header}>
                <h2 className={`${styles.title} ${styles.titleZone}`}>{zoneName.replace(/_/g, ' ')}</h2>
                <p className={styles.subtitle}>
                    Region: <span className={styles.highlight}>{region}</span> | Economy: <span className={styles.highlight}>{economy}</span>
                </p>
                <p className={styles.exchangeRateDisplay}>Regional Exchange Rate = {exchangeRate}</p>
            </div>

            <div>
                <h3 className={styles.sectionTitle}>Points of Interest</h3>

                {isCivilizedZone ? (
                    <div className={styles.gridPoi}>
                        {Object.keys(DB_LOCATIONS_POIS_Civilized).map((poiKey) => (
                            <button
                                key={poiKey}
                                className={styles.btnPoi}
                                onClick={() => enterPoi(poiKey)}
                                disabled={playerAp < 1}
                            >
                                {poiKey.replace(/_/g, ' ')} (1 AP)
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className={`${styles.emptyState} ${styles.emptyStateUntamed}`}>
                        <p className={styles.emptyStateText}>You are in the untamed wilds. Civilized establishments cannot be found here.</p>

                        <div className={styles.untamedActionsContainer}>
                            <Button
                                onClick={handleExploreClick}
                                disabled={playerAp < (WORLD.SPATIAL?.actionCosts?.exploreUntamedAp || 1)}
                                variant='primary'
                                className={styles.btnExplore}
                            >
                                Explore Region (1 AP)
                            </Button>

                            <Button
                                onClick={handleHuntClick}
                                disabled={playerAp < (WORLD.SPATIAL?.actionCosts?.huntUntamedAp || 1)}
                                variant='primary'
                                className={styles.btnHunt}
                            >
                                Track & Hunt (1 AP)
                            </Button>

                            {/* Sandbox button hidden for production */}
                            {/* <Button
                                onClick={() => enterPoi('Sandbox_Arena', 'UNTAMED', 0)}
                                variant='danger'
                                style={{ width: '200px', border: '1px solid #f87171', color: '#f87171' }}
                            >
                                TEST SANDBOX (0 AP)
                            </Button> */}
                        </div>
                    </div>
                )}
            </div>

            {pendingInstantAction && (
                <InstantActionView
                    actionTag={pendingInstantAction.tag}
                    npcTarget={pendingInstantAction.target}
                    onCancel={() => setPendingInstantAction(null)}
                    onConfirm={(tag, targetId, rate) => {
                        return doInteraction(tag, targetId, rate);
                    }}
                />
            )}
        </div>
    );
};

export default GameViewport;