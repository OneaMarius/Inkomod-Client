// File: Client/src/components/ShopItemCard.jsx
import React from 'react';
import ItemInfo from './ItemInfo';
import styles from '../styles/ShopItemCard.module.css';

const ShopItemCard = ({
    item,
    shopMode,
    price,
    inCart,
    selectedQty,
    onAddToCart,
    onRemoveFromCart,
    onSliderChange
}) => {
    const itemName = item.itemName || item.entityName;
    const itemRank = item.classification?.itemTier || item.classification?.entityRank;
    const itemType = item.classification?.itemClass || item.classification?.entityClass || 'Commodity';

    // Helper function for dynamic button text
    const getButtonText = () => {
        if (inCart) return 'Remove from Cart';
        if (shopMode === 'REPAIR') return 'Queue for Repair';
        return 'Add to Cart';
    };

    return (
        <div className={styles.itemCard}>
            <div className={styles.itemHeader}>
                
                <span className={styles.itemName}>
                    {itemName}
                </span>
                
                {/* Rândul secundar pentru distribuția elementelor */}
                {(!item.isNumeric) && (
                    <div className={styles.metaRow}>
                        <div className={styles.metaLeft}>
                            {itemRank && <span className={styles.rankCircle}>R{itemRank}</span>}
                        </div>
                        
                        <div className={styles.metaCenter}>
                            <span className={styles.itemTypeLabel}>{itemType}</span>
                        </div>
                        
                        <div className={styles.metaRight}>
                            <ItemInfo item={item} />
                        </div>
                    </div>
                )}
                
                {item.isNumeric && (
                    <span className={styles.stockLabel}>
                        (Stock: {item.maxQuantity})
                    </span>
                )}
            </div>

            {item.isNumeric ? (
                <>
                    <div className={styles.statsContainer}>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>
                                {/* Repair does not apply to numeric items like Food/Potions, but adding fallback */}
                                Base {shopMode === 'BUY' ? 'Buy Price' : shopMode === 'REPAIR' ? 'Repair Cost' : 'Value'}:
                            </span>
                            <span className={styles.statValueGold}>
                                {price} C / unit
                            </span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Selected Quantity:</span>
                            <span className={styles.statValueWhite}>{selectedQty} units</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Total Cost:</span>
                            <span className={styles.statValueGold}>
                                {price * selectedQty} C
                            </span>
                        </div>
                    </div>

                    <div className={styles.sliderContainer}>
                        <input
                            type='range'
                            min='1'
                            max={item.maxQuantity}
                            value={selectedQty}
                            onChange={(e) => onSliderChange(item.entityId, e.target.value)}
                            className={styles.sliderInput}
                        />
                        <div className={styles.sliderBox}>{selectedQty}</div>
                    </div>

                    <button
                        onClick={() => onAddToCart(item, selectedQty)}
                        className={inCart ? styles.actionBtnActive : styles.actionBtn}
                    >
                        {inCart ? 'Update Cart' : 'Add to Cart'}
                    </button>
                </>
            ) : (
                <>
                    <div className={styles.statsContainer}>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>
                                {/* NOU: Schimbă eticheta în funcție de modul curent */}
                                {shopMode === 'REPAIR' ? 'Repair Cost:' : shopMode === 'BUY' ? 'Purchase Price:' : 'Sale Value:'}
                            </span>
                            <span className={styles.statValueGold}>{price} C</span>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '10px' }}>
                        <button
                            onClick={() => inCart ? onRemoveFromCart(item.entityId) : onAddToCart(item)}
                            className={inCart ? styles.actionBtnActive : styles.actionBtn}
                        >
                            {/* NOU: Textul butonului adaptat pentru Repair */}
                            {getButtonText()}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopItemCard;