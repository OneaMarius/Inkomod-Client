// File: Client/src/store/OMD_State_Manager.js
import { create } from 'zustand';
import { MasterGameManager } from '../engine/GameManager.js';
import { DebugFactory } from '../engine/ENGINE_DebugHelpers.js';
import { recalculateEncumbrance } from '../engine/ENGINE_Inventory.js';
import {
	executeBuyTransaction,
	executeSellTransaction,
} from '../engine/ENGINE_Economy_Shops.js';

const useGameState = create((set, get) => ({
	knightId: null,
	knightName: '',

	gameState: MasterGameManager.gameState,

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

		set({
			knightId: saveData._id,
			knightName: saveData.knightName,
			gameState: { ...MasterGameManager.gameState },
		});
	},

	initializeNewGame: (creationParams, startingNodeId) => {
		MasterGameManager.startNewGame(creationParams, startingNodeId);
		set({
			knightId: null,
			knightName: creationParams.name,
			gameState: { ...MasterGameManager.gameState },
		});
	},

	// ========================================================================
	// UI ACTION DISPATCHERS (Wrappers pentru GameManager)
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

		if (result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	doDropItem: (inventoryIndex, targetArrayName) => {
		const result = MasterGameManager.processAction_DropItem(
			inventoryIndex,
			targetArrayName,
		);

		if (result.status === 'SUCCESS') {
			get().syncEngine();
		}
		return result;
	},

	doInteraction: (actionTag, targetId, exchangeRate) => {
		// Accept the 3rd param
		const result = MasterGameManager.processAction_Interaction(
			actionTag,
			targetId,
			exchangeRate,
		); // Pass it down
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

	// Aici am adăugat parametrul overrideApCost
	enterPoi: (poiId, poiCategory = 'CIVILIZED', overrideApCost = null) => {
		const result = MasterGameManager.processAction_EnterPoi(
			poiId,
			poiCategory,
			overrideApCost,
		);
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
		set({
			knightId: null,
			knightName: '',
		});
	},

	cancelEncounter: () => {
		// Resetăm starea view-ului înapoi la normal
		MasterGameManager.gameState.currentView = 'VIEWPORT';
		MasterGameManager.gameState.activeTargetId = null;
		get().syncEngine();
	},

	doShopTransaction: (cart, mode, regionalExchangeRate = 10) => {
		const player = get().gameState.player;
		let transactionSuccess = true;

		for (const item of cart) {
			// Determinăm destinația/sursa în inventar
			let targetArray = 'itemSlots';
			if (item.isNumeric) {
				targetArray = 'numeric';
			} else if (item.classification?.entityCategory === 'Animal') {
				targetArray = 'animalSlots';
			} else if (item.classification?.itemCategory === 'Loot') {
				targetArray = 'lootSlots';
			}

			if (mode === 'BUY') {
				const result = executeBuyTransaction(
					player,
					item,
					item.cartQuantity || 1,
					regionalExchangeRate,
					targetArray,
				);

				if (result.status !== 'SUCCESS') {
					console.error('Transaction failed:', result.status);
					transactionSuccess = false;
					break; // Oprim procesarea dacă nu are bani
				}
			} else if (mode === 'SELL') {
				// Dacă este item fizic, trebuie să îi găsim indexul în inventarul jucătorului
				let physicalIndex = null;
				const actualTargetArray = item.isNumeric
					? item.inventoryKey
					: targetArray;

				if (!item.isNumeric) {
					const inventoryList = player.inventory[actualTargetArray];
					physicalIndex = inventoryList.findIndex(
						(i) => i.entityId === item.entityId,
					);

					if (physicalIndex === -1) {
						console.error('Item to sell not found in inventory!');
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

				if (result.status !== 'SUCCESS') {
					console.error('Sell Transaction failed:', result.status);
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
		// Limita de 15 sloturi pentru Loot, conform UI-ului
		if (player.inventory.lootSlots.length < 15) {
			const newLoot = DebugFactory.createRandomLoot();
			player.inventory.lootSlots.push(newLoot);
			recalculateEncumbrance(player);
			get().syncEngine();
		}
	},
}));

export default useGameState;
