// File: Client/src/engine/ENGINE_DebugHelpers.js
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';

// Importăm sursele de adevăr (baza de date și constantele globale)
import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';
import { DB_ITEM_NOMENCLATURE } from '../data/DB_Items.js';

export const DebugFactory = {
	createRandomEquipment: () => {
		const categories = DB_ITEM_NOMENCLATURE.categories; // 2. Update this reference
		const randomCat =
			categories[Math.floor(Math.random() * categories.length)];

		return generateItem(randomCat, null, 'Trade');
	},

	createRandomAnimal: () => {
		// 50% șansă să generăm un Mount (Cal), 50% șansă pentru un animal domestic
		if (Math.random() > 0.5) {
			// Nu mai trimitem 3, lăsăm engine-ul să genereze rank random
			return generateHorseMount();
		} else {
			// Citim lista oficială: ['Sheep', 'Goat', 'Pig', 'Cow']
			const domesticTypes = DB_NPC_TAXONOMY.Animal.subclasses.Domestic;
			const randomType =
				domesticTypes[Math.floor(Math.random() * domesticTypes.length)];

			return generateAnimalNPC(randomType);
		}
	},

	createRandomResources: () => {
		return {
			coins: Math.floor(Math.random() * 50) + 10, // Între 10 și 60 Coins
			food: Math.floor(Math.random() * 20) + 10, // Între 10 și 30 Food
		};
	},
};
