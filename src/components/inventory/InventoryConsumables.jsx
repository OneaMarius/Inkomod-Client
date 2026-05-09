// File: Client/src/components/inventory/InventoryConsumables.jsx
import { useState, useEffect } from 'react';
import styles from '../../styles/InventoryView.module.css';
import { WORLD } from '../../data/GameWorld.js';
import Button from '../Button';
import { preloadAudio, playImmediateSound } from '../Button';

const InventoryConsumables = ({
	potionsAvailable,
	maxHealingPotions,
	canHeal,
	useHealingPotion,
}) => {
	// Default state set to false (collapsed)
	const [isConsumablesOpen, setIsConsumablesOpen] = useState(false);
	const soundPath = '/assets/sounds/click0.wav';
	const volumeLevel = 0.25;
	useEffect(() => {
		preloadAudio(soundPath);
	}, []);
	return (
		<>
			<div
				className={styles.collapsibleHeader}
				onClick={() => {
					setIsConsumablesOpen(!isConsumablesOpen);
					playImmediateSound(soundPath, volumeLevel);
				}}
			>
				<div className={styles.headerLeftGroup}>
					<h3 className={styles.sectionTitleCollapsible}>
						Consumables [{potionsAvailable}/{maxHealingPotions}]
					</h3>
				</div>
				<div className={styles.headerRightGroup}>
					<span className={isConsumablesOpen ? styles.toggleIconON : styles.toggleIconOFF}>
						{isConsumablesOpen ? 'ON' : 'OFF'}
					</span>
				</div>
			</div>

			{isConsumablesOpen && (
				<div className={styles.consumableCard}>
					<div className={styles.consumableInfo}>
						<div className={styles.itemName}>
							Healing Potion{' '}
							<span className={styles.consumableCount}>
								x{potionsAvailable}
							</span>
						</div>
						<div className={styles.consumableDesc}>
							Restores +{WORLD.COMBAT.actionModifiers.healHpAmount} HP.
							Cannot heal persistent wounds.
						</div>
					</div>
					<Button
						className={`${styles.actionButton} ${canHeal ? styles.btnHealActive : styles.btnHealInactive}`}
						onClick={useHealingPotion}
						disabled={!canHeal}
					>
						Consume
					</Button>
				</div>
			)}
		</>
	);
};

export default InventoryConsumables;
