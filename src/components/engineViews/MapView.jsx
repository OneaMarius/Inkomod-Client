// File: Client/src/components/engineViews/MapView.jsx
import React, { useMemo, useState, useEffect } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { DB_LOCATIONS_ZONES, DB_LOCATIONS_GATES } from '../../data/DB_Locations';
import { getAvailableRoutes } from '../../engine/ENGINE_World_Travel.js';
import styles from '../../styles/MapView.module.css';

// Mapping specific colors and border styles to each region class
const REGION_COLORS = {
    DOMIKON: { bg: 'var(--region-domikon-bg)', border: 'var(--region-domikon-border)' },
    IRONVOW: { bg: 'var(--region-ironvow-bg)', border: 'var(--region-ironvow-border)' },
    NORHELM: { bg: 'var(--region-norhelm-bg)', border: 'var(--region-norhelm-border)' },
    KRYPTON: { bg: 'var(--region-krypton-bg)', border: 'var(--region-krypton-border)' },
    MYTHOSS: { bg: 'var(--region-mythoss-bg)', border: 'var(--region-mythoss-border)' },
    OLDGROW: { bg: 'var(--region-oldgrow-bg)', border: 'var(--region-oldgrow-border)' },
    DOOMARK: { bg: 'var(--region-doomark-bg)', border: 'var(--region-doomark-border)' },
    ORBIT: { bg: 'var(--region-orbit-bg)', border: 'var(--region-orbit-border)' },
    WILD: { bg: 'var(--region-wild-bg)', border: 'var(--region-wild-border)' },
    EDGE: { bg: 'var(--region-edge-bg)', border: 'var(--region-edge-border)' }
};

const MapView = () => {
    const gameState = useGameState((state) => state.gameState);
    const currentLocationId = gameState?.location?.currentWorldId;

    const [isIntroVisible, setIsIntroVisible] = useState(true);

    useEffect(() => {
        const introTimer = setTimeout(() => {
            setIsIntroVisible(false);
        }, 2200);

        return () => clearTimeout(introTimer);
    }, []);

    const currentNodeInfo = useMemo(() => {
        return DB_LOCATIONS_ZONES.find((z) => z.worldId === currentLocationId);
    }, [currentLocationId]);

    // Integrate engine logic for accurate transit cost calculations and accessibility status
    const availableRoutes = useMemo(() => {
        if (!gameState?.player || !currentLocationId) return [];
        return getAvailableRoutes(gameState.player, currentLocationId, 0);
    }, [gameState?.player, currentLocationId]);

    // Map adjacent nodes to their specific connecting gate object
    const adjacentData = useMemo(() => {
        if (!currentLocationId) return {};
        
        const data = {};
        DB_LOCATIONS_GATES.forEach((gate) => {
            if (gate.gateZone1 === currentLocationId) data[gate.gateZone2] = gate;
            if (gate.gateZone2 === currentLocationId) data[gate.gateZone1] = gate;
        });
        return data;
    }, [currentLocationId]);

    // Construct SVG line coordinates for transit routes, optimized to track route accessibility
    const mapLines = useMemo(() => {
        return DB_LOCATIONS_GATES.map((gate) => {
            const node1 = DB_LOCATIONS_ZONES.find((z) => z.worldId === gate.gateZone1);
            const node2 = DB_LOCATIONS_ZONES.find((z) => z.worldId === gate.gateZone2);

            if (node1 && node2 && node1.mapX !== undefined && node2.mapX !== undefined) {
                const isActiveRoute = gate.gateZone1 === currentLocationId || gate.gateZone2 === currentLocationId;
                let isInaccessibleRoute = false;

                // Evaluate accessibility for active routes
                if (isActiveRoute) {
                    const destinationId = gate.gateZone1 === currentLocationId ? gate.gateZone2 : gate.gateZone1;
                    const routeData = availableRoutes.find(r => r.destinationId === destinationId);
                    if (routeData && !routeData.isAccessible) {
                        isInaccessibleRoute = true;
                    }
                }

                return {
                    id: gate.worldId,
                    x1: node1.mapX,
                    y1: node1.mapY,
                    x2: node2.mapX,
                    y2: node2.mapY,
                    isActiveRoute,
                    isInaccessibleRoute
                };
            }
            return null;
        }).filter(Boolean);
    }, [currentLocationId, availableRoutes]);

    // Calculate bounding boxes for region highlighting overlays
    const regionBounds = useMemo(() => {
        const bounds = {};
        const PADDING_X = 14;
        const PADDING_Y = 4;

        DB_LOCATIONS_ZONES.forEach((zone) => {
            if (zone.mapX === undefined || zone.mapY === undefined) return;
            
            const rClass = zone.zoneClass;
            if (!bounds[rClass]) {
                bounds[rClass] = { minX: zone.mapX, maxX: zone.mapX, minY: zone.mapY, maxY: zone.mapY, name: rClass };
            } else {
                bounds[rClass].minX = Math.min(bounds[rClass].minX, zone.mapX);
                bounds[rClass].maxX = Math.max(bounds[rClass].maxX, zone.mapX);
                bounds[rClass].minY = Math.min(bounds[rClass].minY, zone.mapY);
                bounds[rClass].maxY = Math.max(bounds[rClass].maxY, zone.mapY);
            }
        });

        return Object.values(bounds).map(bound => ({
            ...bound,
            left: Math.max(0, bound.minX - PADDING_X),
            top: Math.max(0, bound.minY - PADDING_Y),
            width: (bound.maxX - bound.minX) + (PADDING_X * 2),
            height: (bound.maxY - bound.minY) + (PADDING_Y * 2),
            colors: REGION_COLORS[bound.name] || REGION_COLORS.ORBIT
        }));
    }, []);

    if (!currentLocationId) return <div className={styles.mapLoading}>Loading Map Data...</div>;

    const regionName = currentNodeInfo?.zoneClass || 'Unknown Region';
    const locationName = currentNodeInfo?.zoneName?.replace(/_/g, ' ') || 'Unknown Zone';

    return (
        <div className={styles.mapContainer}>

            {isIntroVisible && (
                <div className={styles.mapIntroOverlay}>
                    <h2 className={styles.introRegion}>{regionName}</h2>
                    <h3 className={styles.introZone}>{locationName}</h3>
                </div>
            )}

            <div className={styles.mapBackground}></div>

{regionBounds.map((region) => {
                // Extract RER from the location object initialized by GameManager
                const regionRer = gameState?.location?.regionalRates?.[region.name] || 10;

                return (
                    <div 
                        key={`region-${region.name}`}
                        className={styles.regionBox}
                        style={{
                            left: `${region.left}%`,
                            top: `${region.top}%`,
                            width: `${region.width}%`,
                            height: `${region.height}%`,
                            backgroundColor: region.colors.bg,
                            borderColor: region.colors.border
                        }}
                    >
                        {/* INDIVIDUAL REGIONAL RER OVERLAY */}
                        <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: 'rgba(10, 10, 15, 0.85)',
                            border: `1px solid ${region.colors.border}`,
                            color: '#e2e8f0',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            zIndex: 10,
                            pointerEvents: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.6)'
                        }}>
                            RER <span style={{ color: '#d4af37' }}>{regionRer}</span>
                        </div>

                        <span className={styles.regionWatermark}>{region.name}</span>
                    </div>
                );
            })}

            <svg className={styles.mapSvgOverlay}>
                {mapLines.map((line) => (
                    <line
                        key={line.id}
                        x1={`${line.x1}%`}
                        y1={`${line.y1}%`}
                        x2={`${line.x2}%`}
                        y2={`${line.y2}%`}
                        className={`${styles.mapLine} ${line.isActiveRoute ? styles.mapLineActive : ''} ${line.isInaccessibleRoute ? styles.mapLineInaccessible : ''}`}
                    />
                ))}
            </svg>

            {DB_LOCATIONS_ZONES.map((zone) => {
                if (zone.mapX === undefined || zone.mapY === undefined) return null;

                const isCurrent = zone.worldId === currentLocationId;
                const isAdjacent = !!adjacentData[zone.worldId];
                const isDistant = !isCurrent && !isAdjacent;

                // Extract AP required and accessibility status for adjacent routes using engine data
                let totalApCost = null;
                let isAccessible = true;

                if (isAdjacent) {
                    const engineRoute = availableRoutes.find(route => route.destinationId === zone.worldId);
                    if (engineRoute) {
                        totalApCost = engineRoute.totalApCost;
                        isAccessible = engineRoute.isAccessible;
                    } else {
                        // Fallback calculation
                        const gate = adjacentData[zone.worldId];
                        totalApCost = (zone.costAp || 0) + (gate.costAp || 0);
                    }
                }

                return (
                    <div
                        key={zone.worldId}
                        className={`${styles.mapNode} ${isCurrent ? styles.nodeCurrent : ''} ${isAdjacent ? styles.nodeAdjacent : ''} ${isDistant ? styles.nodeDistant : ''} ${isAdjacent && !isAccessible ? styles.nodeInaccessible : ''}`}
                        style={{
                            left: `${zone.mapX}%`,
                            top: `${zone.mapY}%`
                        }}
                        title={zone.zoneName.replace(/_/g, ' ')}
                    >
                        {isCurrent && <span className={styles.currentIndicator}></span>}
                        {isAdjacent && <span className={styles.adjacentIndicator}></span>}
                        {isDistant && <span className={styles.distantIndicator}></span>}

                        <div className={styles.nodeInfoContainer}>
                            {/* AP Cost Icon (Left) */}
                            {isAdjacent && (
                                <div className={styles.apIcon}>
                                    {totalApCost}
                                </div>
                            )}

                            {/* Location Name (Center) */}
                            <span className={styles.nodeLabel}>{zone.zoneName.replace(/_/g, ' ')}</span>
                            
                            {/* Economy Level Icon (Right) */}
                            <div className={styles.economyIcon}>
                                {zone.zoneEconomyLevel || 1}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MapView;