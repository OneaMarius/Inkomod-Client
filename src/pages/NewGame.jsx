// File: Client/src/pages/NewGame.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import styles from '../styles/NewGame.module.css';
import useGameState from '../store/OMD_State_Manager';
import useAuthStore from '../store/authStore';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import { getKnightAvatarByGod } from '../utils/AvatarResolver';
import KnightAvatar from '../components/KnightAvatar';
import LoreIntro from '../components/LoreIntro';

const PANTHEON = [
	{
		id: 'PLUTO',
		name: 'PLUTO',
		title: 'The World God',
		religion: 'Old God',
		objective: 'Master the spatial matrices and shape the raw Iron Nature.',
		bonuses: { stats: '+2 STR, +1 AGI, +2 INT', loot: '150 Coins, 15 Food, 5 T-Silver', status: '+10 Honor, +10 Renown' },
	},
	{
		id: 'MIDAS',
		name: 'MIDAS',
		title: 'The God-King',
		religion: 'God King',
		objective: 'Amass ultimate wealth and achieve the Ageless Knight parameter.',
		bonuses: { stats: '-1 STR, +1 AGI, +5 INT', loot: '750 Coins, 3 T-Gold, 10 T-Silver', status: '0 Honor, +15 Renown' },
	},
	{
		id: 'THOR',
		name: 'THOR',
		title: 'The Iron God',
		religion: 'New God',
		objective: 'Achieve absolute martial supremacy and dominate item scaling.',
		bonuses: { stats: '+5 STR, +2 AGI, -2 INT', loot: '50 Coins, 5 Food, 1 Potion', status: '+10 Honor, +20 Renown' },
	},
	{
		id: 'ODIN',
		name: 'ODIN',
		title: 'The Life God',
		religion: 'New God',
		objective: 'Unify the human entities and rule the social hierarchy.',
		bonuses: { stats: '+2 STR, +0 AGI, +3 INT', loot: '100 Coins, 1 Potion', status: '+35 Honor, +35 Renown' },
	},
	{
		id: 'MARS',
		name: 'MARS',
		title: 'The War God',
		religion: 'New God',
		objective: 'Dominate conflict parameters and master the art of violence.',
		bonuses: { stats: '+4 STR, +3 AGI, -2 INT', loot: '5 Food, 3 Potions', status: '-10 Honor, +30 Renown' },
	},
	{
		id: 'SAGA',
		name: 'SAGA',
		title: 'The Fate God',
		religion: 'New God',
		objective: 'Observe, log, and archive the ultimate historical truth.',
		bonuses: { stats: '-2 STR, +2 AGI, +5 INT', loot: '20 Food, 2 Potions', status: '+15 Honor, +10 Renown' },
	},
	{
		id: 'CRONOS',
		name: 'CRONOS',
		title: 'The Time God',
		religion: 'New God',
		objective: 'Transcend the cycles of aging, turns, and seasons.',
		bonuses: { stats: '+3 STR, -1 AGI, +3 INT', loot: '30 Food, 3 T-Silver', status: '+20 Honor, 0 Renown' },
	},
	{
		id: 'LOKI',
		name: 'LOKI',
		title: 'The Luck God',
		religion: 'New God',
		objective: 'Master unpredictability, RNG events, and hazard triggers.',
		bonuses: { stats: '-2 STR, +5 AGI, +2 INT', loot: '350 Coins, 1 T-Gold', status: '-30 Honor, +25 Renown' },
	},
	{
		id: 'NONE',
		name: 'NONE',
		title: 'The Godless',
		religion: 'None',
		objective:
			'Reject the meddling of the divine. Rely solely on mortal strength, iron will, and cold steel to survive in a world governed by celestial powers.',
		bonuses: { stats: '+2 STR, +2 AGI, +1 INT', loot: '50 Coins, 10 Food', status: '0 Honor, 0 Renown' },
	},
];

