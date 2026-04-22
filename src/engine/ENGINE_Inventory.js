// File: src/engine/ENGINE_Inventory.js
// Description: Manages equipment state, slot transfers, and dynamic encumbrance/penalty calculations.

import { WORLD } from '../data/GameWorld.js';

// ------------------------------------------------------------------------
// CAPACITY & ENCUMBRANCE CALCULATORS
// ------------------------------------------------------------------------

/**
 * Internal helper to find the correct mass regardless of the generation engine.
 */
const getMass = (item) => {
	if (!item) return 0;
	// Checks the new THOR/Animal structure, falling back to the legacy structure
	return item.stats?.mass || item.logistics?.baseMass || item.logistics?.entityMass || item.mass || item.weight || 0;
};

/**
 * Iterates through all inventory sources to calculate total carried weight,
 * updates max capacity based on stats, equipped mounts, and caravan animals,
 * and determines the AP travel penalty.
 * @param {Object} playerEntity - The current state of the player.
 * @returns {Object} The updated player entity.
 */
export const recalculateEncumbrance = (playerEntity) => {
    let totalMass = 0;
    const inv = playerEntity.inventory;
    const equip = playerEntity.equipment;
    const ratios = WORLD.LOGISTICS.massRatios;

    // 1. Calculate Numeric Counter Mass
    const massSilver = (inv.silverCoins || 0) / ratios.silverCoins;
    const massGold = (inv.goldCoins || 0) / ratios.silverCoins; // Assuming same ratio or update if different
    const massFood = (inv.food || 0) / ratios.food;
    const massPotions = (inv.healingPotions || 0) / ratios.healingPotion;
    const massTradeSilver = (inv.tradeSilver || 0) / (ratios.silverTradeGood || 5);
    const massTradeGold = (inv.tradeGold || 0) / (ratios.goldTradeGood || 5);

    const massCurrency = massSilver + massGold;
    const massConsumables = massFood + massPotions;
    const massTradeGoods = massTradeSilver + massTradeGold;

    totalMass += massCurrency + massConsumables + massTradeGoods;

    // 2. Calculate Physical Arrays Mass
    let massItems = 0;
    const arraysToSum = ['itemSlots', 'lootSlots'];
    arraysToSum.forEach((arrayName) => {
        if (inv[arrayName]) {
            inv[arrayName].forEach((item) => {
                const itemMass = getMass(item);
                massItems += itemMass;
            });
        }
    });
    totalMass += massItems;

    // 3. Calculate Equipped Gear Mass
    let massEquipped = 0;
    const equippedSlots = ['weaponItem', 'armourItem', 'shieldItem', 'helmetItem'];
    equippedSlots.forEach((slot) => {
        if (equip[slot]) {
            const itemMass = getMass(equip[slot]);
            massEquipped += itemMass;
        }
    });
    totalMass += massEquipped;


    // 4. Update Max Capacity
    const playerStr = playerEntity.stats?.innateStr || playerEntity.stats?.str || 10;
    const basePlayerCapacity = WORLD.PLAYER.baseCapacity + playerStr * WORLD.PLAYER.capacityPerStr;
    let currentMaxCapacity = basePlayerCapacity;

    // Helper function to calculate animal capacity
    const getAnimalCapacity = (animal) => {
        const mountStr = animal.stats?.innateStr || animal.stats?.str || animal.biology?.str || 0;
        return WORLD.LOGISTICS.mountCarryWeight.base + mountStr * WORLD.LOGISTICS.mountCarryWeight.bonusPerStr;
    };

    // 4A. Add Equipped Mount Bonus
    let activeMountCapacity = 0;
    if (equip.hasMount && equip.mountItem) {
        activeMountCapacity = getAnimalCapacity(equip.mountItem);
        currentMaxCapacity += activeMountCapacity;
    }

    // 4B. Add Caravan Bonus
    let caravanMountCapacity = 0;
    if (inv.animalSlots && inv.animalSlots.length > 0) {
        inv.animalSlots.forEach((animal) => {
            const isMount = animal.classification?.entitySubclass === 'Horse' || animal.classification?.itemClass === 'Mount';
            if (isMount) {
                caravanMountCapacity += getAnimalCapacity(animal);
            }
        });
        currentMaxCapacity += caravanMountCapacity;
    }

    // 5. Calculate AP Travel Penalty
    let apPenalty = 0;
    if (totalMass > currentMaxCapacity) {
        const excessWeight = totalMass - currentMaxCapacity;
        const stepWeight = currentMaxCapacity * WORLD.LOGISTICS.encumbrancePenaltyStepPct;

        if (stepWeight > 0) {
            apPenalty = Math.ceil(excessWeight / stepWeight) * WORLD.LOGISTICS.encumbrancePenaltyAp;
        }
    }

    // Apply mutations
    playerEntity.logistics.currentEncumbrance = Math.round(totalMass * 10) / 10;
    playerEntity.logistics.maxCapacity = currentMaxCapacity;
    playerEntity.logistics.travelApPenalty = apPenalty;
    
    // Store detailed breakdown
    playerEntity.logistics.weightDetails = {
        massCurrency: Math.round(massCurrency * 10) / 10,
        massConsumables: Math.round(massConsumables * 10) / 10,
        massTradeGoods: Math.round(massTradeGoods * 10) / 10,
        massItems: Math.round((massItems + massEquipped) * 10) / 10, 
        basePlayerCapacity: basePlayerCapacity,
        activeMountCapacity: activeMountCapacity,
        caravanMountCapacity: caravanMountCapacity
    };

    return playerEntity;
};

