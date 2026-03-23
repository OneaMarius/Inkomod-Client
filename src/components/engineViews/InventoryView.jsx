// File: Client/src/components/engineViews/InventoryView.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import Button from '../Button';
import ConfirmModal from '../ConfirmModal';
import styles from '../../styles/InventoryView.module.css';
import { WORLD } from '../../data/GameWorld.js';

const InventoryView = () => {
	const player = useGameState((state) => state.gameState?.player);
	const time = useGameState((state) => state.gameState?.time);

	const doEquipItem = useGameState((state) => state.doEquipItem);
	const doUnequipItem = useGameState((state) => state.doUnequipItem);
	const doSlaughterAnimal = useGameState((state) => state.doSlaughterAnimal);
	const doDropItem = useGameState((state) => state.doDropItem);

	// NEW: Access the healing potion function from the store
	const useHealingPotion = useGameState((state) => state.useHealingPotion);

	const mountCarryWeight = WORLD.LOGISTICS.mountCarryWeight;
	const transitConstants = WORLD.SPATIAL.transit;

	const debugGenerateItem = useGameState((state) => state.debugGenerateItem);
	const debugGenerateAnimal = useGameState((state) => state.debugGenerateAnimal);
	const debugAddResources = useGameState((state) => state.debugAddResources);
	const debugGenerateLoot = useGameState((state) => state.debugGenerateLoot);
	const debugFullRestore = useGameState((state) => state.debugFullRestore);

	// Component State Management
	const [isSlaughterModalOpen, setIsSlaughterModalOpen] = useState(false);
	const [animalToSlaughter, setAnimalToSlaughter] = useState(null);

	const [isDropModalOpen, setIsDropModalOpen] = useState(false);
	const [itemToDrop, setItemToDrop] = useState(null);

	if (!player) return <div className={styles.loading}>Loading Inventory...</div>;

	const inventory = player.inventory;
	const logistics = player.logistics;
	const equipment = player.equipment;

	// Time and Season Logistics Calculations
	const currentMonth = time?.currentMonth || WORLD.TIME.startMonth;
	let nextMonth = currentMonth + 1;
	if (nextMonth > WORLD.TIME.monthsPerYear) {
		nextMonth = 1;
	}

	const determineSeason = (month) => {
		const seasons = WORLD.TIME.seasons;
		if (month >= seasons.spring.startMonth && month <= seasons.spring.endMonth) return 'spring';
		if (month >= seasons.summer.startMonth && month <= seasons.summer.endMonth) return 'summer';
		if (month >= seasons.autumn.startMonth && month <= seasons.autumn.endMonth) return 'autumn';
		return 'winter';
	};

	const nextSeason = determineSeason(nextMonth);
	const seasonMult = WORLD.TIME.seasons[nextSeason]?.foodConsumptionMult || 1.0;

	// Synchronized Engine Consumption Formulas
	const playerBaseFood = WORLD.PLAYER.baseFoodNeed || 2;
	const playerFoodCost = Math.ceil(playerBaseFood * seasonMult);

	const mountBaseFood = equipment.hasMount && equipment.mountItem ? equipment.mountItem.logistics?.foodConsumption || 1 : 0;
	const mountFoodCost = equipment.hasMount ? Math.ceil(mountBaseFood * seasonMult) : 0;

	const baseCaravanFood = inventory.animalSlots.reduce((sum, animal) => {
		return sum + (animal.logistics?.foodConsumption || 1);
	}, 0);
	const caravanFoodCost = Math.ceil(baseCaravanFood * seasonMult);

	const totalFoodCost = playerFoodCost + mountFoodCost + caravanFoodCost;

	// AP Reduction Calculation
	const calculateMountReductionPct = (agiValue) => {
		const factor = Math.max(
			transitConstants.mountMaxReductionFactor,
			transitConstants.mountMinReductionFactor - agiValue * transitConstants.mountAgiMultiplier,
		);
		return Math.round((1 - factor) * 100);
	};

	const activeMountAgi = equipment.hasMount && equipment.mountItem ? equipment.mountItem.stats?.innateAgi || equipment.mountItem.stats?.agi || 5 : 0;
	const activeMountReductionPct = equipment.hasMount ? calculateMountReductionPct(activeMountAgi) : 0;

	// Modal Handlers
	const handleConfirmSlaughter = () => {
		if (animalToSlaughter !== null) {
			doSlaughterAnimal(animalToSlaughter.index);
		}
		setIsSlaughterModalOpen(false);
		setAnimalToSlaughter(null);
	};

	const handleConfirmDrop = () => {
		if (itemToDrop !== null) {
			doDropItem(itemToDrop.index, itemToDrop.arrayName);
		}
		setIsDropModalOpen(false);
		setItemToDrop(null);
	};

	// UI Render Helpers
	const renderEquipmentSlot = (label, itemCategory, itemData, isEquippedBoolean) => {
		const isMount = itemCategory === 'Mount';

		return (
			<div className={styles.slotCard}>
				<div className={styles.slotHeader}>
					<span className={styles.slotLabel}>{label}</span>
				</div>
				{isEquippedBoolean && itemData ? (
					<div className={styles.itemDetails}>
						<div className={styles.itemInfo}>
							<div className={styles.itemName}>{itemData.itemName || itemData.entityName || itemData.name}</div>
							<div className={styles.itemStats}>
								{isMount ? (
									<>
										<div>
											Rank: {itemData.classification?.entityRank || 1} | Type: {itemData.classification?.entitySubclass || 'Mount'}
										</div>
										<div>
											STR: {itemData.stats?.innateStr || itemData.stats?.str || 0} | AGI: {itemData.stats?.innateAgi || itemData.stats?.agi || 0} (-
											{calculateMountReductionPct(itemData.stats?.innateAgi || itemData.stats?.agi || 0)}% AP)
										</div>
										<div>
											Carry Cap: {mountCarryWeight.base + (itemData.stats?.innateStr || itemData.stats?.str || 0) * mountCarryWeight.bonusPerStr} kg
											| Mass: {itemData.logistics?.entityMass || 0} kg
										</div>
										<div>
											HP: {itemData.biology?.hpCurrent || 0} / {itemData.biology?.hpMax || 0}
										</div>
										<div>
											Food (Cons/Yield): -{itemData.logistics?.foodConsumption || 0} / +{itemData.logistics?.foodYield || 0}
										</div>
									</>
								) : (
									<>
										<div>
											Rank: {itemData.classification?.itemTier || itemData.classification?.entityRank || 1} | Type:{' '}
											{itemData.classification?.itemClass || itemCategory}
										</div>
										<div>
											ADP: {itemData.stats?.adp || 0} | DDR: {itemData.stats?.ddr || 0} | Mass: {itemData.stats?.mass || 0} kg
										</div>
										<div>
											Durability: {itemData.state?.currentDurability || 0} / {itemData.state?.maxDurability || 0}
										</div>
									</>
								)}
							</div>
						</div>
						<button
							className={styles.actionButton}
							onClick={() => doUnequipItem(itemCategory)}
						>
							Unequip
						</button>
					</div>
				) : (
					<div className={styles.emptySlot}>Empty Slot</div>
				)}
			</div>
		);
	};

	// Derived values for Healing logic
	const potionsAvailable = inventory.healingPotions || 0;
	const isHpFull = player.biology.hpCurrent >= player.biology.hpMax;
	const canHeal = potionsAvailable > 0 && !isHpFull;

	// Main Render Application
	return (
		<div className={styles.container}>
			{/* Section: Logistics Summary */}
			<div className={styles.summaryBox}>
				<div className={styles.summaryRow}>
					<span className={styles.summaryLabel}>Encumbrance:</span>
					<span className={styles.summaryValue}>
						{logistics.currentEncumbrance} / {logistics.maxCapacity} kg
					</span>
				</div>
				<div className={styles.summaryRow}>
					<span className={styles.summaryLabel}>Travel Penalty:</span>
					<span className={logistics.travelApPenalty > 0 ? styles.penaltyActive : styles.summaryValue}>+{logistics.travelApPenalty} AP</span>
				</div>
			</div>

			{/* Section: Mount Efficiency Summary */}
			<div className={styles.summaryBox}>
				<div className={styles.summaryRow}>
					<span className={styles.summaryLabel}>Equipped Mount Travel Efficiency:</span>
					<span className={activeMountReductionPct > 0 ? styles.penaltyNone : styles.summaryValue}>-{activeMountReductionPct}% AP</span>
				</div>
			</div>

			{/* Section: Food Consumption Summary */}
			<div className={`${styles.summaryBox} ${styles.foodSummaryContainer}`}>
				<div className={styles.foodSummaryHeader}>
					<span className={styles.foodSummaryLabel}>Monthly Food Cost:</span>
					<span className={styles.foodSummaryTotal}>-{totalFoodCost}</span>
				</div>
				<div className={styles.foodSummaryBreakdown}>
					<span>Player: -{playerFoodCost}</span>
					<span>Mount: -{mountFoodCost}</span>
					<span>Caravan: -{caravanFoodCost}</span>
				</div>
			</div>

			{/* NEW SECTION: Consumables */}
			<h3 className={styles.sectionTitle}>Consumables</h3>
			<div className={styles.consumableCard}>
				<div className={styles.consumableInfo}>
					<div className={styles.itemName}>
						Healing Potion <span className={styles.consumableCount}>x{potionsAvailable}</span>
					</div>
					<div className={styles.consumableDesc}>Restores +{WORLD.COMBAT.actionModifiers.healHpAmount} HP. Cannot heal persistent wounds.</div>
				</div>
				<button
					className={styles.actionButton}
					onClick={useHealingPotion}
					disabled={!canHeal}
					style={{ borderColor: canHeal ? '#4ade80' : '#555', color: canHeal ? '#4ade80' : '#555' }}
				>
					Consume
				</button>
			</div>

			{/* Section: Active Loadout */}
			<h3 className={styles.sectionTitle}>Active Loadout</h3>
			<div className={styles.gridContainer}>
				{renderEquipmentSlot('Weapon', 'Weapon', equipment.weaponItem, equipment.hasWeapon)}
				{renderEquipmentSlot('Shield', 'Shield', equipment.shieldItem, equipment.hasShield)}
				{renderEquipmentSlot('Armour', 'Armour', equipment.armourItem, equipment.hasArmour)}
				{renderEquipmentSlot('Helmet', 'Helmet', equipment.helmetItem, equipment.hasHelmet)}
				{renderEquipmentSlot('Mount', 'Mount', equipment.mountItem, equipment.hasMount)}
			</div>

			{/* Section: Backpack */}
			<h3 className={styles.sectionTitle}>Backpack [{inventory.itemSlots.length}/20]</h3>
			{inventory.itemSlots.length === 0 ? (
				<div className={styles.emptySection}>No items in backpack.</div>
			) : (
				<div className={styles.gridContainer}>
					{inventory.itemSlots.map((item, index) => (
						<div
							key={`item-${index}`}
							className={styles.inventoryCard}
						>
							<div className={styles.itemInfo}>
								<div className={styles.itemName}>{item.itemName || item.entityName || item.name}</div>
								<div className={styles.itemClass}>
									<div>
										Rank: {item.classification?.itemTier || item.classification?.entityRank || 1} | Type:{' '}
										{item.classification?.itemClass || item.classification?.itemCategory}
									</div>
									<div>
										ADP: {item.stats?.adp || 0} | DDR: {item.stats?.ddr || 0} | Mass: {item.stats?.mass || 0} kg
									</div>
									<div>
										Durability: {item.state?.currentDurability || 0} / {item.state?.maxDurability || 0}
									</div>
								</div>
							</div>

							{/* Section: Item Actions */}
							<div className={styles.itemActionsContainer}>
								<button
									className={styles.actionButton}
									onClick={() => doEquipItem(index, item.classification?.itemClass)}
								>
									Equip
								</button>
								<button
									className={`${styles.actionButton} ${styles.destructiveButton}`}
									onClick={() => {
										setItemToDrop({ index, name: item.itemName || item.entityName || item.name, arrayName: 'itemSlots' });
										setIsDropModalOpen(true);
									}}
								>
									Drop
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Section: Caravan */}
			<h3 className={styles.sectionTitle}>Caravan [{inventory.animalSlots.length}/10]</h3>
			{inventory.animalSlots.length === 0 ? (
				<div className={styles.emptySection}>No animals in caravan.</div>
			) : (
				<div className={styles.gridContainer}>
					{inventory.animalSlots.map((animal, index) => {
						const isMountable = animal.classification?.entitySubclass === 'Horse';
						const strValue = animal.stats?.innateStr || animal.stats?.str || 0;
						const agiValue = animal.stats?.innateAgi || animal.stats?.agi || 0;
						const reductionPct = calculateMountReductionPct(agiValue);

						return (
							<div
								key={`animal-${index}`}
								className={styles.inventoryCard}
							>
								<div className={styles.itemInfo}>
									<div className={styles.itemName}>{animal.entityName || animal.name}</div>
									<div className={styles.itemClass}>
										<div>
											Rank: {animal.classification?.entityRank || 1} | Type: {animal.classification?.entitySubclass}
										</div>
										{isMountable ? (
											<>
												<div>
													STR: {strValue} | AGI: {agiValue} (-
													{reductionPct}% AP)
												</div>
												<div>
													Carry Cap: {mountCarryWeight.base + strValue * mountCarryWeight.bonusPerStr} kg | Mass:{' '}
													{animal.logistics?.entityMass || 0} kg
												</div>
											</>
										) : (
											<div>Mass: {animal.logistics?.entityMass || 0} kg</div>
										)}
										<div>
											HP: {animal.biology?.hpCurrent || 0} / {animal.biology?.hpMax || 0}
										</div>
										<div>
											Food (Cons/Yield): -{animal.logistics?.foodConsumption || 0} / +{animal.logistics?.foodYield || 0}
										</div>
									</div>
								</div>

								{/* Section: Item Actions */}
								<div className={styles.itemActionsContainer}>
									{isMountable ? (
										<button
											className={styles.actionButton}
											onClick={() => doEquipItem(index, 'Mount')}
										>
											Set Mount
										</button>
									) : (
										<span className={styles.livestockLabel}>Livestock</span>
									)}
									<button
										className={`${styles.actionButton} ${styles.destructiveButton}`}
										onClick={() => {
											const yieldBase = animal.logistics?.foodYield || 0;
											const multiplier = WORLD.NPC?.ANIMAL?.foodYieldMultipliers?.slaughter || 1.0;
											setAnimalToSlaughter({ index, name: animal.entityName || animal.name, foodGained: Math.floor(yieldBase * multiplier) });
											setIsSlaughterModalOpen(true);
										}}
									>
										Slaughter
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Section: Loot */}
			<h3 className={styles.sectionTitle}>Loot & Materials [{inventory.lootSlots.length}/15]</h3>
			{inventory.lootSlots.length === 0 ? (
				<div className={styles.emptySection}>No trade goods gathered.</div>
			) : (
				<div className={styles.gridContainer}>
					{inventory.lootSlots.map((loot, index) => (
						<div
							key={`loot-${index}`}
							className={styles.inventoryCard}
						>
							<div className={styles.itemInfo}>
								<div className={styles.itemName}>{loot.itemName || loot.entityName || loot.name}</div>
								<div className={styles.itemClass}>
									<div>Type: {loot.classification?.itemClass || loot.classification?.entityClass || 'Trade Good'}</div>
									<div>Mass: {loot.stats?.mass || loot.logistics?.baseMass || loot.logistics?.entityMass || 0} kg</div>
								</div>
							</div>
							{/* Section: Item Actions (DROP BUTTON) */}
							<div className={styles.itemActionsContainer}>
								<button
									className={`${styles.actionButton} ${styles.destructiveButton}`}
									onClick={() => {
										setItemToDrop({
											index,
											name: loot.itemName || loot.entityName || loot.name,
											arrayName: 'lootSlots', // Routes to the correct inventory array
										});
										setIsDropModalOpen(true);
									}}
								>
									Drop
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Section: System Debug */}
			<div className={styles.debugContainer}>
				<h3 className={styles.debugTitle}>System Debug Tools</h3>
				<div className={styles.debugButtons}>
					<Button
						onClick={debugGenerateItem}
						variant='secondary'
					>
						+ Gen Item
					</Button>
					<Button
						onClick={debugGenerateAnimal}
						variant='secondary'
					>
						+ Gen Animal
					</Button>
					<Button
						onClick={debugAddResources}
						variant='secondary'
					>
						+ Gen Resources
					</Button>
					<Button
						onClick={debugGenerateLoot}
						variant='secondary'
					>
						+ Gen Loot
					</Button>
					<Button
						onClick={debugFullRestore}
						variant='secondary'
						style={{ border: '1px solid #4ade80', color: '#4ade80' }} // Green border to distinguish it
					>
						Full Restore
					</Button>
				</div>
			</div>

			{/* Section: Modals */}
			<ConfirmModal
				isOpen={isSlaughterModalOpen}
				title='Slaughter Animal'
				message={`Are you sure you want to slaughter ${animalToSlaughter?.name}? This action will yield +${animalToSlaughter?.foodGained} Food and cannot be undone.`}
				confirmText='Slaughter'
				cancelText='Cancel'
				onConfirm={handleConfirmSlaughter}
				onCancel={() => {
					setIsSlaughterModalOpen(false);
					setAnimalToSlaughter(null);
				}}
			/>

			<ConfirmModal
				isOpen={isDropModalOpen}
				title='Drop Item'
				message={`Are you sure you want to permanently drop ${itemToDrop?.name}? This action cannot be undone.`}
				confirmText='Drop'
				cancelText='Cancel'
				onConfirm={handleConfirmDrop}
				onCancel={() => {
					setIsDropModalOpen(false);
					setItemToDrop(null);
				}}
			/>
		</div>
	);
};

export default InventoryView;
