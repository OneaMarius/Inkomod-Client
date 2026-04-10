// File: src/data/DB_NPC_Humans.js

export const DB_NPC_HUMANS = {
	// --- CLASS: PRODUCTION ---
	Blacksmith: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: [
			'Repair_Equipment',
			'Trade_Weapon',
			'Trade_Armour',
			'Trade_Shield',
			'Trade_Helmet',
			'Labor_Coin',
		],
	},
	Weaponsmith: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Repair_Equipment', 'Trade_Weapon', 'Labor_Coin'],
	},
	Armorer: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Repair_Equipment', 'Trade_Armour', 'Labor_Coin'],
	},
	Shieldwright: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Repair_Equipment', 'Trade_Shield', 'Labor_Coin'],
	},
	Marshal: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Trained',
		},
		actionTags: ['Trade_Mount', 'Heal_Mount'],
	},
	Tanner: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Repair_Equipment', 'Labor_Coin'],
	},
	Leatherworker: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Repair_Equipment', 'Labor_Coin'],
	},
	Carpenter: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Repair_Equipment', 'Labor_Coin'],
	},
	Fixer: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Loot'],
	},
	Ironsmith: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Labor_Coin'],
	},
	Tailor: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Armour', 'Labor_Coin'],
	},
	Weaver: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Loot', 'Labor_Coin'],
	},
	Bowyer: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Weapon', 'Labor_Coin'],
	},
	Fletcher: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Weapon', 'Labor_Coin'],
	},
	Mason: {
		entityClass: 'Production',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},

	// --- CLASS: TRADE ---
	Arms_Dealer: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Weapon'],
	},
	Armourer_Merchant: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Armour'],
	},
	Shield_Seller: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Shield'],
	},
	Horse_Dealer: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Mount'],
	},
	Grazier: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Food', 'Trade_Animal', 'Labor_Food'],
	},
	Provisioner: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Food'],
	},
	Grocer: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Food'],
	},
	Peddler: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Loot'],
	},
	Banker: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Coin'],
	},
	Caravan_Master: {
		entityClass: 'Trade',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'Trained',
		},
		actionTags: ['Labor_Coin'],
	},

	// --- CLASS: RESOURCES ---
	Farmer: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Good',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Food', 'Labor_Food'],
	},
	Fisherman: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Food', 'Labor_Food'],
	},
	Shepherd: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Food', 'Trade_Animal', 'Labor_Food'],
	},
	Woodcutter: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: ['Labor_Coin'],
	},
	Forester: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: ['Trade_Food'],
	},
	Miner: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: ['Labor_Coin'],
	},
	Quarryman: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: ['Labor_Coin'],
	},
	Hunter: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Trained',
		},
		actionTags: ['Trade_Food', 'Trade_Loot'],
	},
	Trapper: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Food', 'Trade_Loot'],
	},
	Horse_Breeder: {
		entityClass: 'Resources',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Mount', 'Labor_Coin'],
	},

	// --- CLASS: TRANSPORT ---
	Messenger: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Courier: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Escort: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: ['Labor_Coin'],
	},
	Wainwright: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},
	Pilgrim: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Good',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Wayfinder: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: ['Labor_Coin'],
	},
	Traveler: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Outrider: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Ferryman: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},
	Drayman: {
		entityClass: 'Transport',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},

	// --- CLASS: SERVICE ---
	Innkeeper: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Service_Lodging', 'Trade_Food'],
	},
	Stablemaster: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Heal_Mount', 'Trade_Mount', 'Labor_Coin'],
	},
	Ostler: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Heal_Mount', 'Labor_Coin'],
	},
	Chamberlain: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Cupbearer: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Servant: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},
	Steward: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Apothecary: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Cure_Player', 'Trade_Potion'],
	},
	Cook: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Food', 'Labor_Food'],
	},
	Page: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Good',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Barkeep: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Food', 'Trade_Potion'],
	},
	Tavern_Keeper: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Service_Lodging', 'Trade_Food'],
	},
	Entertainer: {
		entityClass: 'Service',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},

	// --- CLASS: ADMINISTRATION ---
	Tax_Collector: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Bad',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Bailiff: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Magistrate: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Clerk: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},
	Notary: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},
	Reeve: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Warden: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Herald: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Seneschal: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Archivist: {
		entityClass: 'Administration',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin', 'Trade_Loot'],
	},

	// --- CLASS: KNOWLEDGE ---
	Mentor: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: ['Train_INT'],
	},
	Warmaster: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: ['Train_STR'],
	},
	Fencing_Master: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Veteran',
		},
		actionTags: ['Train_AGI'],
	},
	Magister: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: ['Train_INT'],
	},
	Physician: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: ['Heal_Player', 'Cure_Player'],
	},
	Surgeon: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Heal_Player', 'Labor_Coin'],
	},
	Herbalist: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Food', 'Trade_Potion', 'Cure_Player'],
	},
	Scholar: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Train_INT', 'Labor_Coin'],
	},
	Chronicler: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Scribe: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},
	Alchemist: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Trade_Potion', 'Cure_Player'],
	},
	Astrologer: {
		entityClass: 'Knowledge',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Train_INT'],
	},

	// --- CLASS: SOCIETY ---
	Noble: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Lord: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Chancellor: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Banneret: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},
	Courtier: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Envoy: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Emissary: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Patrician: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Neutral',
			reputationClass: 'High',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Landowner: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Bad',
			reputationClass: 'High',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Patron: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Beggar: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Donate_Coin', 'Donate_Food'],
	},
	Vagabond: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: ['Donate_Food'],
	},
	Peasant: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Good',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Food', 'Donate_Coin'],
	},
	Minstrel: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Labor_Coin'],
	},
	Bard: {
		entityClass: 'Society',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Labor_Coin'],
	},

	// --- CLASS: OUTLAW ---
	Bandit: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Thief: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Pickpocket: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Burglar: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Cutpurse: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'None',
		},
		actionTags: [],
	},
	Highwayman: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Smuggler: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Loot'],
	},
	Fence: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: ['Trade_Weapon', 'Trade_Armour', 'Trade_Loot'],
	},
	Poacher: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Trained',
		},
		actionTags: ['Trade_Food', 'Trade_Loot'],
	},
	Deserter: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Thug: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Assassin: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Bad',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},
	Marauder: {
		entityClass: 'Outlaw',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},

	// --- CLASS: MILITARY ---
	Sentry: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
	Watchman: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Soldier: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Quartermaster: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: ['Trade_Weapon', 'Trade_Armour'],
	},
	Mercenary: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Low',
			combatTraining: 'Veteran',
		},
		actionTags: ['Labor_Coin'],
	},
	Sergeant: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},
	Captain: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},
	Bodyguard: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: ['Labor_Coin'],
	},
	Knight: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},
	Champion: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},
	Scout: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Neutral',
			reputationClass: 'Mid',
			combatTraining: 'Trained',
		},
		actionTags: ['Labor_Coin'],
	},
	Commander: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},
	General: {
		entityClass: 'Military',
		generationProfile: {
			socialClass: 'Rich',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'Veteran',
		},
		actionTags: [],
	},

	// --- CLASS: RELIGION ---
	Priest: {
		entityClass: 'Religion',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'High',
			combatTraining: 'None',
		},
		actionTags: ['Donate_Pray', 'Donate_Coin', 'Cure_Player'],
	},
	Cleric: {
		entityClass: 'Religion',
		generationProfile: {
			socialClass: 'Normal',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'Basic',
		},
		actionTags: ['Donate_Pray', 'Heal_Player'],
	},
	Monk: {
		entityClass: 'Religion',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Donate_Pray', 'Donate_Food'],
	},
	Friar: {
		entityClass: 'Religion',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Good',
			reputationClass: 'Mid',
			combatTraining: 'None',
		},
		actionTags: ['Donate_Pray'],
	},
	Zealot: {
		entityClass: 'Religion',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Trained',
		},
		actionTags: [],
	},
	Cultist: {
		entityClass: 'Religion',
		generationProfile: {
			socialClass: 'Poor',
			honorClass: 'Bad',
			reputationClass: 'Low',
			combatTraining: 'Basic',
		},
		actionTags: [],
	},
};
