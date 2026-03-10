import { create } from 'zustand';

const initialGameState = {
    knightId: null,
    knightName: "",
    engineGod: "",
    religion: "",
    time: {
        isActive: false,
        currentTurn: 1,
        currentMonth: 3,
        currentStateMultiplier: 1.0,
        currentSeasonModifier: {} 
    },
    location: {
        currentZoneCategory: "UNTAMED",
        currentZoneClass: "ORBIT",
        currentZoneSubclass: "Orbit",
        currentZoneName: "Outcast",
        currentZoneId: 1,
        currentWorldId: "ORBIT_1",
        currentZoneEconomyLevel: 3,
        regionalExchangeRate: 10,
        availableTravelNodes: []
    },
    player: {
        biology: {
            age: 18,
            hpCurrent: 100,
            hpMax: 100,
            str: 10,
            agi: 10,
            int: 10,
            currentAp: 8
        },
        identity: {
            rank: 1,
            ren: 0,
            hon: 0,
            fullTitle: ""
        },
        equipped: {
            weapon: null,
            shield: null,
            armour: null,
            helmet: null,
            mount: null
        },
        inventory: {
            silverCoins: 0,
            food: 0,
            gold: 0,
            silver: 0,
            currentMass: 0,
            isEncumbered: false,
            items: [],
            animals: []
        },
        divineModifiers: {
            personalPatron: null,
            personalBlessing: {},
            activeRegionalGod: null,
            regionalBlessing: {},
            regionalCurse: {},
            activeGlobalGod: null,
            globalModifier: {}
        }
    }
};

const useGameState = create((set) => ({
    ...initialGameState,

    loadGame: (knightData) => set((state) => ({
        knightId: knightData._id,
        knightName: knightData.knightName,
        engineGod: knightData.engineGod,
        religion: knightData.religion,
        time: knightData.time || initialGameState.time,
        location: knightData.location || initialGameState.location,
        player: {
            ...initialGameState.player,
            ...knightData.player,
            divineModifiers: knightData.player?.divineModifiers || initialGameState.player.divineModifiers
        }
    })),

    clearSession: () => set(initialGameState)
}));

export default useGameState;