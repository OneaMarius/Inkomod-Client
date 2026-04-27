// File: Client/src/engine/ENGINE_Quests.js

export const QUEST_REGISTRY = {
	Present_Trophies: {
		execute: (playerEntity) => {
			const requiredTrophies = 7;
			const currentTrophies = playerEntity.inventory.trophySlots ? playerEntity.inventory.trophySlots.length : 0;

			if (currentTrophies === 0) {
				return {
					status: 'TRIGGER_DYNAMIC_EVENT',
					isQuestCompleted: false,
					eventData: {
						id: 'evt_king_rejection_0',
						name: 'Audience with King Midas',
						typology: 'Encounter',
						eventType: 'NEUTRAL',
						description: `King Midas glares down from his golden throne. "You stand before me empty-handed... Bring me ${requiredTrophies} unique Nephilim heads."`,
						choices: [
							{
								id: 'ch_palace_exit',
								label: 'I will return with proof',
								checkType: 'GENERAL',
								onSuccess: { description: 'You bow quickly and leave.' },
							},
						],
					},
					updatedPlayer: playerEntity,
				};
			} else if (currentTrophies > 0 && currentTrophies < requiredTrophies) {
				const missing = requiredTrophies - currentTrophies;
				return {
					status: 'TRIGGER_DYNAMIC_EVENT',
                    isQuestCompleted: false,
					eventData: {
						id: 'evt_king_rejection_mid',
						name: 'Audience with King Midas',
						typology: 'Encounter',
						eventType: 'NEUTRAL',
						description: `King Midas inspects the ${currentTrophies} trophies. "A fine start. Bring me ${missing} more unique heads."`,
						choices: [
							{ id: 'ch_palace_exit', label: 'The hunt continues', checkType: 'GENERAL', onSuccess: { description: 'You depart to finish the task.' } },
						],
					},
					updatedPlayer: playerEntity,
				};
			} else if (currentTrophies === requiredTrophies) {
				return {
					status: 'TRIGGER_DYNAMIC_EVENT',
					isQuestCompleted: true,
					eventData: {
						id: 'evt_king_victory_7',
						name: 'CHAMPION OF THE REALM',
						typology: 'Encounter',
						eventType: 'POSITIVE',
						description: `You present exactly ${currentTrophies} severed heads to the King. \n\n"The prophecy is fulfilled! You are named Champion of the Realm!"`,
						choices: [{ id: 'ch_claim_glory', label: 'Claim Glory', checkType: 'GENERAL', onSuccess: { renown: 500, honor: 100, triggerVictory: 'Champion of the Realm' } }],
					},
					updatedPlayer: playerEntity,
				};
			} else if (currentTrophies > requiredTrophies) {
				return {
					status: 'TRIGGER_DYNAMIC_EVENT',
					isQuestCompleted: true,
					eventData: {
						id: 'evt_king_victory_max',
						name: 'GODSLAYER OF THE REALM',
						typology: 'Encounter',
						eventType: 'POSITIVE',
						description: `You pour an astonishing ${currentTrophies} severed heads onto the marble floor. \n\n"You are no mere champion, you are a Godslayer!"`,
						choices: [{ id: 'ch_claim_ultimate_glory', label: 'Claim Ultimate Glory', checkType: 'GENERAL', onSuccess: { renown: 500, honor: 100, triggerVictory: 'Godslayer' } }],
					},
					updatedPlayer: playerEntity,
				};
			}
		},
	},

	// Example of how easy it is to add a future quest:
	// Deliver_Iron: {
	//     execute: (playerEntity) => { ... logic ... }
	// }
};
