// File: Client/src/components/Button.jsx
import { useEffect } from 'react';
import styles from '../styles/Button.module.css';

// Global Web Audio Context and Buffer Cache
let audioContext = null;
const audioBufferCache = {};

const getAudioContext = () => {
    if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    return audioContext;
};

const preloadAudio = async (src) => {
    if (!src || audioBufferCache[src]) return;
    
    audioBufferCache[src] = 'fetching'; 
    
    try {
        const response = await fetch(src);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${src}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const ctx = getAudioContext();
        
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBufferCache[src] = audioBuffer;
        
    } catch (error) {
        console.error('Web Audio API decoding/fetch error:', error);
        delete audioBufferCache[src]; 
    }
};

// --- NOU: Adăugat parametrul de volum (0.0 până la 1.0) ---
const playImmediateSound = (src, volumeLevel) => {
    if (!src) return;
    
    const ctx = getAudioContext();
    
    if (ctx.state === 'suspended') {
        ctx.resume().catch(e => console.warn('Could not resume AudioContext:', e));
    }
    
    const buffer = audioBufferCache[src];
    
    if (buffer && buffer !== 'fetching') {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        // --- NOU: Creăm un GainNode pentru controlul volumului ---
        const gainNode = ctx.createGain();
        
        // Asigurăm că valoarea este între 0 și 1
        const safeVolume = Math.max(0, Math.min(1, volumeLevel)); 
        gainNode.gain.value = safeVolume;
        
        // Conectăm: Sursă -> GainNode (Volum) -> Destinație (Difuzor)
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
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
    soundSrc = '/assets/sounds/click0.wav', 
    style,
    volume = 0.25 // --- NOU: Setat implicit mai încet (ex: 30% din volumul maxim) ---
}) => {
    
    useEffect(() => {
        if (soundSrc) {
            preloadAudio(soundSrc);
        }
    }, [soundSrc]);

    const handleInteraction = (e) => {
        if (!disabled && soundSrc) {
            // Trimitem nivelul de volum dorit
            playImmediateSound(soundSrc, volume);
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