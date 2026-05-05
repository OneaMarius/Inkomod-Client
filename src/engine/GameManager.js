// File: src/engine/GameManager.js
// Description: Master State Manager. Acts as the bridge between the UI and the underlying game engines.

// --- Data Configuration ---
import { WORLD } from '../data/GameWorld.js';
import { DB_LOCATIONS_POIS_Untamed } from '../data/DB_Locations_POIS.js';
import { DB_LOCATIONS_POIS_Civilized } from '../data/DB_Locations_POIS.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
// --- Engine Modules ---
import { initializeNewPlayer } from './ENGINE_PlayerCreation.js';
import { executeTravel } from './ENGINE_World_Travel.js';
import { executeEndMonth } from './ENGINE_Time_Loop.js';
import { executeRandomEvent } from './ENGINE_Events.js';
import { processCombatTurn } from './ENGINE_Combat_Loop.js';
import { executeInteraction } from './ENGINE_Interaction.js';
import { populatePOI } from './ENGINE_Spawner.js';
import { executeBuyTransaction, executeSellTransaction, executeRepairTransaction } from './ENGINE_Economy_Shops.js';
import { equipItem, unequipItem, dropItem, slaughterAnimal, recalculateEncumbrance } from './ENGINE_Inventory.js';

export class GameManager {
	constructor() {
		this.gameState = {
			player: null,
			time: null,
			location: { currentWorldId: null, currentPoiId: null, regionalExchangeRate: 10, regionalRates: {} },
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
		const getRandomRate = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

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
		this.gameState.location.regionalExchangeRate = this.gameState.location.regionalRates[startZoneClass] || 10;
		this.gameState.currentView = 'VIEWPORT';
		this.gameState.activeTargetId = null;

		return true;
	}

	_fluctuateWorldEconomy() {
		if (!this.gameState.location.regionalRates) return;

		const rates = this.gameState.location.regionalRates;
		const eBounds = WORLD.ECONOMY.regionalExchangeRates;
		const flLimits = WORLD.ECONOMY.rateFluctuationLimits || { minDrop: -5, maxRise: 5 };

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
			if (rates[region] !== undefined) {
				const currentRate = rates[region];

				let localMinDrop = flLimits.minDrop;
				let localMaxRise = flLimits.maxRise;

				// Restrict positive fluctuation if the current rate is at or above the maximum limit
				if (currentRate >= limits.max) {
					localMaxRise = 0;
				}
				// Restrict negative fluctuation if the current rate is at or below the minimum limit
				else if (currentRate <= limits.min) {
					localMinDrop = 0;
				}

				// Generate fluctuation using the dynamically adjusted boundaries
				const fluctuation = Math.floor(Math.random() * (localMaxRise - localMinDrop + 1)) + localMinDrop;
				const newRate = currentRate + fluctuation;

				// Final safety clamp to strictly enforce absolute regional bounds
				rates[region] = Math.max(limits.min, Math.min(newRate, limits.max));
			}
		}

		if (this.gameState.location.currentWorldId) {
			const currentZoneClass = this.gameState.location.currentWorldId.split('_')[0];
			this.gameState.location.regionalExchangeRate = rates[currentZoneClass];
		}
	}

	_evaluateRankChanges(player, timeResult) {
		const currentRank = player.identity?.rank || 1;
		const currentRenown = player.progression?.renown || 0;

		// Asigurăm existența obiectelor pentru raport
		if (!timeResult.monthlyReport) {
			timeResult.monthlyReport = {};
		}
		if (!timeResult.monthlyReport.socialEvents) {
			timeResult.monthlyReport.socialEvents = [];
		}

		let rankChanged = false;

		// --- 1. VERIFICARE PROMOVARE (PROMOTION) ---
		if (currentRank < 5) {
			const nextTierKey = `tier${currentRank + 1}`;
			const requiredRenownForNext = WORLD.SOCIAL?.gatekeepingRenownReq?.[nextTierKey] || 9999;

			if (currentRenown >= requiredRenownForNext) {
				player.identity.rank += 1;
				rankChanged = true;

				const baseTitle = WORLD.SOCIAL.rankTitles[player.identity.rank] || 'Knight';
				const promoMessage = `Your deeds are recognized across the realm. You have advanced to Rank ${player.identity.rank}: ${baseTitle}.`;

				timeResult.monthlyReport.socialEvents.push(promoMessage);
				return true; // Ne oprim aici, a crescut
			}
		}

		// --- 2. VERIFICARE RETROGRADARE (DEMOTION) ---
		if (currentRank > 1) {
			const currentTierKey = `tier${currentRank}`;
			// Aflăm de cât renown are nevoie pentru a se menține la rank-ul actual
			const requiredRenownToKeep = WORLD.SOCIAL?.gatekeepingRenownReq?.[currentTierKey] || 0;

			if (currentRenown < requiredRenownToKeep) {
				player.identity.rank -= 1;
				rankChanged = true;

				const baseTitle = WORLD.SOCIAL.rankTitles[player.identity.rank] || 'Knight';
				const demotionMessage = `Word of your recent failures has spread. You have been demoted to Rank ${player.identity.rank}: ${baseTitle}.`;

				timeResult.monthlyReport.socialEvents.push(demotionMessage);
				return true;
			}
		}

		return rankChanged;
	}

