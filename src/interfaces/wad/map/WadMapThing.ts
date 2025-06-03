export enum WadThingMonster {
	ARACHNOTRON = 68,
	ARCHVILE = 64,
	BARON_OF_HELL = 3003,
	CACODEMON = 3005,
	COMMANDER_KEEN = 72,
	CYBERDEMON = 16,
	DEMON = 3002,
	HEAVY_WEAPON_DUDE = 65,
	HELL_KNIGHT = 69,
	IMP = 3001,
	LOST_SOUL = 3006,
	MANCUBUS = 67,
	PAIN_ELEMENTAL = 71,
	REVENANT = 66,
	SHOTGUN_GUY = 9,
	SPECTRE = 58,
	SPIDERDEMON = 7,
	WOLFENSTEIN_SS = 84,
	ZOMBIEMAN = 3004,
}
export const WadThingMonsterKeys = [
	"ARACHNOTRON",
	"ARCHVILE",
	"BARON_OF_HELL",
	"CACODEMON",
	"COMMANDER_KEEN",
	"CYBERDEMON",
	"DEMON",
	"HEAVY_WEAPON_DUDE",
	"HELL_KNIGHT",
	"IMP",
	"LOST_SOUL",
	"MANCUBUS",
	"PAIN_ELEMENTAL",
	"REVENANT",
	"SHOTGUN_GUY",
	"SPECTRE",
	"SPIDERDEMON",
	"WOLFENSTEIN_SS",
	"ZOMBIEMAN",
] as const;
export const isWadMonsterThing = (
	thing: unknown,
): thing is WadThingMonsterType => {
	return WadThingMonsterKeys.includes(thing as WadThingMonsterType);
};
export type WadThingMonsterType = keyof typeof WadThingMonster;

export enum WadThingWeapon {
	BFG_9000 = 2006,
	CHAINGUN = 2002,
	CHAINSAW = 2005,
	PLASMA_GUN = 2004,
	ROCKET_LAUNCHER = 2003,
	SHOTGUN = 2001,
	SUPER_SHOTGUN = 82,
}
export const WadThingWeaponKeys = [
	"BFG_9000",
	"CHAINGUN",
	"CHAINSAW",
	"PLASMA_GUN",
	"ROCKET_LAUNCHER",
	"SHOTGUN",
	"SUPER_SHOTGUN",
] as const;
export const isWadWeaponThing = (
	thing: unknown,
): thing is WadThingWeaponType => {
	return WadThingWeaponKeys.includes(thing as WadThingWeaponType);
};
export type WadThingWeaponType = keyof typeof WadThingWeapon;

export enum WadThingAmmo {
	SHOTGUN_SHELLS = 2008,
	BOX_OF_BULLETS = 2048,
	BOX_OF_ROCKETS = 2046,
	BOX_OF_SHELLS = 2049,
	CLIP = 2007,
	ENERGY_CELL = 2047,
	ENERGY_CELL_PACK = 17,
	ROCKET = 2010,
}
export const WadThingAmmoKeys = [
	"SHOTGUN_SHELLS",
	"BOX_OF_BULLETS",
	"BOX_OF_ROCKETS",
	"BOX_OF_SHELLS",
	"CLIP",
	"ENERGY_CELL",
	"ENERGY_CELL_PACK",
	"ROCKET",
] as const;
export const isWadAmmoThing = (thing: unknown): thing is WadThingAmmoType => {
	return WadThingAmmoKeys.includes(thing as WadThingAmmoType);
};
export type WadThingAmmoType = keyof typeof WadThingAmmo;

