// File: src/data/DB_Actions.js
// Description: Defines costs, yields, and requirements for non-combat POI interactions.

export const DB_ACTIONS = {
    employmentLabor: {
        Labor_Coin: {
            apCost: 1,
            goldCoinBaseGain: 5, // Abstract gain, scaled by regional exchange rate
        },
    },
    
    maintenanceRestoration: {
        Cure_Player: {
            apCost: 1,
            goldCoinBaseCost: 10, // Abstract cost, scaled by regional exchange rate
        },
    },

    attributeProgression: {
        Train_STR: {
            apCost: 2,
            goldCoinBaseCost: 5,
            statIncrement: 1,
        },
        Train_AGI: {
            apCost: 2,
            goldCoinBaseCost: 5,
            statIncrement: 1,
        },
        Train_INT: {
            apCost: 2,
            goldCoinBaseCost: 5,
            statIncrement: 1,
        },
    },

    utilityLogistics: {
        Service_Lodging: {
            apCost: 1,
            goldCoinBaseCost: 2,
            hpRestored: 25,
        },
    },
};