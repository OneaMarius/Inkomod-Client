// File: Client/src/data/DB_Interaction_Actions.js
// Description: Unified Single Source of Truth for all game actions, their costs, and execution routes.

export const DB_INTERACTION_ACTIONS = {
	// ========================================================================
	// ROUTE: TRADE (Navigates to ShopView / Commerce system)
	// ========================================================================

	Trade_Weapon: {
		id: 'Trade_Weapon',
		category: 'commerceEconomy',
		description:
			'Enables purchasing or selling of physical Weapon class items.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Armor: {
		id: 'Trade_Armor',
		category: 'commerceEconomy',
		description:
			'Enables purchasing or selling of physical Armor class items.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Shield: {
		id: 'Trade_Shield',
		category: 'commerceEconomy',
		description:
			'Enables purchasing or selling of physical Shield class items.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Helmet: {
		id: 'Trade_Helmet',
		category: 'commerceEconomy',
		description:
			'Enables purchasing or selling of physical Helmet class items.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Mount: {
		id: 'Trade_Mount',
		category: 'commerceEconomy',
		description:
			'Enables purchasing or selling of biological Mount class items.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Animal: {
		id: 'Trade_Animal',
		category: 'commerceEconomy',
		description:
			'Enables purchasing or selling of biological Animal entities.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Food: {
		id: 'Trade_Food',
		category: 'commerceEconomy',
		description: 'Enables purchasing or selling of Food resources.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Potion: {
		id: 'Trade_Potion',
		category: 'commerceEconomy',
		description: 'Enables purchasing or selling of Potion consumables.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Coin: {
		id: 'Trade_Coin',
		category: 'commerceEconomy',
		description:
			'Enables the exchange of physical assets (Banker exclusive).',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Trade_Loot: {
		id: 'Trade_Loot',
		category: 'commerceEconomy',
		description:
			'Enables purchasing or selling of non-equippable artifacts, monster parts, and trophies.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},
	Repair_Equipment: {
		id: 'Repair_Equipment',
		category: 'maintenanceRestoration',
		description: 'Enables repair of equipped or inventory items.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_TRADE',
		apCost: 0,
	},

	// ========================================================================
	// ROUTE: COMBAT (Navigates to CombatView / Combat system)
	// ========================================================================

	Combat_Engage: {
		id: 'Combat_Engage',
		category: 'combatHostility',
		description: 'Initiates a lethal combat sequence against the entity.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT', // MODIFICAT DIN ROUTE_COMBAT
		combatRule: 'DMF',
		apCost: 1,
	},
	Combat_Duel: {
		id: 'Combat_Duel',
		category: 'combatHostility',
		description: 'Initiates a formal duel. No lethal HP loss permitted.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT', // MODIFICAT DIN ROUTE_COMBAT
		combatRule: 'FF',
		apCost: 1,
	},
	Combat_Training: {
		id: 'Combat_Training',
		category: 'combatHostility',
		description:
			'Initiates a training combat sequence. No lethal HP loss permitted.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT', // MODIFICAT DIN ROUTE_COMBAT
		combatRule: 'FF',
		apCost: 2,
	},
	Combat_Brawl: {
		id: 'Combat_Brawl',
		category: 'combatHostility',
		description: 'Initiates a spontaneous, unstructured fight.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT', // MODIFICAT DIN ROUTE_COMBAT
		combatRule: 'NF',
		apCost: 1,
	},
	Fight_Humanoid: {
		id: 'Fight_Humanoid',
		category: 'combatHostility',
		description: 'Initiates an encounter with a humanoid.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_COMBAT',
		combatRule: 'DMF',
		apCost: 1,
	},
	Fight_Animal: {
		id: 'Fight_Animal',
		category: 'combatHostility',
		description: 'Initiates a lethal encounter with a wild animal.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_COMBAT',
		combatRule: 'DMF',
		apCost: 1,
	},
	Fight_Monster: {
		id: 'Fight_Monster',
		category: 'combatHostility',
		description: 'Initiates a lethal encounter with a monster.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_COMBAT',
		combatRule: 'DMF',
		apCost: 1,
	},
	Fight_Nephilim: {
		id: 'Fight_Nephilim',
		description: 'Engage the ancient being in a deathmatch.',
		category: 'combatHostility',
		executionRoute: 'ROUTE_COMBAT',
		targetType: 'NPC',
		combatRule: 'DMF',
		apCost: 1,
	},

	// ========================================================================
	// ROUTE: INSTANT but Combat-Related (Resolves within ENGINE_Interaction.js but triggers combat consequences)
	// ========================================================================
	Ambush_Animal: {
		id: 'Ambush_Animal',
		category: 'combatHostility',
		description: 'Attempt to ambush the wild animal for a preemptive strike.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		combatRule: 'DMF',
		apCost: 2,
	},
	Ambush_Monster: {
		id: 'Ambush_Monster',
		category: 'combatHostility',
		description: 'Attempt a surprise attack against the monster.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		combatRule: 'DMF',
		apCost: 2,
	},
	Ambush_Nephilim: {
		id: 'Ambush_Nephilim',
		category: 'combatHostility',
		description: 'Attempt the impossible: ambush a Nephilim.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		combatRule: 'DMF',
		apCost: 2,
	},
	Target_Ambush: {
		id: 'Target_Ambush',
		category: 'combatHostility',
		description: 'Initiates a surprise attack sequence against the entity.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		combatRule: 'DMF',
		apCost: 2,
	},
	Target_Assassination: {
		id: 'Target_Assassination',
		category: 'targetVulnerability',
		description:
			'Attempts an assassination execution protocol against the entity.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 2,
	},
	Target_Robbery: {
		id: 'Target_Robbery',
		category: 'targetVulnerability',
		description: 'Initiates a theft sequence targeting the entity.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 2,
	},
	Target_Steal_Coin: {
		id: 'Target_Steal_Coin',
		category: 'targetVulnerability',
		description: 'Initiates a theft sequence targeting the entity coin slot.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},
	Target_Steal_Food: {
		id: 'Target_Steal_Food',
		category: 'targetVulnerability',
		description: 'Initiates a theft sequence targeting the entity food slot.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},
	Target_Steal_Animal: {
		id: 'Target_Steal_Animal',
		description:
			'Attempt to silently steal or capture the animal without alerting guards or its owner.',
		executionRoute: 'ROUTE_INSTANT',
		targetType: 'NPC',
		apCost: 1,
	},

	// ========================================================================
	// ROUTE: INSTANT (Resolves strictly within ENGINE_Interaction.js)
	// ========================================================================

	Labor_Coin: {
		id: 'Labor_Coin',
		category: 'employmentLabor',
		description: 'Allows the player to perform tasks in exchange for coins.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseYield: 5,
	},
	Labor_Food: {
		id: 'Labor_Food',
		category: 'employmentLabor',
		description:
			'Offer your physical labor to local farmers, fishermen, or shepherds in exchange for food rations.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},
	Service_Lodging: {
		id: 'Service_Lodging',
		category: 'utilityLogistics',
		description:
			'Rent a room for a short rest. Restores up to 10 HP and 2 AP.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseCost: 5,
		hpRestored: 10,
		apRestored: 2, // <-- NOU: Definim AP-ul pe care îl recuperează
	},
	Heal_Mount: {
		id: 'Heal_Mount',
		category: 'maintenanceRestoration',
		description:
			"Pay a stablemaster or beast handler to tend to your mount's wounds and restore its operational health.",
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseCost: 2,
		dynamicCostFactor: 10,
	},
	Heal_Player: {
		id: 'Heal_Player',
		category: 'maintenanceRestoration',
		description:
			'Receive medical attention to restore HP up to your wound limit. The silver cost scales based on the severity of your injuries.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseCost: 5,
		dynamicCostFactor: 50, // <-- NOU: Divizorul pentru formula dinamică
	},
	Cure_Player: {
		id: 'Cure_Player',
		category: 'maintenanceRestoration',
		description:
			'Restores the biological HP limit to maximum. The silver cost scales based on the severity of the permanent wounds.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseCost: 10,
		dynamicCostFactor: 50, // <-- NOU
	},
	Train_STR: {
		id: 'Train_STR',
		category: 'attributeProgression',
		description:
			'Undergo physical conditioning to increase Strength. Costs scale with your current Identity Rank.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseCost: 5,
		statIncrement: 1,
	},
	Train_AGI: {
		id: 'Train_AGI',
		category: 'attributeProgression',
		description:
			'Practice reflexes and coordination to increase Agility. Costs scale with your current Identity Rank.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseCost: 5,
		statIncrement: 1,
	},
	Train_INT: {
		id: 'Train_INT',
		category: 'attributeProgression',
		description:
			'Study and meditate to increase Intellect. Costs scale with your current Identity Rank.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
		goldCoinBaseCost: 5,
		statIncrement: 1,
	},
	Target_Bribe: {
		id: 'Target_Bribe',
		category: 'targetVulnerability',
		description:
			'Attempts to bribe the entity to bypass hostility or gain favor.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},
	Donate_Pray: {
		id: 'Donate_Pray',
		category: 'npcInteractions',
		description:
			'Offer your time in prayer and spiritual reflection. A selfless act that requires no material wealth, only your time and devotion.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 2, // Trebuie să corespundă cu WORLD.MORALITY.actions.donatePrayAp
	},
	Donate_Coin: {
		id: 'Donate_Coin',
		category: 'npcInteractions',
		description:
			'Donate silver coins to support the needy or a local cause. Earning the gratitude of the community improves your Honor and Renown.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},
	Donate_Food: {
		id: 'Donate_Food',
		category: 'npcInteractions',
		description:
			'Donate food provisions to feed the hungry. Sharing vital resources is highly appreciated and yields excellent Honor.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},

	// ========================================================================
	//  Special Actions with Unique Mechanics (Handled by custom logic within ENGINE_Interaction.js)
	// ========================================================================

	Hunt_Animal: {
		id: 'Hunt_Animal', // sau actionTag: 'Hunt_Animal', în funcție de cheia folosită
		category: 'combatHostility',
		description: 'Track and engage the animal in a lethal hunt.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},
	Evade_Animal: {
		id: 'Evade_Animal',
		category: 'combatHostility',
		description: 'Attempt to evade the animal encounter.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 0,
	},
	Evade_Monster: {
		id: 'Evade_Monster',
		category: 'combatHostility',
		description: 'Attempt to evade the monster encounter.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 0,
	},
	Evade_Nephilim: {
		id: 'Evade_Nephilim',
		description: 'Attempt to slip away without drawing its attention.',
		category: 'combatHostility',
		executionRoute: 'ROUTE_INSTANT',
		targetType: 'NPC',
		apCost: 0,
	},
	Ignore: {
		id: 'Ignore',
		category: 'npcInteractions',
		description: 'Ignore the entity and proceed.',
		targetType: 'NPC',
		executionRoute: 'ROUTE_INSTANT',
		apCost: 0,
	},

	Present_Trophies: {
		id: 'Present_Trophies',
		description: 'Present the severed heads of the Nephilim to King Midas.',
		category: 'quest',
		executionRoute: 'ROUTE_INSTANT',
		targetType: 'POI', // Marcăm că ținta este locația, nu un NPC
		apCost: 0,
	},

	// ========================================================================
	// ROUTE: SPATIAL (Resolves strictly within GameManager.js / POI mechanics)
	// ========================================================================

	Enter_Location: {
		id: 'Enter_Location',
		category: 'spatial',
		description: 'Enter the point of interest.',
		targetType: 'ENVIRONMENT',
		executionRoute: 'ROUTE_SPATIAL',
		apCost: 1,
	},
	Exit_Location: {
		id: 'Exit_Location',
		category: 'spatial',
		description: 'Exit the current point of interest.',
		targetType: 'ENVIRONMENT',
		executionRoute: 'ROUTE_SPATIAL',
		apCost: 0,
	},
	Explore_Wilderness: {
		id: 'Explore_Wilderness',
		category: 'spatial',
		description:
			'Scour the surrounding untamed region for points of interest.',
		targetType: 'ENVIRONMENT',
		executionRoute: 'ROUTE_SPATIAL',
		apCost: 1,
	},
	Rest_Road: {
		id: 'Rest_Road',
		category: 'maintenanceRestoration',
		description:
			'Take a short rest on the side of the road. Consumes 1 food ration to restore 5 HP.',
		targetType: 'ENVIRONMENT', // Tells the UI no NPC is needed
		executionRoute: 'ROUTE_INSTANT',
		apCost: 1,
	},
};
