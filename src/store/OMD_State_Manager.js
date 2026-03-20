// File: Client/src/store/OMD_State_Manager.js
import { create } from 'zustand';
import { MasterGameManager } from '../engine/GameManager.js';
import { DebugFactory } from '../engine/ENGINE_DebugHelpers.js';
import { recalculateEncumbrance } from '../engine/ENGINE_Inventory.js';

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

	doInteraction: (actionTag, regionalExchangeRate = 10) => {
		const result = MasterGameManager.processAction_Interaction(
			actionTag,
			regionalExchangeRate,
		);
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
}));

export default useGameState;
