import { WORLD } from '../data/GameWorld.js';

export const calculateLegacyScore = (playerEntity, timeState, deathReason) => {
    const scoreMults = WORLD.PROGRESSION_LOOP.scoreMultipliers;
    const deathMults = WORLD.PROGRESSION_LOOP.deathMultipliers;
    const reasons = WORLD.PROGRESSION_LOOP.deathReasons;

    const totalWealth = playerEntity.inventory.silverCoins;
    const turnsSurvived = timeState.totalMonthsPassed || 1;

    const baseScore = 
        (totalWealth * scoreMults.coinMult) +
        (playerEntity.progression.renown * scoreMults.renMult) +
        (playerEntity.identity.rank * scoreMults.rankMult) +
        (turnsSurvived * scoreMults.turnMult) + 
        (playerEntity.progression.honor * scoreMults.honMult);

    let retentionMultiplier = 1.0;
    
    if (deathReason === reasons.STARVATION) {
        retentionMultiplier = deathMults.starvation;
    } else if (deathReason === reasons.COMBAT) {
        retentionMultiplier = deathMults.combat;
    } else if (deathReason === reasons.AGE) {
        retentionMultiplier = deathMults.natural;
    }

    return Math.floor(baseScore * retentionMultiplier);
};