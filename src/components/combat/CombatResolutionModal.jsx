import styles from '../../styles/CombatResolutionModal.module.css';
import { DB_COMBAT } from '../../data/DB_Combat.js';
import { WORLD } from '../../data/GameWorld.js';
import useGameState from '../../store/OMD_State_Manager.js';

const formatCombatOutcome = (outcomeCode) => {
    const outcomeMap = {
        WIN_SURRENDER: 'WIN by Enemy Surrender',
        WIN_FLEE: 'WIN by Enemy Fleeing',
        WIN_DEATH: 'WIN by Enemy Death',
        LOSE_SURRENDER: 'DEFEAT by Player Surrender',
        LOSE_FLEE: 'DEFEAT by Player Fleeing',
        LOSE_DEATH: 'DEFEAT (Player Killed)',
    };
    return outcomeMap[outcomeCode] || outcomeCode.replace('_', ' ');
};

const getItemQualityColor = (item) => {
    const q = item?.classification?.itemQuality || 1;
    switch (q) {
        case 1: return '#a1a1aa'; 
        case 2: return '#4ade80'; 
        case 3: return '#3b82f6'; 
        case 4: return '#a855f7'; 
        case 5: return '#fbbf24'; 
        default: return '#a1a1aa';
    }
};

const getDurabilityColor = (durability) => {
    if (typeof durability !== 'number') return '#888';
    if (durability <= 25) return '#a1a1aa'; 
    if (durability <= 50) return '#4ade80'; 
    if (durability <= 75) return '#3b82f6'; 
    if (durability <= 90) return '#a855f7'; 
    return '#fbbf24'; 
};