const NewGame = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const user = useAuthStore((state) => state.user);

	const [showLore, setShowLore] = useState(location.state?.playLore || false);
	const [knightName, setKnightName] = useState('');
	const [selectedGod, setSelectedGod] = useState(null);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	const initializeNewGame = useGameState((state) => state.initializeNewGame);
	const previewAvatarPath = selectedGod ? getKnightAvatarByGod(selectedGod.name) : 'knights/knight_none.png';

	const audioRef = useRef(null);

	useEffect(() => {
		audioRef.current = new Audio('/assets/sounds/gameLore.mp3');
		audioRef.current.volume = 0.5;
		audioRef.current.loop = true;

		const playAudio = async () => {
			try {
				await audioRef.current.play();
			} catch (err) {}
		};
		playAudio();

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = '';
				audioRef.current = null;
			}
		};
	}, []);

	const fadeOutAndNavigate = (callback) => {
		setIsExiting(true);

		if (audioRef.current && !audioRef.current.paused) {
			const fadeDuration = 2000;
			const intervalTime = 16;
			const initialVolume = audioRef.current.volume;
			const volumeStep = initialVolume / (fadeDuration / intervalTime);

			const fadeInterval = setInterval(() => {
				if (audioRef.current) {
					let newVolume = audioRef.current.volume - volumeStep;

					if (newVolume <= 0.02) {
						audioRef.current.volume = 0;
						audioRef.current.pause();
						clearInterval(fadeInterval);
						callback();
					} else {
						audioRef.current.volume = newVolume;
					}
				} else {
					clearInterval(fadeInterval);
					callback();
				}
			}, intervalTime);
		} else {
			setTimeout(callback, 2000);
		}
	};

	const handleLoreComplete = () => {
		setShowLore(false);
	};

	const handleCreateGame = async (e) => {
		e.preventDefault();
		setError('');

		if (!knightName.trim()) return setError('Your Knight requires a name.');
		if (!selectedGod) return setError('You must pledge allegiance to a Patron God.');

		setIsLoading(true);

		try {
			const calculatedAvatar = getKnightAvatarByGod(selectedGod.name);
			const creationParams = { name: knightName.trim(), age: 18, patronGod: selectedGod.name, religion: selectedGod.religion, avatar: calculatedAvatar };
			const startingNodeId = 'WILD_1';

			initializeNewGame(creationParams, startingNodeId);
			const generatedGameState = useGameState.getState().gameState;

			if (!generatedGameState.player.identity.avatar || generatedGameState.player.identity.avatar === 'default_knight.png') {
				generatedGameState.player.identity.avatar = calculatedAvatar;
			}

			const payload = { knightName: knightName.trim(), gameState: generatedGameState };
			const response = await api.post('/knights', payload);

			if (response.status === 201) {
				const savedKnight = response.data;
				useGameState.setState({
					knightId: savedKnight._id || savedKnight.id,
					knightName: savedKnight.knightName || knightName.trim(),
					gameState: generatedGameState,
				});

				fadeOutAndNavigate(() => navigate('/core-engine'));
			}
		} catch (err) {
			setError(getStandardErrorMessage(err));
			setIsLoading(false);
		}
	};

	return (
		<div
			className={styles.newGamePage}
			style={{
				position: 'relative',
				maxHeight: showLore ? '100vh' : '100%',
				overflowY: showLore ? 'hidden' : 'auto',
				paddingBottom: showLore ? '0' : '80px',
				opacity: isExiting ? 0 : 1,
				transition: 'opacity 1s ease',
				pointerEvents: isExiting ? 'none' : 'auto',
			}}
		>
			{showLore && <LoreIntro onComplete={handleLoreComplete} />}

			<div className={styles.header}>
				<h1>Forge Your Destiny</h1>
			</div>

			<form
				className={styles.formContainer}
				onSubmit={handleCreateGame}
			>
				<div className={styles.previewSection}>
					<div>
						<KnightAvatar
							src={`/avatars/${previewAvatarPath}`}
							visualProfile={user?.visualProfile}
							size={160}
						/>
					</div>
				</div>

				<div className={styles.inputGroup}>
					<label htmlFor='knightName'>Knight Identity</label>
					<input
						id='knightName'
						type='text'
						placeholder='Enter Name (Max 20 chars)'
						maxLength='20'
						value={knightName}
						onChange={(e) => setKnightName(e.target.value)}
						required
						autoComplete='off'
					/>
				</div>

				{error && (
					<div className='system-error-box'>
						<span className='error-icon'>⚠️</span>
						{error}
					</div>
				)}

				<div className={styles.inputGroup}>
					<label>Select Patron God</label>
					<div className={styles.gridContainer}>
						{PANTHEON.map((god) => {
							const cardAvatarPath = getKnightAvatarByGod(god.name);
							return (
								<div
									key={god.id}
									className={`${styles.godCard} ${selectedGod?.id === god.id ? styles.selected : ''}`}
									onClick={() => setSelectedGod(god)}
								>
									<div className={styles.cardHeaderRow}>
										<div>
											<div className={`${styles.godName} ${styles.godNameContainer}`}>{god.name}</div>
											<div className={styles.godTitle}>{god.title}</div>
										</div>
										<KnightAvatar
											src={`/avatars/${cardAvatarPath}`}
											visualProfile={user?.visualProfile}
											size={48}
										/>
									</div>
									<div className={styles.godReligion}>Religion: {god.religion}</div>
									<div className={styles.godObjective}>{god.objective}</div>

									{/* NOU: Afișarea transparentă a bonusurilor */}
									<div className={styles.godReligion}>
										<div>
											<strong>Stats:</strong> {god.bonuses.stats}
										</div>
										<div>
											<strong>Start:</strong> {god.bonuses.loot}
										</div>
										<div>
											<strong>Status:</strong> {god.bonuses.status}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{error && (
					<div className='system-error-box'>
						<span className='error-icon'>⚠️</span>
						{error}
					</div>
				)}

				<Button
					type='submit'
					disabled={isLoading}
				>
					{isLoading ? 'Writing Fate...' : 'Begin Journey'}
				</Button>

				<Button
					variant='secondary'
					onClick={() => fadeOutAndNavigate(() => navigate('/main-menu'))}
				>
					Return to Menu
				</Button>
			</form>
		</div>
	);
};

export default NewGame;
