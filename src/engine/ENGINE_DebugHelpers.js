// File: Client/src/engine/ENGINE_DebugHelpers.js
import { generateItem } from './ENGINE_EquipmentCreation.js';
import { generateHorseMount } from './ENGINE_MountCreation.js';
import { generateAnimalNPC } from './ENGINE_AnimalCreation.js';

// Importăm sursele de adevăr (baza de date și constantele globale)
import { WORLD } from '../data/GameWorld.js';
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';

export const DebugFactory = {
	createRandomEquipment: () => {
		// Citim categoriile oficiale: ['Weapon', 'Shield', 'Helmet', 'Armour']
		const categories = WORLD.ITEM.nomenclature.categories;
		const randomCat =
			categories[Math.floor(Math.random() * categories.length)];

		const randomTier = Math.floor(Math.random() * 3) + 1; // Tier 1-3 pentru inceput
		return generateItem(randomCat, randomTier, 'Trade');
	},

	createRandomAnimal: () => {
		// 50% șansă să generăm un Mount (Cal), 50% șansă pentru un animal domestic
		if (Math.random() > 0.5) {
			return generateHorseMount(1); // Generăm mereu un cal de Rank 1 pentru teste
		} else {
			// Citim lista oficială: ['Sheep', 'Goat', 'Pig', 'Cow']
			const domesticTypes = DB_NPC_TAXONOMY.Animal.subclasses.Domestic;
			const randomType =
				domesticTypes[Math.floor(Math.random() * domesticTypes.length)];

			return generateAnimalNPC(randomType);
		}
	},
};
