// File: src/data/DB_NPC_Humans.js

export const DB_NPC_HUMANS = {
	// --- CLASS: PRODUCTION ---
	Blacksmith: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Weapon', 'Trade_Armor', 'Trade_Shield', 'Trade_Helmet'],
	},
	Weaponsmith: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Weapon'],
	},
	Armorer: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Armor'],
	},
	Shieldwright: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Shield'],
	},
	Marshal: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Trade_Mount', 'Heal_Mount', 'Trade_Animal'],
	},
	Tanner: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Armor'],
	},
	Leatherworker: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Armor'],
	},
	Carpenter: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Shield'],
	},
	Fixer: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Loot'],
	},
	Ironsmith: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Repair_Equipment'],
	},
	Tailor: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Armor'],
	},
	Weaver: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},
	Bowyer: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Repair_Equipment', 'Trade_Weapon'],
	},
	Fletcher: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Trade_Weapon'],
	},
	Mason: {
		entityClass: 'Production',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment'],
	},

	// --- CLASS: TRADE ---
	Arms_Dealer: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Weapon', 'Trade_Loot', 'Repair_Equipment'],
	},
	Armorer_Merchant: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Armor', 'Trade_Helmet', 'Trade_Shield'],
	},
	Shield_Seller: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Shield', 'Trade_Loot', 'Repair_Equipment'],
	},
	Horse_Dealer: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Mount', 'Trade_Animal', 'Heal_Mount'],
	},
	Grazier: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Food', 'Trade_Food', 'Trade_Animal'],
	},
	Provisioner: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Trade_Animal'],
	},
	Grocer: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Trade_Loot'],
	},
	Peddler: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Loot', 'Trade_Potion'],
	},
	Banker: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Trade_Coin', 'Trade_Loot'],
	},
	Caravan_Master: {
		entityClass: 'Trade',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Labor_Coin', 'Trade_Animal', 'Trade_Mount'],
	},

	// --- CLASS: RESOURCES ---
	Farmer: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Food', 'Trade_Food', 'Trade_Animal'],
	},
	Fisherman: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Food', 'Trade_Food'],
	},
	Shepherd: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Food', 'Trade_Food', 'Trade_Animal'],
	},
	Woodcutter: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},
	Forester: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Trade_Food', 'Trade_Animal', 'Trade_Loot'],
	},
	Miner: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},
	Quarryman: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},
	Hunter: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Trade_Food', 'Trade_Loot', 'Trade_Animal'],
	},
	Trapper: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Food', 'Trade_Loot', 'Trade_Animal'],
	},
	Horse_Breeder: {
		entityClass: 'Resources',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Mount', 'Trade_Animal'],
	},

	// --- CLASS: TRANSPORT ---
	Messenger: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},
	Courier: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},
	Escort: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Labor_Coin', 'Heal_Player'],
	},
	Wainwright: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Repair_Equipment'],
	},
	Pilgrim: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Donate_Pray', 'Donate_Food'],
	},
	Wayfinder: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Labor_Coin', 'Train_INT'],
	},
	Traveler: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Loot', 'Donate_Food'],
	},
	Outrider: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Heal_Mount', 'Trade_Loot'],
	},
	Ferryman: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},
	Drayman: {
		entityClass: 'Transport',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Trade_Animal'],
	},

	// --- CLASS: SERVICE ---
	Innkeeper: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Service_Lodging', 'Trade_Food', 'Trade_Animal'],
	},
	Stablemaster: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Heal_Mount', 'Trade_Mount'],
	},
	Ostler: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Heal_Mount', 'Trade_Animal'],
	},
	Chamberlain: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Service_Lodging', 'Trade_Coin'],
	},
	Cupbearer: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Trade_Potion'],
	},
	Servant: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Labor_Food'],
	},
	Steward: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Coin', 'Service_Lodging'],
	},
	Apothecary: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Cure_Player', 'Trade_Potion'],
	},
	Cook: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Food', 'Trade_Food'],
	},
	Page: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Donate_Food'],
	},
	Barkeep: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Food', 'Trade_Potion'],
	},
	Tavern_Keeper: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Service_Lodging', 'Trade_Food'],
	},
	Entertainer: {
		entityClass: 'Service',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Donate_Coin'],
	},

	// --- CLASS: ADMINISTRATION ---
	Tax_Collector: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Rich', honorClass: 'Bad', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Trade_Coin', 'Trade_Loot'],
	},
	Bailiff: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Labor_Coin', 'Trade_Coin'],
	},
	Magistrate: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Trade_Coin', 'Donate_Coin'],
	},
	Clerk: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Train_INT'],
	},
	Notary: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Trade_Coin'],
	},
	Reeve: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Labor_Coin', 'Trade_Coin'],
	},
	Warden: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Trade_Weapon', 'Trade_Armor'],
	},
	Herald: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Train_INT'],
	},
	Seneschal: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Trade_Coin', 'Service_Lodging'],
	},
	Archivist: {
		entityClass: 'Administration',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Train_INT', 'Trade_Loot'],
	},

	// --- CLASS: KNOWLEDGE ---
	Mentor: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Train_INT', 'Train_STR', 'Train_AGI'],
	},
	Warmaster: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Train_STR', 'Train_AGI', 'Trade_Weapon'],
	},
	Fencing_Master: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Veteran' },
		actionTags: ['Train_AGI', 'Train_STR', 'Trade_Weapon'],
	},
	Magister: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Train_INT', 'Cure_Player', 'Trade_Potion'],
	},
	Physician: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Heal_Player', 'Cure_Player', 'Trade_Potion'],
	},
	Surgeon: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Heal_Player'],
	},
	Herbalist: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Food', 'Trade_Potion', 'Cure_Player'],
	},
	Scholar: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Train_INT'],
	},
	Chronicler: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Train_INT'],
	},
	Scribe: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Train_INT'],
	},
	Alchemist: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Trade_Potion', 'Cure_Player', 'Train_INT'],
	},
	Astrologer: {
		entityClass: 'Knowledge',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Train_INT', 'Donate_Pray', 'Cure_Player'],
	},

	// --- CLASS: SOCIETY ---
	Noble: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Basic' },
		actionTags: ['Trade_Coin', 'Donate_Coin'],
	},
	Lord: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Trade_Coin', 'Trade_Mount'],
	},
	Chancellor: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Trade_Coin', 'Train_INT'],
	},
	Banneret: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Trade_Mount', 'Train_STR'],
	},
	Courtier: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Donate_Coin', 'Trade_Loot'],
	},
	Envoy: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Trade_Coin', 'Donate_Coin'],
	},
	Emissary: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Trained' },
		actionTags: ['Trade_Coin', 'Trade_Loot'],
	},
	Patrician: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Neutral', reputationClass: 'High', combatTraining: 'Basic' },
		actionTags: ['Trade_Coin', 'Trade_Loot'],
	},
	Landowner: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Bad', reputationClass: 'High', combatTraining: 'Basic' },
		actionTags: ['Trade_Food', 'Trade_Animal', 'Trade_Mount', 'Trade_Coin'],
	},
	Patron: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Donate_Coin', 'Trade_Coin'],
	},
	Beggar: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Donate_Coin', 'Donate_Food', 'Donate_Pray'],
	},
	Vagabond: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Donate_Food', 'Trade_Loot'],
	},
	Peasant: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Labor_Food', 'Donate_Coin', 'Donate_Food'],
	},
	Minstrel: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Labor_Coin', 'Donate_Coin', 'Train_AGI'],
	},
	Bard: {
		entityClass: 'Society',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Donate_Coin', 'Train_INT'],
	},

	// --- CLASS: OUTLAW ---
	Bandit: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Weapon', 'Trade_Loot'],
	},
	Thief: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Loot', 'Trade_Coin'],
	},
	Pickpocket: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Loot', 'Trade_Coin'],
	},
	Burglar: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Loot', 'Trade_Coin'],
	},
	Cutpurse: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'None' },
		actionTags: ['Trade_Loot', 'Trade_Coin'],
	},
	Highwayman: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Trade_Mount', 'Trade_Weapon'],
	},
	Smuggler: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Loot', 'Trade_Coin', 'Trade_Potion'],
	},
	Fence: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Trade_Weapon', 'Trade_Armor', 'Trade_Loot', 'Trade_Helmet', 'Trade_Shield', 'Trade_Coin'],
	},
	Poacher: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Trade_Food', 'Trade_Loot', 'Trade_Animal'],
	},
	Deserter: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Trade_Weapon', 'Trade_Armor'],
	},
	Thug: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Labor_Coin', 'Trade_Weapon'],
	},
	Assassin: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Normal', honorClass: 'Bad', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Trade_Weapon', 'Trade_Potion'],
	},
	Marauder: {
		entityClass: 'Outlaw',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Trade_Weapon', 'Trade_Loot'],
	},

	// --- CLASS: MILITARY ---
	Sentry: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Poor', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Train_AGI', 'Trade_Weapon'],
	},
	Watchman: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Train_STR', 'Trade_Weapon'],
	},
	Soldier: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Train_STR', 'Trade_Armor'],
	},
	Quartermaster: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Trade_Weapon', 'Trade_Armor', 'Trade_Shield', 'Trade_Helmet'],
	},
	Mercenary: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Low', combatTraining: 'Veteran' },
		actionTags: ['Labor_Coin', 'Train_STR', 'Trade_Weapon'],
	},
	Sergeant: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Veteran' },
		actionTags: ['Train_STR', 'Train_AGI'],
	},
	Captain: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Train_INT', 'Trade_Weapon'],
	},
	Bodyguard: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Labor_Coin', 'Train_STR', 'Trade_Armor'],
	},
	Knight: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Train_STR', 'Trade_Mount'],
	},
	Champion: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Train_STR', 'Train_AGI'],
	},
	Scout: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Normal', honorClass: 'Neutral', reputationClass: 'Mid', combatTraining: 'Trained' },
		actionTags: ['Labor_Coin', 'Train_AGI'],
	},
	Commander: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Train_INT', 'Trade_Mount'],
	},
	General: {
		entityClass: 'Military',
		generationProfile: { socialClass: 'Rich', honorClass: 'Good', reputationClass: 'High', combatTraining: 'Veteran' },
		actionTags: ['Train_INT', 'Trade_Mount'],
	},

	// --- CLASS: RELIGION ---
	Priest: {
		entityClass: 'Religion',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'High', combatTraining: 'None' },
		actionTags: ['Donate_Pray', 'Donate_Coin', 'Cure_Player'],
	},
	Cleric: {
		entityClass: 'Religion',
		generationProfile: { socialClass: 'Normal', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'Basic' },
		actionTags: ['Donate_Pray', 'Heal_Player', 'Cure_Player'],
	},
	Monk: {
		entityClass: 'Religion',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Donate_Pray', 'Donate_Food', 'Train_INT'],
	},
	Friar: {
		entityClass: 'Religion',
		generationProfile: { socialClass: 'Poor', honorClass: 'Good', reputationClass: 'Mid', combatTraining: 'None' },
		actionTags: ['Donate_Pray', 'Donate_Food', 'Heal_Player'],
	},
	Zealot: {
		entityClass: 'Religion',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Trained' },
		actionTags: ['Donate_Pray', 'Train_STR'],
	},
	Cultist: {
		entityClass: 'Religion',
		generationProfile: { socialClass: 'Poor', honorClass: 'Bad', reputationClass: 'Low', combatTraining: 'Basic' },
		actionTags: ['Donate_Pray', 'Trade_Loot'],
	},
};