export enum WadThingArtifact {
	ARMOR_BONUS = 2015,
	BERSERK = 2023,
	COMPUTER_AREA_MAP = 2026,
	HEALTH_BONUS = 2014,
	INVULNERABILITY = 2022,
	LIGHT_VISOR = 2045,
	MEGASPHERE = 83,
	PARTIAL_INVISIBILITY = 2024,
	SUPERCHARGE = 2013,
}
export const WadThingArtifactKeys = [
	"ARMOR_BONUS",
	"BERSERK",
	"COMPUTER_AREA_MAP",
	"HEALTH_BONUS",
	"INVULNERABILITY",
	"LIGHT_VISOR",
	"MEGASPHERE",
	"PARTIAL_INVISIBILITY",
	"SUPERCHARGE",
] as const;
export const isWadArtifactThing = (
	thing: unknown,
): thing is WadThingArtifactType => {
	return WadThingArtifactKeys.includes(thing as WadThingArtifactType);
};
export type WadThingArtifactType = keyof typeof WadThingArtifact;

export enum WadThingPowerup {
	ARMOR = 2018,
	BACKPACK = 8,
	MEDIKIT = 2012,
	MEGAARMOR = 2019,
	RADIATION_SUIT = 2025,
	STIMPACK = 2011,
}
export const WadThingPowerupKeys = [
	"ARMOR",
	"BACKPACK",
	"MEDIKIT",
	"MEGAARMOR",
	"RADIATION_SUIT",
	"STIMPACK",
] as const;
export const isWadPowerupThing = (
	thing: unknown,
): thing is WadThingPowerupType => {
	return WadThingPowerupKeys.includes(thing as WadThingPowerupType);
};
export type WadThingPowerupType = keyof typeof WadThingPowerup;

export enum WadThingKey {
	BLUE_KEY_CARD = 5,
	BLUE_KEY_SKULL = 40,
	RED_KEY_CARD = 13,
	RED_KEY_SKULL = 38,
	YELLOW_KEY_CARD = 6,
	YELLOW_KEY_SKULL = 39,
}
export const WadThingKeyKeys = [
	"BLUE_KEY_CARD",
	"BLUE_KEY_SKULL",
	"RED_KEY_CARD",
	"RED_KEY_SKULL",
	"YELLOW_KEY_CARD",
	"YELLOW_KEY_SKULL",
] as const;
export const isWadKeyThing = (thing: unknown): thing is WadThingKeyType => {
	return WadThingKeyKeys.includes(thing as WadThingKeyType);
};
export type WadThingKeyType = keyof typeof WadThingKey;