// ------------------------------------------------------------------------
// EQUIPMENT EXECUTORS
// ------------------------------------------------------------------------

/**
 * Equips an item from the inventory into the active equipment slot.
 * Swaps out any currently equipped item back into the inventory.
 * @param {Object} playerEntity
 * @param {Number} inventoryIndex - Index of the item in the source array.
 * @param {String} itemCategory - 'Weapon', 'Armour', 'Shield', 'Helmet', 'Mount'
 * @returns {Object} Payload containing status and updated player entity.
 */
export const equipItem = (playerEntity, inventoryIndex, itemCategory) => {
	const inv = playerEntity.inventory;
	const equip = playerEntity.equipment;

	const isMount = itemCategory === 'Mount';
	const sourceArray = isMount ? inv.animalSlots : inv.itemSlots;
	const targetSlotKey = `${itemCategory.toLowerCase()}Item`; // e.g., 'weaponItem'
	const targetBooleanKey = `has${itemCategory}`; // e.g., 'hasWeapon'

	if (!sourceArray || !sourceArray[inventoryIndex]) {
		return { status: 'FAILED_ITEM_NOT_FOUND', updatedPlayer: playerEntity };
	}

	const itemToEquip = sourceArray[inventoryIndex];

	// Remove item from inventory array
	sourceArray.splice(inventoryIndex, 1);

	// If a slot is already occupied, push the currently equipped item back to the inventory
	if (equip[targetBooleanKey] && equip[targetSlotKey]) {
		const itemToStore = equip[targetSlotKey];
		itemToStore.isEquipped = false;
		sourceArray.push(itemToStore);
	}

	// Equip the new item
	itemToEquip.isEquipped = true;
	equip[targetSlotKey] = itemToEquip;
	equip[targetBooleanKey] = true;

	// Recalculate capacity and penalties
	recalculateEncumbrance(playerEntity);

	return { status: 'SUCCESS', updatedPlayer: playerEntity };
};

/**
 * Unequips an active item and returns it to the correct inventory array.
 * @param {Object} playerEntity
 * @param {String} itemCategory - 'Weapon', 'Armour', 'Shield', 'Helmet', 'Mount'
 * @returns {Object} Payload containing status and updated player entity.
 */
export const unequipItem = (playerEntity, itemCategory) => {
	const inv = playerEntity.inventory;
	const equip = playerEntity.equipment;

	const isMount = itemCategory === 'Mount';
	const targetArray = isMount ? inv.animalSlots : inv.itemSlots;
	const limitKey = isMount ? 'animalSlots' : 'itemSlots';
	const slotKey = `${itemCategory.toLowerCase()}Item`;
	const booleanKey = `has${itemCategory}`;

	if (!equip[booleanKey] || !equip[slotKey]) {
		return { status: 'FAILED_NOTHING_EQUIPPED', updatedPlayer: playerEntity };
	}

	// Check inventory capacity limits before unequipping
	if (targetArray.length >= WORLD.PLAYER.inventoryLimits[limitKey]) {
		return { status: 'FAILED_INVENTORY_FULL', updatedPlayer: playerEntity };
	}

	const itemToStore = equip[slotKey];
	itemToStore.isEquipped = false;

	// Move to inventory
	targetArray.push(itemToStore);

	// Clear equipment slot
	equip[slotKey] = null;
	equip[booleanKey] = false;

	// Recalculate capacity and penalties (especially important if unequipping a Mount)
	recalculateEncumbrance(playerEntity);

	return { status: 'SUCCESS', updatedPlayer: playerEntity };
};

