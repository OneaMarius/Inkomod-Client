// File: src/engine/GameManager.js
// Description: Master State Manager. Acts as the bridge between the UI and the underlying game engines.

// --- Data Configuration ---
import { WORLD } from '../data/GameWorld.js';
import { DB_LOCATIONS_POIS_Untamed } from '../data/DB_Locations_POIS.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
// --- Engine Modules ---
import { initializeNewPlayer } from './ENGINE_PlayerCreation.js';
import { executeTravel } from './ENGINE_World_Travel.js';
import { executeEndMonth } from './ENGINE_Time_Loop.js';
import { executeRandomEvent } from './ENGINE_Events.js';
import { processCombatTurn } from './ENGINE_Combat_Loop.js';
import { generateCombatLoot } from './ENGINE_Loot_Drop.js';
import { executeInteraction } from './ENGINE_Interaction.js';
import { populatePOI } from './ENGINE_Spawner.js';
import {
	executeBuyTransaction,
	executeSellTransaction,
	executeRepairTransaction,
} from './ENGINE_Economy_Shops.js';
import {
	equipItem,
	unequipItem,
	dropItem,
	slaughterAnimal,
	recalculateEncumbrance,
} from './ENGINE_Inventory.js';

export class GameManager {
	constructor() {
		this.gameState = {
			player: null,
			time: null,
			location: {
				currentWorldId: null,
				currentPoiId: null,
				regionalExchangeRate: 10,
				regionalRates: {},
			},
			activeEntities: [],
			currentView: 'VIEWPORT',
			activeTargetId: null,
			activeTradeTag: null,
		};
	}

	// ========================================================================
	// LIFECYCLE & TIME MANAGEMENT
	// ========================================================================
	startNewGame(creationParams, startingLocationId) {
		this.gameState.player = initializeNewPlayer(creationParams);

		this.gameState.time = {
			currentMonth: WORLD.TIME.startMonth,
			currentTurn: WORLD.TIME.startTurn || 0,
			currentYear: WORLD.TIME.startYear || 1308,
			totalMonthsPassed: 0,
			activeSeason: 'spring',
		};

		const rRates = WORLD.ECONOMY.regionalExchangeRates;
		const getRandomRate = (min, max) =>
			Math.floor(Math.random() * (max - min + 1)) + min;

		this.gameState.location.regionalRates = {
			DOMIKON: getRandomRate(rRates.capitalMin, rRates.capitalMax),
			IRONVOW: getRandomRate(rRates.provincesMin, rRates.provincesMax),
			NORHELM: getRandomRate(rRates.provincesMin, rRates.provincesMax),
			KRYPTON: getRandomRate(rRates.provincesMin, rRates.provincesMax),
			MYTHOSS: getRandomRate(rRates.provincesMin, rRates.provincesMax),
			OLDGROW: getRandomRate(rRates.provincesMin, rRates.provincesMax),
			DOOMARK: getRandomRate(rRates.provincesMin, rRates.provincesMax),
			ORBIT: getRandomRate(rRates.orbitMin, rRates.orbitMax),
			WILD: getRandomRate(rRates.wildMin, rRates.wildMax),
			EDGE: getRandomRate(rRates.edgeMin, rRates.edgeMax),
		};

		this.gameState.location.currentWorldId = startingLocationId;
		this.gameState.location.currentPoiId = null;

		const startZoneClass = startingLocationId.split('_')[0];
		this.gameState.location.regionalExchangeRate =
			this.gameState.location.regionalRates[startZoneClass] || 10;
		this.gameState.currentView = 'VIEWPORT';
		this.gameState.activeTargetId = null;

		return true;
	}

