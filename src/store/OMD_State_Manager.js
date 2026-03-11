import { create } from 'zustand';
import { ODIN_Formulas } from '../utils/ODIN_Engine';

const SEASONAL_MODIFIERS = {
	Spring: {
		Food_Consumption_Multiplier: 1.0,
		Food_Price_Multiplier: 1.0,
		Transit_AP_Bonus: 2.0,
		Hunt_Yield_Bonus: 1,
	},
	Summer: {
		Food_Consumption_Multiplier: 1.0,
		Food_Price_Multiplier: 0.75,
		Transit_AP_Bonus: 1.0,
		Hunt_Yield_Bonus: 2,
	},
	Autumn: {
		Food_Consumption_Multiplier: 1.25,
		Food_Price_Multiplier: 1.25,
		Transit_AP_Bonus: 1.0,
		Hunt_Yield_Bonus: 1,
	},
	Winter: {
		Food_Consumption_Multiplier: 1.5,
		Food_Price_Multiplier: 2.0,
		Transit_AP_Bonus: 3.0,
		Hunt_Yield_Bonus: -2,
	},
};

const getSeasonFromMonth = (month) => {
	if (month >= 3 && month <= 5) return SEASONAL_MODIFIERS.Spring;
	if (month >= 6 && month <= 8) return SEASONAL_MODIFIERS.Summer;
	if (month >= 9 && month <= 11) return SEASONAL_MODIFIERS.Autumn;
	return SEASONAL_MODIFIERS.Winter;
};

const initialGameState = {
	knightId: null,
	knightName: '',
	engineGod: '',
	religion: '',
	time: {
		isActive: false,
		currentTurn: 1,
		currentMonth: 3,
		currentStateMultiplier: 1.0,
		currentSeasonModifier: SEASONAL_MODIFIERS.Spring,
	},
	location: {
		currentZoneCategory: 'UNTAMED',
		currentZoneClass: 'ORBIT',
		currentZoneSubclass: 'Orbit',
		currentZoneName: 'Outcast',
		currentZoneId: 1,
		currentWorldId: 'ORBIT_1',
		currentZoneEconomyLevel: 3,
		regionalExchangeRate: 10,
		availableTravelNodes: [],
	},
	player: {
		biology: {
			age: 18,
			hpCurrent: 100,
			hpMax: 100,
			str: 10,
			agi: 10,
			int: 10,
			currentAp: 8,
		},
		identity: {
			rank: 1,
			ren: 0,
			hon: 0,
			fullTitle: '',
		},
		equipped: {
			weapon: null,
			shield: null,
			armour: null,
			helmet: null,
			mount: null,
		},
		inventory: {
			silverCoins: 0,
			food: 0,
			gold: 0,
			silver: 0,
			currentMass: 0,
			maxCapacity: 100,
			encumbrancePenalty: 0,
			items: [],
			animals: [],
		},
		divineModifiers: {
			personalPatron: null,
			personalBlessing: {},
			activeRegionalGod: null,
			regionalBlessing: {},
			regionalCurse: {},
			activeGlobalGod: null,
			globalModifier: {},
		},
	},
};

