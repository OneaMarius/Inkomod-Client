// File: Client/src/data/DB_Events.js
// Description: Master database for all narrative events (SEE & DEE).

export const DB_EVENTS = {
    // ========================================================================
    // TRAVEL EVENTS
    // Triggered randomly during node-to-node transit.
    // ========================================================================
    travel: [
        // --- 1. SEE EVENT: Abandoned Cart (Passive Discovery) ---
        {
            id: 'evt_trv_001',
            name: 'Abandoned Merchant Cart',
            description: 'You spot a broken merchant cart off the side of the road. The owners are long gone, but some supplies were left behind in the mud.',
            typology: 'Discovery', // Aliniat cu noua taxonomie
            eventType: 'POSITIVE',
            conditions: { weight: 25 },
            staticEffects: {
                hpMod: 0,
                apMod: 0,
                silverCoins: 12,
                food: 3,
                healingPotions: 1,
            },
            choices: null,
        },

        // --- 2. DEE EVENT: Bandit Ambush (Interactive Encounter) ---
        {
            id: 'evt_trv_002',
            name: 'Highway Ambush',
            description: 'A hostile figure steps out from the treeline, weapon drawn. "Your silver or your life," they demand, blocking the path forward.',
            typology: 'CombatEncounter',
            eventType: 'NEGATIVE',
            conditions: { weight: 60 },
            staticEffects: null,
            onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Outlaw'], subclasses: [], rankModifier: 0 } },
            choices: [
                {
                    id: 'choice_combat',
                    label: 'Draw your weapon and fight',
                    checkType: 'COMBAT',
                    combatRule: 'DMF',
                    onSuccess: { 
                        honor: 2, 
                        renown: 5, 
                        silverCoins: 15,
                        procGen: { items: [{ category: 'Consumable', maxTier: 1, count: 1 }] }
                    },
                    onFailure: { honor: -5, renown: -5 },
                },
                {
                    id: 'choice_pay',
                    label: 'Pay the toll',
                    checkType: 'TRADE_OFF',
                    cost: { silverCoins: 25 },
                    onSuccess: { honor: -3, description: 'You toss the coin purse. The outlaw smirks and steps aside.' },
                },
                {
                    id: 'choice_intimidate',
                    label: 'Intimidate them',
                    checkType: 'SKILL_CHECK',
                    attribute: 'str',
                    difficultyModifier: 0,
                    onSuccess: {
                        renown: 5,
                        description: 'You roar and step forward, hand on the hilt of your weapon. The outlaw loses their nerve and flees into the woods.',
                        procGen: { items: [{ category: 'Material', maxTier: 2, count: 1 }] }
                    },
                    onFailure: { hpMod: -15, silverCoins: -10, description: 'They laugh at your bluff, strike you unexpectedly, snatch some coin, and run.' },
                },
            ],
        },

        // --- 3. DEE EVENT: Pack of Wolves (Wilderness Ambush) ---
        {
            id: 'evt_trv_003',
            name: 'Hunted by the Pack',
            description: 'The hairs on your neck stand up. Low growls echo from the thick brush, and a pair of yellow eyes locks onto you. A wild wolf has picked up your scent.',
            typology: 'CombatEncounter', // Aliniat cu noua taxonomie
            eventType: 'NEGATIVE',
            conditions: { weight: 90, allowedZoneClasses: ['WILD'] },
            staticEffects: null,
            onEncounter: { 
                procGen: { 
                    type: 'NPC_ANIMAL', 
                    entityClass: 'Wild', 
                    subclasses: ['Wolf'], 
                    rankModifier: 0 
                } 
            },
            choices: [
                {
                    id: 'choice_combat_wolf',
                    label: 'Stand your ground',
                    checkType: 'COMBAT',
                    combatRule: 'DMF',
                    onSuccess: { 
                        honor: 1, 
                        renown: 5, 
                        description: 'You emerge victorious, leaving the dead beast behind while the rest of the pack scatters.' 
                    },
                    onFailure: { honor: 0, renown: 0 },
                },
                {
                    id: 'choice_flee_wolf',
                    label: 'Try to outrun them',
                    checkType: 'SKILL_CHECK',
                    attribute: 'agi',
                    difficultyModifier: 2,
                    onSuccess: { 
                        description: 'You sprint through the treacherous terrain, barely outmaneuvering the snapping jaws of the beast before losing it in a ravine.' 
                    },
                    onFailure: { 
                        hpMod: -25, 
                        description: 'You trip over a gnarled root! The wolf descends upon you, tearing at your flesh before you finally manage to beat it back and escape.' 
                    },
                },
                {
                    id: 'choice_feed_wolf',
                    label: 'Throw food to distract them',
                    checkType: 'TRADE_OFF',
                    cost: { food: 5 },
                    onSuccess: { 
                        description: 'You hurl a chunk of dried meat into the bushes. The hungry wolf immediately dives for it, ignoring you as you slip away quietly.' 
                    },
                },
            ],
        },

        // --- 4. SEE EVENT: Winter Hazard (Demonstrează filtrul de sezon) ---
        {
            id: 'evt_trv_004',
            name: 'Sudden Whiteout',
            description: 'A fierce, unexpected blizzard sweeps across the trail. The biting cold saps your strength, forcing you to consume extra rations to stay warm.',
            typology: 'Hazard', // Aliniat cu noua taxonomie
            eventType: 'NEGATIVE',
            conditions: { weight: 40, allowedSeasons: ['winter'] }, // Apare doar iarna
            staticEffects: {
                hpMod: -5,
                food: -3,
            },
            choices: null,
        },
    ],

    // ========================================================================
    // MONTHLY EVENTS
    // Triggered randomly at the end of the month (Turn progression).
    // ========================================================================
    monthly: [
        // --- 1. SEE: Wandering Minstrel (Positive, High Weight) ---
        {
            id: 'evt_mon_001',
            name: 'Wandering Minstrel',
            description:
                'A traveling minstrel shares your campfire for the evening. You exchange stories and provisions, and word of your deeds begins to spread across the region.',
            typology: 'SocialEncounter', // Aliniat cu noua taxonomie
            eventType: 'POSITIVE',
            conditions: { weight: 60 },
            staticEffects: {
                renown: 5,
                food: -1,
            },
            choices: null,
        },

        // --- 2. SEE: Vermin Infestation (Negative, Low Weight) ---
        {
            id: 'evt_mon_002',
            name: 'Rats in the Rations',
            description: 'You awake to the sound of scurrying. Rats have gotten into your supplies overnight, ruining some of your food.',
            typology: 'Hazard', // Considerat hazard logistic
            eventType: 'NEGATIVE',
            conditions: { weight: 20 },
            staticEffects: {
                food: -5,
                hpMod: 0,
            },
            choices: null,
        },

        // --- 3. DEE: Mysterious Stranger (Interactive, Low Weight) ---
        {
            id: 'evt_mon_003',
            name: 'A Midnight Thump',
            description: 'During a restless night, you hear a loud thump outside your shelter. A shadowy figure is trying to steal your coin purse!',
            typology: 'CombatEncounter', // Aliniat cu noua taxonomie
            eventType: 'NEGATIVE',
            conditions: { weight: 20 },
            staticEffects: null,
            onEncounter: {
                procGen: {
                    type: 'NPC_HUMAN',
                    categories: ['Human'],
                    classes: ['Outlaw'],
                    subclasses: [],
                    rankModifier: -1,
                },
            },
            choices: [
                {
                    id: 'choice_combat_thief',
                    label: 'Chase them down!',
                    checkType: 'COMBAT',
                    combatRule: 'NF',
                    onSuccess: {
                        honor: 1,
                        renown: 2,
                        description: 'You catch the thief and retrieve your belongings, plus a little extra they dropped in the scuffle.',
                        silverCoins: 5,
                    },
                    onFailure: { description: 'The thief overpowers you and escapes into the night with your silver.', silverCoins: -20, hpMod: -5 },
                },
                {
                    id: 'choice_ignore_thief',
                    label: 'Let them go',
                    checkType: 'SKILL_CHECK',
                    attribute: 'agi',
                    difficultyModifier: -1,
                    onSuccess: { description: 'You quickly secure the rest of your bags. They only manage to grab a few coppers before fleeing.', silverCoins: -2 },
                    onFailure: { description: 'You fumble in the dark. The thief snatches a heavy pouch and disappears.', silverCoins: -15 },
                },
            ],
        },
    ],
};