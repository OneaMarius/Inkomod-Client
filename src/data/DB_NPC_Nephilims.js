// File: src/data/DB_NPC_NEPHILIMS.js
// Description: High-tier profiles for Nephilim entities, integrated with procedural equipment generation.

export const DB_NPC_NEPHILIMS = {
	// ========================================================================
	// CHILD OF ODIN (God of Survival/Wisdom)
	// ========================================================================
	Scion_Of_Odin: {
		classification: { entityArchetype: 'Humanoid', entityCategory: 'Nephilim', entityClass: 'Demigod', entitySubclass: 'Scion_Of_Odin', entityRank: 5 },
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 1500, hpMax: 1500 },
		stats: { innateAdp: 40, innateDdr: 40, innateStr: 40, innateAgi: 40, innateInt: 50 },
		social: { honorClass: 'Neutral', reputationClass: 'High' },
		behavior: { behaviorState: 'Neutral', isAlert: false, fleeHpPercentThreshold: 0.0 },
		logistics: { resourceTag: 'Divine_Essence', entityMass: 110 },
		economy: { lootTableId: 'loot_nephilim_odin' },
		interactions: { actionTags: ['Combat_Engage', 'Target_Bribe', 'Target_Assassination'] },
	},

	// ========================================================================
	// CHILD OF THOR (God of Items/Storms)
	// ========================================================================
	Scion_Of_Thor: {
		classification: { entityArchetype: 'Humanoid', entityCategory: 'Nephilim', entityClass: 'Demigod', entitySubclass: 'Scion_Of_Thor', entityRank: 5 },
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 1200, hpMax: 1200 },
		stats: { innateAdp: 30, innateDdr: 30, innateStr: 45, innateAgi: 25, innateInt: 25 },
		social: { honorClass: 'Neutral', reputationClass: 'High' },
		behavior: { behaviorState: 'Neutral', isAlert: false, fleeHpPercentThreshold: 0.0 },
		logistics: { resourceTag: 'Divine_Essence', entityMass: 150 },
		economy: { lootTableId: 'loot_nephilim_thor' },
		interactions: { actionTags: ['Combat_Engage', 'Combat_Duel', 'Target_Bribe'] },
	},

	// ========================================================================
	// CHILD OF LOKI (God of Stealth/Chaos)
	// ========================================================================
	Scion_Of_Loki: {
		classification: { entityArchetype: 'Humanoid', entityCategory: 'Nephilim', entityClass: 'Demigod', entitySubclass: 'Scion_Of_Loki', entityRank: 5 },
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 800, hpMax: 800 },
		stats: { innateAdp: 20, innateDdr: 15, innateStr: 25, innateAgi: 50, innateInt: 45 },
		social: { honorClass: 'Bad', reputationClass: 'High' },
		behavior: { behaviorState: 'Aggressive', isAlert: false, fleeHpPercentThreshold: 0.0 },
		logistics: { resourceTag: 'Divine_Essence', entityMass: 80 },
		economy: { lootTableId: 'loot_nephilim_loki' },
		interactions: { actionTags: ['Combat_Ambush', 'Target_Assassination', 'Target_Bribe'] },
	},

	// ========================================================================
	// CHILD OF SAGA (God of History/Lore)
	// ========================================================================
	Scion_Of_Saga: {
		classification: { entityArchetype: 'Humanoid', entityCategory: 'Nephilim', entityClass: 'Demigod', entitySubclass: 'Scion_Of_Saga', entityRank: 5 },
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 900, hpMax: 900 },
		stats: { innateAdp: 20, innateDdr: 20, innateStr: 20, innateAgi: 30, innateInt: 50 },
		social: { honorClass: 'Good', reputationClass: 'High' },
		behavior: { behaviorState: 'Neutral', isAlert: false, fleeHpPercentThreshold: 0.0 },
		logistics: { resourceTag: 'Divine_Essence', entityMass: 75 },
		economy: { lootTableId: 'loot_nephilim_saga' },
		interactions: { actionTags: ['Combat_Engage', 'Target_Bribe'] },
	},

	// ========================================================================
	// CHILD OF MARS (God of Combat)
	// ========================================================================
	Scion_Of_Mars: {
		classification: { entityArchetype: 'Humanoid', entityCategory: 'Nephilim', entityClass: 'Demigod', entitySubclass: 'Scion_Of_Mars', entityRank: 5 },
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 1000, hpMax: 1000 },
		stats: { innateAdp: 25, innateDdr: 25, innateStr: 50, innateAgi: 40, innateInt: 20 },
		social: { honorClass: 'Neutral', reputationClass: 'High' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.0 },
		logistics: { resourceTag: 'Divine_Essence', entityMass: 120 },
		economy: { lootTableId: 'loot_nephilim_mars' },
		interactions: { actionTags: ['Combat_Engage', 'Combat_Duel', 'Target_Assassination'] },
	},

	// ========================================================================
	// CHILD OF CRONOS (God of Time/Titans)
	// ========================================================================
	Scion_Of_Cronos: {
		classification: { entityArchetype: 'Humanoid', entityCategory: 'Nephilim', entityClass: 'Demigod', entitySubclass: 'Scion_Of_Cronos', entityRank: 5 },
		generationProfile: { socialClass: 'Divine', combatTraining: 'Divine' },
		biology: { hpCurrent: 1100, hpMax: 1100 },
		stats: { innateAdp: 35, innateDdr: 50, innateStr: 45, innateAgi: 15, innateInt: 45 },
		social: { honorClass: 'Neutral', reputationClass: 'High' },
		behavior: { behaviorState: 'Hostile', isAlert: false, fleeHpPercentThreshold: 0.0 },
		logistics: { resourceTag: 'Divine_Essence', entityMass: 160 },
		economy: { lootTableId: 'loot_nephilim_cronos' },
		interactions: { actionTags: ['Combat_Engage', 'Target_Assassination'] },
	},
};
