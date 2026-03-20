// File: src/data/DB_Actions.js
// Description: Defines costs, yields, and requirements for non-combat POI interactions.

export const DB_ACTIONS = {
    // ------------------------------------------------------------------------
    // EMPLOYMENT & LABOR
    // ------------------------------------------------------------------------
    employmentLabor: {
        Labor_Coin: {
            apCost: 1,
            goldCoinBaseGain: 5, // Abstract gain, scaled by regional exchange rate
        },
    },
    
    // ------------------------------------------------------------------------
    // MAINTENANCE & RESTORATION
    // ------------------------------------------------------------------------
    maintenanceRestoration: {
        Cure_Player: {
            apCost: 1,
            goldCoinBaseCost: 10, // Abstract cost, scaled by regional exchange rate
        },
    },

    // ------------------------------------------------------------------------
    // ATTRIBUTE PROGRESSION
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // UTILITY & LOGISTICS
    // ------------------------------------------------------------------------
    utilityLogistics: {
        Service_Lodging: {
            apCost: 1,
            goldCoinBaseCost: 2,
            hpRestored: 25,
        },
    }, 

    // ------------------------------------------------------------------------
    // COMBAT ENGAGEMENTS
    // ------------------------------------------------------------------------
    combatEngagements: {
        Fight_Animal: {
            apCost: 0,
        },
        Hunt_Animal: {
            apCost: 0,
        },
        Evade_Animal: {
            apCost: 0,
        },
        Fight_Humanoid: {
            apCost: 0,
        },
    },

    // ------------------------------------------------------------------------
    // ECONOMY & TRADE
    // ------------------------------------------------------------------------
    economyTrade: {
        Trade: {
            apCost: 0,
        },
        Buy_Animal: {
            apCost: 0,
        },
        Sell_Animal: {
            apCost: 0,
        },
    },

    // ------------------------------------------------------------------------
    // NPC INTERACTIONS
    // ------------------------------------------------------------------------
    npcInteractions: {
        Talk: {
            apCost: 0,
        },
        Ignore: {
            apCost: 0,
        },
        Steal_Animal: {
            apCost: 0,
        },
        Mount_Animal: {
            apCost: 0,
        },
        Dismount_Animal: {
            apCost: 0,
        },
        Slaughter_Animal: {
            apCost: 0,
        },
    }
};