import useGameState from '../../store/OMD_State_Manager';
import styles from '../../styles/InventoryView.module.css';
import Button from '../Button'; // Import the Button component

const InventoryView = () => {
  const inventory = useGameState((state) => state.player.inventory);
  
  // Extract debug actions
  const debugAddMass = useGameState((state) => state.debugAddMass);
  const debugRemoveMass = useGameState((state) => state.debugRemoveMass);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Asset Management</h2>
      
      <div className={styles.grid}>
        <div>Silver Coins: {inventory.silverCoins}</div>
        <div>Food: {inventory.food}</div>
        <div>Mass: {inventory.currentMass} / {inventory.maxCapacity} kg</div>
        <div style={{ color: inventory.encumbrancePenalty > 0 ? '#ff4444' : 'inherit' }}>
          AP Penalty: +{inventory.encumbrancePenalty}
        </div>
      </div>

      {/* System Debug Section */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '15px' }}>
        <h3 style={{ color: '#888', marginBottom: '10px', fontSize: '1rem', textTransform: 'uppercase' }}>
            Logistics Debug
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
            Injecting 5000 coins adds 50kg of mass.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={debugAddMass}>
                +50kg (Add Coins)
            </Button>
            <Button onClick={debugRemoveMass} disabled={inventory.silverCoins < 5000}>
                -50kg (Remove Coins)
            </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;