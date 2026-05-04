// File: Client/src/components/engineViews/InteractionModal.jsx
import { useState } from 'react';
import { DB_INTERACTION_ACTIONS } from '../../data/DB_Interaction_Actions.js';
import NpcAvatar from '../NpcAvatar';
import { getEntityAvatar, getFallbackAvatar } from '../../utils/AvatarResolver';
import styles from '../../styles/GameViewport.module.css';

const InteractionModal = ({ npc, playerAp, onActionClick, onCancel }) => {
	const [showCriminal, setShowCriminal] = useState(false);
	const [showTheft, setShowTheft] = useState(false);
	const [showChallenge, setShowChallenge] = useState(false);

	if (!npc) return null;

	const npcCategory = npc.classification?.entityCategory || 'Human';
	const npcClass = npc.classification?.entityClass || 'Unknown Class';
	const npcSubclass = npc.classification?.entitySubclass || null;
	const npcRank =
		npc.classification?.entityRank || npc.classification?.poiRank || 1;

	const npcPrimaryAvatar = getEntityAvatar(npcCategory, npcClass, npcSubclass);
	const npcFallbackAvatar = getFallbackAvatar(npcCategory);

	const criminalTagsDef = [
		'Combat_Engage',
		'Target_Ambush',
		'Target_Assassination',
	];
	const theftTagsDef = [
		'Target_Robbery',
		'Target_Steal_Coin',
		'Target_Steal_Food',
	];
	const challengeTagsDef = ['Combat_Training', 'Combat_Duel', 'Combat_Brawl'];

	const allTags = npc.interactions?.actionTags || [];

	const getSortPriority = (tag) => {
		if (tag.startsWith('Labor_')) return 10;
		if (tag.startsWith('Heal_') || tag.startsWith('Cure_')) return 20;
		if (tag.startsWith('Repair_') || tag === 'Service_Lodging') return 30;
		if (tag.startsWith('Trade_')) return 40;
		if (tag.startsWith('Train_')) return 50;
		if (tag.startsWith('Donate_')) return 60;
		return 100;
	};

	const criminalTags = allTags
		.filter((tag) => criminalTagsDef.includes(tag))
		.sort((a, b) => criminalTagsDef.indexOf(a) - criminalTagsDef.indexOf(b));
	const theftTags = allTags
		.filter((tag) => theftTagsDef.includes(tag))
		.sort((a, b) => theftTagsDef.indexOf(a) - theftTagsDef.indexOf(b));
	const challengeTags = allTags
		.filter((tag) => challengeTagsDef.includes(tag))
		.sort(
			(a, b) => challengeTagsDef.indexOf(a) - challengeTagsDef.indexOf(b),
		);

	const normalTags = allTags
		.filter(
			(tag) =>
				!criminalTagsDef.includes(tag) &&
				!theftTagsDef.includes(tag) &&
				!challengeTagsDef.includes(tag) 
		)
		.sort((a, b) => {
			const priorityA = getSortPriority(a);
			const priorityB = getSortPriority(b);
			if (priorityA !== priorityB) return priorityA - priorityB;
			return a.localeCompare(b);
		});

	const renderActionButton = (tag) => {
		const actionDef = DB_INTERACTION_ACTIONS[tag];
		if (!actionDef) return null;

		const isApSufficient = playerAp >= actionDef.apCost;

		const getActionIcon = (actionTag) => {
			if (actionTag === 'Combat_Engage' || actionTag.startsWith('Fight_'))
				return '⚔️-🩸';
			if (actionTag === 'Combat_Duel') return '⚔️-🤺';
			if (actionTag === 'Combat_Training') return '⚔️-🛡️';
			if (actionTag === 'Combat_Brawl') return '⚔️-👊';
			if (actionTag === 'Target_Steal_Coin') return '🥷-🪙';
			if (actionTag === 'Target_Steal_Food') return '🥷-🍎';
			if (actionTag === 'Target_Steal_Animal') return '🥷-🐄';
			if (actionTag === 'Target_Robbery') return '🥷-💰';
			if (actionTag === 'Target_Assassination') return '🥷-☠️';
			if (actionTag.includes('Ambush')) return '🥷-🗡️';
			if (actionTag === 'Target_Bribe') return '🤫-💰';
			if (actionTag === 'Train_STR') return '📜-💪';
			if (actionTag === 'Train_AGI') return '📜-🎯';
			if (actionTag === 'Train_INT') return '📜-🧠';
			if (actionTag === 'Labor_Coin') return '⚒️-🪙';
			if (actionTag === 'Labor_Food') return '⚒️-🍎';
			if (actionTag.startsWith('Heal_')) return '💊-❤️‍🩹';
			if (actionTag.startsWith('Cure_')) return '💊-⚕️';
			if (actionTag === 'Donate_Pray') return '🙏-🕯️';
			if (actionTag === 'Donate_Coin') return '🙏-💸';
			if (actionTag === 'Donate_Food') return '🙏-🥣';
			if (actionTag === 'Repair_Equipment') return '🛠️-⚙️';
			if (actionTag === 'Service_Lodging') return '⛺-🛏️';
			if (actionTag === 'Hunt_Animal') return '🏹-🦌';
			if (actionTag.startsWith('Evade_')) return '💨-🏃';
			if (actionTag === 'Trade_Weapon') return '⚖️-⚔️';
			if (actionTag === 'Trade_Armor') return '⚖️-🛡️';
			if (actionTag === 'Trade_Shield') return '⚖️-🛡️';
			if (actionTag === 'Trade_Helmet') return '⚖️-🛡️';
			if (actionTag === 'Trade_Food') return '⚖️-🍞';
			if (actionTag === 'Trade_Potion') return '⚖️-🧪';
			if (actionTag === 'Trade_Mount') return '⚖️-🐎';
			if (actionTag === 'Trade_Animal') return '⚖️-🐄';
			if (actionTag === 'Trade_Coin') return '⚖️-🪙';
			if (actionTag === 'Trade_Loot') return '⚖️-💎';
			if (actionTag === 'Ignore') return '🚶-💨';
			return '⚡-❓';
		};

		let costClass = styles.costPaid;
		if (actionDef.apCost === 0) {
			costClass = styles.costFree;
		} else if (!isApSufficient) {
			costClass = styles.costUnmet;
		}

		return (
			<button
				key={tag}
				className={styles.btnAction}
				onClick={() => onActionClick(tag, npc.entityId || npc.id)}
				title={actionDef.description}
				disabled={!isApSufficient}
			>
				<span className={styles.actionName}>{tag.replace(/_/g, ' ')}</span>
				<span className={styles.routeIcon}>{getActionIcon(tag)}</span>
				<span className={`${styles.actionCost} ${costClass}`}>
					{actionDef.apCost}
					<span className={styles.apSymbol}>◈</span>
				</span>
			</button>
		);
	};

	return (
		<div className={styles.interactModalOverlay} onClick={onCancel}>
			<div
				className={styles.interactModalContent}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={styles.modalAvatarContainer}>
					<NpcAvatar
						src={npcPrimaryAvatar || '/avatars/default_npc.png'}
						rank={npcRank}
						size='100%'
						alt={npc.entityName || npc.name}
						onError={(e) => {
							const currentSrc = e.target.src;
							const classFallback = getEntityAvatar(
								npcCategory,
								npcClass,
								null,
							);
							const finalFallback =
								npcFallbackAvatar || '/avatars/default_npc.png';

							if (
								classFallback &&
								!currentSrc.includes(classFallback) &&
								!currentSrc.includes(finalFallback)
							) {
								e.target.src = classFallback;
							} else if (!currentSrc.includes(finalFallback)) {
								e.target.src = finalFallback;
							}
						}}
					/>
				</div>

				<h3 className={styles.interactHeader}>
					Interact: {npc.entityName || npc.name}
				</h3>

				{normalTags.map(renderActionButton)}

				{/* Display hostile sub-menus exclusively for Human entities */}
				{npcCategory === 'Human' && (
					<>
						<div className={styles.hostileSection}>
							<button
								className={`${styles.btnHostileToggle} ${challengeTags.length > 0 ? styles.hostileToggleActiveChallenge : styles.hostileToggleDisabled}`}
								onClick={() =>
									challengeTags.length > 0 &&
									setShowChallenge(!showChallenge)
								}
								disabled={challengeTags.length === 0}
							>
								<span>⚔️ Challenges & Sparring</span>
								<span>
									{challengeTags.length === 0
										? '🔒'
										: showChallenge
											? '▲'
											: '▼'}
								</span>
							</button>
							{showChallenge && challengeTags.length > 0 && (
								<div className={styles.hostileActionContainer}>
									{challengeTags.map(renderActionButton)}
								</div>
							)}
						</div>

						<div className={styles.hostileSection}>
							<button
								className={`${styles.btnHostileToggle} ${theftTags.length > 0 ? styles.hostileToggleActiveTheft : styles.hostileToggleDisabled}`}
								onClick={() =>
									theftTags.length > 0 && setShowTheft(!showTheft)
								}
								disabled={theftTags.length === 0}
							>
								<span>🥷 Theft & Robbery</span>
								<span>
									{theftTags.length === 0
										? '🔒'
										: showTheft
											? '▲'
											: '▼'}
								</span>
							</button>
							{showTheft && theftTags.length > 0 && (
								<div className={styles.hostileActionContainer}>
									{theftTags.map(renderActionButton)}
								</div>
							)}
						</div>

						<div className={styles.hostileSection}>
							<button
								className={`${styles.btnHostileToggle} ${criminalTags.length > 0 ? styles.hostileToggleActiveLethal : styles.hostileToggleDisabled}`}
								onClick={() =>
									criminalTags.length > 0 &&
									setShowCriminal(!showCriminal)
								}
								disabled={criminalTags.length === 0}
							>
								<span>⚠️ Lethal Actions</span>
								<span>
									{criminalTags.length === 0
										? '🔒'
										: showCriminal
											? '▲'
											: '▼'}
								</span>
							</button>
							{showCriminal && criminalTags.length > 0 && (
								<div className={styles.hostileActionContainer}>
									{criminalTags.map(renderActionButton)}
								</div>
							)}
						</div>
					</>
				)}

				<button className={styles.btnCancel} onClick={onCancel}>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default InteractionModal;
