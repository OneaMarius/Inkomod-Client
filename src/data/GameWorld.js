// File: src/data/GameWorld.js
// Description: Centralized Global Constants for Iron Nature: Knight of Medieval Old Days

export const WORLD = {
	// ------------------------------------------------------------------------
	// PLAYER ENTITY CONSTANTS
	// ------------------------------------------------------------------------
	PLAYER: {
		baseAp: 8,
		defaultInteractionApCost: 0,
		maxAp: 8,
		maxOverchargeAp: 16,
		baseCapacity: 25, // Base carrying capacity in mass units (Kg)
		capacityPerStr: 2,
		hpLimits: { starting: 100, hardCap: 100, minCap: 50, starvingHpCap: 15 },
		baseFoodNeed: 2,
		// --- NOU: SETĂRI PENTRU RECOMPENSELE DE LABOR ---
		laborRewards: {
			actionsRequired: 5, // Câte acțiuni de labor sunt necesare pentru a primi bonusul
			statBonusAmount: 1, // Câte puncte de atribut primește
			fallbackHonor: 5, // Câtă onoare primește dacă toate atributele sunt la maxim (Capped)
			fallbackRenown: 10, // Cât renume primește dacă toate atributele sunt la maxim (Capped)
		},

		// --- UPDATED: Proportional Survival & Starvation Logistics ---
		healingRates: {
			standard: 25, // Flat HP recovered monthly if fully fed
			starvingDamagePct: 0.25, // 25% of Current HP lost per 100% food deficit
			deathThresholdHp: 25, // Player dies if starvation drops HP to or below this
		},

		trainingCaps: { str: [15, 25, 35, 45, 50], agi: [15, 25, 35, 45, 50], int: [15, 25, 35, 45, 50] },
		inventoryLimits: {
			totalSlots: 300,
			equippedMountSlots: 1,
			equippedItemSlots: 4,
			maxHealingPotions: 25,
			animalSlots: 50,
			itemSlots: 150, // Equippable gear (Weapons, Armor, Shields, Helmets)
			lootSlots: 50, // Non-equippable trade goods (Monster Parts, Trophies, etc.)
			trophySlots: 20, // Special category for Nephilim trophies
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
				eipPerAgi: 1,
				eipPerStr: 2,
				hpBase: 50,
				hpTierMultiplier: 10,
				hardCap: 100,
				adpBounds: { min: [5, 15, 25, 35, 45], max: [15, 25, 35, 45, 55] },
				ddrBounds: { min: [5, 15, 20, 25, 30], max: [15, 25, 35, 45, 50] },
			},
			foodYieldMultipliers: {
				slaughter: 1.0,
				death: 0.5, // Used during standard/combat death
			},
			massToFoodYieldPct: 0.05, // 5% of Mass becomes Food

			// --- UPDATED: Proportional Survival & Starvation Logistics ---
			healingRates: {
				natural: 5, // Flat HP recovered monthly if fully fed
				starvingDamagePct: 0.5, // 50% of Current HP lost per 100% food deficit
				deathThresholdHp: 25, // Animal dies and yields 0 food if HP drops to or below this
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
			// Economic Index Points (used for generating base price)
			eipPerAdp: 1,
			eipPerDdr: 2,
			generationContexts: {
				trade: { conditionBase: 100, conditionFlux: 0 },
				npc: { minCondition: 25, conditionPerRank: 10 },
				loot: { maxCondition: 75, penaltyPerTier: 10 },
			},
		},

		WEAPON: { baseMass: 5, adpBounds: { min: [1, 21, 42, 63, 84], max: [21, 42, 63, 84, 105] }, ddrBounds: { min: [1, 2, 4, 6, 8], max: [2, 4, 6, 8, 10] } },
		ARMOR: { baseMass: 15, adpBounds: { min: [1, 3, 6, 9, 12], max: [3, 6, 9, 12, 15] }, ddrBounds: { min: [1, 10, 20, 30, 40], max: [10, 20, 30, 40, 50] } },
		SHIELD: { baseMass: 7, adpBounds: { min: [1, 5, 9, 14, 18], max: [5, 9, 14, 18, 23] }, ddrBounds: { min: [1, 5, 10, 15, 20], max: [5, 10, 15, 20, 25] } },
		HELMET: { baseMass: 3, adpBounds: { min: [1, 1, 3, 4, 6], max: [1, 3, 4, 6, 7] }, ddrBounds: { min: [1, 3, 6, 9, 12], max: [3, 6, 9, 12, 15] } },
	},

	// ------------------------------------------------------------------------
	// ECONOMY & TRADE CONSTANTS
	// ------------------------------------------------------------------------
	ECONOMY: {
		// Base values expressed in the abstract 'GoldCoin' standard.
		// These values are multiplied by the regional exchange rate to get the actual price in SilverCoins.
		baseValues: {
			coinRegionalBaseCost: 1, // Required for EquipmentCreation formula
			goldCoinBaseCostOfSilver: 5,
			goldCoinBaseCostOfGold: 10,
			goldCoinBaseCostOfFood: 1,
			goldCoinBaseCostOfHealingPotion: 2,
		},

		shopGeneration: {
			Weapon: { min: 2, max: 4 },
			Armor: { min: 2, max: 4 },
			Shield: { min: 2, max: 4 },
			Helmet: { min: 2, max: 4 },
			Mount: { min: 2, max: 4 },
			Animal: { min: 4, max: 8 },
			Food: { min: 20, max: 100 }, // Numeric quantities
			Potion: { min: 5, max: 20 },
			TradeSilver: { min: 5, max: 20 }, // Silver ingots generation
			TradeGold: { min: 1, max: 5 }, // Gold ingots generation
		},

		// File: src/data/GameWorld.js

		shopSuffixes: {
			Trade_Weapon: ['Armory', 'Arsenal', 'Weaponsmith', 'Bladeworks', 'Ironworks'],
			Trade_Armor: ['Armorsmith', 'Mailworks', 'Plateworks', 'Outfitter', 'Market'],
			Trade_Shield: ['Shieldsmith', 'Wardcrafter', 'Bucklerworks', 'Market'],
			Trade_Helmet: ['Bazaar', 'Helmsmith', 'Crestworks', 'Armory', 'Ironworks'],
			Trade_Mount: ['Stables', 'Paddock', 'Steedyard', 'Riding-House'],
			Trade_Animal: ['Livestock', 'Stockyard', 'Breeders', 'Bazaar'],
			Trade_Food: ['Provisions', 'Bazaar', 'Market', 'Pantry', 'Rations'],
			Trade_Potion: ['Apothecary', 'Dispensary', 'Elixirs', 'Remedies', 'Concoctions'],
			Trade_Coin: ['Exchange', 'Vault', 'Treasury', 'Coinery'],
			Trade_Loot: ['Curiosities', 'Oddities', 'Reliquary', 'Antiquities', 'Spoils'],
			Repair_Equipment: ['Workshop', 'Smithy', 'Anvil', 'Grindstone', 'Forge'],
			default: ['Market', 'Tradepost', 'Emporium', 'Bazaar', 'Exchange'],
		},

		// Regional exchange rates: Defines how many physical SilverCoins equal 1 abstract GoldCoin.
		// Creates a dynamic trade economy (e.g., Gold is cheap in Untamed, expensive in Capital).
		fluctuationIntervalMonths: 3, // Rate changes every x month
		rateFluctuationLimits: { minDrop: -5, maxRise: 5 },
		regionalExchangeRates: {
			provincesMin: 10,
			provincesMax: 20,
			capitalMin: 20,
			capitalMax: 30,
			orbitMin: 15,
			orbitMax: 25,
			wildMin: 5,
			wildMax: 15,
			edgeMin: 1,
			edgeMax: 5,
		},

		tradeMultipliers: {
			baseTradeSellPct: 0.5, // Base 50%
			baseTradeBuyPct: 1.0, // Base 100%
			baseTradeRepairPct: 0.5, // Base 50%
			tradeHonorFactor: 0.002, // 0.2% modifier per Honor point
			// --- NOU: Multiplicator specific pentru lingouri (Bancă) ---
			ingotTradeSellPct: 0.75, // Jucătorul primește înapoi 75% din valoarea lingourilor când le vinde băncii
		},

		// Base costs for NPC services (multiplied by economy level/exchange rate)
		serviceCosts: {
			lodgingMult: 2,
			healMult: 5,
			cureMult: 10,
			stablemasterBaseMult: 0.15, // Formerly Stablemaster_HEC_Base
			blacksmithBaseMult: 0.15, // Formerly Blacksmith_BEC_Base
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
			silverTradeGood: 5, // 5 units of silver trade good = 1 unit of mass (Kg)
			goldTradeGood: 5, // 5 units of gold trade good = 1 unit of mass (Kg)
		},
		// Over-capacity penalty mechanics for travel
		encumbrancePenaltyStepPct: 0.25, // For every 25% over maxCapacity...
		encumbrancePenaltyAp: 1, // ...add 1 AP to travel cost
		mountCarryWeight: { base: 50, bonusPerStr: 1 },
	},

	// ------------------------------------------------------------------------
	// TEMPORAL CONSTANTS (CRONOS DOMAIN)
	// ------------------------------------------------------------------------
	TIME: {
		monthsPerYear: 12,
		startMonth: 3,
		yearChangeMonth: 3,
		startTurn: 0,

		seasons: {
			spring: { startMonth: 3, endMonth: 5, extraApForTravel: 1, foodConsumptionMult: 1.0, foodPriceMult: 1.25, huntAnimalFoodCapacityMult: 1 },
			summer: { startMonth: 6, endMonth: 8, extraApForTravel: 2, foodConsumptionMult: 1.0, foodPriceMult: 1.0, huntAnimalFoodCapacityMult: 1.25 },
			autumn: { startMonth: 9, endMonth: 11, extraApForTravel: 3, foodConsumptionMult: 1.0, foodPriceMult: 0.75, huntAnimalFoodCapacityMult: 1.5 },
			winter: { startMonth: 12, endMonth: 2, extraApForTravel: 4, foodConsumptionMult: 1.5, foodPriceMult: 1.75, huntAnimalFoodCapacityMult: 0.75 },
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

		actionCosts: { exploreUntamedAp: 1, enterCivilizedPoiAp: 1, enterUntamedPoiApDefault: 1, huntUntamedAp: 1 },
		exploreChances: { event: 25, poi: 65, nothing: 10 },
		huntChances: { positiveHunt: 60, negativeHunt: 15, generalEvent: 15, nothing: 10 },
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
			noArmorEvade: 10, // Flat bonus to evade chance when the defender has no armor equipped.
			noShieldEvade: 5, // Flat bonus to evade chance when the defender has no shield equipped.
			noHelmetEvade: 5, // Flat bonus to evade chance when the defender has no helmet equipped.
			noShieldParry: 5, // Flat bonus to parry chance when the defender has a weapon but no shield equipped.
		},

		vulnerabilityRates: {
			fullProtection: 0.1, // Percentage of unmitigated hits converted to critical strikes when wearing both armor and a helmet.
			helmetOnly: 0.25, // Percentage of unmitigated hits converted to critical strikes when wearing only a helmet.
			armorOnly: 0.5, // Percentage of unmitigated hits converted to critical strikes when wearing only armor.
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

		combatDropConfig: {
			// Șansele relative pentru ce tip de inventar e afectat (când se activează tableLootPenaltyPct)
			itemLootDropChance: 0.5, // 50% șansă să fie un item fizic (arme, armuri)
			othersDropChance: 0.5, // 50% șansă să fie o resursă numerică

			// Setări pentru pierderile numerice
			othersDropPercent: 0.25, // Pierzi 25% din stivă
			othersEligibleKeys: ['food', 'healingPotions', 'tradeSilver', 'tradeGold', 'silverCoins'],

			// Sloturile de echipament care pot fi pierdute/salvate la verificare
			equippedDropKeysNpc: ['weapon', 'shield', 'armor', 'helmet', 'mount'],
			equippedDropKeysPlayer: ['weapon', 'shield', 'helmet'],
		},

		itemDegradation: {
			// Flat durability points subtracted per item type based on the specific hit outcome.
			evaded: { attackerWeapon: 0, defenderArmor: 0, defenderShield: 0, defenderWeapon: 0, defenderHelmet: 0 },
			blocked: { attackerWeapon: 1, defenderArmor: 0, defenderShield: 3, defenderWeapon: 0, defenderHelmet: 0 },
			parried: { attackerWeapon: 2, defenderArmor: 0, defenderShield: 0, defenderWeapon: 2, defenderHelmet: 0 },
			clean: { attackerWeapon: 1, defenderArmor: 2, defenderShield: 0, defenderWeapon: 0, defenderHelmet: 0 },
			critical: { attackerWeapon: 1, defenderArmor: 3, defenderShield: 0, defenderWeapon: 0, defenderHelmet: 4 },
		},

		// Modifiers for active combat actions chosen by entities mid-fight.
		actionModifiers: {
			healHpAmount: 25, // Flat HP restored when utilizing the HEAL action in combat.
			baseFleeChance: 50, // Base percentage chance for a FLEE action to succeed.
			woundDamagePct: 0.2, // Percentage of accumulated combat damage converted to permanent Max HP loss.
		},

		stanceModifiers: {
			aggressiveCritMultiplier: 1.25,
			aggressiveMitigationMultiplier: 0.75,
			defensiveCritMultiplier: 0.75,
			defensiveMitigationMultiplier: 1.25,
			// --- NOU: Shift de acuratețe (Hit Chance vs Enemy Defense) ---
			aggressiveAccuracyShift: 10, // Îți dă +10% Hit Chance (scade 10% din apărarea inamicului)
			defensiveAccuracyShift: -10, // Îți dă -10% Hit Chance (crește 10% apărarea inamicului)
		},

		thresholds: {
			baseHpDMF: 50, // Minimum Player HP required to initiate a Deathmatch (DMF).
			baseHpNF: 75, // Maximum Player HP allowed to initiate a Normal Fight (NF).
			baseHpFF: 100, // Minimum Player HP required to initiate a Friendly Fight (FF).
			friendlySurrenderHp: 50, // Absolute HP threshold triggering an automatic surrender in a Friendly Fight.
			friendlySurrenderHpDiff: 25, // HP difference between combatants that triggers an early surrender in a Friendly Fight.
			normalSurrenderHp: 25, // Absolute HP threshold triggering an automatic surrender in a Normal Fight (NF).
			normalSurrenderHpDiff: 50, // HP difference between combatants that triggers an early surrender in a Normal Fight.
		},
	},

	// ------------------------------------------------------------------------
	// SOCIAL & PROGRESSION CONSTANTS
	// ------------------------------------------------------------------------
	SOCIAL: {
		rankTitles: ['None', 'Page', 'Squire', 'Knight', 'Champion', 'Grandmaster'],
		gatekeepingRenownReq: { tier1: 0, tier2: 100, tier3: 200, tier4: 300, tier5: 400 },
		renownBonus: { endMonthRenown: 1, laborActionRenown: 1 },
		honorBonus: { laborActionHonor: 1 },
	},

	// ------------------------------------------------------------------------
	// ALIGNMENT & MORALITY CONSTANTS (SAGA DOMAIN)
	// ------------------------------------------------------------------------
	MORALITY: {
		// Thresholds for determining alignment
		alignment: {
			evilMax: -50, // Formerly HON_Evil_Threshold
			neutralMin: -49,
			neutralMax: 49,
			goodMin: 50, // Formerly HON_Good_Threshold
		},

		// Titles based on Honor. Index corresponds to Player Rank (1 to 5). Index 0 is 'None'.
		titles: { good: ['None', 'Loyal', 'Trusted', 'Honored', 'Valiant', 'Exalted'], evil: ['None', 'Disgraced', 'Rogue', 'Oathbreaker', 'Ruthless', 'Dread'] },

		// Penalties and rewards for specific actions
		actions: {
			// --- NOU: SETĂRI PENTRU DONAȚII ---
			donatePrayAp: 2,
			donatePrayHonBonus: 4, // fiecare 2 puncte de AP investite în rugăciuni oferă 4 puncte de onoare
			donatePrayRenBonus: 2, // fiecare 2 puncte de AP investite în rugăciuni oferă 2 puncte de renume

			donateCoinAp: 1,
			donateCoinHonDivisor: 50, // Fiecare 50 de monede donate oferă 1 punct de onoare
			donateCoinRenDivisor: 100, // Fiecare 100 de monede donate oferă 1 punct de renume

			donateFoodAp: 1,
			donateFoodHonDivisor: 5, // Fiecare 5 unități de hrană donate oferă 1 punct de onoare
			donateFoodRenDivisor: 10, // Fiecare 10 unități de hrană donate oferă 1 punct de renume

			// --- Penalizări pentru acțiuni de steal animal EȘUATE (Prins în fapt) ---
			stealAnimalFailedHonPenalty: -5,
			stealAnimalFailedRenPenalty: -10,

			// --- NOU: SETĂRI PENTRU MITĂ (BRIBERY) ---
            bribeCoinHonDivisor: 100, 
            bribeCoinRenDivisor: 50, 

			// --- NOU: CONSECINȚE PENTRU INTERACȚIUNI ILEGALE (STEALTH & CRIME) ---
			// Structurate exact după actionTag-ul din DB_Interaction_Actions
            Target_Bribe: {
                // Penalizări statice în caz că ești refuzat/prins (NPC-ul îți ia banii și te ignoră)
                failure: { honorChange: -10, renownChange: -5, label: 'Rejected Bribery' },
            },

			Target_Steal_Coin: {
				success: { honorChange: -1, renownChange: -1, label: 'Unnoticed Pickpocket' },
				failure: { honorChange: -10, renownChange: -5, label: 'Caught Pickpocketing' },
			},

			Target_Steal_Food: {
				success: { honorChange: -1, renownChange: -1, label: 'Pilfered Rations' },
				failure: { honorChange: -5, renownChange: -2, label: 'Caught Stealing Food' },
			},

			Target_Robbery: {
				// Robbery (Mugging) e mai agresiv decât furtul. Renumele poate crește puțin (notorietate) sau scade.
				success: { honorChange: -5, renownChange: -2, label: 'Successful Mugging' },
				failure: { honorChange: -15, renownChange: -10, label: 'Botched Robbery' },
			},

			// --- NOU: CONSECINȚE PENTRU ASSASSINAT (FĂRĂ ) ---
			Target_Assassination: {
				success: { honorChange: -5, renownChange: 5, label: 'Silent Execution' },
				failure: { honorChange: -15, renownChange: -15, label: 'Botched Assassination' },
			},

			// --- NOU: CONSECINȚE PENTRU AMBUSCADĂ ---
			Target_Ambush: {
				success: { honorChange: -2, renownChange: 2, label: 'Dishonorable Advantage' },
				failure: { honorChange: -5, renownChange: -5, label: 'Botched Ambush' },
			},

			Ambush_Animal: {
				success: { honorChange: 0, renownChange: 1, label: 'Cunning Hunter' },
				failure: { honorChange: 0, renownChange: -1, label: 'Spooked Prey' },
			},
			Ambush_Monster: {
				success: { honorChange: 1, renownChange: 3, label: 'Fearless Striker' },
				failure: { honorChange: 0, renownChange: -1, label: 'Failed Ambush' },
			},
			Ambush_Nephilim: {
				success: { honorChange: 2, renownChange: 5, label: 'Legendary Ambush' },
				failure: { honorChange: 0, renownChange: -1, label: 'Foolish Attempt' },
			},

			// --- NOU: COSTUL PENTRU EVADARE (FLEE FĂRĂ LUPTĂ DUPĂ EȘEC) ---
			globalFleeFromCrime: { honorChange: -5, renownChange: -5, label: 'Fled from Justice' },

			// --- RETRAGERE PRE-COMBAT (Event Retreats) ---
			Combat_Engage_Retreat: { honorChange: -4, renownChange: -4, label: 'Reconsidered Action' },
			Combat_Duel_Retreat: { honorChange: -3, renownChange: -3, label: 'Cowardly Withdrawal' },
			Combat_Training_Retreat: { honorChange: -1, renownChange: -1, label: 'Declined Training' },
			Combat_Brawl_Retreat: { honorChange: -2, renownChange: -2, label: 'Backed Down' },
		},

		combatConsequences: {
			Human: {
				Outlaw: {
					lethal: { renownChange: 5, honorChange: 5, label: 'Bounty Hunt' },
					nonLethal: { renownChange: 2, honorChange: 2, label: 'Subdued Outlaw' },
				},
				Military: {
					lethal: { renownChange: 5, honorChange: -5, label: 'Murdered Military' },
					nonLethal: { renownChange: 1, honorChange: -1, label: 'Brawled Military' },
				},
				High_Society: {
					lethal: { renownChange: -20, honorChange: -10, label: 'Assassinated Noble' },
					nonLethal: { renownChange: -10, honorChange: -5, label: 'Assaulted Noble' },
				},
				Low_Society: {
					lethal: { renownChange: -5, honorChange: -10, label: 'Murdered Citizen' },
					nonLethal: { renownChange: -2, honorChange: -5, label: 'Assaulted Citizen' },
				},
				Trade: {
					lethal: { renownChange: -25, honorChange: -15, label: 'Murdered Merchant' },
					nonLethal: { renownChange: -10, honorChange: -10, label: 'Assaulted Merchant' },
				},
				Administration: {
					lethal: { renownChange: -15, honorChange: -10, label: 'Murdered Official' },
					nonLethal: { renownChange: -10, honorChange: -5, label: 'Assaulted Official' },
				},
				DEFAULT_CIVILIAN: {
					lethal: { renownChange: -10, honorChange: -10, label: 'Unprovoked Murder' },
					nonLethal: { renownChange: -5, honorChange: -5, label: 'Unprovoked Assault' },
				},
			},
			Animal: {
				WildHostile: {
					lethal: { renownChange: 1, honorChange: 1, label: 'Killed Predator' },
					nonLethal: { renownChange: 1, honorChange: 1, label: 'Fought Predator' },
				},
				WildFriendly: {
					lethal: { renownChange: -2, honorChange: -4, label: 'Poached Wildlife' },
					nonLethal: { renownChange: -1, honorChange: -2, label: 'Attacked Wildlife' },
				},
				Domestic: {
					lethal: { renownChange: -5, honorChange: -10, label: 'Slaughtered Livestock' },
					nonLethal: { renownChange: -2, honorChange: -5, label: 'Attacked Livestock' },
				},
				Mount: {
					lethal: { renownChange: -5, honorChange: -10, label: 'Slaughtered Mount' },
					nonLethal: { renownChange: -2, honorChange: -5, label: 'Attacked Mount' },
				},
			},
			Monster: {
				DEFAULT: {
					lethal: { renownChange: 2, honorChange: 2, label: 'Slew Monster' },
					nonLethal: { renownChange: 1, honorChange: 1, label: 'Fought Monster' },
				},
			},
			Nephilim: {
				DEFAULT: {
					lethal: { renownChange: 3, honorChange: 3, label: 'Vanquished Nephilim' },
					nonLethal: { renownChange: 1, honorChange: 1, label: 'Challenged Nephilim' },
				},
			},
		},
	},

	// ------------------------------------------------------------------------
	// ENDGAME & PERMADEATH CONSTANTS (SAGA DOMAIN)
	// ------------------------------------------------------------------------
	PROGRESSION_LOOP: {
		startHon: 0,
		startRen: 0,

		scoreMultipliers: { coinMult: 1, renMult: 10, rankMult: 1000, turnMult: 20, honMult: 25, trophyMult: 5000 },

		deathMultipliers: { starvation: 0.5, combat: 0.75, natural: 1.0 },

		victoryMultipliers: {
			standard_champion: 2.0,
			godslayer_increment: 0.2, // Additive multiplier for each trophy above 7
		},

		deathReasons: { COMBAT: 'Slain in Combat', STARVATION: 'Starvation', AGE: 'Old Age' },

		victoryReasons: { CHAMPION: 'Champion of the Realm', GODSLAYER: 'Godslayer' },
	},

	// ========================================================================
	// INTERACTION & SKILL CHECKS
	// ========================================================================
	INTERACTION: {
		stealthYields: {
			coinMinPct: 0.25,
			coinMaxPct: 0.75,
			foodMinPct: 0.4,
			foodMaxPct: 0.6,
			robberyMinPct: 0.4,
			robberyMaxPct: 0.8,
			ambushHpReductionPct: 0.25,
		},
		skillChecks: {
			Target_Assassination: {
				baseChance: 20,
				minChance: 5,
				maxChance: 95,
				rankPenalty: 10, // Applied per rank level the target is above the player
			},
			// --- NEW: Ambush Stealth Check & Damage Reward ---
			Target_Ambush: { baseChance: 40, minChance: 5, maxChance: 95, rankPenalty: 8 },
			Ambush_Animal: { baseChance: 50, minChance: 5, maxChance: 95, rankPenalty: 8 },
			Ambush_Monster: { baseChance: 40, minChance: 5, maxChance: 95, rankPenalty: 10 },
			Ambush_Nephilim: {
				baseChance: 30, // Foarte greu de luat prin surprindere
				minChance: 5,
				maxChance: 95,
				rankPenalty: 15,
			},
			Target_Robbery: { baseChance: 40, minChance: 5, maxChance: 95, rankPenalty: 10 },
			Target_Steal_Coin: { baseChance: 50, minChance: 5, maxChance: 95, rankPenalty: 5 },
			Target_Steal_Food: { baseChance: 60, minChance: 5, maxChance: 95, rankPenalty: 5 },
			Target_Steal_Animal: { baseChance: 50, minChance: 5, maxChance: 95, rankPenalty: 5 },
			Hunt_Animal: { baseChance: 60, minChance: 5, maxChance: 95, rankPenalty: 5 },
			Evade_Animal: { baseChance: 70, minChance: 5, maxChance: 95, rankPenalty: 5 },
			Evade_Monster: { baseChance: 50, minChance: 5, maxChance: 95, rankPenalty: 10 },
			Evade_Nephilim: { baseChance: 30, minChance: 5, maxChance: 95, rankPenalty: 10 },
		},
	},

	// ========================================================================
	// EVENT GENERATION PARAMETERS
	// ========================================================================
	EVENTS: {
		triggerChances: {
			zoneCategory: { CIVILIZED: 40, UNTAMED: 30 },
			zoneClass: { DOMIKON: -5, IRONVOW: 5, NORHELM: 5, KRYPTON: 5, MYTHOSS: 5, OLDGROW: 5, DOOMARK: 5, ORBIT: 10, WILD: 20, EDGE: 30, DEFAULT: 0 },
			zoneSubclass: { Village: 5, Town: 0, City: -5, Castle: -10, Palace: -15, Orbit: 10, Wild: 20, Edge: 30, DEFAULT: 0 },
			seasonMultiplier: { spring: 1, summer: 0.75, autumn: 1, winter: 0.5 },
			zoneEconomyLevel: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
		},

		// Defines the base probability (0-100) that a triggered event will be NEGATIVE.
		// The remaining percentage (100 - dangerLevel) determines the chance for POSITIVE/NEUTRAL events.
		dangerLevels: {
			zoneCategory: { CIVILIZED: 35, UNTAMED: 25 },
			zoneClass: { DOMIKON: -10, IRONVOW: 5, NORHELM: 5, KRYPTON: 5, MYTHOSS: 5, OLDGROW: 5, DOOMARK: 5, ORBIT: 20, WILD: 25, EDGE: 30, DEFAULT: 0 },
			zoneSubclass: { Village: 5, Town: 0, City: -5, Castle: -10, Palace: -15, Orbit: 5, Wild: 15, Edge: 25, DEFAULT: 0 },
			// Capped at 1.0 to ensure the final summation rarely exceeds 100%
			seasonMultiplier: { spring: 0.55, summer: 0.7, autumn: 0.85, winter: 1.0 },
			zoneEconomyLevel: { 1: -10, 2: -5, 3: 0, 4: 5, 5: 10 },
		},

		// Master Taxonomy for the Event System
		taxonomy: {
			engines: ['SEE', 'DEE'],
			eventTypes: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
			typologies: [
				'CombatEncounter', // Hostile NPC generation and combat checks
				'SocialEncounter', // Neutral/Friendly NPC generation, trade-offs, dialogue
				'Discovery', // Finding items, silver, food, animals, or locations
				'Hazard', // Weather anomalies, environmental damage, durability loss
				'General', // Fallback or miscellaneous narrative occurrences
			],
			// Defining valid keys for the 'conditions' object in DB_Events
			filteringConditions: [
				'weight', // Mandatory Integer
				'minRank', // Optional Integer (Defaults to 1)
				'allowedSeasons', // Optional Array of Strings
				'allowedZoneClasses', // Optional Array of Strings
				'allowedZoneCategories', // Optional Array of Strings
				'allowedZoneSubclasses', // Optional Array of Strings
				'allowedZones', // Optional Array of Strings (Strict Node ID check)
			],
		},
	},

	// Add this inside the exported WORLD object
	DYNAMIC_REWARDS: {
		apMod: { tiers: { MINOR: { base: 1 }, MODERATE: { base: 2 }, MAJOR: { base: 3 } }, variance: { value: 0, type: 'flat' } },
		hpMod: { tiers: { MINOR: { base: 8 }, MODERATE: { base: 16 }, MAJOR: { base: 24 } }, variance: { value: 4, type: 'flat' } },
		str: { tiers: { MINOR: { base: 1 }, MODERATE: { base: 2 }, MAJOR: { base: 3 } }, variance: { value: 0, type: 'flat' } },
		agi: { tiers: { MINOR: { base: 1 }, MODERATE: { base: 2 }, MAJOR: { base: 3 } }, variance: { value: 0, type: 'flat' } },
		int: { tiers: { MINOR: { base: 1 }, MODERATE: { base: 2 }, MAJOR: { base: 3 } }, variance: { value: 0, type: 'flat' } },
		silverCoins: { tiers: { MINOR: { base: 50 }, MODERATE: { base: 100 }, MAJOR: { base: 200 } }, variance: { value: 0.5, type: 'percentage' } },
		tradeSilver: { tiers: { MINOR: { base: 1 }, MODERATE: { base: 2 }, MAJOR: { base: 3 } }, variance: { value: 0, type: 'flat' } },
		tradeGold: { tiers: { MINOR: { base: 1 }, MODERATE: { base: 2 }, MAJOR: { base: 3 } }, variance: { value: 0, type: 'flat' } },
		food: { tiers: { MINOR: { base: 3 }, MODERATE: { base: 6 }, MAJOR: { base: 9 } }, variance: { value: 1, type: 'flat' } },
		healingPotions: { tiers: { MINOR: { base: 1 }, MODERATE: { base: 3 }, MAJOR: { base: 5 } }, variance: { value: 0, type: 'flat' } },
		honor: { tiers: { MINOR: { base: 3 }, MODERATE: { base: 8 }, MAJOR: { base: 13 } }, variance: { value: 2, type: 'flat' } },
		renown: { tiers: { MINOR: { base: 3 }, MODERATE: { base: 6 }, MAJOR: { base: 9 } }, variance: { value: 1, type: 'flat' } },
	},
};
