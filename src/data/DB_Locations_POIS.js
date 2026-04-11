// File: src/data/DB_LOCATIONS_POIS.js
// Description: Civilized and Untamed Points of Interest definitions for Iron Nature: Knight of Medieval Old Days.

// ========================================================================
// CIVILIZED POIS (Sectors)
// ========================================================================
export const DB_LOCATIONS_POIS_Civilized = {
	Tavern: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Tavern',
			poiRank: 1,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Tavern_Keeper', 'Barkeep', 'Entertainer'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 50 },
					{ npcClass: 'Society', classSpawnChance: 30 },
					{ npcClass: 'Outlaw', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Workshop: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Workshop',
			poiRank: 1,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Blacksmith', 'Tailor', 'Carpenter'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Production', classSpawnChance: 70 },
					{ npcClass: 'Transport', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Market: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Market',
			poiRank: 1,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Provisioner', 'Peddler', 'Farmer'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 50 },
					{ npcClass: 'Resources', classSpawnChance: 30 },
					{ npcClass: 'Production', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Center: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Center',
			poiRank: 2,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Magistrate', 'Banker', 'Patrician'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 40 },
					{ npcClass: 'Society', classSpawnChance: 40 },
					{ npcClass: 'Trade', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Garrison: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Garrison',
			poiRank: 2,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Captain', 'Quartermaster', 'Watchman'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 80 },
					{ npcClass: 'Administration', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Arena: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Arena',
			poiRank: 3,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Warmaster', 'Fencing_Master', 'Surgeon'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 60 },
					{ npcClass: 'Knowledge', classSpawnChance: 40 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Temple: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Temple',
			poiRank: 2,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Priest', 'Scholar', 'Monk'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Religion', classSpawnChance: 60 },
					{ npcClass: 'Knowledge', classSpawnChance: 40 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Outskirts: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Outskirts',
			poiRank: 1,
			locationSpawnChance: 100,
		},
		spawns: {
			guaranteed: ['Smuggler', 'Fence', 'Vagabond'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 50 },
					{ npcClass: 'Transport', classSpawnChance: 30 },
					{ npcClass: 'Resources', classSpawnChance: 20 },
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
	// GENERIC UNTAMED (Can spawn in Wild, Orbit, or Edge)
	// ------------------------------------------------------------------------
	Abandoned_Camp: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Abandoned_Camp',
			poiRank: 1,
			locationSpawnChance: 80,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Vagabond'],
			dynamic: {
				maxCapacity: 3,
				pool: [
					{ npcClass: 'Society', classSpawnChance: 50 },
					{ npcClass: 'Outlaw', classSpawnChance: 50 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
	Hidden_Cache: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Hidden_Cache',
			poiRank: 2,
			locationSpawnChance: 40,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Smuggler', 'Fence'],
			dynamic: {
				maxCapacity: 4,
				pool: [{ npcClass: 'Outlaw', classSpawnChance: 100 }],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
	Wandering_Merchant: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Wandering_Merchant',
			poiRank: 2,
			locationSpawnChance: 50,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Caravan_Master', 'Escort'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 60 },
					{ npcClass: 'Military', classSpawnChance: 40 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

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
			guaranteed: ['Hunter', 'Trapper'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 70 },
					{ npcClass: 'Trade', classSpawnChance: 30 },
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
		spawns: {
			guaranteed: ['Bandit', 'Thug'],
			dynamic: {
				maxCapacity: 5,
				pool: [{ npcClass: 'Outlaw', classSpawnChance: 100 }],
			},
		},
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
			guaranteed: ['Scholar'],
			dynamic: {
				maxCapacity: 3,
				pool: [
					{ npcClass: 'Knowledge', classSpawnChance: 50 },
					{ npcClass: 'Outlaw', classSpawnChance: 50 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
	Druids_Grove: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Druids_Grove',
			poiRank: 3,
			locationSpawnChance: 20,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Herbalist', 'Cultist'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Religion', classSpawnChance: 70 },
					{ npcClass: 'Knowledge', classSpawnChance: 30 },
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
			guaranteed: ['Outrider'],
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
			guaranteed: ['Wayfinder', 'Scout'],
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
			guaranteed: ['Forrester'],
			dynamic: {
				maxCapacity: 3,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 80 },
					{ npcClass: 'Knowledge', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
	Pilgrim_Rest: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Pilgrim_Rest',
			poiRank: 1,
			locationSpawnChance: 45,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Pilgrim', 'Friar'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Transport', classSpawnChance: 50 },
					{ npcClass: 'Religion', classSpawnChance: 50 },
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
			guaranteed: ['Smuggler', 'Fence'],
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
			guaranteed: ['Deserter', 'Soldier'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 40 },
					{ npcClass: 'Outlaw', classSpawnChance: 60 },
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
		spawns: {
			guaranteed: ['Sentry', 'Watchman'],
			dynamic: {
				maxCapacity: 4,
				pool: [{ npcClass: 'Military', classSpawnChance: 100 }],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
	Mining_Claim: {
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Mining_Claim',
			poiRank: 2,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Miner', 'Quarryman'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 80 },
					{ npcClass: 'Outlaw', classSpawnChance: 20 },
				],
			},
		},
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
				{
					npcCategory: 'Human',
					npcClass: 'Military',
					npcSubclass: 'Captain',
				},
				{
					npcCategory: 'Animal',
					npcClass: 'Wild',
					npcSubclass: 'Bear',
				},
			],
			dynamic: {
				maxCapacity: 8,
				pool: [
					{
						npcCategory: 'Animal',
						npcClass: 'Wild',
						classSpawnChance: 100,
					},
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
};
