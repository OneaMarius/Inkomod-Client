// File: src/engine/ENGINE_HumanCreation.js
// Description: Procedural generation engine for Human NPC instantiation.

import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_HUMANS } from '../data/DB_NPC_Humans.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';
import { calculateRankFromEconomy } from '../utils/EconomyUtils.js';
import { formatForDB, formatForUI } from '../utils/NameFormatter.js'; // <-- NEW IMPORT

export const generateHumanNPC = (subclassKey, poiRank) => {
	// 1. Resolve Profile from DB using the DB-safe key (forces underscores)
	const dbSafeKey = formatForDB(subclassKey);
	const profile = DB_NPC_HUMANS[dbSafeKey];
	if (!profile) throw new Error(`Human Engine Error: Invalid subclass [${dbSafeKey}]`);

	// 2. Resolve Config from Taxonomy
	const genData = DB_NPC_TAXONOMY.generationConfig;

	// Apply the economy variance calculation safely
	const safeRank = poiRank || 1;
	const rank = calculateRankFromEconomy(safeRank);
	const rankIndex = rank - 1;

	// 3. Resolve Modifiers
	const socialClassData = genData.socialClassModifiers[profile.generationProfile.socialClass];
	const combatTrainingData = genData.combatTrainingModifiers[profile.generationProfile.combatTraining];

	// Fallback for attributeModifier if missing (like in Divine class)
	const attrMod = combatTrainingData.attributeModifier || 1.0;

	const probCombat = combatTrainingData.itemProbability;
	const probSocial = socialClassData.itemProbability;

	const calculateProb = (itemType) => {
		return Math.floor(Math.min(probCombat[itemType] + probSocial[itemType], 100));
	};

	// 4. Resolve Attributes
	const calculateStat = (statName) => {
		const maxCap = WORLD.PLAYER.trainingCaps[statName][rankIndex];
		const minCap = Math.max(1, Math.floor(maxCap * 0.5));
		const rawValue = getRandomInt(minCap, maxCap) * attrMod;
		return Math.min(50, Math.floor(rawValue));
	};

	const finalStr = calculateStat('str');
	const finalAgi = calculateStat('agi');
	const finalInt = calculateStat('int');

	// 5. Resolve Equipment & Mount
	const generatedItems = [];
	let totalMass = 70;

	const equipment = { weaponId: null, armorId: null, helmetId: null, shieldId: null, mountId: null };

	const tryEquip = (slotClass, itemTypeKey) => {
		const probability = calculateProb(itemTypeKey);
		if (probability > 0 && getRandomInt(1, 100) <= probability) {
			const itemRank = calculateRankFromEconomy(rank);
			const item = generateItem(slotClass, itemRank, 'NPC');
			generatedItems.push(item);
			totalMass += item.stats.mass;
			return item.entityId;
		}
		return null;
	};

	equipment.weaponId = tryEquip('Weapon', 'weapon');
	equipment.armorId = tryEquip('Armor', 'armor');
	equipment.helmetId = tryEquip('Helmet', 'helmet');
	equipment.shieldId = tryEquip('Shield', 'shield');

	const mountProb = calculateProb('mount');
	if (mountProb > 0 && getRandomInt(1, 100) <= mountProb) {
		const mountRank = calculateRankFromEconomy(rank);
		const horse = generateHorseMount(mountRank);
		generatedItems.push(horse);
		equipment.mountId = horse.entityId;
	}

	// 6. Resolve Economy
	const baseSilverCoins = genData.baseCoinMult * rank * socialClassData.economicCoinModifier;
	const coinVariance = 1 + getRandomInt(-25, 25) / 100;
	const silverCoins = Math.floor(baseSilverCoins * coinVariance);
	const food = Math.floor(genData.baseFoodMult * rank * socialClassData.economicFoodModifier);

	// --- Apply UI Formatter for readable text ---
	const uiSubclass = formatForUI(dbSafeKey);

	// --- INTEGRATE DYNAMIC ACTION TAGS ---
	const specificTags = profile.actionTags || [];
	const classTags = DB_NPC_TAXONOMY.Human.classInteractions[profile.entityClass] || [];
	const subclassTags = DB_NPC_TAXONOMY.Human.subclassInteractions[dbSafeKey] || [];

	// Safely extract the generation profile
	const genProfile = profile.generationProfile || {};

	// Map dynamic tags directly from the taxonomy database
	const socialTags = DB_NPC_TAXONOMY.Human.socialClassInteractions[genProfile.socialClass] || [];
	const honorTags = DB_NPC_TAXONOMY.Human.honorClassInteractions[genProfile.honorClass] || [];
	const reputationTags = DB_NPC_TAXONOMY.Human.reputationClassInteractions[genProfile.reputationClass] || [];
	const combatTags = DB_NPC_TAXONOMY.Human.combatTrainingInteractions[genProfile.combatTraining] || [];

	// Combine all tag arrays and remove duplicates
	let combinedTags = [...new Set([...specificTags, ...classTags, ...subclassTags, ...socialTags, ...honorTags, ...reputationTags, ...combatTags])];

	// --- APPLY SUBTRACTIVE LOGIC (EXCLUSION RULES) ---

	// Veterans are too dangerous to be robbed or ambushed by standard means
	if (genProfile.combatTraining === 'Veteran') {
		combinedTags = combinedTags.filter((tag) => tag !== 'Target_Robbery' && tag !== 'Target_Ambush');
	}

	// Good characters cannot be bribed and do not act as fences for loot
	if (genProfile.honorClass === 'Good') {
		combinedTags = combinedTags.filter((tag) => tag !== 'Target_Bribe' && tag !== 'Trade_Loot');

		// High reputation good characters refuse to engage in street brawls
		if (genProfile.reputationClass === 'High') {
			combinedTags = combinedTags.filter((tag) => tag !== 'Combat_Brawl');
		}
	}

	// Poor characters do not have coins or valuables to steal
	if (genProfile.socialClass === 'Poor') {
		combinedTags = combinedTags.filter((tag) => tag !== 'Target_Steal_Coin' && tag !== 'Target_Robbery');
	}

	// 7. Build Final Entity
	const entity = {
		entityId: generateUUID(),
		entityName: `${getRandomElement(genData.firstNames)} ${getRandomElement(genData.lastNames)}`,
		entityDescription: `A ${profile.generationProfile.socialClass} ${uiSubclass.toLowerCase()} of the realm.`,

		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Human',
			entityClass: profile.entityClass,
			entitySubclass: uiSubclass,
			entityRank: rank,
			combatTraining: profile.generationProfile.combatTraining,
		},

		biology: { hpCurrent: 100, hpMax: 100 },

		stats: { innateAdp: 0, innateDdr: 0, innateStr: finalStr, innateAgi: finalAgi, innateInt: finalInt },

		equipment: equipment,

		inventory: { itemSlots: [], animalSlots: [], numeric: [], lootSlots: [], tradeSilver: 0, tradeGold: 0, silverCoins, food },

		social: {
			socialClass: profile.generationProfile.socialClass,
			honorClass: profile.generationProfile.honorClass,
			reputationClass: profile.generationProfile.reputationClass,
		},

		behavior: { behaviorState: 'Neutral', isAlert: false, fleeHpPercentThreshold: 0.15 },
		logistics: { resourceTag: 'Human_Loot', entityMass: totalMass },
		economy: { lootTableId: profile.economy?.lootTableId || null },

		// Apply the combined array here
		interactions: { actionTags: combinedTags },
	};

	entity.inventory.itemSlots = generatedItems;

	return { entity, generatedItems };
};
