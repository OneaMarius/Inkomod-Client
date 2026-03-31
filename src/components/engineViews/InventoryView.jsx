// File: Client/src/components/engineViews/InventoryView.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import Button from '../Button';
import ConfirmModal from '../ConfirmModal';
import AlertModal from '../AlertModal';
import styles from '../../styles/InventoryView.module.css';
import { WORLD } from '../../data/GameWorld.js';

import { calculateSellPrice } from '../../engine/ENGINE_Economy_Shops';
import { calculateDerivedStats } from '../../engine/ENGINE_Inventory';

// Import our new modular components
import InventorySummary from '../inventory/InventorySummary';
import InventoryWealth from '../inventory/InventoryWealth';
import InventoryConsumables from '../inventory/InventoryConsumables';
import InventoryLoadout from '../inventory/InventoryLoadout';
import InventoryGrid from '../inventory/InventoryGrid';

const InventoryView = () => {
	// ------------------------------------------------------------------------
	// STATE & DESTRUCTURING
	// ------------------------------------------------------------------------
	const player = useGameState((state) => state.gameState?.player);
	const time = useGameState((state) => state.gameState?.time);
	const location = useGameState((state) => state.gameState?.location);

	const doEquipItem = useGameState((state) => state.doEquipItem);
	const doUnequipItem = useGameState((state) => state.doUnequipItem);
	const doSlaughterAnimal = useGameState((state) => state.doSlaughterAnimal);
	const doDropItem = useGameState((state) => state.doDropItem);
	const useHealingPotion = useGameState((state) => state.useHealingPotion);

	const mountCarryWeight = WORLD.LOGISTICS.mountCarryWeight;
	const transitConstants = WORLD.SPATIAL.transit;

	const limits = WORLD.PLAYER?.inventoryLimits || { itemSlots: 50, animalSlots: 10, lootSlots: 20 };

	const debugGenerateItem = useGameState((state) => state.debugGenerateItem);
	const debugGenerateAnimal = useGameState((state) => state.debugGenerateAnimal);
	const debugAddResources = useGameState((state) => state.debugAddResources);
	const debugGenerateLoot = useGameState((state) => state.debugGenerateLoot);
	const debugFullRestore = useGameState((state) => state.debugFullRestore);

	// Component State Management (Modals)
	const [isSlaughterModalOpen, setIsSlaughterModalOpen] = useState(false);
	const [animalToSlaughter, setAnimalToSlaughter] = useState(null);
	const [isDropModalOpen, setIsDropModalOpen] = useState(false);
	const [itemToDrop, setItemToDrop] = useState(null);

	// Alert Modal State
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

	// Component State Management (Filtering & Sorting)
	const [backpackFilter, setBackpackFilter] = useState('ALL');
	const [caravanFilter, setCaravanFilter] = useState('ALL');
	const [sortOrder, setSortOrder] = useState('DESC');
	const [isDebugOpen, setIsDebugOpen] = useState(false);

	if (!player) return <div className={styles.loading}>Loading Inventory...</div>;

	const inventory = player.inventory;
	const logistics = player.logistics;
	const equipment = player.equipment;

	// ------------------------------------------------------------------------
	// WEALTH & CURRENCY CALCULATIONS
	// ------------------------------------------------------------------------
	const regionalExchangeRate = location?.regionalExchangeRate || 10;
	const playerHonor = player.progression?.honor || 0;
	const { totalCha } = calculateDerivedStats(player);
	const ecoValues = WORLD.ECONOMY?.baseValues || {};

	const silverCoins = inventory.silverCoins || 0;
	const tradeSilver = inventory.tradeSilver || 0;
	const tradeGold = inventory.tradeGold || 0;

	const silverBaseCost = ecoValues.goldCoinBaseCostOfSilver || 10;
	const goldBaseCost = ecoValues.goldCoinBaseCostOfGold || 100;

	const estimatedSilverValue = tradeSilver > 0 ? calculateSellPrice(silverBaseCost, regionalExchangeRate, 100, 100, playerHonor, totalCha) * tradeSilver : 0;
	const estimatedGoldValue = tradeGold > 0 ? calculateSellPrice(goldBaseCost, regionalExchangeRate, 100, 100, playerHonor, totalCha) * tradeGold : 0;

	// ------------------------------------------------------------------------
	// LOGISTICS & CONSUMPTION CALCULATIONS
	// ------------------------------------------------------------------------
	const currentMonth = time?.currentMonth || WORLD.TIME.startMonth;
	let nextMonth = currentMonth + 1;
	if (nextMonth > WORLD.TIME.monthsPerYear) nextMonth = 1;

	const determineSeason = (month) => {
		const seasons = WORLD.TIME.seasons;
		if (month >= seasons.spring.startMonth && month <= seasons.spring.endMonth) return 'spring';
		if (month >= seasons.summer.startMonth && month <= seasons.summer.endMonth) return 'summer';
		if (month >= seasons.autumn.startMonth && month <= seasons.autumn.endMonth) return 'autumn';
		return 'winter';
	};

	const nextSeason = determineSeason(nextMonth);
	const seasonMult = WORLD.TIME.seasons[nextSeason]?.foodConsumptionMult || 1.0;

	const playerBaseFood = WORLD.PLAYER.baseFoodNeed || 2;
	const playerFoodCost = Math.ceil(playerBaseFood * seasonMult);

	const mountBaseFood = equipment.hasMount && equipment.mountItem ? equipment.mountItem.logistics?.foodConsumption || 1 : 0;
	const mountFoodCost = equipment.hasMount ? Math.ceil(mountBaseFood * seasonMult) : 0;

	const baseCaravanFood = inventory.animalSlots.reduce((sum, animal) => sum + (animal.logistics?.foodConsumption || 1), 0);
	const caravanFoodCost = Math.ceil(baseCaravanFood * seasonMult);
	const totalFoodCost = playerFoodCost + mountFoodCost + caravanFoodCost;

	const calculateMountReductionPct = (agiValue) => {
		const factor = Math.max(
			transitConstants.mountMaxReductionFactor,
			transitConstants.mountMinReductionFactor - agiValue * transitConstants.mountAgiMultiplier,
		);
		return Math.round((1 - factor) * 100);
	};

	const activeMountAgi = equipment.hasMount && equipment.mountItem ? equipment.mountItem.stats?.innateAgi || equipment.mountItem.stats?.agi || 5 : 0;
	const activeMountReductionPct = equipment.hasMount ? calculateMountReductionPct(activeMountAgi) : 0;

	const mountCount = inventory.animalSlots.filter((a) => a.classification?.entitySubclass === 'Horse' || a.classification?.entityClass === 'Mount').length;
	const livestockCount = inventory.animalSlots.length - mountCount;

	const potionsAvailable = inventory.healingPotions || 0;
	const isHpFull = player.biology.hpCurrent >= player.biology.hpMax;
	const canHeal = potionsAvailable > 0 && !isHpFull;

	// ------------------------------------------------------------------------
	// COLOR THRESHOLD HELPERS
	// ------------------------------------------------------------------------
	const getTravelColorClass = (val) => (val === 0 ? styles.textGreen : val <= 2 ? styles.textBlue : styles.textRed);
	const getMountColorClass = (val) => (val === 0 ? styles.textRed : val <= 50 ? styles.textBlue : styles.textGreen);
	const getFoodColorClass = (val) => (val <= 5 ? styles.textGreen : val <= 15 ? styles.textBlue : styles.textRed);

	// ------------------------------------------------------------------------
	// FILTERING & SORTING LOGIC (Preserving Original Index)
	// ------------------------------------------------------------------------
	const toggleSortOrder = () => setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'));

	const getRank = (entity) => entity?.classification?.itemTier || entity?.classification?.entityRank || 1;
	const getQuality = (entity) => entity?.classification?.itemQuality || entity?.classification?.entityQuality || 1;

	const sortEntities = (a, b) => {
		const rankA = getRank(a);
		const rankB = getRank(b);
		if (rankA !== rankB) return sortOrder === 'DESC' ? rankB - rankA : rankA - rankB;
		const qA = getQuality(a);
		const qB = getQuality(b);
		return sortOrder === 'DESC' ? qB - qA : qA - qB;
	};

	let mappedBackpack = (inventory.itemSlots || []).map((item, index) => ({ ...item, _originalIndex: index }));
	if (backpackFilter !== 'ALL') {
		mappedBackpack = mappedBackpack.filter((item) => item.classification?.itemClass?.toUpperCase() === backpackFilter);
	}
	mappedBackpack.sort(sortEntities);

	let mappedCaravan = (inventory.animalSlots || []).map((animal, index) => ({ ...animal, _originalIndex: index }));
	if (caravanFilter === 'MOUNT') {
		mappedCaravan = mappedCaravan.filter((animal) => animal.classification?.entitySubclass === 'Horse' || animal.classification?.entityClass === 'Mount');
	} else if (caravanFilter === 'LIVESTOCK') {
		mappedCaravan = mappedCaravan.filter((animal) => animal.classification?.entitySubclass !== 'Horse' && animal.classification?.entityClass !== 'Mount');
	}
	mappedCaravan.sort(sortEntities);

	let mappedLoot = (inventory.lootSlots || []).map((loot, index) => ({ ...loot, _originalIndex: index }));
	mappedLoot.sort(sortEntities);

	// ------------------------------------------------------------------------
	// MODAL HANDLERS
	// ------------------------------------------------------------------------
	const handleConfirmSlaughter = () => {
		if (animalToSlaughter !== null) doSlaughterAnimal(animalToSlaughter.index);
		setIsSlaughterModalOpen(false);
		setAnimalToSlaughter(null);
	};

	const handleConfirmDrop = () => {
		if (itemToDrop !== null) doDropItem(itemToDrop.index, itemToDrop.arrayName);
		setIsDropModalOpen(false);
		setItemToDrop(null);
	};

	const handleDebugAction = (actionFn) => {
		const result = actionFn();
		if (result && result.error) {
			setAlertMessage(result.error);
			setIsAlertOpen(true);
		}
	};

	const handleEquipFromGrid = (originalIndex, itemClass) => {
		doEquipItem(originalIndex, itemClass);
	};

	const handleDropFromGrid = (originalIndex, entity, gridType) => {
		const arrayMap = { BACKPACK: 'itemSlots', CARAVAN: 'animalSlots', LOOT: 'lootSlots' };
		setItemToDrop({ index: originalIndex, name: entity.itemName || entity.entityName || entity.name, arrayName: arrayMap[gridType] });
		setIsDropModalOpen(true);
	};

	const handleSlaughterFromGrid = (originalIndex, entity) => {
		const yieldBase = entity.logistics?.foodYield || 0;
		const multiplier = WORLD.NPC?.ANIMAL?.foodYieldMultipliers?.slaughter || 1.0;
		setAnimalToSlaughter({ index: originalIndex, name: entity.entityName || entity.name, foodGained: Math.floor(yieldBase * multiplier) });
		setIsSlaughterModalOpen(true);
	};

	// ------------------------------------------------------------------------
	// MAIN RENDER
	// ------------------------------------------------------------------------
	return (
		<div className={styles.container}>
			<InventorySummary
				logistics={logistics}
				activeMountReductionPct={activeMountReductionPct}
				totalFoodCost={totalFoodCost}
				playerFoodCost={playerFoodCost}
				mountFoodCost={mountFoodCost}
				caravanFoodCost={caravanFoodCost}
				getTravelColorClass={getTravelColorClass}
				getMountColorClass={getMountColorClass}
				getFoodColorClass={getFoodColorClass}
			/>

			<InventoryWealth
				silverCoins={silverCoins}
				tradeSilver={tradeSilver}
				tradeGold={tradeGold}
				estimatedSilverValue={estimatedSilverValue}
				estimatedGoldValue={estimatedGoldValue}
			/>

			<InventoryConsumables
				potionsAvailable={potionsAvailable}
				maxHealingPotions={limits.maxHealingPotions || 15}
				canHeal={canHeal}
				useHealingPotion={useHealingPotion}
			/>

			<InventoryLoadout
				equipment={equipment}
				doUnequipItem={doUnequipItem}
				mountCarryWeight={mountCarryWeight}
				calculateMountReductionPct={calculateMountReductionPct}
			/>

			{/* Backpack Grid */}
			<InventoryGrid
				title='Backpack'
				currentCount={inventory.itemSlots.length}
				maxCount={limits.itemSlots}
				items={mappedBackpack}
				gridType='BACKPACK'
				sortOrder={sortOrder}
				toggleSortOrder={toggleSortOrder}
				filterTabs={['ALL', 'WEAPON', 'SHIELD', 'ARMOUR', 'HELMET']}
				activeFilter={backpackFilter}
				setActiveFilter={setBackpackFilter}
				onEquip={handleEquipFromGrid}
				onDrop={handleDropFromGrid}
			/>

			{/* Caravan Grid */}
			<InventoryGrid
				title='Caravan'
				currentCount={inventory.animalSlots.length}
				maxCount={limits.animalSlots}
				items={mappedCaravan}
				gridType='CARAVAN'
				headerIcons={`🐎x${mountCount} 🥩x${livestockCount}`}
				sortOrder={sortOrder}
				toggleSortOrder={toggleSortOrder}
				filterTabs={['ALL', 'MOUNT', 'LIVESTOCK']}
				activeFilter={caravanFilter}
				setActiveFilter={setCaravanFilter}
				onEquip={handleEquipFromGrid}
				onDrop={handleDropFromGrid}
				onSlaughter={handleSlaughterFromGrid}
				calculateMountReductionPct={calculateMountReductionPct}
				mountCarryWeight={mountCarryWeight}
			/>

			{/* Loot Grid */}
			<InventoryGrid
				title='Loot & Materials'
				currentCount={inventory.lootSlots.length}
				maxCount={limits.lootSlots}
				items={mappedLoot}
				gridType='LOOT'
				sortOrder={sortOrder}
				toggleSortOrder={toggleSortOrder}
				onDrop={handleDropFromGrid}
			/>

			{/* Section: System Debug */}
			<div
				className={styles.collapsibleHeader}
				onClick={() => setIsDebugOpen(!isDebugOpen)}
				style={{ borderTop: '2px dashed #444', borderBottom: 'none', marginTop: '30px' }}
			>
				<div className={styles.headerLeftGroup}>
					<h3
						className={styles.debugTitle}
						style={{ margin: 0, border: 'none' }}
					>
						System Debug Tools
					</h3>
				</div>
				<div className={styles.headerRightGroup}>
					<span className={styles.toggleIcon}>{isDebugOpen ? '▲' : '▼'}</span>
				</div>
			</div>

			{isDebugOpen && (
				<div
					className={styles.debugContainer}
					style={{ marginTop: '10px', borderTop: 'none' }}
				>
					<div className={styles.debugButtons}>
						<Button
							onClick={() => handleDebugAction(debugGenerateItem)}
							variant='secondary'
						>
							+ Gen Item
						</Button>
						<Button
							onClick={() => handleDebugAction(debugGenerateAnimal)}
							variant='secondary'
						>
							+ Gen Animal
						</Button>
						<Button
							onClick={() => handleDebugAction(debugAddResources)}
							variant='secondary'
						>
							+ Gen Resources
						</Button>
						<Button
							onClick={() => handleDebugAction(debugGenerateLoot)}
							variant='secondary'
						>
							+ Gen Loot
						</Button>
						<Button
							onClick={() => handleDebugAction(debugFullRestore)}
							variant='secondary'
							style={{ border: '1px solid #4ade80', color: '#4ade80' }}
						>
							Full Restore
						</Button>
					</div>
				</div>
			)}

			{/* Section: Modals */}
			<AlertModal
				isOpen={isAlertOpen}
				title='System Alert'
				message={alertMessage}
				onClose={() => setIsAlertOpen(false)}
			/>

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
