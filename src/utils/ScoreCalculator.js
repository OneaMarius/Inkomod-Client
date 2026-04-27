import { WORLD } from '../data/GameWorld.js';

export const calculateLegacyScore = (playerEntity, timeState, endReason) => {
	const scoreMults = WORLD.PROGRESSION_LOOP.scoreMultipliers;
	const deathMults = WORLD.PROGRESSION_LOOP.deathMultipliers;
	const victoryMults = WORLD.PROGRESSION_LOOP.victoryMultipliers;

	const dReasons = WORLD.PROGRESSION_LOOP.deathReasons;
	const vReasons = WORLD.PROGRESSION_LOOP.victoryReasons;

	const totalWealth = playerEntity.inventory.silverCoins || 0;
	const turnsSurvived = timeState.totalMonthsPassed || 1;
	const totalTrophies = playerEntity.inventory.trophySlots ? playerEntity.inventory.trophySlots.length : 0;

	const baseScore =
		totalWealth * scoreMults.coinMult +
		playerEntity.progression.renown * scoreMults.renMult +
		playerEntity.identity.rank * scoreMults.rankMult +
		turnsSurvived * scoreMults.turnMult +
		playerEntity.progression.honor * scoreMults.honMult +
		totalTrophies * scoreMults.trophyMult;

	let finalMultiplier = 1.0;

	if (endReason === dReasons.STARVATION) {
		finalMultiplier = deathMults.starvation;
	} else if (endReason === dReasons.COMBAT) {
		finalMultiplier = deathMults.combat;
	} else if (endReason === dReasons.AGE) {
		finalMultiplier = deathMults.natural;
	} else if (endReason === vReasons.CHAMPION) {
		finalMultiplier = victoryMults.standard_champion;
	} else if (endReason === vReasons.GODSLAYER) {
		const extraTrophies = Math.max(0, totalTrophies - 7);
		finalMultiplier = victoryMults.standard_champion + victoryMults.godslayer_increment * extraTrophies;
	}

	return Math.floor(baseScore * finalMultiplier);
};
