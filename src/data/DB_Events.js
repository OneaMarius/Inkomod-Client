// File: Client/src/data/DB_Events.js
// Description: Master database of active game events.
// ========================================================================
// EVENT TAXONOMY & REFERENCE GUIDE
// ========================================================================
// Use this object as a reference when constructing new narrative events.
// It defines all valid keys, parameters, and constraints expected by ENGINE_Events.js.

export const DB_EVENTS_TAXONOMY = {
	eventTypes: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
	typologies: [
		'CombatEncounter',
		'SocialEncounter',
		'Discovery',
		'Hazard',
		'General',
	],

	conditions: {
		allowedTriggers: [
			'travel',
			'explore',
			'endturn',
			'hunt_success',
			'hunt_ambush',
		],
		allowedSeasons: ['spring', 'summer', 'autumn', 'winter'],
		// Use 'allowedZoneCategories' for broad Civilized/Untamed logic
		allowedZoneCategories: ['CIVILIZED', 'UNTAMED'],
		// Use 'allowedZoneSubclasses' for mixed or specific locations (e.g., ['Wild', 'Village'])
		// If using specific subclasses across categories, omit 'allowedZoneCategories' to avoid conflicts.
		allowedZoneSubclasses: [
			'Village',
			'Town',
			'City',
			'Castle',
			'Palace',
			'Orbit',
			'Wild',
			'Edge',
		],
	},

	payloadAttributes: [
		'apMod',
		'hpMod', // Vitals
		'str',
		'agi',
		'int', // Stats
		'silverCoins',
		'tradeSilver',
		'tradeGold', // Economy
		'food',
		'healingPotions', // Logistics
		'honor',
		'renown', // Morality & Social
	],

	choiceCheckTypes: [
		'GENERAL',
		'TRADE_OFF',
		'LUCK_CHECK',
		'SKILL_CHECK',
		'COMBAT',
		'STANDARD_INTERACTION',
	],

	procGenTypes: {
		npc: {
			type: ['NPC_HUMAN', 'NPC_MONSTER', 'NPC_ANIMAL', 'NPC_NEPHILIM'],
			categories: ['Human', 'Animal', 'Monster', 'Nephilim'],
			classes: [
				// Human
				'Production',
				'Trade',
				'Resources',
				'Transport',
				'Service',
				'Administration',
				'Knowledge',
				'Society',
				'Outlaw',
				'Military',
				'Religion',
				// Animal
				'Mount',
				'Domestic',
				'Wild',
				'WildFriendly',
				'WildHostile',
				// Monster
				'Beast',
				'Giant',
				'Undead',
				'Goblinoid',
				'Elemental',
				'Cursed',
				'Draconid',
				// Nephilim
				'Demigod',
			],
			rankModifier: 0,
		},
		items: {
			category: ['Physical', 'Loot', 'Animal'],
			itemClass: ['Weapon', 'Shield', 'Armor', 'Helmet'],
			entityCategory: ['Human', 'Nephilim', 'Animal', 'Monster'],
			entityClass: [
				'Mount',
				'Domestic',
				'Wild',
				'WildFriendly',
				'WildHostile',
			],
			count: 1,
			tierModifier: 0,
		},
	},
};

// ========================================================================
// EVENT SUMMARY LIST
// ========================================================================
// A structured overview of all events grouped by eventType and typology.

export const EVENT_LIST = {
	POSITIVE: {
		Discovery: [
			{ id: 'evt_hunt_success_001', name: 'The Prey', weight: 100 },
			{ id: 'evt_dis_001', name: 'Abandoned Cart', weight: 60 },
			{ id: 'evt_dis_002', name: 'Forgotten Pouch', weight: 55 },
			{ id: 'evt_dis_003', name: 'Berry Bush', weight: 25 },
			{ id: 'evt_dis_005', name: 'Hidden Cache', weight: 20 },
			{ id: 'evt_dis_007', name: 'Ancient Shrine', weight: 10 },
			{ id: 'evt_dis_008', name: 'Ruined Armory', weight: 25 },
			{ id: 'evt_dis_012', name: 'Stuck Wagon', weight: 50 },
			{ id: 'evt_dis_015', name: 'Overgrown Monolith', weight: 18 },
			{ id: 'evt_dis_016', name: 'Crystal Spring', weight: 35 },
			{ id: 'evt_dis_017', name: 'Buried Lockbox', weight: 25 },
		],
		CombatEncounter: [
			{
				id: 'evt_hunt_success_002',
				name: 'Monstrous Encounter',
				weight: 50,
			},
			{ id: 'evt_cmb_006', name: 'Sparring Match', weight: 50 },
		],
		Hazard: [
			{ id: 'evt_haz_011', name: 'Refreshing Breeze', weight: 50 },
			{ id: 'evt_haz_012', name: 'Salvaged Trap', weight: 50 },
		],
		SocialEncounter: [
			{ id: 'evt_soc_005', name: 'Traveling Entertainer', weight: 55 },
			{ id: 'evt_soc_007', name: 'Wandering Scholar', weight: 30 },
			{ id: 'evt_soc_011', name: 'Devout Pilgrim', weight: 50 },
			{ id: 'evt_soc_013', name: 'Overburdened Herder', weight: 45 },
			{ id: 'evt_soc_014', name: "Noble's Entourage", weight: 40 },
		],
		General: [
			{ id: 'evt_gen_001', name: 'Good Omen', weight: 50 },
			{ id: 'evt_gen_003', name: 'Clear Path', weight: 50 },
			{ id: 'evt_gen_005', name: 'Moment of Clarity', weight: 50 },
			{ id: 'evt_gen_006', name: 'Hidden Shortcut', weight: 50 },
			{ id: 'evt_gen_009', name: 'Country Springs', weight: 50 },
			{ id: 'evt_gen_010', name: 'Spring Thaw', weight: 50 },
			{ id: 'evt_gen_012', name: 'Autumn Harvest', weight: 50 },
		],
	},
	NEUTRAL: {
		Discovery: [
			{ id: 'evt_dis_004', name: "Miner's Skeleton", weight: 40 },
			{ id: 'evt_dis_006', name: 'Stray Mount', weight: 15 },
			{ id: 'evt_dis_009', name: 'Medicinal Herbs', weight: 50 },
			{ id: 'evt_dis_010', name: 'Trapped Chest', weight: 35 },
			{ id: 'evt_dis_011', name: 'Abandoned Campsite', weight: 45 },
			{ id: 'evt_dis_013', name: 'Scorched Crater', weight: 12 },
			{ id: 'evt_dis_014', name: 'Wandering Livestock', weight: 40 },
			{ id: 'evt_dis_020', name: 'Fallen Courier', weight: 30 },
		],
		SocialEncounter: [
			{ id: 'evt_soc_001', name: 'Wandering Artisan', weight: 45 },
			{ id: 'evt_soc_002', name: 'Traveling Merchant', weight: 50 },
			{ id: 'evt_soc_003', name: 'Weary Prospector', weight: 45 },
			{ id: 'evt_soc_004', name: 'Stranded Courier', weight: 50 },
			{ id: 'evt_soc_006', name: 'Roadside Official', weight: 45 },
			{ id: 'evt_soc_008', name: 'Desperate Refugee', weight: 60 },
			{ id: 'evt_soc_010', name: 'Idle Mercenary', weight: 35 },
			{ id: 'evt_soc_012', name: 'Desperate Horse Trader', weight: 35 },
		],
		General: [{ id: 'evt_gen_004', name: 'Broken Wheel', weight: 50 }],
	},
	NEGATIVE: {
		CombatEncounter: [
			{
				id: 'evt_hunt_ambush_001',
				name: 'Hunted by a Wild Animal',
				weight: 100,
			},
			{ id: 'evt_hunt_ambush_002', name: 'Hunted by a Monster', weight: 50 },
			{
				id: 'evt_hunt_ambush_003',
				name: 'Hunted by a Nephilim',
				weight: 25,
			},
			{ id: 'evt_cmb_001', name: 'Highwaymen Ambush', weight: 50 },
			{ id: 'evt_cmb_002', name: 'Frenzied Wild Animal', weight: 60 },
			{ id: 'evt_cmb_003', name: 'Goblinoid Scouting Party', weight: 50 },
			{ id: 'evt_cmb_004', name: 'Wandering Giant', weight: 30 },
			{ id: 'evt_cmb_005', name: 'Desperate Outlaws', weight: 50 },
			{ id: 'evt_cmb_007', name: 'Undead Ambusher', weight: 50 },
			{ id: 'evt_cmb_008', name: 'Ruthless Thug', weight: 50 },
			{ id: 'evt_cmb_009', name: 'Corrupted Beast', weight: 40 },
			{ id: 'evt_cmb_010', name: 'Deserter Patrol', weight: 45 },
			{ id: 'evt_cmb_011', name: 'Draconid Predator', weight: 30 },
			{ id: 'evt_cmb_012', name: 'Crazed Cultists', weight: 45 },
			{ id: 'evt_cmb_013', name: 'Feral Nephilim', weight: 20 },
			{ id: 'evt_cmb_014', name: 'Cursed Abomination', weight: 40 },
			{ id: 'evt_cmb_015', name: 'Elemental Guardian', weight: 35 },
		],
		Hazard: [
			{ id: 'evt_haz_001', name: 'Sudden Storm', weight: 60 },
			{ id: 'evt_haz_002', name: 'Spoiled Rations', weight: 50 },
			{ id: 'evt_haz_003', name: 'Torn Pouch', weight: 50 },
			{ id: 'evt_haz_004', name: 'Toxic Spores', weight: 50 },
			{ id: 'evt_haz_005', name: 'Rockslide', weight: 50 },
			{ id: 'evt_haz_006', name: 'The Mist', weight: 50 },
			{ id: 'evt_haz_007', name: 'Contaminated Water', weight: 50 },
			{ id: 'evt_haz_008', name: 'Street Thieves', weight: 50 },
			{ id: 'evt_haz_009', name: 'Biting Frost', weight: 50 },
			{ id: 'evt_haz_010', name: 'Ruptured Seam', weight: 50 },
			{ id: 'evt_haz_013', name: 'Sweltering Heat', weight: 50 },
			{ id: 'evt_haz_014', name: 'Mud Sinkhole', weight: 50 },
			{ id: 'evt_haz_015', name: 'Flash Flood', weight: 40 },
		],
		Discovery: [
			{ id: 'evt_dis_018', name: 'Cursed Effigy', weight: 50 },
			{ id: 'evt_dis_019', name: 'Moldy Cache', weight: 50 },
		],
		SocialEncounter: [
			{ id: 'evt_soc_009', name: 'Suspicious Peddler', weight: 50 },
			{ id: 'evt_soc_015', name: 'Crazed Zealot', weight: 50 },
		],
		General: [
			{ id: 'evt_gen_002', name: 'Uneasy Feeling', weight: 50 },
			{ id: 'evt_gen_007', name: 'Restless Slumber', weight: 50 },
			{ id: 'evt_gen_008', name: 'Snapped Strap', weight: 50 },
			{ id: 'evt_gen_011', name: 'Summer Drought', weight: 50 },
			{ id: 'evt_gen_013', name: 'Winter Blizzard', weight: 50 },
			{ id: 'evt_gen_014', name: 'Urban Congestion', weight: 50 },
			{ id: 'evt_gen_015', name: 'High Altitude Chill', weight: 50 },
		],
	},
};

export const DB_EVENTS = {
	events: [
		// ==========================================
		// HUNTING EVENTS (5 Events)
		// ==========================================

		{
			id: 'evt_hunt_success_001',
			name: 'The Prey',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'You have tracked a magnificent animal to a quiet clearing. It has not noticed your presence yet.',
			conditions: {
				weight: 100,
				minRank: 1,
				allowedTriggers: ['hunt_success'],
				allowedZoneSubclasses: ['Wild', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_ANIMAL',
					categories: ['Animal'],
					classes: ['Wild'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_hunt001_stealth',
					label: 'Aim for a vital spot',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description: 'A perfect strike. The beast falls instantly.',
						food: { type: 'DYNAMIC_YIELD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Animal',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'Your shot goes wide. The animal flees, and your reputation as a hunter takes a hit.',
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt001_luck',
					label: 'Desperate throw',
					checkType: 'LUCK_CHECK',
					successChance: 25,
					onSuccess: {
						description: 'By pure luck, your weapon finds its mark.',
						food: { type: 'DYNAMIC_YIELD' },
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Animal',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The weapon strikes a tree. Local trackers laugh at your incompetence.',
						renown: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt001_leave',
					label: 'Lower your weapon',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You decide to spare the creature, finding peace in the moment.',
						honor: 1,
					},
				},
			],
		},
		{
			id: 'evt_hunt_success_002',
			name: 'Monstrous Encounter',
			typology: 'CombatEncounter',
			eventType: 'POSITIVE',
			description:
				'You followed a set of strange, heavy tracks to a clearing. Instead of standard game, you have successfully tracked a monster that is currently unaware of your presence.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['hunt_success'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: [],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_hunt002_stealth',
					label: 'Attempt a stealth assassination',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 2,
					onSuccess: {
						description:
							'You strike a vital weak point before the monster can react, killing it instantly.',
						food: { type: 'DYNAMIC_YIELD' },
						renown: { tier: 'MODERATE', type: 'REWARD' },
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 2,
								},
							],
						},
					},
					onFailure: {
						description:
							'Your strike fails to kill it. The monster retaliates, injuring you before it escapes.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt002_fight',
					label: 'Charge into battle',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You overpower the monstrous prey after a fierce fight.',
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The monster proves too strong. You are forced to retreat with severe injuries.',
						hpMod: { tier: 'MAJOR', type: 'PENALTY' },
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt002_leave',
					label: 'Back away silently',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You decide this hunt is too dangerous and quietly leave the area.',
						apMod: { tier: 'MINOR', type: 'REWARD' },
					},
				},
			],
		},
		{
			id: 'evt_hunt_success_003_nephilim',
			name: 'A Shadow of the Gods',
			typology: 'CombatEncounter',
			eventType: 'POSITIVE',
			description:
				'You followed a trail of scorched earth and corrupted vegetation to a desolate clearing. You have tracked down a Nephilim, a terrifying Demigod of the old world.',
			conditions: {
				weight: 15,
				minRank: 2,
				allowedTriggers: ['hunt_success'],
				allowedZoneSubclasses: ['Edge'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_NEPHILIM',
					categories: ['Nephilim'],
					classes: ['Demigod'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_hunt003_fight',
					label: 'Challenge the Demigod',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'Against all odds, you stand victorious over the fallen Demigod. You sever its head as proof of your triumph.',
						renown: { tier: 'MAJOR', type: 'REWARD' },
						honor: { tier: 'MODERATE', type: 'REWARD' },
						procGen: { items: [{ category: 'Trophy', count: 1 }] },
					},
					onFailure: {
						description:
							'The Demigod proves too strong. You are forced to retreat with life-threatening injuries.',
						hpMod: { tier: 'CRITICAL', type: 'PENALTY' },
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt003_observe',
					label: 'Observe and pillage its hoard',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 3,
					onSuccess: {
						description:
							'You remain hidden, studying its movements to sharpen your mind, while silently stealing from its gathered hoard.',
						int: { tier: 'MINOR', type: 'REWARD' },
						tradeSilver: { tier: 'MODERATE', type: 'REWARD' },
						tradeGold: { tier: 'MINOR', type: 'REWARD' },
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'You make a sound. The Demigod discovers your position, destroying your supplies and battering you before you escape.',
						hpMod: { tier: 'MAJOR', type: 'PENALTY' },
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						food: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt003_leave',
					label: 'Flee for your life',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You decide this hunt is suicidal and quietly back away before it notices you.',
						apMod: { tier: 'MINOR', type: 'REWARD' },
					},
				},
			],
		},
		{
			id: 'evt_hunt_ambush_001',
			name: 'Hunted by a Wild Animal',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A large, territorial wild animal charges at you from the undergrowth, defending its hunting grounds.',
			conditions: {
				weight: 100,
				minRank: 1,
				allowedTriggers: ['hunt_ambush'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_ANIMAL',
					categories: ['Animal'],
					classes: ['WildHostile'],
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_huntambush001_evade',
					label: 'Climb a tree',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You scramble up a trunk just in time, but sustain minor scrapes. The animal loses interest and leaves.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						agi: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You slip, taking moderate damage and dropping some supplies as you scramble away in panic.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_huntambush001_fight',
					label: 'Fight the animal',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You subdue the aggressive animal and harvest its meat.',
						str: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You are forced to flee the fight, dropping coins and damaging your reputation as you escape.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_huntambush001_intimidate',
					label: 'Stand tall and shout',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'The animal halts, intimidated by your size, and retreats.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'Your attempt fails to scare it off. It strikes you before you run, losing items in the process.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_hunt_ambush_002',
			name: 'Hunted by a Monster',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'The roles have reversed. A monstrous predator was tracking you while you were focused on your prey.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['hunt_ambush'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: [],
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_huntambush002_evade',
					label: 'Defensive scramble',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 2,
					onSuccess: {
						description:
							'You roll through the brush, breaking line of sight through sheer agility, suffering only minor injuries.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						agi: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MODERATE', type: 'REWARD' },
					},
					onFailure: {
						description:
							'The monster chases you down. You narrowly escape after taking a moderate beating, losing significant supplies.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_huntambush002_fight',
					label: 'Face the threat',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You stood your ground and slew the beast in a brutal struggle.',
						str: { tier: 'MINOR', type: 'REWARD' },
						food: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'The monster overpowers you. You retreat in disgrace, leaving your food behind.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_huntambush002_luck',
					label: 'Play dead',
					checkType: 'LUCK_CHECK',
					successChance: 25,
					onSuccess: {
						description:
							'The predator sniffs you and loses interest, moving back into the shadows. The tension exhausts you.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'It does not fall for the ruse and mauls you. You run for your life, dropping your provisions.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_hunt_ambush_003',
			name: 'Hunted by a Nephilim',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'The air grows cold. A Nephilim entity has sensed your presence in these forbidden outer edges and descends upon you.',
			conditions: {
				weight: 25,
				minRank: 1,
				allowedTriggers: ['hunt_ambush'],
				allowedZoneSubclasses: ['Edge'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_NEPHILIM',
					categories: ['Nephilim'],
					classes: [],
					rankModifier: 2,
				},
			},
			choices: [
				{
					id: 'ch_huntambush003_resist',
					label: 'Resist the aura',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 2,
					onSuccess: {
						description:
							'You block its mental intrusion long enough to escape its domain, though the effort leaves physical tolls.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						int: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MAJOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'The entity shatters your focus and inflicts severe trauma. You flee in terror, abandoning your gear.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						hpMod: { tier: 'MAJOR', type: 'PENALTY' },
						food: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_huntambush003_fight',
					label: 'Engage the anomaly',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You managed to banish the entity back to the void.',
						str: { tier: 'MINOR', type: 'REWARD' },
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Nephilim',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The entity utterly breaks your defenses. You barely escape, losing much of your supplies and honor.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						food: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_huntambush003_luck',
					label: 'Blind escape',
					checkType: 'LUCK_CHECK',
					successChance: 15,
					onSuccess: {
						description:
							'You stumble blindly into a sacred grove where the entity cannot follow. The sprint drains you entirely.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You run straight into its path, suffering critical damage. You are forced to flee in panic, dropping everything.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						hpMod: { tier: 'MAJOR', type: 'PENALTY' },
						food: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: HAZARD (15 Events)
		// ==========================================

		{
			id: 'evt_haz_001',
			name: 'Sudden Storm',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'A violent storm rolls in unexpectedly, soaking your gear and turning the path into a muddy slog.',
			conditions: {
				weight: 60,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit', 'Village', 'Town'],
				allowedSeasons: ['spring', 'summer', 'autumn'],
			},
			staticEffects: {
				apMod: { tier: 'MINOR', type: 'PENALTY' },
				hpMod: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_002',
			name: 'Spoiled Rations',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'Intense heat and moisture have allowed mold to ruin a portion of your food supplies.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclass: [
					'Wild',
					'Edge',
					'Orbit',
					'Village',
					'Town',
					'City',
				],
				allowedSeasons: ['summer'],
			},
			staticEffects: { food: { tier: 'MODERATE', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_003',
			name: 'Torn Pouch',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'While pushing through jagged thorns, a pouch on your belt tears open, spilling coins onto the forest floor.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: {
				tradeSilver: { tier: 'MODERATE', type: 'PENALTY' },
				tradeGold: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_004',
			name: 'Toxic Spores',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'You disturb a patch of strange fungi that releases a cloud of noxious, stinging spores.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz004_dodge',
					label: 'Hold breath and dive',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You roll clear of the cloud before inhaling any spores.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'You inhale the bitter dust, feeling your lungs burn.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_haz_005',
			name: 'Rockslide',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'The slope above gives way, sending a cascade of shale and boulders toward your position.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz005_luck',
					label: 'Scramble for cover',
					checkType: 'LUCK_CHECK',
					successChance: 60,
					onSuccess: {
						description:
							'You shield yourself behind a solid outcrop as the debris passes.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'A heavy stone clips you, leaving a painful bruise.',
						hpMod: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_haz_006',
			name: 'The Mist',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'The dense canopy and shifting mists make the terrain look identical in every direction.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz006_nav',
					label: 'Trust your instincts',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You find a familiar landmark and correct your course.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'You wander in circles for hours, exhausting your energy.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_haz_007',
			name: 'Contaminated Water',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'You drank from a well that looked clean, but was tainted by local filth.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'endturn', 'explore'],
				allowedZoneSubclass: ['Village', 'Town', 'Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz007_resist',
					label: 'Fight the nausea',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'Your stomach churns, but you manage to keep moving.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'The sickness takes root, leaving you weak and feverish.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_haz_008',
			name: 'Street Thieves',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'A coordinated group of urchins bumps into you in the crowd, their fingers moving toward your purse.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel'],
				allowedZoneSubclass: ['Village', 'Town', 'City'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz008_spot',
					label: 'Guard your pockets',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You catch a hand in your pouch and shove the thief away.',
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'They disappear into the crowd. Your coin purse is significantly lighter.',
						silverCoins: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_haz_009',
			name: 'Biting Frost',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'A sudden drop in temperature sends an icy wind through your gear, numbing your fingers.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedSeasons: ['winter'],
			},
			staticEffects: {
				hpMod: { tier: 'MINOR', type: 'PENALTY' },
				apMod: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_010',
			name: 'Ruptured Seam',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'The constant motion of travel causes a supply pouch to burst. A glass vial shatters on the stones.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
			},
			staticEffects: { healingPotions: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_011',
			name: 'Refreshing Breeze',
			typology: 'Hazard', // Though positive, it acts as an environmental weather condition
			eventType: 'POSITIVE',
			description:
				'A sudden, cool breeze cuts through the harsh weather, giving you a second wind.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				// Universal weather event
				allowedZoneSubclasses: [
					'Village',
					'Town',
					'City',
					'Castle',
					'Palace',
					'Orbit',
					'Wild',
					'Edge',
				],
			},
			staticEffects: {
				apMod: { tier: 'MINOR', type: 'REWARD' },
				hpMod: { tier: 'MINOR', type: 'REWARD' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_012',
			name: 'Salvaged Trap',
			typology: 'Hazard',
			eventType: 'POSITIVE',
			description:
				'You spot a poorly concealed snare trap before stepping into it.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				// Traps are typically found in hunting grounds or edges of civilization
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz012_dismantle',
					label: 'Dismantle for parts',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You carefully take the trap apart and keep the components.',
						// Updated to target Human entity categories for standard trap parts
						procGen: {
							items: [
								{ category: 'Loot', entityCategory: 'Human', count: 2 },
							],
						},
					},
					onFailure: {
						description:
							'The mechanism snaps, destroying the parts but leaving you unharmed.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_haz012_ignore',
					label: 'Step around it',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You safely bypass the trap without risking your fingers.',
					},
				},
			],
		},
		{
			id: 'evt_haz_013',
			name: 'Sweltering Heat',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'An oppressive wave of heat exhausts you and forces you to consume extra water and food.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				// Universal, but restricted to summer
				allowedZoneSubclasses: [
					'Village',
					'Town',
					'City',
					'Castle',
					'Palace',
					'Orbit',
					'Wild',
					'Edge',
				],
				allowedSeasons: ['summer'],
			},
			staticEffects: {
				apMod: { tier: 'MODERATE', type: 'PENALTY' },
				food: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_014',
			name: 'Mud Sinkhole',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'The ground gives way beneath your feet, plunging you into thick, sucking mud.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				// Untamed and rural areas
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village'],
				// Most common during wet seasons
				allowedSeasons: ['spring', 'autumn'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz014_escape',
					label: 'Struggle out',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 1,
					onSuccess: {
						description: 'You pull yourself free using sheer strength.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'You exhaust yourself escaping and swallow foul water.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_haz_015',
			name: 'Flash Flood',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description:
				'A sudden rush of water surges through the lowlands, threatening to wash away your supplies.',
			conditions: {
				weight: 40,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				// Typically happens in wild areas during rain
				allowedZoneSubclasses: ['Wild', 'Edge'],
				allowedSeasons: ['spring', 'autumn'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz015_secure',
					label: 'Secure your gear',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 2,
					onSuccess: {
						description:
							'You manage to hold your ground and protect your belongings until the water recedes.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'The current is too strong. You are swept away and lose some provisions before scrambling ashore.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_haz015_abandon',
					label: 'Abandon supplies to climb higher',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You prioritize your life, sacrificing some food to reach high ground quickly.',
						food: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: DISCOVERY (20 Events)
		// ==========================================

		{
			id: 'evt_dis_001',
			name: 'Abandoned Cart',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'A merchant cart sits abandoned and partially broken. You salvage some remaining supplies.',
			conditions: {
				weight: 60,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit', 'Village', 'Town'],
			},
			staticEffects: { food: { tier: 'MINOR', type: 'REWARD' } },
			procGen: {
				items: [{ category: 'Loot', entityCategory: 'Human', count: 2 }],
			},
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_002',
			name: 'Forgotten Pouch',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'A weathered leather pouch lies half-buried in the ground, containing a handful of coins.',
			conditions: {
				weight: 55,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: [
					'Village',
					'Town',
					'City',
					'Wild',
					'Edge',
					'Orbit',
				],
			},
			staticEffects: { silverCoins: { tier: 'MODERATE', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_003',
			name: 'Berry Bush',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'You find a bush laden with ripe, sweet berries that are safe for consumption.',
			conditions: {
				weight: 25,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'hunt_success'],
				allowedZoneCategory: ['UNTAMED'],
				allowedSeasons: ['spring', 'summer', 'autumn'],
			},
			staticEffects: {
				food: { tier: 'MINOR', type: 'REWARD' },
				hpMod: { tier: 'MINOR', type: 'REWARD' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_004',
			name: "Miner's Skeleton",
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				'The remains of a prospector hold a small fortune in gold, though looting the dead feels wrong.',
			conditions: {
				weight: 40,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge'],
			},
			staticEffects: {
				tradeGold: { tier: 'MINOR', type: 'REWARD' },
				honor: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_005',
			name: 'Hidden Cache',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'Faded markings on a landmark lead you to a concealed compartment containing a weapon.',
			conditions: {
				weight: 20, // Low weight: high value reward
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit', 'Castle'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis005_search',
					label: 'Retrieve the item',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You successfully unlock the cache and find a sturdy weapon.',
						procGen: {
							items: [
								{
									category: 'Physical',
									itemClass: 'Weapon',
									tierModifier: 0,
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The mechanism jams, and you waste precious time trying to force it.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_dis005_ignore',
					label: 'Walk away',
					checkType: 'GENERAL',
					onSuccess: {
						description: "You decide the risk isn't worth it.",
					},
				},
			],
		},
		{
			id: 'evt_dis_006',
			name: 'Stray Mount',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				"A riderless horse wanders nearby, dragging its reins. It appears to be a well-bred traveler's mount.",
			conditions: {
				weight: 15, // Low weight: very high value
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit', 'Village'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis006_catch',
					label: 'Attempt to tame it',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You calm the beast and secure it. You have gained a new mount.',
						procGen: {
							items: [
								{ category: 'Animal', entityClass: 'Mount', count: 1 },
							],
						},
					},
					onFailure: {
						description:
							'The horse panics and kicks you before galloping away.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_007',
			name: 'Ancient Shrine',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'A forgotten altar to a god of strength stands in a quiet grove, waiting for an offering.',
			conditions: {
				weight: 10, // Very low weight: permanent stat boost
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis007_pray',
					label: 'Offer Silver',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 75 },
					onSuccess: {
						description:
							'A surge of power fills your limbs. You feel permanently stronger.',
						str: { tier: 'MINOR', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_dis007_leave',
					label: 'Respectfully decline',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You leave the shrine undisturbed.',
						apMod: { tier: 'MINOR', type: 'REWARD' },
					},
				},
			],
		},
		{
			id: 'evt_dis_008',
			name: 'Ruined Armory',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'A collapsed tower holds the remains of an old armory. Some equipment might still be usable.',
			conditions: {
				weight: 25,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Castle', 'Town'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis008_search',
					label: 'Search the rubble',
					checkType: 'LUCK_CHECK',
					successChance: 40,
					onSuccess: {
						description:
							'You find a functional piece of armor among the debris.',
						procGen: {
							items: [
								{
									category: 'Physical',
									itemClass: 'Armor',
									tierModifier: 0,
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The rubble shifts dangerously, and you cut your hand on jagged metal.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_009',
			name: 'Medicinal Herbs',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				'A patch of rare herbs grows by the path, known for their restorative properties.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
				allowedSeasons: ['spring', 'summer'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis009_id',
					label: 'Harvest the plants',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You carefully process the herbs into a potent draught.',
						healingPotions: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You damage the delicate leaves, rendering them useless.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_010',
			name: 'Trapped Chest',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				'An ornate chest sits alone, but a subtle wire suggests it is protected by more than just a lock.',
			conditions: {
				weight: 35,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis010_disarm',
					label: 'Disarm and open',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You safely bypass the trap and claim the contents.',
						procGen: {
							items: [
								{ category: 'Loot', entityCategory: 'Human', count: 3 },
							],
						},
					},
					onFailure: {
						description:
							'A poison dart triggers! You are struck in the shoulder.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_011',
			name: 'Abandoned Campsite',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				'A recently used campsite has been left with some useful tools and supplies.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis011_scavenge',
					label: 'Scavenge for loot',
					checkType: 'LUCK_CHECK',
					successChance: 60,
					onSuccess: {
						description: 'You find some valuable components left behind.',
						procGen: {
							items: [
								{ category: 'Loot', entityCategory: 'Human', count: 2 },
							],
						},
					},
					onFailure: {
						description: 'You find nothing but useless junk.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_dis011_rest',
					label: 'Rest in the clearing',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You spend some time recovering your energy.',
						apMod: { tier: 'MINOR', type: 'REWARD' },
					},
				},
			],
		},
		{
			id: 'evt_dis_012',
			name: 'Stuck Wagon',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				"A commoner's wagon is stuck in a ditch. Helping could lead to a reward.",
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'endturn'],
				allowedZoneSubclass: ['Village', 'Town', 'City'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis012_help',
					label: 'Help push it out',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You free the wagon, and the grateful traveler tips you.',
						silverCoins: { tier: 'MODERATE', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You strain your back and fail to move the heavy load.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_013',
			name: 'Scorched Crater',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				'A small impact site contains a glowing shard of ore from the stars.',
			conditions: {
				weight: 12,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis013_mine',
					label: 'Carefully extract the ore',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You successfully recover the rare celestial material.',
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Nephilim',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The shard is unstable and burns you upon contact.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_014',
			name: 'Wandering Livestock',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				'A domestic animal has strayed far from its farm. It could be useful for its resources.',
			conditions: {
				weight: 40,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Orbit', 'Village'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis014_catch',
					label: 'Wrangle the animal',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You manage to catch the animal and add it to your caravan.',
						procGen: {
							items: [
								{
									category: 'Animal',
									entityClass: 'Domestic',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description: 'The animal outruns you, leaving you exhausted.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_015',
			name: 'Overgrown Monolith',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'Behind thick vines, an ancient stone pillar hides a compartment designed to hold a shield.',
			conditions: {
				weight: 18,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclass: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis015_clear',
					label: 'Clear the vegetation',
					checkType: 'LUCK_CHECK',
					successChance: 45,
					onSuccess: {
						description:
							'You reveal a sturdy shield resting within the stone.',
						procGen: {
							items: [
								{
									category: 'Physical',
									itemClass: 'Shield',
									tierModifier: 0,
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'Venomous insects swarm from the vines, biting you.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_016',
			name: 'Crystal Spring',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'You discover a hidden spring of pristine, restorative water deep within the undergrowth.',
			conditions: {
				weight: 35, // Low weight: guarantees moderate HP and potions
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge'],
			},
			staticEffects: {
				hpMod: { tier: 'MODERATE', type: 'REWARD' },
				healingPotions: { tier: 'MODERATE', type: 'REWARD' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_017',
			name: 'Buried Lockbox',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description:
				'You notice the corner of a metal box protruding from the soil, likely hidden by fleeing travelers.',
			conditions: {
				weight: 25, // Very low weight: provides armor and silver
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village', 'Town'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis017_pry',
					label: 'Pry it open',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'The rusty hinges give way, revealing equipment inside.',
						tradeSilver: { tier: 'MODERATE', type: 'REWARD' },
						procGen: {
							items: [
								{
									category: 'Physical',
									itemClass: 'Armor',
									tierModifier: 0,
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'You jam your fingers trying to force it. The box remains sealed.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_018',
			name: 'Cursed Effigy',
			typology: 'Discovery',
			eventType: 'NEGATIVE',
			description:
				'You stumble into a clearing containing a dark, twisted totem. A deep sense of dread fills you.',
			conditions: {
				weight: 50, // Standard weight for negative environmental narrative
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge'],
			},
			staticEffects: {
				honor: { tier: 'MODERATE', type: 'PENALTY' },
				apMod: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_019',
			name: 'Moldy Cache',
			typology: 'Discovery',
			eventType: 'NEGATIVE',
			description:
				'You locate an old survival cache, but standing moisture has severely compromised the seal.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis019_salvage',
					label: 'Salvage what you can',
					checkType: 'LUCK_CHECK',
					successChance: 50,
					onSuccess: {
						description:
							'You manage to find a few unspoiled items beneath the rot.',
						// Updated to include entityCategory for Loot table targeting
						procGen: {
							items: [
								{ category: 'Loot', entityCategory: 'Human', count: 1 },
							],
						},
					},
					onFailure: {
						description:
							'The mold spores make you sick, and the items disintegrate upon touch.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_dis_020',
			name: 'Fallen Courier',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description:
				'You find the remains of a royal courier. His satchel is destroyed, but a heavy coin purse is still attached to his belt.',
			conditions: {
				weight: 30, // Low weight: guarantees major economy boost if morality is sacrificed
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis020_loot',
					label: 'Take the purse',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You pocket the silver, though robbing an agent of the crown weighs heavily on your conscience.',
						silverCoins: { tier: 'MAJOR', type: 'REWARD' },
						honor: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_dis020_bury',
					label: 'Bury the courier',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You leave the silver untouched and spend time giving the courier a proper burial.',
						honor: { tier: 'MODERATE', type: 'REWARD' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: SOCIAL ENCOUNTER (15 Events)
		// ==========================================

		{
			id: 'evt_soc_001',
			name: 'Wandering Artisan',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'An artisan has set up a temporary workstation by the road, attempting to repair a complex tool.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Edge', 'Village', 'Town', 'City'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Production'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc001_interact',
					label: 'Approach the artisan',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc001_help',
					label: 'Offer technical advice',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'Your insight helps them fix the tool. They reward you with a piece of equipment.',
						procGen: {
							items: [
								{
									category: 'Physical',
									itemClass: 'Armor',
									tierModifier: 0,
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'Your interference only causes more frustration. They ask you to leave.',
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc001_ignore',
					label: 'Keep moving',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You leave the artisan to their work.',
					},
				},
			],
		},
		{
			id: 'evt_soc_002',
			name: 'Traveling Merchant',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'A merchant with a heavily laden pack animal signals you, eager to show off their wares.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village', 'Town'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Trade'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc002_interact',
					label: 'Inspect their goods',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc002_haggle',
					label: 'Attempt to swindle them',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You confuse the merchant with rapid calculations, walking away with extra coin.',
						silverCoins: { tier: 'MODERATE', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'The merchant catches your bluff and angrily demands compensation to keep quiet.',
						silverCoins: { tier: 'MINOR', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc002_ignore',
					label: 'Decline respectfully',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You wave them off and continue on your way.',
					},
				},
			],
		},
		{
			id: 'evt_soc_003',
			name: 'Weary Prospector',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'A tired prospector hauls a sack of raw materials. They look parched and exhausted.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Resources'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc003_interact',
					label: 'Approach the prospector',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc003_trade',
					label: 'Offer them food',
					checkType: 'TRADE_OFF',
					cost: { food: 2 },
					onSuccess: {
						description:
							'Grateful for the meal, they hand you a chunk of unrefined gold.',
						tradeGold: { tier: 'MINOR', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc003_ignore',
					label: 'Ignore their plight',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You keep your supplies to yourself.',
					},
				},
			],
		},
		{
			id: 'evt_soc_004',
			name: 'Stranded Courier',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'A courier stands helplessly beside a carriage with a damaged axle.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Transport'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc004_interact',
					label: 'Speak with the courier',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc004_lift',
					label: 'Help lift the carriage',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You hold the carriage steady while they secure the wheel. They pay you for the labor.',
						silverCoins: { tier: 'MODERATE', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'The weight is too much. You strain your back and the carriage remains stuck.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc004_ignore',
					label: 'Walk past',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You do not have time to assist with logistics today.',
					},
				},
			],
		},
		{
			id: 'evt_soc_005',
			name: 'Traveling Entertainer',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description:
				'A wandering performer plays a lively tune on their instrument, bringing a brief moment of joy to the road.',
			conditions: {
				weight: 55,
				minRank: 1,
				allowedTriggers: ['travel'],
				allowedZoneSubclasses: ['Village', 'Town', 'City', 'Castle'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Service'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc005_interact',
					label: 'Approach the performer',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc005_tip',
					label: 'Toss a coin in their hat',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 15 },
					onSuccess: {
						description:
							'They dedicate the next song to you. You feel energized and ready to travel.',
						apMod: { tier: 'MODERATE', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc005_ignore',
					label: 'Listen briefly and leave',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You enjoy the music for a moment, keeping your coins.',
					},
				},
			],
		},
		{
			id: 'evt_soc_006',
			name: 'Roadside Official',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'A local administrator stops you, demanding to see travel documents or a toll fee.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: [
					'Edge',
					'Village',
					'Town',
					'City',
					'Castle',
				],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Administration'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc006_interact',
					label: 'Approach cautiously',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc006_persuade',
					label: 'Argue your exemption',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You cite obscure regional laws and confuse the official into letting you pass.',
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'They see through your lies and fine you heavily for insubordination.',
						silverCoins: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc006_pay',
					label: 'Pay the requested toll',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 50 },
					onSuccess: {
						description: 'You pay the toll and proceed without incident.',
					},
				},
			],
		},
		{
			id: 'evt_soc_007',
			name: 'Wandering Scholar',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description:
				'You meet an eccentric scholar examining the local flora. They seem eager to share their theories.',
			conditions: {
				weight: 30, // Low weight: permanent stat reward
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: [
					'Edge',
					'Orbit',
					'Village',
					'Town',
					'City',
					'Castle',
					'Palace',
				],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Knowledge'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc007_interact',
					label: 'Greet the scholar',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc007_debate',
					label: 'Engage in academic debate',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'The conversation is enlightening. You walk away with a permanently expanded worldview.',
						int: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You quickly lose track of their complex arguments, wasting hours of daylight.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc007_ignore',
					label: 'Excuse yourself',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You nod politely and continue your journey.',
					},
				},
			],
		},
		{
			id: 'evt_soc_008',
			name: 'Desperate Refugee',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'A starving, emaciated traveler collapses near the path, begging for anything you can spare.',
			conditions: {
				weight: 60,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village', 'Town'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Society'],
					rankModifier: -1,
				},
			},
			choices: [
				{
					id: 'ch_soc008_interact',
					label: 'Assess the refugee',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc008_give',
					label: 'Share your rations',
					checkType: 'TRADE_OFF',
					cost: { food: 3 },
					onSuccess: {
						description:
							'The traveler weeps with gratitude. Your selflessness will not be forgotten.',
						honor: { tier: 'MAJOR', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc008_ignore',
					label: 'Look away and leave',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You protect your supplies, but your conscience is heavy.',
						honor: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_soc_009',
			name: 'Suspicious Peddler',
			typology: 'SocialEncounter',
			eventType: 'NEGATIVE',
			description:
				'A shifty individual blocks your path, offering to play a quick game of chance for silver.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village', 'Town', 'City'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Outlaw'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc009_interact',
					label: 'Confront the peddler',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc009_gamble',
					label: 'Play the shell game',
					checkType: 'LUCK_CHECK',
					successChance: 30, // Rigged game
					onSuccess: {
						description:
							'Against all odds, you pick the right shell. They angrily hand over the silver.',
						silverCoins: { tier: 'MAJOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'It was a scam. You lose your wager and look like a fool.',
						silverCoins: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc009_ignore',
					label: 'Refuse to play',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You wisely ignore the hustle and walk away.',
					},
				},
			],
		},
		{
			id: 'evt_soc_010',
			name: 'Idle Mercenary',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'An off-duty soldier leans against a tree, looking bored. They challenge you to a friendly bout.',
			conditions: {
				weight: 35, // Low weight: stat reward potential
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: [
					'Edge',
					'Village',
					'Town',
					'City',
					'Castle',
				],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Military'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc010_interact',
					label: 'Approach the soldier',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc010_spar',
					label: 'Accept the sparring match',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You outmaneuver them, earning their respect and sharpening your reflexes.',
						agi: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'They sweep your legs and knock the wind out of you.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc010_ignore',
					label: 'Decline the challenge',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You preserve your energy for real threats.',
					},
				},
			],
		},
		{
			id: 'evt_soc_011',
			name: 'Devout Pilgrim',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description:
				'A humble pilgrim is walking the same path, collecting alms for their religious order.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: [
					'Orbit',
					'Wild',
					'Edge',
					'Village',
					'Town',
					'City',
				],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Religion'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc011_interact',
					label: 'Speak with the pilgrim',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc011_donate',
					label: 'Donate to the order',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 25 },
					onSuccess: {
						description:
							'They offer a profound blessing. A soothing warmth knits your minor wounds.',
						hpMod: { tier: 'MODERATE', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc011_ignore',
					label: 'Apologize and move on',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You offer a polite nod but keep your coins.',
					},
				},
			],
		},
		{
			id: 'evt_soc_012',
			name: 'Desperate Horse Trader',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description:
				'A frustrated trader is struggling to treat a beautiful but injured stallion on the roadside.',
			conditions: {
				weight: 35,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Resources'],
					subclasses: ['Horse_Breeder'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc012_interact',
					label: 'Approach the trader',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc012_treat',
					label: 'Offer veterinary help',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You expertly tend to the wound. The grateful trader offers you the stallion as a reward for your expertise.',
						procGen: {
							items: [
								{ category: 'Animal', entityClass: 'Mount', count: 1 },
							],
						},
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'Your attempt worsens the injury. The trader furiously chases you away.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc012_ignore',
					label: 'Leave them be',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You leave the trader to handle their own problems.',
					},
				},
			],
		},
		{
			id: 'evt_soc_013',
			name: 'Overburdened Herder',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description:
				'A herder sits exhaustedly by the path, unable to feed a friendly domestic animal that keeps following their main flock.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Resources'],
					subclasses: ['Shepherd'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc013_interact',
					label: 'Speak with the herder',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc013_lure',
					label: 'Provide food for the animal',
					checkType: 'TRADE_OFF',
					cost: { food: 3 },
					onSuccess: {
						description:
							'The herder thanks you for your generosity and allows you to take the animal into your caravan.',
						procGen: {
							items: [
								{
									category: 'Animal',
									entityClass: 'Domestic',
									count: 1,
								},
							],
						},
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc013_ignore',
					label: 'Walk past',
					checkType: 'GENERAL',
					onSuccess: {
						description:
							'You wave them off, unwilling to spare any resources.',
					},
				},
			],
		},
		{
			id: 'evt_soc_014',
			name: "Noble's Entourage",
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description:
				"A wealthy noble's elaborate carriage is stuck in the mud. Several well-armed guards stand impassively, blocking access.",
			conditions: {
				weight: 40, // Low weight: potential major economic reward
				minRank: 1,
				allowedTriggers: ['travel'],
				allowedZoneSubclasses: ['Village', 'Town', 'City', 'Castle'],
			},
			staticEffects: null,
			// Generates a Military NPC (Guard) blocking access
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Military'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc014_interact',
					label: 'Speak with the guards',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc014_diplomacy',
					label: 'Offer assistance through guards',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'Your diplomatic tone convinces the noble. They reward your assistance handsomely.',
						silverCoins: { tier: 'MAJOR', type: 'REWARD' },
						tradeGold: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MODERATE', type: 'REWARD' },
					},
					onFailure: {
						description:
							'The guards dismiss your offer rudely. You waste hours trying to negotiate.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_soc014_ignore',
					label: 'Pass them by',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You have no time for high-society problems.',
					},
				},
			],
		},
		{
			id: 'evt_soc_015',
			name: 'Crazed Zealot',
			typology: 'SocialEncounter',
			eventType: 'NEGATIVE',
			description:
				'A frantic individual with wild eyes blocks your path, screaming about an imminent apocalypse and offering a "pact of protection."',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Village', 'Town', 'City', 'Castle'],
			},
			staticEffects: null,
			// Generates a Religion NPC (Zealot/Cultist)
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Religion'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_soc015_interact',
					label: 'Approach the zealot',
					checkType: 'STANDARD_INTERACTION',
				},
				{
					id: 'ch_soc015_pact',
					label: 'Accept the "Pact of Protection"',
					checkType: 'TRADE_OFF',
					cost: { honor: 20 }, // Morality cost
					onSuccess: {
						description:
							'You perform a brief, disturbing ritual. A sinister warmth knits your minor wounds.',
						hpMod: { tier: 'MODERATE', type: 'REWARD' },
						apMod: { tier: 'MODERATE', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc015_debate',
					label: 'Debate their heresy',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'Your calm logic exposes their contradictions. The crowd mocks them, and you gain respect.',
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'They twist your words, making you look like a fool before the crowd.',
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: COMBAT ENCOUNTER (15 Events)
		// ==========================================

		{
			id: 'evt_cmb_001',
			name: 'Highwaymen Ambush',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'Armed bandits block the road, demanding a toll for safe passage.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village', 'Town'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Outlaw'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb001_pay',
					label: 'Pay the toll',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 100 },
					onSuccess: {
						description:
							'You pay them off and they let you pass. You feel humiliated.',
						honor: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb001_evade',
					label: 'Create a distraction to escape',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You outsmart them and slip away into the brush.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'Your distraction fails, forcing you into a losing battle. You drop supplies as you flee.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb001_fight',
					label: 'Draw your weapon',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You defeated the bandits and secured the area.',
						procGen: {
							items: [
								{ category: 'Loot', entityCategory: 'Human', count: 2 },
							],
						},
					},
					onFailure: {
						description:
							'You were overwhelmed and forced to run, dropping items along the way.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_002',
			name: 'Frenzied Wild Animal',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A massive, territorial wild animal charges out of the undergrowth.',
			conditions: {
				weight: 60,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_ANIMAL',
					categories: ['Animal'],
					classes: ['WildHostile'],
					rankModifier: 2,
				},
			},
			choices: [
				{
					id: 'ch_cmb002_distract',
					label: 'Throw provisions to distract it',
					checkType: 'TRADE_OFF',
					cost: { food: 2 },
					onSuccess: {
						description:
							'The animal stops to eat the food, allowing you to slip away.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb002_evade',
					label: 'Sprint away',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: {
						description: 'You outrun the beast and find safety.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'It catches up to you. You manage to escape the ensuing fight, but lose some gear.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'PENALTY' },
						food: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb002_fight',
					label: 'Stand your ground',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You put the animal down and harvest its meat.',
						food: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You are forced to flee the beast, losing ground and supplies.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
						food: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_003',
			name: 'Goblinoid Scouting Party',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A scouting party of vicious goblinoid creatures attempts to surround you.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: ['Goblinoid'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb003_bribe',
					label: 'Toss silver to cause a scramble',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 50 },
					onSuccess: {
						description:
							'They fight each other for the coins while you make your escape.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb003_hide',
					label: 'Hide in the shadows',
					checkType: 'LUCK_CHECK',
					successChance: 50,
					onSuccess: { description: 'They pass by without noticing you.' },
					onFailure: {
						description:
							'You are discovered and forced into an ambush. You barely escape with your life.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb003_fight',
					label: 'Ambush the scouts',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You eliminated the threat before they could report back.',
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 2,
								},
							],
						},
					},
					onFailure: {
						description:
							'The scouting party overwhelms you. You run, leaving a trail of dropped supplies.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_004',
			name: 'Wandering Giant',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'The ground shakes as a hulking giant steps into your path, bellowing a challenge.',
			conditions: {
				weight: 30,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: ['Giant'],
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_cmb004_tribute',
					label: 'Offer a large food tribute',
					checkType: 'TRADE_OFF',
					cost: { food: 5 },
					onSuccess: {
						description:
							'The giant takes the food and lumbers away, satisfied.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb004_evade',
					label: 'Slip between the trees',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description: 'You evade its massive grasp and flee the area.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'It catches you. You manage to break free, but the retreat is costly and shameful.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb004_fight',
					label: 'Attack the giant',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'Against all odds, you topple the behemoth.',
						str: { tier: 'MINOR', type: 'REWARD' },
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 3,
								},
							],
						},
					},
					onFailure: {
						description:
							'A single strike shatters your defenses. You run, abandoning your provisions.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_005',
			name: 'Desperate Outlaws',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A group of rogue outlaws surrounds you, looking for an easy mark to rob.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village', 'Town'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Outlaw'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb005_bribe',
					label: 'Hand over trade goods',
					checkType: 'TRADE_OFF',
					cost: { tradeSilver: 2 },
					onSuccess: {
						description:
							'They take your silver bars and let you walk away unharmed.',
						honor: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb005_talk',
					label: 'Talk them down',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You convince them that attacking you is not worth the risk.',
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'Your words fall flat. They attack, forcing a messy retreat.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb005_fight',
					label: 'Defend yourself',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You break their formation and scatter the survivors.',
						procGen: {
							items: [
								{ category: 'Loot', entityCategory: 'Human', count: 2 },
							],
						},
					},
					onFailure: {
						description:
							'You are badly beaten and forced to surrender your gear to escape.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_006',
			name: 'Sparring Match',
			typology: 'CombatEncounter',
			eventType: 'POSITIVE',
			description:
				'An off-duty soldier challenges you to a non-lethal test of combat skill.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Village', 'Town', 'City', 'Castle'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Military'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb006_wager',
					label: 'Place a wager on the match',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 25 },
					onSuccess: {
						description: 'You pay the entry fee for the bout.',
						// The wager acts as a buy-in. We handle the actual fight abstractly or assume a subsequent trigger,
						// but strictly following the 3-choice rule, we just grant the experience here.
						str: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_cmb006_decline',
					label: 'Politely decline',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You conserve your energy for real battles.',
					},
				},
				{
					id: 'ch_cmb006_fight',
					label: 'Accept the duel',
					checkType: 'COMBAT',
					combatRule: 'NF',
					onSuccess: {
						description: 'You bested your opponent. The crowd cheers.',
						str: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description: 'You lost the bout, taking a bruised ego.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_007',
			name: 'Undead Ambusher',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A restless undead abomination rises from the dirt, driven by an endless hunger for the living.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: ['Undead'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb007_burn',
					label: 'Burn it with a healing potion',
					checkType: 'TRADE_OFF',
					cost: { healingPotions: 1 },
					onSuccess: {
						description:
							'The holy liquid dissolves the creature instantly.',
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_cmb007_run',
					label: 'Blindly run through the mist',
					checkType: 'LUCK_CHECK',
					successChance: 40,
					onSuccess: {
						description:
							'You stumble through the darkness but escape the creature.',
					},
					onFailure: {
						description:
							'It grabs you from behind! You break free but suffer terrible fatigue and drop provisions.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb007_fight',
					label: 'Purge the undead',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You shatter the abomination back into dust.',
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The undead terror overwhelms you. You flee into the night, abandoning gear.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_008',
			name: 'Ruthless Thug',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A heavily armed thug steps out of an alleyway, drawing a weapon and demanding your valuables.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Village', 'Town', 'City'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Outlaw'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb008_pay',
					label: 'Hand over your coin purse',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 50 },
					onSuccess: {
						description:
							'The thug takes the money and disappears into the shadows.',
						honor: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb008_shove',
					label: 'Shove past with brute force',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You knock them off balance and sprint to the main road.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'They block your path and retaliate. You narrowly escape the violent scuffle.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb008_fight',
					label: 'Attack the thug',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You subdue the attacker and leave them for the town guard.',
						procGen: {
							items: [
								{ category: 'Physical', itemClass: 'Weapon', count: 1 },
							],
						},
					},
					onFailure: {
						description:
							'You are badly beaten in the alley and robbed before escaping.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_009',
			name: 'Corrupted Beast',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A monstrous beast, twisted by dark energies, lets out a terrifying roar and prepares to pounce.',
			conditions: {
				weight: 40,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: ['Beast'],
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_cmb009_distract',
					label: 'Throw raw meat to satisfy it',
					checkType: 'TRADE_OFF',
					cost: { food: 3 },
					onSuccess: {
						description:
							'The beast greedily devours the food, allowing you to back away safely.',
					},
				},
				{
					id: 'ch_cmb009_evade',
					label: 'Dive into the dense foliage',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You move silently through the brush and lose the monster.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'You snap a branch. The beast attacks! You flee, but at great cost.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb009_fight',
					label: 'Slay the corrupted creature',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: "You end the creature's miserable existence.",
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 2,
								},
							],
						},
					},
					onFailure: {
						description:
							'The corrupted beast overpowers you. You flee in terror, dropping your supplies.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_010',
			name: 'Deserter Patrol',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'Heavily armed military deserters intercept you, demanding "taxes" for their rogue operation.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Military'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb010_bribe',
					label: 'Pay the exorbitant tax',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 150 },
					onSuccess: {
						description:
							'They laugh as they take your silver, letting you pass.',
						honor: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb010_bluff',
					label: 'Impersonate a commanding officer',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'Your authoritative tone breaks their resolve, and they quickly scatter.',
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'They see right through your bluff and draw steel. You are forced into a chaotic retreat.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb010_fight',
					label: 'Refuse and fight',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You dispense justice upon the traitors.',
						honor: { tier: 'MODERATE', type: 'REWARD' },
						procGen: {
							items: [
								{ category: 'Physical', itemClass: 'Weapon', count: 1 },
							],
						},
					},
					onFailure: {
						description:
							'Their military tactics overwhelm you. You run, abandoning valuable goods.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_011',
			name: 'Draconid Predator',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A winged draconid predator swoops down from above, seeing your caravan as its next meal.',
			conditions: {
				weight: 30,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: ['Draconid'],
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_cmb011_sacrifice',
					label: 'Sacrifice food to draw it away',
					checkType: 'TRADE_OFF',
					cost: { food: 4 },
					onSuccess: {
						description:
							'The beast snatches the food and flies off to its nest.',
					},
				},
				{
					id: 'ch_cmb011_hide',
					label: 'Hide beneath rock cover',
					checkType: 'LUCK_CHECK',
					successChance: 35,
					onSuccess: {
						description:
							'The draconid loses sight of you and flies away in frustration.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'It spots you! The creature breathes down upon you, forcing a desperate, costly escape.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb011_fight',
					label: 'Draw your weapon against the sky',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You grounded the beast permanently.',
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 2,
								},
							],
						},
					},
					onFailure: {
						description:
							'The predator tears through your defenses. You flee to avoid becoming its meal.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_012',
			name: 'Crazed Cultists',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'Fanatics performing a dark ritual notice your approach and decide you are the perfect sacrifice.',
			conditions: {
				weight: 45,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Town'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_HUMAN',
					categories: ['Human'],
					classes: ['Religion'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb012_offering',
					label: 'Drop gold as a false offering',
					checkType: 'TRADE_OFF',
					cost: { tradeGold: 1 },
					onSuccess: {
						description:
							'They pause to gather the gold, allowing you to slip away into the dark.',
					},
				},
				{
					id: 'ch_cmb012_chant',
					label: 'Recite a counter-incantation',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'Your words confuse them, breaking their trance while you escape.',
						int: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'They see through your lies and swarm you. You barely escape the frenzy.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb012_fight',
					label: 'Disrupt the ritual',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'You strike down the heretics and shatter their idols.',
						honor: { tier: 'MODERATE', type: 'REWARD' },
					},
					onFailure: {
						description:
							'Their chaotic magic forces you to retreat in agonizing pain.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_013',
			name: 'Feral Nephilim',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A terrifying celestial anomaly descends upon you. Its aura alone threatens to break your mind.',
			conditions: {
				weight: 20,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_NEPHILIM',
					categories: ['Nephilim'],
					classes: [],
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_cmb013_distract',
					label: 'Expend raw silver to blind it',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 200 },
					onSuccess: {
						description:
							'The pure metal burns brightly, distracting the entity long enough for you to flee.',
					},
				},
				{
					id: 'ch_cmb013_resist',
					label: 'Mentally resist its aura',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 2,
					onSuccess: {
						description:
							'You fortify your mind and carefully back out of its domain.',
						int: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'The aura crushes your spirit. You run blindly, dropping everything in pure terror.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						renown: { tier: 'MAJOR', type: 'PENALTY' },
						food: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb013_fight',
					label: 'Banish the entity',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description:
							'With incredible effort, you banish the Nephilim to the void.',
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Nephilim',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The entity is unstoppable. You are utterly broken as you crawl to safety.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						food: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_014',
			name: 'Cursed Abomination',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'A cursed creature stalks out of the shadows, driven mad by its affliction.',
			conditions: {
				weight: 40,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: ['Cursed'],
					rankModifier: 0,
				},
			},
			choices: [
				{
					id: 'ch_cmb014_bait',
					label: 'Drop food and run',
					checkType: 'TRADE_OFF',
					cost: { food: 3 },
					onSuccess: {
						description:
							'The starving abomination falls upon the food, ignoring you.',
					},
				},
				{
					id: 'ch_cmb014_freeze',
					label: 'Freeze in place',
					checkType: 'LUCK_CHECK',
					successChance: 40,
					onSuccess: {
						description:
							'It sniffs the air but fails to locate you in the darkness.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'It locks eyes with you and lunges! You escape the fight, but not unscathed.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb014_fight',
					label: 'Put it out of its misery',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You end the curse by slaying the host.',
						honor: { tier: 'MINOR', type: 'REWARD' },
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 1,
								},
							],
						},
					},
					onFailure: {
						description:
							'The dark magic is too strong. You flee, leaving a trail of your own supplies.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_015',
			name: 'Elemental Guardian',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description:
				'An elemental construct awakens as you approach, programmed to destroy trespassers.',
			conditions: {
				weight: 35,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					categories: ['Monster'],
					classes: ['Elemental'],
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_cmb015_overload',
					label: 'Sacrifice silver to its core',
					checkType: 'TRADE_OFF',
					cost: { tradeSilver: 1 },
					onSuccess: {
						description:
							'The pure silver overloads its ancient sensors, forcing a reset while you pass.',
					},
				},
				{
					id: 'ch_cmb015_run',
					label: 'Run the gauntlet',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You dodge a flurry of elemental strikes and exit its territory.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'You are struck by elemental fury. You crawl to safety, severely depleted.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb015_fight',
					label: 'Shatter the guardian',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You reduce the ancient guardian to rubble.',
						procGen: {
							items: [
								{
									category: 'Loot',
									entityCategory: 'Monster',
									count: 2,
								},
							],
						},
					},
					onFailure: {
						description:
							'The construct is immovable. You retreat in defeat, losing valuable resources.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						food: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: GENERAL (15 Events)
		// ==========================================

		{
			id: 'evt_gen_001',
			name: 'Good Omen',
			typology: 'General',
			eventType: 'POSITIVE',
			description:
				'You witness a shooting star streak across the sky. You feel a profound sense of clarity and purpose.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Orbit', 'Wild', 'Edge'],
			},
			staticEffects: {
				apMod: { tier: 'MINOR', type: 'REWARD' },
				hpMod: { tier: 'MINOR', type: 'REWARD' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_002',
			name: 'Uneasy Feeling',
			typology: 'General',
			eventType: 'NEGATIVE',
			description:
				'A sudden wave of paranoia washes over you in the dense undergrowth, making you overly cautious and slowing you down.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Wild', 'Edge'],
			},
			staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_003',
			name: 'Clear Path',
			typology: 'General',
			eventType: 'POSITIVE',
			description:
				'The road ahead is flat and solid, allowing you to cover ground quickly before the weather turns.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Village', 'Town', 'City'],
				allowedSeasons: ['spring', 'summer', 'autumn'],
			},
			staticEffects: { apMod: { tier: 'MODERATE', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_004',
			name: 'Broken Wheel',
			typology: 'General',
			eventType: 'NEUTRAL',
			description:
				'You encounter a merchant struggling with a broken wagon wheel on the main trading route.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Village', 'Town', 'City'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_gen004_help',
					label: 'Help lift the wagon',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description:
							'You fix the wheel. The merchant tips you with trade silver.',
						tradeSilver: { tier: 'MINOR', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description: 'You strain your back and fail to lift it.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_gen004_ignore',
					label: 'Keep walking',
					checkType: 'GENERAL',
					onSuccess: { description: 'You leave them to their fate.' },
				},
			],
		},
		{
			id: 'evt_gen_005',
			name: 'Moment of Clarity',
			typology: 'General',
			eventType: 'POSITIVE',
			description:
				'Taking a quiet moment to reflect, you synthesize everything you have learned recently.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: [
					'Village',
					'Town',
					'City',
					'Castle',
					'Palace',
					'Orbit',
					'Wild',
					'Edge',
				],
			},
			staticEffects: {
				int: { tier: 'MINOR', type: 'REWARD' },
				apMod: { tier: 'MINOR', type: 'REWARD' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_006',
			name: 'Hidden Shortcut',
			typology: 'General',
			eventType: 'POSITIVE',
			description:
				'You spot a narrow game trail that might cut hours off your journey through the wilderness.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Orbit'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_gen006_risk',
					label: 'Take the shortcut',
					checkType: 'LUCK_CHECK',
					successChance: 70,
					onSuccess: {
						description:
							'The path is clear and saves you significant time.',
						apMod: { tier: 'MAJOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'The trail ends at a ravine. You have to backtrack.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_gen_007',
			name: 'Restless Slumber',
			typology: 'General',
			eventType: 'NEGATIVE',
			description:
				'Nightmares and strange noises keep you awake, leaving you fatigued the next cycle.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['endturn'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Orbit', 'Village'],
			},
			staticEffects: {
				apMod: { tier: 'MODERATE', type: 'PENALTY' },
				hpMod: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_008',
			name: 'Snapped Strap',
			typology: 'General',
			eventType: 'NEGATIVE',
			description:
				'A vital leather strap on your gear snaps. You must stop to repair it immediately.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: [
					'Village',
					'Town',
					'City',
					'Castle',
					'Palace',
					'Orbit',
					'Wild',
					'Edge',
				],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_gen008_fix',
					label: 'Attempt field repairs',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: -1,
					onSuccess: {
						description:
							'You quickly stitch it together, losing minimal time.',
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
					onFailure: {
						description:
							'You ruin the strap and have to spend coins to replace it later.',
						silverCoins: { tier: 'MINOR', type: 'PENALTY' },
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_gen_009',
			name: 'Country Springs',
			typology: 'General',
			eventType: 'POSITIVE',
			description:
				'You take a rest at a quiet country house near a set of clear springs. A friendly husky keeps watch, allowing you to relax completely.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Village', 'Edge'],
				allowedSeasons: ['spring', 'summer', 'autumn'],
			},
			staticEffects: {
				apMod: { tier: 'MODERATE', type: 'REWARD' },
				hpMod: { tier: 'MINOR', type: 'REWARD' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_010',
			name: 'Spring Thaw',
			typology: 'General',
			eventType: 'POSITIVE',
			description:
				'Melting snows reveal a lost pouch of silver along the muddy road.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Village'],
				allowedSeasons: ['spring'],
			},
			staticEffects: { silverCoins: { tier: 'MODERATE', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_011',
			name: 'Summer Drought',
			typology: 'General',
			eventType: 'NEGATIVE',
			description:
				'The oppressive summer heat cracks the earth, making travel grueling and draining your water reserves.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Orbit'],
				allowedSeasons: ['summer'],
			},
			staticEffects: {
				apMod: { tier: 'MODERATE', type: 'PENALTY' },
				food: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_012',
			name: 'Autumn Harvest',
			typology: 'General',
			eventType: 'POSITIVE',
			description:
				'You pass by a bountiful local orchard and manage to gather some fallen fruit for the road.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Village', 'Town'],
				allowedSeasons: ['autumn'],
			},
			staticEffects: { food: { tier: 'MODERATE', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_013',
			name: 'Winter Blizzard',
			typology: 'General',
			eventType: 'NEGATIVE',
			description:
				'A sudden whiteout halts your progress, chilling you to the bone and forcing you to make camp early.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore'],
				allowedZoneSubclasses: ['Wild', 'Edge', 'Orbit'],
				allowedSeasons: ['winter'],
			},
			staticEffects: {
				apMod: { tier: 'MAJOR', type: 'PENALTY' },
				hpMod: { tier: 'MINOR', type: 'PENALTY' },
			},
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_014',
			name: 'Urban Congestion',
			typology: 'General',
			eventType: 'NEGATIVE',
			description:
				'A massive crowd in the streets—perhaps a festival or protest—slows your progress to a crawl.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel'],
				allowedZoneSubclasses: ['City', 'Town', 'Castle'],
			},
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_gen014_nav',
					label: 'Navigate the back alleys',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: {
						description:
							'You bypass the main thoroughfare and save time.',
						apMod: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description:
							'You get lost in the maze of streets, wasting hours.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_gen_015',
			name: 'High Altitude Chill',
			typology: 'General',
			eventType: 'NEGATIVE',
			description:
				'The thin, cold air at this elevation makes every physical exertion exhausting.',
			conditions: {
				weight: 50,
				minRank: 1,
				allowedTriggers: ['travel', 'explore', 'endturn'],
				allowedZoneSubclasses: ['Castle', 'Palace', 'Orbit'],
			},
			staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
	],
};
