// File: Client/src/data/DB_Events.js
// Description: Master database of active game events.

export const DB_EVENTS = {
	events: [
		{
			name: 'Test',
			description: 'Test',
			typology: 'General',
			eventType: 'NEUTRAL',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedSeasons: [],
				allowedZoneClasses: [],
				allowedZoneCategories: [],
				allowedZoneSubclasses: [],
				allowedZones: [],
			},
			staticEffects: { silverCoins: { tier: 'MODERATE', type: 'REWARD' }, tradeSilver: { tier: 'MAJOR', type: 'REWARD' } },
			procGen: { items: [{ category: 'Physical', itemClass: 'Weapon', tierModifier: 2, count: 3 }] },
			onEncounter: { procGen: { categories: [], classes: [], subclasses: [] } },
			id: '6bfcc5a8-0ae5-408e-a4d8-936fd074e21d',
			// choices: [],
		},
		{
			name: 'test 2',
			description: 'test 2',
			typology: 'General',
			eventType: 'NEUTRAL',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedSeasons: [],
				allowedZoneClasses: [],
				allowedZoneCategories: [],
				allowedZoneSubclasses: [],
				allowedZones: [],
			},
			procGen: { items: [] },
			onEncounter: { procGen: { categories: [], classes: [], subclasses: [] } },
			choices: [
				{
					label: 'c1',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'test',
						healingPotions: { tier: 'MODERATE', type: 'REWARD' },
						str: { tier: 'MINOR', type: 'PENALTY' },
						procGen: { items: [{ category: 'Animal', itemClass: '', entityClass: 'Mount', subclassKey: '', tierModifier: null, count: 1 }] },
					},
					id: '9967b21a-b1d8-4c4a-aa34-cda33e9a90c4',
				},
				{
					label: 'c2',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: -2,
					onSuccess: {
						description: 'asdasdas',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						tradeGold: { tier: 'MODERATE', type: 'PENALTY' },
						procGen: { items: [{ category: 'Physical', itemClass: 'Weapon', tierModifier: null, count: 1 }] },
					},
					onFailure: { description: 'assaas', silverCoins: { tier: 'MAJOR', type: 'PENALTY' }, procGen: { items: [] } },
					id: 'db596407-883e-4c95-8b0e-181928d452ca',
				},
			],
			id: '9f54f51a-9650-412e-8d6a-e01a2d4b5c2f',
		},
	],
	// events: [
	// 	{
	// 		id: 'evt_test_see_static',
	// 		name: 'Test SEE: Static Modifiers',
	// 		description: 'A sudden chill drains your energy and damages your health. No items are found.',
	// 		typology: 'Hazard',
	// 		eventType: 'NEGATIVE',
	// 		conditions: { weight: 50, allowedTriggers: ['travel', 'explore', 'endturn'] },
	// 		staticEffects: { hpMod: { tier: 'MINOR', type: 'PENALTY' }, apMod: { tier: 'MINOR', type: 'PENALTY' } },
	// 		procGen: null,
	// 		onEncounter: null,
	// 		choices: null,
	// 	},

	// 	// ==========================================
	// 	// TEST 2: PROCEDURAL GENERATION ONLY
	// 	// ==========================================
	// 	{
	// 		id: 'evt_test_see_procgen',
	// 		name: 'Test SEE: Procedural Generation',
	// 		description: 'You stumble upon an unguarded supply cache. There are no immediate effects on your vitals, but you acquire items.',
	// 		typology: 'Discovery',
	// 		eventType: 'NEGATIVE',
	// 		conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
	// 		staticEffects: null,
	// 		procGen: {
	// 			items: [
	// 				{ category: 'Loot', count: 2 },
	// 				{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 },
	// 			],
	// 		},
	// 		onEncounter: null,
	// 		choices: null,
	// 	},

	// 	// ==========================================
	// 	// TEST 3: HYBRID (STATIC + PROCGEN)
	// 	// ==========================================
	// 	{
	// 		id: 'evt_test_see_hybrid',
	// 		name: 'Test SEE: Hybrid Effects',
	// 		description: 'You find a stray domestic animal carrying a small pouch of silver. Tracking it down slightly drains your stamina.',
	// 		typology: 'Discovery',
	// 		eventType: 'NEGATIVE',
	// 		conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
	// 		staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' }, silverCoins: { tier: 'MODERATE', type: 'REWARD' } },
	// 		procGen: { items: [{ category: 'Animal', entityClass: 'Domestic', rankModifier: 0, count: 1 }] },
	// 		onEncounter: null,
	// 		choices: null,
	// 	},
	// 	// ==========================================
	// 	// TEST 4: DEE - STATIC PAYLOAD ONLY
	// 	// ==========================================
	// 	{
	// 		id: 'evt_test_dee_static',
	// 		name: 'Test DEE: Static Modifiers',
	// 		description: 'A stranger offers you a blessing or a curse. No items are involved.',
	// 		typology: 'SocialEncounter',
	// 		eventType: 'NEGATIVE',
	// 		conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
	// 		staticEffects: null,
	// 		procGen: null,
	// 		onEncounter: null,
	// 		choices: [
	// 			{
	// 				id: 'ch_static_blessing',
	// 				label: 'Accept the blessing',
	// 				checkType: 'GENERAL',
	// 				onSuccess: { description: 'You feel invigorated.', apMod: { tier: 'MODERATE', type: 'REWARD' }, hpMod: { tier: 'MINOR', type: 'REWARD' } },
	// 			},
	// 			{
	// 				id: 'ch_static_curse',
	// 				label: 'Provoke the stranger',
	// 				checkType: 'GENERAL',
	// 				onSuccess: {
	// 					description: 'The stranger curses you before vanishing.',
	// 					apMod: { tier: 'MINOR', type: 'PENALTY' },
	// 					hpMod: { tier: 'MODERATE', type: 'PENALTY' },
	// 				},
	// 			},
	// 		],
	// 	},

	// 	// ==========================================
	// 	// TEST 5: DEE - PROCEDURAL GENERATION ONLY
	// 	// ==========================================
	// 	{
	// 		id: 'evt_test_dee_procgen',
	// 		name: 'Test DEE: Procedural Generation',
	// 		description: 'You find a locked chest embedded in the rocks. Your vitals will not be affected.',
	// 		typology: 'Discovery',
	// 		eventType: 'NEGATIVE',
	// 		conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
	// 		staticEffects: null,
	// 		procGen: null,
	// 		onEncounter: null,
	// 		choices: [
	// 			{
	// 				id: 'ch_procgen_open',
	// 				label: 'Pick the lock',
	// 				checkType: 'SKILL_CHECK',
	// 				attribute: 'agi',
	// 				difficultyModifier: 0,
	// 				onSuccess: {
	// 					description: 'The lock clicks open, revealing physical equipment.',
	// 					procGen: {
	// 						items: [
	// 							{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 },
	// 							{ category: 'Physical', itemClass: 'Armour', tierModifier: 0, count: 1 },
	// 						],
	// 					},
	// 				},
	// 				onFailure: {
	// 					description: 'The lock breaks. You only salvage some basic loot scattered nearby.',
	// 					procGen: { items: [{ category: 'Loot', count: 3 }] },
	// 				},
	// 			},
	// 		],
	// 	},

	// 	// ==========================================
	// 	// TEST 6: DEE - HYBRID (STATIC + PROCGEN)
	// 	// ==========================================
	// 	{
	// 		id: 'evt_test_dee_hybrid',
	// 		name: 'Test DEE: Hybrid Effects',
	// 		description: 'A mercenary offers to sell you a tamed beast. This requires a transaction.',
	// 		typology: 'SocialEncounter',
	// 		eventType: 'NEGATIVE',
	// 		conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
	// 		staticEffects: null,
	// 		procGen: null,
	// 		onEncounter: null,
	// 		choices: [
	// 			{
	// 				id: 'ch_hybrid_trade',
	// 				label: 'Purchase the beast',
	// 				checkType: 'TRADE_OFF',
	// 				cost: { silverCoins: 50 },
	// 				onSuccess: {
	// 					description: 'You hand over the silver and receive the animal, gaining honor in the process.',
	// 					honor: { tier: 'MINOR', type: 'REWARD' },
	// 					procGen: { items: [{ category: 'Animal', entityClass: 'Mount', rankModifier: 1, count: 1 }] },
	// 				},
	// 			},
	// 			{
	// 				id: 'ch_hybrid_ignore',
	// 				label: 'Decline the offer',
	// 				checkType: 'GENERAL',
	// 				onSuccess: { description: 'You walk away, keeping your coins but gaining nothing.', honor: { tier: 'MINOR', type: 'PENALTY' } },
	// 			},
	// 		],
	// 	},
	// ],
};
