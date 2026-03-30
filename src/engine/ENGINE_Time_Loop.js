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

const resolveAging = (playerEntity, isNewYear) => {
	const age = playerEntity.identity.age;
	const agingData = WORLD.PLAYER.aging;

	// 1. Calculate Monthly Mortality Risk
	let activeTier = agingData.mortalityTiers[agingData.mortalityTiers.length - 1];
	for (let i = 0; i < agingData.mortalityTiers.length; i++) {
		if (age <= agingData.mortalityTiers[i].maxAge) {
			activeTier = agingData.mortalityTiers[i];
			break;
		}
	}

	const monthlyRisk = activeTier.annualRisk / 12;
	const rngRoll = Math.random();

	if (rngRoll < monthlyRisk) {
		return 'PERMADEATH';
	}

	// 2. Apply Annual Stat Degradation
	if (isNewYear && age >= agingData.statLossThreshold) {
		const penalty = agingData.annualStatPenalty;
		playerEntity.stats.str = Math.max(1, playerEntity.stats.str - penalty);
		playerEntity.stats.agi = Math.max(1, playerEntity.stats.agi - penalty);
		playerEntity.stats.int = Math.max(1, playerEntity.stats.int - penalty);

		const minHpCap = WORLD.PLAYER.hpLimits.minCap;
		playerEntity.biology.hpMax = Math.max(minHpCap, playerEntity.biology.hpMax - penalty);

		if (playerEntity.biology.hpCurrent > playerEntity.biology.hpMax) {
			playerEntity.biology.hpCurrent = playerEntity.biology.hpMax;
		}
	}

	return 'SURVIVED';
};

const resolveBiologicalMatrix = (playerEntity, seasonKey) => {
	const seasonMult = WORLD.TIME.seasons[seasonKey].foodConsumptionMult;

	// Player Constants
	const playerNaturalHeal = WORLD.PLAYER.healingRates?.standard || 25;
	const playerStarvingDamagePct = WORLD.PLAYER.healingRates?.starvingDamagePct || 0.25;
	const playerDeathThreshold = WORLD.PLAYER.healingRates?.deathThresholdHp || 25;

	// Animal Constants
	const animalNaturalHeal = WORLD.NPC?.ANIMAL?.healingRates?.natural || 5;
	const animalStarvingDamagePct = WORLD.NPC?.ANIMAL?.healingRates?.starvingDamagePct || 0.5;
	const animalDeathThreshold = WORLD.NPC?.ANIMAL?.healingRates?.deathThresholdHp || 25;

	const deathMultiplier = WORLD.NPC?.ANIMAL?.foodYieldMultipliers?.death || 0.5;

	let availableFood = playerEntity.inventory.food || 0;
	let totalFoodConsumed = 0;

	// Report Tracking Variables
	const initialHp = playerEntity.biology.hpCurrent;
	let animalsSacrificed = 0;
	let meatHarvested = 0;
	let mountStarvationDamage = 0;
	let mountDied = false;

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

		animalsSacrificed += 1;
		meatHarvested += meatYield;

		return meatYield;
	};

	// ========================================================================
	// 1. RESOLVE PLAYER (Highest Priority)
	// ========================================================================
	const playerBaseReq = WORLD.PLAYER.baseFoodNeed || 2;
	const playerReq = Math.ceil(playerBaseReq * seasonMult);

	// If insufficient food, sacrifice caravan animals
	while (availableFood < playerReq && playerEntity.inventory.animalSlots.length > 0) {
		availableFood += sacrificeWeakestAnimal();
	}

	if (availableFood >= playerReq) {
		availableFood -= playerReq;
		totalFoodConsumed += playerReq;

		playerEntity.biology.isStarving = false;
		playerEntity.biology.hpCurrent = Math.min(playerEntity.biology.hpMax, playerEntity.biology.hpCurrent + playerNaturalHeal);
	} else {
		// Partial or complete starvation
		const deficitAmount = playerReq - availableFood;
		const deficitPct = deficitAmount / playerReq;

		totalFoodConsumed += availableFood;
		availableFood = 0;

		// Apply proportional damage based on current HP
		const damageToApply = Math.floor(playerEntity.biology.hpCurrent * playerStarvingDamagePct * deficitPct);

		playerEntity.biology.isStarving = true;
		playerEntity.biology.hpCurrent -= damageToApply;

		if (playerEntity.biology.hpCurrent <= playerDeathThreshold) {
			return { status: 'PERMADEATH' };
		}
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
			// Partial or complete starvation for mount
			const deficitAmount = mountReq - availableFood;
			const deficitPct = deficitAmount / mountReq;

			totalFoodConsumed += availableFood;
			availableFood = 0;

			// Apply proportional damage based on current HP
			const damageToApply = Math.floor(mount.biology.hpCurrent * animalStarvingDamagePct * deficitPct);
			mountStarvationDamage = damageToApply;

			mount.biology.hpCurrent -= damageToApply;

			// Check death threshold (Dies of emaciation, yields no food)
			if (mount.biology.hpCurrent <= animalDeathThreshold) {
				mountDied = true;
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
				const deficitAmount = animalReq - availableFood;
				const deficitPct = deficitAmount / animalReq;

				totalFoodConsumed += availableFood;
				availableFood = 0;

				const damageToApply = Math.floor(animal.biology.hpCurrent * animalStarvingDamagePct * deficitPct);
				animal.biology.hpCurrent -= damageToApply;

				// Check death threshold (Dies of emaciation, yields no food)
				if (animal.biology.hpCurrent <= animalDeathThreshold) {
					return false; // Remove from array
				}
				return true;
			}
		});
	}

	playerEntity.inventory.food = availableFood;
	const finalHpDelta = playerEntity.biology.hpCurrent - initialHp;

	return { status: 'SURVIVED', foodConsumed: totalFoodConsumed, hpChange: finalHpDelta, animalsSacrificed, meatHarvested, mountStarvationDamage, mountDied };
};

