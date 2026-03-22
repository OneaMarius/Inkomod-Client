// File: src/engine/ENGINE_EquipmentCreation.js
// Description: Procedural generation engine for weapons, armours, shields, and helmets.

import { WORLD } from '../data/GameWorld.js';
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';
import { getRandomInt, generateUUID, getRandomElement } from '../utils/RandomUtils.js';

/**
 * Instantiates an equipment item template.
 * * @param {string} itemClass - 'Weapon', 'Armour', 'Shield', or 'Helmet'
 * @param {number|null} itemTier - Optional. Integer between 1 and 5. Random if null.
 * @param {string} generationContext - 'Trade', 'NPC', or 'Loot'
 * @returns {Object} Instantiated ITEM_TEMPLATE object
 */
export const generateItem = (itemClass, itemTier = null, generationContext = 'Trade') => {
	const safeClass = itemClass.toUpperCase();
	const safeClassLower = itemClass.toLowerCase();
	const safeContext = generationContext.toLowerCase();

	const maxAllowedTier = WORLD.ITEM?.GENERAL?.maxTier || 5;

	let tier;
	if (itemTier !== null && itemTier !== undefined) {
		tier = Math.max(1, Math.min(itemTier, maxAllowedTier));
	} else {
		tier = getRandomInt(1, maxAllowedTier);
	}

	const tierIndex = tier - 1;

	const categoryConfig = WORLD.ITEM[safeClass];
	if (!categoryConfig) {
		throw new Error(`THOR Engine Error: Invalid itemClass [${itemClass}]`);
	}

	const adp = getRandomInt(categoryConfig.adpBounds.min[tierIndex], categoryConfig.adpBounds.max[tierIndex]);

	const ddr = getRandomInt(categoryConfig.ddrBounds.min[tierIndex], categoryConfig.ddrBounds.max[tierIndex]);

	const nomenclature = DB_ITEM_NOMENCLATURE;
	const prefix = getRandomElement(nomenclature.prefixes[safeClassLower]);
	const typeCategory = getRandomElement(nomenclature.classes[safeClassLower]);
	const subclass = getRandomElement(nomenclature.subclasses[safeClassLower][typeCategory.toLowerCase()]);
	const suffix = getRandomElement(nomenclature.suffixes);

	const generatedName = `${prefix} ${subclass} ${suffix}`;

	let conditionRoll = 100;
	const genParams = WORLD.ITEM.GENERAL.generationContexts;

	if (safeContext === 'trade') {
		conditionRoll = genParams.trade.conditionBase;
	} else if (safeContext === 'npc') {
		const minCond = genParams.npc.minCondition + tier * genParams.npc.conditionPerRank;
		conditionRoll = getRandomInt(Math.min(minCond, 100), 100);
	} else if (safeContext === 'loot') {
		const minCond = genParams.loot.maxCondition - tier * genParams.loot.penaltyPerTier;
		conditionRoll = getRandomInt(Math.max(minCond, 1), 100);
	}

	const maxDurability = WORLD.ITEM.GENERAL.fullDurability;
	const currentDurability = Math.floor(maxDurability * (conditionRoll / 100));

	const goldPrice = WORLD.ECONOMY.baseValues.coinRegionalBaseCost;
	const eipAdpMult = WORLD.ITEM.GENERAL.eipPerAdp;
	const eipDdrMult = WORLD.ITEM.GENERAL.eipPerDdr;

	const baseCoinValue = Math.floor(adp * eipAdpMult * goldPrice + ddr * eipDdrMult * goldPrice);

	return {
		entityId: generateUUID(),
		itemName: generatedName,
		classification: { itemCategory: 'Physical', itemClass: itemClass, itemSubclass: subclass, itemTier: tier },
		stats: { adp: adp, ddr: ddr, mass: categoryConfig.baseMass },
		state: { currentDurability: currentDurability, maxDurability: maxDurability },
		economy: { baseCoinValue: baseCoinValue },
	};
};
