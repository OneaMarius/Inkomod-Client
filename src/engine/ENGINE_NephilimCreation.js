// File: src/engine/ENGINE_NephilimCreation.js
// Description: Procedural generation engine for Nephilim instantiation.

import { DB_NPC_NEPHILIMS } from '../data/DB_NPC_Nephilims.js'; // Ensure path points to data folder
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js'; // Ensure path points to data folder
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';
import { formatForDB, formatForUI } from '../utils/NameFormatter.js'; // <-- NEW IMPORT

/**
 * Main logic for instantiating a Nephilim NPC.
 * @param {string} subclassKey - The strict string matching a key in DB_NPC_NEPHILIMS or a UI string.
 * @returns {Object} { entity: Object, generatedItems: Array }
 */
export const generateNephilimNPC = (subclassKey) => {
	// --- FORMAT FOR DB (Ensures underscores) ---
	const dbSafeKey = formatForDB(subclassKey);

	const profile = DB_NPC_NEPHILIMS[dbSafeKey];
	if (!profile) throw new Error(`Nephilim Engine Error: Invalid subclass [${dbSafeKey}]`);

	const genConfig = DB_NPC_TAXONOMY.generationConfig;
	const rank = profile.classification.entityRank; // Nephilims are strictly fixed rank (5)

	// 1. Resolve Taxonomy Modifiers
	const socialClassData = genConfig.socialClassModifiers[profile.generationProfile.socialClass];
	const combatTrainingData = genConfig.combatTrainingModifiers[profile.generationProfile.combatTraining];

	const probCombat = combatTrainingData.itemProbability;
	const probSocial = socialClassData.itemProbability;

	const calculateProb = (itemType) => {
		return Math.floor(Math.min(probCombat[itemType] + probSocial[itemType], 100));
	};

	// 2. Resolve Equipment & Mount
	const generatedItems = [];
	let totalMass = profile.logistics.entityMass;

	const equipment = { weaponId: null, armourId: null, helmetId: null, shieldId: null, mountId: null };

	const tryEquip = (slotClass, itemTypeKey) => {
		const probability = calculateProb(itemTypeKey);
		if (probability > 0 && getRandomInt(1, 100) <= probability) {
			const item = generateItem(slotClass, rank, 'NPC');
			generatedItems.push(item);
			totalMass += item.stats.mass;
			return item.entityId;
		}
		return null;
	};

	equipment.weaponId = tryEquip('Weapon', 'weapon');
	equipment.armourId = tryEquip('Armour', 'armour');
	equipment.helmetId = tryEquip('Helmet', 'helmet');
	equipment.shieldId = tryEquip('Shield', 'shield');

	const mountProb = calculateProb('mount');
	if (mountProb > 0 && getRandomInt(1, 100) <= mountProb) {
		const horse = generateHorseMount(rank);
		generatedItems.push(horse);
		equipment.mountId = horse.entityId;
	}

	// 3. Resolve Economy
	const coinCurrent = Math.floor(genConfig.baseCoinMult * rank * socialClassData.economicCoinModifier);
	const foodCurrent = Math.floor(genConfig.baseFoodMult * rank * socialClassData.economicFoodModifier);

	// 4. Formatting Unique Identity (Translates underscores back to spaces)
	const uiSubclass = formatForUI(dbSafeKey);

	// 5. Construct Template
	const entity = {
		entityId: generateUUID(),
		entityName: uiSubclass, // Clean, spaced name
		entityDescription: `A powerful ${profile.classification.entityClass.toLowerCase()} of ancient lineage.`,

		classification: {
			entityArchetype: profile.classification.entityArchetype,
			entityCategory: profile.classification.entityCategory,
			entityClass: profile.classification.entityClass,
			entitySubclass: uiSubclass, // Clean, spaced subclass
			entityRank: rank,
			combatTraining: profile.generationProfile.combatTraining,
		},

		biology: { hpCurrent: profile.biology.hpCurrent, hpMax: profile.biology.hpMax },

		stats: {
			innateAdp: profile.stats.innateAdp,
			innateDdr: profile.stats.innateDdr,
			innateStr: profile.stats.innateStr,
			innateAgi: profile.stats.innateAgi,
			innateInt: profile.stats.innateInt,
		},

		equipment: equipment,

		inventory: { coinCurrent: coinCurrent, foodCurrent: foodCurrent },

		social: { socialClass: profile.generationProfile.socialClass, honorClass: profile.social.honorClass, reputationClass: profile.social.reputationClass },

		behavior: {
			behaviorState: profile.behavior.behaviorState,
			isAlert: profile.behavior.isAlert,
			fleeHpPercentThreshold: profile.behavior.fleeHpPercentThreshold,
		},

		logistics: { resourceTag: profile.logistics.resourceTag, entityMass: totalMass },

		economy: { lootTableId: profile.economy.lootTableId },

		interactions: { actionTags: profile.interactions.actionTags },
	};

	return { entity, generatedItems };
};
