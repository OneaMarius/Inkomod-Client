// File: src/engine/ENGINE_MonsterCreation.js
// Description: Procedural generation engine for monster instantiation with dynamic rank scaling.

import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_MONSTERS } from '../data/DB_NPC_Monsters.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';


/**
 * Instantiates a Monster/Hostile NPC.
 * @param {string} entityClass - Mandatory. e.g., 'Undead', 'Demon', 'Beast'.
 * @param {string|null} subclassKey - Optional. Key matching DB_NPC_MONSTERS.
 * @param {number|null} requestedRank - Optional. Forces the generation to this rank (1-5).
 * @returns {Object} Instantiated MONSTER_TEMPLATE object.
 */
export const generateMonsterNPC = (entityClass, subclassKey = null, requestedRank = null) => {
	if (!entityClass) {
		throw new Error(`Monster Engine Error: entityClass parameter is mandatory (e.g., 'Undead').`);
	}

	let targetSubclass = null;
	const availableMonsters = Object.keys(DB_NPC_MONSTERS);

	if (subclassKey) {
		const tempProfile = DB_NPC_MONSTERS[subclassKey];
		if (!tempProfile) {
			throw new Error(`Monster Engine Error: Invalid subclass [${subclassKey}]`);
		}
		if (tempProfile.classification.entityClass !== entityClass) {
			throw new Error(`Monster Engine Error: Subclass [${subclassKey}] does not belong to Class [${entityClass}]`);
		}
		targetSubclass = subclassKey;
	} else {
		const classCandidates = availableMonsters.filter((key) => DB_NPC_MONSTERS[key].classification.entityClass === entityClass);

		if (classCandidates.length === 0) {
			throw new Error(`Monster Engine Error: No valid monster profiles found for Class [${entityClass}]`);
		}

		targetSubclass = classCandidates[Math.floor(Math.random() * classCandidates.length)];
	}

	const profile = DB_NPC_MONSTERS[targetSubclass];
	const genParams = profile.generationProfile;
	const logParams = profile.logistics;

	let finalRank;
	if (requestedRank !== null) {
		finalRank = Math.max(genParams.rankRange[0], Math.min(requestedRank, genParams.rankRange[1]));
	} else {
		finalRank = getRandomInt(genParams.rankRange[0], genParams.rankRange[1]);
	}

	const rankIndex = finalRank - 1;

	const baseHp = getRandomInt(genParams.baseHpBounds.min, genParams.baseHpBounds.max);
	const hpScaling = getRandomInt(genParams.hpPerRankBounds.min, genParams.hpPerRankBounds.max) * finalRank;
	const maxHp = baseHp + hpScaling;

	const adp = getRandomInt(genParams.adpBounds.min[rankIndex], genParams.adpBounds.max[rankIndex]);
	const ddr = getRandomInt(genParams.ddrBounds.min[rankIndex], genParams.ddrBounds.max[rankIndex]);
	const str = getRandomInt(genParams.strBounds.min[rankIndex], genParams.strBounds.max[rankIndex]);
	const agi = getRandomInt(genParams.agiBounds.min[rankIndex], genParams.agiBounds.max[rankIndex]);
	const int = getRandomInt(genParams.intBounds.min[rankIndex], genParams.intBounds.max[rankIndex]);

	const entityMass = getRandomInt(logParams.entityMassBounds.min, logParams.entityMassBounds.max);

	// Dynamic food yield calculation
	const conversionFactor = logParams.foodConversionFactor || 0;
	const baseYieldPct = WORLD.NPC?.MONSTER?.massToFoodYieldPct || 0.05;
	let foodYield = 0;

	if (conversionFactor > 0) {
		foodYield = Math.max(1, Math.floor(entityMass * baseYieldPct * conversionFactor));
	}

	const baseBountyMultiplier = WORLD.ECONOMY?.baseValues?.monsterBountyMultiplier || 10;
	const calculatedBounty = Math.floor((str + agi + int) * 0.5 * finalRank * baseBountyMultiplier);

	const lootTableId = profile.economy ? profile.economy.lootTableId : null;

	return {
		entityId: generateUUID(),
		entityName: `Rank ${finalRank} ${targetSubclass.replace('_', ' ')}`,
		entityDescription: `A hostile ${profile.classification.entityClass.toLowerCase()} lurking in the shadows.`,

		classification: {
			entityArchetype: profile.classification.entityArchetype || 'Creature',
			entityCategory: profile.classification.entityCategory || 'Monster',
			entityClass: profile.classification.entityClass,
			entitySubclass: targetSubclass,
			entityRank: finalRank,
		},

		biology: { hpCurrent: maxHp, hpMax: maxHp },

		stats: { innateAdp: adp, innateDdr: ddr, innateStr: str, innateAgi: agi, innateInt: int },

		behavior: {
			behaviorState: profile.behavior.behaviorState || 'Hostile',
			isAlert: profile.behavior.isAlert || true,
			fleeHpPercentThreshold: profile.behavior.fleeHpPercentThreshold || 0,
		},

		logistics: { resourceTag: logParams.resourceTag, foodYield: foodYield, foodConsumption: logParams.foodConsumption || 0, entityMass: entityMass },

		economy: { baseCoinValue: profile.economy?.baseCoinValue || calculatedBounty, lootTableId: lootTableId },

		interactions: { actionTags: profile.interactions?.actionTags || ['Fight_Monster', 'Evade_Monster', 'Ignore'] },
	};
};
