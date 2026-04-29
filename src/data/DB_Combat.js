// File: src/data/DB_Combat.js
// Description: Defines combat resolution matrices, permitted outcomes, and explicit consequences based on entity category.

export const DB_COMBAT = {
	// ------------------------------------------------------------------------
	// CORE TYPOLOGIES
	// ------------------------------------------------------------------------
	typologies: {
		combatTypes: ['FF', 'NF', 'DMF'], // Friendly Fight, Normal Fight, Deathmatch Fight
		npcCategories: ['Human', 'Animal', 'Monster', 'Nephilim'],
		combatOutcomes: [
			'WIN_SURRENDER',
			'WIN_FLEE',
			'WIN_DEATH',
			'LOSE_SURRENDER',
			'LOSE_FLEE',
			'LOSE_DEATH',
		],
	},

	// ------------------------------------------------------------------------
	// COMBAT PERMISSIONS MATRIX
	// Defines permitted outcomes based on entity category and combat type.
	// ------------------------------------------------------------------------
	permittedOutcomes: {
		Human: {
			FF: ['WIN_SURRENDER', 'LOSE_SURRENDER', 'LOSE_FLEE'],
			NF: ['WIN_SURRENDER', 'WIN_FLEE', 'LOSE_SURRENDER', 'LOSE_FLEE'],
			DMF: ['WIN_FLEE', 'WIN_DEATH', 'LOSE_FLEE', 'LOSE_DEATH'],
		},
		Animal: { DMF: ['WIN_FLEE', 'WIN_DEATH', 'LOSE_FLEE', 'LOSE_DEATH'] },
		Monster: { DMF: ['WIN_DEATH', 'LOSE_FLEE', 'LOSE_DEATH'] },
		Nephilim: { DMF: ['WIN_DEATH', 'LOSE_FLEE', 'LOSE_DEATH'] },
	},

	// ------------------------------------------------------------------------
	// RESOLUTION CONSEQUENCES MATRIX
	// Defines exact modifiers, penalties, and yields for every outcome.
	// * tableLootYieldPct: Percentage chance to procedurally generate a dynamic loot item (via ENGINE_LootCreation)
	// * coinYieldPct / foodYieldPct: Percentage of NPC's actual inventory taken
	// * equipmentDrop: Boolean dictating if the loser's physical gear is looted
	// ------------------------------------------------------------------------
	resolutionConsequences: {
		Human: {
			FF: {
				WIN_SURRENDER: {
					condition: 'Opponent yields.',
					hpRetentionMin: 10,
					equipmentDrop: false,
					tableLootYieldPct: 0,
					coinYieldPct: 0,
					renModifier: 1,
					honModifier: 1,
					permadeath: false,
				},
				LOSE_SURRENDER: {
					condition: 'Player yields.',
					hpRetentionMin: 1,
					playerEquipmentLoss: false,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0,
					renModifier: -3,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player flees a friendly fight.',
					hpRetentionMin: 1,
					playerEquipmentLoss: false,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0,
					renModifier: -5,
					honModifier: -5,
					permadeath: false,
				},
			},
			NF: {
				WIN_SURRENDER: {
					condition: 'Opponent submits.',
					hpRetentionMin: 5,
					equipmentDrop: false, // Loser keeps their gear
					tableLootYieldPct: 0.5, // 50% chance to drop a dynamic trade item
					coinYieldPct: 0.5, // Gets 50% of NPC's coins
					renModifier: 2,
					honModifier: 1,
					permadeath: false,
				},
				WIN_FLEE: {
					condition: 'Opponent escapes.',
					hpRetentionMin: 5,
					equipmentDrop: false,
					tableLootYieldPct: 0,
					coinYieldPct: 0.25,
					renModifier: 2,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_SURRENDER: {
					condition: 'Player submits.',
					hpRetentionMin: 1,
					playerEquipmentLoss: false,
					tableLootPenaltyPct: 0.5,
					coinPenaltyPct: 0.25,
					renModifier: -3,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					hpRetentionMin: 1,
					playerEquipmentLoss: false,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0.1,
					renModifier: -5,
					honModifier: -5,
					permadeath: false,
				},
			},
			DMF: {
				WIN_FLEE: {
					condition: 'Opponent escapes.',
					hpRetentionMin: 1,
					equipmentDrop: false,
					tableLootYieldPct: 0,
					coinYieldPct: 0.25,
					renModifier: 2,
					honModifier: 0,
					permadeath: false,
				},
				WIN_DEATH: {
					condition: 'Opponent is killed.',
					hpRetentionMin: 1,
					equipmentDrop: true, // Player loots the corpse's weapons and armor
					tableLootYieldPct: 1.0, // 100% chance to generate a dynamic item
					coinYieldPct: 1.0, // 100% of the NPC's coin pouch
					renModifier: 3,
					honModifier: -1,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					hpRetentionMin: 1,
					playerEquipmentLoss: false,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0.25,
					renModifier: -5,
					honModifier: -5,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					hpRetentionMin: 0,
					playerEquipmentLoss: true, // Player loses all equipped items
					tableLootPenaltyPct: 1.0,
					coinPenaltyPct: 1.0,
					renModifier: 0,
					honModifier: 0,
					permadeath: true,
				},
			},
		},
		Animal: {
			DMF: {
				WIN_FLEE: {
					condition: 'Animal escapes.',
					hpRetentionMin: 1,
					tableLootYieldPct: 0,
					foodYieldPct: 0,
					renModifier: 1,
					honModifier: 0,
					permadeath: false,
				},
				WIN_DEATH: {
					condition: 'Animal is killed.',
					hpRetentionMin: 1,
					tableLootYieldPct: 1.0, // Drops procedurally generated animal parts (hides, fangs)
					foodYieldPct: 1.0, // Yields 100% of its logistics.foodYield
					renModifier: 2,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					hpRetentionMin: 1,
					tableLootPenaltyPct: 0,
					foodPenaltyPct: 0,
					coinPenaltyPct: 0.05,
					renModifier: -5,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					hpRetentionMin: 0,
					playerEquipmentLoss: true,
					tableLootPenaltyPct: 1.0,
					foodPenaltyPct: 1.0,
					renModifier: 0,
					honModifier: 0,
					permadeath: true,
				},
			},
		},
		Monster: {
			DMF: {
				WIN_DEATH: {
					condition: 'Monster is killed.',
					hpRetentionMin: 1,
					tableLootYieldPct: 1.0, // Drops procedurally generated monster parts
					renModifier: 2,
					honModifier: 2,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					hpRetentionMin: 1,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0.05,
					renModifier: -4,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					hpRetentionMin: 0,
					playerEquipmentLoss: true,
					tableLootPenaltyPct: 1.0,
					renModifier: 0,
					honModifier: 0,
					permadeath: true,
				},
			},
		},
		Nephilim: {
			DMF: {
				WIN_DEATH: {
					condition: 'Nephilim is killed.',
					hpRetentionMin: 1,
					equipmentDrop: true, // Nephilims might wield weapons
					tableLootYieldPct: 1.0, // Drops procedurally generated celestial/void parts
					renModifier: 10,
					honModifier: 10,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					hpRetentionMin: 1,
					playerEquipmentLoss: false,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0.05,
					renModifier: -5,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					hpRetentionMin: 0,
					playerEquipmentLoss: true,
					tableLootPenaltyPct: 1.0,
					renModifier: 0,
					honModifier: 0,
					permadeath: true,
				},
			},
		},
	},
};
