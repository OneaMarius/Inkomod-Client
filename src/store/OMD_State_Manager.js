// File: Client/src/store/OMD_State_Manager.js
import { create } from 'zustand';
import { MasterGameManager } from '../engine/GameManager.js';
import { DebugFactory } from '../engine/ENGINE_DebugHelpers.js';
import { recalculateEncumbrance } from '../engine/ENGINE_Inventory.js';

const useGameState = create((set, get) => ({
	// Identificatorii de sesiune (folosiți pentru API calls către MongoDB)
	knightId: null,
	knightName: '',

	// Legătura directă cu sursa de adevăr a motorului de joc
	gameState: MasterGameManager.gameState,

	// ========================================================================
	// ENGINE SYNCHRONIZATION
	// ========================================================================
	/**
	 * Forțează interfața React să se redeseneze prin crearea unei copii a stării din motor.
	 * Trebuie apelată după ORICE acțiune care modifică starea în GameManager.
	 */
	syncEngine: () => {
		set({ gameState: { ...MasterGameManager.gameState } });
	},

	// ========================================================================
	// SAVE / LOAD SYSTEM
	// ========================================================================

	// Apelat când utilizatorul alege o salvare din meniul LoadGame
	loadGame: (saveData) => {
		// 1. Suprascriem starea internă a motorului cu datele din MongoDB
		MasterGameManager.gameState.time = saveData.time;
		MasterGameManager.gameState.location = saveData.location;
		MasterGameManager.gameState.player = saveData.player;
		MasterGameManager.gameState.activeEntities = []; // Golește entitățile vechi

		// 2. Actualizăm starea React
		set({
			knightId: saveData._id,
			knightName: saveData.knightName,
			gameState: { ...MasterGameManager.gameState },
		});
	},

	// Apelat la crearea unui caracter nou, înainte de a salva în DB
	initializeNewGame: (creationParams, startingNodeId) => {
		MasterGameManager.startNewGame(creationParams, startingNodeId);
		set({
			knightId: null, // Va fi setat după răspunsul de la Server
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
		return result; // Returnează statusul și evenimentele lunare către UI
	},

	executeTravel: (targetNodeId) => {
		// Notă: Interfața va trimite acum doar ID-ul nodului destinație,
		// deoarece motorul calculează singur costurile.
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

	// Curăță sesiunea la deconectare sau la ieșirea la meniul principal
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

			// Mapăm structura THOR la ce așteaptă UI-ul (dacă e nevoie)
			// THOR returnează deja entityName, mass, stats, etc.
			player.inventory.itemSlots.push(newItem);

			recalculateEncumbrance(player);
			get().syncEngine();
		}
	},

	debugGenerateAnimal: () => {
		const player = get().gameState.player;
		if (player.inventory.animalSlots.length < 10) {
			const newAnimal = DebugFactory.createRandomAnimal();

			// Mapăm structura pentru UI
			// Observație: Calul are stats.innateStr, Cow are stats.str
			// Ne asigurăm că interfața citește corect
			player.inventory.animalSlots.push(newAnimal);

			recalculateEncumbrance(player);
			get().syncEngine();
		}
	},
}));

export default useGameState;
