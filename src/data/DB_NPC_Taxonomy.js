// File: Client/src/data/DB_NPC_Taxonomy.js
// Description: Global taxonomy definitions, master index, and shared generation parameters.

export const DB_NPC_TAXONOMY = {
	// ========================================================================
	// GLOBAL ARCHETYPES & CATEGORIES
	// ========================================================================
	archetypes: ['Humanoid', 'Creature'],
	categories: ['Human', 'Nephilim', 'Animal', 'Monster'],

	// ========================================================================
	// ACTION TAXONOMY DICTIONARY
	// ========================================================================
	actions: {
		categories: [
			'commerceEconomy',
			'maintenanceRestoration',
			'combatHostility',
			'employmentLabor',
			'attributeProgression',
			'targetVulnerability',
			'npcInteractions',
			'spatial',
		],
		tagsByCategory: {
			commerceEconomy: [
				'Trade_Weapon',
				'Trade_Armor',
				'Trade_Shield',
				'Trade_Helmet',
				'Trade_Mount',
				'Trade_Animal',
				'Trade_Food',
				'Trade_Potion',
				'Trade_Coin',
				'Trade_Loot',
			],
			maintenanceRestoration: ['Service_Lodging', 'Heal_Mount', 'Heal_Player', 'Cure_Player', 'Repair_Equipment'],
			combatHostility: ['Combat_Engage', 'Combat_Duel', 'Combat_Spar', 'Combat_Ambush', 'Combat_Brawl', 'Fight_Monster',
                'Fight_Nephilim', 'Fight_Humanoid'],
			employmentLabor: ['Labor_Coin', 'Labor_Food'],
			attributeProgression: ['Train_STR', 'Train_AGI', 'Train_INT'],
			targetVulnerability: ['Target_Steal_Coin', 'Target_Steal_Food', 'Target_Robbery', 'Target_Assassination', 'Target_Bribe','Target_Steal_Animal'],
			npcInteractions: [
				'Donate_Pray',
				'Donate_Coin',
				'Donate_Food',
				'Ignore', // Kept here as a valid tag, though managed by UI
			],
			spatial: ['Hunt_Animal', 'Evade_Animal', 'Evade_Monster','Evade_Nephilim'],
		},
		executionRoutes: ['ROUTE_TRADE', 'ROUTE_COMBAT', 'ROUTE_INSTANT', 'ROUTE_SPATIAL'],
		targetTypes: ['NPC', 'ENVIRONMENT'],
		combatRules: ['DMF', 'NF', 'FF'],
		universalTags: {
			humanoid: [
				// Combat Options
				'Combat_Engage',
				'Combat_Duel',
				'Combat_Spar',
				'Combat_Ambush',
				'Combat_Brawl',

				// Target Options
				'Target_Steal_Coin',
				'Target_Steal_Food',
				'Target_Robbery',
				'Target_Assassination',
			],
			hostile: ['Combat_Engage'],
			charity: ['Donate_Pray', 'Donate_Coin', 'Donate_Food'],
		},
	},

	// ========================================================================
	// HUMANOID CATEGORY: HUMAN
	// ========================================================================
	Human: {
		classes: ['Production', 'Trade', 'Resources', 'Transport', 'Service', 'Administration', 'Knowledge', 'Society', 'Outlaw', 'Military', 'Religion'],
		subclasses: {
			Production: [
				'Blacksmith',
				'Weaponsmith',
				'Armorer',
				'Shieldwright',
				'Marshal',
				'Tanner',
				'Leatherworker',
				'Carpenter',
				'Fixer',
				'Ironsmith',
				'Tailor',
				'Weaver',
				'Bowyer',
				'Fletcher',
				'Mason',
			],
			Trade: ['Arms_Dealer', 'Armorer_Merchant', 'Shield_Seller', 'Horse_Dealer', 'Grazier', 'Provisioner', 'Grocer', 'Peddler', 'Banker', 'Caravan_Master'],
			Resources: ['Farmer', 'Fisherman', 'Shepherd', 'Woodcutter', 'Forester', 'Miner', 'Quarryman', 'Hunter', 'Trapper', 'Horse_Breeder'],
			Transport: ['Messenger', 'Courier', 'Escort', 'Wainwright', 'Pilgrim', 'Wayfinder', 'Traveler', 'Outrider', 'Ferryman', 'Drayman'],
			Service: [
				'Innkeeper',
				'Stablemaster',
				'Ostler',
				'Chamberlain',
				'Cupbearer',
				'Servant',
				'Steward',
				'Apothecary',
				'Cook',
				'Page',
				'Barkeep',
				'Tavern_Keeper',
				'Entertainer',
			],
			Administration: ['Tax_Collector', 'Bailiff', 'Magistrate', 'Clerk', 'Notary', 'Reeve', 'Warden', 'Herald', 'Seneschal', 'Archivist'],
			Knowledge: [
				'Mentor',
				'Warmaster',
				'Fencing_Master',
				'Magister',
				'Physician',
				'Surgeon',
				'Herbalist',
				'Scholar',
				'Chronicler',
				'Scribe',
				'Alchemist',
				'Astrologer',
			],
			Society: [
				'Noble',
				'Lord',
				'Chancellor',
				'Banneret',
				'Courtier',
				'Envoy',
				'Emissary',
				'Patrician',
				'Landowner',
				'Patron',
				'Beggar',
				'Vagabond',
				'Peasant',
				'Minstrel',
				'Bard',
			],
			Outlaw: [
				'Bandit',
				'Thief',
				'Pickpocket',
				'Burglar',
				'Cutpurse',
				'Highwayman',
				'Smuggler',
				'Fence',
				'Poacher',
				'Deserter',
				'Thug',
				'Assassin',
				'Marauder',
			],
			Military: [
				'Sentry',
				'Watchman',
				'Soldier',
				'Quartermaster',
				'Mercenary',
				'Sergeant',
				'Captain',
				'Bodyguard',
				'Knight',
				'Champion',
				'Scout',
				'Commander',
				'General',
			],
			Religion: ['Priest', 'Cleric', 'Monk', 'Friar', 'Zealot', 'Cultist'],
		},
	},

	// ========================================================================
	// CREATURE CATEGORY: ANIMAL
	// ========================================================================
	Animal: {
		classes: ['Mount', 'Domestic', 'Wild', 'WildFriendly', 'WildHostile'],
		subclasses: {
			Mount: ['Horse'],
			Domestic: ['Chicken', 'Goose', 'Pig', 'Sheep', 'Goat', 'Cow', 'Ox', 'Water_Buffalo', 'Yak', 'Prize_Bull', 'Aurochs'],
			Wild: ['Hare', 'Pheasant', 'Fox', 'Deer', 'Boar', 'Wolf', 'Elk', 'Bear', 'Moose', 'Bison', 'Dire_Wolf', 'Grizzly_Bear'],
			WildHostile: ['Boar', 'Wolf', 'Bear', 'Moose', 'Dire_Wolf', 'Grizzly_Bear', 'Elk', 'Bison'],
			WildFriendly: ['Hare', 'Pheasant', 'Fox', 'Deer'],
		},
		nomenclature: {
			Mount: {
				Horse: {
					baseNamesByRank: [
						['Nag', 'Draft Horse'], // Rank 1
						['Trotter', 'Hack'], // Rank 2
						['Courser', 'Palfrey'], // Rank 3
						['Charger', 'Hunter'], // Rank 4
						['Destrier', 'Warhorse'], // Rank 5
					],
					adjectives: {
						agility: ['Swift', 'Fleet', 'Nimble', 'Light'],
						strength: ['Sturdy', 'Stout', 'Heavy', 'Brawny'],
						balanced: ['Loyal', 'Hardy', 'Reliable', 'Steadfast'],
					},
					descriptions: {
						agility: 'A lean, long-legged mount bred for swift travel and rapid maneuvers.',
						strength: 'A heavily muscled steed, built to carry great burdens and endure heavy blows.',
						balanced: 'A dependable and well-rounded mount, bred for extended travel and general utility.',
					},
				},
			},
		},
	},

	// ========================================================================
	// CREATURE CATEGORY: MONSTER
	// ========================================================================
	Monster: {
		classes: ['Beast', 'Giant', 'Undead', 'Goblinoid', 'Elemental', 'Cursed', 'Draconid'],
		subclasses: {
			Beast: ['Manticore', 'Griffin', 'Chimera'],
			Giant: ['Jotun', 'Cyclops', 'Fomorian'],
			Undead: ['Wight', 'Wraith', 'Banshee'],
			Goblinoid: ['Goblin', 'Hobgoblin', 'Bugbear'],
			Elemental: ['Golem', 'Djinn', 'Gargoyle'],
			Cursed: ['Vampire', 'Werewolf', 'Hag'],
			Draconid: ['Wyvern', 'Basilisk', 'Cockatrice'],
		},
		nomenclature: {
			Beast: ['Scrawny', 'Feral', 'Savage', 'Monstrous', 'Apex'], // Ranks 1 to 5
			Giant: ['Lesser', 'Brutish', 'Hulking', 'Gargantuan', 'Colossal'], // Ranks 1 to 5
			Undead: ['Decaying', 'Risen', 'Restless', 'Dread', 'Deathless'], // Ranks 1 to 5
			Goblinoid: ['Runt', 'Scrapper', 'Bruiser', 'Chief', 'Warlord'], // Ranks 1 to 5
			Elemental: ['Minor', 'Bound', 'Awakened', 'Primal', 'Sovereign'], // Ranks 1 to 5
			Cursed: ['Afflicted', 'Tainted', 'Damned', 'Accursed', 'Profane'], // Ranks 1 to 5
			Draconid: ['Fledgling', 'Scaled', 'Vicious', 'Dread', 'Ancient'], // Ranks 1 to 5
		},
	},

	// ========================================================================
	// HUMANOID CATEGORY: NEPHILIM
	// ========================================================================
	Nephilim: {
		classes: ['Demigod'],
		subclasses: {
			Demigod: [
				'Wolfscar',
				'Gloomfeather',
				'Ironcog',
				'Twinspawn',
				'Cinderheart',
				'Dunejackal',
				'Drakescale',
				'Viperfang',
				'Ganeshai',
				'Cloudshrike',
				'Carrionbeak',
				'Ironhoof',
				'Croctusk',
				'Venomstalker',
				'Hivelord',
				'Ogreblood',
			],
		},
	},

	// ========================================================================
	// SHARED GENERATION CONFIGURATION (Humans & Nephilims)
	// ========================================================================
	generationConfig: {
		baseCoinMult: 50,
		baseFoodMult: 2,
		firstNames: [
			'Arthur',
			'Cedric',
			'Bjorn',
			'Alaric',
			'Gareth',
			'Tristan',
			'Roland',
			'Ewan',
			'Finn',
			'Kael',
			'Alden',
			'Berengar',
			'Cassian',
			'Darian',
			'Ealdred',
			'Falk',
			'Galahad',
			'Halvar',
			'Ivar',
			'Jareth',
			'Kaelen',
			'Leif',
			'Merrick',
			'Njal',
			'Orson',
			'Percival',
			'Quinlan',
			'Ragnar',
			'Soren',
			'Theron',
			'Ulric',
			'Valerius',
			'Wolfram',
			'Xander',
			'Yorick',
			'Zane',
			'Athelstan',
			'Baldwin',
			'Conrad',
			'Duncan',
			'Edric',
			'Fenrir',
			'Godric',
			'Hademar',
			'Ingvar',
			'Jory',
			'Kenric',
			'Lothar',
			'Malric',
			'Norward',
			'Oswin',
			'Rurik',
			'Stellan',
			'Torsten',
			'Uhtred',
		],
		lastNames: [
			'Ironhand',
			'Blackwood',
			'Vance',
			'Sterling',
			'Locke',
			'Frost',
			'Stone',
			'Rivers',
			'Pyke',
			'Snow',
			'Ashdown',
			'Bloodgood',
			'Crow',
			'Darkmoor',
			'Ember',
			'Flint',
			'Graves',
			'Hawthorne',
			'Ironclad',
			'Storm',
			'Nightbane',
			'Oakenshield',
			'Pine',
			'Ravenscroft',
			'Silver',
			'Thorn',
			'Underwood',
			'Whitewood',
			'Wyrm',
			'Yronwood',
			'Aldridge',
			'Bainbridge',
			'Caldwell',
			'Dalton',
			'Edge',
			'Fairburn',
			'Galt',
			'Harwood',
			'Ingrams',
			'Karstark',
			'Langdon',
			'Mercer',
			'Nash',
			'Osgood',
			'Penrose',
			'Quintrell',
			'Redfort',
			'Stark',
			'Tully',
			'Umber',
			'Vex',
			'Weaver',
			'Yarwood',
			'Thorne',
			'Swift',
		],

		combatTrainingModifiers: {
			Divine: { itemProbability: { weapon: 100, armor: 100, shield: 100, helmet: 100, mount: 100 } },
			Veteran: { attributeModifier: 1.0, itemProbability: { weapon: 75, armor: 75, shield: 75, helmet: 75, mount: 50 } },
			Trained: { attributeModifier: 0.8, itemProbability: { weapon: 50, armor: 50, shield: 50, helmet: 50, mount: 25 } },
			Basic: { attributeModifier: 0.65, itemProbability: { weapon: 25, armor: 25, shield: 25, helmet: 25, mount: 10 } },
			None: { attributeModifier: 0.5, itemProbability: { weapon: 10, armor: 0, shield: 10, helmet: 0, mount: 0 } },
		},

		socialClassModifiers: {
			Divine: {
				economicCoinModifier: 10.0,
				economicFoodModifier: 10.0,
				commoditySilverProb: 100,
				commodityGoldProb: 50,
				itemProbability: { weapon: 100, armor: 100, shield: 100, helmet: 100, mount: 100 },
			},
			Rich: {
				economicCoinModifier: 5.0,
				economicFoodModifier: 5.0,
				commoditySilverProb: 30,
				commodityGoldProb: 10,
				itemProbability: { weapon: 50, armor: 75, shield: 25, helmet: 75, mount: 75 },
			},
			Normal: {
				economicCoinModifier: 2.5,
				economicFoodModifier: 2.5,
				commoditySilverProb: 10,
				commodityGoldProb: 0,
				itemProbability: { weapon: 50, armor: 25, shield: 50, helmet: 50, mount: 50 },
			},
			Poor: {
				economicCoinModifier: 1,
				economicFoodModifier: 1,
				commoditySilverProb: 0,
				commodityGoldProb: 0,
				itemProbability: { weapon: 25, armor: 0, shield: 25, helmet: 25, mount: 0 },
			},
		},
	},
};
