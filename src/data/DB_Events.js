// File: Client/src/data/DB_Events.js
// Description: TEST SUITE - Designed to trigger all UI permutations in the WILD zone.

export const DB_EVENTS = {
	travel: [
		// --- TEST 1: COMBAT & Toate Regulile (DMF, NF, FF) ---
		{
			id: 'test_001_combat',
			name: "The Gladiator's Challenge",
			description: 'A heavily armored wanderer blocks your path in the wild. "I seek a challenge," he grunts. "Choose your terms."',
			typology: 'CombatEncounter', // Testeaza iconita ⚔️ in Header
			eventType: 'NEGATIVE', // Testeaza Aura 🔴
			conditions: { weight: 100, allowedZoneClasses: ['WILD'] },
			staticEffects: null,
			onEncounter: { procGen: { type: 'NPC_HUMAN', categories: ['Human'], classes: ['Warrior'], rankModifier: 0 } },
			choices: [
				{
					id: 'c_dmf',
					label: 'Fight to the death',
					checkType: 'COMBAT',
					combatRule: 'DMF', // Testeaza 🩸
					onSuccess: { renown: 15, silverCoins: 50 },
					onFailure: { hpMod: -100 },
				},
				{
					id: 'c_nf',
					label: 'Fight until one yields',
					checkType: 'COMBAT',
					combatRule: 'NF', // Testeaza 🛡️
					onSuccess: { honor: 5 },
					onFailure: { honor: -2 },
				},
				{
					id: 'c_ff',
					label: 'Fight a friendly duel',
					checkType: 'COMBAT',
					combatRule: 'FF', // Testeaza 🏳️
					onSuccess: { description: 'You escaped.' },
					onFailure: { hpMod: -10 },
				},
			],
		},

		// --- TEST 2: SOCIAL & Trade-Offs (Costuri multiple) ---
		{
			id: 'test_002_social',
			name: 'The Starving Merchant',
			description: 'You find a desperate merchant sitting on a rock. He is willing to make extremely favorable trades if you have what he needs.',
			typology: 'SocialEncounter', // Testeaza iconita 🤝 in Header
			eventType: 'NEUTRAL', // Testeaza Aura ⚪
			conditions: { weight: 100, allowedZoneClasses: ['WILD'] },
			staticEffects: null,
			choices: [
				{
					id: 't_silver',
					label: 'Buy his rare sword',
					checkType: 'TRADE_OFF',
					cost: { silverCoins: 50 }, // Testeaza 💰
					onSuccess: { honor: 2, description: 'You bought the weapon.' },
				},
				{
					id: 't_food',
					label: 'Trade food for info',
					checkType: 'TRADE_OFF',
					cost: { food: 5 }, // Testeaza 🍞
					onSuccess: { renown: 5, description: 'He tells you secrets of the realm.' },
				},
				{
					id: 't_both',
					label: 'Intimidate him',
					checkType: 'SKILL_CHECK',
					attribute: 'int',
					difficultyModifier: 1, // Testeaza 🧠
					onSuccess: { silverCoins: 10 },
					onFailure: { honor: -5 },
				},
			],
		},

		// --- TEST 3: DISCOVERY & Skill Checks (Atribute) ---
		{
			id: 'test_003_discovery',
			name: 'The Ancient Cache',
			description: 'Half-buried in the wild overgrowth, you spot a heavy, ornate chest. It has multiple mechanisms locking it in place.',
			typology: 'Discovery', // Testeaza iconita 🔍 in Header
			eventType: 'POSITIVE', // Testeaza Aura 🟢
			conditions: { weight: 100, allowedZoneClasses: ['WILD'] },
			staticEffects: { apMod: 1 }, // Testeaza afisarea efectelor statice de baza
			choices: [
				{
					id: 's_str',
					label: 'Pry it open with force',
					checkType: 'SKILL_CHECK',
					attribute: 'str',
					difficultyModifier: 0, // Testeaza 💪
					onSuccess: { silverCoins: 20 },
					onFailure: { hpMod: -5 },
				},
				{
					id: 's_agi',
					label: 'Pick the intricate lock',
					checkType: 'SKILL_CHECK',
					attribute: 'agi',
					difficultyModifier: 0, // Testeaza 🤸
					onSuccess: { healingPotions: 1 },
					onFailure: { hpMod: -2 },
				},
				{
					id: 's_luck',
					label: 'Guess the combination',
					checkType: 'LUCK_CHECK',
					successChance: 25, // Testeaza 🍀 + ❓
					onSuccess: { silverCoins: 100 },
					onFailure: { description: 'The mechanism jams forever.' },
				},
			],
		},

		// --- TEST 4: HAZARD & Efecte Statice ---
		{
			id: 'test_004_hazard',
			name: 'Toxic Spores',
			description: 'You accidentally step into a patch of strange wild mushrooms. They burst, releasing a cloud of choking spores!',
			typology: 'Hazard', // Testeaza iconita 🌩️ in Header
			eventType: 'NEGATIVE', // Testeaza Aura 🔴
			conditions: { weight: 100, allowedZoneClasses: ['WILD'] },
			staticEffects: { hpMod: -15, food: -2 }, // Must show negative red values in Event View
			choices: null, // Testeaza butonul de "Continue" fallback cand nu ai decizii
		},

		// --- TEST 5: GENERAL ---
		{
			id: 'test_005_general',
			name: 'The Silent Obelisk',
			description: 'A massive black stone stands in the middle of nowhere. It hums with a strange energy. Do you dare touch it?',
			typology: 'General', // Testeaza iconita 🧩 in Header
			eventType: 'NEUTRAL', // Testeaza Aura ⚪
			conditions: { weight: 100, allowedZoneClasses: ['WILD'] },
			staticEffects: null,
			choices: [
				{
					id: 'g_luck_high',
					label: 'Touch the runes',
					checkType: 'LUCK_CHECK',
					successChance: 80,
					onSuccess: { apMod: 5, description: 'You feel energized!' },
					onFailure: { hpMod: -20 },
				},
				{
					id: 'g_luck_low',
					label: 'Embrace the core',
					checkType: 'LUCK_CHECK',
					successChance: 10,
					onSuccess: { renown: 50, description: 'You have seen the truth of the universe.' },
					onFailure: { hpMod: -50 },
				},
			],
		},
	],

	monthly: [], // Lăsat gol intenționat pentru a nu interfera cu testarea pe Travel
};
