// File: src/data/DB_LOCATIONS_POIS.js
// Description: Civilized and Untamed Points of Interest definitions for Iron Nature: Knight of Medieval Old Days.

// ========================================================================
// CIVILIZED POIS (Sectors)
// ========================================================================
export const DB_LOCATIONS_POIS_Civilized = {
	Tavern: {
		classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Tavern', poiRank: 1, locationSpawnChance: 100 },
		spawns: {
			guaranteed: ['Innkeeper', 'Cook'],
			dynamic: {
				maxCapacity: 3,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 50 },
					{ npcClass: 'Transport', classSpawnChance: 40 },
					{ npcClass: 'Outlaw', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Workshop: {
		classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Workshop', poiRank: 1, locationSpawnChance: 100 },
		spawns: {
			guaranteed: ['Blacksmith', 'Blacksmith', 'Blacksmith', 'Blacksmith', 'Blacksmith'],
			dynamic: { maxCapacity: 5, pool: [{ npcClass: 'Production', classSpawnChance: 100 }] },
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Market: {
		classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Market', poiRank: 1, locationSpawnChance: 100 },
		spawns: {
			guaranteed: ['Grocer', 'Provisioner'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 60 },
					{ npcClass: 'Resources', classSpawnChance: 40 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Center: {
		classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Center', poiRank: 2, locationSpawnChance: 100 },
		spawns: {
			guaranteed: ['Banker', 'Physician'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 50 },
					{ npcClass: 'Society', classSpawnChance: 30 },
					{ npcClass: 'Knowledge', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Garrison: {
		classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Garrison', poiRank: 2, locationSpawnChance: 100 },
		spawns: { guaranteed: ['Captain', 'Sergeant'], dynamic: { maxCapacity: 6, pool: [{ npcClass: 'Military', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Arena: {
		classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Arena', poiRank: 3, locationSpawnChance: 100 },
		spawns: {
			guaranteed: ['Warmaster', 'Surgeon'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 60 },
					{ npcClass: 'Knowledge', classSpawnChance: 40 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
};

// ========================================================================
// UNTAMED POIS (Wild, Orbit, Edge)
// ========================================================================

export const DB_LOCATIONS_POIS_Untamed = {
	// ------------------------------------------------------------------------
	// WILD REGION
	// ------------------------------------------------------------------------
	Hunter_Camp: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Hunter_Camp',
			poiRank: 1,
			locationSpawnChance: 60,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 3,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 80 },
					{ npcClass: 'Trade', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Bandit_Hideout: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Bandit_Hideout',
			poiRank: 1,
			locationSpawnChance: 40,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcClass: 'Outlaw', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Overgrown_Ruins: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Overgrown_Ruins',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 2,
				pool: [
					{ npcClass: 'Knowledge', classSpawnChance: 60 },
					{ npcClass: 'Outlaw', classSpawnChance: 40 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// ------------------------------------------------------------------------
	// ORBIT REGION
	// ------------------------------------------------------------------------
	Howling_Ridge: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Howling_Ridge',
			poiRank: 2,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 3,
				pool: [
					{ npcClass: 'Transport', classSpawnChance: 70 },
					{ npcClass: 'Knowledge', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Pathfinder_Den: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Pathfinder_Den',
			poiRank: 1,
			locationSpawnChance: 50,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 50 },
					{ npcClass: 'Transport', classSpawnChance: 50 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Spring_Thicket: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Spring_Thicket',
			poiRank: 1,
			locationSpawnChance: 30,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 2,
				pool: [
					{ npcClass: 'Knowledge', classSpawnChance: 80 },
					{ npcClass: 'Resources', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// ------------------------------------------------------------------------
	// EDGE REGION
	// ------------------------------------------------------------------------
	Smuggler_Cove: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Smuggler_Cove',
			poiRank: 2,
			locationSpawnChance: 30,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 70 },
					{ npcClass: 'Trade', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Deserter_Camp: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Deserter_Camp',
			poiRank: 2,
			locationSpawnChance: 40,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 60 },
					{ npcClass: 'Outlaw', classSpawnChance: 40 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Cliffside_Outpost: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Cliffside_Outpost',
			poiRank: 3,
			locationSpawnChance: 20,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 3, pool: [{ npcClass: 'Military', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// ------------------------------------------------------------------------
	// TESTING REGION (SANDBOX)
	// ------------------------------------------------------------------------
	Sandbox_Arena: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Test',
			poiSubclass: 'Sandbox_Arena',
			poiRank: 5,
			locationSpawnChance: 0,
			enterUntamedPoiApCost: 0,
		},
		spawns: {
			guaranteed: [
				{ npcCategory: 'Human', npcClass: 'Military', npcSubclass: 'Captain' },
				{ npcCategory: 'Animal', npcClass: 'Wild', npcSubclass: 'Moose' },
				{ npcCategory: 'Monster', npcClass: 'Giant', npcSubclass: 'Cave_Troll' },
				{ npcCategory: 'Nephilim', npcClass: 'Demigod', npcSubclass: 'Scion_Of_Mars' },
			],
			dynamic: { maxCapacity: 12, pool: [{ npcCategory: 'Animal', npcClass: 'Wild', classSpawnChance: 100 }] },
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
};
