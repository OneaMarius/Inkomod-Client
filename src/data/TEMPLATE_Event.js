// File: Client/src/data/TEMPLATE_Event.js
// Description: Master taxonomy, schema definition, and templates for Narrative Events.
// Serves as the strict reference for automated or manual event generation.

// ============================================================================
// 0. GAME DESIGN, BALANCING CONTEXT & MASTER JSON SCHEMA (AI INSTRUCTIONS)
// ============================================================================
/*
    When generating new events, strictly adhere to the following balancing rules and schema.
    Values are categorized into Minor, Moderate, and Major thresholds. Numeric
    values are generated dynamically using the { tier, type } syntax.

    *** BALANCING RULES ***
    1. VITALS & ACTION POINTS:
       - Action Points (apMod): Player limit 0-16. Minor: 1 / Moderate: 2 / Major: 3
       - Health (hpMod): Player limit 1-100. Minor: 15 / Moderate: 30 / Major: 45

    2. CORE ATTRIBUTES:
       - Limits: 1 to 50. (str, agi, int). Charisma (cha) is excluded.
       - Permanent stat modifications: Minor: 1 / Moderate: 2 / Major: 3

    3. ECONOMY & LOGISTICS:
       - silverCoins: Minor: 25 / Moderate: 100 / Major: 200
       - tradeSilver & tradeGold: Minor: 1 / Moderate: 2 / Major: 3
       - food: Minor: 2 / Moderate: 5 / Major: 8
       - healingPotions: Minor: 1 / Moderate: 3 / Major: 5

    4. MORALITY & REPUTATION:
       - honor: -100 to 100. renown: 0 to 500.
       - Modifiers: Minor: 5 / Moderate: 10 / Major: 15

    5. PROCEDURAL GENERATION (procGen):
       - 'Physical': Weapons, Armour, Shields, Helmets.
       - 'Animal': Requires 'entityClass' ('Domestic' or 'Mount'). Can specify 'subclassKey'.
       - 'Loot': MUST specify 'entityCategory' ('Human', 'Animal', 'Monster', 'Nephilim') to dictate the drop pool.
       - 'count': Determines how many items/entities to generate.

    6. UI FORMATTING (CRITICAL):
       - NEVER include the cost, action type, or difficulty in parentheses within the 'label' text. 
       - e.g., Use "Pay the toll" NOT "Pay the toll (Costs 50 Silver)". The UI handles badges automatically.

    *** MASTER JSON SCHEMA ***
    {
        "id": "String (e.g., 'evt_dis_015')",
        "name": "String",
        "description": "String",
        "typology": "String (From EVENT_TAXONOMY.typologies)",
        "eventType": "String (From EVENT_TAXONOMY.eventTypes)",
        
        "conditions": {
            "weight": "Int (Usually 50)",
            "minRank": "Optional Int (1-5)",
            "allowedSeasons": "Optional Array of Strings",
            "allowedZoneClasses": "Optional Array of Strings",
            "allowedZoneCategories": "Optional Array of Strings",
            "allowedZoneSubclasses": "Optional Array of Strings",
            "allowedTriggers": "Array of Strings (e.g., ['travel', 'explore'])"
        },

        "staticEffects": {
            // e.g. "hpMod": { "tier": "MINOR", "type": "PENALTY" }
        } | null,
        
        "onEncounter": {
            "procGen": {
                "type": "String ('NPC_HUMAN' | 'NPC_ANIMAL' | 'NPC_MONSTER' | 'NPC_NEPHILIM')",
                "categories": ["String"],
                "classes": ["String"],
                "subclasses": ["String (Optional: Leave empty [] for random)"],
                "rankModifier": "Int (-1 to 1)"
            }
        } | null,

        "choices": [
            {
                "id": "String",
                "label": "String (Clean text only)",
                "checkType": "String (From EVENT_TAXONOMY.checkTypes)",
                
                // Costs remain hardcoded integers
                "cost": { "silverCoins": Int, "food": Int, "tradeSilver": Int, "tradeGold": Int, "healingPotions": Int },
                
                "attribute": "String (From EVENT_TAXONOMY.skillAttributes)",
                "difficultyModifier": "Int",
                "successChance": "Int (1-100)",
                "combatRule": "String (From EVENT_TAXONOMY.combatRules)",

                "onSuccess": {
                    "description": "String",
                    // Dynamic Modifiers e.g., "honor": { "tier": "MINOR", "type": "REWARD" },
                    "procGen": {
                        "items": [
                            { "category": "Physical", "itemClass": "Weapon", "tierModifier": 0, "count": 1 },
                            { "category": "Loot", "entityCategory": "Human", "count": 3 }, // <--- NEW LOOT SYNTAX
                            { "category": "Animal", "entityClass": "Domestic", "subclassKey": "Aurochs", "rankModifier": 0, "count": 2 }
                        ]
                    }
                },
                "onFailure": {
                    "description": "String",
                    // Dynamic Modifiers e.g., "hpMod": { "tier": "MODERATE", "type": "PENALTY" }
                }
            }
        ] | null
    }
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

    // procGenCategories: 'Loot' now supports the 'entityCategory' parameter to determine drop tables.
    procGenCategories: ['Physical', 'Animal', 'Loot'], 
    procGenPhysicalClasses: ['Weapon', 'Armour', 'Shield', 'Helmet'],
    procGenAnimalClasses: ['Domestic', 'Mount'],

    dynamicTiers: ['MINOR', 'MODERATE', 'MAJOR'],
    dynamicTypes: ['REWARD', 'PENALTY'],
};

// ============================================================================
// 2. TEMPLATE: STATIC EFFECT EVENT (SEE)
// ============================================================================
export const TEMPLATE_SEE = {
    id: 'evt_see_template',
    name: 'Harsh Environment',
    description: 'The weather takes a severe toll on your stamina and supplies.',
    typology: 'Hazard',
    eventType: 'NEGATIVE',
    conditions: { weight: 50, allowedTriggers: ['travel', 'explore', 'endturn'] },
    staticEffects: { 
        hpMod: { tier: 'MINOR', type: 'PENALTY' }, 
        apMod: { tier: 'MINOR', type: 'PENALTY' }, 
        food: { tier: 'MINOR', type: 'PENALTY' } 
    },
    choices: null,
};

// ============================================================================
// 3. TEMPLATE: DYNAMIC EFFECT EVENT (DEE)
// ============================================================================
export const TEMPLATE_DEE = {
    id: 'evt_dee_template',
    name: 'Wandering Merchant',
    description: 'You encounter a merchant whose cart is stuck in the mud. He requests assistance or offers goods.',
    typology: 'SocialEncounter',
    eventType: 'NEUTRAL',
    conditions: { weight: 50, allowedTriggers: ['travel', 'explore'], allowedZoneCategories: ['UNTAMED', 'CIVILIZED'] },
    staticEffects: null,

    // Target a valid class from DB_NPC_Humans (e.g., Trade -> Caravan_Master)
    onEncounter: { 
        procGen: { 
            type: 'NPC_HUMAN', 
            categories: ['Human'], 
            classes: ['Trade'], 
            subclasses: ['Caravan_Master'], 
            rankModifier: 0 
        } 
    },

    choices: [
        {
            id: 'ch_general',
            label: 'Ignore him and keep walking',
            checkType: 'GENERAL',
            onSuccess: { 
                honor: { tier: 'MINOR', type: 'PENALTY' }, 
                description: 'You leave the merchant to deal with his own problems.' 
            },
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
            onSuccess: { 
                healingPotions: { tier: 'MINOR', type: 'REWARD' }, 
                description: 'You find a buried healing potion in the dirt.' 
            },
            onFailure: { 
                apMod: { tier: 'MINOR', type: 'PENALTY' }, 
                description: 'You waste time searching and find nothing of value.' 
            },
        },
        {
            id: 'ch_skill',
            label: 'Help lift the cart out of the mud',
            checkType: 'SKILL_CHECK',
            attribute: 'str',
            difficultyModifier: 0,
            onSuccess: {
                honor: { tier: 'MINOR', type: 'REWARD' },
                silverCoins: { tier: 'MINOR', type: 'REWARD' },
                description: 'Using your strength, you free the cart. The merchant rewards you.',
            },
            onFailure: {
                hpMod: { tier: 'MODERATE', type: 'PENALTY' },
                apMod: { tier: 'MODERATE', type: 'PENALTY' },
                description: 'The cart slips, injuring you and exhausting your energy.',
            },
        },
        {
            id: 'ch_combat',
            label: 'Rob the merchant',
            checkType: 'COMBAT',
            combatRule: 'DMF',
            onSuccess: {
                honor: { tier: 'MAJOR', type: 'PENALTY' },
                silverCoins: { tier: 'MODERATE', type: 'REWARD' },
                tradeSilver: { tier: 'MINOR', type: 'REWARD' },
                procGen: { 
                    items: [
                        { category: 'Physical', itemClass: 'Weapon', tierModifier: 0, count: 1 },
                        // NEW: Specific Loot Generation from the Human loot pool
                        { category: 'Loot', entityCategory: 'Human', count: 2 } 
                    ] 
                },
            },
            onFailure: { honor: { tier: 'MODERATE', type: 'PENALTY' } },
        },
    ],
};