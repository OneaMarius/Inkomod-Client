// File: Client/src/components/Button.jsx
import styles from '../styles/Button.module.css';

// Global cache to store preloaded audio instances
const audioCache = {};

const playClickSound = (src) => {
    if (!src) return;

    // Instantiate and preload the audio file only once per source URL
    if (!audioCache[src]) {
        audioCache[src] = new Audio(src);
        audioCache[src].preload = 'auto';
    }

    // Clone the cached audio node to allow immediate playback and overlapping clicks
    const soundClone = audioCache[src].cloneNode();
    soundClone.play().catch((error) => {
        console.warn('Audio playback prevented by browser policy:', error);
    });
};

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    className = '', 
    disabled = false,
    soundSrc = '/assets/sounds/click0.wav',
    style 
}) => {
    
    const handleInteraction = (e) => {
        if (!disabled && soundSrc) {
            playClickSound(soundSrc);
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