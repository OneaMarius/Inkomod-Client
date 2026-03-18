// File: src/engine/ENGINE_World_Travel.js
// Description: Manages map navigation, route calculations, and transit costs using WORLD.SPATIAL constants.

import { WORLD } from '../data/GameWorld.js';
import { DB_LOCATIONS } from '../data/DB_Locations.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// DATA RETRIEVAL HELPERS
// ------------------------------------------------------------------------

const getNodeData = (nodeId) => {
    return DB_LOCATIONS.mapNodes.find(node => node.id === nodeId);
};

const getRouteData = (currentNodeId, targetNodeId) => {
    return DB_LOCATIONS.mapRoutes.find(route => 
        (route.nodeA === currentNodeId && route.nodeB === targetNodeId) ||
        (route.nodeB === currentNodeId && route.nodeA === targetNodeId)
    );
};

// ------------------------------------------------------------------------
// COST CALCULATION
// ------------------------------------------------------------------------

/**
 * Calculates the total AP required to transit to a target node.
 * Uses WORLD.SPATIAL constants for mount reduction logic.
 */
export const calculateTravelApCost = (playerEntity, currentNodeId, targetNodeId, seasonModifier = 0) => {
    const targetNode = getNodeData(targetNodeId);
    const route = getRouteData(currentNodeId, targetNodeId);

    if (!targetNode || !route) return 999; 

    const baseApCost = (targetNode.entryApCost || 0) + (route.transitApCost || 0);
    const encumbrancePenalty = playerEntity.logistics.travelApPenalty || 0;
    
    let mountFactor = 1.0;

    if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
        const mountAgi = playerEntity.equipment.mountItem.stats?.agi || 5;
        const transitConstants = WORLD.SPATIAL.transit;
        
        // Base reduction is 0.75. We subtract AGI * 0.01. It cannot go below 0.25.
        mountFactor = Math.max(
            transitConstants.mountMaxReductionFactor, 
            transitConstants.mountMinReductionFactor - (mountAgi * transitConstants.mountAgiMultiplier)
        );
    }

    const rawCalculation = Math.ceil((baseApCost + seasonModifier + encumbrancePenalty) * mountFactor);
    return Math.max(1, rawCalculation); // Minimum movement cost is always 1 AP
};

// ------------------------------------------------------------------------
// ROUTE EVALUATION
// ------------------------------------------------------------------------

/**
 * Generates a list of all accessible nodes from the current position.
 */
export const getAvailableRoutes = (playerEntity, currentNodeId, seasonModifier = 0) => {
    const playerAp = playerEntity.progression.actionPoints;
    const playerCoins = playerEntity.inventory.silverCoins;
    const availableRoutes = [];

    const connectedRoutes = DB_LOCATIONS.mapRoutes.filter(route => 
        route.nodeA === currentNodeId || route.nodeB === currentNodeId
    );

    connectedRoutes.forEach(route => {
        const targetNodeId = route.nodeA === currentNodeId ? route.nodeB : route.nodeA;
        const targetNode = getNodeData(targetNodeId);

        if (targetNode) {
            const totalApRequired = calculateTravelApCost(playerEntity, currentNodeId, targetNodeId, seasonModifier);
            const totalCoinRequired = (route.transitCoinCost || 0) + (targetNode.entryCoinCost || 0);
            
            const isAccessible = (playerAp >= totalApRequired) && (playerCoins >= totalCoinRequired);

            availableRoutes.push({
                destinationId: targetNode.id,
                destinationName: targetNode.name,
                zoneClass: targetNode.zoneClass,
                economyLevel: targetNode.economyLevel,
                routeName: route.name,
                transitType: route.category,
                totalApCost: totalApRequired,
                totalCoinCost: totalCoinRequired,
                isAccessible: isAccessible
            });
        }
    });

    return availableRoutes;
};

// ------------------------------------------------------------------------
// TRAVEL EXECUTION
// ------------------------------------------------------------------------

/**
 * Validates resources, deducts the travel costs, applies mount damage, and mutates the player's location data.
 */
export const executeTravel = (playerEntity, currentNodeId, targetNodeId, seasonModifier = 0) => {
    const routeData = getRouteData(currentNodeId, targetNodeId);
    const targetNode = getNodeData(targetNodeId);

    if (!routeData || !targetNode) {
        return { status: 'FAILED_INVALID_ROUTE', updatedPlayer: playerEntity };
    }

    const apCost = calculateTravelApCost(playerEntity, currentNodeId, targetNodeId, seasonModifier);
    const coinCost = (routeData.transitCoinCost || 0) + (targetNode.entryCoinCost || 0);

    if (playerEntity.progression.actionPoints < apCost) {
        return { status: 'FAILED_INSUFFICIENT_AP', updatedPlayer: playerEntity };
    }

    if (playerEntity.inventory.silverCoins < coinCost) {
        return { status: 'FAILED_INSUFFICIENT_COINS', updatedPlayer: playerEntity };
    }

    // 1. Apply primary resource deduction
    playerEntity.progression.actionPoints -= apCost;
    playerEntity.inventory.silverCoins -= coinCost;

    let mountDied = false;

    // 2. Apply Mount HP Penalty
    if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
        const hpPenalty = apCost * WORLD.SPATIAL.transit.mountTransitHpPenaltyPerAp;
        
        // Assumes mountItem has an hpCurrent property as defined in the Action Tags dict.
        playerEntity.equipment.mountItem.hpCurrent -= hpPenalty;

        if (playerEntity.equipment.mountItem.hpCurrent <= 0) {
            playerEntity.equipment.mountItem.hpCurrent = 0;
            playerEntity.equipment.hasMount = false; // The mount collapses/dies
            mountDied = true;
            
            // Re-evaluates maxCapacity since the mount is no longer providing carry weight
            recalculateEncumbrance(playerEntity);
        }
    }

    return { 
        status: 'SUCCESS', 
        apSpent: apCost, 
        coinsSpent: coinCost, 
        destinationId: targetNodeId,
        mountDied: mountDied,
        updatedPlayer: playerEntity 
    };
};