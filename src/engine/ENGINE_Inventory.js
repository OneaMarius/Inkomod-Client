// File: src/engine/ENGINE_Inventory.js
// Description: Manages equipment state, slot transfers, and dynamic encumbrance/penalty calculations.

import { WORLD } from '../data/GameWorld.js';

// ------------------------------------------------------------------------
// CAPACITY & ENCUMBRANCE CALCULATORS
// ------------------------------------------------------------------------

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
	totalMass += (inv.silverCoins || 0) / ratios.silverCoins;
	totalMass += (inv.goldCoins || 0) / ratios.silverCoins; // Assuming same mass logic as silver for transport
	totalMass += (inv.food || 0) / ratios.food;
	totalMass += (inv.healingPotions || 0) / ratios.healingPotion;
	totalMass += (inv.tradeSilver || 0) / (ratios.silverTradeGood || 5);
	totalMass += (inv.tradeGold || 0) / (ratios.goldTradeGood || 5);

	// 2. Calculate Physical Arrays Mass
	const arraysToSum = ['itemSlots', 'animalSlots', 'lootSlots'];
	arraysToSum.forEach((arrayName) => {
		if (inv[arrayName]) {
			inv[arrayName].forEach((item) => {
				totalMass += item.mass || item.weight || 0; // Standardizing property name expectation
			});
		}
	});

	// 3. Calculate Equipped Gear Mass (Equipped items still contribute to weight)
	const equippedSlots = [
		'weaponItem',
		'armourItem',
		'shieldItem',
		'helmetItem',
	];
	equippedSlots.forEach((slot) => {
		if (equip[slot]) {
			totalMass += equip[slot].mass || equip[slot].weight || 0;
		}
	});

	// 4. Update Max Capacity
	let currentMaxCapacity =
		WORLD.PLAYER.baseCapacity +
		playerEntity.stats.str * WORLD.PLAYER.capacityPerStr;

	// Helper function to calculate an animal's capacity
	const getAnimalCapacity = (animal) => {
		const mountStr =
			animal.stats?.str ||
			animal.biology?.str ||
			animal.stats?.innateStr ||
			5;
		return (
			WORLD.LOGISTICS.mountCarryWeight.base +
			mountStr * WORLD.LOGISTICS.mountCarryWeight.bonusPerStr
		);
	};

	// 4A. Add Equipped Mount Bonus
	if (equip.hasMount && equip.mountItem) {
		currentMaxCapacity += getAnimalCapacity(equip.mountItem);
	}

	// 4B. Add Caravan (animalSlots) Bonus
	if (inv.animalSlots && inv.animalSlots.length > 0) {
		inv.animalSlots.forEach((animal) => {
			// Add capacity only if the animal is classified as a Mount
			const category =
				animal.classification?.itemCategory ||
				animal.classification?.itemClass;
			if (category === 'Mount') {
				currentMaxCapacity += getAnimalCapacity(animal);
			}
		});
	}

	// 5. Calculate AP Travel Penalty
	let apPenalty = 0;
	if (totalMass > currentMaxCapacity) {
		const excessWeight = totalMass - currentMaxCapacity;
		const stepWeight =
			currentMaxCapacity * WORLD.LOGISTICS.encumbrancePenaltyStepPct;

		// Math.ceil ensures that even 1% over the limit triggers the first step penalty
		apPenalty =
			Math.ceil(excessWeight / stepWeight) *
			WORLD.LOGISTICS.encumbrancePenaltyAp;
	}

	// Apply mutations
	playerEntity.logistics.currentEncumbrance = Math.round(totalMass * 10) / 10; // Keeping 1 decimal for clean UI
	playerEntity.logistics.maxCapacity = currentMaxCapacity;
	playerEntity.logistics.travelApPenalty = apPenalty;

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
