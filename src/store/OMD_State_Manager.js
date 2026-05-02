// File: src/store/OMD_State_Manager.js
import { create } from 'zustand';

// --- Engine Modules ---
import { MasterGameManager } from '../engine/GameManager.js';
import { processCombatTurn } from '../engine/ENGINE_Combat_Loop.js';
import {
	recalculateEncumbrance,
	calculateDerivedStats,
} from '../engine/ENGINE_Inventory.js';
import {
	executeBuyTransaction,
	executeSellTransaction,
	executeRepairTransaction,
} from '../engine/ENGINE_Economy_Shops.js';
import { DebugFactory } from '../engine/ENGINE_DebugHelpers.js';
import { resolveEventChoice, applyPayload } from '../engine/ENGINE_Events.js';
import { getNpcMoralityPenalty } from '../utils/UnifiedMoralityCalculator.js';

// --- Data Configuration ---
import { WORLD } from '../data/GameWorld.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
import { DB_COMBAT } from '../data/DB_Combat.js';
import { getNephilimTrophy } from '../data/DB_Items.js';
import { generateDynamicLoot } from '../engine/ENGINE_Loot_Drop.js';
export const TRAVEL_DURATION_MS = 3000;

// ============================================================================
// INTERNAL STORE HELPERS
// ============================================================================

const generateCombatMessages = (logPayload, combatStatus) => {
	const messages = [];

	if (!logPayload) {
		if (combatStatus === 'LOSE_FLEE')
			messages.push('* You successfully fled the encounter. *');
		else if (combatStatus === 'WIN_FLEE')
			messages.push('* The opponent successfully fled. *');
		else if (combatStatus === 'DRAW_FLEE')
			messages.push('* Both combatants retreated. *');
		messages.push('-------------------');
		return messages;
	}

	if (logPayload.fleeLog) messages.push(logPayload.fleeLog);

	if (logPayload.isFleeSuccess) {
		if (logPayload.fleeInitiator === 'NPC') {
			messages.push('* The opponent successfully fled the encounter. *');
		} else {
			messages.push('* You successfully fled the encounter. *');
		}
		messages.push('-------------------');
		return messages;
	}

	const { playerStrikePayload: pS, npcStrikePayload: nS } = logPayload;

	const getHitDesc = (payload) => {
		if (payload.hitType === 'critical') return '(CRITICAL HIT!)';
		if (payload.hitType === 'evaded') return '(Evaded)';
		if (payload.hitType === 'blocked') return '(Blocked by Shield)';
		if (payload.hitType === 'parried') return '(Parried by Weapon)';
		return '';
	};

	const getDegDesc = (deg) => {
		const texts = [];
		if (deg.attackerWeapon > 0) texts.push('Weapon');
		if (deg.defenderArmor > 0) texts.push('Armor');
		if (deg.defenderShield > 0) texts.push('Shield');
		if (deg.defenderHelmet > 0) texts.push('Helmet');
		return texts.length > 0 ? `Equip damaged: ${texts.join(', ')}.` : null;
	};

	if (logPayload.playerAction === 'FAILED_FLEE') {
		messages.push('* You attempted to flee but failed! *');
	} else if (
		logPayload.playerAction !== 'FAILED_FLEE' &&
		logPayload.npcAction === 'FLEE'
	) {
		messages.push('* Opponent attempted to flee but failed! *');
	} else if (logPayload.playerAction === 'HEAL') {
		messages.push(
			`* You utilized a Healing Potion (+${WORLD.COMBAT.actionModifiers.healHpAmount} HP).`,
		);
	} else if (logPayload.playerAction === 'SURRENDER') {
		messages.push('* You threw down your arms and surrendered. *');
	}

	if (pS && pS.hitType !== 'none') {
		if (pS.damageDealt > 0)
			messages.push(
				`You strike opponent for ${pS.damageDealt} damage ${getHitDesc(pS)}.`,
			);
		else if (pS.hitType === 'evaded' || pS.hitType === 'parried')
			messages.push(`Your attack was ${pS.hitType} ${getHitDesc(pS)}.`);
		else if (pS.hitType === 'blocked')
			messages.push(`Your attack was absorbed ${getHitDesc(pS)}.`);

		const playerDegDesc = getDegDesc(pS.degradation);
		if (playerDegDesc) messages.push(playerDegDesc);
	}

	if (nS && nS.hitType !== 'none') {
		if (nS.damageDealt > 0)
			messages.push(
				`Opponent strikes you for ${nS.damageDealt} damage ${getHitDesc(nS)}.`,
			);
		else if (nS.hitType === 'evaded' || nS.hitType === 'parried')
			messages.push(`Opponent attack was ${nS.hitType} ${getHitDesc(nS)}.`);
		else if (nS.hitType === 'blocked')
			messages.push(`Opponent attack was absorbed ${getHitDesc(nS)}.`);

		const npcDegDesc = getDegDesc(nS.degradation);
		if (npcDegDesc) messages.push(npcDegDesc);
	}

	messages.push('-------------------');
	return messages;
};

// ========================================================================
// PLAYER STATS CALCULATOR (Internal Store Helper)
// ========================================================================
const updatePlayerCombatStats = (player) => {
	if (!player || !player.stats || !player.equipment) return;

	const derived = calculateDerivedStats(player);
	const equip = player.equipment;
	const getRank = (item) =>
		item?.classification?.itemTier ||
		item?.classification?.entityRank ||
		'None';

	player.stats.str = player.stats.innateStr || player.stats.str || 10;
	player.stats.agi = player.stats.innateAgi || player.stats.agi || 10;
	player.stats.int = player.stats.innateInt || player.stats.int || 10;
	player.stats.ad = derived.totalAdp || 0;
	player.stats.dr = derived.totalDdr || 0;

	let equipAd = 0,
		equipDr = 0;
	// Default to 'None' for empty slots
	const equippedRanks = {
		weapon: 'None',
		armor: 'None',
		shield: 'None',
		helmet: 'None',
	};

	if (equip.hasWeapon && equip.weaponItem) {
		equipAd += equip.weaponItem.stats?.adp || 0;
		equipDr += equip.weaponItem.stats?.ddr || 0;
		equippedRanks.weapon = getRank(equip.weaponItem);
	}
	if (equip.hasArmor && equip.armorItem) {
		equipAd += equip.armorItem.stats?.adp || 0;
		equipDr += equip.armorItem.stats?.ddr || 0;
		equippedRanks.armor = getRank(equip.armorItem);
	}
	if (equip.hasShield && equip.shieldItem) {
		equipAd += equip.shieldItem.stats?.adp || 0;
		equipDr += equip.shieldItem.stats?.ddr || 0;
		equippedRanks.shield = getRank(equip.shieldItem);
	}
	if (equip.hasHelmet && equip.helmetItem) {
		equipAd += equip.helmetItem.stats?.adp || 0;
		equipDr += equip.helmetItem.stats?.ddr || 0;
		equippedRanks.helmet = getRank(equip.helmetItem);
	}

	const attrAd = Math.floor(player.stats.str / 2);
	const attrDr = 5 + Math.floor(player.stats.agi / 5);

	player.combatBreakdown = {
		equipAd,
		attrAd,
		totalAd: player.stats.ad,
		equipDr,
		attrDr,
		totalDr: player.stats.dr,
		equippedRanks,
	};
};

// ========================================================================
// NPC STATS CALCULATOR (Internal Store Helper)
// ========================================================================
const updateNpcCombatStats = (npc) => {
	if (!npc || !npc.stats || !npc.equipment) return;

	const category = npc.classification?.entityCategory || 'Human';
	const isCreature = category === 'Animal' || category === 'Monster';

	let equipAd = 0,
		equipDr = 0;
	let equippedRanks = {};

	if (isCreature) {
		// Creatures bypass inventory loops and use innate power directly
		equipAd = npc.stats.innateAdp || 0;
		equipDr = npc.stats.innateDdr || 0;
		equippedRanks = {
			weapon: 'Natural',
			armor: 'Natural',
			shield: 'Natural',
			helmet: 'Natural',
		};
	} else {
		// Humanoids loop through inventory to find equipped stats
		equippedRanks = {
			weapon: 'None',
			armor: 'None',
			shield: 'None',
			helmet: 'None',
		};
		const getRank = (item) =>
			item?.classification?.itemTier ||
			item?.classification?.entityRank ||
			'None';

		if (npc.inventory && npc.inventory.itemSlots) {
			npc.inventory.itemSlots.forEach((item) => {
				if (
					item.entityId === npc.equipment.weaponId &&
					npc.equipment.hasWeapon
				) {
					equipAd += item.stats?.adp || 0;
					equipDr += item.stats?.ddr || 0;
					equippedRanks.weapon = getRank(item);
				}
				if (
					item.entityId === npc.equipment.armorId &&
					npc.equipment.hasArmor
				) {
					equipAd += item.stats?.adp || 0;
					equipDr += item.stats?.ddr || 0;
					equippedRanks.armor = getRank(item);
				}
				if (
					item.entityId === npc.equipment.shieldId &&
					npc.equipment.hasShield
				) {
					equipAd += item.stats?.adp || 0;
					equipDr += item.stats?.ddr || 0;
					equippedRanks.shield = getRank(item);
				}
				if (
					item.entityId === npc.equipment.helmetId &&
					npc.equipment.hasHelmet
				) {
					equipAd += item.stats?.adp || 0;
					equipDr += item.stats?.ddr || 0;
					equippedRanks.helmet = getRank(item);
				}
			});
		}
	}

	const str = npc.stats.innateStr || npc.stats.str || 10;
	const agi = npc.stats.innateAgi || npc.stats.agi || 10;

	npc.stats.str = str;
	npc.stats.agi = agi;
	npc.stats.int = npc.stats.innateInt || npc.stats.int || 10;

	const maxAdp = WORLD.COMBAT.coreStats.maxAttackDamagePower;
	const maxDdr = WORLD.COMBAT.coreStats.maxDefenseDamageReduction;

	const attrAd = Math.floor(str / 2);
	const attrDr = 5 + Math.floor(agi / 5);

	const totalAdp = Math.min(attrAd + equipAd, maxAdp);
	const totalDdr = Math.min(attrDr + equipDr, maxDdr);

	npc.stats.ad = totalAdp;
	npc.stats.dr = totalDdr;

	npc.combatBreakdown = {
		equipAd,
		attrAd,
		totalAd: totalAdp,
		equipDr,
		attrDr,
		totalDr: totalDdr,
		equippedRanks,
	};
};

// ============================================================================
// ATTRITION & LOOT HELPERS (COMBAT RESOLUTION)
// ============================================================================

const processNpcEquipmentSalvage = (
	enemyNpc,
	player,
	ruleData,
	dropConfig,
	limits,
	rewardsArray,
) => {
	if (!ruleData.npcEquipmentDrop || !ruleData.npcEquipmentDropChance) return;

	const salvageKeys = dropConfig?.equippedDropKeysNpc || [
		'weapon',
		'shield',
		'armor',
		'helmet',
		'mount',
	];

	salvageKeys.forEach((slotKey) => {
		const itemId = enemyNpc.equipment[slotKey + 'Id'];
		if (!itemId) return;

		let itemToSalvage = null;
		if (slotKey === 'mount') {
			itemToSalvage = enemyNpc.inventory?.animalSlots?.find(
				(i) => i.entityId === itemId,
			);
		} else {
			itemToSalvage = enemyNpc.inventory?.itemSlots?.find(
				(i) => i.entityId === itemId,
			);
		}

		if (itemToSalvage && Math.random() <= ruleData.npcEquipmentDropChance) {
			let added = false;
			const clonedItem = {
				...itemToSalvage,
				entityId: `salvage_${Date.now()}_${Math.random()}`,
			};

			if (
				slotKey === 'mount' &&
				player.inventory.animalSlots.length < (limits.animalSlots || 10)
			) {
				player.inventory.animalSlots.push(clonedItem);
				added = true;
			} else if (
				slotKey !== 'mount' &&
				player.inventory.itemSlots.length < (limits.itemSlots || 50)
			) {
				player.inventory.itemSlots.push(clonedItem);
				added = true;
			}

			if (added) {
				rewardsArray.push({
					label: 'Salvaged',
					value: clonedItem.itemName || clonedItem.name || 'Gear',
				});
			}
		}
	});
};

const processPlayerAttrition = (player, ruleData, dropConfig, lossesArray) => {
	if (!ruleData.playerEquipmentDrop) return false;

	const dropChance =
		ruleData.playerEquipmentDropChance !== undefined
			? ruleData.playerEquipmentDropChance
			: 1.0;
	if (dropChance <= 0) return false;

	let lostWeight = false;
	const dropKeys = dropConfig?.equippedDropKeysPlayer || [
		'weapon',
		'shield',
		'helmet',
	];

	dropKeys.forEach((slotKey) => {
		const flagName =
			'has' + slotKey.charAt(0).toUpperCase() + slotKey.slice(1);
		const itemProp = slotKey + 'Item';

		if (player.equipment[flagName] && player.equipment[itemProp]) {
			if (Math.random() <= dropChance) {
				const itemName =
					player.equipment[itemProp].itemName ||
					player.equipment[itemProp].name ||
					'Equipment';

				player.equipment[flagName] = false;
				player.equipment[itemProp] = null;
				player.equipment[slotKey + 'Id'] = null;

				lossesArray.push({ label: 'Dropped', value: itemName });
				lostWeight = true;
			}
		}
	});
	return lostWeight;
};

const processNumericDrop = (player, dropConfig, lossesArray) => {
	const validKeys = (
		dropConfig?.othersEligibleKeys || [
			'food',
			'healingPotions',
			'tradeSilver',
			'tradeGold',
			'silverCoins',
		]
	).filter((key) => (player.inventory[key] || 0) > 0);

	if (validKeys.length > 0) {
		const randomKey = validKeys[Math.floor(Math.random() * validKeys.length)];
		const currentVal = player.inventory[randomKey];
		const lossAmount = Math.max(
			1,
			Math.floor(currentVal * (dropConfig?.othersDropPercent || 0.25)),
		);

		player.inventory[randomKey] -= lossAmount;
		const formattedKey = randomKey
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (str) => str.toUpperCase());
		lossesArray.push({
			label: 'Lost',
			value: `${lossAmount} ${formattedKey}`,
		});
		return true;
	}
	return false;
};

const processPlayerPanicDrop = (player, ruleData, dropConfig, lossesArray) => {
	if (
		!ruleData.tableLootPenaltyPct ||
		Math.random() > ruleData.tableLootPenaltyPct
	)
		return false;

	let inventoryChanged = false;
	const isPhysical = Math.random() <= (dropConfig?.itemLootDropChance || 0.5);

	const tryPhysicalDrop = () => {
		const combinedSlots = [
			...player.inventory.itemSlots.map((item, index) => ({
				type: 'itemSlots',
				index,
				item,
			})),
			...player.inventory.lootSlots.map((item, index) => ({
				type: 'lootSlots',
				index,
				item,
			})),
		];
		if (combinedSlots.length > 0) {
			const randomIndex = Math.floor(Math.random() * combinedSlots.length);
			const target = combinedSlots[randomIndex];
			player.inventory[target.type].splice(target.index, 1);
			lossesArray.push({
				label: 'Dropped',
				value: target.item.itemName || target.item.entityName || 'Item',
			});
			return true;
		}
		return false;
	};

	if (isPhysical) {
		inventoryChanged = tryPhysicalDrop();
		if (!inventoryChanged)
			inventoryChanged = processNumericDrop(player, dropConfig, lossesArray);
	} else {
		inventoryChanged = processNumericDrop(player, dropConfig, lossesArray);
		if (!inventoryChanged) inventoryChanged = tryPhysicalDrop();
	}
	return inventoryChanged;
};

// ============================================================================
// GLOBAL STATE MANAGER
// ============================================================================
const useGameState = create((set, get) => ({
	// --- Core State ---
	knightId: null,
	knightName: '',
	gameState: MasterGameManager.gameState,
	isTraveling: false,

	// --- Combat State ---
	activeCombatEnemy: null,
	activeCombatType: 'NF',
	lastKiller: null,
	combatRoundCounter: 1,
	combatLogMessages: [],
	combatRoundStatus: 'CONTINUE',
	playerActionsPermitted: {},
	lastRoundVisualEvents: null,
	playerCombatStance: 'BALANCED',

	// --- Event State ---
	activeEventData: null,
	activeEventNpc: null,
	activeEventResolution: null,
	pendingEventSuccessPayload: null,
	pendingEventFailurePayload: null,
	monthlyReportData: null,

	// ========================================================================
	// CORE SYSTEM ACTIONS
	// ========================================================================
	syncEngine: () => set({ gameState: { ...MasterGameManager.gameState } }),

	loadGame: (saveData) => {
		MasterGameManager.gameState.time = saveData.time;
		MasterGameManager.gameState.location = saveData.location;
		MasterGameManager.gameState.player = saveData.player;
		MasterGameManager.gameState.activeEntities = [];
		set({
			knightId: saveData._id,
			knightName: saveData.knightName,
			gameState: { ...MasterGameManager.gameState },
		});
	},

	initializeNewGame: (creationParams, startingNodeId) => {
		// Deep wipe any bleeding entities or targets from a previous session
		MasterGameManager.gameState.activeEntities = [];
		MasterGameManager.gameState.activeTargetId = null;
		if (MasterGameManager.gameState.location) {
			MasterGameManager.gameState.location.currentPoiId = null;
		}

		MasterGameManager.startNewGame(creationParams, startingNodeId);
		set({
			knightId: null,
			knightName: creationParams.name,
			gameState: { ...MasterGameManager.gameState },
		});
	},

	clearSession: () => {
		// Thorough wipe to prevent ghost entities persisting across game states
		MasterGameManager.gameState.activeEntities = [];
		MasterGameManager.gameState.activeTargetId = null;
		if (MasterGameManager.gameState.location) {
			MasterGameManager.gameState.location.currentPoiId = null;
		}

		set({
			knightId: null,
			knightName: '',
			lastKiller: null,
			activeCombatEnemy: null,
			activeEventData: null,
			activeEventNpc: null,
		});
	},

	// ========================================================================
	// COMBAT ENGINES
	// ========================================================================
	setCombatStance: (stance) => set({ playerCombatStance: stance }),

	calculateCombatPermittedActions: () => {
		const player = get().gameState.player;
		const type = get().activeCombatType;
		const hpLimit = WORLD.COMBAT.thresholds;

		set({
			playerActionsPermitted: {
				canFight: true,
				canHeal:
					player.inventory.healingPotions > 0 &&
					(type === 'DMF' || type === 'NF'),
				canSurrender: type !== 'DMF',
				canFlee: true,
			},
		});
	},

	startCombatEncounter: (npcObject, type = 'NF') => {
		const player = get().gameState.player;
		updatePlayerCombatStats(player);
		updateNpcCombatStats(npcObject);

		set({
			activeCombatEnemy: npcObject,
			activeCombatType: type,
			combatRoundCounter: 1,
			combatLogMessages: [
				'Round 1: Engagement Initiated...',
				'VT323 Monospaced Font Enabled.',
				'-------------------',
			],
			combatRoundStatus: 'CONTINUE',
			lastRoundVisualEvents: null,
			playerCombatStance: 'BALANCED',
			combatResult: null, // Forces the UI to clear previous data
		});
		get().calculateCombatPermittedActions();
		MasterGameManager.gameState.currentView = 'COMBAT';
		get().syncEngine();
	},

	executeCombatRound: (playerActionTag) => {
		const player = get().gameState.player;
		const enemy = get().activeCombatEnemy;
		const type = get().activeCombatType;
		const nextRound = get().combatRoundCounter + 1;
		const stance = get().playerCombatStance;

		updatePlayerCombatStats(player);
		updateNpcCombatStats(enemy);

		const turnResults = processCombatTurn(
			player,
			enemy,
			type,
			playerActionTag,
			stance,
		);
		const newMessages = generateCombatMessages(
			turnResults.log,
			turnResults.combatStatus,
		);

		if (turnResults.combatStatus === 'CONTINUE') {
			newMessages.push(`Round ${nextRound} begins...`);
		}

		const visualEvents = {
			playerAction: playerActionTag,
			npcAction: turnResults.log?.npcAction || 'FIGHT',
			playerHitType: turnResults.log?.npcStrikePayload?.hitType || 'none',
			enemyHitType: turnResults.log?.playerStrikePayload?.hitType || 'none',
			playerDamageTaken: turnResults.log?.npcStrikePayload?.damageDealt || 0,
			enemyDamageTaken:
				turnResults.log?.playerStrikePayload?.damageDealt || 0,
		};

		set((state) => ({
			combatRoundStatus: turnResults.combatStatus,
			activeCombatEnemy: turnResults.npcEntity,
			combatRoundCounter: nextRound,
			combatLogMessages: [...state.combatLogMessages, ...newMessages],
			lastRoundVisualEvents: visualEvents,
		}));

		get().syncEngine();
		get().calculateCombatPermittedActions();

		// --- NOU: DECLANȘĂM CALCULUL DE LOOT/PIERDERI INSTANT, DACĂ LUPTA S-A TERMINAT ---
		if (turnResults.combatStatus !== 'CONTINUE') {
			get().processCombatRewards();
		}

		return turnResults;
	},

	processCombatRewards: () => {
		const state = get();
		const player = state.gameState.player;
		const enemyNpc = state.activeCombatEnemy;
		const combatStatus = state.combatRoundStatus;
		const combatType = state.activeCombatType;

		if (!enemyNpc || combatStatus === 'CONTINUE') return;

		const enemyCategory = enemyNpc.classification?.entityCategory || 'Human';
		const ruleData =
			DB_COMBAT.resolutionConsequences[enemyCategory]?.[combatType]?.[
				combatStatus
			];

		if (!ruleData) return;

		const dropConfig = WORLD.COMBAT?.combatDropConfig || {};
		const limits = WORLD.PLAYER.inventoryLimits;
		const rankMultiplier = enemyNpc.classification?.entityRank || 1;

		const rewardsArray = [];
		const lossesArray = [];
		let needsEncumbranceRecalc = false;

		// --- 1. PENALITĂȚI JUCĂTOR (Flee/Surrender/Death) ---
		if (
			ruleData.coinPenaltyPct &&
			ruleData.coinPenaltyPct > 0 &&
			combatStatus !== 'LOSE_DEATH'
		) {
			const currentCoins = player.inventory.silverCoins || 0;
			if (currentCoins > 0) {
				const lostCoins = Math.max(
					1,
					Math.floor(currentCoins * ruleData.coinPenaltyPct),
				);
				player.inventory.silverCoins -= lostCoins;
				lossesArray.push({ label: 'Lost Coin', value: lostCoins });
			}
		}

		// Attrition (Echipament) și Panic Drops (Backpack/Resources)
		const lostEquip = processPlayerAttrition(
			player,
			ruleData,
			dropConfig,
			lossesArray,
		);
		const lostBag =
			combatStatus !== 'LOSE_DEATH'
				? processPlayerPanicDrop(player, ruleData, dropConfig, lossesArray)
				: false;
		if (lostEquip || lostBag) needsEncumbranceRecalc = true;

		// --- 2. RECOMPENSE NUMERICE (Coins & Food) ---
		if (ruleData.coinYieldPct && ruleData.coinYieldPct > 0) {
			const potentialCoins = Math.floor(
				(enemyNpc.inventory.silverCoins || 0) * ruleData.coinYieldPct,
			);
			if (potentialCoins > 0) {
				player.inventory.silverCoins =
					(player.inventory.silverCoins || 0) + potentialCoins;
				rewardsArray.push({ label: 'Silver Coins', value: potentialCoins });
			}
		}

		// Logica de mâncare cu fallback și multiplicator de Rank (păstrată din vechiul ENGINE_Loot_Drop)
		const foodYield = ruleData.foodYieldPct || ruleData.coinYieldPct || 0;
		if (foodYield > 0) {
			let totalFood = 0;
			if (enemyCategory === 'Human' || enemyCategory === 'Nephilim') {
				totalFood = Math.floor((enemyNpc.inventory.food || 0) * foodYield);
			} else {
				// Pentru animale/monștri aplicăm multiplicatorul de sezon și de Rank
				const currentSeason =
					state.gameState.time?.activeSeason || 'spring';
				const seasonMult =
					WORLD.TIME?.seasons?.[currentSeason]
						?.huntAnimalFoodCapacityMult || 1.0;
				totalFood = Math.floor(
					(enemyNpc.logistics?.foodYield || 0) *
						rankMultiplier *
						foodYield *
						seasonMult,
				);
			}

			if (totalFood > 0) {
				player.inventory.food = (player.inventory.food || 0) + totalFood;
				rewardsArray.push({ label: 'Food Rations', value: totalFood });
			}
		}

		// --- 3. NPC LOOT PROCEDURAL (Materials/Hides) ---
		const dynamicLoot = generateDynamicLoot(
			enemyCategory,
			ruleData.tableLootRewardPct,
			rankMultiplier,
		);
		dynamicLoot.forEach((item) => {
			if (player.inventory.lootSlots.length < (limits.lootSlots || 20)) {
				player.inventory.lootSlots.push(item);
				rewardsArray.push({
					label: 'Acquired',
					value: item.itemName || item.name || 'Material',
				});
				needsEncumbranceRecalc = true;
			}
		});

		// --- 4. SALVAGE ECHIPAMENT ---
		processNpcEquipmentSalvage(
			enemyNpc,
			player,
			ruleData,
			dropConfig,
			limits,
			rewardsArray,
		);

		// --- 5. TROFEE NEPHILIM ---
		if (enemyCategory === 'Nephilim' && combatStatus === 'WIN_DEATH') {
			// Prevenirea erorii: Inițializarea array-ului dacă acesta lipsește
			if (!player.inventory.trophySlots) {
				player.inventory.trophySlots = [];
			}

			const nephilimSubclass = enemyNpc.classification?.entitySubclass;
			const alreadyHasTrophy = player.inventory.trophySlots.some(
				(t) => t.classification?.itemSubclass === nephilimSubclass,
			);

			if (alreadyHasTrophy) {
				const goldReward = 10;
				player.inventory.tradeGold =
					(player.inventory.tradeGold || 0) + goldReward;
				rewardsArray.push({
					label: 'Reward',
					value: `${goldReward}x Gold Ingot (Bounty)`,
				});
			} else {
				const trophyItem = getNephilimTrophy(nephilimSubclass);
				if (
					trophyItem &&
					player.inventory.trophySlots.length < (limits.trophySlots || 20)
				) {
					player.inventory.trophySlots.push({
						...trophyItem,
						entityId: `trophy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
					});
					rewardsArray.push({
						label: 'Trophy',
						value: trophyItem.itemName,
					});
					needsEncumbranceRecalc = true;
				} else if (trophyItem) {
					rewardsArray.push({
						label: 'Left Behind',
						value: 'Trophy (Inventory Full)',
					});
				}
			}
		}

		// --- 6. MORALITATE & PROGRESIE ---
		let finalHon = ruleData.honModifier || 0;
		let finalRen = ruleData.renModifier || 0;
		if (combatStatus !== 'LOSE_DEATH') {
			const morality = getNpcMoralityPenalty(
				enemyNpc,
				combatStatus === 'WIN_DEATH',
			);
			finalHon += morality.honorChange;
			finalRen += morality.renownChange;
		}

		if (finalHon !== 0) {
			player.progression.honor = Math.min(
				100,
				Math.max(-100, (player.progression.honor || 0) + finalHon),
			);
			rewardsArray.push({ label: 'Honor', value: finalHon });
		}
		if (finalRen !== 0) {
			player.progression.renown = Math.min(
				500,
				Math.max(0, (player.progression.renown || 0) + finalRen),
			);
			rewardsArray.push({ label: 'Renown', value: finalRen });
		}

		// --- 7. FINALIZARE ---
		if (needsEncumbranceRecalc) recalculateEncumbrance(player);

		set({
			combatResult: {
				status: combatStatus,
				rewards: rewardsArray,
				losses: lossesArray,
				isPermadeath: ruleData.permadeath || false,
				killedEntity: combatStatus === 'WIN_DEATH' ? { ...enemyNpc } : null,
			},
		});

		get().syncEngine();
	},

	exitCombatEncounterView: () => {
		const currentState = get();
		let returningToEvent = false;

		if (
			currentState.pendingEventSuccessPayload ||
			currentState.pendingEventFailurePayload
		) {
			returningToEvent = true;
			const player = MasterGameManager.gameState.player;
			const combatStatus = currentState.combatRoundStatus;

			// Differentiate strict victories from escapes
			const didPlayerWin = ['WIN_DEATH', 'WIN_SURRENDER'].includes(
				combatStatus,
			);
			const enemyFled = combatStatus === 'WIN_FLEE';

			let payloadToApply;

			if (enemyFled) {
				// If the enemy flees, nullify the event rewards
				payloadToApply = {
					description:
						'The target managed to escape before you could strike the final blow. It was lucky this time...',
					changes: [],
				};
			} else {
				payloadToApply = didPlayerWin
					? currentState.pendingEventSuccessPayload
					: currentState.pendingEventFailurePayload;
			}

			// --- NOU: FAILSAFE PENTRU EVENT GHOSTING ---
			// Dacă programatorul a uitat să definească onSuccess sau onFailure pentru o alegere de COMBAT,
			// generăm un payload temporar pentru a forța crearea ferestrei de rezoluție și a debloca jocul.
			if (!payloadToApply) {
				payloadToApply = {
					description: didPlayerWin
						? 'You survived the encounter.'
						: 'You fled the scene of the encounter.',
					changes: [],
				};
			}

			// Executăm aplicarea payload-ului (care acum este garantat să existe)
			const { updatedPlayer, uiChangesArray } = applyPayload(
				player,
				payloadToApply,
			);
			MasterGameManager.gameState.player = updatedPlayer;

			set({
				activeEventResolution: {
					resultDescription:
						payloadToApply.description ||
						(didPlayerWin
							? 'You survived the encounter.'
							: 'You were defeated.'),
					changes: uiChangesArray || [],
				},
			});

			set({
				pendingEventSuccessPayload: null,
				pendingEventFailurePayload: null,
			});
		}

		// get().processCombatRewards();

		const targetId = MasterGameManager.gameState.activeTargetId;
		const enemy = get().activeCombatEnemy;
		const entityToRemoveId =
			targetId || (enemy ? enemy.entityId || enemy.id : null);

		if (entityToRemoveId) {
			MasterGameManager.gameState.activeEntities =
				MasterGameManager.gameState.activeEntities.filter(
					(entity) =>
						entity.entityId !== entityToRemoveId &&
						entity.id !== entityToRemoveId,
				);
		}

		if (currentState.combatRoundStatus === 'LOSE_DEATH') {
			MasterGameManager.gameState.currentView = 'DEAD';
			set({ lastKiller: enemy });
		} else if (returningToEvent) {
			MasterGameManager.gameState.currentView = 'EVENT';
		} else {
			MasterGameManager.gameState.currentView = 'VIEWPORT';
		}

		MasterGameManager.gameState.activeTargetId = null;

		set({
			activeCombatEnemy: null,
			activeCombatType: 'NF',
			combatLogMessages: [],
			combatRoundCounter: 1,
			combatRoundStatus: 'CONTINUE',
			playerActionsPermitted: {},
			lastRoundVisualEvents: null,
			playerCombatStance: 'BALANCED',
		});

		get().syncEngine();
	},

	cancelEncounter: () => {
		if (MasterGameManager.gameState.currentView === 'TRADE') {
			const targetId = MasterGameManager.gameState.activeTargetId;
			if (targetId) {
				MasterGameManager.gameState.activeEntities =
					MasterGameManager.gameState.activeEntities.filter(
						(entity) =>
							entity.entityId !== targetId && entity.id !== targetId,
					);
			}
		}

		MasterGameManager.gameState.currentView = 'VIEWPORT';
		MasterGameManager.gameState.activeTargetId = null;
		MasterGameManager.gameState.activeTradeTag = null;
		get().syncEngine();
	},

	dismissActiveEntity: (entityId) => {
		MasterGameManager.gameState.activeEntities =
			MasterGameManager.gameState.activeEntities.filter(
				(entity) => entity.entityId !== entityId && entity.id !== entityId,
			);
		get().syncEngine();
	},

	// ========================================================================
	// WORLD & INTERACTION LOGIC
	// ========================================================================
	ensureCivilizedPois: () => {
		const result = MasterGameManager.processAction_EnsureCivilizedPois();
		if (result && result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	endTurn: () => {
		const result = MasterGameManager.processAction_EndMonth();

		if (result.monthlyReport) {
			set({ monthlyReportData: result.monthlyReport });
		}

		if (
			result.eventLog &&
			(result.eventLog.status === 'AWAITING_INPUT' ||
				result.eventLog.status === 'RESOLVED_SEE')
		) {
			MasterGameManager.gameState.currentView = 'EVENT';
			set({
				activeEventData: result.eventLog.eventData,
				activeEventNpc: result.eventLog.activeEventNpc || null,
				activeEventResolution: null,
			});
		} else {
			MasterGameManager.gameState.currentView = 'EVENT';
			set({
				activeEventData: {
					name: 'Uneventful Month',
					description: 'The month passes without any notable incidents.',
					changes: [],
				},
				activeEventNpc: null,
				activeEventResolution: null,
			});
		}

		get().syncEngine();
		return result;
	},

	closeMonthlyReport: () => {
		set({ monthlyReportData: null });
	},

	executeTravel: (targetNodeId) => {
		set({ isTraveling: true });
		const targetZone = DB_LOCATIONS_ZONES.find(
			(zone) => zone.worldId === targetNodeId || zone.id === targetNodeId,
		);

		if (targetZone && targetZone.backgroundImage) {
			const imgPreloader = new Image();
			imgPreloader.src = targetZone.backgroundImage;
		}

		const result = MasterGameManager.processAction_Travel(targetNodeId);

		if (
			result.eventLog &&
			(result.eventLog.status === 'AWAITING_INPUT' ||
				result.eventLog.status === 'RESOLVED_SEE')
		) {
			MasterGameManager.gameState.currentView = 'EVENT';
			set({
				activeEventData: result.eventLog.eventData,
				activeEventNpc: result.eventLog.activeEventNpc || null,
				activeEventResolution: null,
			});
		}

		get().syncEngine();
		setTimeout(() => set({ isTraveling: false }), TRAVEL_DURATION_MS);
		return result;
	},

	enterPoi: (poiId, poiCategory = 'CIVILIZED', overrideApCost = null) => {
		const result = MasterGameManager.processAction_EnterPoi(
			poiId,
			poiCategory,
			overrideApCost,
		);
		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	exploreUntamed: () => {
		const result = MasterGameManager.processAction_ExploreUntamed();

		if (result.status === 'SUCCESS' && result.eventLog) {
			if (
				result.eventLog.status === 'AWAITING_INPUT' ||
				result.eventLog.status === 'RESOLVED_SEE'
			) {
				MasterGameManager.gameState.currentView = 'EVENT';
				set({
					activeEventData: result.eventLog.eventData,
					activeEventNpc: result.eventLog.activeEventNpc || null,
					activeEventResolution: null,
				});
			}
		}

		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	// --- NEW: Hunt Action ---
	doHunt: () => {
		const result = MasterGameManager.processAction_Hunt();

		// CRITICAL FIX: Interceptăm evenimentele narative de hunt
		if (result.status === 'SUCCESS' && result.eventLog) {
			if (
				result.eventLog.status === 'AWAITING_INPUT' ||
				result.eventLog.status === 'RESOLVED_SEE'
			) {
				MasterGameManager.gameState.currentView = 'EVENT';
				set({
					activeEventData: result.eventLog.eventData,
					activeEventNpc: result.eventLog.activeEventNpc || null,
					activeEventResolution: null,
				});
			}
		}

		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	exitPoi: () => {
		MasterGameManager.processAction_ExitPoi();
		get().syncEngine();
	},

	doInteraction: (actionTag, targetId, exchangeRate, amount = 0) => {
		const result = MasterGameManager.processAction_Interaction(
			actionTag,
			targetId,
			exchangeRate,
			amount,
		);

		if (result.status === 'TRIGGER_COMBAT') {
			const activeEntities = MasterGameManager.gameState.activeEntities;
			const npcTarget = activeEntities.find(
				(npc) => npc.entityId === targetId || npc.id === targetId,
			);

			if (npcTarget) {
				const combatType = result.combatRule || 'NF';
				get().startCombatEncounter(npcTarget, combatType);
			}
		} else if (result.status === 'TRIGGER_TRADE') {
			MasterGameManager.gameState.currentView = 'TRADE';
			MasterGameManager.gameState.activeTargetId = targetId;
			MasterGameManager.gameState.activeTradeTag = actionTag;
		} else if (result.status === 'TRIGGER_DYNAMIC_EVENT') {
			MasterGameManager.gameState.currentView = 'EVENT';
			set({
				activeEventData: result.eventData,
				activeEventNpc: result.targetNpc,
				activeEventResolution: null,
			});
		}

		// --- GLOBAL NPC REMOVAL LOGIC ---
		// List of statuses that should result in the NPC being removed from the viewport
		const shouldRemove =
			[
				'SUCCESS',
				'TRIGGER_COMBAT',
				'TRIGGER_DYNAMIC_EVENT',
				'FAILED_ESCAPE',
			].includes(result.status) || result.removeEntity;

		if (shouldRemove) {
			// We only remove if it's not a trade trigger (merchants should stay)
			if (result.status !== 'TRIGGER_TRADE') {
				MasterGameManager.gameState.activeEntities =
					MasterGameManager.gameState.activeEntities.filter(
						(entity) =>
							entity.entityId !== targetId && entity.id !== targetId,
					);
			}
		}

		get().syncEngine();
		return result;
	},

	submitEventChoice: (choiceObject) => {
		const state = get();
		const player = MasterGameManager.gameState.player;
		const npc = state.activeEventNpc;

		// NOU: Extragem datele de mediu necesare pentru calculele dinamice (sezon)
		const environmentData = {
			activeSeason: state.gameState.time?.activeSeason || 'summer',
		};

		// Trimitem environmentData mai departe
		const result = resolveEventChoice(
			player,
			choiceObject,
			npc,
			environmentData,
		);
		// Inside submitEventChoice action
		if (result.status === 'VICTORY') {
			set((state) => ({
				gameState: {
					...state.gameState,
					player: result.updatedPlayer,
					currentView: 'VICTORY',
					victoryReason: result.reason,
				},
				activeEventResolution: null,
				activeEventData: null,
				activeEventNpc: null,
			}));
			return result;
		} else if (result.status === 'TRIGGER_COMBAT') {
			set({
				pendingEventSuccessPayload: result.onSuccessPayload,
				pendingEventFailurePayload: result.onFailurePayload,
			});
			get().startCombatEncounter(result.targetNpc, result.combatRule);
		} else if (result.status === 'CHOICE_RESOLVED') {
			MasterGameManager.gameState.player = result.updatedPlayer;

			// Added rollDetails to the resolution state so the UI can trigger the animation
			set({
				activeEventResolution: {
					resultDescription: result.resultDescription,
					changes: result.changes,
					rollDetails: result.rollDetails,
				},
			});

			get().syncEngine();
		} else if (result.status === 'EXIT_TO_INTERACTION') {
			let targetId = null;
			if (result.targetNpc) {
				// FLAG AS TEMPORARY FOR CLEANUP
				result.targetNpc.isTemporaryEventNpc = true;

				targetId = result.targetNpc.entityId || result.targetNpc.id;
				const exists = MasterGameManager.gameState.activeEntities.some(
					(e) => (e.entityId || e.id) === targetId,
				);
				if (!exists) {
					MasterGameManager.gameState.activeEntities.push(
						result.targetNpc,
					);
				}
			}

			MasterGameManager.gameState.currentView = 'VIEWPORT';
			MasterGameManager.gameState.activeTargetId = targetId;

			set({
				activeEventData: null,
				activeEventNpc: null,
				activeEventResolution: null,
			});
			get().syncEngine();
		}
	},

	closeEventView: () => {
		// --- NEW: Targeted NPC Cleanup ---
		// If an event was generated targeting a specific NPC (like a Hunt),
		// we must remove that NPC from the active area so they don't persist after the event.
		const currentNpc = get().activeEventNpc;
		if (currentNpc) {
			const targetId = currentNpc.entityId || currentNpc.id;
			MasterGameManager.gameState.activeEntities =
				MasterGameManager.gameState.activeEntities.filter(
					(entity) =>
						entity.entityId !== targetId && entity.id !== targetId,
				);
		}

		MasterGameManager.gameState.currentView = 'VIEWPORT';
		set({
			activeEventData: null,
			activeEventNpc: null,
			activeEventResolution: null,
		});
		get().syncEngine();
	},

	// ========================================================================
	// INVENTORY & ECONOMY LOGIC
	// ========================================================================
	doEquipItem: (inventoryIndex, itemCategory) => {
		const result = MasterGameManager.processAction_Equip(
			inventoryIndex,
			itemCategory,
		);
		get().syncEngine();
		return result;
	},

	doUnequipItem: (itemCategory) => {
		const result = MasterGameManager.processAction_Unequip(itemCategory);
		get().syncEngine();
		return result;
	},

	doSlaughterAnimal: (inventoryIndex) => {
		const result =
			MasterGameManager.processAction_SlaughterAnimal(inventoryIndex);
		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	doDropItem: (inventoryIndex, targetArrayName) => {
		const result = MasterGameManager.processAction_DropItem(
			inventoryIndex,
			targetArrayName,
		);
		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	doRecalculateEncumbrance: () => {
		const result = MasterGameManager.processAction_RecalculateEncumbrance();
		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	useHealingPotion: () => {
		const player = get().gameState.player;
		if (
			player.inventory.healingPotions > 0 &&
			player.biology.hpCurrent < player.biology.hpMax
		) {
			player.inventory.healingPotions -= 1;
			player.biology.hpCurrent = Math.min(
				player.biology.hpMax,
				player.biology.hpCurrent +
					WORLD.COMBAT.actionModifiers.healHpAmount,
			);
			get().syncEngine();
			return true;
		}
		return false;
	},

	doShopTransaction: (cart, mode, regionalExchangeRate = 10, npcRank = 5) => {
		const player = get().gameState.player;
		let transactionSuccess = true;

		if (mode === 'BUY') {
			let incomingItems = 0,
				incomingAnimals = 0,
				incomingLoot = 0;

			cart.forEach((item) => {
				if (!item.isNumeric) {
					if (item.classification?.entityCategory === 'Animal')
						incomingAnimals += item.cartQuantity || 1;
					else if (item.classification?.itemCategory === 'Loot')
						incomingLoot += item.cartQuantity || 1;
					else incomingItems += item.cartQuantity || 1;
				}
			});

			const limits = WORLD.PLAYER?.inventoryLimits || {
				itemSlots: 50,
				animalSlots: 10,
				lootSlots: 20,
			};

			if (
				player.inventory.itemSlots.length + incomingItems >
					limits.itemSlots ||
				player.inventory.animalSlots.length + incomingAnimals >
					limits.animalSlots ||
				player.inventory.lootSlots.length + incomingLoot > limits.lootSlots
			) {
				return false;
			}
		}

		if (player.inventory.healingPotions === undefined)
			player.inventory.healingPotions = 0;

		for (const item of cart) {
			if (
				item.isNumeric &&
				(item.inventoryKey === 'potions' ||
					item.inventoryKey === 'potion' ||
					item.itemName === 'Healing Potion')
			) {
				item.inventoryKey = 'healingPotions';
			}

			let targetArray = 'itemSlots';
			if (item.isNumeric) targetArray = 'numeric';
			else if (item.classification?.entityCategory === 'Animal')
				targetArray = 'animalSlots';
			else if (item.classification?.itemCategory === 'Loot')
				targetArray = 'lootSlots';

			if (mode === 'BUY') {
				const result = executeBuyTransaction(
					player,
					item,
					item.cartQuantity || 1,
					regionalExchangeRate,
					targetArray,
				);
				if (result.status !== 'SUCCESS') {
					transactionSuccess = false;
					break;
				}
			} else if (mode === 'SELL') {
				let physicalIndex = null;
				const actualTargetArray = item.isNumeric
					? item.inventoryKey
					: targetArray;

				if (!item.isNumeric) {
					physicalIndex = player.inventory[actualTargetArray].findIndex(
						(i) => i.entityId === item.entityId,
					);
					if (physicalIndex === -1) {
						transactionSuccess = false;
						continue;
					}
				}

				const result = executeSellTransaction(
					player,
					item,
					item.cartQuantity || 1,
					regionalExchangeRate,
					actualTargetArray,
					physicalIndex,
				);
				if (result.status !== 'SUCCESS') transactionSuccess = false;
			} else if (mode === 'REPAIR') {
				const physicalIndex = player.inventory[targetArray].findIndex(
					(i) => i.entityId === item.entityId,
				);
				if (physicalIndex === -1) {
					transactionSuccess = false;
					continue;
				}

				const result = executeRepairTransaction(
					player,
					regionalExchangeRate,
					targetArray,
					physicalIndex,
					npcRank,
				);
				if (result.status !== 'SUCCESS') transactionSuccess = false;
			}
		}

		if (transactionSuccess) {
			recalculateEncumbrance(player);
			get().syncEngine();
		}

		return transactionSuccess;
	},

	// ========================================================================
	// DEBUG LOGIC
	// ========================================================================
	debugGenerateItem: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.itemSlots || 50;
		if (player.inventory.itemSlots.length < limit) {
			player.inventory.itemSlots.push(DebugFactory.createRandomEquipment());
			recalculateEncumbrance(player);
			get().syncEngine();
			return { success: true };
		}
		return { error: `Backpack is full! Limit is ${limit}.` };
	},

	// --- Animals Split ---
	debugGenerateMount: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.animalSlots || 10;
		if (player.inventory.animalSlots.length < limit) {
			// Make sure createRandomMount() exists in your DebugFactory!
			player.inventory.animalSlots.push(DebugFactory.createRandomMount());
			recalculateEncumbrance(player);
			get().syncEngine();
			return { success: true };
		}
		return { error: `Caravan is full! Limit is ${limit}.` };
	},

	debugGenerateDomestic: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.animalSlots || 10;
		if (player.inventory.animalSlots.length < limit) {
			// Make sure createRandomDomestic() exists in your DebugFactory!
			player.inventory.animalSlots.push(DebugFactory.createRandomDomestic());
			recalculateEncumbrance(player);
			get().syncEngine();
			return { success: true };
		}
		return { error: `Caravan is full! Limit is ${limit}.` };
	},

	debugAddResources: () => {
		const player = get().gameState.player;
		const resources = DebugFactory.createRandomResources();
		player.inventory.silverCoins += resources.coins;
		player.inventory.food += resources.food;
		get().syncEngine();
		return { success: true };
	},

	debugGenerateLoot: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.lootSlots || 20;
		if (player.inventory.lootSlots.length < limit) {
			player.inventory.lootSlots.push(DebugFactory.createRandomLoot());
			recalculateEncumbrance(player);
			get().syncEngine();
			return { success: true };
		}
		return { error: `Loot stash is full! Limit is ${limit}.` };
	},

	debugFullRestore: () => {
		const player = get().gameState.player;
		const hardCap = WORLD.PLAYER.hpLimits.hardCap;
		player.biology.hpMax = hardCap;
		player.biology.hpCurrent = hardCap;
		get().syncEngine();
		return { success: true };
	},

	debugAddTrophy: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.trophySlots || 20;

		// Ensure the array exists just in case it's an older save file
		if (!player.inventory.trophySlots) {
			player.inventory.trophySlots = [];
		}

		if (player.inventory.trophySlots.length < limit) {
			const newTrophy = DebugFactory.createRandomTrophy();
			player.inventory.trophySlots.push(newTrophy);

			// Trophies have mass, so we must recalculate the weight
			recalculateEncumbrance(player);

			get().syncEngine();
			return { success: true };
		}

		return { error: `Trophy stash is full! Limit is ${limit}.` };
	},

	// --- Modify Stats Update ---
	debugModifyStat: (category, statName, amount) => {
		const player = get().gameState.player;

		if (category === 'progression') {
			let newVal = (player.progression[statName] || 0) + amount;
			if (statName === 'honor') {
				newVal = Math.min(100, Math.max(-100, newVal));
			}
			if (statName === 'renown') {
				newVal = Math.min(500, Math.max(0, newVal));
			}
			player.progression[statName] = newVal;
		} else if (category === 'stats') {
			let newVal = (player.stats[statName] || 1) + amount;
			player.stats[statName] = Math.min(50, Math.max(1, newVal));
		} else if (category === 'identity') {
			// Added support for modifying Rank (1 to 5)
			if (statName === 'rank') {
				let newVal = (player.identity[statName] || 1) + amount;
				player.identity[statName] = Math.min(5, Math.max(1, newVal));
			}
		}

		get().syncEngine();
		return { success: true };
	},
}));

export default useGameState;
