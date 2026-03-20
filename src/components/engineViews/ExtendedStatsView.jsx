// File: Client/src/components/engineViews/ExtendedStatsView.jsx
import useGameState from '../../store/OMD_State_Manager';
import { calculateDerivedStats } from '../../engine/ENGINE_Inventory';
import styles from '../../styles/ExtendedStatsView.module.css';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const ExtendedStatsView = () => {
    const player = useGameState((state) => state.gameState?.player);
    const time = useGameState((state) => state.gameState?.time);

    if (!player || !time) return <div className={styles.container}>Loading Registry...</div>;

    const { identity, stats, progression, equipment } = player;
    
    // Timpul derivat
    const seasonName = time.activeSeason 
        ? time.activeSeason.charAt(0).toUpperCase() + time.activeSeason.slice(1) 
        : 'Unknown';
    const currentMonthName = MONTH_NAMES[time.currentMonth - 1] || 'Unknown';

    // Statisticile derivate (Combat Rating)
    const { totalAdp, totalDdr } = calculateDerivedStats(player);

    // Funcție asistent pentru randarea pieselor de echipament (cu durabilitate)
    const renderEquipSummary = (label, itemObject, isEquipped) => {
        if (!isEquipped || !itemObject) {
            return (
                <div className={styles.equipSlotEmpty}>
                    <span className={styles.equipLabel}>{label}:</span> None
                </div>
            );
        }
        
        const name = itemObject.itemName || itemObject.entityName || itemObject.name;
        const curDur = itemObject.state?.currentDurability || 0;
        const maxDur = itemObject.state?.maxDurability || 0;
        const rank = itemObject.classification?.itemTier || itemObject.classification?.entityRank;

        return (
            <div className={styles.equipSlotFilled}>
                <div className={styles.equipNameRow}>
                    <span className={styles.equipLabel}>{label}:</span> 
                    <span className={styles.equipName}>{name}</span>
                </div>
                <div className={styles.equipMetaRow}>
                    {rank && <span className={styles.rankBadge}>Rank {rank}</span>}
                    {label !== 'Mount' && (
                        <span className={styles.durabilityBadge}>
                            Cond: {curDur}/{maxDur}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Knight Registry</h2>
            
            {/* Secțiunea 1: Timeline & Identity */}
            <div className={styles.timelineBox}>
                <div className={styles.timelineRow}>
                    <span>Year {time.currentYear}</span>
                    <span>Turn {time.currentTurn || 1}</span>
                </div>
                <div className={styles.timelineRowGold}>
                    <span>{currentMonthName}</span>
                    <span>{seasonName}</span>
                </div>
                <div className={styles.timelineRowAlt}>
                    <span>Age: {identity.age}</span>
                    <span>Total Months: {time.totalMonthsPassed}</span>
                </div>
            </div>

            {/* Secțiunea 2: Atribute de Bază (Native) */}
            <h3 className={styles.subHeader}>Core Attributes</h3>
            <div className={styles.grid}>
                <div className={styles.statBox}>
                    <span className={styles.label}>STR</span>
                    <span className={styles.value}>{stats.str}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.label}>AGI</span>
                    <span className={styles.value}>{stats.agi}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.label}>INT</span>
                    <span className={styles.value}>{stats.int}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.label}>CHA</span>
                    <span className={styles.value}>{stats.cha || 5}</span>
                </div>
            </div>

            {/* Secțiunea 3: Combat Ratings (Derivate cu Echipament) */}
            <h3 className={styles.subHeader}>Combat Rating (Total)</h3>
            <div className={styles.grid}>
                <div className={`${styles.statBox} ${styles.highlightGold}`}>
                    <span className={styles.label}>Attack (ADP)</span>
                    <span className={styles.value}>{totalAdp}</span>
                </div>
                <div className={`${styles.statBox} ${styles.highlightGold}`}>
                    <span className={styles.label}>Defense (DDR)</span>
                    <span className={styles.value}>{totalDdr}</span>
                </div>
            </div>

            {/* Secțiunea 4: Social Standing */}
            <h3 className={styles.subHeader}>Social Standing</h3>
            <div className={styles.grid}>
                <div className={styles.statBox}>
                    <span className={styles.label}>Renown</span>
                    <span className={styles.valueWhite}>{progression.renown}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.label}>Honor</span>
                    <span className={styles.valueWhite}>{progression.honor}</span>
                </div>
            </div>

            {/* Secțiunea 5: Active Loadout Summary */}
            <h3 className={styles.subHeader}>Active Loadout</h3>
            <div className={styles.equipContainer}>
                {renderEquipSummary('Weapon', equipment.weaponItem, equipment.hasWeapon)}
                {renderEquipSummary('Shield', equipment.shieldItem, equipment.hasShield)}
                {renderEquipSummary('Armour', equipment.armourItem, equipment.hasArmour)}
                {renderEquipSummary('Helmet', equipment.helmetItem, equipment.hasHelmet)}
                {renderEquipSummary('Mount', equipment.mountItem, equipment.hasMount)}
            </div>
        </div>
    );
};

export default ExtendedStatsView;