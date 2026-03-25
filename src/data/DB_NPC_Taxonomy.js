// File: src/data/DB_NPC_Taxonomy.js
// Description: Global taxonomy definitions, master index, and shared generation parameters.

export const DB_NPC_TAXONOMY = {
	// ========================================================================
	// GLOBAL ARCHETYPES & CATEGORIES
	// ========================================================================
	archetypes: ['Humanoid', 'Creature'],
	categories: ['Human', 'Nephilim', 'Animal', 'Monster'],

	// ========================================================================
	// HUMANOID CATEGORY: HUMAN
	// ========================================================================
	Human: {
		classes: ['Production', 'Trade', 'Resources', 'Transport', 'Service', 'Administration', 'Knowledge', 'Society', 'Outlaw', 'Military'],
		subclasses: {
			Production: ['Blacksmith', 'Weaponsmith', 'Armorer', 'Shieldwright', 'Marshal', 'Tanner', 'Leatherworker', 'Carpenter', 'Fixer', 'Ironsmith'],
			Trade: [
				'Arms_Dealer',
				'Armourer_Merchant',
				'Shield_Seller',
				'Horse_Dealer',
				'Grazier',
				'Provisioner',
				'Grocer',
				'Peddler',
				'Banker',
				'Caravan_Master',
			],
			Resources: ['Farmer', 'Fisherman', 'Shepherd', 'Woodcutter', 'Forester', 'Miner', 'Quarryman', 'Hunter', 'Trapper', 'Horse_Breeder'],
			Transport: ['Messenger', 'Courier', 'Escort', 'Wainwright', 'Pilgrim', 'Wayfinder', 'Traveler', 'Outrider', 'Ferryman', 'Drayman'],
			Service: ['Innkeeper', 'Stablemaster', 'Ostler', 'Chamberlain', 'Cupbearer', 'Servant', 'Steward', 'Apothecary', 'Cook', 'Page'],
			Administration: ['Tax_Collector', 'Bailiff', 'Magistrate', 'Clerk', 'Notary', 'Reeve', 'Warden', 'Herald', 'Seneschal', 'Archivist'],
			Knowledge: ['Mentor', 'Warmaster', 'Fencing_Master', 'Magister', 'Physician', 'Surgeon', 'Herbalist', 'Scholar', 'Chronicler', 'Scribe'],
			Society: ['Noble', 'Lord', 'Chancellor', 'Banneret', 'Courtier', 'Envoy', 'Emissary', 'Patrician', 'Landowner', 'Patron'],
			Outlaw: ['Thief', 'Pickpocket', 'Burglar', 'Cutpurse', 'Highwayman', 'Smuggler', 'Fence', 'Poacher', 'Deserter', 'Thug'],
			Military: ['Sentry', 'Watchman', 'Soldier', 'Quartermaster', 'Mercenary', 'Sergeant', 'Captain', 'Bodyguard', 'Knight', 'Champion'],
		},
	},

	// ========================================================================
	// CREATURE CATEGORY: ANIMAL
	// ========================================================================
	Animal: {
		classes: ['Mount', 'Domestic', 'Wild'],
		subclasses: { Mount: ['Horse'], Domestic: ['Sheep', 'Goat', 'Pig', 'Cow'], Wild: ['Bear', 'Wolf', 'Boar', 'Deer', 'Fox', 'Hare'] },
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
	Monster: { classes: ['Common', 'Elite', 'Boss', 'Legendary'], subclasses: { Common: ['Dire_Wolf'], Elite: ['Cave_Troll'], Boss: [], Legendary: [] } },

	// ========================================================================
	// HUMANOID CATEGORY: NEPHILIM
	// ========================================================================
	Nephilim: {
		classes: ['Demigod'],
		subclasses: { Demigod: ['Scion_Of_Odin', 'Scion_Of_Thor', 'Scion_Of_Loki', 'Scion_Of_Saga', 'Scion_Of_Mars', 'Scion_Of_Cronos'] },
	},

	// ========================================================================
	// ACTION TAGS DICTIONARY (Universal Interactions)
	// ========================================================================
	actionTagsDictionary: {
		commerceEconomy: {
			Trade_Weapon: 'Enables purchasing or selling of physical Weapon class items.',
			Trade_Armour: 'Enables purchasing or selling of physical Armour class items.',
			Trade_Shield: 'Enables purchasing or selling of physical Shield class items.',
			Trade_Helmet: 'Enables purchasing or selling of physical Helmet class items.',
			Trade_Mount: 'Enables purchasing or selling of biological Mount class items.',
			Trade_Animal: 'Enables purchasing or selling of biological Animal entities.',
			Trade_Food: 'Enables purchasing or selling of Food resources.',
			Trade_Potion: 'Enables purchasing or selling of Potion consumables.',
			Trade_Coin: 'Enables the exchange of silverCoins for tradeSilver or tradeGold physical assets (Banker exclusive).',
			Trade_Loot: 'Enables purchasing or selling of non-equippable artifacts, monster parts, and trophies.',
		},
		employmentLabor: {
			Labor_Coin: 'Allows the player to perform tasks in exchange for silverCoins.',
			Labor_Food: 'Allows the player to perform tasks in exchange for Food resources.',
		},
		maintenanceRestoration: {
			Repair_Weapon: 'Restores the CurrentItemDurability of a Weapon class item.',
			Repair_Armour: 'Restores the CurrentItemDurability of an Armour class item.',
			Repair_Shield: 'Restores the CurrentItemDurability of a Shield class item.',
			Repair_Helmet: 'Restores the CurrentItemDurability of a Helmet class item.',
			Heal_Mount: 'Restores the hpCurrent value of an equipped biological Mount.',
			Heal_Player: 'Restores the operational hpCurrent of the Player.',
			Cure_Player: 'Restores the biological hpMax limit of the Player (curing diseases/severe wounds).',
		},
		combatHostility: {
			Combat_Engage: 'Initiates a lethal combat sequence (Normal or Deathmatch) against the human entity.',
			Combat_Duel: 'Initiates a formal duel (Friendly or Normal). No HP penalty if the human declines.',
			Combat_Ambush: 'Initiates a surprise attack sequence against the human (Normal or Deathmatch).',
			Combat_Brawl: 'Initiates a spontaneous, unstructured fight (Normal or Deathmatch).',
			Combat_Spar: 'Initiates a training combat sequence (Friendly). No lethal HP loss permitted.',
			Combat_Threaten: 'Initiates an intimidation skill check (Friendly). No HP loss if unsuccessful.',
		},
		targetVulnerability: {
			Target_Assassination: 'Enables the assassination execution protocol against the human (Deathmatch).',
			Target_Robbery: "Initiates a theft sequence targeting the human's equipped gear or high-value items.",
			Target_Steal_Coin: "Initiates a theft sequence targeting the human's silverCoins slot.",
			Target_Steal_Food: "Initiates a theft sequence targeting the human's Food slot.",
		},
		attributeProgression: {
			Train_STR: 'Allows the player to expend AP and silverCoins to increase base Strength.',
			Train_INT: 'Allows the player to expend AP and silverCoins to increase base Intellect.',
			Train_AGI: 'Allows the player to expend AP and silverCoins to increase base Agility.',
		},
		utilityLogistics: {
			Service_Lodging: 'Provides a safe rest location to restore AP and hpCurrent.',
			Service_Transport: 'Allows fast travel between specific map nodes for a silverCoin fee.',
			Service_Storage: 'Provides a secure vault to store physical items and reduce player encumbrance.',
		},
	},
	// ========================================================================
	// SHARED GENERATION CONFIGURATION (Humans & Nephilims)
	// ========================================================================
	generationConfig: {
		baseCoinMult: 100,
		baseFoodMult: 10,
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
			Divine: { itemProbability: { weapon: 100, armour: 100, shield: 100, helmet: 100, mount: 100 } },
			Veteran: { attributeModifier: 1.0, itemProbability: { weapon: 75, armour: 75, shield: 75, helmet: 75, mount: 50 } },
			Trained: { attributeModifier: 0.8, itemProbability: { weapon: 50, armour: 50, shield: 50, helmet: 50, mount: 25 } },
			Basic: { attributeModifier: 0.65, itemProbability: { weapon: 25, armour: 25, shield: 25, helmet: 25, mount: 10 } },
			None: { attributeModifier: 0.5, itemProbability: { weapon: 10, armour: 0, shield: 10, helmet: 0, mount: 0 } },
		},

		socialClassModifiers: {
			Divine: {
				economicCoinModifier: 10.0,
				economicFoodModifier: 5.0,
				commoditySilverProb: 100,
				commodityGoldProb: 50,
				itemProbability: { weapon: 100, armour: 100, shield: 100, helmet: 100, mount: 100 },
			},
			Rich: {
				economicCoinModifier: 5.0,
				economicFoodModifier: 2.0,
				commoditySilverProb: 30,
				commodityGoldProb: 10,
				itemProbability: { weapon: 50, armour: 75, shield: 25, helmet: 75, mount: 75 },
			},
			Normal: {
				economicCoinModifier: 1.0,
				economicFoodModifier: 1.0,
				commoditySilverProb: 10,
				commodityGoldProb: 0,
				itemProbability: { weapon: 50, armour: 25, shield: 50, helmet: 50, mount: 50 },
			},
			Poor: {
				economicCoinModifier: 0.2,
				economicFoodModifier: 0.5,
				commoditySilverProb: 0,
				commodityGoldProb: 0,
				itemProbability: { weapon: 25, armour: 0, shield: 25, helmet: 25, mount: 0 },
			},
		},
	},
};
