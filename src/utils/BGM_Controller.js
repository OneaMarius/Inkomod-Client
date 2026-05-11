// File: Client/src/utils/BGM_Controller.js

class BGMController {
	constructor() {
		this.audioA = new Audio();
		this.audioB = new Audio();
		this.audioA.loop = true;
		this.audioB.loop = true;

		this.activeAudio = this.audioA;
		this.inactiveAudio = this.audioB;

		this.targetVolume = 0.15;
		this.currentTrack = null;
		this.fadeInterval = null;
		this.isFading = false;
		this.hasStartedPlayingNew = false;
	}

	play(src, volume = 0.15) {
		if (!src) return;

		if (this.currentTrack === src) {
			this.targetVolume = volume;
			if (!this.isFading) {
				this.activeAudio.volume = volume;
			}
			return;
		}

		this.currentTrack = src;
		this.targetVolume = volume;

		if (this.isFading && this.activeAudio.volume === 0) {
			this.activeAudio.src = src;
			this.hasStartedPlayingNew = false;
		} else {
			const nextAudio = this.inactiveAudio;
			this.inactiveAudio = this.activeAudio;
			this.activeAudio = nextAudio;

			this.activeAudio.src = src;
			this.activeAudio.volume = 0;
			this.hasStartedPlayingNew = false;
		}

		this._crossfade();
	}

	_crossfade() {
		this.isFading = true;
		if (this.fadeInterval) clearInterval(this.fadeInterval);

		const stepTime = 100;
		const fadeOutStep = Math.max(0.01, this.inactiveAudio.volume / 15);
		const fadeInStep = Math.max(0.01, this.targetVolume / 15);

		this.fadeInterval = setInterval(() => {
			// PHASE 1: Decrease inactive audio until silent
			if (this.inactiveAudio.volume > 0) {
				const nextVol = this.inactiveAudio.volume - fadeOutStep;
				this.inactiveAudio.volume = Math.max(0, nextVol);
			}
			// PHASE 2: Start new audio and fade it in
			else {
				if (!this.inactiveAudio.paused) {
					this.inactiveAudio.pause();
					this.inactiveAudio.src = '';
				}

				if (!this.hasStartedPlayingNew) {
					this.hasStartedPlayingNew = true;
					this.activeAudio.play().catch((e) => {
						console.warn('BGM Playback waiting for user interaction:', e);
					});
				}

				const nextVol = this.activeAudio.volume + fadeInStep;
				this.activeAudio.volume = Math.min(this.targetVolume, nextVol);

				if (this.activeAudio.volume >= this.targetVolume) {
					this.activeAudio.volume = this.targetVolume;
					clearInterval(this.fadeInterval);
					this.isFading = false;
				}
			}
		}, stepTime);
	}

	stop() {
		if (this.fadeInterval) clearInterval(this.fadeInterval);
		this.isFading = false;
		this.currentTrack = null;
		this.hasStartedPlayingNew = false;

		this.audioA.pause();
		this.audioB.pause();

		this.audioA.src = '';
		this.audioB.src = '';
	}
}

export const BGM = new BGMController();
