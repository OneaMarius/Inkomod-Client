// File: Client/src/data/TEMPLATE_Event.js
// Description: Master taxonomy, schema definition, and templates for Narrative Events.
// Serves as the strict reference for automated or manual event generation.

// ============================================================================
// 0. GAME DESIGN & BALANCING CONTEXT (FOR AUTOMATED GENERATION)
// ============================================================================
/*
    When generating new events, strictly adhere to the following balancing rules.
    Values are categorized into Minor, Moderate, and Major thresholds.

    1. VITALS & ACTION POINTS (Numeric):
       - Action Points (apMod): Player limit is 0 to 8. 
         * Minor: 1 / Moderate: 2 / Major: 3
       - Health (hpMod): Player limit is 1 to 100. (Events cannot reduce HP below 1).
         * Minor: 15 / Moderate: 30 / Major: 45
         * Apply a variance of +/- 5 to the base HP modifier.

    2. CORE ATTRIBUTES (str, agi, int):
       - Limits: 1 to 50. Charisma (cha) is excluded from dynamic event modification.
       - Permanent stat modifications:
         * Minor: 1 / Moderate: 2 / Major: 3

    3. ECONOMY & LOGISTICS (Numeric):
       - silverCoins:
         * Minor: 25 / Moderate: 100 / Major: 200 (Apply a variance of +/- 25%).
       - tradeSilver & tradeGold:
         * Minor: 1 / Moderate: 2 / Major: 3 (No variance. Gold drop rates should be extremely low).
       - food:
         * Minor: 2 / Moderate: 5 / Major: 8 (Apply a variance of +/- 1).
       - healingPotions:
         * Minor: 1 / Moderate: 3 / Major: 5 (Apply a variance of +/- 1).

    4. MORALITY & REPUTATION (Numeric):
       - honor: Strict limit -100 to 100.
       - renown: Strict limit 0 to 500.
       - Modification thresholds for both:
         * Minor: 5 / Moderate: 10 / Major: 15 (Apply a variance of +/- 2).

    5. PHYSICAL REWARDS (procGen Objects):
       - Physical items (Weapons, Armour, Mounts, Animals, Loot) must be generated via the procGen payload.
       - Using the 'count' parameter:
         * The 'count' key (e.g., count: 3) loops the generator to drop multiple unique entities.
         * If 'count: 3' is used WITHOUT a specific 'subclassKey', it drops 3 random entities of that class.
         * If 'count: 3' is used WITH a specific 'subclassKey' (e.g., 'Aurochs'), it drops 3 unique Aurochs entities.
       - Rank/Tier: Dynamically scales based on Player Rank +/- the 'rankModifier' or 'tierModifier'.

    6. CHOICE TYPES (DEE):
       - TRADE_OFF: Consumes resources to proceed.
       - SKILL_CHECK: Rolls against player attributes (str, agi, int, hon, ren).
       - LUCK_CHECK: Pure RNG percentage roll.
       - COMBAT: Transitions to the Combat Engine.
       - GENERAL: Automatic narrative execution without costs or RNG checks.
*/

// ============================================================================
// 1. EVENT TAXONOMY DICTIONARY
// ============================================================================
export const EVENT_TAXONOMY = {
	engines: ['SEE', 'DEE'],
	triggers: ['travel', 'explore', 'endturn'],
	typologies: ['CombatEncounter', 'SocialEncounter', 'Discovery', 'Hazard', 'General'],
	eventTypes: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
	seasons: ['spring', 'summer', 'autumn', 'winter'],

	zoneCategories: ['CIVILIZED', 'UNTAMED'],
	zoneClasses: ['DOMIKON', 'IRONVOW', 'NORHELM', 'KRYPTON', 'MYTHOSS', 'OLDGROW', 'DOOMARK', 'ORBIT', 'WILD', 'EDGE'],
	zoneSubclasses: ['Village', 'Town', 'City', 'Castle', 'Palace', 'Orbit', 'Wild', 'Edge'],

	skillAttributes: ['str', 'agi', 'int', 'hon', 'ren'],
	difficultyModifiers: [-2, -1, 0, 1, 2],
	combatRules: ['DMF', 'NF', 'FF'],

	numericPayloadKeys: ['silverCoins', 'tradeSilver', 'tradeGold', 'food', 'healingPotions', 'hpMod', 'apMod', 'honor', 'renown', 'str', 'agi', 'int'],

	checkTypes: ['TRADE_OFF', 'SKILL_CHECK', 'LUCK_CHECK', 'COMBAT', 'GENERAL'],

	procGenCategories: ['Physical', 'Animal', 'Loot'],
	procGenPhysicalClasses: ['Weapon', 'Armour', 'Shield', 'Helmet'],
	procGenAnimalClasses: ['Domestic', 'Mount'],
};

