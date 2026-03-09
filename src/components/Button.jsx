import styles from '../styles/Button.module.css';

const Button = ({ children, onClick, type = "button", variant = "primary", className = "" }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${styles.customButton} ${styles[variant]} ${className}`}
    >
      <span className={styles.buttonContent}>
        {children}
      </span>
    </button>
  );
};

export default Button;