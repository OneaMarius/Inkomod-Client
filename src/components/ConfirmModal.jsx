import styles from '../styles/ConfirmModal.module.css';
import Button from './Button';

const ConfirmModal = ({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
}) => {
	if (!isOpen) return null;

	return (
		<div className={styles.modalOverlay} onClick={onCancel}>
			{/* e.stopPropagation() prevents clicking inside the modal from closing it */}
			<div
				className={styles.modalContent}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className={styles.modalTitle}>{title}</h2>
				<p className={styles.modalMessage}>{message}</p>

				<div className={styles.modalActions}>
					<Button onClick={onCancel} className={styles.cancelBtn}>
						{cancelText}
					</Button>
					<Button onClick={onConfirm} className={styles.confirmBtn}>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
