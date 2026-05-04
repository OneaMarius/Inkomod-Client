// File: src/data/DB_LOCATIONS_POIS.js
// Description: Civilized and Untamed Points of Interest definitions for Iron Nature: Knight of Medieval Old Days.

// ========================================================================
// CIVILIZED POIS (Sectors) - 16 Locations
// ========================================================================
export const DB_LOCATIONS_POIS_Civilized = {
	// 0. ROYAL PALACE
	Royal_Palace: {
		description: 'The opulent seat of power, glittering with gold. Here, King Midas awaits the champions who would cleanse the realm of the Demigod threat.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Palace',
			poiRank: 5,
			spawnChances: { Village: 0, Town: 0, City: 0, Castle: 0, Palace: 100 },
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 0, pool: [] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location', 'Present_Trophies'] },
	},

	// 1. TAVERN
	Tavern: {
		description:
			'A lively place, thick with the smell of ale, hearth smoke, and cheerful songs. Travelers, mercenaries, and locals gather here to trade stories and relax.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Tavern',
			poiRank: 1,
			spawnChances: { Village: 100, Town: 100, City: 100, Castle: 50, Palace: 0 },
		},
		spawns: {
			guaranteed: ['Tavern_Keeper'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 40, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Low_Society', classSpawnChance: 25, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Military', classSpawnChance: 20, reputationClass: ['Mid', 'Low'] },
					{ npcClass: 'Outlaw', classSpawnChance: 10, reputationClass: ['Mid', 'Low'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 5 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 2. MARKET
	Market: {
		description:
			'Colorful stalls and loud merchants display fresh goods. The clinking of coins mingles with the shouts of peddlers and the occasional braying of pack animals.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Market',
			poiRank: 1,
			spawnChances: { Village: 100, Town: 100, City: 100, Castle: 50, Palace: 10 },
		},
		spawns: {
			guaranteed: ['Provisioner'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 45, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Production', classSpawnChance: 20, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Low_Society', classSpawnChance: 15, socialClass: ['Normal', 'Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 3. WORKSHOP
	Workshop: {
		description:
			'The ringing of hammers and the scent of freshly cut wood dominate this area. Dedicated artisans work tirelessly to craft and repair everyday goods and weapons.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Workshop',
			poiRank: 1,
			spawnChances: { Village: 50, Town: 75, City: 100, Castle: 75, Palace: 50 },
		},
		spawns: {
			guaranteed: ['Blacksmith'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Production', classSpawnChance: 75, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Service', classSpawnChance: 15, socialClass: ['Poor'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 4. GARRISON
	Garrison: {
		description:
			'A fortified, highly disciplined, and orderly area where soldiers train, spar, and maintain their weapons. Only capable combatants are stationed here.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Garrison',
			poiRank: 2,
			spawnChances: { Village: 0, Town: 25, City: 50, Castle: 75, Palace: 100 },
		},
		spawns: {
			guaranteed: ['Captain'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 75, combatTraining: ['Trained', 'Veteran'], reputationClass: ['Mid', 'High'] },
					{ npcClass: 'Administration', classSpawnChance: 15, socialClass: ['Normal', 'Rich'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 5. ARENA
	Arena: {
		description:
			"A grand amphitheater with blood-stained sand, hosting spectacular fights. Skilled warriors and desperate challengers face lethal odds for the crowd's entertainment.",
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Arena',
			poiRank: 3,
			spawnChances: { Village: 10, Town: 25, City: 50, Castle: 75, Palace: 100 },
		},
		spawns: {
			guaranteed: ['Warmaster'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 60, combatTraining: ['Trained', 'Veteran'] },
					{ npcClass: 'Low_Society', classSpawnChance: 20, socialClass: ['Poor'] },
					{ npcClass: 'Administration', classSpawnChance: 20, socialClass: ['Normal', 'Rich'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 6. TEMPLE
	Temple: {
		description:
			'A grandiose building with towering columns, dedicated to the major gods. High-ranking priests, nobles, and scholars preserve sacred knowledge within its pristine halls.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Temple',
			poiRank: 2,
			spawnChances: { Village: 5, Town: 15, City: 25, Castle: 50, Palace: 75 },
		},
		spawns: {
			guaranteed: ['Priest'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 60, socialClass: ['Normal', 'Rich'], honorClass: ['Good', 'Neutral'] },
					{ npcClass: 'High_Society', classSpawnChance: 40, socialClass: ['Rich'], honorClass: ['Good', 'Neutral'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 7. CHURCH
	Church: {
		description:
			'A modest but always open stone chapel, serving as the spiritual core of the local community. A quiet sanctuary where common folk pray and the destitute seek charity.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Church',
			poiRank: 1,
			spawnChances: { Village: 75, Town: 50, City: 25, Castle: 15, Palace: 0 },
		},
		spawns: {
			guaranteed: ['Cleric'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 50, socialClass: ['Poor', 'Normal'], honorClass: ['Good'] },
					{ npcClass: 'Low_Society', classSpawnChance: 40, socialClass: ['Poor'] },
					{ npcClass: 'High_Society', classSpawnChance: 10, honorClass: ['Good'] }, // Nobili care donează
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 8. OUTSKIRTS
	Outskirts: {
		description:
			'The muddy, neglected fringes of the settlement. Smugglers, weary travelers, and those avoiding the watchful eyes of the guards operate in the shadows here.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Outskirts',
			poiRank: 1,
			spawnChances: { Village: 100, Town: 75, City: 50, Castle: 25, Palace: 0 },
		},
		spawns: {
			guaranteed: ['Smuggler'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 45, reputationClass: ['Low', 'Mid'], socialClass: ['Poor', 'Normal'] },
					{ npcClass: 'Low_Society', classSpawnChance: 35, socialClass: ['Poor'], reputationClass: ['Low', 'Mid'] },
					{ npcClass: 'Trade', classSpawnChance: 20, socialClass: ['Poor', 'Normal'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 9. SLUMS (NEW)
	Slums: {
		description:
			'A cramped, decaying district where the destitute struggle to survive. Beggars, cutpurses, and desperate commoners crowd the narrow, foul-smelling alleyways.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Slums',
			poiRank: 1,
			spawnChances: { Village: 0, Town: 50, City: 100, Castle: 25, Palace: 0 },
		},
		spawns: {
			guaranteed: ['Beggar'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Low_Society', classSpawnChance: 60, socialClass: ['Poor'], reputationClass: ['Low'] },
					{ npcClass: 'Outlaw', classSpawnChance: 30, socialClass: ['Poor'], reputationClass: ['Low'] },
					{ npcClass: 'Service', classSpawnChance: 10, socialClass: ['Poor'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 10. STABLES
	Stables: {
		description:
			'A spacious complex of paddocks, always clean and filled with fresh hay. Messengers, outriders, and guards tend strictly to their riding horses and war mounts here.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Stables',
			poiRank: 1,
			spawnChances: { Village: 25, Town: 50, City: 75, Castle: 100, Palace: 100 },
		},
		spawns: {
			guaranteed: ['Stablemaster'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 40, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Military', classSpawnChance: 30, combatTraining: ['Trained', 'Veteran'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 11. INFIRMARY
	Infirmary: {
		description:
			'Orderly beds and a pungent air of boiled herbs and medicinal alcohol. Surgeons, physicians, and dedicated healers work ceaselessly to save the afflicted.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Infirmary',
			poiRank: 2,
			spawnChances: { Village: 25, Town: 50, City: 100, Castle: 100, Palace: 50 },
		},
		spawns: {
			guaranteed: ['Surgeon'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 70, honorClass: ['Good', 'Neutral'] },
					{ npcClass: 'Service', classSpawnChance: 30, socialClass: ['Poor', 'Normal'] }, // Servants helping the sick
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 12. LIBRARY
	Library: {
		description:
			'A profound silence hangs over halls lined with massive tomes and ancient parchments. Educated scholars and noble bureaucrats study the archives in peace.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Library',
			poiRank: 2,
			spawnChances: { Village: 0, Town: 25, City: 75, Castle: 50, Palace: 100 },
		},
		spawns: {
			guaranteed: ['Scholar'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 70, socialClass: ['Normal', 'Rich'] },
					{ npcClass: 'High_Society', classSpawnChance: 30, socialClass: ['Rich'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 13. GATEHOUSE
	Gatehouse: {
		description:
			'The heavily guarded main checkpoint. Vigilant soldiers and stern tax collectors strictly inspect the goods, weapons, and intentions of anyone passing through.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Gatehouse',
			poiRank: 2,
			spawnChances: { Village: 0, Town: 25, City: 50, Castle: 100, Palace: 100 },
		},
		spawns: {
			guaranteed: ['Tax_Collector'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 60, combatTraining: ['Trained', 'Veteran'], reputationClass: ['Mid', 'High'] },
					{ npcClass: 'Administration', classSpawnChance: 25, socialClass: ['Normal', 'Rich'] },
					{ npcClass: 'Trade', classSpawnChance: 15, socialClass: ['Normal', 'Rich'] }, // Comercianți așteptând să treacă
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 14. TREASURY
	Treasury: {
		description:
			'An imposing building equipped with heavy steel doors and complex locks. Elite officials and bankers manage the settlement’s gold under heavy guard.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Treasury',
			poiRank: 3,
			spawnChances: { Village: 0, Town: 0, City: 25, Castle: 50, Palace: 100 },
		},
		spawns: {
			guaranteed: ['Banker'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 50, socialClass: ['Rich', 'Normal'], reputationClass: ['High', 'Mid'] },
					{ npcClass: 'Military', classSpawnChance: 35, combatTraining: ['Veteran'], reputationClass: ['High'] },
					{ npcClass: 'High_Society', classSpawnChance: 15, socialClass: ['Rich'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 15. GUILDHALL
	Guildhall: {
		description:
			'The luxurious headquarters of trade associations. Elite merchants, wealthy caravan masters, and influential society members sign valuable contracts here.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Guildhall',
			poiRank: 2,
			spawnChances: { Village: 0, Town: 25, City: 100, Castle: 75, Palace: 50 },
		},
		spawns: {
			guaranteed: ['Patrician'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 50, socialClass: ['Rich', 'Normal'], reputationClass: ['High', 'Mid'] },
					{ npcClass: 'High_Society', classSpawnChance: 30, socialClass: ['Rich'] },
					{ npcClass: 'Production', classSpawnChance: 20, socialClass: ['Rich', 'Normal'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 16. GARDENS
	Gardens: {
		description:
			'Meticulously maintained, serene gardens with exotic trees and crystal-clear fountains. The nobility and high society stroll lazily along the quiet paths.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Gardens',
			poiRank: 2,
			spawnChances: { Village: 0, Town: 0, City: 25, Castle: 75, Palace: 100 },
		},
		spawns: {
			guaranteed: ['Lord'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'High_Society', classSpawnChance: 70, socialClass: ['Rich'] },
					{ npcClass: 'Administration', classSpawnChance: 30, socialClass: ['Rich', 'Normal'], reputationClass: ['High'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// 17. PASTURE
	Pasture: {
		description:
			'A rich, open field protected by solid wooden fences. Local shepherds and farmers watch over massive herds of livestock that feed the local economy.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'CIVILIZED',
			poiClass: 'Sector',
			poiSubclass: 'Pasture',
			poiRank: 1,
			spawnChances: { Village: 75, Town: 50, City: 25, Castle: 15, Palace: 0 },
		},
		spawns: {
			guaranteed: ['Shepherd'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 30, socialClass: ['Poor', 'Normal'] },
					{ npcClass: 'Low_Society', classSpawnChance: 20, socialClass: ['Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 50 },
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
	// ========================================================================
	// GENERIC UNTAMED (Can spawn in Wild, Orbit, or Edge)
	// ========================================================================

	Craftsman_Camp: {
		description:
			'The rhythmic ringing of a hammer striking an anvil echoes through the trees. You see a cluster of sturdy tents and makeshift forges where busy artisans hone their craft in the wilderness.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Craftsman_Camp',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Blacksmith'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Production', classSpawnChance: 80, socialClass: ['Normal', 'Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Nomad_Market: {
		description:
			'Colorful pavilions are pitched in a small clearing. The scent of exotic spices and the chatter of busy provisioners, traveling merchants, and wanderers fill the air.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Nomad_Market',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Provisioner'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 50, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Low_Society', classSpawnChance: 20, socialClass: ['Normal', 'Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 15 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Resource_Camp: {
		description:
			"You find a rugged encampment surrounded by stacked pelts, chopped wood, and tools. Sturdy laborers and hunters move about, processing the land's bounty away from the safety of walls.",
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Resource_Camp',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Hunter'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 80, socialClass: ['Poor', 'Normal'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Travelers_Rest: {
		description:
			'A modest waystation provides brief respite from the harsh wilderness. Messengers, pilgrims, and weary travelers can be seen resting near the fire, exchanging news from the road.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Travelers_Rest',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Messenger'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 40, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Low_Society', classSpawnChance: 30, honorClass: ['Good', 'Neutral'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Roadside_Inn: {
		description:
			'A surprisingly sturdy timber building stands near a beaten path. Smoke rises from the chimney, and the welcoming smells of a hearty stew and ale suggest the keeper is ready for patrons.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Roadside_Inn',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Innkeeper'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 50, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Trade', classSpawnChance: 20, socialClass: ['Normal', 'Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Tax_Outpost: {
		description:
			'A fortified checkpoint bears the unmistakable banners of regional authority. Stern officials monitor the area, demanding tolls, backed by disciplined military guards.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Tax_Outpost',
			poiRank: 3,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Tax_Collector'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 40, socialClass: ['Rich', 'Normal'] },
					{ npcClass: 'Military', classSpawnChance: 40, combatTraining: ['Trained', 'Veteran'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Field_Hospital: {
		description:
			'Tents smelling of strong alcohol and bitter herbs are arranged in an orderly fashion. Surgeons, clerics, and scholars rush between cots, tending to the wounded and sick.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Field_Hospital',
			poiRank: 3,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Surgeon'],
			dynamic: { maxCapacity: 5, pool: [{ npcClass: 'Administration', classSpawnChance: 100, honorClass: ['Good', 'Neutral'] }] },
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Noble_Hunting_Camp: {
		description:
			'Luxurious pavilions and finely bred hunting hounds contrast sharply with the wild surroundings. A lord and their heavily armed entourage are out seeking sport and leisure.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Noble_Hunting_Camp',
			poiRank: 3,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Lord'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'High_Society', classSpawnChance: 50, socialClass: ['Rich'] },
					{ npcClass: 'Military', classSpawnChance: 20, reputationClass: ['High', 'Mid'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Brigand_Den: {
		description:
			'Hidden behind dense foliage, a squalid camp reeks of cheap ale and stale sweat. Rough-looking marauders and outlaws sharpen their blades, waiting for their next victim.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Brigand_Den',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Marauder'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 85, honorClass: ['Bad'], reputationClass: ['Low'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Patrol_Outpost: {
		description:
			'A disciplined military encampment surrounded by a wooden palisade. A captain barks orders to watchful guards, scouts, and outriders maintaining the perimeter.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Patrol_Outpost',
			poiRank: 3,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Captain'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 75, combatTraining: ['Trained', 'Veteran'], reputationClass: ['Mid', 'High'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 25 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Remote_Shrine: {
		description:
			'An ancient stone altar, adorned with fresh offerings, stands quietly in a secluded glade. Devoted clerics and dedicated pilgrims are gathered in solemn prayer.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Remote_Shrine',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Cleric'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 60, honorClass: ['Good', 'Neutral'] },
					{ npcClass: 'Low_Society', classSpawnChance: 40, honorClass: ['Good'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Abandoned_Camp: {
		description:
			'A dilapidated campsite with a cold fire pit. While the original owners are long gone, desperate outcasts, vagabonds, and wanderers now squat among the ruins.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Abandoned_Camp',
			poiRank: 1,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Low_Society', classSpawnChance: 40, socialClass: ['Poor'] },
					{ npcClass: 'Outlaw', classSpawnChance: 30, reputationClass: ['Low'] },
					{ npcClass: 'Trade', classSpawnChance: 20, socialClass: ['Poor'] },
					{ npcClass: 'Service', classSpawnChance: 10, socialClass: ['Poor'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Hidden_Cache: {
		description:
			'Concealed beneath camouflage netting and overgrown roots, a secret stash of illicit goods is being sorted. Shady figures, corrupt guards, and smugglers negotiate in hushed tones.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Hidden_Cache',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 40, honorClass: ['Bad'] },
					{ npcClass: 'Trade', classSpawnChance: 25, honorClass: ['Bad', 'Neutral'] },
					{ npcClass: 'Military', classSpawnChance: 15, honorClass: ['Bad'] }, // Corrupt guards
					{ npcClass: 'Administration', classSpawnChance: 10, honorClass: ['Bad'] }, // Corrupt officials
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Wandering_Merchants_Camp: {
		description:
			'A bustling caravan of heavily laden wagons has stopped for the day. Wealthy merchants loudly hawk their wares while hired veteran escorts keep a watchful eye.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Wandering_Merchants_Camp',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 35, socialClass: ['Normal', 'Rich'] },
					{ npcClass: 'Military', classSpawnChance: 25, combatTraining: ['Trained', 'Veteran'] },
					{ npcClass: 'Service', classSpawnChance: 15, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Production', classSpawnChance: 5, socialClass: ['Normal'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 10 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// ========================================================================
	// WILD REGION POIs
	// ========================================================================

	Wildwood_Hunters_Camp: {
		description:
			'Animal hides are stretched over curing racks in this remote hunting ground. Expert hunters, poachers, and fur traders share tales of their latest conquests.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Wildwood_Hunters_Camp',
			poiRank: 1,
			locationSpawnChance: 50,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Hunter'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 40, socialClass: ['Poor', 'Normal'] },
					{ npcClass: 'Outlaw', classSpawnChance: 30, reputationClass: ['Low', 'Mid'], socialClass: ['Poor'] },
					{ npcClass: 'Production', classSpawnChance: 20, socialClass: ['Poor', 'Normal'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Deep_Woods_Hideout: {
		description:
			'Deep in the thicket, a well-concealed camp serves as a refuge for the lawless. Hardened bandits count their coin, occasionally harassing terrified noble captives or hapless servants.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Deep_Woods_Hideout',
			poiRank: 2,
			locationSpawnChance: 50,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Bandit'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 60, honorClass: ['Bad'], reputationClass: ['Low'] },
					{ npcClass: 'High_Society', classSpawnChance: 15, socialClass: ['Rich'] }, // Captives
					{ npcClass: 'Service', classSpawnChance: 10, socialClass: ['Poor'] }, // Servants/Camp followers
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Overgrown_Wilderness_Ruins: {
		description:
			'Crumbling ancient stonework is almost swallowed by the forest. Among the broken statues, scholars seek lost knowledge alongside opportunistic tomb robbers and wandering outcasts.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Overgrown_Wilderness_Ruins',
			poiRank: 2,
			locationSpawnChance: 50,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Scholar'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 40, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Outlaw', classSpawnChance: 40, reputationClass: ['Low'], honorClass: ['Bad', 'Neutral'] },
					{ npcClass: 'Low_Society', classSpawnChance: 20, socialClass: ['Poor'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Primal_Druid_Grove: {
		description:
			'An unnervingly quiet grove where the trees seem to lean in close. Herbalists, strange mystics, and devotees of old, forgotten gods gather here to perform rituals in the shadows.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Primal_Druid_Grove',
			poiRank: 3,
			locationSpawnChance: 50,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Herbalist'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 50, socialClass: ['Poor', 'Normal'] },
					{ npcClass: 'Low_Society', classSpawnChance: 40, socialClass: ['Poor'], honorClass: ['Bad', 'Good'] },
					{ npcClass: 'Trade', classSpawnChance: 10, socialClass: ['Poor'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Wild_Frontier_Post: {
		description:
			'A rugged border post marking the edge of civilized lands. Weathered scouts, trained guards, and pathfinders prepare their gear before venturing deeper into the unknown.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Wild_Frontier_Post',
			poiRank: 2,
			locationSpawnChance: 50,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Scout'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 50, combatTraining: ['Trained', 'Veteran'], reputationClass: ['Mid', 'High'] },
					{ npcClass: 'Service', classSpawnChance: 25, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Production', classSpawnChance: 10, socialClass: ['Normal'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Stray_Livestock_Herd: {
		description:
			'Loud bleating and grunting catch your attention. A herd of domesticated livestock has wandered off from a nearby farm and is grazing peacefully in the wild.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Stray_Livestock_Herd',
			poiRank: 1,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Wild_Horse_Herd: {
		description:
			'The thundering sound of hooves vibrates through the ground. A herd of magnificent, untamed horses grazes nearby, their coats gleaming in the natural light.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Wild_Horse_Herd',
			poiRank: 2,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Game_Trail: {
		description:
			"You stumble upon a heavily trodden path used by the local fauna. You can spot tracks and movement in the brush from a diverse mixture of the forest's wild inhabitants.",
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Game_Trail',
			poiRank: 1,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'Wild', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Peaceful_Glade: {
		description:
			'Sunlight filters through the canopy into a tranquil clearing. Harmless woodland creatures like deer and hares forage calmly, unbothered by the dangers of the world.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Peaceful_Glade',
			poiRank: 1,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'WildFriendly', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Beast_Lair: {
		description:
			'The unmistakable stench of rotting meat and matted fur permeates the air. Gnawed bones litter the entrance to a dark den, home to something large, hungry, and highly dangerous.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Beast_Lair',
			poiRank: 3,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'WildHostile', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Shadow_Grotto: {
		description: 'A dark, damp cave system hidden behind thick vines. Unnatural sounds echo from within, warning of monstrous inhabitants.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Shadow_Grotto',
			poiRank: 3,
			locationSpawnChance: 75,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Monster', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Forgotten_Seal: {
		description: 'An ancient, weathered stone monolith vibrating with suppressed energy. A lone, powerful Nephilim guards this rarely found anomaly.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Wild',
			poiSubclass: 'Forgotten_Seal',
			poiRank: 5,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 2,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 1, pool: [{ npcCategory: 'Nephilim', npcRank: 5, classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// ------------------------------------------------------------------------
	// ORBIT REGION POIs (10 Locations)
	// ------------------------------------------------------------------------

	Howling_Ridge_Camp: {
		description:
			'High up on a windy ridge, a sturdy camp oversees the valleys below. Hardened outriders and messengers share a fire, their mounts resting nearby.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Howling_Ridge_Camp',
			poiRank: 2,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Outrider'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 50, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Military', classSpawnChance: 20, combatTraining: ['Trained', 'Veteran'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Pathfinder_Den: {
		description:
			'A well-camouflaged dugout serving as a waypoint for scouts and military patrols. Maps and trail markings are scattered around the command tent.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Pathfinder_Den',
			poiRank: 1,
			locationSpawnChance: 40,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Wayfinder'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 50, combatTraining: ['Trained', 'Veteran'], reputationClass: ['Mid', 'High'] },
					{ npcClass: 'Service', classSpawnChance: 30, socialClass: ['Normal', 'Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Spring_Thicket: {
		description: 'A dense cluster of blooming flora hides a small encampment. Herbalists and scholars gather here to study and harvest rare woodland herbs.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Spring_Thicket',
			poiRank: 1,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Herbalist'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 50, honorClass: ['Good', 'Neutral'] },
					{ npcClass: 'Trade', classSpawnChance: 30, socialClass: ['Poor', 'Normal'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Pilgrim_Rest: {
		description:
			'A simple, weather-beaten sanctuary offering shelter. Weary pilgrims and wandering monks can be seen praying and tending to their tired beasts of burden.',
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
			guaranteed: ['Pilgrim'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 40, honorClass: ['Good'] },
					{ npcClass: 'Low_Society', classSpawnChance: 30, socialClass: ['Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Herder_Encampment: {
		description:
			'A vast stretch of open grass dotted with makeshift fences. Shepherds diligently watch over a large herd of grazing animals, enjoying the relatively safe frontier.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Herder_Encampment',
			poiRank: 1,
			locationSpawnChance: 40,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Shepherd'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 70 },
					{ npcClass: 'Trade', classSpawnChance: 30, socialClass: ['Poor', 'Normal'] },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Borderlands_Tavern: {
		description:
			'A fortified outpost tavern serving the brave souls who travel the outer ring. The air is thick with smoke, loud laughter, and the clinking of tankards.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Borderlands_Tavern',
			poiRank: 2,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: ['Barkeep'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 35, socialClass: ['Normal', 'Poor'] },
					{ npcClass: 'Military', classSpawnChance: 25, combatTraining: ['Trained', 'Veteran'] },
					{ npcClass: 'Outlaw', classSpawnChance: 20, reputationClass: ['Low', 'Mid'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Prospector_Claim: {
		description:
			'The rhythmic thud of pickaxes echoes from a rocky outcrop. Grimy laborers and scavengers toil relentlessly, hoping to strike it rich on the edge of civilization.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Prospector_Claim',
			poiRank: 2,
			locationSpawnChance: 35,
			enterUntamedPoiApCost: 1,
		},
		spawns: {
			guaranteed: [],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Production', classSpawnChance: 40, socialClass: ['Poor', 'Normal'] },
					{ npcClass: 'Low_Society', classSpawnChance: 40, socialClass: ['Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Orbit_Pastures: {
		description:
			'A serene meadow where the grass grows tall and sweet. Several stray domestic animals wander lazily, enjoying the abundant grazing land far from the farms.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Orbit_Pastures',
			poiRank: 1,
			locationSpawnChance: 30,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Rocky_Wolf_Den: {
		description:
			'A chilling howl cuts through the wind. Among the jagged rocks lies a den surrounded by scattered bones, home to a pack of fierce predators.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Rocky_Wolf_Den',
			poiRank: 2,
			locationSpawnChance: 30,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'WildHostile', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Sunlit_Clearing: {
		description:
			'A beautiful, sun-drenched patch of pristine nature. Gentle woodland creatures frolic and forage, momentarily safe from the harsh realities of the frontier.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Orbit',
			poiSubclass: 'Sunlit_Clearing',
			poiRank: 1,
			locationSpawnChance: 30,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Animal', npcClass: 'WildFriendly', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// ------------------------------------------------------------------------
	// EDGE REGION POIs (5 Locations)
	// ------------------------------------------------------------------------

	Desolate_Outpost: {
		description:
			'A heavily fortified and grim outpost at the edge of the known world. Hardened veteran soldiers and exiled outlaws stand watch, their mounts restless in the corrupted air.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Desolate_Outpost',
			poiRank: 3,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 2,
		},
		spawns: {
			guaranteed: ['Captain'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 50, combatTraining: ['Trained', 'Veteran'], reputationClass: ['Low', 'Mid'] },
					{ npcClass: 'Outlaw', classSpawnChance: 30, combatTraining: ['Trained', 'Veteran'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Scavenger_Camp: {
		description:
			'A temporary camp built from debris and scavenged materials. Desperate outcasts and smugglers sort through ancient relics, loading their findings onto tired pack animals.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Scavenger_Camp',
			poiRank: 3,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 2,
		},
		spawns: {
			guaranteed: ['Smuggler'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Production', classSpawnChance: 30, socialClass: ['Poor'] },
					{ npcClass: 'Low_Society', classSpawnChance: 20, socialClass: ['Poor'] },
					{ npcClass: 'Trade', classSpawnChance: 20, socialClass: ['Poor'] },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Lost_Expedition: {
		description:
			'Tattered tents and broken equipment mark the remains of a doomed expedition. Surviving scholars and their remaining veteran escorts huddle together in fear.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Lost_Expedition',
			poiRank: 4,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 2,
		},
		spawns: {
			guaranteed: ['Scholar'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Administration', classSpawnChance: 50, honorClass: ['Good', 'Neutral'] },
					{ npcClass: 'Military', classSpawnChance: 30, combatTraining: ['Trained', 'Veteran'] },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Cursed_Ruins: {
		description:
			'Dark, crumbling architecture radiating a malevolent aura. Unnatural growls and the shifting of shadows indicate that hostile monsters have claimed this territory.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Cursed_Ruins',
			poiRank: 4,
			locationSpawnChance: 100,
			enterUntamedPoiApCost: 2,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 5, pool: [{ npcCategory: 'Monster', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Nephilim_Rift: {
		description:
			'A tear in the fabric of reality, crackling with dark energy. A towering Nephilim guards the anomaly, radiating immense power and ancient malice.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Edge',
			poiSubclass: 'Nephilim_Rift',
			poiRank: 5,
			locationSpawnChance: 100,
			enterUntamedPoiApCost: 3,
		},
		spawns: { guaranteed: [], dynamic: { maxCapacity: 1, pool: [{ npcCategory: 'Nephilim', npcRank: 5, classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

// ------------------------------------------------------------------------
	// TESTING REGION (SANDBOX)
	// ------------------------------------------------------------------------
	Sandbox_Arena: {
		description: 'A pocket dimension used strictly by the Architects for testing the fabric of reality. All manner of beings manifest here in absolute chaos.',
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
				{ npcCategory: 'Animal', npcClass: 'Wild', npcSubclass: 'Bear' },
				{ npcCategory: 'Human', npcClass: 'Trade', npcSubclass: 'Banker' }, // Bun pentru testat economia
				{ npcCategory: 'Nephilim', npcSubclass: 'Wolfscar' }, // Teste de boss fight
			],
			dynamic: {
				maxCapacity: 50,
				pool: [
					// Humans (Diverse demographics for UI and interaction testing)
					{ npcCategory: 'Human', npcClass: 'Military', classSpawnChance: 10, combatTraining: ['Veteran'] },
					{ npcCategory: 'Human', npcClass: 'Outlaw', classSpawnChance: 10, reputationClass: ['Low'] },
					{ npcCategory: 'Human', npcClass: 'High_Society', classSpawnChance: 10, socialClass: ['Rich'] },
					{ npcCategory: 'Human', npcClass: 'Low_Society', classSpawnChance: 10, socialClass: ['Poor'] },
					{ npcCategory: 'Human', npcClass: 'Trade', classSpawnChance: 10 },
					
					// Animals
					{ npcCategory: 'Animal', npcClass: 'WildHostile', classSpawnChance: 10 },
					{ npcCategory: 'Animal', npcClass: 'WildFriendly', classSpawnChance: 10 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 10 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 10 },
					
					// Supernatural
					{ npcCategory: 'Monster', classSpawnChance: 10 },
					{ npcCategory: 'Nephilim', classSpawnChance: 5 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
};
