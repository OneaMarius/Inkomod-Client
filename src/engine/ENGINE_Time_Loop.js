// File: src/engine/ENGINE_Time_Loop.js
import { WORLD } from '../data/GameWorld.js';
import { recalculateEncumbrance } from './ENGINE_Inventory.js';

// ------------------------------------------------------------------------
// HELPER FORMULAS
// ------------------------------------------------------------------------

const determineSeason = (month) => {
	const seasons = WORLD.TIME.seasons;
	if (month >= seasons.spring.startMonth && month <= seasons.spring.endMonth) return 'spring';
	if (month >= seasons.summer.startMonth && month <= seasons.summer.endMonth) return 'summer';
	if (month >= seasons.autumn.startMonth && month <= seasons.autumn.endMonth) return 'autumn';
	return 'winter';
};

const resolveBiologicalMatrix = (playerEntity, seasonKey) => {
	const seasonMult = WORLD.TIME.seasons[seasonKey].foodConsumptionMult;

	// Player Constants
	const playerStarvingDmg = WORLD.PLAYER.healingRates?.starving || -25;
	const playerNaturalHeal = WORLD.PLAYER.healingRates?.standard || 25;

	// Animal Constants
	const animalStarvingDmg = WORLD.NPC?.ANIMAL?.healingRates?.starving || -25;
	const animalNaturalHeal = WORLD.NPC?.ANIMAL?.healingRates?.natural || 5;

	const deathMultiplier = WORLD.NPC?.ANIMAL?.foodYieldMultipliers?.death || 0.5;

	let availableFood = playerEntity.inventory.food || 0;
	let totalFoodConsumed = 0;

	// --- NEW: Track initial HP for the report ---
	const initialHp = playerEntity.biology.hpCurrent;

	// Utility function to sacrifice the weakest animal in the caravan
	const sacrificeWeakestAnimal = () => {
		const animals = playerEntity.inventory.animalSlots;
		if (!animals || animals.length === 0) return 0;

		let minHpIndex = 0;
		let minHp = animals[0].biology.hpCurrent;
		for (let i = 1; i < animals.length; i++) {
			if (animals[i].biology.hpCurrent < minHp) {
				minHp = animals[i].biology.hpCurrent;
				minHpIndex = i;
			}
		}

		const sacrificedAnimal = animals[minHpIndex];
		const baseYield = sacrificedAnimal.logistics?.foodYield || 10;
		const meatYield = Math.max(1, Math.floor(baseYield * deathMultiplier));

		animals.splice(minHpIndex, 1);
		return meatYield;
	};

	// ========================================================================
	// 1. RESOLVE PLAYER (Highest Priority)
	// ========================================================================
	const playerBaseReq = WORLD.PLAYER.baseFoodNeed || 2;
	const playerReq = Math.ceil(playerBaseReq * seasonMult);

	// If insufficient food, sacrifice caravan animals before applying damage
	while (availableFood < playerReq && playerEntity.inventory.animalSlots.length > 0) {
		availableFood += sacrificeWeakestAnimal();
	}

	if (availableFood >= playerReq) {
		availableFood -= playerReq;
		totalFoodConsumed += playerReq;

		playerEntity.biology.isStarving = false;
		playerEntity.biology.hpCurrent = Math.min(playerEntity.biology.hpMax, playerEntity.biology.hpCurrent + playerNaturalHeal);
	} else {
		// No animals left to sacrifice, player takes damage
		totalFoodConsumed += availableFood;
		availableFood = 0;

		playerEntity.biology.isStarving = true;
		playerEntity.biology.hpCurrent += playerStarvingDmg;

		if (playerEntity.biology.hpCurrent <= 0) return { status: 'PERMADEATH' };
	}

	// ========================================================================
	// 2. RESOLVE EQUIPPED MOUNT (Secondary Priority)
	// ========================================================================
	if (playerEntity.equipment.hasMount && playerEntity.equipment.mountItem) {
		const mount = playerEntity.equipment.mountItem;
		const mountReq = Math.ceil((mount.logistics?.foodConsumption || 1) * seasonMult);

		while (availableFood < mountReq && playerEntity.inventory.animalSlots.length > 0) {
			availableFood += sacrificeWeakestAnimal();
		}

		if (availableFood >= mountReq) {
			availableFood -= mountReq;
			totalFoodConsumed += mountReq;

			mount.biology.hpCurrent = Math.min(mount.biology.hpMax, mount.biology.hpCurrent + animalNaturalHeal);
		} else {
			// Mount suffers damage
			totalFoodConsumed += availableFood;
			availableFood = 0;

			mount.biology.hpCurrent += animalStarvingDmg;

			if (mount.biology.hpCurrent <= 0) {
				// Mount dies and is converted to food
				const baseYield = mount.logistics?.foodYield || 10;
				const meatYield = Math.max(1, Math.floor(baseYield * deathMultiplier));
				availableFood += meatYield;

				playerEntity.equipment.mountItem = null;
				playerEntity.equipment.hasMount = false;
			}
		}
	}

	// ========================================================================
	// 3. RESOLVE CARAVAN (Remaining Resources)
	// ========================================================================
	if (playerEntity.inventory.animalSlots && playerEntity.inventory.animalSlots.length > 0) {
		playerEntity.inventory.animalSlots = playerEntity.inventory.animalSlots.filter((animal) => {
			const animalReq = Math.ceil((animal.logistics?.foodConsumption || 1) * seasonMult);

			if (availableFood >= animalReq) {
				availableFood -= animalReq;
				totalFoodConsumed += animalReq;

				animal.biology.hpCurrent = Math.min(animal.biology.hpMax, animal.biology.hpCurrent + animalNaturalHeal);
				return true;
			} else {
				// Animals at the end of the queue take damage
				totalFoodConsumed += availableFood;
				availableFood = 0;

				animal.biology.hpCurrent += animalStarvingDmg;

				if (animal.biology.hpCurrent <= 0) {
					// If an animal starves, its meat becomes available for the NEXT animal
					const baseYield = animal.logistics?.foodYield || 10;
					const meatYield = Math.max(1, Math.floor(baseYield * deathMultiplier));
					availableFood += meatYield;

					return false;
				}
				return true;
			}
		});
	}

	playerEntity.inventory.food = availableFood;

	// --- NEW: Calculate final HP delta ---
	const finalHpDelta = playerEntity.biology.hpCurrent - initialHp;

	return { status: 'SURVIVED', foodConsumed: totalFoodConsumed, hpChange: finalHpDelta };
};