const CombatResolutionModal = ({ player, knightName, enemy, roundStatus, exitCombatEncounterView }) => {
    const activeCombatType = useGameState((state) => state.activeCombatType);

    let modalTitle = 'Combat Finished';
    let titleClass = styles.drawText;

    if (roundStatus.includes('WIN')) {
        modalTitle = 'Victory';
        titleClass = styles.winText;
    } else if (roundStatus.includes('LOSE')) {
        modalTitle = 'Defeat';
        titleClass = styles.loseText;
    }

    const enemyCategory = enemy?.classification?.entityCategory || 'Human';
    const enemyClass = enemy?.classification?.entityClass || '';
    const ruleData = DB_COMBAT.resolutionConsequences[enemyCategory]?.[activeCombatType]?.[roundStatus];

    // --- CALCUL VIZUAL PENTRU PENALIZĂRI DE MORALITATE ---
    let expRenown = ruleData?.renModifier || 0;
    let expHonor = ruleData?.honModifier || 0;
    let crimeLabel = null;

    const exemptClasses = WORLD.MORALITY.combatConsequences.exemptClasses || ['Outlaw', 'Military'];
    const isCivilianTarget = enemyCategory === 'Human' && !exemptClasses.includes(enemyClass);

    if (isCivilianTarget) {
        if (activeCombatType === 'DMF') {
            expHonor += WORLD.MORALITY.combatConsequences.unprovokedLethal.honorChange;
            expRenown += WORLD.MORALITY.combatConsequences.unprovokedLethal.renownChange;
            crimeLabel = "Unprovoked Lethal Assault";
        } else if (activeCombatType === 'NF' || activeCombatType === 'FF') {
            expHonor += WORLD.MORALITY.combatConsequences.unprovokedNonLethal.honorChange;
            expRenown += WORLD.MORALITY.combatConsequences.unprovokedNonLethal.renownChange;
            crimeLabel = "Unprovoked Assault";
        }
    }

    const expCoinsWon = ruleData?.coinYieldPct > 0 && enemy?.inventory?.silverCoins ? Math.floor(enemy.inventory.silverCoins * ruleData.coinYieldPct) : 0;
    const expCoinsLost = ruleData?.coinPenaltyPct > 0 && player?.inventory?.silverCoins ? Math.floor(player.inventory.silverCoins * ruleData.coinPenaltyPct) : 0;
    const expFood = ruleData?.foodYieldPct > 0 && enemy?.logistics?.foodYield ? Math.floor(enemy.logistics.foodYield * ruleData.foodYieldPct) : 0;
    const lostItems = ruleData?.playerEquipmentLoss;

    const lootedEquipment = [];
    if (ruleData?.equipmentDrop && enemy?.inventory?.itemSlots) {
        const equipIds = [enemy.equipment?.weaponId, enemy.equipment?.armourId, enemy.equipment?.shieldId, enemy.equipment?.helmetId].filter(Boolean);

        equipIds.forEach((id) => {
            const item = enemy.inventory.itemSlots.find((i) => i.entityId === id);
            if (item) {
                lootedEquipment.push(item);
            }
        });
    }

    const hasRandomLoot = ruleData?.tableLootYieldPct > 0 && enemy?.inventory?.lootSlots?.length > 0;

    return (
        <div className={styles.resolutionOverlay}>
            <div className={styles.resolutionModal}>
                <h2 className={`${styles.resolutionTitle} ${titleClass}`}>{modalTitle}</h2>

                <div className={styles.resolutionSummaryBox}>
                    <div className={styles.resolutionSummaryHeader}>Combat Summary</div>

                    <div className={styles.resolutionSummaryRow}>
                        <span className={styles.resolutionSummaryLabel}>{knightName || 'You'}:</span>
                        <span className={styles.resolutionSummaryPlayerHp}>
                            {player.biology.hpCurrent} / {player.biology.hpMax} HP
                        </span>
                    </div>

                    <div className={styles.resolutionSummaryRow}>
                        <span className={styles.resolutionSummaryLabel}>{enemy.entityName || enemy.name}:</span>
                        <span className={styles.resolutionSummaryEnemyHp}>
                            {enemy.biology.hpCurrent} / {enemy.biology.hpMax} HP
                        </span>
                    </div>

                    <div className={styles.resolutionSummaryResult}>Result: {formatCombatOutcome(roundStatus)}</div>

                    {ruleData && (
                        <div style={{ marginTop: '20px', borderTop: '1px dashed #444', paddingTop: '15px' }}>
                            <div style={{ color: '#aaa', marginBottom: '10px', fontSize: '1.2rem', textTransform: 'uppercase' }}>Consequences:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '1.2rem', fontFamily: "'VT323', monospace" }}>
                                
                                {crimeLabel && (
                                    <span style={{ color: '#ef4444', marginBottom: '5px' }}>⚠️ Crime: {crimeLabel}</span>
                                )}

                                {expRenown !== 0 && (
                                    <span style={{ color: expRenown > 0 ? '#10b981' : '#ef4444' }}>Renown {expRenown > 0 ? `+${expRenown}` : expRenown}</span>
                                )}

                                {expHonor !== 0 && (
                                    <span style={{ color: expHonor > 0 ? '#10b981' : '#ef4444' }}>Honor {expHonor > 0 ? `+${expHonor}` : expHonor}</span>
                                )}

                                {expCoinsWon > 0 && <span style={{ color: '#fffa7b' }}>+{expCoinsWon} Silver Coins</span>}
                                {expCoinsLost > 0 && <span style={{ color: '#ef4444' }}>-{expCoinsLost} Silver Coins</span>}
                                {expFood > 0 && <span style={{ color: '#10b981' }}>+{expFood} Food Supplies</span>}

                                {lootedEquipment.length > 0 && (
                                    <div style={{ color: '#aaa', display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                                        <span style={{ marginBottom: '5px' }}>Looted Equipment:</span>
                                        {lootedEquipment.map((item, index) => {
                                            const tier = item.classification?.itemTier || '-';
                                            const durCurrent = item.state?.currentDurability ?? '-';
                                            return (
                                                <div key={index} className={styles.lootItemRow}>
                                                    <span className={styles.durabilityText} style={{ color: getDurabilityColor(durCurrent), textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                                                        (D:{durCurrent})
                                                    </span>
                                                    <span className={styles.smallRankCircle}>{tier}</span>
                                                    <span style={{ fontSize: '1.1rem', color: getItemQualityColor(item), textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                                                        {item.itemName || item.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {hasRandomLoot && <span style={{ color: '#3b82f6' }}>+ Harvested random materials</span>}
                                {lostItems && <span style={{ color: '#ef4444' }}>Lost Equipped Gear</span>}

                                {expRenown === 0 && expHonor === 0 && expCoinsWon === 0 && expCoinsLost === 0 && expFood === 0 && lootedEquipment.length === 0 && !hasRandomLoot && !lostItems && (
                                    <span style={{ color: '#888' }}>No significant changes.</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    className={styles.exitBtn}
                    onClick={exitCombatEncounterView}
                >
                    Confirm & Exit
                </button>
            </div>
        </div>
    );
};

export default CombatResolutionModal;