	processAction_EndMonth() {
		// 1. Store unused AP before they are reset by the month transition
		const unspentAP = this.gameState.player.progression.actionPoints || 0;

		// 2. Execute standard end month logic
		// This processes food consumption and standard healing (+25 HP)
		const timeResult = executeEndMonth(this.gameState.player, this.gameState.time);

		if (timeResult.status === 'PERMADEATH') {
			this.gameState.player = timeResult.updatedPlayer;
			this.gameState.time = timeResult.updatedTime;
			return timeResult;
		}

		this.gameState.player = timeResult.updatedPlayer;
		this.gameState.time = timeResult.updatedTime;
		this.gameState.time.currentTurn = (this.gameState.time.currentTurn || 0) + 1;

		// 3. Calculate and apply AP-to-HP bonus with Starvation Check
		let apHealingBonus = 0;
		const player = this.gameState.player;

		// CHECK: Only heal if the player has food and unspent AP
		// This prevents canceling starvation damage with unused AP
		const hasFood = player.inventory.food > 0;
		let potentialHealing = unspentAP * 5;
		if (unspentAP > 0 && hasFood && player.biology.hpCurrent < player.biology.hpMax) {
			const hpPerAP = 5;
			potentialHealing = unspentAP * hpPerAP;
			const missingHp = player.biology.hpMax - player.biology.hpCurrent;

			apHealingBonus = Math.min(potentialHealing, missingHp);

			if (apHealingBonus > 0) {
				player.biology.hpCurrent += apHealingBonus;
			}
		}

		// 4. Update the monthly report for UI feedback
		if (!timeResult.monthlyReport) {
			timeResult.monthlyReport = {};
		}

		// Update the numerical value in the report (Standard Healing + AP Bonus)
		const standardHealing = timeResult.monthlyReport.hpGained || 0;
		timeResult.monthlyReport.hpGained = standardHealing + apHealingBonus;

		// Ensure logs arrays exist
		if (!timeResult.monthlyReport.healthEvents) {
			timeResult.monthlyReport.healthEvents = [];
		}

		// Add descriptive text for the player to see in the Morning Report
		if (apHealingBonus > 0) {
			timeResult.monthlyReport.healthEvents.push(`Last month unspent AP conversion: +${apHealingBonus} HP (${potentialHealing} HP was possible).`);
		} else if (unspentAP > 0 && !hasFood) {
			timeResult.monthlyReport.healthEvents.push(`Starvation: No HP gained from last month unspent ${unspentAP} AP.`);
		}

		// --- Rest of the standard monthly logic ---
		if (this.gameState.time.totalMonthsPassed > 0 && this.gameState.time.totalMonthsPassed % WORLD.ECONOMY.fluctuationIntervalMonths === 0) {
			this._fluctuateWorldEconomy();
		}

		const currentZone = DB_LOCATIONS_ZONES.find((z) => z.worldId === this.gameState.location.currentWorldId) || {};

		const environmentData = {
			worldId: this.gameState.location.currentWorldId,
			activeSeason: this.gameState.time.activeSeason,
			currentZoneEconomyLevel: currentZone.zoneEconomyLevel || 1,
			playerRank: this.gameState.player.identity?.rank || 1,
		};

		const eventResult = executeRandomEvent(this.gameState.player, 'endturn', environmentData);

		if (eventResult.status === 'PERMADEATH') {
			this.gameState.player = eventResult.updatedPlayer;
			return eventResult;
		}

		if (eventResult.updatedPlayer) {
			this.gameState.player = eventResult.updatedPlayer;
		}

		// Renown and Social reporting
		const passiveRenown = WORLD.SOCIAL?.renownBonus?.endMonthRenown || 2;
		this.gameState.player.progression.renown = Math.min(500, (this.gameState.player.progression.renown || 0) + passiveRenown);

		if (!timeResult.monthlyReport.socialEvents) {
			timeResult.monthlyReport.socialEvents = [];
		}
		timeResult.monthlyReport.socialEvents.push(`Survival Bonus: +${passiveRenown} Renown.`);

		this._evaluateRankChanges(this.gameState.player, timeResult);

		console.log('[DEBUG MONTHLY REPORT] Datele trimise către UI:', timeResult.monthlyReport);
		return { status: 'SUCCESS', monthlyReport: timeResult.monthlyReport, timeLog: timeResult, eventLog: eventResult };
	}

