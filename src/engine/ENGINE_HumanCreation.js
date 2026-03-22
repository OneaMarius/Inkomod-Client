// File: src/engine/ENGINE_HumanCreation.js
// Description: Procedural generation engine for Human NPC instantiation.

import { WORLD } from './GameWorld.js';
import { DB_NPC_HUMANS } from './DB_NPC_Humans.js';
import { DB_NPC_TAXONOMY } from './DB_NPC_Taxonomy.js';
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';

export const generateHumanNPC = (subclassKey, poiRank) => {
	// 1. Resolve Profile from DB (Now flat structure)
	const profile = DB_NPC_HUMANS[subclassKey];
	if (!profile) throw new Error(`Human Engine Error: Invalid subclass [${subclassKey}]`);

	// 2. Resolve Config from Taxonomy
	const genData = DB_NPC_TAXONOMY.generationConfig;
	const rank = Math.max(1, Math.min(poiRank, 5));
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

	// 6. Resolve Economy
	const coinCurrent = Math.floor(genData.baseCoinMult * rank * socialClassData.economicCoinModifier);
	const foodCurrent = Math.floor(genData.baseFoodMult * rank * socialClassData.economicFoodModifier);

	// 7. Build Final Entity
	const entity = {
		entityId: generateUUID(),
		entityName: `${getRandomElement(genData.firstNames)} ${getRandomElement(genData.lastNames)}`,
		entityDescription: `A ${profile.generationProfile.socialClass} ${subclassKey} of the realm.`,

		classification: {
			entityArchetype: 'Humanoid',
			entityCategory: 'Human',
			entityClass: profile.entityClass,
			entitySubclass: subclassKey,
			entityRank: rank,
			combatTraining: profile.generationProfile.combatTraining,
		},

		biology: { hpCurrent: 100, hpMax: 100 },

		stats: { innateAdp: 0, innateDdr: 0, innateStr: finalStr, innateAgi: finalAgi, innateInt: finalInt },

		equipment: equipment,
		inventory: { coinCurrent, foodCurrent },

		social: {
			socialClass: profile.generationProfile.socialClass,
			honorClass: profile.generationProfile.honorClass,
			reputationClass: profile.generationProfile.reputationClass,
		},

		behavior: { behaviorState: 'Neutral', isAlert: false, fleeHpPercentThreshold: 0.15 },
		logistics: { resourceTag: 'Human_Loot', entityMass: totalMass },
		economy: { lootTableId: profile.economy?.lootTableId || null },
		interactions: { actionTags: profile.actionTags },
	};

	return { entity, generatedItems };
};
