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
			typology: 'Discovery',
			eventType: 'POSITIVE',
			conditions: { weight: 90, minRank: 1, allowedZones: [], allowedSeasons: [] },
			staticEffects: {
				hpMod: 0,
				apMod: 0,
				silverCoins: 12,
				food: 3,
				healingPotions: 1, // Injected directly into inventory
			},
			choices: null,
		},

		// --- 2. DEE EVENT: Bandit Ambush (Interactive Encounter) ---
		{
			id: 'evt_trv_002',
			name: 'Highway Ambush',
			description: 'A hostile figure steps out from the treeline, weapon drawn. "Your silver or your life," they demand, blocking the path forward.',
			typology: 'Encounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 60, minRank: 1 },
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Outlaw'], subclasses: [], rankModifier: 0 } },
			choices: [
				{
					id: 'choice_combat',
					label: 'Draw your weapon and fight',
					checkType: 'COMBAT',
					combatRule: 'DMF', // Deathmatch
					onSuccess: { honor: 2, renown: 5, silverCoins: 15 },
					onFailure: { honor: -5, renown: -5 },
				},
				{
					id: 'choice_pay',
					label: 'Pay the toll (-25 Silver Coins)',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 25 },
					onSuccess: { honor: -3, description: 'You toss the coin purse. The outlaw smirks and steps aside.' },
				},
				{
					id: 'choice_intimidate',
					label: 'Intimidate them (Strength Check)',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						renown: 5,
						description: 'You roar and step forward, hand on the hilt of your weapon. The outlaw loses their nerve and flees into the woods.',
					},
					onFailure: { hpMod: -15, silverCoins: -10, description: 'They laugh at your bluff, strike you unexpectedly, snatch some coin, and run.' },
				},
			],
		},
	],

	// ========================================================================
	// MONTHLY EVENTS
	// Triggered randomly at the end of the month (Turn progression).
	// ========================================================================
	monthly: [
		// --- 1. SEE: Restful Period (Positive, High Weight) ---
		{
			id: 'evt_mon_001',
			name: 'Restful Period',
			description: 'The month passes quietly, allowing you to mend your wounds and gather your thoughts.',
			typology: 'General',
			eventType: 'POSITIVE',
			conditions: {
				weight: 60, // Reduced from 100 to allow other events to occur
				minRank: 1,
			},
			staticEffects: { hpMod: 25, apMod: 0 },
			choices: null,
		},

		// --- 2. SEE: Vermin Infestation (Negative, Low Weight) ---
		{
			id: 'evt_mon_002',
			name: 'Rats in the Rations',
			description: 'You awake to the sound of scurrying. Rats have gotten into your supplies overnight, ruining some of your food.',
			typology: 'Logistics',
			eventType: 'NEGATIVE',
			conditions: { weight: 20, minRank: 1 },
			staticEffects: {
				food: -5, // Subtracts 5 food
				hpMod: 0,
			},
			choices: null,
		},

		// --- 3. DEE: Mysterious Stranger (Interactive, Low Weight) ---
		{
			id: 'evt_mon_003',
			name: 'A Midnight Thump',
			description: 'During a restless night, you hear a loud thump outside your shelter. A shadowy figure is trying to steal your coin purse!',
			typology: 'Encounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 20, minRank: 1 },
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Thief'],
					subclasses: [],
					rankModifier: -1, // Slightly weaker than average for the zone
				},
			},
			choices: [
				{
					id: 'choice_combat_thief',
					label: 'Chase them down!',
					checkType: 'COMBAT',
					combatRule: 'NF', // Normal Fight (non-lethal usually for thieves)
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
					label: 'Let them go (Agility Check to secure bags)',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: -1, // Easier check
					onSuccess: { description: 'You quickly secure the rest of your bags. They only manage to grab a few coppers before fleeing.', silverCoins: -2 },
					onFailure: { description: 'You fumble in the dark. The thief snatches a heavy pouch and disappears.', silverCoins: -15 },
				},
			],
		},
	],
};