	// ========================================================================
	// SPATIAL ROUTING (Map & POIs)
	// ========================================================================

	// HELPER: Generates the list of available Civilized POIs for the current visit based on zone subclass
	generateCivilizedPois(zoneSubclass) {
		const availablePois = [];
		const civilizedKeys = Object.keys(DB_LOCATIONS_POIS_Civilized);

		for (const poiId of civilizedKeys) {
			const poiData = DB_LOCATIONS_POIS_Civilized[poiId];
			const spawnChances = poiData.classification?.spawnChances || {};

			// Extract the specific probability for the current zone subclass. Default is 0.
			const targetChance = spawnChances[zoneSubclass] || 0;

			if (targetChance <= 0) continue;

			if (targetChance >= 100) {
				availablePois.push(poiId);
				continue;
			}

			const roll = Math.floor(Math.random() * 100) + 1;
			if (roll <= targetChance) {
				availablePois.push(poiId);
			}
		}

		return availablePois;
	}

	processAction_EnsureCivilizedPois() {
		// If they already exist, do nothing
		if (this.gameState.location.availableCivilizedPois && this.gameState.location.availableCivilizedPois.length > 0) {
			return { status: 'ALREADY_EXISTS' };
		}

		const destZone = DB_LOCATIONS_ZONES.find((z) => z.worldId === this.gameState.location.currentWorldId) || {};
		const currentZoneSubclass = destZone.zoneSubclass || 'Village';

		// Run the generator and lock it into state
		this.gameState.location.availableCivilizedPois = this.generateCivilizedPois(currentZoneSubclass);

		return { status: 'SUCCESS', generatedPois: this.gameState.location.availableCivilizedPois };
	}

	processAction_Travel(targetNodeId) {
		// --- NOU: Extragem sezonul și trimitem modificatorul către funcția de validare ---
		const activeSeason = this.gameState.time.activeSeason || 'spring';
		const seasonApModifier = WORLD.TIME.seasons[activeSeason]?.extraApForTravel || 0;

		// Pasăm seasonApModifier în loc de 0
		const travelResult = executeTravel(this.gameState.player, this.gameState.location.currentWorldId, targetNodeId, seasonApModifier);

		if (travelResult.status !== 'SUCCESS') return travelResult;

		this.gameState.player = travelResult.updatedPlayer;
		this.gameState.location.currentWorldId = targetNodeId;

		const newZoneClass = targetNodeId.split('_')[0];
		if (!this.gameState.location.regionalRates) this.gameState.location.regionalRates = {};
		if (this.gameState.location.regionalRates[newZoneClass]) {
			this.gameState.location.regionalExchangeRate = this.gameState.location.regionalRates[newZoneClass];
		}

		this.gameState.currentView = 'VIEWPORT';
		this.gameState.activeTargetId = null;
		this.gameState.activeTradeTag = null;

		const destZone = DB_LOCATIONS_ZONES.find((z) => z.worldId === targetNodeId) || {};
		const economyLevel = destZone.zoneEconomyLevel || 1;

		// Extract zoneSubclass for the generation matrix. Fallback to 'Village' if undefined.
		const currentZoneSubclass = destZone.zoneSubclass || 'Village';

		const environmentData = {
			worldId: targetNodeId,
			activeSeason: this.gameState.time.activeSeason,
			currentZoneEconomyLevel: economyLevel,
			playerRank: this.gameState.player.identity?.rank || 1, // --- NOU ---
		};

		// EXECUTED ONCE PER TRAVEL: Generate available POIs
		this.gameState.location.availableCivilizedPois = this.generateCivilizedPois(currentZoneSubclass);

		const eventResult = executeRandomEvent(this.gameState.player, 'travel', environmentData);

		if (eventResult.status === 'PERMADEATH') {
			this.gameState.player = eventResult.updatedPlayer;
			return eventResult;
		}

		if (eventResult.updatedPlayer) {
			this.gameState.player = eventResult.updatedPlayer;
		}

		return { status: 'SUCCESS', travelLog: travelResult, eventLog: eventResult };
	}

