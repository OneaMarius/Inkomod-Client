// File: Client/src/components/engineViews/NpcCard.jsx
import NpcInfo from '../NpcInfo';
import NpcAvatar from '../NpcAvatar';
import { getEntityAvatar, getFallbackAvatar } from '../../utils/AvatarResolver';
import styles from '../../styles/GameViewport.module.css';

const NpcCard = ({ npc, onInteract }) => {
    const npcCategory = npc.classification?.entityCategory || 'Human';
    const npcClass = npc.classification?.entityClass || 'Unknown Class';
    const npcSubclass = npc.classification?.entitySubclass || npc.title || 'Unknown';
    const npcRank = npc.classification?.entityRank || npc.classification?.poiRank || '?';

    const npcPrimaryAvatar = getEntityAvatar(npcCategory, npcClass, npcSubclass);
    const npcFallbackAvatar = getFallbackAvatar(npcCategory);

    return (
        <div className={styles.npcCardCompact}>
            {/* Column 1: Nomenclature and Classification */}
            <div className={styles.npcCardLeft}>
                <strong className={styles.npcNameCompact}>
                    {npc.entityName || npc.name || 'Unknown Entity'}
                </strong>
                <div className={styles.npcMetaCompact}>
                    <div className="badgeContainer">
                        <div className="badgeCircle badgeRank" title="Entity Rank">
                            R{npcRank}
                        </div>
                        {npc.classification?.entityQuality && (
                            <div className={`badgeCircle badgeQ${npc.classification.entityQuality}`} title="Entity Quality">
                                Q{npc.classification.entityQuality}
                            </div>
                        )}
                    </div>
                    <span className={styles.npcSubclassCompact}>{npcSubclass}</span>
                </div>
            </div>

            {/* Column 2: Avatar Rendering */}
            <div className={styles.npcCardCenter}>
                <NpcAvatar
                    src={npcPrimaryAvatar || '/avatars/default_npc.png'}
                    rank={npcRank}
                    size="130px"
                    alt={npc.entityName || npc.name}
                    onError={(e) => {
                        const currentSrc = e.target.src;
                        const classFallback = getEntityAvatar(npcCategory, npcClass, null);
                        const finalFallback = npcFallbackAvatar || '/avatars/default_npc.png';

                        if (classFallback && !currentSrc.includes(classFallback) && !currentSrc.includes(finalFallback)) {
                            e.target.src = classFallback;
                        } else if (!currentSrc.includes(finalFallback)) {
                            e.target.src = finalFallback;
                        }
                    }}
                />
            </div>

            {/* Column 3: Interaction Triggers */}
            <div className={styles.npcCardRight}>
                <div className={styles.infoWrapper}>
                    <NpcInfo npc={npc} />
                </div>
                <button className={styles.btnActionIcon} onClick={onInteract}>
                    <span className={styles.iconLarge}>💬</span>
                    <span className={styles.iconLabel}>ACTION</span>
                </button>
            </div>
        </div>
    );
};

export default NpcCard;