// File: Client/src/components/shop/ShopInventoryGrid.jsx
import { useState } from 'react';
import ShopItemCard from './ShopItemCard';
import styles from '../../styles/ShopView.module.css';

const ShopInventoryGrid = ({
    items,
    shopMode,
    cart,
    numericSelections,
    npcRank,
    getItemPrice,
    onAddToCart,
    onRemoveFromCart,
    onSliderChange
}) => {
    const [sortOrder, setSortOrder] = useState('DESC');

    const toggleSortOrder = () => setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'));

    const getRank = (entity) => entity?.classification?.itemTier || entity?.classification?.entityRank || 1;
    const getQuality = (entity) => entity?.classification?.itemQuality || entity?.classification?.entityQuality || 1;

    const sortEntities = (a, b) => {
        const rankA = getRank(a);
        const rankB = getRank(b);
        if (rankA !== rankB) {
            return sortOrder === 'DESC' ? rankB - rankA : rankA - rankB;
        }
        const qA = getQuality(a);
        const qB = getQuality(b);
        return sortOrder === 'DESC' ? qB - qA : qA - qB;
    };

    // Apply sorting to the incoming items array
    const sortedItems = [...items].sort(sortEntities);

    const headerTitle = shopMode === 'BUY' ? "Merchant's Stock" : shopMode === 'REPAIR' ? 'Damaged Equipment' : 'Your Inventory';

    return (
        <div className={styles.inventorySection}>
            {/* New Flexbox Header for Title and Sort Button */}
            <div className={styles.inventoryHeaderGroup}>
                <h3 className={styles.sectionHeaderTitle}>{headerTitle}</h3>
                <button 
                    className={styles.sortBtnHeader} 
                    onClick={toggleSortOrder}
                >
                    Rank {sortOrder === 'DESC' ? '▼' : '▲'}
                </button>
            </div>

            {sortedItems.length === 0 ? (
                <div className={styles.emptyState}>
                    {shopMode === 'BUY'
                        ? 'The merchant has nothing to offer.'
                        : shopMode === 'REPAIR'
                            ? 'You have no damaged equipment to repair.'
                            : 'You have no matching items to sell.'}
                </div>
            ) : (
                <div className={styles.inventoryList}>
                    {sortedItems.map((item, index) => {
                        const price = getItemPrice(item);
                        const inCart = cart.find((c) => c.entityId === item.entityId);
                        const selectedQty = numericSelections[item.entityId] || 1;

                        const itemTier = item.classification?.itemTier || 1;
                        const cannotRepair = shopMode === 'REPAIR' && itemTier > npcRank;

                        return (
                            <div
                                key={item.entityId || index}
                                className={styles.inventoryItemWrapper}
                            >
                                <ShopItemCard
                                    item={item}
                                    shopMode={shopMode}
                                    price={price}
                                    inCart={!!inCart}
                                    selectedQty={selectedQty}
                                    onAddToCart={cannotRepair ? () => alert(`This Rank ${itemTier} item is too advanced for a Rank ${npcRank} Blacksmith to repair.`) : onAddToCart}
                                    onRemoveFromCart={onRemoveFromCart}
                                    onSliderChange={onSliderChange}
                                />

                                {cannotRepair && (
                                    <div className={styles.repairOverlay}>
                                        <span className={styles.repairOverlayText}>Requires Rank {itemTier} Blacksmith</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShopInventoryGrid;