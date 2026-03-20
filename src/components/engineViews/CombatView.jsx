// File: Client/src/components/engineViews/CombatView.jsx
import useGameState from '../../store/OMD_State_Manager';

const CombatView = () => {
    const cancelEncounter = useGameState((state) => state.cancelEncounter);

    return (
        <div style={{ textAlign: 'center', padding: '50px', color: '#ff4444' }}>
            <h2>COMBAT ENGAGEMENT</h2>
            <p>The combat interface is currently under construction.</p>
            <button
                onClick={cancelEncounter}
                style={{
                    marginTop: '30px',
                    padding: '10px 20px',
                    backgroundColor: '#2a1111',
                    color: '#ff4444',
                    border: '1px solid #ff4444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                }}
            >
                Flee Encounter (Debug)
            </button>
        </div>
    );
};

export default CombatView;