// File: src/data/TEMPLATE_NPC_Creature.js
// Description: Unified blueprint for Animal and Monster instantiation.

/**
 * NPC GENERATION REFERENCE GUIDE
 * ============================================================================
 * 1. ANIMAL DEFINITIONS
 * ----------------------------------------------------------------------------
 * entityArchetype:   'Creature'
 * entityCategory:    'Animal'
 * entityClass:       ['Wild', 'Domestic', 'Mount']
 * behaviorState:     ['Friendly', 'Neutral', 'Hostile']
 * isAlert:           Boolean (Default: false)
 * fleeHpThreshold:   Percentage (Default: 0.15)
 * resourceTag:       ['Wild_Game', 'Livestock']
 * foodConsumption:   Integer (Required for Mount/Domestic)
 * baseCoinValue:     Integer (Market price)
 * * 2. MONSTER DEFINITIONS
 * ----------------------------------------------------------------------------
 * entityArchetype:   'Creature'
 * entityCategory:    'Monster'
 * entityClass:       ['Common', 'Elite', 'Boss', 'Legendary']
 * behaviorState:     ['Hostile', 'Aggressive']
 * isAlert:           Boolean (Default: false)
 * fleeHpThreshold:   Percentage (Usually 0.00 for Bosses)
 * resourceTag:       ['Monster_Parts', 'Trophy', 'Divine_Essence']
 * foodConsumption:   0 (Static)
 * baseCoinValue:     0 (Value is derived from lootTableId)
 * * 3. SHARED STATS & TYPES
 * ----------------------------------------------------------------------------
 * entityRank:        Integer (1 - 5)
 * hpCurrent/Max:     Integer
 * innateStats:       Integer (ADP, DDR, STR, AGI, INT)
 * entityMass:        Integer (Kg)
 * lootTableId:       UUID or Null
 * ============================================================================
 */

export const CREATURE_TEMPLATE = {
	entityId: '', // Unique identifier generated at runtime (UUID)
	entityName: '', // Primary name of the creature instance
	entityDescription: '', // Narrative description for UI and lore

	classification: {
		entityArchetype: 'Creature',
		entityCategory: '', // Biological group (Animal or Monster)
		entityClass: '', // Power level or utility classification
		entitySubclass: '', // Species identifier for taxonomy mapping
		entityRank: 1, // Power scale used for stat generation
	},

	biology: {
		hpCurrent: 100, // Current health points
		hpMax: 100, // Maximum health points
	},

	stats: {
		innateAdp: 0, // Natural attack and damage protection
		innateDdr: 0, // Natural defense and damage reduction
		innateStr: 0, // Physical strength for mass and damage scaling
		innateAgi: 0, // Agility for speed and evasion scaling
		innateInt: 0, // Mental capacity for resistance or cunning
	},

	behavior: {
		behaviorState: 'Neutral', // Baseline disposition towards the player
		isAlert: false, // Awareness status regarding the player's presence
		fleeHpPercentThreshold: 0.15, // Vitality percentage that triggers escape attempt
	},

	logistics: {
		resourceTag: '', // Identifier for harvesting and resource types
		foodYield: 0, // Food units produced upon death or slaughter
		foodConsumption: 0, // Daily food requirement for upkeep
		entityMass: 0, // Weight added to global encumbrance (Kg)
	},

	economy: {
		baseCoinValue: 0, // Estimated market price for trade
		lootTableId: null, // Pointer to the drop table database
	},

	interactions: {
		actionTags: [], // Permitted interaction triggers for the player
	},
};
