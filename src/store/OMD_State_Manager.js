// File: Client/src/store/OMD_State_Manager.js
import { create } from 'zustand';
import { MasterGameManager } from '../engine/GameManager.js';
// NOU: Import the combat loop engine
import { processCombatTurn } from '../engine/ENGINE_Combat_Loop.js';
import { WORLD } from '../data/GameWorld.js';
import { DebugFactory } from '../engine/ENGINE_DebugHelpers.js';
import { recalculateEncumbrance } from '../engine/ENGINE_Inventory.js';
import { executeBuyTransaction, executeSellTransaction, executeRepairTransaction } from '../engine/ENGINE_Economy_Shops.js';

// ========================================================================
// COMBAT LOG PARSER (Internal Store Helper)
// ========================================================================
/**
 * Translates structured combat payload into readable text strings using VT323 monospaced font aesthetic.
 */
const generateCombatMessages = (logPayload, combatStatus) => {
	const messages = [];

	// 1. Handle cases where the engine terminates before strikes occur (e.g., successful flee)
	if (!logPayload) {
		if (combatStatus === 'LOSE_FLEE') messages.push('* You successfully fled the encounter. *');
		else if (combatStatus === 'WIN_FLEE') messages.push('* The opponent successfully fled. *');
		else if (combatStatus === 'DRAW_FLEE') messages.push('* Both combatants retreated. *');
		messages.push('-------------------');
		return messages;
	}

	const { playerStrikePayload: pS, npcStrikePayload: nS } = logPayload;

	// Helper to format hit descriptions
	const getHitDesc = (payload) => {
		if (payload.hitType === 'critical') return '(CRITICAL HIT!)';
		if (payload.hitType === 'evaded') return '(Evaded)';
		if (payload.hitType === 'blocked') return '(Blocked by Shield)';
		if (payload.hitType === 'parried') return '(Parried by Weapon)';
		if (payload.hitType === 'none') return '';
		return '';
	};

	// Helper to format degradation text
	const getDegDesc = (deg) => {
		let texts = [];
		if (deg.attackerWeapon > 0) texts.push('Weapon');
		if (deg.defenderArmour > 0) texts.push('Armour');
		if (deg.defenderShield > 0) texts.push('Shield');
		if (deg.defenderHelmet > 0) texts.push('Helmet');
		if (texts.length === 0) return null;
		return `Equip damaged: ${texts.join(', ')}.`;
	};

	// --- ROUND START MESSAGE ---
	if (logPayload.playerAction === 'FLEE' && logPayload.npcAction !== 'FLEE') {
		messages.push('* You attempted to flee but failed! *');
	} else if (logPayload.playerAction !== 'FLEE' && logPayload.npcAction === 'FLEE') {
		messages.push('* Opponent attempted to flee but failed! *');
	} else if (logPayload.playerAction === 'HEAL') {
		messages.push(`* You utilized a Healing Potion (+${WORLD.COMBAT.actionModifiers.healHpAmount} HP).`);
	} else if (logPayload.playerAction === 'SURRENDER') {
		messages.push('* You threw down your arms and surrendered. *');
	}

	// --- PLAYER RESULT ---
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

	// --- NPC RESULT ---
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

	// --- ROUND END CHECK ---
	messages.push('-------------------');
	return messages;
};

