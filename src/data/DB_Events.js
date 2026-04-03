// File: Client/src/data/DB_Events.js
// Description: Master database for all narrative events (SEE & DEE) - Flattened & Tag-based.

export const DB_EVENTS = {
	events: [
		// ========================================================================
		// COMBAT ENCOUNTERS
		// ========================================================================
		{
			id: 'evt_cbt_001',
			name: 'Cutthroat Ambush',
			description: 'A gang of desperate cutthroats blocks your path. They have no interest in talking—only your blood and silver.',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			// NOU: Apare și pe drum, și când explorezi
			conditions: { weight: 80, allowedZoneClasses: ['WILD', 'EDGE'], allowedTriggers: ['travel', 'explore'] },
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Outlaw'], rankModifier: 0 } },
			choices: [
				{
					id: 'cbt_001_fight',
					label: 'Fight for your life',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: { honor: 2, renown: 10, silverCoins: 25, procGen: { items: [{ category: 'Consumable', maxTier: 1, count: 1 }] } },
					onFailure: { honor: -5 },
				},
				{
					id: 'cbt_001_flee',
					label: 'Try to break through and run',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: { description: 'You barely dodge their blades and escape.' },
					onFailure: { hpMod: -25, silverCoins: -15, description: 'They slash you as you run, taking some of your coin!' },
				},
			],
		},
		{
			id: 'evt_cbt_002',
			name: 'Starving Predators',
			description: 'The smell of your rations has attracted a pack of starving beasts. They surround you, feral and drooling.',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			conditions: { weight: 70, allowedZoneClasses: ['WILD', 'ORBIT'], allowedTriggers: ['travel', 'explore', 'endturn'] }, // Poate ataca și tabăra noaptea
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_ANIMAL', entityClass: 'Wild', rankModifier: 0 } },
			choices: [
				{
					id: 'cbt_002_fight',
					label: 'Slay the beasts',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: { renown: 5, food: 3 },
					onFailure: { honor: -2 },
				},
				{
					id: 'cbt_002_feed',
					label: 'Drop food to distract them',
					checkType: 'TRADE_OFF',
					cost: { food: 5 },
					onSuccess: { description: 'The beasts fight over the scraps while you slip away.' },
				},
			],
		},

		// ========================================================================
		// SOCIAL & DISCOVERY ENCOUNTERS
		// ========================================================================
		{
			id: 'evt_soc_001',
			name: 'The Shady Peddler',
			description: 'A cloaked figure whistles at you from the shadows. "Got some goods that fell off a caravan. Cheap. You buying?"',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			conditions: { weight: 60, allowedZoneCategories: ['CIVILIZED'], allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			choices: [
				{
					id: 'soc_001_buy',
					label: 'Buy the illegal goods',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 40 },
					onSuccess: { honor: -2, healingPotions: 1, food: 5, description: 'You bought stolen supplies. Cheap, but dishonorable.' },
				},
				{
					id: 'soc_001_report',
					label: 'Threaten to report them',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: { honor: 5, silverCoins: 15, description: 'They bribe you to keep your mouth shut.' },
					onFailure: { hpMod: -10, description: 'They pull a knife, slash your arm, and vanish.' },
				},
			],
		},
		{
			id: 'evt_dsc_001',
			name: 'The Unmarked Grave',
			description: 'You find a shallow grave. Something shiny catches your eye in the dirt.',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			conditions: { weight: 60, allowedZoneClasses: ['WILD', 'EDGE', 'ORBIT'], allowedTriggers: ['explore', 'endturn'] }, // Are sens DOAR la explorare activă
			staticEffects: null,
			choices: [
				{
					id: 'dsc_001_dig',
					label: 'Dig it up',
					checkType: 'LUCK_CHECK',
					successChance: 70,
					onSuccess: { honor: -5, silverCoins: 35, description: 'You rob the dead. It pays well.' },
					onFailure: { hpMod: -10, honor: -5, description: 'A hidden trap triggers! You take damage and find nothing.' },
				},
				{
					id: 'dsc_001_respect',
					label: 'Pay your respects',
					checkType: 'LUCK_CHECK',
					successChance: 100,
					onSuccess: { honor: 5, description: 'You leave the dead in peace.' },
				},
			],
		},

		// ========================================================================
		// HAZARDS & LORE
		// ========================================================================
		{
			id: 'evt_haz_001',
			name: 'The Iron Gale',
			description: 'A terrifying storm of razor-sharp iron shards blows in from the Orbit mountains.',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			conditions: { weight: 80, allowedZoneClasses: ['ORBIT', 'EDGE', 'WILD'], allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			choices: [
				{
					id: 'haz_001_shelter',
					label: 'Find shelter immediately',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: { apMod: -1, description: 'You lose time, but survive the storm unscathed.' },
					onFailure: { hpMod: -35, apMod: -1, description: 'The shards tear into you before you find cover!' },
				},
				{
					id: 'haz_001_endure',
					label: 'Endure and push through',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 2,
					onSuccess: { hpMod: -10, description: 'You march through the pain.' },
					onFailure: { hpMod: -45, description: 'You are shredded by the gale!' },
				},
			],
		},
		{
			id: 'evt_mon_002',
			name: 'Rats in the Rations',
			description: 'You awake to the sound of scurrying. Rats have gotten into your supplies overnight, ruining some of your food.',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			// NOU: Acesta are sens doar noaptea, când schimbi luna.
			conditions: { weight: 50, allowedTriggers: ['endturn'] },
			staticEffects: { food: -5, hpMod: 0 },
			choices: null,
		},
	],
};
