// File: Client/src/pages/GameTips.jsx
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { DB_GAME_TIPS } from '../data/DB_GameTips';
import styles from '../styles/GameTips.module.css';

const GameTips = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/main-menu');
    };

    return (
        <div className={`screen-container ${styles.tipsContainer}`}>
            <div className={styles.header}>
                <h1>Codex: Game Mechanics</h1>
                <p>Knowledge is survival.</p>
            </div>

            <div className={styles.tipsList}>
                {DB_GAME_TIPS.map((tip, index) => (
                    <div key={index} className={styles.tipCard}>
                        <div className={styles.tipHeader}>
                            <span className={styles.tipNumber}>{tip.number}</span>
                            <span className={styles.tipLabel}>{tip.label}</span>
                        </div>
                        <div className={styles.tipText}>
                            {tip.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.footer}>
                <Button onClick={handleBack} variant="secondary">
                    Back to Menu
                </Button>
            </div>
        </div>
    );
};

export default GameTips;