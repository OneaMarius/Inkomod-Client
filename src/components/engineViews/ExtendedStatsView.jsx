import useGameState from '../../store/OMD_State_Manager';
import styles from '../../styles/ExtendedStatsView.module.css';
import Button from '../Button';

const ExtendedStatsView = () => {
    const biology = useGameState((state) => state.player.biology);
    const identity = useGameState((state) => state.player.identity);
    const equipped = useGameState((state) => state.player.equipped);
    
    const debugEquipMount = useGameState((state) => state.debugEquipMount);
    const debugUnequipMount = useGameState((state) => state.debugUnequipMount);

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Entity Parameters</h2>
            <div className={styles.grid}>
                <div>Age: {biology.age}</div>
                <div>STR: {biology.str}</div>
                <div>AGI: {biology.agi}</div>
                <div>INT: {biology.int}</div>
                <div>Renown: {identity.ren}</div>
                <div>Honor: {identity.hon}</div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '15px' }}>
                <h3 style={{ color: '#888', marginBottom: '10px', fontSize: '1rem', textTransform: 'uppercase' }}>
                    System Debug
                </h3>
                <div style={{ marginBottom: '10px' }}>
                    Active Mount: {equipped.mount ? equipped.mount.entityName : 'None'}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button onClick={debugEquipMount} disabled={!!equipped.mount}>
                        Equip Test Mount
                    </Button>
                    <Button onClick={debugUnequipMount} disabled={!equipped.mount}>
                        Unequip Test Mount
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExtendedStatsView;