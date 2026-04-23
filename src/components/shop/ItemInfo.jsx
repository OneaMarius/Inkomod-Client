// File: Client/src/components/shop/ItemInfo.jsx
import { useState } from 'react';
import useGameState from '../../store/OMD_State_Manager';
import { WORLD } from '../../data/GameWorld';
import styles from '../../styles/ItemInfo.module.css';

const ItemInfo = ({ item }) => {
	const [isOpen, setIsOpen] = useState(false);
	// Extragem echipamentul jucătorului din state-ul global
	const playerEquipment = useGameState((state) => state.gameState?.player?.equipment);

	if (!item || item.isNumeric) return null;

	const itemName = item.itemName || item.entityName || 'Unknown Item';
	const itemRank = item.classification?.itemTier || item.classification?.entityRank;
	const itemQuality = item.classification?.itemQuality || item.classification?.entityQuality || null;
	const itemType = item.classification?.itemClass || item.classification?.entityClass;

	const isMount = itemType === 'Mount';
	const isAnimal = item.classification?.entityCategory === 'Animal' && !isMount;
	const isEquipment = item.classification?.itemCategory === 'Equipment' || ['Weapon', 'Armor', 'Shield', 'Helmet'].includes(itemType);

	// Găsim item-ul echipat pentru a face comparația
	let equippedItem = null;
	if (isEquipment && playerEquipment) {
		const slotKey = `${itemType.toLowerCase()}Item`; // ex: 'weaponItem', 'armorItem'
		equippedItem = playerEquipment[slotKey];
	} else if (isMount && playerEquipment) {
		equippedItem = playerEquipment.mountItem;
	}

	// ------------------------------------------------------------------------
	// MOUNT CALCULATION ALGORITHMS
	// ------------------------------------------------------------------------
	const mountCarryWeight = WORLD.LOGISTICS?.mountCarryWeight || { base: 150, bonusPerStr: 5 };
	const transitConstants = WORLD.SPATIAL?.transit || { mountMaxReductionFactor: 0.2, mountMinReductionFactor: 0.9, mountAgiMultiplier: 0.01 };

	const calculateMountReductionPct = (agiValue) => {
		const factor = Math.max(
			transitConstants.mountMaxReductionFactor,
			transitConstants.mountMinReductionFactor - agiValue * transitConstants.mountAgiMultiplier,
		);
		return Math.round((1 - factor) * 100);
	};

	const agiValue = item.stats?.innateAgi || item.stats?.agi || 0;
	const strValue = item.stats?.innateStr || item.stats?.str || 0;
	const carryCapacity = mountCarryWeight.base + strValue * mountCarryWeight.bonusPerStr;
	const reductionPct = calculateMountReductionPct(agiValue);

	const handleOpen = (e) => {
		e.stopPropagation();
		setIsOpen(true);
	};

	const handleClose = (e) => {
		e.stopPropagation();
		setIsOpen(false);
	};

	// ------------------------------------------------------------------------
	// RENDER HELPER PENTRU COMPARAȚII
	// ------------------------------------------------------------------------
	const renderComparedStat = (currentVal, equippedTarget, getEquippedValFn, inverse = false, suffix = '') => {
		if (!equippedTarget) {
			return (
				<span className={styles.statBoxValue}>
					{currentVal}
					{suffix}
				</span>
			);
		}

		const equippedVal = getEquippedValFn(equippedTarget);
		const delta = currentVal - equippedVal;

		const displayDelta = Number.isInteger(delta) ? delta : parseFloat(delta.toFixed(1));

		if (delta === 0) {
			return (
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
					<span className={styles.statBoxValue}>
						{currentVal}
						{suffix}
					</span>
					<span style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 'bold' }}>(0)</span>
				</div>
			);
		}

		const isPositiveChange = inverse ? delta < 0 : delta > 0;
		const color = isPositiveChange ? '#4ade80' : '#ef4444';
		const sign = delta > 0 ? '+' : '';

		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
				<span className={styles.statBoxValue}>
					{currentVal}
					{suffix}
				</span>
				<span style={{ color: color, fontSize: '1rem', fontWeight: 'bold' }}>
					({sign}
					{displayDelta}
					{suffix})
				</span>
			</div>
		);
	};

	// Helper specific pentru durabilitate
	const renderDurabilityComparison = () => {
		const curDur = item.state?.currentDurability || 0;
		const maxDur = item.state?.maxDurability || 0;

		if (!equippedItem) {
			return (
				<span className={styles.statBoxValue}>
					{curDur}/{maxDur}
				</span>
			);
		}

		const eqDur = equippedItem.state?.currentDurability || 0;
		const delta = curDur - eqDur;

		if (delta === 0) {
			return (
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
					<span className={styles.statBoxValue}>
						{curDur}/{maxDur}
					</span>
					<span style={{ color: '#60a5fa', fontSize: '1rem' }}>(=)</span>
				</div>
			);
		}

		const color = delta > 0 ? '#4ade80' : '#ef4444';
		const sign = delta > 0 ? '+' : '';

		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
				<span className={styles.statBoxValue}>
					{curDur}/{maxDur}
				</span>
				<span style={{ color: color, fontSize: '1rem', fontWeight: 'bold' }}>
					({sign}
					{delta})
				</span>
			</div>
		);
	};

	return (
		<>
			<button
				className={styles.infoBtn}
				onClick={handleOpen}
			>
				i
			</button>

			{isOpen && (
				<div
					className={styles.modalOverlay}
					onClick={handleClose}
				>
					<div
						className={styles.modalContent}
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className={`${styles.modalHeader} ${itemQuality ? `textQ${itemQuality}` : ''}`}>{itemName}</h3>

						<div className={styles.modalCategory}>
							<div
								className='badgeContainer'
								style={{ justifyContent: 'center', marginBottom: '8px' }}
							>
								{itemRank && <div className='badgeCircle badgeRank'>R{itemRank}</div>}
								{itemQuality && <div className={`badgeCircle badgeQ${itemQuality}`}>Q{itemQuality}</div>}
							</div>
							{itemType}
						</div>

						<div className={styles.statGrid}>
							{isEquipment && (
								<>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Attack (ADP)</span>
										{renderComparedStat(item.stats?.adp || 0, equippedItem, (eq) => eq.stats?.adp || 0)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Defense (DDR)</span>
										{renderComparedStat(item.stats?.ddr || 0, equippedItem, (eq) => eq.stats?.ddr || 0)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Durability</span>
										{renderDurabilityComparison()}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Mass</span>
										{/* Inverse este TRUE: masa mica = verde */}
										{renderComparedStat(item.stats?.mass || 0, equippedItem, (eq) => eq.stats?.mass || 0, true, ' kg')}
									</div>
								</>
							)}

							{isMount && (
								<>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Strength</span>
										{renderComparedStat(strValue, equippedItem, (eq) => eq.stats?.innateStr || eq.stats?.str || 0)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Agility</span>
										{renderComparedStat(agiValue, equippedItem, (eq) => eq.stats?.innateAgi || eq.stats?.agi || 0)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Carry Cap.</span>
										{renderComparedStat(
											carryCapacity,
											equippedItem,
											(eq) => mountCarryWeight.base + (eq.stats?.innateStr || eq.stats?.str || 0) * mountCarryWeight.bonusPerStr,
											false,
											' kg',
										)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>AP Reduction</span>
										{renderComparedStat(
											reductionPct,
											equippedItem,
											(eq) => calculateMountReductionPct(eq.stats?.innateAgi || eq.stats?.agi || 0),
											false,
											'%',
										)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Max HP</span>
										{renderComparedStat(item.biology?.hpMax || 0, equippedItem, (eq) => eq.biology?.hpMax || 0)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Mass</span>
										{/* Inverse a fost schimbat pe FALSE: masa mare = verde */}
										{renderComparedStat(item.logistics?.entityMass || 0, equippedItem, (eq) => eq.logistics?.entityMass || 0, false, ' kg')}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Food Cons.</span>
										{renderComparedStat(item.logistics?.foodConsumption || 0, equippedItem, (eq) => eq.logistics?.foodConsumption || 0, true)}
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Food Yield</span>
										{renderComparedStat(item.logistics?.foodYield || 0, equippedItem, (eq) => eq.logistics?.foodYield || 0)}
									</div>
								</>
							)}

							{isAnimal && (
								<>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Max HP</span>
										<span className={styles.statBoxValue}>{item.biology?.hpMax || 0}</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Mass</span>
										<span className={styles.statBoxValue}>{item.logistics?.entityMass || 0} kg</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Food Cons.</span>
										<span className={styles.statBoxValue}>{item.logistics?.foodConsumption || 0}</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Food Yield</span>
										<span className={styles.statBoxValue}>{item.logistics?.foodYield || 0}</span>
									</div>
								</>
							)}
						</div>

						<button
							className={styles.closeModalBtn}
							onClick={handleClose}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default ItemInfo;