export enum WadThingObstacle {
	BROWN_STUMP = 47,
	BURNING_BARREL = 70,
	BURNT_TREE = 43,
	CANDELABRA = 35,
	EVIL_EYE = 41,
	EXPLODING_BARREL = 2035,
	FIVE_SKULLS_SHISH_KEBAB = 28,
	FLOATING_SKULL = 42,
	FLOOR_LAMP = 2028,
	HANGING_LEG = 53,
	HANGING_PAIR_OF_LEGS = 52,
	HANGING_TORSO_BRAIN_REMOVED = 78,
	HANGING_TORSO_LOOKING_DOWN = 75,
	HANGING_TORSO_LOOKING_UP = 77,
	HANGING_TORSO_OPEN_SKULL = 76,
	HANGING_VICTIM_ARMS_OUT = 50,
	HANGING_VICTIM_GUTS_AND_BRAIN_REMOVED = 74,
	HANGING_VICTIM_GUTS_REMOVED = 73,
	HANGING_VICTIM_ONE_LEGGED = 51,
	HANGING_VICTIM_TWITCHING = 49,
	IMPALED_HUMAN = 25,
	LARGE_BROWN_TREE = 54,
	PILE_OF_SKULLS_AND_CANDLES = 29,
	SHORT_BLUE_FIRESTICK = 55,
	SHORT_GREEN_FIRESTICK = 56,
	SHORT_GREEN_PILLAR = 31,
	SHORT_GREEN_PILLAR_WITH_BEATING_HEART = 36,
	SHORT_RED_FIRESTICK = 57,
	SHORT_RED_PILLAR = 33,
	SHORT_RED_PILLAR_WITH_SKULL = 37,
	SHORT_TECHNO_FLOOR_LAMP = 86,
	SKULL_ON_A_POLE = 27,
	TALL_BLUE_FIRESTICK = 44,
	TALL_GREEN_FIRESTICK = 45,
	TALL_GREEN_PILLAR = 30,
	TALL_RED_FIRESTICK = 46,
	TALL_RED_PILLAR = 32,
	TALL_TECHNO_COLUMN = 48,
	TALL_TECHNO_FLOOR_LAMP = 85,
	TWITCHING_IMPALED_HUMAN = 26,
}
export const WadThingObstacleKeys = [
	"BROWN_STUMP",
	"BURNING_BARREL",
	"BURNT_TREE",
	"CANDELABRA",
	"EVIL_EYE",
	"EXPLODING_BARREL",
	"FIVE_SKULLS_SHISH_KEBAB",
	"FLOATING_SKULL",
	"FLOOR_LAMP",
	"HANGING_LEG",
	"HANGING_PAIR_OF_LEGS",
	"HANGING_TORSO_BRAIN_REMOVED",
	"HANGING_TORSO_LOOKING_DOWN",
	"HANGING_TORSO_LOOKING_UP",
	"HANGING_TORSO_OPEN_SKULL",
	"HANGING_VICTIM_ARMS_OUT",
	"HANGING_VICTIM_GUTS_AND_BRAIN_REMOVED",
	"HANGING_VICTIM_GUTS_REMOVED",
	"HANGING_VICTIM_ONE_LEGGED",
	"HANGING_VICTIM_TWITCHING",
	"IMPALED_HUMAN",
	"LARGE_BROWN_TREE",
	"PILE_OF_SKULLS_AND_CANDLES",
	"SHORT_BLUE_FIRESTICK",
	"SHORT_GREEN_FIRESTICK",
	"SHORT_GREEN_PILLAR",
	"SHORT_GREEN_PILLAR_WITH_BEATING_HEART",
	"SHORT_RED_FIRESTICK",
	"SHORT_RED_PILLAR",
	"SHORT_RED_PILLAR_WITH_SKULL",
	"SHORT_TECHNO_FLOOR_LAMP",
	"SKULL_ON_A_POLE",
	"TALL_BLUE_FIRESTICK",
	"TALL_GREEN_FIRESTICK",
	"TALL_GREEN_PILLAR",
	"TALL_RED_FIRESTICK",
	"TALL_RED_PILLAR",
	"TALL_TECHNO_COLUMN",
	"TALL_TECHNO_FLOOR_LAMP",
	"TWITCHING_IMPALED_HUMAN",
] as const;
export const isWadObstacleThing = (
	thing: unknown,
): thing is WadThingObstacleType => {
	return WadThingObstacleKeys.includes(thing as WadThingObstacleType);
};
export type WadThingObstacleType = keyof typeof WadThingObstacle;

