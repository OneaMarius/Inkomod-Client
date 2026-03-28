// File: src/store/OMD_State_Manager.js
import { create } from 'zustand';

// --- Engine Modules ---
import { MasterGameManager } from '../engine/GameManager.js';
import { processCombatTurn } from '../engine/ENGINE_Combat_Loop.js';
import { recalculateEncumbrance, calculateDerivedStats } from '../engine/ENGINE_Inventory.js';
import { executeBuyTransaction, executeSellTransaction, executeRepairTransaction } from '../engine/ENGINE_Economy_Shops.js';
import { DebugFactory } from '../engine/ENGINE_DebugHelpers.js';

// --- Data Configuration ---
import { WORLD } from '../data/GameWorld.js';
import { DB_LOCATIONS_ZONES } from '../data/DB_Locations.js';
import { DB_COMBAT } from '../data/DB_Combat.js';

// ============================================================================
// INTERNAL STORE HELPERS
// ============================================================================

const generateCombatMessages = (logPayload, combatStatus) => {
	const messages = [];

	if (!logPayload) {
		if (combatStatus === 'LOSE_FLEE') messages.push('* You successfully fled the encounter. *');
		else if (combatStatus === 'WIN_FLEE') messages.push('* The opponent successfully fled. *');
		else if (combatStatus === 'DRAW_FLEE') messages.push('* Both combatants retreated. *');
		messages.push('-------------------');
		return messages;
	}

	if (logPayload.fleeLog) messages.push(logPayload.fleeLog);

	if (logPayload.isFleeSuccess) {
		messages.push('* You successfully fled the encounter. *');
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
		if (deg.defenderArmour > 0) texts.push('Armour');
		if (deg.defenderShield > 0) texts.push('Shield');
		if (deg.defenderHelmet > 0) texts.push('Helmet');
		return texts.length > 0 ? `Equip damaged: ${texts.join(', ')}.` : null;
	};

	if (logPayload.playerAction === 'FAILED_FLEE') {
		messages.push('* You attempted to flee but failed! *');
	} else if (logPayload.playerAction !== 'FAILED_FLEE' && logPayload.npcAction === 'FLEE') {
		messages.push('* Opponent attempted to flee but failed! *');
	} else if (logPayload.playerAction === 'HEAL') {
		messages.push(`* You utilized a Healing Potion (+${WORLD.COMBAT.actionModifiers.healHpAmount} HP).`);
	} else if (logPayload.playerAction === 'SURRENDER') {
		messages.push('* You threw down your arms and surrendered. *');
	}

	if (pS && pS.hitType !== 'none') {
		if (pS.damageDealt > 0) messages.push(`You strike opponent for ${pS.damageDealt} damage ${getHitDesc(pS)}.`);
		else if (pS.hitType === 'evaded' || pS.hitType === 'parried') messages.push(`Your attack was ${pS.hitType} ${getHitDesc(pS)}.`);
		else if (pS.hitType === 'blocked') messages.push(`Your attack was absorbed ${getHitDesc(pS)}.`);

		const playerDegDesc = getDegDesc(pS.degradation);
		if (playerDegDesc) messages.push(playerDegDesc);
	}

	if (nS && nS.hitType !== 'none') {
		if (nS.damageDealt > 0) messages.push(`Opponent strikes you for ${nS.damageDealt} damage ${getHitDesc(nS)}.`);
		else if (nS.hitType === 'evaded' || nS.hitType === 'parried') messages.push(`Opponent attack was ${nS.hitType} ${getHitDesc(nS)}.`);
		else if (nS.hitType === 'blocked') messages.push(`Opponent attack was absorbed ${getHitDesc(nS)}.`);

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
	const getRank = (item) => item?.classification?.itemTier || item?.classification?.entityRank || '-';

	player.stats.str = player.stats.innateStr || player.stats.str || 10;
	player.stats.agi = player.stats.innateAgi || player.stats.agi || 10;
	player.stats.int = player.stats.innateInt || player.stats.int || 10;
	player.stats.ad = derived.totalAdp || 0;
	player.stats.dr = derived.totalDdr || 0;

	let equipAd = 0,
		equipDr = 0;
	const equippedRanks = { weapon: '-', armour: '-', shield: '-', helmet: '-' };

	if (equip.hasWeapon && equip.weaponItem) {
		equipAd += equip.weaponItem.stats?.adp || 0;
		equipDr += equip.weaponItem.stats?.ddr || 0;
		equippedRanks.weapon = getRank(equip.weaponItem);
	}
	if (equip.hasArmour && equip.armourItem) {
		equipAd += equip.armourItem.stats?.adp || 0;
		equipDr += equip.armourItem.stats?.ddr || 0;
		equippedRanks.armour = getRank(equip.armourItem);
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

	player.combatBreakdown = { equipAd, attrAd, totalAd: player.stats.ad, equipDr, attrDr, totalDr: player.stats.dr, equippedRanks };
};

// ========================================================================
// NPC STATS CALCULATOR (Internal Store Helper)
// ========================================================================
const updateNpcCombatStats = (npc) => {
	if (!npc || !npc.stats || !npc.equipment || !npc.inventory?.itemSlots) return;

	let equipAd = 0,
		equipDr = 0;
	const equippedRanks = { weapon: '-', armour: '-', shield: '-', helmet: '-' };
	const getRank = (item) => item?.classification?.itemTier || item?.classification?.entityRank || '-';

	npc.inventory.itemSlots.forEach((item) => {
		if (item.entityId === npc.equipment.weaponId && npc.equipment.hasWeapon) {
			equipAd += item.stats?.adp || 0;
			equipDr += item.stats?.ddr || 0;
			equippedRanks.weapon = getRank(item);
		}
		if (item.entityId === npc.equipment.armourId && npc.equipment.hasArmour) {
			equipAd += item.stats?.adp || 0;
			equipDr += item.stats?.ddr || 0;
			equippedRanks.armour = getRank(item);
		}
		if (item.entityId === npc.equipment.shieldId && npc.equipment.hasShield) {
			equipAd += item.stats?.adp || 0;
			equipDr += item.stats?.ddr || 0;
			equippedRanks.shield = getRank(item);
		}
		if (item.entityId === npc.equipment.helmetId && npc.equipment.hasHelmet) {
			equipAd += item.stats?.adp || 0;
			equipDr += item.stats?.ddr || 0;
			equippedRanks.helmet = getRank(item);
		}
	});

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

	npc.combatBreakdown = { equipAd, attrAd, totalAd: totalAdp, equipDr, attrDr, totalDr: totalDdr, equippedRanks };
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
	combatRoundCounter: 1,
	combatLogMessages: [],
	combatRoundStatus: 'CONTINUE',
	playerActionsPermitted: {},
	lastRoundVisualEvents: null,
	playerCombatStance: 'BALANCED',

	// ========================================================================
	// CORE SYSTEM ACTIONS
	// ========================================================================
	syncEngine: () => set({ gameState: { ...MasterGameManager.gameState } }),

	loadGame: (saveData) => {
		MasterGameManager.gameState.time = saveData.time;
		MasterGameManager.gameState.location = saveData.location;
		MasterGameManager.gameState.player = saveData.player;
		MasterGameManager.gameState.activeEntities = [];
		set({ knightId: saveData._id, knightName: saveData.knightName, gameState: { ...MasterGameManager.gameState } });
	},

	initializeNewGame: (creationParams, startingNodeId) => {
		MasterGameManager.startNewGame(creationParams, startingNodeId);
		set({ knightId: null, knightName: creationParams.name, gameState: { ...MasterGameManager.gameState } });
	},

	clearSession: () => set({ knightId: null, knightName: '' }),

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
				canHeal: player.inventory.healingPotions > 0 && (type === 'DMF' || type === 'NF'),
				canSurrender: type !== 'DMF',
				canFlee: type !== 'DMF' || (type === 'DMF' && player.biology.hpCurrent >= hpLimit.deathmatchFleeHp),
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
			combatLogMessages: ['Round 1: Engagement Initiated...', 'VT323 Monospaced Font Enabled.', '-------------------'],
			combatRoundStatus: 'CONTINUE',
			lastRoundVisualEvents: null,
			playerCombatStance: 'BALANCED',
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

		const turnResults = processCombatTurn(player, enemy, type, playerActionTag, stance);
		const newMessages = generateCombatMessages(turnResults.log, turnResults.combatStatus);

		if (turnResults.combatStatus === 'CONTINUE') {
			newMessages.push(`Round ${nextRound} begins...`);
		}

		const visualEvents = {
			playerAction: playerActionTag,
			npcAction: turnResults.log?.npcAction || 'FIGHT',
			playerHitType: turnResults.log?.npcStrikePayload?.hitType || 'none',
			enemyHitType: turnResults.log?.playerStrikePayload?.hitType || 'none',
			playerDamageTaken: turnResults.log?.npcStrikePayload?.damageDealt || 0,
			enemyDamageTaken: turnResults.log?.playerStrikePayload?.damageDealt || 0,
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
		return turnResults;
	},

	processCombatRewards: () => {
		const state = get();
		const player = state.gameState.player;
		const enemy = state.activeCombatEnemy;
		const combatStatus = state.combatRoundStatus;
		const combatType = state.activeCombatType;

		if (!enemy || combatStatus === 'CONTINUE') return;

		const enemyCategory = enemy.classification?.entityCategory || 'Human';
		const ruleData = DB_COMBAT.resolutionConsequences[enemyCategory]?.[combatType]?.[combatStatus];

		if (!ruleData) return;

		const rewardLog = { combatType, status: combatStatus, enemy: enemy.entityName || enemy.name, itemsLooted: [] };

		if (ruleData.renModifier !== undefined) {
			player.progression.renown = Math.max(0, (player.progression.renown || 0) + ruleData.renModifier);
		}
		if (ruleData.honModifier !== undefined) {
			const newHonor = (player.progression.honor || 0) + ruleData.honModifier;
			player.progression.honor = Math.max(-10, Math.min(10, newHonor));
		}

		if (player.inventory.silverCoins === undefined) player.inventory.silverCoins = 0;

		if (ruleData.coinYieldPct > 0 && enemy.inventory?.silverCoins) {
			const coinsWon = Math.floor(enemy.inventory.silverCoins * ruleData.coinYieldPct);
			player.inventory.silverCoins += coinsWon;
			enemy.inventory.silverCoins -= coinsWon;
		}

		if (ruleData.coinPenaltyPct > 0 && player.inventory.silverCoins > 0) {
			const coinsLost = Math.floor(player.inventory.silverCoins * ruleData.coinPenaltyPct);
			player.inventory.silverCoins = Math.max(0, player.inventory.silverCoins - coinsLost);
		}

		if (ruleData.foodYieldPct > 0 && enemy.logistics?.foodYield) {
			const foodWon = Math.floor(enemy.logistics.foodYield * ruleData.foodYieldPct);
			player.inventory.food = (player.inventory.food || 0) + foodWon;
		}

		if (ruleData.equipmentDrop && enemy.inventory?.itemSlots) {
			const equipIds = [enemy.equipment?.weaponId, enemy.equipment?.armourId, enemy.equipment?.shieldId, enemy.equipment?.helmetId].filter(Boolean);
			equipIds.forEach((id) => {
				const itemToSteal = enemy.inventory.itemSlots.find((i) => i.entityId === id);
				if (itemToSteal && player.inventory.itemSlots.length < (WORLD.PLAYER.inventoryLimits.itemSlots || 50)) {
					const clonedItem = { ...itemToSteal, entityId: `looted_${Date.now()}_${Math.random()}` };
					player.inventory.itemSlots.push(clonedItem);
					enemy.inventory.itemSlots = enemy.inventory.itemSlots.filter((i) => i.entityId !== id);
					rewardLog.itemsLooted.push(clonedItem.itemName || clonedItem.name);
				}
			});
		}

		if (ruleData.tableLootYieldPct > 0 && enemy.inventory?.lootSlots) {
			enemy.inventory.lootSlots.forEach((loot) => {
				if (Math.random() <= ruleData.tableLootYieldPct) {
					if (player.inventory.lootSlots.length < (WORLD.PLAYER.inventoryLimits.lootSlots || 20)) {
						const clonedLoot = { ...loot, entityId: `looted_${Date.now()}_${Math.random()}` };
						player.inventory.lootSlots.push(clonedLoot);
						rewardLog.itemsLooted.push(clonedLoot.itemName || clonedLoot.name || 'Unknown Item');
					}
				}
			});
			enemy.inventory.lootSlots = [];
		}

		if (ruleData.playerEquipmentLoss) {
			player.equipment.hasWeapon = false;
			player.equipment.weaponItem = null;
			player.equipment.hasArmour = false;
			player.equipment.armourItem = null;
			player.equipment.hasShield = false;
			player.equipment.shieldItem = null;
			player.equipment.hasHelmet = false;
			player.equipment.helmetItem = null;
		}

		recalculateEncumbrance(player);
	},

	exitCombatEncounterView: () => {
		get().processCombatRewards();

		const targetId = MasterGameManager.gameState.activeTargetId;
		const enemy = get().activeCombatEnemy;
		const entityToRemoveId = targetId || (enemy ? enemy.entityId || enemy.id : null);

		if (entityToRemoveId) {
			MasterGameManager.gameState.activeEntities = MasterGameManager.gameState.activeEntities.filter(
				(entity) => entity.entityId !== entityToRemoveId && entity.id !== entityToRemoveId,
			);
		}

		MasterGameManager.gameState.currentView = 'VIEWPORT';
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
				MasterGameManager.gameState.activeEntities = MasterGameManager.gameState.activeEntities.filter(
					(entity) => entity.entityId !== targetId && entity.id !== targetId,
				);
			}
		}

		MasterGameManager.gameState.currentView = 'VIEWPORT';
		MasterGameManager.gameState.activeTargetId = null;
		MasterGameManager.gameState.activeTradeTag = null;
		get().syncEngine();
	},

	// ========================================================================
	// WORLD & INTERACTION LOGIC
	// ========================================================================
	endTurn: () => {
		const result = MasterGameManager.processAction_EndMonth();
		get().syncEngine();
		return result;
	},

	executeTravel: (targetNodeId) => {
		set({ isTraveling: true });
		const targetZone = DB_LOCATIONS_ZONES.find((zone) => zone.worldId === targetNodeId || zone.id === targetNodeId);

		if (targetZone && targetZone.backgroundImage) {
			const imgPreloader = new Image();
			imgPreloader.src = targetZone.backgroundImage;
		}

		const result = MasterGameManager.processAction_Travel(targetNodeId);
		get().syncEngine();

		setTimeout(() => set({ isTraveling: false }), 3500);
		return result;
	},

	enterPoi: (poiId, poiCategory = 'CIVILIZED', overrideApCost = null) => {
		const result = MasterGameManager.processAction_EnterPoi(poiId, poiCategory, overrideApCost);
		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	exploreUntamed: () => {
		const result = MasterGameManager.processAction_ExploreUntamed();
		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	exitPoi: () => {
		MasterGameManager.processAction_ExitPoi();
		get().syncEngine();
	},

	doInteraction: (actionTag, targetId, exchangeRate) => {
		const result = MasterGameManager.processAction_Interaction(actionTag, targetId, exchangeRate);

		if (result.status === 'TRIGGER_COMBAT') {
			const activeEntities = MasterGameManager.gameState.activeEntities;
			const npcTarget = activeEntities.find((npc) => npc.entityId === targetId || npc.id === targetId);

			if (npcTarget) {
				const combatType = result.combatRule || 'NF';
				get().startCombatEncounter(npcTarget, combatType);
			}
		} else if (result.status === 'TRIGGER_TRADE') {
			MasterGameManager.gameState.currentView = 'TRADE';
			MasterGameManager.gameState.activeTargetId = targetId;
			MasterGameManager.gameState.activeTradeTag = actionTag;
		}

		get().syncEngine();
		return result;
	},

	// ========================================================================
	// INVENTORY & ECONOMY LOGIC
	// ========================================================================
	doEquipItem: (inventoryIndex, itemCategory) => {
		const result = MasterGameManager.processAction_Equip(inventoryIndex, itemCategory);
		get().syncEngine();
		return result;
	},

	doUnequipItem: (itemCategory) => {
		const result = MasterGameManager.processAction_Unequip(itemCategory);
		get().syncEngine();
		return result;
	},

	doSlaughterAnimal: (inventoryIndex) => {
		const result = MasterGameManager.processAction_SlaughterAnimal(inventoryIndex);
		if (result.status === 'SUCCESS') get().syncEngine();
		return result;
	},

	doDropItem: (inventoryIndex, targetArrayName) => {
		const result = MasterGameManager.processAction_DropItem(inventoryIndex, targetArrayName);
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
		if (player.inventory.healingPotions > 0 && player.biology.hpCurrent < player.biology.hpMax) {
			player.inventory.healingPotions -= 1;
			player.biology.hpCurrent = Math.min(player.biology.hpMax, player.biology.hpCurrent + WORLD.COMBAT.actionModifiers.healHpAmount);
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
					if (item.classification?.entityCategory === 'Animal') incomingAnimals += item.cartQuantity || 1;
					else if (item.classification?.itemCategory === 'Loot') incomingLoot += item.cartQuantity || 1;
					else incomingItems += item.cartQuantity || 1;
				}
			});

			const limits = WORLD.PLAYER?.inventoryLimits || { itemSlots: 50, animalSlots: 10, lootSlots: 20 };

			if (
				player.inventory.itemSlots.length + incomingItems > limits.itemSlots ||
				player.inventory.animalSlots.length + incomingAnimals > limits.animalSlots ||
				player.inventory.lootSlots.length + incomingLoot > limits.lootSlots
			) {
				return false;
			}
		}

		if (player.inventory.healingPotions === undefined) player.inventory.healingPotions = 0;

		for (const item of cart) {
			if (item.isNumeric && (item.inventoryKey === 'potions' || item.inventoryKey === 'potion' || item.itemName === 'Healing Potion')) {
				item.inventoryKey = 'healingPotions';
			}

			let targetArray = 'itemSlots';
			if (item.isNumeric) targetArray = 'numeric';
			else if (item.classification?.entityCategory === 'Animal') targetArray = 'animalSlots';
			else if (item.classification?.itemCategory === 'Loot') targetArray = 'lootSlots';

			if (mode === 'BUY') {
				const result = executeBuyTransaction(player, item, item.cartQuantity || 1, regionalExchangeRate, targetArray);
				if (result.status !== 'SUCCESS') {
					transactionSuccess = false;
					break;
				}
			} else if (mode === 'SELL') {
				let physicalIndex = null;
				const actualTargetArray = item.isNumeric ? item.inventoryKey : targetArray;

				if (!item.isNumeric) {
					physicalIndex = player.inventory[actualTargetArray].findIndex((i) => i.entityId === item.entityId);
					if (physicalIndex === -1) {
						transactionSuccess = false;
						continue;
					}
				}

				const result = executeSellTransaction(player, item, item.cartQuantity || 1, regionalExchangeRate, actualTargetArray, physicalIndex);
				if (result.status !== 'SUCCESS') transactionSuccess = false;
			} else if (mode === 'REPAIR') {
				const physicalIndex = player.inventory[targetArray].findIndex((i) => i.entityId === item.entityId);
				if (physicalIndex === -1) {
					transactionSuccess = false;
					continue;
				}

				const result = executeRepairTransaction(player, regionalExchangeRate, targetArray, physicalIndex, npcRank);
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

	debugGenerateAnimal: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.animalSlots || 10;
		if (player.inventory.animalSlots.length < limit) {
			player.inventory.animalSlots.push(DebugFactory.createRandomAnimal());
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

	debugModifyStat: (category, statName, amount) => {
		const player = get().gameState.player;

		if (category === 'progression') {
			let newVal = (player.progression[statName] || 0) + amount;
			if (statName === 'honor') newVal = Math.min(10, Math.max(-10, newVal));
			if (statName === 'renown') newVal = Math.max(0, newVal);
			player.progression[statName] = newVal;
		} else if (category === 'stats') {
			let newVal = (player.stats[statName] || 1) + amount;
			player.stats[statName] = Math.min(50, Math.max(1, newVal));
		}

		get().syncEngine();
		return { success: true };
	},
}));

export default useGameState;
