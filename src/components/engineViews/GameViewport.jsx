// File: Client/src/components/engineViews/GameViewport.jsx
import useGameState from '../../store/OMD_State_Manager';

const GameViewport = () => {
	// Accesăm datele din interiorul noului obiect gameState
	const location = useGameState((state) => state.gameState?.location);

	if (!location) return <div>Loading Viewport...</div>;

	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				gap: '15px',
			}}
		>
			<h2
				style={{
					color: '#555',
					textTransform: 'uppercase',
					textAlign: 'center',
					borderBottom: '1px solid #222',
					paddingBottom: '10px',
				}}
			>
				Current Location:{' '}
				{(
					location.currentZoneName ||
					location.currentWorldId ||
					'Unknown'
				).replace(/_/g, ' ')}
			</h2>
			<p>Region: {location.currentZoneClass || 'Unknown'}</p>
			<p>Economy Level: {location.currentZoneEconomyLevel || 3}</p>
			{/* Future map or event rendering logic goes here */}
		</div>
	);
};

export default GameViewport;
