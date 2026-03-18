// File: src/engine/ENGINE_World_Travel.js
// Description: Manages map navigation, route calculations, and transit costs using WORLD.SPATIAL constants.

import { WORLD } from '../data/GameWorld.js';
import {
	DB_LOCATIONS_ZONES,
	DB_LOCATIONS_GATES,
} from '../data/DB_Locations.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// DATA RETRIEVAL HELPERS
// ------------------------------------------------------------------------

const getNodeData = (nodeId) => {
	return DB_LOCATIONS_ZONES.find((node) => node.worldId === nodeId);
};

const getRouteData = (currentNodeId, targetNodeId) => {
	return DB_LOCATIONS_GATES.find(
		(route) =>
			(route.gateZone1 === currentNodeId &&
				route.gateZone2 === targetNodeId) ||
			(route.gateZone2 === currentNodeId &&
				route.gateZone1 === targetNodeId),
	);
};

// ------------------------------------------------------------------------
// COST CALCULATION
// ------------------------------------------------------------------------

export const calculateTravelApCost = (
	playerEntity,
	currentNodeId,
	targetNodeId,
	seasonModifier = 0,
) => {
	const targetNode = getNodeData(targetNodeId);
	const route = getRouteData(currentNodeId, targetNodeId);

	if (!targetNode || !route) return 999;

	const baseApCost = (targetNode.costAp || 0) + (route.costAp || 0);
	const encumbrancePenalty = playerEntity.logistics.travelApPenalty || 0;

	let mountFactor = 1.0;

	if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
		const mountAgi = playerEntity.equipment.mountItem.stats?.agi || 5;
		const transitConstants = WORLD.SPATIAL.transit;

		mountFactor = Math.max(
			transitConstants.mountMaxReductionFactor,
			transitConstants.mountMinReductionFactor -
				mountAgi * transitConstants.mountAgiMultiplier,
		);
	}

	const rawCalculation = Math.ceil(
		(baseApCost + seasonModifier + encumbrancePenalty) * mountFactor,
	);
	return Math.max(1, rawCalculation);
};

// ------------------------------------------------------------------------
// ROUTE EVALUATION
// ------------------------------------------------------------------------

export const getAvailableRoutes = (
	playerEntity,
	currentNodeId,
	seasonModifier = 0,
) => {
	const playerAp = playerEntity.progression.actionPoints;
	const playerCoins = playerEntity.inventory.silverCoins;
	const availableRoutes = [];

	const connectedRoutes = DB_LOCATIONS_GATES.filter(
		(route) =>
			route.gateZone1 === currentNodeId || route.gateZone2 === currentNodeId,
	);

	connectedRoutes.forEach((route) => {
		const targetNodeId =
			route.gateZone1 === currentNodeId ? route.gateZone2 : route.gateZone1;
		const targetNode = getNodeData(targetNodeId);

		if (targetNode) {
			const totalApRequired = calculateTravelApCost(
				playerEntity,
				currentNodeId,
				targetNodeId,
				seasonModifier,
			);

			const totalCoinRequired =
				(route.costCoin || 0) + (targetNode.costCoin || 0);

			const isAccessible =
				playerAp >= totalApRequired && playerCoins >= totalCoinRequired;

			availableRoutes.push({
				destinationId: targetNode.worldId,
				destinationName: targetNode.zoneName,
				zoneClass: targetNode.zoneClass,
				economyLevel: targetNode.zoneEconomyLevel,
				routeName: route.gateName,
				transitType: route.gateCategory,
				totalApCost: totalApRequired,
				totalCoinCost: totalCoinRequired,
				isAccessible: isAccessible,
			});
		}
	});

	return availableRoutes;
};

// ------------------------------------------------------------------------
// TRAVEL EXECUTION
// ------------------------------------------------------------------------

export const executeTravel = (
	playerEntity,
	currentNodeId,
	targetNodeId,
	seasonModifier = 0,
) => {
	const routeData = getRouteData(currentNodeId, targetNodeId);
	const targetNode = getNodeData(targetNodeId);

	if (!routeData || !targetNode) {
		return { status: 'FAILED_INVALID_ROUTE', updatedPlayer: playerEntity };
	}

	const apCost = calculateTravelApCost(
		playerEntity,
		currentNodeId,
		targetNodeId,
		seasonModifier,
	);
	const coinCost = (routeData.costCoin || 0) + (targetNode.costCoin || 0);

	if (playerEntity.progression.actionPoints < apCost) {
		return { status: 'FAILED_INSUFFICIENT_AP', updatedPlayer: playerEntity };
	}

	if (playerEntity.inventory.silverCoins < coinCost) {
		return {
			status: 'FAILED_INSUFFICIENT_COINS',
			updatedPlayer: playerEntity,
		};
	}

	// 1. Resource Deduction
	playerEntity.progression.actionPoints -= apCost;
	playerEntity.inventory.silverCoins -= coinCost;

	let entitiesDiedOnRoad = false;
	const deathMultiplier =
		WORLD.NPC?.ANIMAL?.foodYieldMultipliers?.death || 0.5;

	// 2. Exhaustion Penalty (HP) for Equipped Mount
	if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
		const hpPenaltyMount =
			apCost * (WORLD.SPATIAL.transit.mountTransitHpPenaltyPerAp || 2);
		playerEntity.equipment.mountItem.biology.hpCurrent -= hpPenaltyMount;

		if (playerEntity.equipment.mountItem.biology.hpCurrent <= 0) {
			const baseYield =
				playerEntity.equipment.mountItem.logistics?.foodYield || 10;
			const meatYield = Math.max(1, Math.floor(baseYield * deathMultiplier));

			playerEntity.inventory.food =
				(playerEntity.inventory.food || 0) + meatYield;

			playerEntity.equipment.mountItem = null;
			playerEntity.equipment.hasMount = false;
			entitiesDiedOnRoad = true;
		}
	}

	// 3. Exhaustion Penalty (HP) for Caravan Animals
	if (
		playerEntity.inventory.animalSlots &&
		playerEntity.inventory.animalSlots.length > 0
	) {
		const hpPenaltyCaravan =
			apCost * (WORLD.SPATIAL.transit.caravanTransitHpPenaltyPerAp || 1);

		playerEntity.inventory.animalSlots =
			playerEntity.inventory.animalSlots.filter((animal) => {
				animal.biology.hpCurrent -= hpPenaltyCaravan;

				if (animal.biology.hpCurrent <= 0) {
					const baseYield = animal.logistics?.foodYield || 10;
					const meatYield = Math.max(
						1,
						Math.floor(baseYield * deathMultiplier),
					);

					playerEntity.inventory.food =
						(playerEntity.inventory.food || 0) + meatYield;

					entitiesDiedOnRoad = true;
					return false;
				}
				return true;
			});
	}

	// 4. Logistics Recalculation
	if (entitiesDiedOnRoad) {
		recalculateEncumbrance(playerEntity);
	}

	return {
		status: 'SUCCESS',
		apSpent: apCost,
		coinsSpent: coinCost,
		destinationId: targetNodeId,
		entitiesDiedOnRoad: entitiesDiedOnRoad,
		updatedPlayer: playerEntity,
	};
};
