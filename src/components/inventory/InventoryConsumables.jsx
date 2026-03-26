// File: Client/src/components/inventory/InventoryConsumables.jsx
import { useState } from 'react';
import styles from '../../styles/InventoryView.module.css';
import { WORLD } from '../../data/GameWorld.js';

const InventoryConsumables = ({ potionsAvailable, maxHealingPotions, canHeal, useHealingPotion }) => {
	// Default state set to false (collapsed)
	const [isConsumablesOpen, setIsConsumablesOpen] = useState(false);

	return (
		<>
			<div
				className={styles.collapsibleHeader}
				onClick={() => setIsConsumablesOpen(!isConsumablesOpen)}
			>
				<div className={styles.headerLeftGroup}>
					<h3 className={styles.sectionTitleCollapsible}>
						Consumables [{potionsAvailable}/{maxHealingPotions}]
					</h3>
				</div>
				<div className={styles.headerRightGroup}>
					<span className={styles.toggleIcon}>{isConsumablesOpen ? '▲' : '▼'}</span>
				</div>
			</div>

			{isConsumablesOpen && (
				<div className={styles.consumableCard}>
					<div className={styles.consumableInfo}>
						<div className={styles.itemName}>
							Healing Potion <span className={styles.consumableCount}>x{potionsAvailable}</span>
						</div>
						<div className={styles.consumableDesc}>Restores +{WORLD.COMBAT.actionModifiers.healHpAmount} HP. Cannot heal persistent wounds.</div>
					</div>
					<button
						className={`${styles.actionButton} ${canHeal ? styles.btnHealActive : styles.btnHealInactive}`}
						onClick={useHealingPotion}
						disabled={!canHeal}
					>
						Consume
					</button>
				</div>
			)}
		</>
	);
};

export default InventoryConsumables;