export enum WadThingDecoration {
	BLOODY_MESS = 10,
	BLOODY_MESS_2 = 12,
	CANDLE = 34,
	DEAD_CACODEMON = 22,
	DEAD_DEMON = 21,
	DEAD_FORMER_HUMAN = 18,
	DEAD_FORMER_SERGEANT = 19,
	DEAD_IMP = 20,
	DEAD_LOST_SOUL = 23,
	DEAD_PLAYER = 15,
	HANGING_LEG_DEC = 62,
	HANGING_PAIR_OF_LEGS_DEC = 60,
	HANGING_VICTIM_ARMS_OUT_DEC = 59,
	HANGING_VICTIM_ONE_LEGGED_DEC = 61,
	HANGING_VICTIM_TWITCHING_DEC = 63,
	POOL_OF_BLOOD = 79,
	POOL_OF_BLOOD_2 = 80,
	POOL_OF_BLOOD_AND_FLESH = 24,
	POOL_OF_BRAINS = 81,
}
export const WadThingDecorationKeys = [
	"BLOODY_MESS",
	"BLOODY_MESS_2",
	"CANDLE",
	"DEAD_CACODEMON",
	"DEAD_DEMON",
	"DEAD_FORMER_HUMAN",
	"DEAD_FORMER_SERGEANT",
	"DEAD_IMP",
	"DEAD_LOST_SOUL",
	"DEAD_PLAYER",
	"HANGING_LEG_DEC",
	"HANGING_PAIR_OF_LEGS_DEC",
	"HANGING_VICTIM_ARMS_OUT_DEC",
	"HANGING_VICTIM_ONE_LEGGED_DEC",
	"HANGING_VICTIM_TWITCHING_DEC",
	"POOL_OF_BLOOD",
	"POOL_OF_BLOOD_2",
	"POOL_OF_BLOOD_AND_FLESH",
	"POOL_OF_BRAINS",
] as const;
export const isWadDecorationThing = (
	thing: unknown,
): thing is WadThingDecorationType => {
	return WadThingDecorationKeys.includes(thing as WadThingDecorationType);
};
export type WadThingDecorationType = keyof typeof WadThingDecoration;

export enum WadThingOther {
	DEATHMATCH_START = 11,
	MONSTER_SPAWNER = 89,
	PLAYER_1_START = 1,
	PLAYER_2_START = 2,
	PLAYER_3_START = 3,
	PLAYER_4_START = 4,
	ROMEROS_HEAD = 88,
	SPAWN_SPOT = 87,
	TELEPORT_LANDING = 14,
}
export const WadThingOtherKeys = [
	"DEATHMATCH_START",
	"MONSTER_SPAWNER",
	"PLAYER_1_START",
	"PLAYER_2_START",
	"PLAYER_3_START",
	"PLAYER_4_START",
	"ROMEROS_HEAD",
	"SPAWN_SPOT",
	"TELEPORT_LANDING",
] as const;
export const isWadOtherThing = (thing: unknown): thing is WadThingOtherType => {
	return WadThingOtherKeys.includes(thing as WadThingOtherType);
};
export type WadThingOtherType = keyof typeof WadThingOther;

export const WadThingDict = {
	...WadThingMonster,
	...WadThingWeapon,
	...WadThingAmmo,
	...WadThingArtifact,
	...WadThingPowerup,
	...WadThingKey,
	...WadThingObstacle,
	...WadThingDecoration,
	...WadThingOther,
};
export type WadThing =
	| WadThingMonster
	| WadThingWeapon
	| WadThingAmmo
	| WadThingArtifact
	| WadThingPowerup
	| WadThingKey
	| WadThingObstacle
	| WadThingDecoration
	| WadThingOther;

export type WadThingType =
	| WadThingMonsterType
	| WadThingWeaponType
	| WadThingAmmoType
	| WadThingArtifactType
	| WadThingPowerupType
	| WadThingKeyType
	| WadThingObstacleType
	| WadThingDecorationType
	| WadThingOtherType;

export enum WadMapThingFlag {
	ON_SKILL_EASY = 0x0001,
	ON_SKILL_MEDIUM = 0x0002,
	ON_SKILL_HARD = 0x0004,
	AMBUSH = 0x0008,
	NET_ONLY = 0x0010,
}

export type WadMapThingFlagType = keyof typeof WadMapThingFlag;

export const extractWadMapThingFlags = (
	flags: number,
): WadMapThingFlagType[] => {
	const foundFlags: WadMapThingFlagType[] = [];
	const testFlag = (flag: WadMapThingFlag): void => {
		if (flags & flag)
			foundFlags.push(WadMapThingFlag[flag] as WadMapThingFlagType);
	};
	for (const f in WadMapThingFlag) {
		testFlag(WadMapThingFlag[f as keyof typeof WadMapThingFlag]);
	}
	return foundFlags;
};

export enum WadMapThingGroup {
	OTHER = "OTHER",
	MONSTER = "MONSTER",
	POWERUP = "POWERUP",
	ARTIFACT = "ARTIFACT",
	KEY = "KEY",
	WEAPON = "WEAPON",
	AMMO = "AMMO",
	DECORATION = "DECORATION",
	OBSTACLE = "OBSTACLE",
	UNKNOWN = "UNKNOWN",
}

export const getWadMapThingGroup = (
	thingString: WadThingType,
): WadMapThingGroup => {
	if (isWadMonsterThing(thingString)) {
		return WadMapThingGroup.MONSTER;
	}
	if (isWadDecorationThing(thingString)) {
		return WadMapThingGroup.DECORATION;
	}
	if (isWadObstacleThing(thingString)) {
		return WadMapThingGroup.OBSTACLE;
	}
	if (isWadOtherThing(thingString)) {
		return WadMapThingGroup.OTHER;
	}
	if (isWadPowerupThing(thingString)) {
		return WadMapThingGroup.POWERUP;
	}
	if (isWadArtifactThing(thingString)) {
		return WadMapThingGroup.ARTIFACT;
	}
	if (isWadKeyThing(thingString)) {
		return WadMapThingGroup.KEY;
	}
	if (isWadWeaponThing(thingString)) {
		return WadMapThingGroup.WEAPON;
	}
	if (isWadAmmoThing(thingString)) {
		return WadMapThingGroup.AMMO;
	}
	return WadMapThingGroup.UNKNOWN;
};

export interface WadMapThing {
	x: number;
	y: number;
	angle: number;
	thingType: WadThing;
	thingTypeString: WadThingType;
	thingGroup: WadMapThingGroup;
	flags: number;
	flagsString: WadMapThingFlagType[];
	size: number;
}

export interface WadMapThingDehacked {
	x: number;
	y: number;
	angle: number;
	thingType: WadThing;
	thingTypeString: string;
	thingGroup: WadMapThingGroup;
	flags: number;
	flagsString: WadMapThingFlagType[];
	size: number;
}

type WadMapThingSizeDict = Record<WadThingType, number>;

export const SizeOfMapThing: WadMapThingSizeDict = {
	PLAYER_1_START: 16,
	PLAYER_2_START: 16,
	PLAYER_3_START: 16,
	PLAYER_4_START: 16,
	BLUE_KEY_CARD: 20,
	YELLOW_KEY_CARD: 20,
	SPIDERDEMON: 128,
	BACKPACK: 20,
	SHOTGUN_GUY: 20,
	BLOODY_MESS: 20,
	DEATHMATCH_START: 16,
	BLOODY_MESS_2: 20,
	RED_KEY_CARD: 20,
	TELEPORT_LANDING: 20,
	DEAD_PLAYER: 20,
	CYBERDEMON: 40,
	ENERGY_CELL_PACK: 20,
	DEAD_FORMER_HUMAN: 20,
	DEAD_FORMER_SERGEANT: 20,
	DEAD_IMP: 20,
	DEAD_DEMON: 20,
	DEAD_CACODEMON: 20,
	DEAD_LOST_SOUL: 20,
	POOL_OF_BLOOD_AND_FLESH: 20,
	IMPALED_HUMAN: 16,
	TWITCHING_IMPALED_HUMAN: 16,
	SKULL_ON_A_POLE: 16,
	FIVE_SKULLS_SHISH_KEBAB: 16,
	PILE_OF_SKULLS_AND_CANDLES: 16,
	TALL_GREEN_PILLAR: 16,
	SHORT_GREEN_PILLAR: 16,
	TALL_RED_PILLAR: 16,
	SHORT_RED_PILLAR: 16,
	CANDLE: 20,
	CANDELABRA: 16,
	SHORT_GREEN_PILLAR_WITH_BEATING_HEART: 16,
	SHORT_RED_PILLAR_WITH_SKULL: 16,
	RED_KEY_SKULL: 20,
	YELLOW_KEY_SKULL: 20,
	BLUE_KEY_SKULL: 20,
	EVIL_EYE: 16,
	FLOATING_SKULL: 16,
	BURNT_TREE: 16,
	TALL_BLUE_FIRESTICK: 16,
	TALL_GREEN_FIRESTICK: 16,
	TALL_RED_FIRESTICK: 16,
	BROWN_STUMP: 16,
	TALL_TECHNO_COLUMN: 16,
	HANGING_VICTIM_TWITCHING: 16,
	HANGING_VICTIM_ARMS_OUT: 16,
	HANGING_VICTIM_ONE_LEGGED: 16,
	HANGING_PAIR_OF_LEGS: 16,
	HANGING_LEG: 16,
	LARGE_BROWN_TREE: 32,
	SHORT_BLUE_FIRESTICK: 16,
	SHORT_GREEN_FIRESTICK: 16,
	SHORT_RED_FIRESTICK: 16,
	SPECTRE: 30,
	HANGING_VICTIM_ARMS_OUT_DEC: 20,
	HANGING_PAIR_OF_LEGS_DEC: 20,
	HANGING_VICTIM_ONE_LEGGED_DEC: 20,
	HANGING_LEG_DEC: 20,
	HANGING_VICTIM_TWITCHING_DEC: 20,
	ARCHVILE: 20,
	HEAVY_WEAPON_DUDE: 20,
	REVENANT: 20,
	MANCUBUS: 48,
	ARACHNOTRON: 64,
	HELL_KNIGHT: 24,
	BURNING_BARREL: 16,
	PAIN_ELEMENTAL: 31,
	COMMANDER_KEEN: 16,
	HANGING_VICTIM_GUTS_REMOVED: 16,
	HANGING_VICTIM_GUTS_AND_BRAIN_REMOVED: 16,
	HANGING_TORSO_LOOKING_DOWN: 16,
	HANGING_TORSO_OPEN_SKULL: 16,
	HANGING_TORSO_LOOKING_UP: 16,
	HANGING_TORSO_BRAIN_REMOVED: 16,
	POOL_OF_BLOOD: 20,
	POOL_OF_BLOOD_2: 20,
	POOL_OF_BRAINS: 20,
	SUPER_SHOTGUN: 20,
	MEGASPHERE: 20,
	WOLFENSTEIN_SS: 20,
	TALL_TECHNO_FLOOR_LAMP: 16,
	SHORT_TECHNO_FLOOR_LAMP: 16,
	SPAWN_SPOT: 20,
	ROMEROS_HEAD: 16,
	MONSTER_SPAWNER: 20,
	SHOTGUN: 20,
	CHAINGUN: 20,
	ROCKET_LAUNCHER: 20,
	PLASMA_GUN: 20,
	CHAINSAW: 20,
	BFG_9000: 20,
	CLIP: 20,
	SHOTGUN_SHELLS: 20,
	ROCKET: 20,
	STIMPACK: 20,
	MEDIKIT: 20,
	SUPERCHARGE: 20,
	HEALTH_BONUS: 20,
	ARMOR_BONUS: 20,
	ARMOR: 20,
	MEGAARMOR: 20,
	INVULNERABILITY: 20,
	BERSERK: 20,
	PARTIAL_INVISIBILITY: 20,
	RADIATION_SUIT: 20,
	COMPUTER_AREA_MAP: 20,
	FLOOR_LAMP: 16,
	EXPLODING_BARREL: 10,
	LIGHT_VISOR: 20,
	BOX_OF_ROCKETS: 20,
	ENERGY_CELL: 20,
	BOX_OF_BULLETS: 20,
	BOX_OF_SHELLS: 20,
	IMP: 20,
	DEMON: 30,
	BARON_OF_HELL: 24,
	ZOMBIEMAN: 20,
	CACODEMON: 31,
	LOST_SOUL: 16,
};