	processAction_EnterPoi(poiId, poiCategory = 'CIVILIZED', overrideApCost = null) {
		let apCost = 0;

		if (overrideApCost !== null) {
			apCost = overrideApCost;
		} else if (poiCategory === 'CIVILIZED') {
			apCost = WORLD.SPATIAL?.actionCosts?.enterCivilizedPoiAp !== undefined ? WORLD.SPATIAL.actionCosts.enterCivilizedPoiAp : 1;
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
		// --- NOU: Extragem rank-ul jucătorului pentru Dynamic Scaling ---
		const playerRank = this.gameState.player.identity?.rank || 1;

		// UNIFIED CALL: Handles both Normal POIs and the Sandbox POI automatically
		this.gameState.activeEntities = populatePOI(
			poiId,
			poiCategory,
			currentWorldId,
			playerRank, // Pasează rank-ul mai departe
		);

		this.gameState.currentView = 'VIEWPORT';
		this.gameState.activeTargetId = null;

		return { status: 'SUCCESS', activeEntities: this.gameState.activeEntities, apConsumed: apCost };
	}

	processAction_ExploreUntamed() {
		const exploreCost = WORLD.SPATIAL?.actionCosts?.exploreUntamedAp !== undefined ? WORLD.SPATIAL.actionCosts.exploreUntamedAp : 1;

		if (this.gameState.player.progression.actionPoints < exploreCost) {
			return { status: 'FAILED_INSUFFICIENT_AP', requiredAp: exploreCost };
		}

		this.gameState.player.progression.actionPoints -= exploreCost;

		// --- ZARUL DESTINULUI (Destiny Roll) ---
		const chances = WORLD.SPATIAL?.exploreChances || { event: 25, poi: 60, nothing: 15 };
		const destinyRoll = Math.floor(Math.random() * 100) + 1;
		const eventThreshold = chances.event;
		const poiThreshold = chances.event + chances.poi;

		if (destinyRoll <= eventThreshold) {
			// 1. TRIGGER: Narrative Event
			const currentZone = DB_LOCATIONS_ZONES.find((z) => z.worldId === this.gameState.location.currentWorldId) || {};
			const environmentData = {
				worldId: this.gameState.location.currentWorldId,
				activeSeason: this.gameState.time.activeSeason,
				currentZoneEconomyLevel: currentZone.zoneEconomyLevel || 1,
				playerRank: this.gameState.player.identity?.rank || 1, // --- NOU ---
			};

			const eventResult = executeRandomEvent(this.gameState.player, 'explore', environmentData);

			if (eventResult.status === 'PERMADEATH') {
				this.gameState.player = eventResult.updatedPlayer;
				return eventResult;
			}

			if (eventResult.updatedPlayer) {
				this.gameState.player = eventResult.updatedPlayer;
			}

			// CRITICAL FIX: Spunem managerului că am intrat în EVENT
			if (eventResult.status === 'AWAITING_INPUT' || eventResult.status === 'RESOLVED_SEE') {
				this.gameState.currentView = 'EVENT';
			}

			return { status: 'SUCCESS', eventLog: eventResult };
		} else if (destinyRoll <= poiThreshold) {
			// 2. TRIGGER: Point of Interest Discovery

			// Retrieve the current zone class to filter POIs
			const currentZoneClass = DB_LOCATIONS_ZONES.find((z) => z.worldId === this.gameState.location.currentWorldId)?.zoneClass || 'Wild'; // Fallback to Wild if undefined

			const untamedKeys = Object.keys(DB_LOCATIONS_POIS_Untamed);
			if (untamedKeys.length === 0) return { status: 'FAILED_NO_POIS' };

			let totalWeight = 0;
			const pool = [];

			// Filter the POIs to only include Generic ('Any') and Region-Specific POIs
			for (const key of untamedKeys) {
				const poi = DB_LOCATIONS_POIS_Untamed[key];
				const rawPoiClass = poi.classification?.poiClass;

				if (!rawPoiClass) continue;

				const poiClassUpper = rawPoiClass.toUpperCase();
				const currentZoneClassUpper = currentZoneClass.toUpperCase();

				// Case-insensitive check for 'ANY' or the specific zone class
				if ((poiClassUpper === 'ANY' || poiClassUpper === currentZoneClassUpper) && poiClassUpper !== 'TEST') {
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

			// Fetch the full POI object to access custom properties
			const selectedPoi = DB_LOCATIONS_POIS_Untamed[selectedPoiId];
			const poiName = selectedPoiId.replace(/_/g, ' ');

			// Route the description: Use POI specific description, otherwise use default
			const customDescription = selectedPoi.description
				? `${selectedPoi.description} Do you wish to approach it?`
				: `Through the dense wilderness, you stumbled upon a location. Do you wish to approach it?`;

			const eventLog = {
				name: 'Location Discovered',
				subtitle: poiName,
				description: customDescription,
				changes: [{ label: 'Action Points', value: -exploreCost }],
				type: 'EXPLORE_SUCCESS',
				discoveredPoi: selectedPoiId,
			};
			return { status: 'SUCCESS', eventLog };
		} else {
			// 3. TRIGGER: Nothing Found
			const eventLog = {
				name: 'Wilderness Exploration',
				description: 'You have not found anything of interest. Just empty wilderness.',
				changes: [{ label: 'Action Points', value: -exploreCost }],
				type: 'EXPLORE_NOTHING',
			};
			return { status: 'SUCCESS', eventLog };
		}
	}

	processAction_Hunt() {
		const huntCost = WORLD.SPATIAL?.actionCosts?.huntUntamedAp !== undefined ? WORLD.SPATIAL.actionCosts.huntUntamedAp : 1;

		if (this.gameState.player.progression.actionPoints < huntCost) {
			return { status: 'FAILED_INSUFFICIENT_AP', requiredAp: huntCost };
		}

		this.gameState.player.progression.actionPoints -= huntCost;

		// --- HUNT DESTINY ROLL ---
		const chances = WORLD.SPATIAL?.huntChances || { positiveHunt: 50, negativeHunt: 10, generalEvent: 25, nothing: 15 };
		const destinyRoll = Math.floor(Math.random() * 100) + 1;

		const positiveThreshold = chances.positiveHunt;
		const negativeThreshold = chances.positiveHunt + chances.negativeHunt;
		const generalThreshold = chances.positiveHunt + chances.negativeHunt + chances.generalEvent;

		const currentZone = DB_LOCATIONS_ZONES.find((z) => z.worldId === this.gameState.location.currentWorldId) || {};
		const environmentData = {
			worldId: this.gameState.location.currentWorldId,
			activeSeason: this.gameState.time.activeSeason,
			currentZoneEconomyLevel: currentZone.zoneEconomyLevel || 1,
			playerRank: this.gameState.player.identity?.rank || 1, // --- NOU ---
		};

		if (destinyRoll <= positiveThreshold) {
			// 1. TRIGGER: Hunt Success
			const eventResult = executeRandomEvent(this.gameState.player, 'hunt_success', environmentData);
			if (eventResult.status === 'AWAITING_INPUT' || eventResult.status === 'RESOLVED_SEE') {
				this.gameState.currentView = 'EVENT';
			}
			return { status: 'SUCCESS', eventLog: eventResult };
		} else if (destinyRoll <= negativeThreshold) {
			// 2. TRIGGER: Hunt Ambush
			const eventResult = executeRandomEvent(this.gameState.player, 'hunt_ambush', environmentData);
			if (eventResult.status === 'AWAITING_INPUT' || eventResult.status === 'RESOLVED_SEE') {
				this.gameState.currentView = 'EVENT';
			}
			return { status: 'SUCCESS', eventLog: eventResult };
		} else if (destinyRoll <= generalThreshold) {
			// 3. TRIGGER: General Explore Event
			const eventResult = executeRandomEvent(this.gameState.player, 'explore', environmentData);
			if (eventResult.status === 'AWAITING_INPUT' || eventResult.status === 'RESOLVED_SEE') {
				this.gameState.currentView = 'EVENT';
			}
			return { status: 'SUCCESS', eventLog: eventResult };
		} else {
			// 4. TRIGGER: Nothing Found
			const eventLog = {
				name: 'Cold Trail',
				description: 'You spent hours tracking broken twigs and faded prints, but found nothing but empty wilderness.',
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
		const regionalExchangeRate = exchangeRate || this.gameState.location.regionalExchangeRate;
		const npcTarget = this.gameState.activeEntities.find((entity) => entity.entityId === targetId || entity.id === targetId);

		// 1. Get the current POI ID from the location state
		const currentPoiId = this.gameState.location?.currentPoiId;
		let currentPoiCategory = 'UNTAMED'; // Default fallback

		// 2. Look up the POI definition in both database objects
		if (currentPoiId) {
			const poiDef = DB_LOCATIONS_POIS_Civilized[currentPoiId] || DB_LOCATIONS_POIS_Untamed[currentPoiId];

			if (poiDef && poiDef.classification && poiDef.classification.poiCategory) {
				currentPoiCategory = poiDef.classification.poiCategory;
			}
		}

		// 3. Pass the resolved category to the interaction engine
		const result = executeInteraction(this.gameState.player, actionTag, npcTarget, regionalExchangeRate, amount, currentPoiCategory);

		if (result.status === 'SUCCESS') {
			this.gameState.player = result.updatedPlayer;
			if (actionTag === 'Target_Assassination') {
				this.gameState.activeEntities = this.gameState.activeEntities.filter((entity) => entity.entityId !== targetId && entity.id !== targetId);
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
		const turnResult = processCombatTurn(this.gameState.player, npcEntity, combatType, playerAction);
		this.gameState.player = turnResult.playerEntity;

		if (turnResult.combatStatus !== 'CONTINUE') {
			const targetId = this.gameState.activeTargetId;
			if (targetId) {
				this.gameState.activeEntities = this.gameState.activeEntities.filter((entity) => entity.entityId !== targetId && entity.id !== targetId);
			}

			this.gameState.activeTargetId = null;
			this.gameState.currentView = 'VIEWPORT';
		}

		return { combatStatus: turnResult.combatStatus, log: turnResult.log };
	}

	// ========================================================================
	// COMMERCE & ECONOMY
	// ========================================================================
	processAction_Commerce(transactionType, payload) {
		let result;

		if (transactionType === 'BUY') {
			result = executeBuyTransaction(this.gameState.player, payload.itemDef, payload.quantity, payload.regionalExchangeRate, payload.targetCategory);
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
			result = executeRepairTransaction(this.gameState.player, payload.regionalExchangeRate, payload.targetCategory, payload.physicalItemIndex);
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
		const result = equipItem(this.gameState.player, inventoryIndex, itemCategory);
		if (result.status === 'SUCCESS') this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_Unequip(itemCategory) {
		const result = unequipItem(this.gameState.player, itemCategory);
		if (result.status === 'SUCCESS') this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_DropItem(inventoryIndex, targetArrayName) {
		const result = dropItem(this.gameState.player, inventoryIndex, targetArrayName);
		if (result.status === 'SUCCESS') this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_SlaughterAnimal(inventoryIndex) {
		const result = slaughterAnimal(this.gameState.player, inventoryIndex);
		if (result.status === 'SUCCESS') this.gameState.player = result.updatedPlayer;
		return result;
	}

	processAction_RecalculateEncumbrance() {
		if (!this.gameState || !this.gameState.player) return { status: 'FAILED_NO_PLAYER' };

		const updatedPlayer = recalculateEncumbrance(this.gameState.player);
		this.gameState.player = updatedPlayer;

		return { status: 'SUCCESS', updatedPlayer: this.gameState.player };
	}
}

export const MasterGameManager = new GameManager();
