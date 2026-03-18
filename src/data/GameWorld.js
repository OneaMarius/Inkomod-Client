// File: src/data/GameWorld.js
// Description: Centralized Global Constants for Iron Nature: Knight of Medieval Old Days

export const WORLD = {
	// ------------------------------------------------------------------------
	// PLAYER ENTITY CONSTANTS
	// ------------------------------------------------------------------------
	PLAYER: {
		baseAp: 8,
		maxAp: 8,
		baseCapacity: 50,
		capacityPerStr: 5,
		hpLimits: {
			starting: 100,
			hardCap: 100,
			minCap: 50,
			starvingHpCap: 15,
		},
		baseFoodNeed: 2,
		healingRates: {
			standard: 25,
			starving: -25,
		},
		trainingCaps: {
			str: [15, 25, 35, 45, 50],
			agi: [15, 25, 35, 45, 50],
			int: [15, 25, 35, 45, 50],
		},
		inventoryLimits: {
			totalSlots: 50, // Increased from 35 to 50
			equippedMountSlots: 1,
			equippedItemSlots: 4,
			animalSlots: 10,
			itemSlots: 20, // Equippable gear (Weapons, Armour, Shields, Helmets)
			lootSlots: 15, // NEW: Non-equippable trade goods (Monster Parts, Trophies, etc.)
		},
		aging: {
			statLossThreshold: 50, // Age when degradation begins
			annualStatPenalty: 1, // STR, AGI, INT, HP lost per year over threshold
			mortalityTiers: [
				{ maxAge: 49, annualRisk: 0.003 },
				{ maxAge: 74, annualRisk: 0.02 },
				{ maxAge: 100, annualRisk: 0.1 }, // Death is highly probable at this stage
			],
		},
	},

	// ------------------------------------------------------------------------
	// NON-PLAYER CHARACTER (NPC) CONSTANTS
	// ------------------------------------------------------------------------
	NPC: {
		HUMAN: {
			// Base ranks, social class multipliers, base stats
		},
		ANIMAL: {
			MOUNT: {
				baseMass: 0, // Biological entities handled by logistics
				eipMountBonus: 10, // Multiplier for Item_Tier in price calculation
				hpBase: 50,
				hpTierMultiplier: 10,
				hardCap: 100,
				adpBounds: {
					min: [5, 15, 25, 35, 45],
					max: [15, 25, 35, 45, 55],
				},
				ddrBounds: {
					min: [5, 15, 20, 25, 30],
					max: [15, 25, 35, 45, 50],
				},
			},
			foodYieldMultipliers: {
				slaughter: 1.0,
				death: 0.5, // Used during starvation
			},
			healingRates: {
                natural: 5,   // HP recuperat lunar dacă au hrană
                starving: -25, // HP pierdut lunar prin înfometare
            },
		},
		MONSTER: {
			// Aggro ranges, specific loot tables
		},
		NEPHILIM: {
			// Unique entity constraints, boss modifiers
		},
	},

	// ------------------------------------------------------------------------
	// EQUIPMENT & ITEM CONSTANTS (THOR DOMAIN)
	// ------------------------------------------------------------------------
	ITEM: {
		GENERAL: {
			maxTier: 5,
			fullDurability: 100,
			// Economic Index Points (folosite pentru generarea prețului de bază)
			eipPerAdp: 1,
			eipPerDdr: 2,
			generationContexts: {
				trade: { conditionBase: 100, conditionFlux: 0 },
				npc: { minCondition: 25, conditionPerRank: 10 },
				loot: { maxCondition: 75, penaltyPerTier: 10 },
			},
		},

		// Elementele textuale pentru generarea numelor
		nomenclature: {
			categories: ['Weapon', 'Shield', 'Helmet', 'Armour'],
			suffixes: [
				'of the King',
				'of Thor',
				'of the Bear',
				'of the Vanguard',
				'of Zeus',
				'of the Shadows',
			],
			classes: {
				weapon: ['Blunt', 'Sharp'],
				shield: ['Wood', 'Iron', 'Steel'],
				armour: ['Cloth', 'Leather', 'Bronze', 'Iron', 'Steel', 'Gold'],
				helmet: ['Cloth', 'Leather', 'Bronze', 'Iron', 'Steel', 'Gold'],
			},
			subclasses: {
				weapon: {
					blunt: ['Mace', 'Hammer', 'Club', 'Morningstar'],
					sharp: ['Sword', 'Axe', 'Dagger', 'Spear'],
				},
				shield: {
					wood: ['Wooden Buckler', 'Kite Shield', 'Targe'],
					iron: ['Iron Buckler', 'Heater Shield', 'Iron Tower Shield'],
					steel: ['Steel Kite Shield', 'Heavy Steel Shield', 'Pavise'],
				},
				armour: {
					cloth: ['Robes', 'Tunic', 'Gambeson'],
					leather: ['Leather Tunic', 'Brigandine', 'Cuirbouilli'],
					bronze: ['Bronze Cuirass', 'Bronze Scales'],
					iron: ['Iron Hauberk', 'Chainmail', 'Iron Cuirass'],
					steel: ['Steel Plate', 'Steel Half-Plate'],
					gold: ['Golden Chestplate', 'Golden Regalia'],
				},
				helmet: {
					cloth: ['Hood', 'Cowl'],
					leather: ['Leather Cap', 'Coif'],
					bronze: ['Bronze Helm', 'Bronze Crest'],
					iron: ['Iron Bascinet', 'Iron Sallet', 'Skullcap'],
					steel: ['Steel Greathelm', 'Steel Visor', 'Armet'],
					gold: ['Golden Crown', 'Golden Mask'],
				},
			},
			prefixes: {
				weapon: [
					'Heavy',
					'Swift',
					'Balanced',
					'Strong',
					'Powerful',
					'Light',
					'Ancient',
					'Masterwork',
				],
				armour: [
					'Sturdy',
					'Reinforced',
					'Light',
					'Imposing',
					'Ancient',
					'Masterwork',
				],
				shield: [
					'Heavy',
					'Defensive',
					'Balanced',
					'Stalwart',
					'Ancient',
					'Masterwork',
				],
				helmet: [
					'Sturdy',
					'Plated',
					'Light',
					'Visored',
					'Ancient',
					'Masterwork',
				],
			},
		},

		WEAPON: {
			baseMass: 5,
			adpBounds: {
				min: [1, 21, 42, 63, 84],
				max: [21, 42, 63, 84, 105],
			},
			ddrBounds: {
				min: [1, 2, 4, 6, 8],
				max: [2, 4, 6, 8, 10],
			},
		},
		ARMOUR: {
			baseMass: 15,
			adpBounds: {
				min: [1, 3, 6, 9, 12],
				max: [3, 6, 9, 12, 15],
			},
			ddrBounds: {
				min: [1, 10, 20, 30, 40],
				max: [10, 20, 30, 40, 50],
			},
		},
		SHIELD: {
			baseMass: 7,
			adpBounds: {
				min: [1, 5, 9, 14, 18],
				max: [5, 9, 14, 18, 23],
			},
			ddrBounds: {
				min: [1, 5, 10, 15, 20],
				max: [5, 10, 15, 20, 25],
			},
		},
		HELMET: {
			baseMass: 3,
			adpBounds: {
				min: [1, 1, 3, 4, 6],
				max: [1, 3, 4, 6, 7],
			},
			ddrBounds: {
				min: [1, 3, 6, 9, 12],
				max: [3, 6, 9, 12, 15],
			},
		},
	},

	// ------------------------------------------------------------------------
	// ECONOMY & TRADE CONSTANTS
	// ------------------------------------------------------------------------
	ECONOMY: {
		// Base values expressed in the abstract 'GoldCoin' standard.
		// These values are multiplied by the regional exchange rate to get the actual price in SilverCoins.
		baseValues: {
			goldCoinBaseCostOfSilver: 5, // 1 Silver trade good = 5 abstract GoldCoins
			goldCoinBaseCostOfGold: 10, // 1 Gold trade good = 10 abstract GoldCoins
			goldCoinBaseCostOfFood: 1, // 1 Food unit = 1 abstract GoldCoin
			goldCoinBaseCostOfHealingPotion: 2, // 1 Healing Potion = 2 abstract GoldCoins
		},

		// Regional exchange rates: Defines how many physical SilverCoins equal 1 abstract GoldCoin.
		// Creates a dynamic trade economy (e.g., Gold is cheap in Untamed, expensive in Capital).
		regionalExchangeRates: {
			untamedMin: 5,
			untamedMax: 10,
			provincesMin: 10,
			provincesMax: 20,
			capitalMin: 20,
			capitalMax: 25,
		},

		tradeMultipliers: {
			tradeSellPct: 0.5, // Player receives 50% of the item's calculated value
			tradeBuyPct: 1.0, // Player pays 100% of the item's calculated value
			tradeRepairPct: 0.5, // Repairing 100% durability costs 50% of the item's calculated value
		},

		// Base costs for NPC services (multiplied by economy level/exchange rate)
		serviceCosts: {
			lodgingMult: 2,
			healMult: 5,
			cureMult: 10,
			stablemasterBaseMult: 0.15, // Fostul Stablemaster_HEC_Base
			blacksmithBaseMult: 0.15, // Fostul Blacksmith_BEC_Base
			roadRestCost: 0,
			arenaEntryFeeBaseMult: 5,
			arenaBetValueMult: 2,
		},
	},

	// ------------------------------------------------------------------------
	// LOGISTICS & ENCUMBRANCE
	// ------------------------------------------------------------------------
	LOGISTICS: {
		massRatios: {
			silverCoins: 100, // 100 physical silver coins = 1 unit of mass (Kg)
			food: 2, // 2 units of food = 1 unit of mass (Kg)
			healingPotion: 4, // 4 healing potions = 1 unit of mass (Kg)
			silverTradeGood: 5, // 5 units of silver trade good = 1 unit of mass (Kg) -> Exemplu adăugat de mine
			goldTradeGood: 5, // 5 units of gold trade good = 1 unit of mass (Kg) -> Exemplu adăugat de mine
		},
		// NEW: Over-capacity penalty mechanics for travel
		encumbrancePenaltyStepPct: 0.25, // For every 25% over maxCapacity...
		encumbrancePenaltyAp: 1, // ...add 1 AP to travel cost
		mountCarryWeight: {
			base: 50,
			bonusPerStr: 5,
		},
	},

	// ------------------------------------------------------------------------
	// TEMPORAL CONSTANTS (CRONOS DOMAIN)
	// ------------------------------------------------------------------------
	TIME: {
		monthsPerYear: 12,
		startMonth: 3,
		yearChangeMonth: 3,

		seasons: {
			spring: {
				startMonth: 3,
				endMonth: 5,
				extraApForTravel: 2,
				foodConsumptionMult: 1.0,
				foodPriceMult: 1.25,
				huntAnimalFoodCapacityMult: 1,
			},
			summer: {
				startMonth: 6,
				endMonth: 8,
				extraApForTravel: 2,
				foodConsumptionMult: 1.25,
				foodPriceMult: 1,
				huntAnimalFoodCapacityMult: 1.25,
			},
			autumn: {
				startMonth: 9,
				endMonth: 11,
				extraApForTravel: 2,
				foodConsumptionMult: 1.25,
				foodPriceMult: 0.75,
				huntAnimalFoodCapacityMult: 1.5,
			},
			winter: {
				startMonth: 12,
				endMonth: 2,
				extraApForTravel: 3,
				foodConsumptionMult: 1.5,
				foodPriceMult: 2.0,
				huntAnimalFoodCapacityMult: 0.75,
			},
		},
	},

	// ------------------------------------------------------------------------
	// SPATIAL & TRANSIT CONSTANTS (PLUTO DOMAIN)
	// ------------------------------------------------------------------------
	SPATIAL: {
		transit: {
			mountAgiMultiplier: 0.01,
			mountMinReductionFactor: 0.75,
			mountMaxReductionFactor: 0.25,
			mountTransitHpPenaltyPerAp: 2,
			caravanTransitHpPenaltyPerAp: 1,
		},
	},

	// ------------------------------------------------------------------------
	// COMBAT & RESOLUTION CONSTANTS (MARS DOMAIN)
	// ------------------------------------------------------------------------
	COMBAT: {
		coreStats: {
			damageScalingFactorClyf: 75, // Base percentage used to scale raw attack damage before mitigation.
			minFinalDamage: 1, // The absolute minimum damage a successful (non-evaded) hit will deal.
			maxAttackDamagePower: 150, // Hard cap for total Attack Damage (AD) achievable by an entity.
			maxDefenseDamageReduction: 90, // Hard cap for total Damage Reduction (DDR) percentage.
			maxPowerScore: 500, // Maximum possible Power Score (PS) an entity can achieve.
		},

		probabilityModifiers: {
			baseEvadeChance: 5, // Base percentage chance to completely evade an attack.
			baseBlockChance: 10, // Base percentage chance to block an attack (requires shield or natural armor).
			baseParryChance: 10, // Base percentage chance to parry an attack (requires weapon).
			baseCritChance: 5, // Base percentage chance to land a critical strike.
			helmetCritReduction: 15, // Flat percentage reduction applied to the attacker's critical chance if the defender wears a helmet.

			evadeDefenderAgiDivisor: 3, // Divisor for defender's Agility when increasing evade chance.
			evadeAttackerAgiDivisor: 5, // Divisor for attacker's Agility when reducing defender's evade chance.
			blockDefenderStrDivisor: 4, // Divisor for defender's Strength when calculating block chance.
			parryDefenderAgiDivisor: 4, // Divisor for defender's Agility when calculating parry chance.
			critAttackerIntDivisor: 4, // Divisor for attacker's Intellect when calculating raw critical chance.
			critAttackerStrDivisor: 5, // Divisor for attacker's Strength when calculating raw critical chance.
			precisionAttackerIntDivisor: 5, // Divisor for attacker's Intellect determining critical conversion precision bonus.
			blockDefenderDdrDivisor: 5, // Divisor for defender's innate DDR to calculate natural block chance (Creatures).
		},

		encumbranceBonuses: {
			noArmourEvade: 10, // Flat bonus to evade chance when the defender has no armour equipped.
			noShieldEvade: 5, // Flat bonus to evade chance when the defender has no shield equipped.
			noHelmetEvade: 5, // Flat bonus to evade chance when the defender has no helmet equipped.
			noShieldParry: 5, // Flat bonus to parry chance when the defender has a weapon but no shield equipped.
		},

		vulnerabilityRates: {
			fullProtection: 0.1, // Percentage of unmitigated hits converted to critical strikes when wearing both armour and a helmet.
			helmetOnly: 0.25, // Percentage of unmitigated hits converted to critical strikes when wearing only a helmet.
			armourOnly: 0.5, // Percentage of unmitigated hits converted to critical strikes when wearing only armour.
			unprotected: 1.0, // Percentage of unmitigated hits converted to critical strikes when completely unarmored.
		},

		multipliers: {
			hitType: {
				evaded: 0.0, // Damage multiplier for an evaded hit (complete negation).
				blocked: 0.4, // Damage multiplier for a blocked hit (absorbs 60%).
				parried: 0.6, // Damage multiplier for a parried hit (deflects 40%).
				clean: 1.0, // Damage multiplier for a standard, unmitigated clean hit.
				critical: 1.5, // Damage multiplier for a critical strike.
			},
		},

		rewardMultipliers: {
			combatTypeFactor: {
				friendly: 0.5, // Modifies post-combat stat/XP rewards for friendly duels.
				normal: 1.0, // Standard post-combat reward scaling.
				deathmatch: 1.5, // Increases post-combat rewards in lethal scenarios.
			},
		},

		itemDegradation: {
			// Flat durability points subtracted per item type based on the specific hit outcome.
			evaded: {
				attackerWeapon: 0,
				defenderArmour: 0,
				defenderShield: 0,
				defenderWeapon: 0,
				defenderHelmet: 0,
			},
			blocked: {
				attackerWeapon: 1,
				defenderArmour: 0,
				defenderShield: 3,
				defenderWeapon: 0,
				defenderHelmet: 0,
			},
			parried: {
				attackerWeapon: 2,
				defenderArmour: 0,
				defenderShield: 0,
				defenderWeapon: 2,
				defenderHelmet: 0,
			},
			clean: {
				attackerWeapon: 1,
				defenderArmour: 2,
				defenderShield: 0,
				defenderWeapon: 0,
				defenderHelmet: 0,
			},
			critical: {
				attackerWeapon: 1,
				defenderArmour: 3,
				defenderShield: 0,
				defenderWeapon: 0,
				defenderHelmet: 4,
			},
		},

		// NEW: Modifiers for active combat actions chosen by entities mid-fight.
		actionModifiers: {
			healHpAmount: 25, // Flat HP restored when utilizing the HEAL action in combat.
			baseFleeChance: 50, // Base percentage chance for a FLEE action to succeed.
			woundDamagePct: 0.2, // Percentage of accumulated combat damage converted to permanent Max HP loss.
		},

		thresholds: {
			playerPostCombatHpLossHigh: 25, // Fixed HP penalty applied to the player upon failing high-risk automated interactions.
			playerPostCombatHpLossLow: 15, // Fixed HP penalty applied to the player upon failing low-risk automated interactions.
			baseHpLethal: 65, // Minimum Player HP required to initiate a Deathmatch (DMF).
			baseHpFriendly: 80, // Minimum Player HP required to initiate a Friendly Fight (FF).
			friendlySurrenderHp: 40, // Absolute HP threshold triggering an automatic surrender in a Friendly Fight.
			friendlySurrenderHpDiff: 40, // HP difference between combatants that triggers an early surrender in a Friendly Fight.
			normalSurrenderHp: 25, // Absolute HP threshold triggering an automatic surrender in a Normal Fight (NF).
			normalSurrenderHpDiff: 50, // HP difference between combatants that triggers an early surrender in a Normal Fight.
			deathmatchFleeHp: 15, // Absolute HP threshold triggering a flee attempt in a Deathmatch.
			deathmatchFleeHpDiff: 60, // HP difference between combatants that triggers a flee attempt in a Deathmatch.
		},
	},

	// ------------------------------------------------------------------------
	// SOCIAL & PROGRESSION CONSTANTS
	// ------------------------------------------------------------------------
	SOCIAL: {
		promotionApCost: 2,
		promotionCoinCosts: [0, 50, 125, 250, 500],
		rankTitles: [
			'None',
			'Page',
			'Squire',
			'Knight',
			'Champion',
			'Grandmaster',
		],
		gatekeepingRenownReq: {
			tier1: 0,
			tier2: 100,
			tier3: 200,
			tier4: 300,
			tier5: 400,
		},
	},

	// ------------------------------------------------------------------------
	// ALIGNMENT & MORALITY CONSTANTS (SAGA DOMAIN)
	// ------------------------------------------------------------------------
	MORALITY: {
		// Thresholds for determining alignment
		alignment: {
			evilMax: -4, // Fostul HON_Evil_Threshold
			neutralMin: -3,
			neutralMax: 3,
			goodMin: 4, // Fostul HON_Good_Threshold
		},

		// Titles based on Honor. Index corresponds to Player Rank (1 to 5). Index 0 is 'None'.
		titles: {
			good: ['None', 'Loyal', 'Trusted', 'Honored', 'Valiant', 'Exalted'],
			evil: [
				'None',
				'Disgraced',
				'Rogue',
				'Oathbreaker',
				'Ruthless',
				'Dread',
			],
		},

		// Penalties and rewards for specific actions
		actions: {
			donateHonBonus: 2,
			donateRenBonus: 5,
			stealFailedHonPenalty: -2,
			stealFailedRenPenalty: -10,
			killFailedHonPenalty: -5,
			killFailedRenPenalty: -25,
		},
	},

	// ------------------------------------------------------------------------
	// ENDGAME & PERMADEATH CONSTANTS (SAGA DOMAIN)
	// ------------------------------------------------------------------------
	PROGRESSION_LOOP: {
		// Starting identity baseline
		startHon: 0,
		startRen: 0,

		// Minimum requirements to trigger a successful retirement
		retirementRequirements: {
			minAge: 50,
			minRank: 5,
			minRen: 450,
			minCoin: 10000,
		},

		// Assets retained when starting a "New Game +" (Legend Loop)
		legendReset: {
			retainedCoin: 1000,
			retainedRen: 100,
		},

		// Multipliers used for calculating final leaderboard score
		scoreMultipliers: {
			coinMult: 1,
			renMult: 10,
			rankMult: 1000,
			ageMult: 100,
			ageBonusMult: 400,
			legendLoopMult: 0.25, // Penalty/Bonus factor for NG+
			deathPenaltyMult: 0.75, // Factor applied if player dies instead of retiring
		},

		deathReasons: {
			combatDisconnect: 'Combat_Disconnect',
			standardDeath: 'Standard_Death',
			starvation: 'Starvation',
		},
	},
};