const useGameState = create((set) => ({
	...initialGameState,

	loadGame: (knightData) =>
		set((state) => ({
			knightId: knightData._id,
			knightName: knightData.knightName,
			engineGod: knightData.engineGod,
			religion: knightData.religion,
			time: knightData.time || initialGameState.time,
			location: knightData.location || initialGameState.location,
			player: {
				...initialGameState.player,
				...knightData.player,
				divineModifiers:
					knightData.player?.divineModifiers ||
					initialGameState.player.divineModifiers,
			},
		})),

	endTurn: () =>
		set((state) => {
			const nextMonth =
				state.time.currentMonth === 12 ? 1 : state.time.currentMonth + 1;
			const isNewYear = nextMonth === 3;
			const nextAge = isNewYear
				? state.player.biology.age + 1
				: state.player.biology.age;

			return {
				time: {
					...state.time,
					currentTurn: state.time.currentTurn + 1,
					currentMonth: nextMonth,
					currentSeasonModifier: getSeasonFromMonth(nextMonth),
				},
				player: {
					...state.player,
					biology: {
						...state.player.biology,
						age: nextAge,
						currentAp: 8,
					},
				},
			};
		}),

	// executeTravel must be separated from endTurn
	executeTravel: (routeData) =>
		set((state) => {
			return {
				player: {
					...state.player,
					biology: {
						...state.player.biology,
						currentAp:
							state.player.biology.currentAp - routeData.Total_AP_Cost,
					},
					inventory: {
						...state.player.inventory,
						silverCoins:
							state.player.inventory.silverCoins -
							routeData.Total_Coin_Cost,
					},
				},
				location: {
					...state.location,
					currentWorldId: routeData.Destination_ID,
					currentZoneName: routeData.Destination_Name,
					currentZoneClass: routeData.Zone_Class,
					currentZoneCategory: routeData.Zone_Category,
					currentZoneEconomyLevel: routeData.Economy_Level,
				},
			};
		}),

	injectEncumbranceData: (encData) =>
		set((state) => ({
			player: {
				...state.player,
				inventory: {
					...state.player.inventory,
					currentMass: encData.currentMass,
					maxCapacity: encData.totalPlayerCarryWeight,
					encumbrancePenalty: encData.encumbrancePenaltyAP,
				},
			},
		})),

	// Temporary debug action
	debugEquipMount: () =>
		set((state) => ({
			player: {
				...state.player,
				equipped: {
					...state.player.equipped,
					mount: {
						entityName: 'Test_Horse',
						biology: { agi: 20, str: 15 },
					},
				},
			},
		})),

	debugUnequipMount: () =>
		set((state) => ({
			player: {
				...state.player,
				equipped: {
					...state.player.equipped,
					mount: null,
				},
			},
		})),

	debugAddMass: () =>
		set((state) => ({
			player: {
				...state.player,
				inventory: {
					...state.player.inventory,
					silverCoins: state.player.inventory.silverCoins + 5000,
				},
			},
		})),

	debugRemoveMass: () =>
		set((state) => ({
			player: {
				...state.player,
				inventory: {
					...state.player.inventory,
					silverCoins: Math.max(
						0,
						state.player.inventory.silverCoins - 5000,
					),
				},
			},
		})),

	clearSession: () => set(initialGameState),
}));

// Smart Listener: Detects changes to logistical factors and triggers auto-recalculation
useGameState.subscribe((state, prevState) => {
    // 1. Check for functional changes that actually alter mass or capacity
    // We check the lengths of the arrays and the specific equipped slots instead of the whole object
    const itemsChanged = state.player.inventory.items.length !== prevState.player.inventory.items.length;
    const animalsChanged = state.player.inventory.animals.length !== prevState.player.inventory.animals.length;
    const coinsChanged = state.player.inventory.silverCoins !== prevState.player.inventory.silverCoins;
    const foodChanged = state.player.inventory.food !== prevState.player.inventory.food;
    const goldChanged = state.player.inventory.gold !== prevState.player.inventory.gold;
    const silverChanged = state.player.inventory.silver !== prevState.player.inventory.silver;
    
    // Check if the specific mount object changed (equipped or unequipped)
    const mountChanged = state.player.equipped.mount !== prevState.player.equipped.mount;
    
    // Check if base strength changed
    const bioChanged = state.player.biology.str !== prevState.player.biology.str;

    if (itemsChanged || animalsChanged || coinsChanged || foodChanged || goldChanged || silverChanged || mountChanged || bioChanged) {
        
        // 2. Compute the new theoretical values
        const encData = ODIN_Formulas.Calculate_Mass_And_Encumbrance(state);
        
        // 3. Diff check against current values to prevent redundant state updates
        const massDiff = state.player.inventory.currentMass !== encData.currentMass;
        const capDiff = state.player.inventory.maxCapacity !== encData.totalPlayerCarryWeight;
        const penDiff = state.player.inventory.encumbrancePenalty !== encData.encumbrancePenaltyAP;

        // 4. Fire the state update only if actual calculated numbers changed
        if (massDiff || capDiff || penDiff) {
            useGameState.getState().injectEncumbranceData(encData);
        }
    }
});

export default useGameState;
