// File: Client/src/data/DB_Events.js
// Description: Master database of active game events.
// ========================================================================
// EVENT TAXONOMY & REFERENCE GUIDE
// ========================================================================
// Use this object as a reference when constructing new narrative events.
// It defines all valid keys, parameters, and constraints expected by ENGINE_Events.js.

export const DB_EVENTS_TAXONOMY = {
    // --- Core Classifications ---
    eventTypes: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
    typologies: [
        'CombatEncounter',  // Hostile NPC generation and combat checks
        'SocialEncounter',  // Neutral/Friendly NPC generation, trade-offs, dialogue
        'Discovery',        // Finding items, silver, food, animals, or locations
        'Hazard',           // Weather anomalies, environmental damage, durability loss
        'General'           // Fallback or miscellaneous narrative occurrences
    ],

    // --- Spatial & Temporal Conditions ---
    conditions: {
        allowedTriggers: ['travel', 'explore', 'endturn', 'hunt_success', 'hunt_ambush'],
        allowedSeasons: ['spring', 'summer', 'autumn', 'winter'],
        allowedZoneCategories: ['CIVILIZED', 'UNTAMED'],
        allowedZoneClasses: ['DOMIKON', 'IRONVOW', 'NORHELM', 'KRYPTON', 'MYTHOSS', 'OLDGROW', 'DOOMARK', 'ORBIT', 'WILD', 'EDGE'],
        allowedZoneSubclasses: ['Village', 'Town', 'City', 'Castle', 'Palace', 'Orbit', 'Wild', 'Edge'],
        // 'allowedZones' can also be used for strict Node ID matching (e.g., ['Spark_Village'])
    },

    // --- State Mutation Payload Keys (staticEffects / onSuccess / onFailure) ---
    // These keys accept standard numeric values. The engine dynamically calculates 
    // variance and tiers if configured in WORLD.DYNAMIC_REWARDS.
    payloadAttributes: [
        'apMod', 'hpMod',                   // Vitals
        'str', 'agi', 'int',                // Stats
        'silverCoins', 'tradeSilver', 'tradeGold', // Economy
        'food', 'healingPotions',           // Logistics
        'honor', 'renown'                   // Morality & Social
    ],

    // --- Choice Mechanics (checkType) ---
    choiceCheckTypes: [
        'GENERAL',              // Auto-success narrative choice
        'TRADE_OFF',            // Requires specific resources defined in the 'cost' object
        'LUCK_CHECK',           // Requires 'successChance' (0-100)
        'SKILL_CHECK',          // Requires 'attribute' (str/agi/int) and 'difficultyModifier' (integer)
        'COMBAT',               // Requires 'combatRule' ('DMF', 'NF', 'FF')
        'STANDARD_INTERACTION'  // Instantly closes the event and spawns the NPC into the active viewport
    ],

    // --- Procedural Generation (procGen) ---
    procGenTypes: {
        npc: {
            // Defined inside onEncounter -> procGen
            type: ['NPC_HUMAN', 'NPC_MONSTER', 'NPC_ANIMAL', 'NPC_NEPHILIM'], // Generator Engine Target
            categories: ['Human', 'Animal', 'Monster', 'Nephilim'],           // DB Entity Category
            classes: [],    // e.g., 'Trade', 'WildHostile', 'Undead', 'Demigod'
            subclasses: [], // e.g., 'Blacksmith', 'Dire_Wolf', 'Goblin', 'Wolfscar'
            rankModifier: 0 // Modifies the base player rank for generation (-2 to +2)
        },
        items: {
            // Defined inside staticEffects or choice resolution -> procGen -> items: []
            category: ['Physical', 'Loot', 'Animal'], 
            
            // If category === 'Physical'
            itemClass: ['Weapon', 'Shield', 'Armor', 'Helmet'], 
            
            // If category === 'Loot' (Matches DB_ITEM_NOMENCLATURE.lootCategories)
            entityCategory: ['Human', 'Nephilim', 'Animal', 'Monster'], 
            
            // If category === 'Animal' (Matches DB_NPC_TAXONOMY.Animal.classes)
            entityClass: ['Mount', 'Domestic', 'Wild', 'WildFriendly', 'WildHostile'], 
            
            count: 1,
            tierModifier: 0 // Adjusts quality/tier/rank based on player rank (-2 to +2)
        }
    }
};