// ============================================================================
// 2. MASTER JSON SCHEMA
// ============================================================================
/*
{
    "id": "String",
    "name": "String",
    "description": "String",
    "typology": "String (From EVENT_TAXONOMY.typologies)",
    "eventType": "String (From EVENT_TAXONOMY.eventTypes)",
    
    "conditions": {
        "weight": "Int",
        "minRank": "Optional Int (1-5)",
        "allowedSeasons": "Optional Array of Strings",
        "allowedZoneClasses": "Optional Array of Strings",
        "allowedZoneCategories": "Optional Array of Strings",
        "allowedZoneSubclasses": "Optional Array of Strings",
        "allowedZones": "Optional Array of Strings"
    },

    "staticEffects": {
        // Numeric Keys from EVENT_TAXONOMY.numericPayloadKeys
    } | null,
    
    "onEncounter": {
        "procGen": {
            "entityCategory": "String ('Human' | 'Animal' | 'Monster' | 'Nephilim')",
            "subclassKey": "String",
            "rankModifier": "Int (-1 to 1)"
        }
    } | null,

    "choices": [
        {
            "id": "String",
            "label": "String",
            "checkType": "String (From EVENT_TAXONOMY.checkTypes)",
            
            "cost": { "silverCoins": Int, "food": Int, "tradeSilver": Int, "tradeGold": Int, "healingPotions": Int },
            
            "attribute": "String (From EVENT_TAXONOMY.skillAttributes)",
            "difficultyModifier": "Int",
            
            "successChance": "Int (1-100)",
            
            "combatRule": "String (From EVENT_TAXONOMY.combatRules)",

            "onSuccess": {
                "description": "String",
                // Numeric Keys from EVENT_TAXONOMY.numericPayloadKeys
                "procGen": {
                    "items": [
                        // Equipment Generation
                        { "category": "Physical", "itemClass": "Weapon", "tierModifier": 0, "count": 1 },
                        // Loot Generation
                        { "category": "Loot", "count": 3 },
                        // Animal Generation (Specific)
                        { "category": "Animal", "entityClass": "Domestic", "subclassKey": "Aurochs", "rankModifier": 0, "count": 2 },
                        // Mount Generation (Random)
                        { "category": "Animal", "entityClass": "Mount", "rankModifier": 0, "count": 1 }
                    ]
                }
            },
            "onFailure": {
                "description": "String",
                // Numeric Keys from EVENT_TAXONOMY.numericPayloadKeys
            }
        }
    ] | null
}
*/

// ============================================================================
// 3. TEMPLATE: STATIC EFFECT EVENT (SEE)
// ============================================================================
export const TEMPLATE_SEE = {
	id: 'evt_see_template',
	name: 'Harsh Environment',
	description: 'The weather takes a severe toll on your stamina and supplies.',
	typology: 'Hazard',
	eventType: 'NEGATIVE',
	conditions: { weight: 50, allowedTriggers: ['travel', 'explore', 'endturn'] },
	staticEffects: { hpMod: -12, apMod: -1, food: -3 },
	choices: null,
};

// ============================================================================
// 4. TEMPLATE: DYNAMIC EFFECT EVENT (DEE)
// ============================================================================
export const TEMPLATE_DEE = {
	id: 'evt_dee_template',
	name: 'Wandering Merchant',
	description: 'You encounter a merchant whose cart is stuck in the mud. He requests assistance or offers goods.',
	typology: 'SocialEncounter',
	eventType: 'NEUTRAL',
	conditions: { weight: 50, allowedTriggers: ['travel', 'explore'], allowedZoneCategories: ['UNTAMED', 'CIVILIZED'] },
	staticEffects: null,

	onEncounter: { procGen: { entityCategory: 'Human', subclassKey: 'Peddler', rankModifier: 0 } },

	choices: [
		{
			id: 'ch_general',
			label: 'Ignore him and keep walking',
			checkType: 'GENERAL',
			onSuccess: { honor: -3, description: 'You leave the merchant to deal with his own problems.' },
		},
		{
			id: 'ch_trade',
			label: 'Purchase an exotic herd',
			checkType: 'TRADE_OFF',
			cost: { silverCoins: 150 },
			onSuccess: {
				description: 'You hand over the silver and take control of the domestic beasts.',
				procGen: { items: [{ category: 'Animal', entityClass: 'Domestic', rankModifier: 0, count: 3 }] },
			},
		},
		{
			id: 'ch_luck',
			label: 'Search the mud for dropped items',
			checkType: 'LUCK_CHECK',
			successChance: 30,
			onSuccess: { healingPotions: 1, description: 'You find a buried healing potion in the dirt.' },
			onFailure: { apMod: -1, description: 'You waste time searching and find nothing of value.' },
		},
		{
			id: 'ch_skill',
			label: 'Help lift the cart out of the mud',
			checkType: 'SKILL_CHECK',
			attribute: 'str',
			difficultyModifier: 0,
			onSuccess: { honor: 7, silverCoins: 20, description: 'Using your strength, you free the cart. The merchant rewards you.' },
			onFailure: { hpMod: -18, apMod: -2, description: 'The cart slips, injuring you and exhausting your energy.' },
		},
		{
			id: 'ch_combat',
			label: 'Rob the merchant',
			checkType: 'COMBAT',
			combatRule: 'DMF',
			onSuccess: {
				honor: -17,
				silverCoins: 120,
				tradeSilver: 1,
				procGen: { items: [{ category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 }] },
			},
			onFailure: { honor: -10 },
		},
	],
};
