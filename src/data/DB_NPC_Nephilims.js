// File: src/data/DB_NPC_NEPHILIMS.js
// Description: High-tier profiles for Nephilim entities, integrated with procedural equipment generation.

export const DB_NPC_NEPHILIMS = {
	// ========================================================================
	// WOLFSCAR
	// ========================================================================
	Wolfscar: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Wolfscar',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 420, hpMax: 420 },
		stats: {
			innateAdp: 30,
			innateDdr: 20,
			innateStr: 45,
			innateAgi: 45,
			innateInt: 20,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 115 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// GLOOMFEATHER
	// ========================================================================
	Gloomfeather: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Gloomfeather',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 300, hpMax: 300 },
		stats: {
			innateAdp: 25,
			innateDdr: 15,
			innateStr: 25,
			innateAgi: 50,
			innateInt: 40,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 75 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// IRONCOG
	// ========================================================================
	Ironcog: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Ironcog',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 480, hpMax: 480 },
		stats: {
			innateAdp: 35,
			innateDdr: 50,
			innateStr: 40,
			innateAgi: 15,
			innateInt: 30,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 240 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// TWINSPAWN
	// ========================================================================
	Twinspawn: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Twinspawn',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 350, hpMax: 350 },
		stats: {
			innateAdp: 20,
			innateDdr: 20,
			innateStr: 30,
			innateAgi: 40,
			innateInt: 45,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 95 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// CINDERHEART
	// ========================================================================
	Cinderheart: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Cinderheart',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 490, hpMax: 490 },
		stats: {
			innateAdp: 40,
			innateDdr: 40,
			innateStr: 50,
			innateAgi: 20,
			innateInt: 25,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 280 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// DUNEJACKAL
	// ========================================================================
	Dunejackal: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Dunejackal',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 380, hpMax: 380 },
		stats: {
			innateAdp: 35,
			innateDdr: 25,
			innateStr: 35,
			innateAgi: 45,
			innateInt: 30,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 105 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// DRAKESCALE
	// ========================================================================
	Drakescale: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Drakescale',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 460, hpMax: 460 },
		stats: {
			innateAdp: 40,
			innateDdr: 35,
			innateStr: 45,
			innateAgi: 30,
			innateInt: 30,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 210 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// VIPERFANG
	// ========================================================================
	Viperfang: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Viperfang',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 320, hpMax: 320 },
		stats: {
			innateAdp: 25,
			innateDdr: 20,
			innateStr: 25,
			innateAgi: 50,
			innateInt: 35,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 85 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// GANESHAI
	// ========================================================================
	Ganeshai: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Ganeshai',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 500, hpMax: 500 },
		stats: {
			innateAdp: 35,
			innateDdr: 45,
			innateStr: 50,
			innateAgi: 15,
			innateInt: 35,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 350 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// CLOUDSHRIKE
	// ========================================================================
	Cloudshrike: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Cloudshrike',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 280, hpMax: 280 },
		stats: {
			innateAdp: 30,
			innateDdr: 15,
			innateStr: 20,
			innateAgi: 50,
			innateInt: 30,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 65 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// CARRIONBEAK
	// ========================================================================
	Carrionbeak: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Carrionbeak',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 330, hpMax: 330 },
		stats: {
			innateAdp: 45,
			innateDdr: 25,
			innateStr: 30,
			innateAgi: 40,
			innateInt: 25,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 80 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// IRONHOOF
	// ========================================================================
	Ironhoof: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Ironhoof',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 475, hpMax: 475 },
		stats: {
			innateAdp: 30,
			innateDdr: 30,
			innateStr: 45,
			innateAgi: 35,
			innateInt: 20,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 290 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// CROCTUSK
	// ========================================================================
	Croctusk: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Croctusk',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 465, hpMax: 465 },
		stats: {
			innateAdp: 35,
			innateDdr: 40,
			innateStr: 50,
			innateAgi: 25,
			innateInt: 15,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 260 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// VENOMSTALKER
	// ========================================================================
	Venomstalker: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Venomstalker',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 340, hpMax: 340 },
		stats: {
			innateAdp: 25,
			innateDdr: 20,
			innateStr: 25,
			innateAgi: 50,
			innateInt: 40,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 90 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// HIVELORD
	// ========================================================================
	Hivelord: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Hivelord',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 410, hpMax: 410 },
		stats: {
			innateAdp: 40,
			innateDdr: 30,
			innateStr: 30,
			innateAgi: 25,
			innateInt: 50,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 140 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},

	// ========================================================================
	// OGREBLOOD
	// ========================================================================
	Ogreblood: {
		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Nephilim',
			entityClass: 'Demigod',
			entitySubclass: 'Ogreblood',
			entityRank: 5,
		},
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 500, hpMax: 500 },
		stats: {
			innateAdp: 30,
			innateDdr: 35,
			innateStr: 50,
			innateAgi: 15,
			innateInt: 15,
		},
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: {
			behaviorState: 'Aggressive',
			isAlert: false,
			fleeHpPercentThreshold: 0.0,
		},
		logistics: { resourceTag: 'Divine_Essence', entityMass: 320 },
		economy: { lootTableId: 'loot_nephilim' },
		interactions: { actionTags: ['Fight_Nephilim', 'Ambush_Nephilim'] },
	},
};
