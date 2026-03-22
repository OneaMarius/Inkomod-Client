// File: src/utils/EconomyUtils.js
// Description: Utility functions for economy-based procedural generation.

/**
 * Calculates a rank based on the regional economy level.
 * Applies a random variance of -1, 0, or +1 and clamps the result between 1 and 5.
 * * @param {number} economyLevel - The regional economy level (1-5).
 * @returns {number} The calculated entity/item rank.
 */
export const calculateRankFromEconomy = (economyLevel) => {
	const variance = Math.floor(Math.random() * 3) - 1;
	const calculatedRank = economyLevel + variance;

	return Math.max(1, Math.min(5, calculatedRank));
};
