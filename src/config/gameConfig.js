// File: Client/src/config/gameConfig.js

export const GAME_CONFIG = {
	versionMode: 'Alpha', // e.g., Alpha, Beta, Final
	versionNumber: '0.8.5', // Semantic versioning format

	// Getter method to return the formatted string
	get displayVersion() {
		return `${this.versionMode} ${this.versionNumber}`;
	},
};
