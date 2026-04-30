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
		Monster: { DMF: ['WIN_FLEE', 'WIN_DEATH', 'LOSE_FLEE', 'LOSE_DEATH'] },
		Nephilim: { DMF: ['WIN_FLEE', 'WIN_DEATH', 'LOSE_FLEE', 'LOSE_DEATH'] },
	},

	// ------------------------------------------------------------------------
	// RESOLUTION CONSEQUENCES MATRIX
	// Defines exact modifiers, penalties, and yields for every outcome.
	// ------------------------------------------------------------------------
	resolutionConsequences: {
		Human: {
			FF: {
				WIN_SURRENDER: {
					condition: 'Opponent yields.',
					npcEquipmentDrop: false,
					npcEquipmentDropChance: 0,
					tableLootRewardPct: 0,
					coinYieldPct: 0,
					renModifier: 1,
					honModifier: 2,
					permadeath: false,
				},
				LOSE_SURRENDER: {
					condition: 'Player yields.',
					playerEquipmentDrop: false,
					playerEquipmentDropChance: 0,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0,
					renModifier: -3,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player flees a friendly fight.',
					playerEquipmentDrop: false,
					playerEquipmentDropChance: 0,
					tableLootPenaltyPct: 0,
					coinPenaltyPct: 0,
					renModifier: -3,
					honModifier: -3,
					permadeath: false,
				},
			},
			NF: {
				WIN_SURRENDER: {
					condition: 'Opponent submits.',
					npcEquipmentDrop: false,
					npcEquipmentDropChance: 0.1, // 10% chance per eligible slot to be confiscated as loot
					tableLootRewardPct: 0.5,
					coinYieldPct: 0.25,
					renModifier: 2,
					honModifier: 4,
					permadeath: false,
				},
				WIN_FLEE: {
					condition: 'Opponent escapes.',
					npcEquipmentDrop: true,
					npcEquipmentDropChance: 0.15, // 15% chance to drop weapons/helmet/shield when fleeing for life
					tableLootRewardPct: 0,
					coinYieldPct: 0.1,
					renModifier: 3,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_SURRENDER: {
					condition: 'Player submits.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 0.1, // 10% chance per eligible slot to be confiscated
					tableLootPenaltyPct: 0.5,
					coinPenaltyPct: 0.25,
					renModifier: -3,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 0.15, // 15% chance to drop gear in panic
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
					npcEquipmentDrop: true,
					npcEquipmentDropChance: 0.25,
					tableLootRewardPct: 0,
					coinYieldPct: 0.25,
					renModifier: 4,
					honModifier: 0,
					permadeath: false,
				},
				WIN_DEATH: {
					condition: 'Opponent is killed.',
					npcEquipmentDrop: true,
					npcEquipmentDropChance: 0.5, // 50% chance per NPC slot to drop as intact loot
					tableLootRewardPct: 1.0,
					coinYieldPct: 1.0,
					renModifier: 5,
					honModifier: -1,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 0.25, // 20% chance to drop weapons/helmet/shield when fleeing for life
					tableLootPenaltyPct: 0.25, // 25% chance to trigger backpack/resource loss
					coinPenaltyPct: 0.25,
					renModifier: -5,
					honModifier: -5,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 1.0, // 100% loss on death
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
					npcEquipmentDrop: false,
					npcEquipmentDropChance: 0,
					tableLootRewardPct: 0,
					foodYieldPct: 0,
					renModifier: 1,
					honModifier: 1,
					permadeath: false,
				},
				WIN_DEATH: {
					condition: 'Animal is killed.',
					npcEquipmentDrop: false,
					npcEquipmentDropChance: 0, // Animals drop parts via tableLoot, not standard equipment
					tableLootRewardPct: 1.0,
					foodYieldPct: 1.0,
					renModifier: 3,
					honModifier: -1,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 0.1,
					tableLootPenaltyPct: 0.15,
					foodPenaltyPct: 0,
					coinPenaltyPct: 0.05,
					renModifier: -5,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 1.0,
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
					npcEquipmentDrop: false,
					npcEquipmentDropChance: 0, // Monsters drop loot via tableLoot, not standard equipment
					tableLootRewardPct: 1.0,
					renModifier: 4,
					honModifier: 4,
					permadeath: false,
				},
				WIN_FLEE: {
					condition: 'Monster escapes.',
					npcEquipmentDrop: false,
					npcEquipmentDropChance: 0,
					tableLootRewardPct: 0,
					renModifier: 2,
					honModifier: 2,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 0.15,
					tableLootPenaltyPct: 0.3,
					coinPenaltyPct: 0.05,
					renModifier: -4,
					honModifier: 0,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 1.0,
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
					npcEquipmentDrop: true,
					npcEquipmentDropChance: 0.5, // High salvage chance for celestial/void gear
					tableLootRewardPct: 1.0,
					renModifier: 10,
					honModifier: 10,
					permadeath: false,
				},
				WIN_FLEE: {
					condition: 'Nephilim escapes.',
					npcEquipmentDrop: true,
					npcEquipmentDropChance: 0.25, // 25% chance to salvage something from a fleeing Nephilim
					tableLootRewardPct: 0,
					renModifier: 5,
					honModifier: 5,
					permadeath: false,
				},
				LOSE_FLEE: {
					condition: 'Player escapes.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 0.25, // High panic drop rate
					tableLootPenaltyPct: 0.5,
					coinPenaltyPct: 0.25,
					renModifier: -10,
					honModifier: -10,
					permadeath: false,
				},
				LOSE_DEATH: {
					condition: 'Player is killed.',
					playerEquipmentDrop: true,
					playerEquipmentDropChance: 1.0,
					tableLootPenaltyPct: 1.0,
					renModifier: 0,
					honModifier: 0,
					permadeath: true,
				},
			},
		},
	},
};
