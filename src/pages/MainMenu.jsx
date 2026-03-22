// File: Client/src/pages/MainMenu.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import styles from '../styles/MainMenu.module.css';

// Import the game configuration
import { GAME_CONFIG } from '../config/gameConfig';

const MainMenu = () => {
    const navigate = useNavigate();
    
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const loadGameAction = useGameState((state) => state.loadGame);

    const [hasSaves, setHasSaves] = useState(false);
    const [latestSave, setLatestSave] = useState(null);

    useEffect(() => {
        const checkExistingSaves = async () => {
            try {
                const response = await api.get('/knights');
                if (response.data && response.data.length > 0) {
                    setHasSaves(true);
                    setLatestSave(response.data[0]);
                } else {
                    setHasSaves(false);
                    setLatestSave(null);
                }
            } catch (error) {
                console.error('Failed to verify save slots', error);
            }
        };

        checkExistingSaves();
    }, []);

    const handleContinueJourney = async () => {
        if (latestSave) {
            try {
                await api.patch(`/knights/${latestSave._id}/play`);
            } catch (error) {
                console.error('Failed to synchronize timestamp', error);
            }
            
            loadGameAction(latestSave);
            navigate('/core-engine');
        }
    };

    const handleNewGame = () => {
        navigate('/new-game');
    };

    const handleLoadGame = () => {
        navigate('/load-game');
    };

    const handleLeaderboard = () => {
        console.log('Load Leaderboard Data');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`screen-container ${styles.menuPage}`}>
            <div className={styles.menuHeader}>
                <h1>INKoMOD</h1>
                <p>Welcome, {user?.username || 'Knight'}</p>
            </div>

            <div className={styles.menuOptions}>
                {hasSaves && (
                    <Button onClick={handleContinueJourney}>Continue Journey</Button>
                )}
                <Button onClick={handleNewGame}>New Game</Button>
                <Button onClick={handleLoadGame}>Load Game</Button>
                <Button onClick={handleLeaderboard}>Leaderboard</Button>
            </div>

            <div className={styles.menuFooter}>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="versionText">
                v. {GAME_CONFIG.displayVersion}
            </div>
        </div>
    );
};

export default MainMenu;