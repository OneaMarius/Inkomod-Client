// File: Client/src/utils/AvatarResolver.js
import { DB_NPC_TAXONOMY } from '../data/DB_NPC_Taxonomy.js';

/**
 * Generates the primary avatar path based on category, class, or subclass.
 */
export const getEntityAvatar = (
	entityCategory,
	entityClass,
	entitySubclass,
) => {
	if (!entityCategory) return '/avatars/default_npc.png';

	const folder = `${entityCategory.toLowerCase()}s`;

	let actualClass = entityClass;
	let actualSubclass = entitySubclass;

	if (entityCategory !== 'Human' && entityClass && !entitySubclass) {
		actualSubclass = entityClass;
		actualClass = null;
	}

	// --- WHITELIST PENTRU SUBCLASE UMANE ---
	// Cât timp e goală, motorul va ignora subclasele umane și va afișa direct clasa (Military, Outlaw etc).
	// Când creezi un avatar nou (ex: captain.png), adaugă numele aici: ['captain', 'guard']
	const SUPPORTED_HUMAN_SUBCLASSES = [
'blacksmith',
    'weaponsmith',
    'armorer',
    'shieldwright',
    'marshal',
    'tanner',
    'leatherworker',
    'carpenter',
    'fixer',
    'ironsmith',
    'tailor',
    'weaver',
    'bowyer',
    'fletcher',
    'mason',
    'arms_dealer',
    'armorer_merchant',
    'shield_seller',
    'horse_dealer',
    'grazier',
    'provisioner',
    'grocer',
    'peddler',
    'banker',
    'caravan_master',
    'farmer',
    'fisherman',
    'shepherd',
    'woodcutter',
    'forester',
    'miner',
    'quarryman',
    'hunter',
    'trapper',
    'horse_breeder',
    'messenger',
    'courier',
    'escort',
    'wainwright',
    'pilgrim',
    'wayfinder',
    'traveler',
    'outrider',
    'ferryman',
    'drayman',
    'innkeeper',
    'stablemaster',
    'ostler',
    'chamberlain',
    'cupbearer',
    'servant',
    'steward',
    'apothecary',
    'cook',
    'page',
    'barkeep',
    'tavern_keeper',
    'entertainer',
    'tax_collector',
    'bailiff',
    'magistrate',
    'clerk',
    'notary',
    'reeve',
    'warden',
    'herald',
    'seneschal',
    'archivist',
    'mentor',
    'warmaster',
    'fencing_master',
    'magister',
    'physician',
    'surgeon',
    'herbalist',
    'scholar',
    'chronicler',
    'scribe',
    'alchemist',
    'astrologer',
    'noble',
    'lord',
    'chancellor',
    'banneret',
    'courtier',
    'envoy',
    'emissary',
    'patrician',
    'landowner',
    'patron',
    'beggar',
    'vagabond',
    'peasant',
    'minstrel',
    'bard',
    'bandit',
    'thief',
    'pickpocket',
    'burglar',
    'cutpurse',
    'highwayman',
    'smuggler',
    'fence',
    'poacher',
    'deserter',
    'thug',
    'assassin',
    'marauder',
    'sentry',
    'watchman',
    'soldier',
    'quartermaster',
    'mercenary',
    'sergeant',
    'captain',
    'bodyguard',
    'knight',
    'champion',
    'scout',
    'commander',
    'general',
    'priest',
    'cleric',
    'monk',
    'friar',
    'zealot',
    'cultist',
	];

	// 1. Prioritate maximă: Subclasa
	if (
		actualSubclass &&
		actualSubclass !== 'Unknown' &&
		actualSubclass !== 'None' &&
		actualSubclass !== ''
	) {
		let subName = actualSubclass.toLowerCase().replace(/ /g, '_');

		let isValidToUseSubclass = true;
		if (entityCategory === 'Human') {
			isValidToUseSubclass = SUPPORTED_HUMAN_SUBCLASSES.includes(subName);
		}

		if (isValidToUseSubclass) {
			const horseNames =
				DB_NPC_TAXONOMY?.Animal?.nomenclature?.Mount?.Horse?.baseNamesByRank
					?.flat()
					.map((name) => name.toLowerCase().replace(/ /g, '_')) || [];
			if (horseNames.includes(subName) || subName === 'horse') {
				subName = 'horse';
			}
			return `/avatars/${folder}/entitySubclass/${subName}.png`;
		}
	}

	// 2. Fallback secundar: Clasa
	if (
		actualClass &&
		actualClass !== 'Unknown' &&
		actualClass !== 'None' &&
		actualClass !== ''
	) {
		const className = actualClass.toLowerCase().replace(/ /g, '_');
		return `/avatars/${folder}/entityClass/${className}.png`;
	}

	// 3. Fallback final: Imaginea default a categoriei
	return getFallbackAvatar(entityCategory);
};

/**
 * Returns the default image now located inside the specific category folder.
 */
export const getFallbackAvatar = (entityCategory) => {
	const catLower = entityCategory?.toLowerCase();
	const folder = `${catLower}s`;

	switch (entityCategory) {
		case 'Human':
		case 'Animal':
		case 'Monster':
		case 'Nephilim':
			return `/avatars/${folder}/default_${catLower}.png`;
		case 'Knight':
			return '/avatars/default_knight.png';
		default:
			return '/avatars/default_npc.png';
	}
};

/**
 * Analyzes an entity name to deduce category and subclass.
 * Used primarily by the Hall of Fame to resolve avatars for older records.
 */
export const identifyEntityFromName = (entityName) => {
	if (!entityName) return { category: null, subclass: null };

	const nameLower = entityName.toLowerCase();
	let foundSubclass = null;

	const baseAnimals = ['wolf', 'bear', 'boar', 'stag', 'fox', 'rat'];
	const monsters = ['ghoul', 'shade', 'hollow', 'wraith', 'colossus'];
	const horseNames =
		DB_NPC_TAXONOMY?.Animal?.nomenclature?.Mount?.Horse?.baseNamesByRank
			?.flat()
			.map((n) => n.toLowerCase()) || [];

	if (monsters.some((k) => nameLower.includes(k))) {
		return {
			category: 'Monster',
			subclass: monsters.find((k) => nameLower.includes(k)),
		};
	}
	if (
		horseNames.some((k) => nameLower.includes(k)) ||
		nameLower.includes('horse')
	) {
		return { category: 'Animal', subclass: 'horse' };
	}
	if (baseAnimals.some((k) => nameLower.includes(k))) {
		foundSubclass = baseAnimals.find((k) => nameLower.includes(k));
		return { category: 'Animal', subclass: foundSubclass };
	}
	if (nameLower !== 'none' && nameLower !== 'unknown assailant') {
		return { category: 'Human', subclass: null };
	}

	return { category: null, subclass: null };
};

/**
 * Maps the selected Patron God to the specific knight avatar file path.
 */
export const getKnightAvatarByGod = (godName) => {
	if (!godName || godName === 'None' || godName === 'NONE') {
		return 'knights/knight_none.png';
	}

	const formattedName = godName.toLowerCase();
	return `knights/knight_${formattedName}.png`;
};

/**
 * Ensures the correct avatar prefix is applied in the UI.
 */
export const ensureAvatarPrefix = (path) => {
	if (!path) return '/avatars/default_npc.png';
	if (path.startsWith('/avatars/') || path.startsWith('avatars/')) {
		return path.startsWith('/') ? path : `/${path}`;
	}
	return `/avatars/${path}`;
};