export const DB_EVENTS = {
	events: [
		// ==========================================
		// HUNTING EVENTS (2 Events)
		// ==========================================

		{
			id: 'evt_hunt_success_001',
			name: 'The Prey',
			typology: 'CombatEncounter',
			eventType: 'POSITIVE',
			description: 'You silently tracked fresh prints to a clearing. An unsuspecting animal is grazing nearby. You have the upper hand.',
			conditions: { weight: 100, minRank: 1, allowedTriggers: ['hunt_success'] },
			staticEffects: null,
			procGen: null,
			onEncounter: { procGen: { type: 'NPC_ANIMAL', categories: ['Animal'], classes: ['Wild'], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_hunt001_stealth',
					label: 'Attempt a silent kill',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: {
						description: 'A clean strike! The beast fell without making a sound.',
						food: { tier: 'MODERATE', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
						procGen: {
							// UPDATED: Now guarantees Animal-specific loot (pelts, bones)
							items: [{ category: 'Loot', entityCategory: 'Animal', count: 1, rankModifier: 0 }],
						},
					},
					onFailure: {
						description: 'You snapped a twig! The animal panicked, bit you in its frenzy, and escaped.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt001_fight',
					label: 'Charge in',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: { description: 'You overpowered the beast after a brief struggle.', food: { tier: 'MINOR', type: 'REWARD' } },
					onFailure: {
						description: 'The prey became the predator. You barely survived the encounter and had to flee.',
						// FIXED: Changed from MAJOR to MINOR so you don't lose massive HP
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						renown: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_hunt001_ignore',
					label: 'Leave it be',
					checkType: 'GENERAL',
					onSuccess: { description: 'You lowered your weapon and faded back into the wilderness.' },
				},
			],
		},
		{
			id: 'evt_hunt_ambush_001',
			name: 'Hunted',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description: 'While tracking what you thought was a deer, you hear a deep, guttural growl from the thicket behind you. You walked right into a trap.',
			conditions: { weight: 100, minRank: 1, allowedTriggers: ['hunt_ambush'] },
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_MONSTER',
					classes: ['Beast', 'Giant', 'Undead', 'Goblinoid', 'Elemental', 'Cursed', 'Draconid'], // Adaugă clasele tale reale aici
					rankModifier: 1,
				},
			},
			choices: [
				{
					id: 'ch_huntambush_evade',
					label: 'Dive into the brush (Agility Check)',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 2,
					onSuccess: {
						description: 'You scrambled through the thorns and outran it, losing only your breath.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
					onFailure: {
						description: 'It lunged faster than you could react, mauling your shoulder before you broke free!',
						hpMod: { tier: 'MAJOR', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_huntambush_fight',
					label: 'Draw your weapon (Direct Combat)',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'Against all odds, you slew the apex predator.',
						renown: { tier: 'MODERATE', type: 'REWARD' },
						food: { tier: 'MODERATE', type: 'REWARD' },
					},
					onFailure: { description: 'You were savagely beaten and left for dead.', hpMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
			],
		},
		// ==========================================
		// TYPOLOGY: HAZARD (6 Events)
		// ==========================================
		{
			id: 'evt_haz_001',
			name: 'Sudden Downpour',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'A violent storm rolls in unexpectedly, soaking your gear and slowing your progress.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' }, hpMod: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_002',
			name: 'Spoiled Rations',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'Moisture and heat have ruined a portion of your food supplies.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { food: { tier: 'MODERATE', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_003',
			name: 'Equipment Rust',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'Harsh environmental conditions have damaged some of your silver trade goods.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { tradeSilver: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_004',
			name: 'Toxic Spores',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'You step on a patch of strange fungi that erupts in a cloud of toxic spores.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz004_dodge',
					label: 'Hold breath and dive',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: { description: 'You successfully avoid the toxic cloud.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
					onFailure: { description: 'You inhale the spores and feel violently ill.', hpMod: { tier: 'MODERATE', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_haz_005',
			name: 'Rockslide',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'The ground rumbles as rocks begin to tumble from the incline above!',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz005_luck',
					label: 'Run for cover',
					checkType: 'LUCK_CHECK',
					successChance: 60,
					onSuccess: { description: 'You barely make it to safety.', apMod: { tier: 'MODERATE', type: 'PENALTY' } },
					onFailure: { description: 'A falling rock clips your shoulder.', hpMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_haz_006',
			name: 'Lost Bearings',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'The terrain becomes confusing, and you realize you have lost your way.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz006_nav',
					label: 'Reorient yourself',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: { description: 'You quickly find a landmark and get back on track.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
					onFailure: { description: 'You wander aimlessly for hours, exhausting yourself.', apMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
			],
		},

		// ==========================================
		// TYPOLOGY: DISCOVERY (10 Events)
		// ==========================================
		{
			id: 'evt_dis_001',
			name: 'Abandoned Cart',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'You find a broken merchant cart abandoned on the side of the road. You salvage what you can.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { food: { tier: 'MINOR', type: 'REWARD' } },
			procGen: { items: [{ category: 'Loot', count: 2 }] },
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_002',
			name: 'Forgotten Coin Pouch',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'Half-buried in the dirt, you spot a weathered leather pouch containing coins.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { silverCoins: { tier: 'MODERATE', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_003',
			name: 'Berry Bush',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'A bush laden with ripe, nutritious berries provides a welcome snack.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { food: { tier: 'MINOR', type: 'REWARD' }, hpMod: { tier: 'MINOR', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_004',
			name: "Miner's Skeleton",
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description: 'You discover the remains of an unlucky prospector. You take his gold, though it feels dishonorable.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { tradeGold: { tier: 'MINOR', type: 'REWARD' }, honor: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_005',
			name: 'Hidden Cache',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'You notice strange markings on a tree, hinting at a hidden stash nearby.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis005_search',
					label: 'Decipher the marks',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: -1,
					onSuccess: {
						description: 'You unearth a buried weapon!',
						procGen: { items: [{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 }] },
					},
					onFailure: { description: 'The marks lead nowhere. You just wasted time.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_dis_006',
			name: 'Stray Mount',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description: 'A riderless horse is grazing nearby. It looks spooked.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis006_catch',
					label: 'Attempt to tame it',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: {
						description: 'You calm the beast and secure its reins.',
						procGen: { items: [{ category: 'Animal', entityClass: 'Mount', count: 1 }] },
					},
					onFailure: { description: 'The horse kicks at you and gallops away.', hpMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_dis_007',
			name: 'Ancient Shrine',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'You find an old stone altar dedicated to a god of strength.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis007_pray',
					label: 'Offer Silver',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 50 },
					onSuccess: {
						description: 'A warm energy flows through you. You feel permanently stronger.',
						str: { tier: 'MINOR', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_dis007_leave',
					label: 'Leave it be',
					checkType: 'GENERAL',
					onSuccess: { description: 'You walk away from the shrine.', apMod: { tier: 'MINOR', type: 'REWARD' } },
				},
			],
		},
		{
			id: 'evt_dis_008',
			name: 'Ruined Armory',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'You stumble into the collapsed remains of an old watchtower armory.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis008_search',
					label: 'Search the rubble',
					checkType: 'LUCK_CHECK',
					successChance: 40,
					onSuccess: {
						description: 'You find an intact piece of armor!',
						procGen: { items: [{ category: 'Physical', itemClass: 'Armor', tierModifier: 0, count: 1 }] },
					},
					onFailure: { description: 'You cut your hand on rusty iron and find nothing.', hpMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_dis_009',
			name: 'Mysterious Herbs',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description: 'A patch of vibrant red herbs grows by the trail.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis009_id',
					label: 'Identify and harvest',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1,
					onSuccess: { description: 'You carefully extract the medicinal properties.', healingPotions: { tier: 'MINOR', type: 'REWARD' } },
					onFailure: { description: 'You mishandle them and get a nasty chemical burn.', hpMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_dis_010',
			name: 'Trapped Chest',
			typology: 'Discovery',
			eventType: 'NEUTRAL',
			description: 'An ornate chest sits in a clearing. A thin tripwire is barely visible.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis010_disarm',
					label: 'Disarm the trap',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0,
					onSuccess: { description: 'Click. The chest opens safely.', procGen: { items: [{ category: 'Loot', count: 3 }] } },
					onFailure: { description: 'A poison dart shoots from the lock!', hpMod: { tier: 'MODERATE', type: 'PENALTY' } },
				},
			],
		},

		// ==========================================
		// TYPOLOGY: SOCIAL ENCOUNTER (6 Events)
		// ==========================================
		{
			id: 'evt_soc_001',
			name: 'Wandering Merchant',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description: 'A hooded merchant offers to sell you a healing draught.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc001_buy',
					label: 'Buy Potion',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 75 },
					onSuccess: { description: 'You secure the potion for your journey.', healingPotions: { tier: 'MINOR', type: 'REWARD' } },
				},
				{ id: 'ch_soc001_decline', label: 'Decline', checkType: 'GENERAL', onSuccess: { description: 'You politely refuse and part ways.' } },
			],
		},
		{
			id: 'evt_soc_002',
			name: 'Starving Refugee',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description: 'A desperate traveler begs for a meager portion of your rations.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc002_give',
					label: 'Share Food',
					checkType: 'TRADE_OFF',
					cost: { food: 3 },
					onSuccess: {
						description: 'The traveler blesses your name. Word of your kindness will spread.',
						honor: { tier: 'MAJOR', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc002_ignore',
					label: 'Keep walking',
					checkType: 'GENERAL',
					onSuccess: { description: 'You protect your supplies, but feel a twinge of guilt.', honor: { tier: 'MODERATE', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_soc_003',
			name: 'Traveling Scholar',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description: 'An elderly scholar invites you to sit and discuss history and philosophy.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc003_talk',
					label: 'Engage in debate',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: { description: 'Your mind expands from the profound conversation.', int: { tier: 'MINOR', type: 'REWARD' } },
					onFailure: { description: 'The conversation goes over your head. You just waste time.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_soc_004',
			name: 'Suspicious Peddler',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description: 'A shady peddler challenges you to a game of chance.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc004_gamble',
					label: 'Wager 50 Silver',
					checkType: 'LUCK_CHECK',
					successChance: 33,
					onSuccess: { description: 'You win the pot!', silverCoins: { tier: 'MAJOR', type: 'REWARD' } },
					onFailure: { description: 'The game was rigged. You lose your coins.', silverCoins: { tier: 'MODERATE', type: 'PENALTY' } },
				},
				{ id: 'ch_soc004_refuse', label: 'Walk away', checkType: 'GENERAL', onSuccess: { description: 'You wisely avoid the scam.' } },
			],
		},
		{
			id: 'evt_soc_005',
			name: 'Tavern Arm Wrestle',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description: 'A local brute challenges you to a test of strength.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc005_wrestle',
					label: 'Accept challenge',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 1,
					onSuccess: {
						description: 'You slam his hand to the table! The crowd cheers.',
						silverCoins: { tier: 'MODERATE', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: { description: 'He overpowers you easily. You lose your wager.', silverCoins: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_soc_006',
			name: 'Lost Child',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description: 'You find a crying child who wandered too far from their village.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc006_escort',
					label: 'Escort them home',
					checkType: 'GENERAL',
					onSuccess: {
						description: 'You return the child safely. The village is deeply grateful.',
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
						renown: { tier: 'MODERATE', type: 'REWARD' },
						honor: { tier: 'MODERATE', type: 'REWARD' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: COMBAT ENCOUNTER (4 Events)
		// ==========================================
		// ==========================================
		// TYPOLOGY: GENERAL (4 Events)
		// ==========================================
		{
			id: 'evt_gen_001',
			name: 'Good Omen',
			typology: 'General',
			eventType: 'POSITIVE',
			description: 'You witness a shooting star streak across the sky. You feel blessed.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'REWARD' }, hpMod: { tier: 'MINOR', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_002',
			name: 'Uneasy Feeling',
			typology: 'General',
			eventType: 'NEGATIVE',
			description: 'A sudden wave of paranoia washes over you, making you overly cautious and slowing you down.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_003',
			name: 'Clear Path',
			typology: 'General',
			eventType: 'POSITIVE',
			description: 'The road ahead is flat and solid, allowing you to cover ground quickly.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MODERATE', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_004',
			name: 'Broken Wheel',
			typology: 'General',
			eventType: 'NEUTRAL',
			description: 'You encounter a merchant struggling with a broken wagon wheel.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_gen004_help',
					label: 'Help lift the wagon',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description: 'You fix the wheel. The merchant tips you with trade silver.',
						tradeSilver: { tier: 'MINOR', type: 'REWARD' },
						honor: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: {
						description: 'You strain your back and fail to lift it.',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{ id: 'ch_gen004_ignore', label: 'Keep walking', checkType: 'GENERAL', onSuccess: { description: 'You leave them to their fate.' } },
			],
		},
		// ==========================================
		// TYPOLOGY: HAZARD (4 Events: 2 POS, 2 NEG)
		// ==========================================
		{
			id: 'evt_haz_007',
			name: 'Refreshing Breeze',
			typology: 'Hazard',
			eventType: 'POSITIVE',
			description: 'A sudden, cool breeze cuts through the harsh weather, giving you a second wind.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MINOR', type: 'REWARD' }, hpMod: { tier: 'MINOR', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_008',
			name: 'Salvaged Trap',
			typology: 'Hazard',
			eventType: 'POSITIVE',
			description: 'You spot a poorly concealed snare trap before stepping into it.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz008_dismantle',
					label: 'Dismantle for parts',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: { description: 'You carefully take the trap apart and keep the components.', procGen: { items: [{ category: 'Loot', count: 2 }] } },
					onFailure: { description: 'The mechanism snaps, destroying the parts but leaving you unharmed.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_haz_009',
			name: 'Sweltering Heat',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'An oppressive wave of heat exhausts you and forces you to consume extra water and food.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MODERATE', type: 'PENALTY' }, food: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_haz_010',
			name: 'Mud Sinkhole',
			typology: 'Hazard',
			eventType: 'NEGATIVE',
			description: 'The ground gives way, plunging you into thick, sucking mud.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_haz010_escape',
					label: 'Struggle out',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 1,
					onSuccess: { description: 'You pull yourself free using sheer strength.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
					onFailure: {
						description: 'You exhaust yourself escaping and swallow foul water.',
						apMod: { tier: 'MAJOR', type: 'PENALTY' },
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: DISCOVERY (4 Events: 2 POS, 2 NEG)
		// ==========================================
		{
			id: 'evt_dis_011',
			name: 'Crystal Spring',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'You discover a hidden spring of pristine, restorative water.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { hpMod: { tier: 'MODERATE', type: 'REWARD' }, healingPotions: { tier: 'MINOR', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_012',
			name: 'Buried Lockbox',
			typology: 'Discovery',
			eventType: 'POSITIVE',
			description: 'You notice the corner of a metal box protruding from the soil.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis012_pry',
					label: 'Pry it open',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0,
					onSuccess: {
						description: 'The rusty hinges give way, revealing goods inside.',
						tradeSilver: { tier: 'MODERATE', type: 'REWARD' },
						procGen: { items: [{ category: 'Physical', itemClass: 'Armor', tierModifier: 0, count: 1 }] },
					},
					onFailure: { description: 'You jam your fingers trying to force it. The box remains sealed.', hpMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_dis_013',
			name: 'Cursed Effigy',
			typology: 'Discovery',
			eventType: 'NEGATIVE',
			description: 'You stumble into a clearing containing a dark, twisted totem. A sense of dread fills you.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { honor: { tier: 'MODERATE', type: 'PENALTY' }, apMod: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_dis_014',
			name: 'Moldy Cache',
			typology: 'Discovery',
			eventType: 'NEGATIVE',
			description: 'You locate an old survival cache, but moisture has compromised the seal.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_dis014_salvage',
					label: 'Salvage what you can',
					checkType: 'LUCK_CHECK',
					successChance: 50,
					onSuccess: { description: 'You manage to find a few unspoiled items.', procGen: { items: [{ category: 'Loot', count: 1 }] } },
					onFailure: { description: 'The mold spores make you sick, and the items disintegrate.', hpMod: { tier: 'MODERATE', type: 'PENALTY' } },
				},
			],
		},

		// ==========================================
		// TYPOLOGY: SOCIAL ENCOUNTER (4 Events: 2 POS, 2 NEG)
		// ==========================================
		{
			id: 'evt_soc_007',
			name: 'Grateful Pilgrim',
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description: 'A pilgrim you pass on the road recognizes your faction and blesses your journey.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { renown: { tier: 'MINOR', type: 'REWARD' }, honor: { tier: 'MINOR', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_soc_008',
			name: "Noble's Escort",
			typology: 'SocialEncounter',
			eventType: 'POSITIVE',
			description: "A wealthy noble's carriage is stuck. They ask for a portion of your supplies in exchange for payment.",
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc008_trade',
					label: 'Provide Food',
					checkType: 'TRADE_OFF',
					cost: { food: 5 },
					onSuccess: {
						description: 'The noble rewards you handsomely for your assistance.',
						silverCoins: { tier: 'MAJOR', type: 'REWARD' },
						tradeGold: { tier: 'MINOR', type: 'REWARD' },
					},
				},
				{
					id: 'ch_soc008_ignore',
					label: 'Apologize and leave',
					checkType: 'GENERAL',
					onSuccess: { description: 'You keep your food, missing an opportunity.' },
				},
			],
		},
		{
			id: 'evt_soc_009',
			name: 'Skilled Pickpocket',
			typology: 'SocialEncounter',
			eventType: 'NEGATIVE',
			description: 'A street urchin bumps into you. A few minutes later, you realize your coin purse is lighter.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { silverCoins: { tier: 'MODERATE', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_soc_010',
			name: 'Hostile Drunkard',
			typology: 'SocialEncounter',
			eventType: 'NEGATIVE',
			description: 'An aggressive drunk blocks your path, hurling insults and looking for a fight.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_soc010_deescalate',
					label: 'Talk them down',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 0,
					onSuccess: { description: 'You confuse the drunkard long enough to slip past safely.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
					onFailure: { description: 'They swing wildly, striking you before passing out.', hpMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
			],
		},

		// ==========================================
		// TYPOLOGY: COMBAT ENCOUNTER (4 Events: 2 POS, 2 NEG)
		// ==========================================
		{
			id: 'evt_cmb_001',
			name: 'Highwaymen Ambush',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description: 'Bandits block the road, demanding a toll for safe passage.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Criminal', 'Military'], subclasses: ['Bandit', 'Highwayman'], rankModifier: 0 },
			},
			choices: [
				{
					id: 'ch_cmb001_pay',
					label: 'Pay the toll',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 100 },
					onSuccess: { description: 'You pay them off and they let you pass.', honor: { tier: 'MINOR', type: 'PENALTY' } },
				},
				{
					id: 'ch_cmb001_fight',
					label: 'Draw your weapon',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You defeated the bandits!',
						renown: { tier: 'MINOR', type: 'REWARD' },
						procGen: { items: [{ category: 'Loot', count: 2 }] },
					},
					onFailure: {
						description: 'You were beaten and robbed.',
						silverCoins: { tier: 'MAJOR', type: 'PENALTY' },
						hpMod: { tier: 'MAJOR', type: 'PENALTY' },
					},
				},
			],
		},
		{
			id: 'evt_cmb_002',
			name: 'Rabid Wolf',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description: 'A foaming, aggressive wolf lunges at you from the brush!',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: { procGen: { type: 'NPC_ANIMAL', categories: ['Animal'], classes: ['Wild'], subclasses: ['Wolf', 'Dire_Wolf'], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_cmb002_flee',
					label: 'Sprint away',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 1,
					onSuccess: { description: 'You manage to outrun the beast.', apMod: { tier: 'MODERATE', type: 'PENALTY' } },
					onFailure: {
						description: 'It bites your ankle before you escape.',
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb002_fight',
					label: 'Fight',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: { description: 'You slay the beast.', food: { tier: 'MINOR', type: 'REWARD' } },
					onFailure: { description: 'You barely escape with your life.', hpMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_cmb_003',
			name: 'Goblin Scouting Party',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description: 'You spot a vicious monster scouting the perimeter.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: { procGen: { type: 'NPC_MONSTER', categories: ['Monster'], classes: ['Beast', 'Humanoid'], subclasses: ['Goblin'], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_cmb003_hide',
					label: 'Hide in the shadows',
					checkType: 'LUCK_CHECK',
					successChance: 50,
					onSuccess: { description: 'They pass by without noticing you.' },
					onFailure: {
						description: 'You step on a twig and alert them!',
						hpMod: { tier: 'MINOR', type: 'PENALTY' },
						apMod: { tier: 'MINOR', type: 'PENALTY' },
					},
				},
				{
					id: 'ch_cmb003_fight',
					label: 'Ambush them',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You eliminated the threat.',
						renown: { tier: 'MINOR', type: 'REWARD' },
						procGen: { items: [{ category: 'Physical', itemClass: 'Weapon', count: 1 }] },
					},
					onFailure: { description: 'You were forced to retreat.', hpMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_cmb_004',
			name: 'Territorial Bear',
			typology: 'CombatEncounter',
			eventType: 'NEUTRAL',
			description: 'A massive bear blocks your path, roaring in warning.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: { procGen: { type: 'NPC_ANIMAL', categories: ['Animal'], classes: ['Wild'], subclasses: ['Bear', 'Grizzly_Bear'], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_cmb004_intimidate',
					label: 'Roar back (Intimidate)',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 2,
					onSuccess: { description: "The bear decides you aren't worth the trouble and leaves.", renown: { tier: 'MINOR', type: 'REWARD' } },
					onFailure: { description: 'The bear swipes at you for your insolence!', hpMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
				{
					id: 'ch_cmb004_fight',
					label: 'Attack',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You conquer the mighty beast.',
						renown: { tier: 'MODERATE', type: 'REWARD' },
						food: { tier: 'MODERATE', type: 'REWARD' },
					},
					onFailure: { description: 'You are horribly mauled.', hpMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_cmb_005',
			name: 'Easy Prey',
			typology: 'CombatEncounter',
			eventType: 'POSITIVE',
			description: 'You spot an injured, isolated wild animal. It would be an easy hunt.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: {
				procGen: {
					type: 'NPC_ANIMAL',
					categories: ['Animal'],
					classes: ['Wild'],
					subclasses: [],
					rankModifier: -1, // Decreased rank to reflect the injured state
				},
			},
			choices: [
				{
					id: 'ch_cmb005_hunt',
					label: 'Engage the prey',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: { description: 'A swift kill yields a bounty of meat.', food: { tier: 'MAJOR', type: 'REWARD' } },
					onFailure: { description: 'The beast fought back fiercely before escaping.', hpMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
				{
					id: 'ch_cmb005_spare',
					label: 'Show mercy',
					checkType: 'GENERAL',
					onSuccess: { description: 'You leave the animal in peace.', honor: { tier: 'MODERATE', type: 'REWARD' } },
				},
			],
		},
		{
			id: 'evt_cmb_006',
			name: 'Sparring Match',
			typology: 'CombatEncounter',
			eventType: 'POSITIVE',
			description: 'A friendly mercenary challenges you to a non-lethal duel to test your skills.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Military'], subclasses: ['Mercenary', 'Soldier'], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_cmb006_accept',
					label: 'Accept the duel',
					checkType: 'COMBAT',
					combatRule: 'NF',
					onSuccess: {
						description: 'You bested your opponent. You feel your technique improving.',
						str: { tier: 'MINOR', type: 'REWARD' },
						renown: { tier: 'MINOR', type: 'REWARD' },
					},
					onFailure: { description: 'You lost the bout, taking a few bruises to your ego and body.', hpMod: { tier: 'MINOR', type: 'PENALTY' } },
				},
				{
					id: 'ch_cmb006_decline',
					label: 'Politely decline',
					checkType: 'GENERAL',
					onSuccess: { description: 'You conserve your energy for real threats.' },
				},
			],
		},
		{
			id: 'evt_cmb_007',
			name: 'Undead Ambusher',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description: 'A shambling corpse rises from the dirt, eyes glowing with malice!',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: { procGen: { type: 'NPC_MONSTER', categories: ['Monster'], classes: ['Undead'], subclasses: [], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_cmb007_fight',
					label: 'Purge the undead',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You shatter the abomination.',
						honor: { tier: 'MINOR', type: 'REWARD' },
						procGen: { items: [{ category: 'Loot', count: 1 }] },
					},
					onFailure: { description: 'The undead overwhelmed you, leaving you severely injured.', hpMod: { tier: 'MAJOR', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_cmb_008',
			name: 'Ruthless Thug',
			typology: 'CombatEncounter',
			eventType: 'NEGATIVE',
			description: 'A heavily armed thug demands your valuables at knifepoint.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Criminal'], subclasses: ['Thug', 'Bandit'], rankModifier: 0 } },
			choices: [
				{
					id: 'ch_cmb008_fight',
					label: 'Defend yourself',
					checkType: 'COMBAT',
					combatRule: 'DMF',
					onSuccess: {
						description: 'You defeated the attacker and took their weapon.',
						procGen: { items: [{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 }] },
					},
					onFailure: {
						description: 'You were beaten and robbed of your trade goods.',
						tradeSilver: { tier: 'MODERATE', type: 'PENALTY' },
						hpMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TYPOLOGY: GENERAL (4 Events: 2 POS, 2 NEG)
		// ==========================================
		{
			id: 'evt_gen_005',
			name: 'Moment of Clarity',
			typology: 'General',
			eventType: 'POSITIVE',
			description: 'Taking a quiet moment to reflect, you synthesize everything you have learned recently.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { int: { tier: 'MINOR', type: 'REWARD' }, apMod: { tier: 'MINOR', type: 'REWARD' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_006',
			name: 'Hidden Shortcut',
			typology: 'General',
			eventType: 'POSITIVE',
			description: 'You spot a narrow game trail that might cut hours off your journey.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_gen006_risk',
					label: 'Take the shortcut',
					checkType: 'LUCK_CHECK',
					successChance: 70,
					onSuccess: { description: 'The path is clear and saves you significant time.', apMod: { tier: 'MAJOR', type: 'REWARD' } },
					onFailure: { description: 'The trail ends at a ravine. You have to backtrack.', apMod: { tier: 'MODERATE', type: 'PENALTY' } },
				},
			],
		},
		{
			id: 'evt_gen_007',
			name: 'Restless Slumber',
			typology: 'General',
			eventType: 'NEGATIVE',
			description: 'Nightmares and strange noises keep you awake, leaving you fatigued.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: { apMod: { tier: 'MODERATE', type: 'PENALTY' }, hpMod: { tier: 'MINOR', type: 'PENALTY' } },
			procGen: null,
			onEncounter: null,
			choices: null,
		},
		{
			id: 'evt_gen_008',
			name: 'Snapped Strap',
			typology: 'General',
			eventType: 'NEGATIVE',
			description: 'A vital leather strap on your gear snaps. You must stop to repair it.',
			conditions: { weight: 50, minRank: 1, allowedTriggers: ['travel', 'explore', 'endturn'] },
			staticEffects: null,
			procGen: null,
			onEncounter: null,
			choices: [
				{
					id: 'ch_gen008_fix',
					label: 'Attempt field repairs',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: -1,
					onSuccess: { description: 'You quickly stitch it together, losing minimal time.', apMod: { tier: 'MINOR', type: 'PENALTY' } },
					onFailure: {
						description: 'You ruin the strap and have to spend coins to replace it later.',
						silverCoins: { tier: 'MINOR', type: 'PENALTY' },
						apMod: { tier: 'MODERATE', type: 'PENALTY' },
					},
				},
			],
		},

		// ==========================================
		// TEST EVENT: INTERACTION BRIDGE
		// ==========================================
		{
			id: 'evt_test_interaction_bridge',
			name: 'The Wandering Merchant (Test)',
			typology: 'SocialEncounter',
			eventType: 'NEUTRAL',
			description: 'A heavily burdened merchant stops on the path ahead. This is a high-priority test event to verify the STANDARD_INTERACTION bridge.',
			conditions: { 
				weight: 99999, // Guaranteed to override all other events
				minRank: 1, 
				allowedTriggers: ['travel', 'explore', 'endturn'] 
			},
			staticEffects: null,
			// Procedurally generate a Human from the Trade class
			onEncounter: { 
				procGen: { 
					type: 'NPC_HUMAN', 
					categories: ['Human'], 
					classes: ['Trade'], 
					rankModifier: 0 
				} 
			},
			choices: [
				{
					id: 'ch_test_interact',
					label: 'Approach and Interact',
					checkType: 'STANDARD_INTERACTION',
					// No onSuccess payload needed; the engine intercepts this and routes to VIEWPORT
				},
				{
					id: 'ch_test_ignore',
					label: 'Ignore and walk away',
					checkType: 'GENERAL',
					onSuccess: { 
						description: 'You ignored the merchant and continued on your way.' 
					},
				},
			],
		},
	],
};
