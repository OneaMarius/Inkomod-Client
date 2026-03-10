import useGameState from '../../store/OMD_State_Manager';

const GameViewport = () => {
  const location = useGameState((state) => state.location);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h2 style={{ color: '#555', textTransform: 'uppercase', textAlign: 'center', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
        Current Location: {location.currentZoneName.replace(/_/g, ' ')}
      </h2>
      <p>Region: {location.currentZoneClass}</p>
      <p>Economy Level: {location.currentZoneEconomyLevel}</p>
      {/* Future map or event rendering logic goes here */}
    </div>
  );
};

export default GameViewport;