	_fluctuateWorldEconomy() {
		if (!this.gameState.location.regionalRates) return;

		const rates = this.gameState.location.regionalRates;
		const eBounds = WORLD.ECONOMY.regionalExchangeRates;

		const boundsConfig = {
			DOMIKON: { min: eBounds.capitalMin, max: eBounds.capitalMax },
			IRONVOW: { min: eBounds.provincesMin, max: eBounds.provincesMax },
			NORHELM: { min: eBounds.provincesMin, max: eBounds.provincesMax },
			KRYPTON: { min: eBounds.provincesMin, max: eBounds.provincesMax },
			MYTHOSS: { min: eBounds.provincesMin, max: eBounds.provincesMax },
			OLDGROW: { min: eBounds.provincesMin, max: eBounds.provincesMax },
			DOOMARK: { min: eBounds.provincesMin, max: eBounds.provincesMax },
			ORBIT: { min: eBounds.orbitMin, max: eBounds.orbitMax },
			WILD: { min: eBounds.wildMin, max: eBounds.wildMax },
			EDGE: { min: eBounds.edgeMin, max: eBounds.edgeMax },
		};

		for (const [region, limits] of Object.entries(boundsConfig)) {
			if (rates[region]) {
				const fluctuation = Math.floor(Math.random() * 11) - 5;
				const newRate = rates[region] + fluctuation;
				rates[region] = Math.max(limits.min, Math.min(newRate, limits.max));
			}
		}

		if (this.gameState.location.currentWorldId) {
			const currentZoneClass =
				this.gameState.location.currentWorldId.split('_')[0];
			this.gameState.location.regionalExchangeRate = rates[currentZoneClass];
		}
	}

	processAction_EndMonth() {
		const timeResult = executeEndMonth(
			this.gameState.player,
			this.gameState.time,
		);

		if (timeResult.status === 'PERMADEATH') {
			this.gameState.player = timeResult.updatedPlayer;
			this.gameState.time = timeResult.updatedTime;
			return timeResult;
		}

		this.gameState.player = timeResult.updatedPlayer;
		this.gameState.time = timeResult.updatedTime;
		this.gameState.time.currentTurn =
			(this.gameState.time.currentTurn || 0) + 1;

		if (
			this.gameState.time.totalMonthsPassed > 0 &&
			this.gameState.time.totalMonthsPassed %
				WORLD.ECONOMY.fluctuationIntervalMonths ===
				0
		) {
			this._fluctuateWorldEconomy();
		}

		// --- NEW: Construct environmentData for Event Engine ---
		const currentZone =
			DB_LOCATIONS_ZONES.find(
				(z) => z.worldId === this.gameState.location.currentWorldId,
			) || {};
		const environmentData = {
			worldId: this.gameState.location.currentWorldId,
			currentSeason: this.gameState.time.currentSeason,
			currentZoneEconomyLevel: currentZone.zoneEconomyLevel || 1,
		};

		// --- NEW: Pass environmentData as the 3rd argument ---
		const eventResult = executeRandomEvent(
			this.gameState.player,
			'endturn',
			environmentData,
		);

		if (eventResult.status === 'PERMADEATH') {
			this.gameState.player = eventResult.updatedPlayer;
			return eventResult;
		}

		if (eventResult.updatedPlayer) {
			this.gameState.player = eventResult.updatedPlayer;
		}

		// Return the full eventResult, bubbling up the monthlyReport explicitly
		return {
			status: 'SUCCESS',
			monthlyReport: timeResult.monthlyReport, // --- NEW: Extras din Time Loop
			timeLog: timeResult,
			eventLog: eventResult,
		};
	}

