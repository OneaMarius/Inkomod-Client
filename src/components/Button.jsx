// File: Client/src/components/Button.jsx
import styles from '../styles/Button.module.css';

const Button = ({ 
    children, 
    onClick, 
    type = "button", 
    variant = "primary", 
    className = "", 
    disabled = false // NOU: Acceptăm parametrul disabled
}) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} // NOU: Aplicăm blocarea la nivel de DOM
      className={`${styles.customButton} ${styles[variant]} ${className} ${disabled ? styles.disabledState : ''}`}
    >
      <span className={styles.buttonContent}>
        {children}
      </span>
    </button>
  );
};

export default Button;