import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal'; // Import the new modal
import styles from '../styles/LoadGame.module.css';
import useGameState from '../store/OMD_State_Manager';

const LoadGame = () => {
	const navigate = useNavigate();
	const [saves, setSaves] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const loadGameAction = useGameState((state) => state.loadGame);
	const [selectedSaveId, setSelectedSaveId] = useState(null);

	// State to manage the visibility of the delete confirmation modal
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const fetchSaves = async () => {
			try {
				const response = await api.get('/knights');
				setSaves(response.data);
			} catch (err) {
				setError(
					err.response?.data?.message || 'Failed to retrieve save files.',
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSaves();
	}, []);

	const handleContinueJourney = async () => {
		if (!selectedSaveId) return;

		const selectedSaveData = saves.find(
			(save) => save._id === selectedSaveId,
		);

		if (selectedSaveData) {
			try {
				// Execute the timestamp update
				await api.patch(`/knights/${selectedSaveId}/play`);
			} catch (error) {
				console.error('Failed to synchronize timestamp', error);
			}

			// Inject data into memory and proceed
			loadGameAction(selectedSaveData);
			navigate('/core-engine');
		}
	};

	// Opens the modal instead of the browser alert
	const triggerDeletePrompt = () => {
		if (!selectedSaveId) return;
		setIsModalOpen(true);
	};

	// The actual API call is executed only if confirmed from the modal
	const executeDeleteSave = async () => {
		try {
			await api.delete(`/knights/${selectedSaveId}`);

			setSaves(saves.filter((save) => save._id !== selectedSaveId));
			setSelectedSaveId(null);
			setIsModalOpen(false); // Close modal on success
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to delete save file.');
			setIsModalOpen(false); // Close modal on error
		}
	};

	const cancelDelete = () => {
		setIsModalOpen(false);
	};

	const maxSlots = 3;
	const emptySlotsCount = maxSlots - saves.length;

	return (
		<div className={styles.loadGamePage}>
			<div className={styles.header}>
				<h1>Select Chronicles</h1>
			</div>

			{/* The custom confirmation modal */}
			<ConfirmModal
				isOpen={isModalOpen}
				title='Destroy Chronicle?'
				message='This action will permanently erase this Knight from history. It cannot be undone.'
				onConfirm={executeDeleteSave}
				onCancel={cancelDelete}
				confirmText='Erase'
				cancelText='Keep'
			/>

			{isLoading ? (
				<p className={styles.loadingText}>Reading chronicles...</p>
			) : error ? (
				<p className={styles.errorText}>{error}</p>
			) : (
				<>
					<div className={styles.savesContainer}>
						{saves.map((knight) => (
							<div
								key={knight._id}
								className={`${styles.saveCard} ${selectedSaveId === knight._id ? styles.selectedCard : ''}`}
								onClick={() => setSelectedSaveId(knight._id)}
							>
								<div className={styles.saveHeader}>
									<span className={styles.knightName}>
										{knight.knightName}
									</span>
									<span className={styles.knightLevel}>
										Level {knight.level}
									</span>
								</div>
								<div className={styles.saveDetails}>
									<div className={styles.saveDetailItem}>
										<span>Patron God:</span>
										<span>{knight.engineGod}</span>
									</div>
									<div className={styles.saveDetailItem}>
										<span>Location:</span>
										<span>{knight.location.currentZoneName}</span>
									</div>
									<div className={styles.saveDetailItem}>
										<span>Last Played:</span>
										<span>
											{new Date(
												knight.lastPlayed,
											).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						))}

						{Array.from({ length: emptySlotsCount }).map((_, index) => (
							<div key={`empty-${index}`} className={styles.emptySlot}>
								Empty Slot
							</div>
						))}
					</div>

					<div
						className={styles.buttonGroup}
						style={{ flexDirection: 'column' }}
					>
						<Button
							onClick={handleContinueJourney}
							disabled={!selectedSaveId}
						>
							Continue Journey
						</Button>

						<button
							className={styles.deleteButton}
							onClick={triggerDeletePrompt} // Triggers the modal
							disabled={!selectedSaveId}
						>
							Delete Chronicle
						</button>

						<Button
							variant='secondary'
							onClick={() => navigate('/main-menu')}
						>
							Return to Menu
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default LoadGame;