	// ========================================================================
	// SPATIAL ROUTING (Map & POIs)
	// ========================================================================
	processAction_Travel(targetNodeId) {
		const travelResult = executeTravel(
			this.gameState.player,
			this.gameState.location.currentWorldId,
			targetNodeId,
			0,
		);

		if (travelResult.status !== 'SUCCESS') return travelResult;

		this.gameState.player = travelResult.updatedPlayer;
		this.gameState.location.currentWorldId = targetNodeId;

		const newZoneClass = targetNodeId.split('_')[0];
		if (!this.gameState.location.regionalRates)
			this.gameState.location.regionalRates = {};
		if (this.gameState.location.regionalRates[newZoneClass]) {
			this.gameState.location.regionalExchangeRate =
				this.gameState.location.regionalRates[newZoneClass];
		}

		this.gameState.currentView = 'VIEWPORT';
		this.gameState.activeTargetId = null;
		this.gameState.activeTradeTag = null;

		// --- NEW: Construct environmentData based on destination ---
		const destZone =
			DB_LOCATIONS_ZONES.find((z) => z.worldId === targetNodeId) || {};
		const environmentData = {
			worldId: targetNodeId,
			currentSeason: this.gameState.time.currentSeason,
			currentZoneEconomyLevel: destZone.zoneEconomyLevel || 1,
		};

		// --- NEW: Pass environmentData as the 3rd argument ---
		const eventResult = executeRandomEvent(
			this.gameState.player,
			'travel',
			environmentData,
		);

		if (eventResult.status === 'PERMADEATH') {
			this.gameState.player = eventResult.updatedPlayer;
			return eventResult; // Handled by State Manager
		}

		if (eventResult.updatedPlayer) {
			this.gameState.player = eventResult.updatedPlayer;
		}

		// Return the full eventResult
		return {
			status: 'SUCCESS',
			travelLog: travelResult,
			eventLog: eventResult,
		};
	}

	processAction_EnterPoi(
		poiId,
		poiCategory = 'CIVILIZED',
		overrideApCost = null,
	) {
		let apCost = 0;

		if (overrideApCost !== null) {
			apCost = overrideApCost;
		} else if (poiCategory === 'CIVILIZED') {
			apCost =
				WORLD.SPATIAL?.actionCosts?.enterCivilizedPoiAp !== undefined
					? WORLD.SPATIAL.actionCosts.enterCivilizedPoiAp
					: 1;
		} else if (poiCategory === 'UNTAMED') {
			const poiData = DB_LOCATIONS_POIS_Untamed[poiId];
			apCost =
				poiData?.classification?.enterUntamedPoiApCost !== undefined
					? poiData.classification.enterUntamedPoiApCost
					: WORLD.SPATIAL?.actionCosts?.enterUntamedPoiApDefault || 1;
		}

		if (this.gameState.player.progression.actionPoints < apCost) {
			return { status: 'FAILED_INSUFFICIENT_AP', requiredAp: apCost };
		}

		// ... ap calculations ...
		this.gameState.player.progression.actionPoints -= apCost;
		this.gameState.location.currentPoiId = poiId;

		const currentWorldId = this.gameState.location.currentWorldId;

		// UNIFIED CALL: Handles both Normal POIs and the Sandbox POI automatically
		this.gameState.activeEntities = populatePOI(
			poiId,
			poiCategory,
			currentWorldId,
		);

		this.gameState.currentView = 'VIEWPORT';
		this.gameState.activeTargetId = null;

		return {
			status: 'SUCCESS',
			activeEntities: this.gameState.activeEntities,
			apConsumed: apCost,
		};
	}

