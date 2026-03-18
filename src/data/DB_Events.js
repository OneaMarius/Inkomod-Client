// File: src/data/DB_Events.js
// Description: Centralized database for random world events triggered during travel or end-month cycles.

export const DB_EVENTS = {
    // ------------------------------------------------------------------------
    // TRAVEL EVENTS
    // Triggered randomly during node-to-node transit.
    // ------------------------------------------------------------------------
    travel: [
        {
            id: 'evt_trv_001',
            name: 'Clear Skies',
            description: 'The weather is exceptionally clear and the roads are solid. You make good time.',
            weight: 50, // High probability (acts as a "nothing happens" buffer)
            conditions: {}, // No specific conditions needed
            effects: {
                apMod: 0,
                foodMod: 0,
                coinMod: 0,
                hpMod: 0
            }
        },
        {
            id: 'evt_trv_002',
            name: 'Muddy Roads',
            description: 'Heavy rain has turned the trade routes into a swamp. Your progress is severely delayed.',
            weight: 20,
            conditions: {},
            effects: {
                apMod: -1, // Costs 1 extra AP to complete the journey
                foodMod: 0,
                coinMod: 0,
                hpMod: 0
            }
        },
        {
            id: 'evt_trv_003',
            name: 'Abandoned Cart',
            description: 'You discover an overturned merchant cart on the side of the road. You salvage some usable rations.',
            weight: 15,
            conditions: {},
            effects: {
                apMod: 0,
                foodMod: 3, // Gain 3 food
                coinMod: 0,
                hpMod: 0
            }
        },
        {
            id: 'evt_trv_004',
            name: 'Minor Ambush',
            description: 'A group of desperate bandits fires arrows from the treeline. You escape, but suffer minor injuries.',
            weight: 15,
            conditions: {},
            effects: {
                apMod: 0,
                foodMod: 0,
                coinMod: 0,
                hpMod: -15 // Lose 15 HP
            }
        }
    ],

    // ------------------------------------------------------------------------
    // MONTHLY EVENTS
    // Triggered randomly at the end of the month (Turn progression).
    // ------------------------------------------------------------------------
    monthly: [
        {
            id: 'evt_mon_001',
            name: 'Uneventful Month',
            description: 'The month passes without any notable incidents.',
            weight: 60,
            conditions: {},
            effects: {
                foodMod: 0,
                coinMod: 0,
                hpMod: 0
            }
        },
        {
            id: 'evt_mon_002',
            name: 'Vermin Infestation',
            description: 'Rats have infiltrated your supplies during the night, ruining some of your rations.',
            weight: 20,
            conditions: {},
            effects: {
                foodMod: -2, // Lose 2 food
                coinMod: 0,
                hpMod: 0
            }
        },
        {
            id: 'evt_mon_003',
            name: 'Good Samaritan',
            description: 'You helped a local noble with a minor task. They rewarded you with a small purse of silver.',
            weight: 10,
            conditions: {},
            effects: {
                foodMod: 0,
                coinMod: 25, // Gain 25 silver coins
                hpMod: 0
            }
        },
        {
            id: 'evt_mon_004',
            name: 'Restful Period',
            description: 'You found an exceptionally comfortable place to rest this month, allowing your body to heal deeply.',
            weight: 10,
            conditions: {},
            effects: {
                foodMod: 0,
                coinMod: 0,
                hpMod: 20 // Extra 20 HP recovery
            }
        }
    ]
};