/**
 * Slaughters an animal from the caravan, yielding food and removing the entity.
 * @param {Object} playerEntity - The current state of the player.
 * @param {Number} inventoryIndex - Index of the animal in the animalSlots array.
 * @returns {Object} Payload containing status, updated player entity, and food gained.
 */
export const slaughterAnimal = (playerEntity, inventoryIndex) => {
	const inv = playerEntity.inventory;

	if (!inv.animalSlots || !inv.animalSlots[inventoryIndex]) {
		return { status: 'FAILED_ANIMAL_NOT_FOUND', updatedPlayer: playerEntity };
	}

	const animal = inv.animalSlots[inventoryIndex];
	const baseYield = animal.logistics?.foodYield || 0;

	const multiplier = WORLD.NPC?.ANIMAL?.foodYieldMultipliers?.slaughter || 1.0;
	const totalFood = Math.floor(baseYield * multiplier);

	inv.animalSlots.splice(inventoryIndex, 1);
	inv.food = (inv.food || 0) + totalFood;

	recalculateEncumbrance(playerEntity);

	return { status: 'SUCCESS', updatedPlayer: playerEntity, foodGained: totalFood };
};

/**
 * Drops an item from the specified inventory array, destroying it permanently.
 * @param {Object} playerEntity - The current state of the player.
 * @param {Number} inventoryIndex - Index of the item to drop.
 * @param {String} targetArrayName - The name of the array (e.g., 'itemSlots', 'lootSlots').
 * @returns {Object} Payload containing status and updated player entity.
 */
export const dropItem = (playerEntity, inventoryIndex, targetArrayName) => {
	const inv = playerEntity.inventory;

	if (!inv[targetArrayName] || !inv[targetArrayName][inventoryIndex]) {
		return { status: 'FAILED_ITEM_NOT_FOUND', updatedPlayer: playerEntity };
	}

	inv[targetArrayName].splice(inventoryIndex, 1);
	recalculateEncumbrance(playerEntity);

	return { status: 'SUCCESS', updatedPlayer: playerEntity };
};

// ------------------------------------------------------------------------
// DERIVED STATS CALCULATORS
// ------------------------------------------------------------------------

export const calculateDerivedStats = (playerEntity) => {
	const stats = playerEntity.stats;
	const equip = playerEntity.equipment;
	const progression = playerEntity.progression || { honor: 0, renown: 0 };

	const str = stats.str || 0;
	const agi = stats.agi || 0;
	const int = stats.int || 0;

	let weaponAdp = 0;
	let weaponDdr = 0;
	if (equip.hasWeapon && equip.weaponItem) {
		weaponAdp = equip.weaponItem.stats?.adp || 0;
		weaponDdr = equip.weaponItem.stats?.ddr || 0;
	}

	let armourDdr = 0;
	let armourAdp = 0;
	if (equip.hasArmour && equip.armourItem) {
		armourDdr = equip.armourItem.stats?.ddr || 0;
		armourAdp = equip.armourItem.stats?.adp || 0;
	}

	let shieldDdr = 0;
	let shieldAdp = 0;
	if (equip.hasShield && equip.shieldItem) {
		shieldDdr = equip.shieldItem.stats?.ddr || 0;
		shieldAdp = equip.shieldItem.stats?.adp || 0;
	}

	let helmetDdr = 0;
	let helmetAdp = 0;
	if (equip.hasHelmet && equip.helmetItem) {
		helmetDdr = equip.helmetItem.stats?.ddr || 0;
		helmetAdp = equip.helmetItem.stats?.adp || 0;
	}

	const maxAdp = WORLD.COMBAT.coreStats.maxAttackDamagePower;
	const maxDdr = WORLD.COMBAT.coreStats.maxDefenseDamageReduction;

	const totalAdp = Math.min(Math.floor(str / 2) + weaponAdp + armourAdp + shieldAdp + helmetAdp, maxAdp);
	const totalDdr = Math.min(5 + Math.floor(agi / 5) + weaponDdr + armourDdr + shieldDdr + helmetDdr, maxDdr);

	// Calculate Charisma
	const rawCha = Math.floor(progression.honor / 10 + progression.renown / 20 + int / 2);
	const totalCha = Math.max(1, Math.min(50, rawCha));

	return { totalAdp, totalDdr, totalCha };
};
