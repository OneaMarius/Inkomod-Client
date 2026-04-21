// File: Client/src/components/Button.jsx

import styles from '../styles/Button.module.css';

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    className = '', 
    disabled = false,
    soundSrc = '/assets/sounds/click0.wav' 
}) => {
    
    const handleInteraction = (e) => {
        if (!disabled && soundSrc) {
            const audioInstance = new Audio(soundSrc);
            audioInstance.play().catch((error) => {
                console.warn('Audio playback prevented by browser policy:', error);
            });
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
        >
            <span className={styles.buttonContent}>{children}</span>
        </button>
    );
};

export default Button;