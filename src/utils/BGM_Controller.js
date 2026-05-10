// File: Client/src/utils/BGM_Controller.js

class BGMController {
	constructor() {
		this.audioA = new Audio();
		this.audioB = new Audio();
		this.audioA.loop = true;
		this.audioB.loop = true;

		this.activeAudio = this.audioA;
		this.inactiveAudio = this.audioB;

		this.targetVolume = 0.3; // Default volume
		this.currentTrack = null;
		this.fadeInterval = null;
		this.isFading = false;
	}

	/**
	 * Plays a track with a specific volume.
	 * @param {string} src - Path to the audio file.
	 * @param {number} volume - Volume level (0.0 to 1.0).
	 */
	play(src, volume = 0.3) {
		if (!src) return;

		// If the track is the same, just adjust the volume dynamically
		if (this.currentTrack === src) {
			this.targetVolume = volume;
			if (!this.isFading) {
				this.activeAudio.volume = volume;
			}
			return;
		}

		this.currentTrack = src;
		this.targetVolume = volume;

		// Swap active and inactive audio elements for crossfade
		const nextAudio = this.inactiveAudio;
		this.inactiveAudio = this.activeAudio;
		this.activeAudio = nextAudio;

		this.activeAudio.src = src;
		this.activeAudio.volume = 0; // Start at 0 for fade-in

		// Browsers require a user gesture before playing audio.
		// This will play as soon as the user clicks anywhere in the game.
		this.activeAudio.play().catch((e) => {
			console.warn('BGM Playback waiting for user interaction:', e);
		});

		this._crossfade();
	}

	_crossfade() {
		this.isFading = true;
		if (this.fadeInterval) clearInterval(this.fadeInterval);

		const fadeDuration = 2000; // 2 seconds transition
		const steps = 20;
		const stepTime = fadeDuration / steps;
		const fadeInStep = this.targetVolume / steps;

		this.fadeInterval = setInterval(() => {
			// Gradually increase active audio volume
			this.activeAudio.volume = Math.min(this.targetVolume, this.activeAudio.volume + fadeInStep);

			// Gradually decrease inactive audio volume
			if (this.inactiveAudio.volume > 0) {
				this.inactiveAudio.volume = Math.max(0, this.inactiveAudio.volume - 0.05);
			}

			if (this.activeAudio.volume >= this.targetVolume && this.inactiveAudio.volume <= 0) {
				clearInterval(this.fadeInterval);
				this.inactiveAudio.pause();
				this.inactiveAudio.src = '';
				this.isFading = false;
			}
		}, stepTime);
	}

	// --- ADDED MISSING STOP FUNCTION ---
	stop() {
		if (this.fadeInterval) clearInterval(this.fadeInterval);
		this.isFading = false;
		this.currentTrack = null;

		this.audioA.pause();
		this.audioB.pause();

		// Clear sources to free up memory
		this.audioA.src = '';
		this.audioB.src = '';
	}
}

export const BGM = new BGMController();
