// File: Client/src/components/Button.jsx
import { useEffect } from 'react';
import styles from '../styles/Button.module.css';

// Global Web Audio Context and Buffer Cache
let audioContext = null;
const audioBufferCache = {};

const initAudioContext = () => {
	if (!audioContext) {
		// Support for standard and Safari implementations
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		audioContext = new AudioContext();
	}
	// Mobile browsers suspend audio contexts until the first user interaction
	if (audioContext.state === 'suspended') {
		audioContext.resume();
	}
};

const preloadAudio = async (src) => {
	if (!src || audioBufferCache[src]) return;

	// Mark as fetching to prevent duplicate network requests
	audioBufferCache[src] = 'fetching';

	try {
		const response = await fetch(src);
		const arrayBuffer = await response.arrayBuffer();

		initAudioContext();
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

		audioBufferCache[src] = audioBuffer;
	} catch (error) {
		console.error('Web Audio API decoding error:', error);
		delete audioBufferCache[src];
	}
};

const playImmediateSound = (src) => {
	if (!src) return;

	initAudioContext();
	const buffer = audioBufferCache[src];

	if (buffer && buffer !== 'fetching') {
		// Create a new lightweight source node for immediate playback
		const source = audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(audioContext.destination);
		source.start(0);
	}
};

const Button = ({
	children,
	onClick,
	type = 'button',
	variant = 'primary',
	className = '',
	disabled = false,
	soundSrc = '/assets/sounds/click2.wav',
	style,
}) => {
	useEffect(() => {
		// Preload the audio file into RAM when the button mounts
		if (soundSrc) {
			preloadAudio(soundSrc);
		}
	}, [soundSrc]);

	const handleInteraction = (e) => {
		if (!disabled && soundSrc) {
			playImmediateSound(soundSrc);
		}

		if (onClick) {
			onClick(e);
		}
	};

	return (
		<button
			type={type}
			onClick={handleInteraction}
			disabled={disabled}
			className={`${styles.customButton} ${styles[variant]} ${className} ${disabled ? styles.disabledState : ''}`}
			style={style}
		>
			<span className={styles.buttonContent}>{children}</span>
		</button>
	);
};

export default Button;
