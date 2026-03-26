// File: Client/src/components/shop/ShopCartList.jsx
import styles from '../../styles/ShopView.module.css';

const ShopCartList = ({ cart, getItemPrice, removeFromCart }) => {
    if (cart.length === 0) return null;

    return (
        <div className={styles.cartSection}>
            <div className={styles.cartContainer}>
                <h3 className={styles.cartTitle}>Items in Cart</h3>
                <div className={styles.cartList}>
                    {cart.map((item) => (
                        <div key={item.entityId} className={styles.cartItem}>
                            <span className={styles.cartItemName}>
                                {item.cartQuantity > 1 ? `${item.cartQuantity}x ` : ''}
                                {item.itemName || item.entityName}
                            </span>
                            <div className={styles.cartItemMeta}>
                                <span className={styles.cartItemPrice}>
                                    {getItemPrice(item) * item.cartQuantity} C
                                </span>
                                <button
                                    onClick={() => removeFromCart(item.entityId)}
                                    className={styles.removeBtn}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShopCartList;