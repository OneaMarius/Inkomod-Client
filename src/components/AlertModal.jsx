// File: Client/src/components/AlertModal.jsx
import React from 'react';
import styles from '../styles/ConfirmModal.module.css'; // Refolosim stilurile existente

const AlertModal = ({ isOpen, title, message, onClose, buttonText = 'OK' }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>{title}</h2>
                <p className={styles.modalMessage}>{message}</p>

                <div className={styles.modalActions} style={{ justifyContent: 'center' }}>
                    <button className={styles.confirmBtn} onClick={onClose}>
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;