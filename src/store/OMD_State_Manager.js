// File: src/store/OMD_State_Manager.js
import { create } from 'zustand';
import { MasterGameManager } from '../engine/GameManager.js';
import { processCombatTurn } from '../engine/ENGINE_Combat_Loop.js';
import { WORLD } from '../data/GameWorld.js';
import { DebugFactory } from '../engine/ENGINE_DebugHelpers.js';
import { recalculateEncumbrance, calculateDerivedStats } from '../engine/ENGINE_Inventory.js';
import { executeBuyTransaction, executeSellTransaction, executeRepairTransaction } from '../engine/ENGINE_Economy_Shops.js';

// ========================================================================
// COMBAT LOG PARSER (Internal Store Helper)
// ========================================================================
const generateCombatMessages = (logPayload, combatStatus) => {
	const messages = [];

	if (!logPayload) {
		if (combatStatus === 'LOSE_FLEE') messages.push('* You successfully fled the encounter. *');
		else if (combatStatus === 'WIN_FLEE') messages.push('* The opponent successfully fled. *');
		else if (combatStatus === 'DRAW_FLEE') messages.push('* Both combatants retreated. *');
		messages.push('-------------------');
		return messages;
	}

	if (logPayload.fleeLog) {
		messages.push(logPayload.fleeLog);
	}

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
		if (payload.hitType === 'none') return '';
		return '';
	};

	const getDegDesc = (deg) => {
		let texts = [];
		if (deg.attackerWeapon > 0) texts.push('Weapon');
		if (deg.defenderArmour > 0) texts.push('Armour');
		if (deg.defenderShield > 0) texts.push('Shield');
		if (deg.defenderHelmet > 0) texts.push('Helmet');
		if (texts.length === 0) return null;
		return `Equip damaged: ${texts.join(', ')}.`;
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
		if (pS.damageDealt > 0) {
			messages.push(`You strike opponent for ${pS.damageDealt} damage ${getHitDesc(pS)}.`);
		} else if (pS.hitType === 'evaded' || pS.hitType === 'parried') {
			messages.push(`Your attack was ${pS.hitType} ${getHitDesc(pS)}.`);
		} else if (pS.hitType === 'blocked') {
			messages.push(`Your attack was absorbed ${getHitDesc(pS)}.`);
		}

		const playerDegDesc = getDegDesc(pS.degradation);
		if (playerDegDesc) messages.push(playerDegDesc);
	}

	if (nS && nS.hitType !== 'none') {
		if (nS.damageDealt > 0) {
			messages.push(`Opponent strikes you for ${nS.damageDealt} damage ${getHitDesc(nS)}.`);
		} else if (nS.hitType === 'evaded' || nS.hitType === 'parried') {
			messages.push(`Opponent attack was ${nS.hitType} ${getHitDesc(nS)}.`);
		} else if (nS.hitType === 'blocked') {
			messages.push(`Opponent attack was absorbed ${getHitDesc(nS)}.`);
		}

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

	player.stats.str = player.stats.innateStr || player.stats.str || 10;
	player.stats.agi = player.stats.innateAgi || player.stats.agi || 10;
	player.stats.int = player.stats.innateInt || player.stats.int || 10;

	player.stats.ad = derived.totalAdp || 0;
	player.stats.dr = derived.totalDdr || 0;

	let equipAd = 0;
	let equipDr = 0;
	const equip = player.equipment;
	const equippedRanks = { weapon: '-', armour: '-', shield: '-', helmet: '-' };

	const getRank = (item) => item?.classification?.itemTier || item?.classification?.entityRank || '-';

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

	let equipAd = 0;
	let equipDr = 0;
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

const useGameState = create((set, get) => ({
	knightId: null,
	knightName: '',

	gameState: MasterGameManager.gameState,

	// Combat Specific State
	activeCombatEnemy: null,
	activeCombatType: 'NF',
	combatRoundCounter: 1,
	combatLogMessages: [],
	combatRoundStatus: 'CONTINUE',
	playerActionsPermitted: {},

	// ========================================================================
	// ENGINE SYNCHRONIZATION
	// ========================================================================
	syncEngine: () => {
		set({ gameState: { ...MasterGameManager.gameState } });
	},

	// ========================================================================
	// SAVE / LOAD SYSTEM
	// ========================================================================
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

	// ========================================================================
	// COMBAT ACTIONS (MARS ENGINE INTEGRATION)
	// ========================================================================
	calculateCombatPermittedActions: () => {
		const player = get().gameState.player;
		const type = get().activeCombatType;
		const hpLimit = WORLD.COMBAT.thresholds;

		set({
			playerActionsPermitted: {
				canFight: true,
				canHeal: (player.inventory.healingPotions !== undefined ? player.inventory.healingPotions > 0 : false) && (type === 'DMF' || type === 'NF'),
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

		updatePlayerCombatStats(player);
		updateNpcCombatStats(enemy);

		const turnResults = processCombatTurn(player, enemy, type, playerActionTag);
		const newMessages = generateCombatMessages(turnResults.log, turnResults.combatStatus);

		if (turnResults.combatStatus === 'CONTINUE') {
			newMessages.push(`Round ${nextRound} begins...`);
		}

		set((state) => ({
			combatRoundStatus: turnResults.combatStatus,
			activeCombatEnemy: turnResults.npcEntity,
			combatRoundCounter: nextRound,
			combatLogMessages: [...state.combatLogMessages, ...newMessages],
		}));

		get().syncEngine();
		get().calculateCombatPermittedActions();

		return turnResults;
	},

	exitCombatEncounterView: () => {
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
		});

		get().syncEngine();
	},

	// ========================================================================
	// UI ACTION DISPATCHERS (Logistics, Shops, Interaction)
	// ========================================================================
	endTurn: () => {
		const result = MasterGameManager.processAction_EndMonth();
		get().syncEngine();
		return result;
	},

	executeTravel: (targetNodeId) => {
		const result = MasterGameManager.processAction_Travel(targetNodeId);
		get().syncEngine();
		return result;
	},

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

		if (result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	doDropItem: (inventoryIndex, targetArrayName) => {
		const result = MasterGameManager.processAction_DropItem(inventoryIndex, targetArrayName);

		if (result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	doInteraction: (actionTag, targetId, exchangeRate) => {
		const result = MasterGameManager.processAction_Interaction(actionTag, targetId, exchangeRate);

		if (result.status === 'TRIGGER_COMBAT') {
			const activeEntities = MasterGameManager.gameState.activeEntities;
			const npcTarget = activeEntities.find((npc) => npc.entityId === targetId || npc.id === targetId);

			if (npcTarget) {
				let combatType = 'NF';

				const lowerTag = actionTag.toLowerCase();
				if (lowerTag.includes('duel') || lowerTag.includes('spar') || lowerTag.includes('friendly')) {
					combatType = 'FF';
				} else if (lowerTag.includes('hunt') || lowerTag.includes('assassinate') || lowerTag.includes('deathmatch')) {
					combatType = 'DMF';
				}

				get().startCombatEncounter(npcTarget, combatType);
			} else {
				console.error('Combat setup failed: Target NPC not found in active entities.');
			}
		}

		get().syncEngine();
		return result;
	},

	doRecalculateEncumbrance: () => {
		const result = MasterGameManager.processAction_RecalculateEncumbrance();

		if (result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	enterPoi: (poiId, poiCategory = 'CIVILIZED', overrideApCost = null) => {
		const result = MasterGameManager.processAction_EnterPoi(poiId, poiCategory, overrideApCost);
		if (result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	exploreUntamed: () => {
		const result = MasterGameManager.processAction_ExploreUntamed();
		if (result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	exitPoi: () => {
		MasterGameManager.processAction_ExitPoi();
		get().syncEngine();
	},

	clearSession: () => {
		set({ knightId: null, knightName: '' });
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

	doShopTransaction: (cart, mode, regionalExchangeRate = 10, npcRank = 5) => {
		const player = get().gameState.player;
		let transactionSuccess = true;

		if (mode === 'BUY') {
			let incomingItems = 0;
			let incomingAnimals = 0;
			let incomingLoot = 0;

			cart.forEach((item) => {
				if (!item.isNumeric) {
					if (item.classification?.entityCategory === 'Animal') {
						incomingAnimals += item.cartQuantity || 1;
					} else if (item.classification?.itemCategory === 'Loot') {
						incomingLoot += item.cartQuantity || 1;
					} else {
						incomingItems += item.cartQuantity || 1;
					}
				}
			});

			const limits = WORLD.PLAYER?.inventoryLimits || { itemSlots: 50, animalSlots: 10, lootSlots: 20 };

			if (
				player.inventory.itemSlots.length + incomingItems > limits.itemSlots ||
				player.inventory.animalSlots.length + incomingAnimals > limits.animalSlots ||
				player.inventory.lootSlots.length + incomingLoot > limits.lootSlots
			) {
				// Returnăm false în loc de alert() pentru a prinde eroarea în UI (ShopView)
				return false;
			}
		}

		if (player.inventory.healingPotions === undefined) {
			player.inventory.healingPotions = 0;
		}

		for (const item of cart) {
			if (item.isNumeric && (item.inventoryKey === 'potions' || item.inventoryKey === 'potion' || item.itemName === 'Healing Potion')) {
				item.inventoryKey = 'healingPotions';
			}

			let targetArray = 'itemSlots';
			if (item.isNumeric) {
				targetArray = 'numeric';
			} else if (item.classification?.entityCategory === 'Animal') {
				targetArray = 'animalSlots';
			} else if (item.classification?.itemCategory === 'Loot') {
				targetArray = 'lootSlots';
			}

			if (mode === 'BUY') {
				const result = executeBuyTransaction(player, item, item.cartQuantity || 1, regionalExchangeRate, targetArray);

				if (result.status !== 'SUCCESS') {
					console.error('Transaction failed:', result.status);
					transactionSuccess = false;
					break;
				}
			} else if (mode === 'SELL') {
				let physicalIndex = null;
				const actualTargetArray = item.isNumeric ? item.inventoryKey : targetArray;

				if (!item.isNumeric) {
					const inventoryList = player.inventory[actualTargetArray];
					physicalIndex = inventoryList.findIndex((i) => i.entityId === item.entityId);

					if (physicalIndex === -1) {
						transactionSuccess = false;
						continue;
					}
				}

				const result = executeSellTransaction(player, item, item.cartQuantity || 1, regionalExchangeRate, actualTargetArray, physicalIndex);

				if (result.status !== 'SUCCESS') {
					transactionSuccess = false;
				}
			} else if (mode === 'REPAIR') {
				const inventoryList = player.inventory[targetArray];
				const physicalIndex = inventoryList.findIndex((i) => i.entityId === item.entityId);

				if (physicalIndex === -1) {
					console.error('Item to repair not found in inventory!');
					transactionSuccess = false;
					continue;
				}

				const result = executeRepairTransaction(player, regionalExchangeRate, targetArray, physicalIndex, npcRank);

				if (result.status !== 'SUCCESS') {
					console.error('Repair Transaction failed:', result.status);
					transactionSuccess = false;
				}
			}
		}

		if (transactionSuccess) {
			recalculateEncumbrance(player);
			get().syncEngine();
		}

		return transactionSuccess;
	},

	// ========================================================================
	// SYSTEM DEBUG ACTIONS (Temporary)
	// ========================================================================
	// Modificat: Returnează un obiect cu `error` sau `success` în loc de alert().
	debugGenerateItem: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.itemSlots || 50;
		if (player.inventory.itemSlots.length < limit) {
			const newItem = DebugFactory.createRandomEquipment();
			player.inventory.itemSlots.push(newItem);
			recalculateEncumbrance(player);
			get().syncEngine();
			return { success: true };
		} else {
			return { error: `Backpack is full! Limit is ${limit}.` };
		}
	},

	debugGenerateAnimal: () => {
		const player = get().gameState.player;
		const limit = WORLD.PLAYER?.inventoryLimits?.animalSlots || 10;
		if (player.inventory.animalSlots.length < limit) {
			const newAnimal = DebugFactory.createRandomAnimal();
			player.inventory.animalSlots.push(newAnimal);
			recalculateEncumbrance(player);
			get().syncEngine();
			return { success: true };
		} else {
			return { error: `Caravan is full! Limit is ${limit}.` };
		}
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
			const newLoot = DebugFactory.createRandomLoot();
			player.inventory.lootSlots.push(newLoot);
			recalculateEncumbrance(player);
			get().syncEngine();
			return { success: true };
		} else {
			return { error: `Loot stash is full! Limit is ${limit}.` };
		}
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
			newVal = Math.min(50, Math.max(1, newVal));

			player.stats[statName] = newVal;
		}

		get().syncEngine();
		return { success: true };
	},
}));

export default useGameState;
