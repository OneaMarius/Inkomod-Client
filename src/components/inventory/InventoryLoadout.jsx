// File: Client/src/components/inventory/InventoryLoadout.jsx
import { useState } from 'react';
import styles from '../../styles/InventoryView.module.css';

const InventoryLoadout = ({
    equipment,
    doUnequipItem,
    mountCarryWeight,
    calculateMountReductionPct
}) => {
    // Default state set to false (collapsed)
    const [isActiveLoadoutOpen, setIsActiveLoadoutOpen] = useState(false);

    const renderEquipmentSlot = (label, itemCategory, itemData, isEquippedBoolean) => {
        const isMount = itemCategory === 'Mount';
        const rank = itemData?.classification?.itemTier || itemData?.classification?.entityRank || null;
        const quality = itemData?.classification?.itemQuality || itemData?.classification?.entityQuality || null;

        return (
            <div className={styles.slotCard} key={itemCategory}>
                <div className={styles.slotHeader}>
                    <span className={styles.slotLabel}>{label}</span>
                </div>
                {isEquippedBoolean && itemData ? (
                    <div className={styles.itemDetails}>
                        <div className={styles.itemInfo}>
                            {/* Dynamic Quality Color applied to itemName */}
                            <div className={`${styles.itemName} ${quality ? `textQ${quality}` : ''}`}>
                                {itemData.itemName || itemData.entityName || itemData.name}
                            </div>

                            <div className='badgeContainer'>
                                {rank && <div className='badgeCircle badgeRank'>R{rank}</div>}
                                {quality && <div className={`badgeCircle badgeQ${quality}`}>Q{quality}</div>}
                            </div>

                            <div className={styles.itemStats}>
                                {isMount ? (
                                    <>
                                        <div>Type: {itemData.classification?.entitySubclass || 'Mount'}</div>
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
                                        <div>Type: {itemData.classification?.itemClass || itemCategory}</div>
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

    return (
        <>
            <div
                className={styles.collapsibleHeader}
                onClick={() => setIsActiveLoadoutOpen(!isActiveLoadoutOpen)}
            >
                <div className={styles.headerLeftGroup}>
                    <h3 className={styles.sectionTitleCollapsible}>Active Loadout</h3>
                </div>
                <div className={styles.headerRightGroup}>
                    <div className={styles.loadoutIndicators}>
                        <div className={`${styles.loadoutSquare} ${equipment.hasWeapon ? styles.loadoutSquareEquipped : styles.loadoutSquareEmpty}`} title='Weapon'>W</div>
                        <div className={`${styles.loadoutSquare} ${equipment.hasShield ? styles.loadoutSquareEquipped : styles.loadoutSquareEmpty}`} title='Shield'>S</div>
                        <div className={`${styles.loadoutSquare} ${equipment.hasArmour ? styles.loadoutSquareEquipped : styles.loadoutSquareEmpty}`} title='Armour'>A</div>
                        <div className={`${styles.loadoutSquare} ${equipment.hasHelmet ? styles.loadoutSquareEquipped : styles.loadoutSquareEmpty}`} title='Helmet'>H</div>
                        <div className={`${styles.loadoutSquare} ${equipment.hasMount ? styles.loadoutSquareEquipped : styles.loadoutSquareEmpty}`} title='Mount'>M</div>
                    </div>
                    <span className={styles.toggleIcon}>{isActiveLoadoutOpen ? '▲' : '▼'}</span>
                </div>
            </div>

            {isActiveLoadoutOpen && (
                <div className={styles.gridContainer}>
                    {renderEquipmentSlot('Weapon', 'Weapon', equipment.weaponItem, equipment.hasWeapon)}
                    {renderEquipmentSlot('Shield', 'Shield', equipment.shieldItem, equipment.hasShield)}
                    {renderEquipmentSlot('Armour', 'Armour', equipment.armourItem, equipment.hasArmour)}
                    {renderEquipmentSlot('Helmet', 'Helmet', equipment.helmetItem, equipment.hasHelmet)}
                    {renderEquipmentSlot('Mount', 'Mount', equipment.mountItem, equipment.hasMount)}
                </div>
            )}
        </>
    );
};

export default InventoryLoadout;