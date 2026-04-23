// File: Client/src/components/shop/ShopEquippedGear.jsx
import styles from '../../styles/ShopView.module.css';

const ShopEquippedGear = ({ player, isEquipPanelOpen, setIsEquipPanelOpen, doUnequipItem }) => {
	if (!player || !player.equipment) return null;

	const eq = player.equipment;
	const equippedList = [
		{ label: 'Weapon', item: eq.weaponItem, key: 'Weapon' },
		{ label: 'Armor', item: eq.armorItem, key: 'Armor' },
		{ label: 'Shield', item: eq.shieldItem, key: 'Shield' },
		{ label: 'Helmet', item: eq.helmetItem, key: 'Helmet' },
		{ label: 'Mount', item: eq.mountItem, key: 'Mount' },
	].filter((e) => e.item);

	if (equippedList.length === 0) return null;

	return (
		<div className={styles.equippedContainer}>
			<div
				onClick={() => setIsEquipPanelOpen(!isEquipPanelOpen)}
				className={`${styles.equippedHeader} ${isEquipPanelOpen ? styles.equippedHeaderOpen : ''}`}
			>
				<h3 className={styles.equippedTitle}>Equipped Gear (Unequip to Sell/Repair)</h3>
				<span className={styles.equippedToggleIcon}>{isEquipPanelOpen ? '▲' : '▼'}</span>
			</div>

			{isEquipPanelOpen && (
				<div className={styles.equippedGrid}>
					{equippedList.map((eqObj) => {
						const itemRank = eqObj.item.classification?.itemTier || eqObj.item.classification?.entityRank || null;
						const itemQuality = eqObj.item.classification?.itemQuality || eqObj.item.classification?.entityQuality || null;

						return (
							<div
								key={eqObj.key}
								className={styles.equippedItemCard}
							>
								<span className={styles.equippedItemLabel}>{eqObj.label}:</span>

								<div className='badgeContainer'>
									{itemRank && (
										<div
											className='badgeCircle badgeRank'
											title='Rank'
										>
											R{itemRank}
										</div>
									)}
									{itemQuality && (
										<div
											className={`badgeCircle badgeQ${itemQuality}`}
											title='Quality'
										>
											Q{itemQuality}
										</div>
									)}
								</div>

								{/* Dynamic Quality Color applied here */}
								<span className={`${styles.equippedItemName} ${itemQuality ? `textQ${itemQuality}` : ''}`}>
									{eqObj.item.itemName || eqObj.item.entityName}
								</span>

								<button
									onClick={() => doUnequipItem(eqObj.key)}
									className={styles.unequipBtn}
								>
									Unequip
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ShopEquippedGear;