	processAction_ExploreUntamed() {
		const exploreCost =
			WORLD.SPATIAL?.actionCosts?.exploreUntamedAp !== undefined
				? WORLD.SPATIAL.actionCosts.exploreUntamedAp
				: 1;

		if (this.gameState.player.progression.actionPoints < exploreCost) {
			return { status: 'FAILED_INSUFFICIENT_AP', requiredAp: exploreCost };
		}

		this.gameState.player.progression.actionPoints -= exploreCost;

		// --- ZARUL DESTINULUI (Destiny Roll) ---
		const chances = WORLD.SPATIAL?.exploreChances || {
			event: 30,
			poi: 50,
			nothing: 20,
		};
		const destinyRoll = Math.floor(Math.random() * 100) + 1;
		const eventThreshold = chances.event;
		const poiThreshold = chances.event + chances.poi;

		if (destinyRoll <= eventThreshold) {
			// 1. TRIGGER: Narrative Event
			const currentZone =
				DB_LOCATIONS_ZONES.find(
					(z) => z.worldId === this.gameState.location.currentWorldId,
				) || {};
			const environmentData = {
				worldId: this.gameState.location.currentWorldId,
				currentSeason: this.gameState.time.currentSeason,
				currentZoneEconomyLevel: currentZone.zoneEconomyLevel || 1,
			};

			const eventResult = executeRandomEvent(
				this.gameState.player,
				'explore',
				environmentData,
			);

			if (eventResult.status === 'PERMADEATH') {
				this.gameState.player = eventResult.updatedPlayer;
				return eventResult;
			}

			if (eventResult.updatedPlayer) {
				this.gameState.player = eventResult.updatedPlayer;
			}

			// CRITICAL FIX: Spunem managerului că am intrat în EVENT
			if (
				eventResult.status === 'AWAITING_INPUT' ||
				eventResult.status === 'RESOLVED_SEE'
			) {
				this.gameState.currentView = 'EVENT';
			}

			return { status: 'SUCCESS', eventLog: eventResult };
		} else if (destinyRoll <= poiThreshold) {
			// 2. TRIGGER: Point of Interest Discovery

			// Retrieve the current zone class to filter POIs
			const currentZoneClass =
				DB_LOCATIONS_ZONES.find(
					(z) => z.worldId === this.gameState.location.currentWorldId,
				)?.zoneClass || 'Wild'; // Fallback to Wild if undefined

			const untamedKeys = Object.keys(DB_LOCATIONS_POIS_Untamed);
			if (untamedKeys.length === 0) return { status: 'FAILED_NO_POIS' };

			let totalWeight = 0;
			const pool = [];

			// Filter the POIs to only include Generic ('Any') and Region-Specific POIs
			for (const key of untamedKeys) {
				const poi = DB_LOCATIONS_POIS_Untamed[key];
				const poiClass = poi.classification?.poiClass;

				// Only add POI if it matches the region or is generic, and is not the Test Arena
				if (
					(poiClass === 'Any' || poiClass === currentZoneClass) &&
					poiClass !== 'Test'
				) {
					const chance = poi.classification?.locationSpawnChance || 10;
					totalWeight += chance;
					pool.push({ id: key, chance });
				}
			}

			if (pool.length === 0) return { status: 'FAILED_NO_VALID_POIS' };

			let roll = Math.random() * totalWeight;
			let selectedPoiId = pool[0].id;

			for (const item of pool) {
				roll -= item.chance;
				if (roll <= 0) {
					selectedPoiId = item.id;
					break;
				}
			}

			const poiName = selectedPoiId.replace(/_/g, ' ');
			const eventLog = {
				name: 'Location Discovered',
				subtitle: poiName,
				description: `Through the dense wilderness, you stumbled upon a location. Do you wish to approach it?`,
				changes: [{ label: 'Action Points', value: -exploreCost }],
				type: 'EXPLORE_SUCCESS',
				discoveredPoi: selectedPoiId,
			};
			return { status: 'SUCCESS', eventLog };
		} else {
			// 3. TRIGGER: Nothing Found
			const eventLog = {
				name: 'Wilderness Exploration',
				description:
					'You scoured the area but found nothing of interest. Just empty wilderness.',
				changes: [{ label: 'Action Points', value: -exploreCost }],
				type: 'EXPLORE_NOTHING',
			};
			return { status: 'SUCCESS', eventLog };
		}
	}

