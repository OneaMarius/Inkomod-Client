// File: Client/src/pages/MainMenu.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import useGameState from '../store/OMD_State_Manager';
import Button from '../components/Button';
import styles from '../styles/MainMenu.module.css';
import PlayerAvatar from '../components/PlayerAvatar';

import { GAME_CONFIG } from '../config/gameConfig';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import VideoTransition from '../components/VideoTransition';

const MainMenu = () => {
	const navigate = useNavigate();

	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);
	const loadGameAction = useGameState((state) => state.loadGame);

	const [hasSaves, setHasSaves] = useState(false);
	const [latestSave, setLatestSave] = useState(null);
	const [error, setError] = useState('');
	const [showTransition, setShowTransition] = useState(false);

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
			} catch (err) {
				const cleanError = getStandardErrorMessage(err);
				setError(cleanError);
			}
		};

		checkExistingSaves();
	}, []);

	const handleContinueJourneyClick = () => {
		if (latestSave && !showTransition) {
			setShowTransition(true);
		}
	};

	const executeContinueJourney = async () => {
		if (latestSave) {
			setError('');
			try {
				await api.patch(`/knights/${latestSave._id}/play`);
			} catch (err) {
				console.error('Failed to synchronize timestamp', err);
			}

			loadGameAction(latestSave);
			navigate('/core-engine');
		}
	};

	const handleNewGame = () => {
		navigate('/new-game', { state: { playLore: true } });
	};

	const handleLoadGame = () => {
		navigate('/load-game');
	};

	const handleLeaderboard = () => {
		navigate('/hall-of-fame');
	};

	// Handler for the new Game Tips routing
	const handleGameTips = () => {
		navigate('/game-tips');
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<>
			{showTransition && (
				<VideoTransition
					videoSrc='/assets/videos/inkomod-transition2.mp4'
					onTransitionPoint={executeContinueJourney}
				/>
			)}

			<div className={`screen-container ${styles.menuPage}`}>
				<div className={styles.menuHeader}>
					<h1>INKoMOD</h1>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '12px',
							margin: '15px 0',
						}}
					>
						<PlayerAvatar visualProfile={user?.visualProfile} size={64} />
						<p style={{ margin: 0 }}>
							Welcome, {user?.username || 'Knight'}
						</p>
					</div>
				</div>

				{error && (
					<div
						className='system-error-box'
						style={{
							width: '80%',
							maxWidth: '350px',
							margin: '0 auto 20px auto',
						}}
					>
						<span className='error-icon'></span>
						{error}
					</div>
				)}

				<div className={styles.menuOptions}>
					<Button
						onClick={handleContinueJourneyClick}
						disabled={showTransition || !hasSaves}
						style={{
							opacity: !hasSaves ? 0.5 : 1,
							cursor: !hasSaves ? 'not-allowed' : 'pointer',
						}}
					>
						Continue Journey
					</Button>
					<Button onClick={handleNewGame} disabled={showTransition}>
						New Game
					</Button>
					<Button onClick={handleLoadGame} disabled={showTransition}>
						Load Game
					</Button>
					<Button onClick={handleLeaderboard} disabled={showTransition}>
						Leaderboard
					</Button>

					{/* New Game Tips Button */}
					<Button onClick={handleGameTips} disabled={showTransition}>
						Game Tips
					</Button>
				</div>

				<div className={styles.menuFooter}>
					<button
						className={styles.logoutButton}
						onClick={handleLogout}
						disabled={showTransition}
					>
						Logout
					</button>
				</div>

				<div className='versionText'>v. {GAME_CONFIG.displayVersion}</div>
			</div>
		</>
	);
};

export default MainMenu;
