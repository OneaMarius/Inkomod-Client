// File: Client/src/utils/AvatarResolver.js
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';

/**
 * Generates the primary avatar path based on category, class, or subclass.
 */
export const getEntityAvatar = (entityCategory, entityClass, entitySubclass) => {
	if (!entityCategory) return '/avatars/default_npc.png';

	// Route identifier based on category structure
	let identifier = null;

	if (entityCategory === 'Human') {
		identifier = entityClass || entitySubclass;
	} else {
		identifier = entitySubclass || entityClass;
	}

	if (!identifier || identifier === 'Unknown') return getFallbackAvatar(entityCategory);

	const folder = `${entityCategory.toLowerCase()}s`;
	let fileName = identifier.toLowerCase().replace(/ /g, '_');

	const horseNames = DB_NPC_TAXONOMY?.Animal?.nomenclature?.Mount?.Horse?.baseNamesByRank?.flat().map((name) => name.toLowerCase().replace(/ /g, '_')) || [];

	if (horseNames.includes(fileName) || fileName === 'horse') {
		fileName = 'horse';
	}

	// Standardized extension
	return `/avatars/${folder}/${fileName}.png`;
};

/**
 * Returns the specific category default image.
 */
export const getFallbackAvatar = (entityCategory) => {
	switch (entityCategory) {
		case 'Human':
			return '/avatars/default_human.png';
		case 'Animal':
			return '/avatars/default_animal.png';
		case 'Monster':
			return '/avatars/default_monster.png';
		case 'Nephilim':
			return '/avatars/default_nephilim.png';
		default:
			return '/avatars/default_npc.png';
	}
};

/**
 * Identifies the entity category based on a string name.
 */
export const identifyEntityFromName = (entityName) => {
	if (!entityName) return { category: null, subclass: null };

	const nameLower = entityName.toLowerCase().replace(/_/g, ' ');
	const normalizeArray = (arr) => arr.flat().map((name) => name.toLowerCase().replace(/_/g, ' '));

	const monsters = normalizeArray(Object.values(DB_NPC_TAXONOMY.Monster.subclasses));
	const nephilims = normalizeArray(Object.values(DB_NPC_TAXONOMY.Nephilim.subclasses));
	const baseAnimals = normalizeArray(Object.values(DB_NPC_TAXONOMY.Animal.subclasses));
	const horseNames = normalizeArray(DB_NPC_TAXONOMY.Animal.nomenclature.Mount.Horse.baseNamesByRank);

	let foundSubclass = null;

	if (
		nephilims.some((k) => {
			if (nameLower.includes(k)) {
				foundSubclass = k.replace(/ /g, '_');
				return true;
			}
			return false;
		})
	) {
		return { category: 'Nephilim', subclass: foundSubclass };
	}
	if (
		monsters.some((k) => {
			if (nameLower.includes(k)) {
				foundSubclass = k.replace(/ /g, '_');
				return true;
			}
			return false;
		})
	) {
		return { category: 'Monster', subclass: foundSubclass };
	}
	if (horseNames.some((k) => nameLower.includes(k)) || nameLower.includes('horse')) {
		return { category: 'Animal', subclass: 'horse' };
	}
	if (
		baseAnimals.some((k) => {
			if (nameLower.includes(k)) {
				foundSubclass = k.replace(/ /g, '_');
				return true;
			}
			return false;
		})
	) {
		return { category: 'Animal', subclass: foundSubclass };
	}
	if (nameLower !== 'none' && nameLower !== 'unknown assailant') {
		return { category: 'Human', subclass: null };
	}

	return { category: null, subclass: null };
};

/**
 * Maps the selected Patron God to the specific knight avatar file path.
 * Updated to handle the 'NONE' option explicitly.
 */
export const getKnightAvatarByGod = (godName) => {
	// If no god is selected or if 'NONE' is chosen, use the specific godless avatar
	if (!godName || godName === 'None' || godName === 'NONE') {
		return 'knights/knight_none.png';
	}

	const formattedName = godName.toLowerCase();
	return `knights/knight_${formattedName}.png`;
};

/**
 * Asigură formatarea corectă a căii pentru avatar, prevenind dublarea prefixului /avatars/
 */
export const getSafeAvatarPath = (path) => {
	if (!path) return '/avatars/default_knight.png';
	// Dacă path-ul conține deja cuvântul 'avatars', presupunem că e complet
	if (path.includes('/avatars/')) return path.startsWith('/') ? path : `/${path}`;
	// Altfel, construim calea curată
	return `/avatars/${path.startsWith('/') ? path.substring(1) : path}`;
};
