import useGameState from '../../store/OMD_State_Manager';
import styles from '../../styles/InventoryView.module.css';

const InventoryView = () => {
  const inventory = useGameState((state) => state.player.inventory);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Asset Management</h2>
      <div className={styles.grid}>
        <div>Silver Coins: {inventory.silverCoins}</div>
        <div>Food: {inventory.food}</div>
        <div>Current Mass: {inventory.currentMass} kg</div>
        <div>Encumbered: {inventory.isEncumbered ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default InventoryView;