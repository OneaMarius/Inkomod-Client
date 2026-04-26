// File: src/data/DB_LOCATIONS_POIS.js
// Description: Civilized and Untamed Points of Interest definitions for Iron Nature: Knight of Medieval Old Days.

// ========================================================================
// CIVILIZED POIS (Sectors) - 16 Locations
// ========================================================================
export const DB_LOCATIONS_POIS_Civilized = {
    // 1. TAVERN
    Tavern: {
        description: 'A lively place, thick with the smell of ale, hearth smoke, and cheerful songs. Travelers and locals gather for stories while their steeds rest outside.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Tavern', poiRank: 1, 
            spawnChances: { Village: 100, Town: 100, City: 100, Castle: 50, Palace: 20 } },
        spawns: {
            guaranteed: ['Tavern_Keeper', 'Barkeep', 'Entertainer'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Service', classSpawnChance: 50 }, 
                { npcClass: 'Society', classSpawnChance: 30 }, 
                { npcClass: 'Outlaw', classSpawnChance: 20 },
                { npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 2. MARKET
    Market: {
        description: 'Colorful stalls and loud merchants display fresh goods. The clinking of coins mingles with the braying of pack animals and livestock up for sale.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Market', poiRank: 1, 
            spawnChances: { Village: 100, Town: 100, City: 100, Castle: 50, Palace: 10 } },
        spawns: {
            guaranteed: ['Provisioner', 'Peddler', 'Farmer'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Trade', classSpawnChance: 50 }, 
                { npcClass: 'Resources', classSpawnChance: 30 }, 
                { npcClass: 'Production', classSpawnChance: 20 },
                { npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 30 },
                { npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 3. WORKSHOP
    Workshop: {
        description: 'The ringing of hammers and the scent of freshly cut wood dominate this area. Artisans work tirelessly, assisted by draft animals hauling heavy raw materials.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Workshop', poiRank: 1, 
            spawnChances: { Village: 100, Town: 100, City: 100, Castle: 100, Palace: 30 } },
        spawns: {
            guaranteed: ['Blacksmith', 'Tailor', 'Carpenter'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Production', classSpawnChance: 70 }, 
                { npcClass: 'Transport', classSpawnChance: 30 },
                { npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 25 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 4. GARRISON
    Garrison: {
        description: 'A fortified, disciplined, and orderly area where soldiers train and maintain their weapons. Cavalry horses are kept in adjacent stables, ready for battle.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Garrison', poiRank: 2, 
            spawnChances: { Village: 0, Town: 40, City: 100, Castle: 100, Palace: 100 } },
        spawns: {
            guaranteed: ['Captain', 'Quartermaster', 'Watchman'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Military', classSpawnChance: 80 }, 
                { npcClass: 'Administration', classSpawnChance: 20 },
                { npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 30 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 5. ARENA
    Arena: {
        description: 'A grand amphitheater with blood-stained sand, hosting spectacular fights. Gladiators and warriors face lethal wild beasts and captured monsters for entertainment.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Arena', poiRank: 3, 
            spawnChances: { Village: 0, Town: 0, City: 50, Castle: 80, Palace: 100 } },
        spawns: {
            guaranteed: ['Warmaster', 'Fencing_Master', 'Surgeon'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Military', classSpawnChance: 60 }, 
                { npcClass: 'Knowledge', classSpawnChance: 20 },
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 6. TEMPLE
    Temple: {
        description: 'A grandiose building with towering columns, dedicated to the major gods. Enlightened priests and scholars preserve sacred knowledge, while sacrificial animals wait on the steps.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Temple', poiRank: 2, 
            spawnChances: { Village: 0, Town: 20, City: 100, Castle: 100, Palace: 100 } },
        spawns: {
            guaranteed: ['Priest', 'Scholar', 'Monk'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Religion', classSpawnChance: 60 }, 
                { npcClass: 'Knowledge', classSpawnChance: 40 },
                { npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 15 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 7. CHURCH
    Church: {
        description: 'A modest but always open stone chapel, serving as the spiritual core of the community. A sanctuary where common folk pray and donate to the poor.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Church', poiRank: 1, 
            spawnChances: { Village: 100, Town: 100, City: 50, Castle: 10, Palace: 0 } },
        spawns: {
            guaranteed: ['Cleric', 'Friar'],
            dynamic: { maxCapacity: 5, pool: [
                { npcClass: 'Religion', classSpawnChance: 70 }, 
                { npcClass: 'Society', classSpawnChance: 30 },
                { npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 8. OUTSKIRTS
    Outskirts: {
        description: 'The muddy fringes of the settlement, where smugglers, vagabonds, and those avoiding the guards hide. Stray dogs and other wandering animals scavenge among the ruins.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Outskirts', poiRank: 1, 
            spawnChances: { Village: 100, Town: 100, City: 80, Castle: 20, Palace: 0 } },
        spawns: {
            guaranteed: ['Smuggler', 'Fence', 'Vagabond'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Outlaw', classSpawnChance: 50 }, 
                { npcClass: 'Transport', classSpawnChance: 30 }, 
                { npcClass: 'Resources', classSpawnChance: 20 },
                { npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 9. STABLES
    Stables: {
        description: 'A spacious complex of paddocks, always clean and filled with fresh hay. Messengers, merchants, and guards tend to their stallions and road-weary animals here.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Stables', poiRank: 1, 
            spawnChances: { Village: 50, Town: 100, City: 100, Castle: 100, Palace: 100 } },
        spawns: {
            guaranteed: ['Stablemaster', 'Messenger'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Transport', classSpawnChance: 60 }, 
                { npcClass: 'Service', classSpawnChance: 40 },
                { npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 80 },
                { npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 10. INFIRMARY
    Infirmary: {
        description: 'Orderly beds and a pungent air of boiled herbs and medicinal alcohol. Surgeons, physicians, and healers work ceaselessly to save the wounded and sick of the area.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Infirmary', poiRank: 2, 
            spawnChances: { Village: 20, Town: 80, City: 100, Castle: 100, Palace: 50 } },
        spawns: {
            guaranteed: ['Surgeon', 'Physician', 'Apothecary'],
            dynamic: { maxCapacity: 5, pool: [
                { npcClass: 'Knowledge', classSpawnChance: 70 }, 
                { npcClass: 'Religion', classSpawnChance: 30 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 11. LIBRARY
    Library: {
        description: 'A profound silence hangs over halls lined with massive tomes, maps, and ancient parchments. Scholars and bureaucrats study or copy important historical archives.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Library', poiRank: 2, 
            spawnChances: { Village: 0, Town: 10, City: 70, Castle: 100, Palace: 100 } },
        spawns: {
            guaranteed: ['Scholar', 'Scribe'],
            dynamic: { maxCapacity: 5, pool: [
                { npcClass: 'Knowledge', classSpawnChance: 80 }, 
                { npcClass: 'Administration', classSpawnChance: 20 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 12. GATEHOUSE
    Gatehouse: {
        description: 'The main checkpoint, dominated by massive towers. Vigilant guards and tax collectors strictly inspect the goods and weapons of anyone wishing to pass.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Gatehouse', poiRank: 2, 
            spawnChances: { Village: 0, Town: 50, City: 100, Castle: 100, Palace: 100 } },
        spawns: {
            guaranteed: ['Watchman', 'Tax_Collector', 'Captain'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Military', classSpawnChance: 70 }, 
                { npcClass: 'Administration', classSpawnChance: 30 },
                { npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 13. TREASURY
    Treasury: {
        description: 'An imposing building equipped with heavy steel doors and complex locks. Government officials and bankers manage the settlement’s gold under the strict guard of military elites.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Treasury', poiRank: 3, 
            spawnChances: { Village: 0, Town: 0, City: 30, Castle: 100, Palace: 100 } },
        spawns: {
            guaranteed: ['Banker', 'Magistrate'],
            dynamic: { maxCapacity: 5, pool: [
                { npcClass: 'Administration', classSpawnChance: 70 }, 
                { npcClass: 'Military', classSpawnChance: 30 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 14. GUILDHALL
    Guildhall: {
        description: 'The luxurious headquarters of trade and craft associations. Elite merchants sign valuable contracts at mahogany tables, accompanied by influential members of society.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Guildhall', poiRank: 2, 
            spawnChances: { Village: 0, Town: 40, City: 100, Castle: 50, Palace: 20 } },
        spawns: {
            guaranteed: ['Patrician', 'Caravan_Master'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Trade', classSpawnChance: 50 }, 
                { npcClass: 'Society', classSpawnChance: 30 }, 
                { npcClass: 'Production', classSpawnChance: 20 },
                { npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 15. GARDENS
    Gardens: {
        description: 'Meticulously maintained gardens with exotic trees and crystal-clear fountains. The nobility stroll lazily along the paths, sometimes admiring elegant horses on parade.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Gardens', poiRank: 2, 
            spawnChances: { Village: 0, Town: 0, City: 40, Castle: 100, Palace: 100 } },
        spawns: {
            guaranteed: ['Lord', 'Noble', 'Courtier'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Society', classSpawnChance: 70 }, 
                { npcClass: 'Knowledge', classSpawnChance: 30 },
                { npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 25 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

    // 16. PASTURE
    Pasture: {
        description: 'A rich, open field under the settlement’s administration, protected by solid fences. Shepherds watch over massive herds of livestock that feed the local economy.',
        classification: { poiArchetype: 'Location', poiCategory: 'CIVILIZED', poiClass: 'Sector', poiSubclass: 'Pasture', poiRank: 1, 
            spawnChances: { Village: 100, Town: 80, City: 20, Castle: 50, Palace: 0 } },
        spawns: {
            guaranteed: ['Farmer', 'Shepherd'],
            dynamic: { maxCapacity: 6, pool: [
                { npcClass: 'Resources', classSpawnChance: 50 },
                { npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 100 }
            ] },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    }
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
			'The rhythmic ringing of a hammer striking an anvil echoes through the trees. You see a cluster of sturdy tents and makeshift forges where busy artisans hone their craft.',
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
					{ npcClass: 'Production', classSpawnChance: 80 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Nomad_Market: {
		description:
			'Colorful pavilions are pitched in a small clearing. The scent of exotic spices and the chatter of busy provisioners and merchants fill the air.',
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
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 60 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Resource_Camp: {
		description:
			"You find a rugged encampment surrounded by stacked pelts, chopped wood, and tools. Sturdy laborers and hunters move about, processing the land's bounty.",
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
					{ npcClass: 'Resources', classSpawnChance: 80 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Travelers_Rest: {
		description:
			'A modest waystation provides brief respite from the harsh wilderness. Messengers and weary travelers can be seen resting near the fire, exchanging news from the road.',
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
					{ npcClass: 'Transport', classSpawnChance: 70 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Roadside_Inn: {
		description:
			'A surprisingly sturdy timber building stands near a beaten path. Smoke rises from the chimney, and the welcoming smells of a hearty stew and ale suggest an innkeeper is ready for patrons.',
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
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 70 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Tax_Outpost: {
		description:
			'A fortified checkpoint bears the unmistakable banners of regional authority. Stern officials and tax collectors monitor the area, demanding tolls from those who pass.',
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
					{ npcClass: 'Administration', classSpawnChance: 80 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Field_Hospital: {
		description:
			'Tents smelling of strong alcohol and bitter herbs are arranged in an orderly fashion. Surgeons and scholars rush between cots, tending to the wounded and sick.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Field_Hospital',
			poiRank: 3,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: ['Surgeon'], dynamic: { maxCapacity: 4, pool: [{ npcClass: 'Knowledge', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Noble_Hunting_Camp: {
		description:
			'Luxurious pavilions and finely bred hunting hounds contrast sharply with the wild surroundings. A lord and their entourage are out seeking sport and leisure.',
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
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Society', classSpawnChance: 70 },
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
					{ npcClass: 'Outlaw', classSpawnChance: 85 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Patrol_Outpost: {
		description:
			'A disciplined military encampment surrounded by a wooden palisade. A captain barks orders to watchful guards and scouts maintaining the perimeter.',
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
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 75 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 25 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Remote_Shrine: {
		description:
			'An ancient stone altar, adorned with fresh offerings, stands quietly in a secluded glade. Devoted clerics and pilgrims are gathered in solemn prayer.',
		classification: {
			poiArchetype: 'Location',
			poiCategory: 'UNTAMED',
			poiClass: 'Any',
			poiSubclass: 'Remote_Shrine',
			poiRank: 2,
			locationSpawnChance: 25,
			enterUntamedPoiApCost: 1,
		},
		spawns: { guaranteed: ['Cleric'], dynamic: { maxCapacity: 4, pool: [{ npcClass: 'Religion', classSpawnChance: 100 }] } },
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
					{ npcClass: 'Society', classSpawnChance: 30 },
					{ npcClass: 'Outlaw', classSpawnChance: 25 },
					{ npcClass: 'Resources', classSpawnChance: 20 },
					{ npcClass: 'Transport', classSpawnChance: 15 },
					{ npcClass: 'Religion', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Hidden_Cache: {
		description:
			'Concealed beneath camouflage netting and overgrown roots, a secret stash of illicit goods is being sorted. Shady figures, smugglers, and corrupt contacts negotiate in hushed tones.',
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
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 35 },
					{ npcClass: 'Trade', classSpawnChance: 25 },
					{ npcClass: 'Military', classSpawnChance: 15 },
					{ npcClass: 'Administration', classSpawnChance: 10 },
					{ npcClass: 'Knowledge', classSpawnChance: 5 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Wandering_Merchants_Camp: {
		description:
			'A bustling caravan of heavily laden wagons has stopped for the day. Merchants loudly hawk their wares while armed escorts and hired hands keep a watchful eye.',
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
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Trade', classSpawnChance: 30 },
					{ npcClass: 'Military', classSpawnChance: 20 },
					{ npcClass: 'Transport', classSpawnChance: 10 },
					{ npcClass: 'Production', classSpawnChance: 10 },
					{ npcClass: 'Service', classSpawnChance: 10 },
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
			'Animal hides are stretched over curing racks in this remote hunting ground. Expert trappers, poachers, and fur traders share tales of their latest conquests.',
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
			guaranteed: ['Hunter', 'Trapper'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 60 },
					{ npcClass: 'Trade', classSpawnChance: 15 },
					{ npcClass: 'Outlaw', classSpawnChance: 15 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Deep_Woods_Hideout: {
		description:
			'Deep in the thicket, a well-concealed camp serves as a refuge for the lawless. Hardened thugs and bandits count their coin, occasionally harassing terrified captives or fallen nobles.',
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
			guaranteed: ['Bandit', 'Thug'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Outlaw', classSpawnChance: 65 },
					{ npcClass: 'Service', classSpawnChance: 10 },
					{ npcClass: 'Society', classSpawnChance: 10 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 15 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Overgrown_Wilderness_Ruins: {
		description:
			'Crumbling ancient stonework is almost swallowed by the forest. Among the broken statues, scholars seek lost knowledge alongside opportunistic tomb robbers and secretive cultists.',
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
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Knowledge', classSpawnChance: 40 },
					{ npcClass: 'Outlaw', classSpawnChance: 40 },
					{ npcClass: 'Religion', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Primal_Druid_Grove: {
		description:
			'An unnervingly quiet grove where the trees seem to lean in close. Herbalists, mystics, and devotees of old gods gather here to perform strange rituals in the shadows.',
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
			guaranteed: ['Herbalist', 'Cultist'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Religion', classSpawnChance: 60 },
					{ npcClass: 'Knowledge', classSpawnChance: 30 },
					{ npcClass: 'Resources', classSpawnChance: 10 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Wild_Frontier_Post: {
		description:
			'A rugged border post marking the edge of civilized lands. Weathered scouts, guards, and wayfinders prepare their gear before venturing deeper into the unknown.',
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
			guaranteed: ['Scout', 'Wayfinder'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 40 },
					{ npcClass: 'Transport', classSpawnChance: 20 },
					{ npcClass: 'Production', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
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
		spawns: { guaranteed: [], dynamic: { maxCapacity: 4, pool: [{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 100 }] } },
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
		spawns: { guaranteed: [], dynamic: { maxCapacity: 4, pool: [{ npcCategory: 'Animal', npcClass: 'Wild', classSpawnChance: 100 }] } },
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
		spawns: { guaranteed: [], dynamic: { maxCapacity: 3, pool: [{ npcCategory: 'Animal', npcClass: 'WildHostile', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

    // --- SUPERNATURAL POIs (Wild Region) ---

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
        spawns: {
            guaranteed: [],
            dynamic: {
                maxCapacity: 4,
                pool: [
                    { npcCategory: 'Monster', classSpawnChance: 100 },
                ],
            },
        },
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
        spawns: {
            guaranteed: [],
            dynamic: {
                maxCapacity: 1,
                pool: [
                    { npcCategory: 'Nephilim', npcRank: 5, classSpawnChance: 100 },
                ],
            },
        },
        interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
    },

	// ------------------------------------------------------------------------
	// ORBIT REGION POIs (10 Locations)
	// ------------------------------------------------------------------------

	// --- HUMAN POIs (7 Locații) ---

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
					{ npcClass: 'Transport', classSpawnChance: 50 },
					{ npcClass: 'Knowledge', classSpawnChance: 20 },
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
			guaranteed: ['Wayfinder', 'Scout'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Military', classSpawnChance: 40 },
					{ npcClass: 'Transport', classSpawnChance: 40 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Spring_Thicket: {
		description: 'A dense cluster of blooming flora hides a small encampment. Foresters and scholars gather here to study and harvest rare woodland herbs.',
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
			guaranteed: ['Forester'],
			dynamic: {
				maxCapacity: 4,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 60 },
					{ npcClass: 'Knowledge', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 }, // Animale de povară pentru provizii
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Pilgrim_Rest: {
		description:
			'A simple, weather-beaten sanctuary offering shelter. Weary pilgrims and wandering friars can be seen praying and tending to their tired beasts of burden.',
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
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Transport', classSpawnChance: 30 },
					{ npcClass: 'Religion', classSpawnChance: 40 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 30 }, // Boi, oi, etc. cu care călătoresc
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
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 80 }, // Dominat masiv de animale
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
			guaranteed: ['Barkeep', 'Mercenary'],
			dynamic: {
				maxCapacity: 6,
				pool: [
					{ npcClass: 'Service', classSpawnChance: 40 },
					{ npcClass: 'Trade', classSpawnChance: 20 },
					{ npcClass: 'Military', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 }, // Caii clienților la han
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Prospector_Claim: {
		description:
			'The rhythmic thud of pickaxes echoes from a rocky outcrop. Grimy miners and quarrymen toil relentlessly, hoping to strike it rich on the edge of civilization.',
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
			guaranteed: ['Miner'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 60 },
					{ npcClass: 'Trade', classSpawnChance: 20 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 20 }, // Animale folosite pentru cărat minereuri (ex: Yak, Ox)
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// --- ANIMAL POIs (1 Domestic, 2 Sălbatice) ---

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
		spawns: { guaranteed: [], dynamic: { maxCapacity: 4, pool: [{ npcCategory: 'Animal', npcClass: 'WildHostile', classSpawnChance: 100 }] } },
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
		spawns: { guaranteed: [], dynamic: { maxCapacity: 4, pool: [{ npcCategory: 'Animal', npcClass: 'WildFriendly', classSpawnChance: 100 }] } },
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

    

	// ------------------------------------------------------------------------
	// EDGE REGION POIs (5 Locations)
	// ------------------------------------------------------------------------

	// --- HUMAN POIs (3 Locations - 25% Chance) ---

	Desolate_Outpost: {
		description:
			'A heavily fortified and grim outpost at the edge of the known world. Grim soldiers and exiled outlaws stand watch, their mounts restless in the corrupted air.',
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
					{ npcClass: 'Military', classSpawnChance: 50 },
					{ npcClass: 'Outlaw', classSpawnChance: 30 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Scavenger_Camp: {
		description:
			'A temporary camp built from debris and scavenged materials. Desperate prospectors sort through ancient relics, loading their findings onto tired pack animals.',
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
			guaranteed: ['Miner', 'Smuggler'],
			dynamic: {
				maxCapacity: 5,
				pool: [
					{ npcClass: 'Resources', classSpawnChance: 40 },
					{ npcClass: 'Trade', classSpawnChance: 30 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 30 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	Lost_Expedition: {
		description:
			'Tattered tents and broken equipment mark the remains of a doomed expedition. Surviving scholars and their remaining military escorts huddle together in fear.',
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
					{ npcClass: 'Knowledge', classSpawnChance: 50 },
					{ npcClass: 'Military', classSpawnChance: 30 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 20 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},

	// --- SUPERNATURAL POIs (2 Locations - 100% Chance) ---

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
				// { npcCategory: 'Human', npcClass: 'Military', npcSubclass: 'Captain' },
				// { npcCategory: 'Animal', npcClass: 'Wild', npcSubclass: 'Bear' },
			],
			dynamic: {
				maxCapacity: 16,
				pool: [
					// { npcCategory: 'Animal', npcClass: 'Wild', classSpawnChance: 50 },
					{ npcCategory: 'Animal', npcClass: 'Domestic', classSpawnChance: 50 },
					{ npcCategory: 'Animal', npcClass: 'Mount', classSpawnChance: 50 },
					// { npcCategory: 'Monster', classSpawnChance: 50 },
					// { npcCategory: 'Nephilim', classSpawnChance: 50 },
				],
			},
		},
		interactions: { actionTags: ['Enter_Location', 'Exit_Location'] },
	},
};
