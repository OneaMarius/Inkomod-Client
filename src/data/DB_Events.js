// File: Client/src/data/DB_Events.js
// Description: Master database of active game events.

export const DB_EVENTS = {
	events: [
		// ==========================================
		// TYPOLOGY 1: COMBAT ENCOUNTERS (3)
		// ==========================================
		{
			id: 'evt_com_001',
			name: 'Highway Robbers',
			description: 'A group of outlaws blocks the path, weapons drawn. They demand a toll for safe passage.',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Outlaw'], subclasses: [], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_com_001_fight',
					label: 'Refuse and engage in combat',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						renown: { tier: 'MINOR', type: 'REWARD' },
						silverCoins: { tier: 'MODERATE', type: 'REWARD' },
						procGen: { items: [{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 }] },
						description: 'You dispatch the threat and collect their ill-gotten gains.',
					},
					onFailure: { honor: { tier: 'MINOR', type: 'PENALTY' } },
				},
				{
					id: 'ch_com_001_pay',
					label: 'Pay the toll to avoid bloodshed',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 50 },
					onSuccess: { honor: { tier: 'MINOR', type: 'PENALTY' }, description: 'You hand over the coins. They sneer but let you pass.' },
				},
			],
		},
		{
			id: 'evt_com_002',
			name: 'Feral Pack',
			description: 'The undergrowth rustles violently before a starving, rabid beast leaps toward you.',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore'], allowedZoneCategories: ['UNTAMED'] },
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_ANIMAL', categories: ['Animal'], classes: ['Wild'], subclasses: [], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_com_002_fight',
					label: 'Defend yourself',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: { food: { tier: 'MODERATE', type: 'REWARD' }, description: 'You slay the beast and butcher it for meat.' },
					onFailure: { renown: { tier: 'MINOR', type: 'PENALTY' } },
				},
				{
					id: 'ch_com_002_flee',
					label: 'Attempt to outrun the beast',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: { apMod: { tier: 'MINOR', type: 'PENALTY' }, description: 'You manage to lose the beast, but the sprint exhausts you.' },
					onFailure: {
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						description: 'The beast catches your ankle, tearing flesh before you manage to kick it away and escape.',
					},
				},
			],
		},
		{
			id: 'evt_com_003',
			name: 'Awakened Dead',
			description: 'You step into an ancient burial ground. The soil shifts, and an undead horror rises to claim the living.',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_MONSTER', categories: ['Monster'], classes: ['Undead'], subclasses: [], rankModifier: 1 } },
			choices: [
				{
					id: 'ch_com_003_fight',
					label: 'Purge the abomination',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						honor: { tier: 'MODERATE', type: 'REWARD' },
						renown: { tier: 'MODERATE', type: 'REWARD' },
						procGen: { items: [{ category: 'Loot', count: 2 }] },
						description: 'You return the creature to the earth and salvage ancient relics from the soil.',
					},
					onFailure: { honor: { tier: 'MODERATE', type: 'PENALTY' } },
				},
			],
		},

		// ==========================================
		// TYPOLOGY 2: SOCIAL ENCOUNTERS (3)
		// ==========================================
		{
			id: 'evt_soc_001',
			name: 'Wandering Merchant',
			description: 'A traveling peddler offers access to exotic goods, provided you have the silver.',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Civilian'], subclasses: ['Peddler'], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_soc_001_trade',
					label: 'Purchase medical supplies',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 75 },
					onSuccess: { healingPotions: { tier: 'MODERATE', type: 'REWARD' }, description: 'You acquire several vials of potent healing liquid.' },
				},
				{
					id: 'ch_soc_001_ignore',
					label: 'Decline and continue your journey',
					checkType: 'GENERAL',
					onSuccess: { description: 'You nod respectfully and part ways.' },
				},
			],
		},
		{
			id: 'evt_soc_002',
			name: 'Starving Pilgrim',
			description: 'You encounter a ragged pilgrim who collapsed by the roadside. They beg for food.',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_soc_002_help',
					label: 'Share your rations',
					checkType: 'TRADE_OFF',
					cost: { food: 3 },
					onSuccess: { honor: { tier: 'MODERATE', type: 'REWARD' }, description: 'The pilgrim blesses you. Your honor is bolstered.' },
				},
				{
					id: 'ch_soc_002_rob',
					label: 'Intimidate and rob them',
					checkType: 'GENERAL',
					onSuccess: {
						honor: { tier: 'MAJOR', type: 'PENALTY' },
						silverCoins: { tier: 'MINOR', type: 'REWARD' },
						description: 'You take what little they have left. A cruel, but profitable act.',
					},
				},
				{
					id: 'ch_soc_002_leave',
					label: 'Ignore them',
					checkType: 'GENERAL',
					onSuccess: { honor: { tier: 'MINOR', type: 'PENALTY' }, description: 'You turn a blind eye to their suffering.' },
				},
			],
		},
		{
			id: 'evt_soc_003',
			name: 'Mercenary Camp',
			description: 'You stumble upon a camp of hardened mercenaries. They seem skeptical of your presence.',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			conditions: { weight: 100, allowedTriggers: ['explore'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_soc_003_impress',
					label: 'Display your strength to earn their respect',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 1,
					onSuccess: {
						renown: { tier: 'MODERATE', type: 'REWARD' },
						food: { tier: 'MODERATE', type: 'REWARD' },
						description: 'Impressed by your physique, they share their meal and tales.',
					},
					onFailure: {
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						description: 'They mock your weakness and throw rocks as you are chased out of the camp.',
					},
				},
				{
					id: 'ch_soc_003_leave',
					label: 'Quietly back away',
					checkType: 'GENERAL',
					onSuccess: { description: 'You leave before drawing unwanted attention.' },
				},
			],
		},

		// ==========================================
		// TYPOLOGY 3: DISCOVERIES (3)
		// ==========================================
		{
			id: 'evt_dis_001',
			name: 'Abandoned Cart',
			description: 'A ruined merchant cart sits off the path. It has been picked over, but a locked strongbox remains.',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_dis_001_open',
					label: 'Attempt to force the lock',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						silverCoins: { tier: 'MODERATE', type: 'REWARD' },
						procGen: { items: [{ category: 'Physical', itemClass: 'Armour', tierModifier: 0, count: 1 }] },
						description: 'The lock shatters, revealing hidden valuables inside.',
					},
					onFailure: { apMod: { tier: 'MINOR', type: 'PENALTY' }, description: 'The lock holds firm. You waste precious time and energy.' },
				},
				{
					id: 'ch_dis_001_search',
					label: 'Search the surrounding debris',
					checkType: 'LUCK_CHECK',
					successChance: 60,
					onSuccess: {
						procGen: { items: [{ category: 'Loot', count: 3 }] },
						description: 'You find some scattered items overlooked by previous scavengers.',
					},
					onFailure: { description: 'You find nothing but splintered wood and torn cloth.' },
				},
			],
		},
		{
			id: 'evt_dis_002',
			name: 'Wild Stallion',
			description: 'A magnificent, untamed horse is grazing in a nearby clearing. It seems cautious but calm.',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			conditions: { weight: 100, allowedTriggers: ['explore'], allowedZoneCategories: ['UNTAMED'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_dis_002_tame',
					label: 'Approach slowly and attempt to tame it',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						procGen: { items: [{ category: 'Animal', entityClass: 'Mount', rankModifier: 1, count: 1 }] },
						description: 'With a steady hand, you calm the beast and attach a makeshift halter.',
					},
					onFailure: { hpMod: { tier: 'MINOR', type: 'PENALTY' }, description: 'The horse panics, kicking you in the chest before galloping away.' },
				},
				{
					id: 'ch_dis_002_ignore',
					label: 'Leave the animal in peace',
					checkType: 'GENERAL',
					onSuccess: { description: 'You watch it graze for a moment before moving on.' },
				},
			],
		},
		{
			id: 'evt_dis_003',
			name: 'Ancient Shrine',
			description: 'You uncover a weathered stone shrine dedicated to a forgotten deity. The inscription is barely legible.',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			conditions: { weight: 100, allowedTriggers: ['explore'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_dis_003_read',
					label: 'Decipher the ancient text',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						honor: { tier: 'MODERATE', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
						description: 'You understand the ancient wisdom, bringing a sense of clarity to your mind.',
					},
					onFailure: { apMod: { tier: 'MINOR', type: 'PENALTY' }, description: 'The text makes no sense. The intense focus leaves you with a headache.' },
				},
				{
					id: 'ch_dis_003_offer',
					label: 'Leave an offering',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 25 },
					onSuccess: {
						healingPotions: { tier: 'MINOR', type: 'REWARD' },
						description: 'As you place the coins, you notice a small vial hidden in a niche of the shrine.',
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY 4: HAZARDS (3)
		// ==========================================
		{
			id: 'evt_haz_001',
			name: 'Sudden Downpour',
			description: 'A violent storm rolls in unexpectedly, soaking your gear, ruining some supplies, and slowing your progress.',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' }, food: { tier: 'MINOR', type: 'PENALTY' }, hpMod: { tier: 'MINOR', type: 'PENALTY' } },
			choices: null,
		},
		{
			id: 'evt_haz_002',
			name: 'Rockslide',
			description: 'The unstable terrain shifts beneath your feet. Rocks and debris begin cascading down the slope toward you.',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			conditions: { weight: 100, allowedTriggers: ['travel'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_haz_002_dodge',
					label: 'Dive out of the way',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: {
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						description: 'You narrowly avoid the falling boulders, though the exertion drains you.',
					},
					onFailure: { hpMod: { tier: 'MODERATE', type: 'PENALTY' }, description: 'A heavy rock strikes you before you can clear the danger zone.' },
				},
			],
		},
		{
			id: 'evt_haz_003',
			name: 'Spoiled Rations',
			description: 'You open your pack to find that moisture has seeped into your food supplies. Some of it looks questionable.',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			conditions: { weight: 100, allowedTriggers: ['explore', 'endturn'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_haz_003_discard',
					label: 'Throw away the ruined food',
					checkType: 'GENERAL',
					onSuccess: {
						food: { tier: 'MODERATE', type: 'PENALTY' },
						description: 'You discard the rot, ensuring your safety at the cost of your stomach.',
					},
				},
				{
					id: 'ch_haz_003_eat',
					label: 'Risk eating it anyway',
					checkType: 'LUCK_CHECK',
					successChance: 30,
					onSuccess: { description: 'It tastes awful, but you suffer no ill effects. You manage to save the rations.' },
					onFailure: {
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						description: 'Severe food poisoning takes hold, wracking your body with pain and fatigue.',
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY 5: GENERAL (3)
		// ==========================================
		{
			id: 'evt_gen_001',
			name: 'A Moment of Peace',
			description: 'You find a quiet, secure spot. The weather is fair, and you have a brief opportunity to rest and recover your strength.',
			typology: 'General',
			eventType: 'POSITIVE',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'REWARD' }, hpMod: { tier: 'MINOR', type: 'REWARD' } },
			choices: null,
		},
		{
			id: 'evt_gen_002',
			name: 'Ominous Signs',
			description: 'The local wildlife is dead quiet. Broken branches and strange tracks put you on edge, making progress slow and stressful.',
			typology: 'General',
			eventType: 'NEGATIVE',
			conditions: { weight: 100, allowedTriggers: ['travel', 'explore'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' } },
			choices: null,
		},
		{
			id: 'evt_gen_003',
			name: 'Stray Domestic Animal',
			description: 'A lone, domesticated animal wanders across your path. It appears lost and has no owner in sight.',
			typology: 'General',
			eventType: 'NEUTRAL',
			conditions: { weight: 100, allowedTriggers: ['explore'] },
			staticEffects: null,
			choices: [
				{
					id: 'ch_gen_003_take',
					label: 'Take the animal for yourself',
					checkType: 'GENERAL',
					onSuccess: {
						procGen: { items: [{ category: 'Animal', entityClass: 'Domestic', rankModifier: 0, count: 1 }] },
						description: 'You coax the animal into following you.',
					},
				},
				{
					id: 'ch_gen_003_leave',
					label: 'Leave it be',
					checkType: 'GENERAL',
					onSuccess: { honor: { tier: 'MINOR', type: 'REWARD' }, description: 'You let the animal go, hoping it finds its way back to its master.' },
				},
			],
		},
	],
};