// ------------------------------------------------------------------------
// MAIN EXECUTION LOOP
// ------------------------------------------------------------------------

export const executeEndMonth = (playerEntity, timeState) => {
	timeState.currentMonth += 1;
	timeState.totalMonthsPassed += 1;

	let isNewYear = false;

	// Reset month at year end
	if (timeState.currentMonth > WORLD.TIME.monthsPerYear) {
		timeState.currentMonth = 1;
	}

	// Year increment logic
	if (timeState.currentMonth === WORLD.TIME.yearChangeMonth) {
		playerEntity.identity.age += 1;
		timeState.currentYear += 1;
		isNewYear = true;
	}

	timeState.activeSeason = determineSeason(timeState.currentMonth);

	if (isNewYear) {
		// Placeholder: Stat degradation at year change
	}

	const bioResolution = resolveBiologicalMatrix(playerEntity, timeState.activeSeason);

	if (bioResolution.status === 'PERMADEATH') {
		return { status: 'PERMADEATH', reason: 'Starvation', updatedPlayer: playerEntity, updatedTime: timeState };
	}

	playerEntity.progression.actionPoints = WORLD.PLAYER.maxAp;
	recalculateEncumbrance(playerEntity);

	// --- NEW: Package the logistics report ---
	const monthlyReport = { foodConsumed: bioResolution.foodConsumed, hpChange: bioResolution.hpChange, isStarving: playerEntity.biology.isStarving };

	return { status: 'SUCCESS', monthlyReport, updatedPlayer: playerEntity, updatedTime: timeState };
};
