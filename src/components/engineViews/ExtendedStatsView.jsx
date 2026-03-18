// File: Client/src/components/engineViews/ExtendedStatsView.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameState from '../../store/OMD_State_Manager';
import Button from '../Button';
import ConfirmModal from '../ConfirmModal';
import styles from '../../styles/ExtendedStatsView.module.css';

const ExtendedStatsView = () => {
    const player = useGameState((state) => state.gameState?.player);
    const navigate = useNavigate();
    
    // State pentru controlul vizibilității modalei de exit
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    if (!player) return <div>Loading Parameters...</div>;

    const identity = player.identity;
    const stats = player.stats;
    const progression = player.progression;
    const equipment = player.equipment;

    // Funcția apelată la confirmarea din cadrul modalei
    const handleConfirmExit = () => {
        setIsExitModalOpen(false);
        navigate('/main-menu');
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Entity Parameters</h2>
            <div className={styles.grid}>
                <div>Age: {identity.age}</div>
                <div>STR: {stats.str}</div>
                <div>AGI: {stats.agi}</div>
                <div>INT: {stats.int}</div>
                <div>Renown: {progression.renown}</div>
                <div>Honor: {progression.honor}</div>
            </div>

            <div
                style={{
                    marginTop: '20px',
                    borderTop: '1px solid #222',
                    paddingTop: '15px',
                }}
            >
                <h3
                    style={{
                        color: '#888',
                        marginBottom: '10px',
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                    }}
                >
                    Equipment Status
                </h3>
                <div style={{ marginBottom: '20px' }}>
                    Active Mount:{' '}
                    {equipment.hasMount && equipment.mountItem
                        ? equipment.mountItem.entityName || 'Equipped'
                        : 'None'}
                </div>
            </div>

            {/* System Actions Section */}
            <div
                style={{
                    marginTop: '30px',
                    borderTop: '1px solid #222',
                    paddingTop: '20px',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Button onClick={() => setIsExitModalOpen(true)} variant="secondary">
                    Exit to Main Menu
                </Button>
            </div>

            {/* Inserarea modalei personalizate */}
            <ConfirmModal 
                isOpen={isExitModalOpen}
                title="Exit Game"
                message="Are you sure you want to exit to the Main Menu? Unsaved progress for the current month will be lost."
                confirmText="Exit"
                cancelText="Cancel"
                onConfirm={handleConfirmExit}
                onCancel={() => setIsExitModalOpen(false)}
            />
        </div>
    );
};

export default ExtendedStatsView;