// ------------------------------------------------------------------------
// MAIN EXECUTION LOOP
// ------------------------------------------------------------------------

export const executeEndMonth = (playerEntity, timeState) => {
	timeState.currentMonth += 1;
	timeState.totalMonthsPassed += 1;

	let isNewYear = false;

	if (timeState.currentMonth > WORLD.TIME.monthsPerYear) {
		timeState.currentMonth = 1;
	}

	if (timeState.currentMonth === WORLD.TIME.yearChangeMonth) {
		playerEntity.identity.age += 1;
		timeState.currentYear += 1;
		isNewYear = true;
	}

	timeState.activeSeason = determineSeason(timeState.currentMonth);

	// --- NEW: Process Aging and Natural Mortality ---
	const agingResolution = resolveAging(playerEntity, isNewYear);
	if (agingResolution === 'PERMADEATH') {
		return { status: 'PERMADEATH', reason: 'Old Age', updatedPlayer: playerEntity, updatedTime: timeState };
	}

	// --- EXISTING: Process Food and Biological Needs ---
	const bioResolution = resolveBiologicalMatrix(playerEntity, timeState.activeSeason);

	if (bioResolution.status === 'PERMADEATH') {
		return { status: 'PERMADEATH', reason: 'Starvation', updatedPlayer: playerEntity, updatedTime: timeState };
	}

	playerEntity.progression.actionPoints = WORLD.PLAYER.maxAp;
	recalculateEncumbrance(playerEntity);

	// Package the logistics report
	const monthlyReport = {
		foodConsumed: bioResolution.foodConsumed,
		hpChange: bioResolution.hpChange,
		isStarving: playerEntity.biology.isStarving,
		animalsSacrificed: bioResolution.animalsSacrificed,
		meatHarvested: bioResolution.meatHarvested,
		mountStarvationDamage: bioResolution.mountStarvationDamage,
		mountDied: bioResolution.mountDied,
	};

	return { status: 'SUCCESS', monthlyReport, updatedPlayer: playerEntity, updatedTime: timeState };
};
