// File: Client/src/data/DB_Events.js
// Description: Master database of active game events.

export const DB_EVENTS = {
	events: [
		{
			id: 'evt_test_see_static',
			name: 'Test SEE: Static Modifiers',
			description: 'A sudden chill drains your energy and damages your health. No items are found.',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			conditions: { weight: 50, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { hpMod: { tier: 'MINOR', type: 'PENALTY' }, apMod: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},

		// ==========================================
		// TEST 2: PROCEDURAL GENERATION ONLY
		// ==========================================
		{
			id: 'evt_test_see_procgen',
			name: 'Test SEE: Procedural Generation',
			description: 'You stumble upon an unguarded supply cache. There are no immediate effects on your vitals, but you acquire items.',
			typology: 'Discovery',
			eventType: 'NEGATIVE',
			conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			procGen: {
				items: [
					{ category: 'Loot', count: 2 },
					{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 },
				],
			},
			onEncounter: null,
			choices: null,
		},

		// ==========================================
		// TEST 3: HYBRID (STATIC + PROCGEN)
		// ==========================================
		{
			id: 'evt_test_see_hybrid',
			name: 'Test SEE: Hybrid Effects',
			description: 'You find a stray domestic animal carrying a small pouch of silver. Tracking it down slightly drains your stamina.',
			typology: 'Discovery',
			eventType: 'NEGATIVE',
			conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' }, silverCoins: { tier: 'MODERATE', type: 'REWARD' } },
			procGen: { items: [{ category: 'Animal', entityClass: 'Domestic', rankModifier: 0, count: 1 }] },
			onEncounter: null,
			choices: null,
		},
		// ==========================================
		// TEST 4: DEE - STATIC PAYLOAD ONLY
		// ==========================================
		{
			id: 'evt_test_dee_static',
			name: 'Test DEE: Static Modifiers',
			description: 'A stranger offers you a blessing or a curse. No items are involved.',
			typology: 'SocialEncounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_static_blessing',
					label: 'Accept the blessing',
					checkType: 'GENERAL',
					onSuccess: { description: 'You feel invigorated.', apMod: { tier: 'MODERATE', type: 'REWARD' }, hpMod: { tier: 'MINOR', type: 'REWARD' } },
				},
				{
					id: 'ch_static_curse',
					label: 'Provoke the stranger',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'The stranger curses you before vanishing.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TEST 5: DEE - PROCEDURAL GENERATION ONLY
		// ==========================================
		{
			id: 'evt_test_dee_procgen',
			name: 'Test DEE: Procedural Generation',
			description: 'You find a locked chest embedded in the rocks. Your vitals will not be affected.',
			typology: 'Discovery',
			eventType: 'NEGATIVE',
			conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_procgen_open',
					label: 'Pick the lock',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: {
						description: 'The lock clicks open, revealing physical equipment.',
						procGen: {
							items: [
								{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 },
								{ category: 'Physical', itemClass: 'Armour', tierModifier: 0, count: 1 },
							],
						},
					},
					onFailure: {
						description: 'The lock breaks. You only salvage some basic loot scattered nearby.',
						procGen: { items: [{ category: 'Loot', count: 3 }] },
					},
				},
			],
		},

		// ==========================================
		// TEST 6: DEE - HYBRID (STATIC + PROCGEN)
		// ==========================================
		{
			id: 'evt_test_dee_hybrid',
			name: 'Test DEE: Hybrid Effects',
			description: 'A mercenary offers to sell you a tamed beast. This requires a transaction.',
			typology: 'SocialEncounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 50, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_hybrid_trade',
					label: 'Purchase the beast',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 50 },
					onSuccess: {
						description: 'You hand over the silver and receive the animal, gaining honor in the process.',
						honor: { tier: 'MINOR', type: 'REWARD' },
						procGen: { items: [{ category: 'Animal', entityClass: 'Mount', rankModifier: 1, count: 1 }] },
					},
				},
				{
					id: 'ch_hybrid_ignore',
					label: 'Decline the offer',
					checkType: 'GENERAL',
					onSuccess: { description: 'You walk away, keeping your coins but gaining nothing.', honor: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
	],
};
