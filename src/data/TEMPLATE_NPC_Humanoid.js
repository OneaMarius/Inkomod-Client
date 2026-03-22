// File: src/data/TEMPLATE_NPC_Humanoid.js
// Description: Unified blueprint for Human and Nephilim instantiation.

/**
 * NPC GENERATION REFERENCE GUIDE
 * ============================================================================
 * 1. HUMAN DEFINITIONS
 * ----------------------------------------------------------------------------
 * entityArchetype:   'Humanoid'
 * entityCategory:    'Human'
 * entityClass:       ['Production', 'Trade', 'Resources', 'Transport', 'Service', 'Administration', 'Knowledge', 'Society', 'Outlaw', 'Military']
 * entitySubclass:    [Specific profession based on class, e.g., 'Blacksmith', 'Mercenary']
 * combatTraining:    ['Veteran', 'Trained', 'Basic', 'None']
 * behaviorState:     ['Friendly', 'Neutral', 'Hostile']
 * isAlert:           Boolean (Default: false)
 * fleeHpThreshold:   Percentage (Variable based on combat training/class)
 * resourceTag:       ['Human_Loot']
 * inventory:         { coinCurrent: Integer, foodCurrent: Integer }
 * social:            { socialClass: String, honorClass: String, reputationClass: String }
 * * 2. NEPHILIM DEFINITIONS
 * ----------------------------------------------------------------------------
 * entityArchetype:   'Humanoid'
 * entityCategory:    'Nephilim'
 * entityClass:       ['Demigod']
 * entitySubclass:    ['Scion_Of_Mars', 'Scion_Of_Thor', 'Scion_Of_Loki', 'Scion_Of_Odin', 'Scion_Of_Vulcan', 'Scion_Of_Minerva']
 * combatTraining:    ['Divine']
 * behaviorState:     ['Neutral', 'Hostile', 'Aggressive']
 * isAlert:           Boolean (Default: false)
 * fleeHpThreshold:   Percentage (Usually 0.00)
 * resourceTag:       ['Divine_Essence']
 * inventory:         { coinCurrent: 0, foodCurrent: 0 }
 * social:            { socialClass: 'Divine', honorClass: 'Neutral', reputationClass: 'High' }
 * * 3. SHARED STATS & TYPES
 * ----------------------------------------------------------------------------
 * entityRank:        Integer (1 - 5)
 * hpCurrent/Max:     Integer
 * innateStats:       Integer (ADP, DDR, STR, AGI, INT) - Max 50 for base stats
 * equipment:         { weaponId: UUID/String, armourId: UUID/String, helmetId: UUID/String, shieldId: UUID/String, mountId: UUID/String }
 * entityMass:        Integer (Kg)
 * lootTableId:       UUID or Null
 * ============================================================================
 */

export const HUMANOID_TEMPLATE = {
	entityId: '', // Unique identifier generated at runtime (UUID)
	entityName: '', // Instance name (e.g., "Arthur Ironhand" or "Scion_Of_Mars")
	entityDescription: '', // Narrative text for UI and lore

	classification: {
		entityArchetype: 'Humanoid',
		entityCategory: '', // 'Human' or 'Nephilim'
		entityClass: '', // Professional class or 'Demigod'
		entitySubclass: '', // Specific profession or divine lineage
		entityRank: 1, // Power scale (1-5)
		combatTraining: '', // 'Veteran', 'Trained', 'Basic', 'None', or 'Divine'
	},

	biology: {
		hpCurrent: 100, // Current health points
		hpMax: 100, // Maximum health points
	},

	stats: {
		innateAdp: 0, // Natural attack base (before weapon modifiers)
		innateDdr: 0, // Natural defense base (before armour modifiers)
		innateStr: 0, // Physical power (Max 50)
		innateAgi: 0, // Speed and reflex (Max 50)
		innateInt: 0, // Mental capacity (Max 50)
	},

	equipment: {
		weaponId: null, // Pointer to DB_ITEMS / THOR generation
		armourId: null, // Pointer to DB_ITEMS / THOR generation
		helmetId: null, // Pointer to DB_ITEMS / THOR generation
		shieldId: null, // Pointer to DB_ITEMS / THOR generation
		mountId: null, // Pointer to DB_NPC_ANIMALS (Horse) or Artifact
	},

	inventory: {
		coinCurrent: 0, // Silver/Coin available for trade or looting
		foodCurrent: 0, // Food units available for trade or looting
	},

	social: {
		socialClass: '', // 'Rich', 'Normal', 'Poor', or 'Divine'
		honorClass: 'Neutral', // 'Good', 'Neutral', 'Bad'
		reputationClass: 'Mid', // 'High', 'Mid', 'Low'
	},

	behavior: {
		behaviorState: 'Neutral', // Baseline disposition towards the player
		isAlert: false, // Awareness status regarding the player's presence
		fleeHpPercentThreshold: 0.15, // Vitality percentage that triggers escape attempt
	},

	logistics: {
		resourceTag: '', // Identifier for harvesting upon death
		entityMass: 0, // Weight added to global encumbrance (Kg)
	},

	economy: {
		lootTableId: null, // Pointer to the drop table database for extra items
	},

	interactions: {
		actionTags: [], // Permitted interaction triggers for the player
	},
};