const useGameState = create((set, get) => ({
	knightId: null,
	knightName: '',

	gameState: MasterGameManager.gameState,

	// NEW: Combat Specific State
	activeCombatEnemy: null, // Holds dynamic copy of NPC
	activeCombatType: 'NF', // FF, NF, DMF
	combatLogMessages: [], // Array of text strings
	combatRoundStatus: 'CONTINUE', // WIN_.., LOSE_.. or CONTINUE
	playerActionsPermitted: {}, // Logic for button locking

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

	/**
	 * Internal helper to calculate which buttons should be locked based on combat type and player state.
	 */
	calculateCombatPermittedActions: () => {
		const player = get().gameState.player;
		const type = get().activeCombatType;
		const hpLimit = WORLD.COMBAT.thresholds;

		// Base matrix
		set({
			playerActionsPermitted: {
				canFight: true,
				// Logic updated: Must have potions AND the combat must be a Deathmatch (DMF)
				canHeal: (player.inventory.healingPotions !== undefined ? player.inventory.healingPotions > 0 : false) && type === 'DMF',
				canSurrender: type !== 'DMF',
				canFlee: type !== 'DMF' || (type === 'DMF' && player.biology.hpCurrent >= hpLimit.deathmatchFleeHp),
			},
		});
	},

	/**
	 * Initializes the Combat Encounter view.
	 */
	startCombatEncounter: (npcObject, type = 'NF') => {
		set({
			activeCombatEnemy: npcObject, // Stateless dynamic copy
			activeCombatType: type,
			combatLogMessages: ['Combat Engagement Initiated...', 'VT323 Monospaced Font Enabled.', '-------------------'],
			combatRoundStatus: 'CONTINUE',
		});
		get().calculateCombatPermittedActions(); // Lock buttons appropriately

		// Change View to Combat
		MasterGameManager.gameState.currentView = 'COMBAT';
		get().syncEngine();
	},

	/**
	 * Executes a single combat turn using ENGINE_Combat_Loop.
	 * Updates global state with returned mutated objects.
	 */
	executeCombatRound: (playerActionTag) => {
		const player = get().gameState.player;
		const enemy = get().activeCombatEnemy;
		const type = get().activeCombatType;

		// 1. EXECUTE SIMULATION LOOP (Stateless execution)
		const turnResults = processCombatTurn(player, enemy, type, playerActionTag);

		// 2. GENERATE AND UPDATE COMBAT LOG
		// NEW: We now pass the combatStatus so the parser handles null logs correctly
		const newMessages = generateCombatMessages(turnResults.log, turnResults.combatStatus);

		// 3. SECURELY MUTATE STATE
		set((state) => ({
			combatRoundStatus: turnResults.combatStatus,
			activeCombatEnemy: turnResults.npcEntity,
			combatLogMessages: [...state.combatLogMessages, ...newMessages],
		}));

		// 4. SYNCHRONIZE GLOBAL PLAYER
		get().syncEngine();
		get().calculateCombatPermittedActions();

		return turnResults;
	},

	/**
	 * Exits Combat View back to regional Viewport.
	 */
	exitCombatEncounterView: () => {
		MasterGameManager.gameState.currentView = 'VIEWPORT';
		MasterGameManager.gameState.activeTargetId = null; // Clear focus

		// Cleanup local combat state
		set({ activeCombatEnemy: null, activeCombatType: 'NF', combatLogMessages: [], combatRoundStatus: 'CONTINUE', playerActionsPermitted: {} });

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
		// 1. Send the action to the engine
		const result = MasterGameManager.processAction_Interaction(actionTag, targetId, exchangeRate);

		// 2. Intercept the COMBAT trigger to setup the UI state
		if (result.status === 'TRIGGER_COMBAT') {
			// Locate the target NPC in the current POI's active entities
			const activeEntities = MasterGameManager.gameState.activeEntities;
			const npcTarget = activeEntities.find((npc) => npc.entityId === targetId || npc.id === targetId);

			if (npcTarget) {
				// Determine the severity of the combat based on the action tag
				let combatType = 'NF'; // Normal Fight by default (e.g., Robbery, standard aggression)

				const lowerTag = actionTag.toLowerCase();
				if (lowerTag.includes('duel') || lowerTag.includes('spar') || lowerTag.includes('friendly')) {
					combatType = 'FF'; // Friendly Fight (Stops early, no death)
				} else if (lowerTag.includes('hunt') || lowerTag.includes('assassinate') || lowerTag.includes('deathmatch')) {
					combatType = 'DMF'; // Deathmatch Fight (Fight to the death)
				}

				// Initialize the combat view data
				get().startCombatEncounter(npcTarget, combatType);
			} else {
				console.error('Combat setup failed: Target NPC not found in active entities.');
			}
		}

		// 3. Synchronize global state and return
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

	// Restored: Handles exiting non-combat interactions like Shops and dialogue
	cancelEncounter: () => {
		MasterGameManager.gameState.currentView = 'VIEWPORT';
		MasterGameManager.gameState.activeTargetId = null;
		MasterGameManager.gameState.activeTradeTag = null;

		get().syncEngine();
	},

	doShopTransaction: (cart, mode, regionalExchangeRate = 10) => {
		const player = get().gameState.player;
		let transactionSuccess = true;

		// FIX Part 1: Ensure the property exists on the player to prevent NaN math errors
		if (player.inventory.healingPotions === undefined) {
			player.inventory.healingPotions = 0;
		}

		for (const item of cart) {
			// FIX Part 2: Normalize the inventory key.
			// If the shop generated 'potions', force it to be 'healingPotions' to match the DB Schema.
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

				const result = executeRepairTransaction(player, regionalExchangeRate, targetArray, physicalIndex);

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
	debugGenerateItem: () => {
		const player = get().gameState.player;
		if (player.inventory.itemSlots.length < 20) {
			const newItem = DebugFactory.createRandomEquipment();
			player.inventory.itemSlots.push(newItem);
			recalculateEncumbrance(player);
			get().syncEngine();
		}
	},

	debugGenerateAnimal: () => {
		const player = get().gameState.player;
		if (player.inventory.animalSlots.length < 10) {
			const newAnimal = DebugFactory.createRandomAnimal();
			player.inventory.animalSlots.push(newAnimal);
			recalculateEncumbrance(player);
			get().syncEngine();
		}
	},

	debugAddResources: () => {
		const player = get().gameState.player;
		const resources = DebugFactory.createRandomResources();

		player.inventory.silverCoins += resources.coins;
		player.inventory.food += resources.food;

		get().syncEngine();
	},

	debugGenerateLoot: () => {
		const player = get().gameState.player;
		if (player.inventory.lootSlots.length < 15) {
			const newLoot = DebugFactory.createRandomLoot();
			player.inventory.lootSlots.push(newLoot);
			recalculateEncumbrance(player);
			get().syncEngine();
		}
	},

	// NEW: System Debug Restore
	debugFullRestore: () => {
		const player = get().gameState.player;
		const hardCap = WORLD.PLAYER.hpLimits.hardCap;

		player.biology.hpMax = hardCap;
		player.biology.hpCurrent = hardCap;

		get().syncEngine();
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
	},
}));

export default useGameState;
