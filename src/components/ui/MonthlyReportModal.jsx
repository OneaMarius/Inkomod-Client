// File: Client/src/components/ui/MonthlyReportModal.jsx
import React from 'react';
import Button from '../Button'; // Ajustează calea dacă Button e în altă parte

const MonthlyReportModal = ({ monthlyReportData, closeMonthlyReport, getFoodColorClass, styles }) => {
    if (!monthlyReportData) return null;

    // --- FIX: Calculăm HP-ul total adunând vindecarea standard (hpChange) cu bonusul nostru din AP (hpGained) ---
    const baseHp = monthlyReportData.hpChange || 0;
    const bonusHp = monthlyReportData.hpGained || 0;
    const totalHpChange = baseHp + bonusHp;

    return (
        <div className={styles.modalOverlay} style={{ zIndex: 1500 }}>
            <div className={styles.menuModal} style={{ border: '1px solid var(--gold-primary)', minWidth: '300px' }}>
                <h2 style={{ color: 'var(--gold-primary)', marginBottom: '10px' }}>Monthly Report</h2>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
                    A summary of your survival logistics over the past month.
                </p>

                <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                    
                    {/* FOOD ROW */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#ccc' }}>Food Consumed:</span>
                        <span className={`${styles.textBold} ${getFoodColorClass(monthlyReportData.foodConsumed)}`}>
                            {monthlyReportData.foodConsumed > 0 ? `-${monthlyReportData.foodConsumed}` : '0'}
                        </span>
                    </div>

                    {/* HEALTH ROW (Total HP) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: (monthlyReportData.animalsSacrificed > 0 || monthlyReportData.healthEvents?.length > 0) ? '10px' : '0' }}>
                        <span style={{ color: '#ccc' }}>Health (HP):</span>
                        <span className={`${styles.textBold} ${totalHpChange > 0 ? styles.textSuccess : totalHpChange < 0 ? styles.textDanger : styles.textNeutral}`}>
                            {totalHpChange > 0 ? `+${totalHpChange}` : totalHpChange}
                        </span>
                    </div>

                    {/* --- NOU: HEALTH EVENTS (AP Conversion & Starvation logs) --- */}
                    {monthlyReportData.healthEvents && monthlyReportData.healthEvents.length > 0 && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #333' }}>
                            {monthlyReportData.healthEvents.map((msg, idx) => {
                                const isWarning = msg.includes('Starvation');
                                return (
                                    <div key={idx} style={{ color: isWarning ? '#ef4444' : '#4ade80', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', marginBottom: '4px' }}>
                                        {msg}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ANIMALS SACRIFICED ROW */}
                    {monthlyReportData.animalsSacrificed > 0 && (
                        <>
                            <div style={{ width: '100%', height: '1px', backgroundColor: '#333', margin: '10px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ color: '#ccc' }}>Animals Sacrificed:</span>
                                <span className={styles.textDanger}>{monthlyReportData.animalsSacrificed}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#ccc' }}>Meat Yield Recovered:</span>
                                <span className={styles.textSuccess}>+{monthlyReportData.meatHarvested} Food</span>
                            </div>
                        </>
                    )}
                </div>

                {/* MOUNT STATUS */}
                {monthlyReportData.mountDied && (
                    <div style={{ color: 'var(--danger-red)', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                        TRAGIC LOSS: Your mount has succumbed to starvation and perished.
                    </div>
                )}
                {!monthlyReportData.mountDied && monthlyReportData.mountStarvationDamage > 0 && (
                    <div style={{ color: 'orange', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
                        MOUNT STATUS: Starving. Lost {monthlyReportData.mountStarvationDamage} HP this month.
                    </div>
                )}

                {/* PLAYER STARVATION */}
                {monthlyReportData.isStarving && (
                    <div style={{ color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
                        WARNING: Insufficient food. Starvation damage applied. Dropping below 25 HP will result in death.
                    </div>
                )}

                {/* RANK PROMOTION / SOCIAL EVENTS */}
                {monthlyReportData.socialEvents && monthlyReportData.socialEvents.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold-primary)', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
                        <h4 style={{ color: 'var(--gold-primary)', margin: '0 0 5px 0', fontSize: '0.9rem' }}>RANK PROMOTION</h4>
                        {monthlyReportData.socialEvents.map((msg, idx) => (
                            <p key={idx} style={{ color: '#fff', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
                                "{msg}"
                            </p>
                        ))}
                    </div>
                )}

                <Button onClick={closeMonthlyReport} variant='primary' style={{ width: '100%' }}>
                    Acknowledge
                </Button>
            </div>
        </div>
    );
};

export default MonthlyReportModal;