	processAction_Hunt() {
		const huntCost =
			WORLD.SPATIAL?.actionCosts?.huntUntamedAp !== undefined
				? WORLD.SPATIAL.actionCosts.huntUntamedAp
				: 1;

		if (this.gameState.player.progression.actionPoints < huntCost) {
			return { status: 'FAILED_INSUFFICIENT_AP', requiredAp: huntCost };
		}

		this.gameState.player.progression.actionPoints -= huntCost;

		// --- HUNT DESTINY ROLL ---
		const chances = WORLD.SPATIAL?.huntChances || {
			positiveHunt: 30,
			negativeHunt: 20,
			generalEvent: 20,
			nothing: 30,
		};
		const destinyRoll = Math.floor(Math.random() * 100) + 1;

		const positiveThreshold = chances.positiveHunt;
		const negativeThreshold = chances.positiveHunt + chances.negativeHunt;
		const generalThreshold =
			chances.positiveHunt + chances.negativeHunt + chances.generalEvent;

		const currentZone =
			DB_LOCATIONS_ZONES.find(
				(z) => z.worldId === this.gameState.location.currentWorldId,
			) || {};
		const environmentData = {
			worldId: this.gameState.location.currentWorldId,
			currentSeason: this.gameState.time.currentSeason,
			currentZoneEconomyLevel: currentZone.zoneEconomyLevel || 1,
		};

		if (destinyRoll <= positiveThreshold) {
			// 1. TRIGGER: Hunt Success
			const eventResult = executeRandomEvent(
				this.gameState.player,
				'hunt_success',
				environmentData,
			);
			if (
				eventResult.status === 'AWAITING_INPUT' ||
				eventResult.status === 'RESOLVED_SEE'
			) {
				this.gameState.currentView = 'EVENT';
			}
			return { status: 'SUCCESS', eventLog: eventResult };
		} else if (destinyRoll <= negativeThreshold) {
			// 2. TRIGGER: Hunt Ambush
			const eventResult = executeRandomEvent(
				this.gameState.player,
				'hunt_ambush',
				environmentData,
			);
			if (
				eventResult.status === 'AWAITING_INPUT' ||
				eventResult.status === 'RESOLVED_SEE'
			) {
				this.gameState.currentView = 'EVENT';
			}
			return { status: 'SUCCESS', eventLog: eventResult };
		} else if (destinyRoll <= generalThreshold) {
			// 3. TRIGGER: General Explore Event
			const eventResult = executeRandomEvent(
				this.gameState.player,
				'explore',
				environmentData,
			);
			if (
				eventResult.status === 'AWAITING_INPUT' ||
				eventResult.status === 'RESOLVED_SEE'
			) {
				this.gameState.currentView = 'EVENT';
			}
			return { status: 'SUCCESS', eventLog: eventResult };
		} else {
			// 4. TRIGGER: Nothing Found
			const eventLog = {
				name: 'Cold Trail',
				description:
					'You spent hours tracking broken twigs and faded prints, but found nothing but empty wilderness.',
				changes: [{ label: 'Action Points', value: -huntCost }],
				type: 'EXPLORE_NOTHING',
			};
			return { status: 'SUCCESS', eventLog };
		}
	}

	processAction_ExitPoi() {
		this.gameState.location.currentPoiId = null;
		this.gameState.activeEntities = [];
		this.gameState.currentView = 'VIEWPORT';
		this.gameState.activeTargetId = null;
		this.gameState.activeTradeTag = null;
		return { status: 'SUCCESS' };
	}

	// ========================================================================
	// INTERACTION & COMBAT ENGINE ROUTING
	// ========================================================================
	processAction_Interaction(actionTag, targetId, exchangeRate, amount = 0) {
		const regionalExchangeRate =
			exchangeRate || this.gameState.location.regionalExchangeRate;

		const npcTarget = this.gameState.activeEntities.find(
			(entity) => entity.entityId === targetId || entity.id === targetId,
		);

		// NOU: Trimitem și parametrul `amount` către motorul de interacțiune
		const result = executeInteraction(
			this.gameState.player,
			actionTag,
			npcTarget,
			regionalExchangeRate,
			amount,
		);

		if (result.status === 'SUCCESS') {
			this.gameState.player = result.updatedPlayer;
			// Scoatem NPC-ul de pe hartă doar dacă e mort (combat letal/asasinare), nu la donații!
			// GameManager-ul tău făcea asta pentru orice SUCCESS (ceea ce ștergea NPC-ul și la pickpocket).
			// Am corectat asta subtil: doar Asasinarea îl scoate.
			if (actionTag === 'Target_Assassination') {
				this.gameState.activeEntities =
					this.gameState.activeEntities.filter(
						(entity) =>
							entity.entityId !== targetId && entity.id !== targetId,
					);
			}
		} else if (result.status === 'TRIGGER_COMBAT') {
			this.gameState.player = result.updatedPlayer;
			this.gameState.currentView = 'COMBAT';
			this.gameState.activeTargetId = result.targetId;
		} else if (result.status === 'TRIGGER_TRADE') {
			this.gameState.player = result.updatedPlayer;
			this.gameState.currentView = 'TRADE';
			this.gameState.activeTargetId = result.targetId;
			this.gameState.activeTradeTag = actionTag;
		} else if (result.status === 'TRIGGER_DYNAMIC_EVENT') {
			this.gameState.player = result.updatedPlayer;
			this.gameState.currentView = 'EVENT';
			this.gameState.activeTargetId = result.targetId;
		}

		return result;
	}

