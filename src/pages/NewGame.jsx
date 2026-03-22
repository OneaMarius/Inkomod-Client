// File: Client/src/pages/NewGame.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import styles from '../styles/NewGame.module.css';
import useGameState from '../store/OMD_State_Manager';

// The Divine Pantheon Data Structure
const PANTHEON = [
	{ id: 'PLUTO', name: 'PLUTO', title: 'The World God', religion: 'Old God', objective: 'Master the spatial matrices and shape the raw Iron Nature.' },
	{ id: 'MIDAS', name: 'MIDAS', title: 'The God-King', religion: 'God King', objective: 'Amass ultimate wealth and achieve the Ageless Knight parameter.' },
	{ id: 'THOR', name: 'THOR', title: 'The Iron God', religion: 'New God', objective: 'Achieve absolute martial supremacy and dominate item scaling.' },
	{ id: 'ODIN', name: 'ODIN', title: 'The Life God', religion: 'New God', objective: 'Unify the human entities and rule the social hierarchy.' },
	{ id: 'MARS', name: 'MARS', title: 'The War God', religion: 'New God', objective: 'Dominate conflict parameters and master the art of violence.' },
	{ id: 'SAGA', name: 'SAGA', title: 'The Fate God', religion: 'New God', objective: 'Observe, log, and archive the ultimate historical truth.' },
	{ id: 'CRONOS', name: 'CRONOS', title: 'The Time God', religion: 'New God', objective: 'Transcend the cycles of aging, turns, and seasons.' },
	{ id: 'LOKI', name: 'LOKI', title: 'The Luck God', religion: 'New God', objective: 'Master unpredictability, RNG events, and hazard triggers.' },
];

const NewGame = () => {
	const navigate = useNavigate();
	const [knightName, setKnightName] = useState('');
	const [selectedGod, setSelectedGod] = useState(null);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const initializeNewGame = useGameState((state) => state.initializeNewGame);

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
			// 1. Setup creation parameters
			const creationParams = { name: knightName.trim(), age: 18, patronGod: selectedGod.name, religion: selectedGod.religion };

			const startingNodeId = 'WILD_1'; // Default starting node (Outcast)

			// 2. Execute local initialization engine
			initializeNewGame(creationParams, startingNodeId);

			// 3. Retrieve newly generated state for the payload
			const generatedGameState = useGameState.getState().gameState;

			const payload = { knightName: knightName.trim(), gameState: generatedGameState };

			// 4. Send to server
			const response = await api.post('/knights', payload);

			if (response.status === 201) {
				console.log('Save Slot Created:', response.data);

				const savedKnight = response.data;

				// Update local state with the new database ID while preserving the generated game state
				useGameState.setState({
					knightId: savedKnight._id || savedKnight.id,
					knightName: savedKnight.knightName || knightName.trim(),
					gameState: generatedGameState,
				});

				navigate('/core-engine');
			}
		} catch (err) {
			const errorMessage = err.response?.data?.message || 'Failed to initialize character.';
			setError(errorMessage);
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
						{PANTHEON.map((god) => (
							<div
								key={god.id}
								className={`${styles.godCard} ${selectedGod?.id === god.id ? styles.selected : ''}`}
								onClick={() => setSelectedGod(god)}
							>
								<div className={styles.godName}>{god.name}</div>
								<div className={styles.godTitle}>{god.title}</div>
								<div className={styles.godReligion}>Religion: {god.religion}</div>
								<div className={styles.godObjective}>{god.objective}</div>
							</div>
						))}
					</div>
				</div>

				{error && <p className={styles.errorText}>{error}</p>}

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
