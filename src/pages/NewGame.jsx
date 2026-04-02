// File: Client/src/pages/NewGame.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import styles from '../styles/NewGame.module.css';
import useGameState from '../store/OMD_State_Manager';
import useAuthStore from '../store/authStore';
import { getStandardErrorMessage } from '../utils/ErrorHandler';
import { getKnightAvatarByGod } from '../utils/AvatarResolver';
import KnightAvatar from '../components/KnightAvatar';

const PANTHEON = [
	{ id: 'PLUTO', name: 'PLUTO', title: 'The World God', religion: 'Old God', objective: 'Master the spatial matrices and shape the raw Iron Nature.' },
	{ id: 'MIDAS', name: 'MIDAS', title: 'The God-King', religion: 'God King', objective: 'Amass ultimate wealth and achieve the Ageless Knight parameter.' },
	{ id: 'THOR', name: 'THOR', title: 'The Iron God', religion: 'New God', objective: 'Achieve absolute martial supremacy and dominate item scaling.' },
	{ id: 'ODIN', name: 'ODIN', title: 'The Life God', religion: 'New God', objective: 'Unify the human entities and rule the social hierarchy.' },
	{ id: 'MARS', name: 'MARS', title: 'The War God', religion: 'New God', objective: 'Dominate conflict parameters and master the art of violence.' },
	{ id: 'SAGA', name: 'SAGA', title: 'The Fate God', religion: 'New God', objective: 'Observe, log, and archive the ultimate historical truth.' },
	{ id: 'CRONOS', name: 'CRONOS', title: 'The Time God', religion: 'New God', objective: 'Transcend the cycles of aging, turns, and seasons.' },
	{ id: 'LOKI', name: 'LOKI', title: 'The Luck God', religion: 'New God', objective: 'Master unpredictability, RNG events, and hazard triggers.' },
	{
		id: 'NONE',
		name: 'NONE',
		title: 'The Godless',
		religion: 'None',
		objective:
			'Reject the meddling of the divine. Rely solely on mortal strength, iron will, and cold steel to survive in a world governed by celestial powers.',
	},
];

const NewGame = () => {
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);

	const [knightName, setKnightName] = useState('');
	const [selectedGod, setSelectedGod] = useState(null);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const initializeNewGame = useGameState((state) => state.initializeNewGame);

	const previewAvatarPath = selectedGod ? getKnightAvatarByGod(selectedGod.name) : 'knights/knight_none.png';

	const handleCreateGame = async (e) => {
		e.preventDefault();
		setError('');

		if (!knightName.trim()) {
			return setError('Your Knight requires a name.');
		}
		if (!selectedGod) {
			return setError('You must pledge allegiance to a Patron God.');
		}

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
				console.log('Save Slot Created:', response.data);
				const savedKnight = response.data;

				useGameState.setState({
					knightId: savedKnight._id || savedKnight.id,
					knightName: savedKnight.knightName || knightName.trim(),
					gameState: generatedGameState,
				});

				navigate('/core-engine');
			}
		} catch (err) {
			setError(getStandardErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.newGamePage}>
			<div className={styles.header}>
				<h1>Forge Your Destiny</h1>
			</div>

			<form
				className={styles.formContainer}
				onSubmit={handleCreateGame}
			>
				{/* Visual Preview Section with Ultra-Premium VFX */}
				<div className={styles.previewSection}>
					<div className='vfx-premium-ring'>
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
					onClick={() => navigate('/main-menu')}
				>
					Return to Menu
				</Button>
			</form>
		</div>
	);
};

export default NewGame;
