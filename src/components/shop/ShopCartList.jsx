// File: Client/src/components/shop/ShopCartList.jsx
import styles from '../../styles/ShopView.module.css';
import Button from '../Button';
import { preloadAudio, playImmediateSound } from '../Button';
import { useEffect } from 'react';

const ShopCartList = ({ cart, getItemPrice, removeFromCart }) => {
	if (cart.length === 0) return null;

	const soundPath = '/assets/sounds/click0.wav';
	const volumeLevel = 0.25;
	useEffect(() => {
		preloadAudio(soundPath);
	}, []);

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
								<Button
									onClick={() => {
										playImmediateSound(soundPath, volumeLevel);
										removeFromCart(item.entityId);
									}}
									className={styles.removeBtn}
								>
									×
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ShopCartList;
