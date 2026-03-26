// File: Client/src/components/shop/ItemInfo.jsx
import { useState } from 'react';
import { WORLD } from '../../data/GameWorld';
import styles from '../../styles/ItemInfo.module.css';

const ItemInfo = ({ item }) => {
	const [isOpen, setIsOpen] = useState(false);

	if (!item || item.isNumeric) return null;

	const itemName = item.itemName || item.entityName || 'Unknown Item';
	const itemRank = item.classification?.itemTier || item.classification?.entityRank;
	const itemQuality = item.classification?.itemQuality || item.classification?.entityQuality || null;
	const itemType = item.classification?.itemClass || item.classification?.entityClass;

	const isMount = itemType === 'Mount';
	const isAnimal = item.classification?.entityCategory === 'Animal' && !isMount;
	const isEquipment = item.classification?.itemCategory === 'Equipment' || ['Weapon', 'Armour', 'Shield', 'Helmet'].includes(itemType);

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
										<span className={styles.statBoxValue}>{item.stats?.adp || 0}</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Defense (DDR)</span>
										<span className={styles.statBoxValue}>{item.stats?.ddr || 0}</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Durability</span>
										<span className={styles.statBoxValue}>
											{item.state?.currentDurability || 0}/{item.state?.maxDurability || 0}
										</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Mass</span>
										<span className={styles.statBoxValue}>{item.stats?.mass || 0} kg</span>
									</div>
								</>
							)}

							{isMount && (
								<>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Strength</span>
										<span className={styles.statBoxValue}>{strValue}</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Agility</span>
										<span className={styles.statBoxValue}>{agiValue}</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>Carry Cap.</span>
										<span className={styles.statBoxValue}>{carryCapacity} kg</span>
									</div>
									<div className={styles.statBox}>
										<span className={styles.statBoxLabel}>AP Reduction</span>
										<span className={styles.statBoxValue}>-{reductionPct}%</span>
									</div>
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