	processAction_CombatTurn(npcEntity, combatType, playerAction) {
		const turnResult = processCombatTurn(
			this.gameState.player,
			npcEntity,
			combatType,
			playerAction,
		);
		this.gameState.player = turnResult.playerEntity;

		let lootPayload = null;
		if (turnResult.combatStatus !== 'CONTINUE') {
			lootPayload = generateCombatLoot(
				turnResult.npcEntity,
				combatType,
				turnResult.combatStatus,
			);

			if (lootPayload.silverCoins)
				this.gameState.player.inventory.silverCoins +=
					lootPayload.silverCoins;
			if (lootPayload.food)
				this.gameState.player.inventory.food += lootPayload.food;

			const targetId = this.gameState.activeTargetId;
			if (targetId) {
				this.gameState.activeEntities =
					this.gameState.activeEntities.filter(
						(entity) =>
							entity.entityId !== targetId && entity.id !== targetId,
					);
			}

			this.gameState.activeTargetId = null;
			this.gameState.currentView = 'VIEWPORT';
		}

		return {
			combatStatus: turnResult.combatStatus,
			log: turnResult.log,
			loot: lootPayload,
		};
	}

	// ========================================================================
	// COMMERCE & ECONOMY
	// ========================================================================
	processAction_Commerce(transactionType, payload) {
		let result;

		if (transactionType === 'BUY') {
			result = executeBuyTransaction(
				this.gameState.player,
				payload.itemDef,
				payload.quantity,
				payload.regionalExchangeRate,
				payload.targetCategory,
			);
		} else if (transactionType === 'SELL') {
			result = executeSellTransaction(
				this.gameState.player,
				payload.itemDef,
				payload.quantity,
				payload.regionalExchangeRate,
				payload.targetCategory,
				payload.physicalItemIndex,
			);
		} else if (transactionType === 'REPAIR') {
			result = executeRepairTransaction(
				this.gameState.player,
				payload.regionalExchangeRate,
				payload.targetCategory,
				payload.physicalItemIndex,
			);
		}

		if (result && result.status === 'SUCCESS') {
			this.gameState.player = result.updatedPlayer;
		}

		return result;
	}

	// ========================================================================
	// INVENTORY MANAGEMENT
	// ========================================================================
	processAction_Equip(inventoryIndex, itemCategory) {
		const result = equipItem(
			this.gameState.player,
			inventoryIndex,
			itemCategory,
		);
		if (result.status === 'SUCCESS')
			this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_Unequip(itemCategory) {
		const result = unequipItem(this.gameState.player, itemCategory);
		if (result.status === 'SUCCESS')
			this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_DropItem(inventoryIndex, targetArrayName) {
		const result = dropItem(
			this.gameState.player,
			inventoryIndex,
			targetArrayName,
		);
		if (result.status === 'SUCCESS')
			this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_SlaughterAnimal(inventoryIndex) {
		const result = slaughterAnimal(this.gameState.player, inventoryIndex);
		if (result.status === 'SUCCESS')
			this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_RecalculateEncumbrance() {
		if (!this.gameState || !this.gameState.player)
			return { status: 'FAILED_NO_PLAYER' };

		const updatedPlayer = recalculateEncumbrance(this.gameState.player);
		this.gameState.player = updatedPlayer;

		return { status: 'SUCCESS', updatedPlayer: this.gameState.player };
	}
}

export const MasterGameManager = new GameManager();
