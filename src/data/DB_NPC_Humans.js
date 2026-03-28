// File: src/data/DB_NPC_Humans.js

export const DB_NPC_HUMANS = {
	// --- CLASS: PRODUCTION ---
	Blacksmith: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: [
			// Commerce & Economy (ROUTE_TRADE)
			'Repair_Equipment',
			'Trade_Weapon',
			'Trade_Armour',
			'Trade_Shield',
			'Trade_Helmet',
			'Trade_Mount',
			'Trade_Animal',
			'Trade_Food',
			'Trade_Potion',
			'Trade_Coin',
			'Trade_Loot',

			// Combat & Hostility (ROUTE_COMBAT)
			'Combat_Engage',
			'Combat_Duel',
			'Combat_Spar',
			'Combat_Brawl',
			'Combat_Ambush',
			'Fight_Humanoid',

			// Progression & Logistics (ROUTE_INSTANT)
			'Labor_Coin',
			'Service_Lodging',
			'Heal_Player',
			'Cure_Player',
			'Train_STR',
			'Train_AGI',
			'Train_INT',

			// Morality & Stealth (ROUTE_INSTANT)
			'Target_Assassination',
			'Target_Robbery',
			'Target_Steal_Coin',
			'Target_Steal_Food',
			'Target_Bribe',

			// Universal
			'Ignore',
		],
	},
	Weaponsmith: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Repair_Equipment', 'Trade_Weapon', 'Labor_Coin', 'Target_Robbery'],
	},
	Armorer: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Repair_Equipment', 'Trade_Armour', 'Labor_Coin', 'Target_Robbery'],
	},
	Shieldwright: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Repair_Equipment', 'Trade_Shield', 'Labor_Coin', 'Target_Steal_Coin'],
	},
	Marshal: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Trade_Mount', 'Heal_Mount', 'Combat_Spar', 'Combat_Duel'],
	},
	Tanner: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Repair_Equipment', 'Labor_Coin', 'Target_Steal_Coin', 'Combat_Threaten'],
	},
	Leatherworker: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Repair_Equipment', 'Labor_Coin', 'Target_Robbery', 'Combat_Threaten'],
	},
	Carpenter: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Repair_Equipment', 'Labor_Coin', 'Combat_Brawl'],
	},
	Fixer: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Target_Robbery', 'Trade_Loot', 'Combat_Threaten'],
	},
	Ironsmith: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Target_Robbery', 'Combat_Brawl'],
	},

	// --- CLASS: TRADE ---
	Arms_Dealer: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Weapon', 'Target_Robbery'],
	},
	Armourer_Merchant: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Armour', 'Target_Robbery'],
	},
	Shield_Seller: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Shield', 'Target_Robbery', 'Combat_Threaten'],
	},
	Horse_Dealer: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Mount', 'Target_Robbery'],
	},
	Grazier: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Trade_Animal', 'Labor_Food', 'Combat_Threaten'],
	},
	Provisioner: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Target_Steal_Food', 'Target_Robbery'],
	},
	Grocer: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Target_Steal_Food', 'Combat_Threaten'],
	},
	Peddler: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Loot', 'Target_Steal_Coin', 'Target_Robbery', 'Combat_Threaten'],
	},
	Banker: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Trade_Coin', 'Service_Storage', 'Target_Robbery', 'Target_Assassination'],
	},
	Caravan_Master: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Service_Transport', 'Labor_Coin', 'Combat_Duel'],
	},

	// --- CLASS: RESOURCES ---
	Farmer: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Labor_Food', 'Target_Steal_Food', 'Combat_Threaten'],
	},
	Fisherman: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Labor_Food', 'Target_Steal_Food', 'Combat_Threaten'],
	},
	Shepherd: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Food', 'Trade_Animal', 'Labor_Food', 'Combat_Brawl'],
	},
	Woodcutter: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Combat_Brawl'],
	},
	Forester: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Trade_Food', 'Target_Robbery', 'Combat_Duel'],
	},
	Miner: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Combat_Brawl'],
	},
	Quarryman: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Combat_Brawl'],
	},
	Hunter: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Trade_Food', 'Trade_Loot', 'Combat_Duel', 'Target_Robbery'],
	},
	Trapper: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Food', 'Trade_Loot', 'Target_Steal_Food', 'Combat_Brawl'],
	},
	Horse_Breeder: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Mount', 'Labor_Coin', 'Target_Robbery'],
	},

	// --- CLASS: TRANSPORT ---
	Messenger: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Service_Transport', 'Target_Robbery'],
	},
	Courier: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Service_Transport'],
	},
	Escort: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Labor_Coin', 'Combat_Spar'],
	},
	Wainwright: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Combat_Threaten'],
	},
	Pilgrim: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Target_Robbery', 'Target_Steal_Food', 'Combat_Threaten'],
	},
	Wayfinder: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Service_Transport', 'Labor_Coin', 'Combat_Duel'],
	},
	Traveler: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Target_Robbery', 'Target_Steal_Food', 'Combat_Brawl'],
	},
	Outrider: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Service_Transport', 'Combat_Engage', 'Combat_Spar'],
	},
	Ferryman: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Service_Transport', 'Labor_Coin', 'Combat_Threaten'],
	},
	Drayman: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Service_Transport', 'Combat_Threaten'],
	},

	// --- CLASS: SERVICE ---
	Innkeeper: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Service_Lodging', 'Service_Storage', 'Trade_Food', 'Combat_Threaten'],
	},
	Stablemaster: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Heal_Mount', 'Trade_Mount', 'Labor_Coin', 'Combat_Brawl'],
	},
	Ostler: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Heal_Mount', 'Labor_Coin', 'Combat_Threaten'],
	},
	Chamberlain: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Target_Robbery'],
	},
	Cupbearer: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Target_Steal_Coin', 'Combat_Threaten'],
	},
	Servant: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Target_Steal_Food', 'Combat_Threaten'],
	},
	Steward: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Service_Storage', 'Combat_Engage'],
	},
	Apothecary: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Cure_Player', 'Trade_Potion', 'Target_Robbery', 'Combat_Threaten'],
	},
	Cook: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Labor_Food', 'Target_Steal_Food'],
	},
	Page: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Combat_Brawl'],
	},

	// --- CLASS: ADMINISTRATION ---
	Tax_Collector: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Rich', honorClass: 'Bad', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Target_Robbery', 'Target_Assassination', 'Target_Steal_Coin'],
	},
	Bailiff: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Combat_Duel'],
	},
	Magistrate: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Combat_Duel', 'Target_Assassination'],
	},
	Clerk: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Combat_Threaten'],
	},
	Notary: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Combat_Threaten'],
	},
	Reeve: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Combat_Duel'],
	},
	Warden: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Combat_Duel'],
	},
	Herald: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Combat_Threaten'],
	},
	Seneschal: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Combat_Duel'],
	},
	Archivist: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Trade_Loot', 'Combat_Threaten'],
	},

	// --- CLASS: KNOWLEDGE ---
	Mentor: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Train_INT', 'Combat_Spar'],
	},
	Warmaster: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Train_STR', 'Combat_Duel', 'Combat_Spar'],
	},
	Fencing_Master: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Veteran' },
		actionTags: ['Train_AGI', 'Combat_Duel', 'Combat_Spar'],
	},
	Magister: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Train_INT', 'Combat_Threaten'],
	},
	Physician: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Heal_Player', 'Cure_Player', 'Target_Robbery'],
	},
	Surgeon: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Heal_Player', 'Labor_Coin', 'Combat_Brawl'],
	},
	Herbalist: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Trade_Potion', 'Cure_Player', 'Combat_Threaten'],
	},
	Scholar: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Train_INT', 'Labor_Coin', 'Target_Steal_Coin'],
	},
	Chronicler: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Target_Robbery', 'Combat_Threaten'],
	},
	Scribe: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Target_Steal_Coin', 'Combat_Threaten'],
	},

	// --- CLASS: SOCIETY ---
	Noble: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Basic' },
		actionTags: ['Target_Assassination', 'Target_Robbery'],
	},
	Lord: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Target_Assassination', 'Combat_Duel'],
	},
	Chancellor: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Target_Assassination'],
	},
	Banneret: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Combat_Duel', 'Combat_Spar'],
	},
	Courtier: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Target_Steal_Coin', 'Combat_Threaten'],
	},
	Envoy: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Combat_Duel', 'Target_Assassination'],
	},
	Emissary: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Target_Assassination'],
	},
	Patrician: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Basic' },
		actionTags: ['Target_Robbery'],
	},
	Landowner: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Bad', reputationClass: 'High', combatTraining: 'Basic' },
		actionTags: ['Target_Robbery', 'Combat_Engage'],
	},
	Patron: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Target_Steal_Coin'],
	},

	// --- CLASS: OUTLAW ---
	Thief: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Combat_Ambush', 'Target_Assassination', 'Target_Steal_Coin'],
	},
	Pickpocket: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Target_Steal_Coin', 'Combat_Ambush', 'Combat_Brawl'],
	},
	Burglar: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Target_Robbery', 'Target_Steal_Coin', 'Combat_Ambush'],
	},
	Cutpurse: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Target_Steal_Coin', 'Target_Assassination', 'Combat_Threaten'],
	},
	Highwayman: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Combat_Ambush', 'Target_Robbery'],
	},
	Smuggler: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Loot', 'Target_Robbery', 'Combat_Brawl'],
	},
	Fence: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Weapon', 'Trade_Armour', 'Trade_Loot', 'Target_Robbery'],
	},
	Poacher: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Trade_Food', 'Trade_Loot', 'Combat_Ambush', 'Target_Steal_Food'],
	},
	Deserter: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Target_Robbery', 'Combat_Brawl'],
	},
	Thug: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Combat_Engage', 'Target_Steal_Coin', 'Combat_Brawl'],
	},

	// --- CLASS: MILITARY ---
	Sentry: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Combat_Engage'],
	},
	Watchman: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage'],
	},
	Soldier: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Combat_Duel', 'Combat_Spar'],
	},
	Quartermaster: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Trade_Weapon', 'Trade_Armour'],
	},
	Mercenary: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Veteran' },
		actionTags: ['Combat_Engage', 'Labor_Coin', 'Combat_Spar'],
	},
	Sergeant: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Veteran' },
		actionTags: ['Combat_Engage', 'Combat_Duel', 'Combat_Spar'],
	},
	Captain: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Combat_Engage', 'Combat_Duel', 'Target_Assassination'],
	},
	Bodyguard: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Combat_Engage', 'Labor_Coin', 'Combat_Spar'],
	},
	Knight: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Combat_Engage', 'Combat_Duel', 'Combat_Spar'],
	},
	Champion: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Combat_Duel', 'Target_Assassination', 'Combat_Spar'],
	},
};
