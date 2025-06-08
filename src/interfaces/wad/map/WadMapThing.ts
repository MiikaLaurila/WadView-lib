import {
	type WadMapThingChex,
	WadMapThingChexKeys,
	type WadMapThingChexType,
	type WadMapThingDoom,
	WadMapThingDoomKeys,
	type WadMapThingDoomType,
	WadMapThingGroup,
	type WadMapThingHeretic,
	WadMapThingHereticKeys,
	type WadMapThingHereticType,
	type WadMapThingHexen,
	WadMapThingHexenKeys,
	type WadMapThingHexenType,
	type WadMapThingStrife,
	WadMapThingStrifeKeys,
	type WadMapThingStrifeType,
	wadMapThingChexGroupMap,
	wadMapThingDoomGroupMap,
	wadMapThingHereticGroupMap,
	wadMapThingHexenGroupMap,
	wadMapThingStrifeGroupMap,
} from "../../index.js";

export type WadThing =
	| WadMapThingDoom
	| WadMapThingChex
	| WadMapThingHeretic
	| WadMapThingHexen
	| WadMapThingStrife;
export type WadMapThingType =
	| WadMapThingDoomType
	| WadMapThingChexType
	| WadMapThingHereticType
	| WadMapThingHexenType
	| WadMapThingStrifeType;

export const WadMapThingKeys = [
	...WadMapThingDoomKeys,
	...WadMapThingChexKeys,
	...WadMapThingHereticKeys,
	...WadMapThingHexenKeys,
	...WadMapThingStrifeKeys,
];

export const isWadMapThing = (thing: unknown): thing is WadMapThingType => {
	return WadMapThingKeys.includes(thing as WadMapThingType);
};

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
	return Object.entries(WadMapThingFlag)
		.filter(([_, value]) => flags & (value as WadMapThingFlag))
		.map(([key]) => key as WadMapThingFlagType);
};

export const wadMapThingGroupMap: Record<WadMapThingType, WadMapThingGroup> = {
	...wadMapThingDoomGroupMap,
	...wadMapThingChexGroupMap,
	...wadMapThingHereticGroupMap,
	...wadMapThingHexenGroupMap,
	...wadMapThingStrifeGroupMap,
};

export const getWadMapThingGroup = (
	thingString: WadMapThingType,
): WadMapThingGroup => {
	return wadMapThingGroupMap[thingString] || WadMapThingGroup.UNKNOWN;
};

export interface WadMapThing {
	x: number;
	y: number;
	angle: number;
	thingType: number;
	thingTypeString: WadMapThingType;
	thingGroup: WadMapThingGroup;
	flags: number;
	flagsString: WadMapThingFlagType[];
	size: number;
}

export interface WadMapThingDehacked {
	x: number;
	y: number;
	angle: number;
	thingType: number;
	thingTypeString: string;
	thingGroup: WadMapThingGroup;
	flags: number;
	flagsString: WadMapThingFlagType[];
	size: number;
}

const thingSizes: Partial<Record<WadMapThingType, number>> = {
	PLAYER_START_1: 16,
	PLAYER_START_2: 16,
	PLAYER_START_3: 16,
	PLAYER_START_4: 16,
	BLUE_CARD: 20,
	YELLOW_CARD: 20,
	SPIDER_MASTERMIND: 128,
	BACKPACK: 20,
	SHOTGUN_GUY: 20,
	GIBBED_MARINE: 20,
	DEATHMATCH_START: 16,
	GIBBED_MARINE_EXTRA: 20,
	RED_CARD: 20,
	TELEPORT_DEST: 20,
	DEAD_MARINE: 20,
	CYBERDEMON: 40,
	CELL_PACK: 20,
	DEAD_ZOMBIE_MAN: 20,
	DEAD_SHOTGUN_GUY: 20,
	DEAD_DOOM_IMP: 20,
	DEAD_DEMON: 20,
	DEAD_CACODEMON: 20,
	DEAD_LOST_SOUL: 20,
	GIBS: 20,
	DEAD_STICK: 16,
	LIVE_STICK: 16,
	HEAD_ON_ASTICK: 16,
	HEADS_ON_ASTICK: 16,
	HEAD_CANDLES: 16,
	TALL_GREEN_COLUMN: 16,
	SHORT_GREEN_COLUMN: 16,
	TALL_RED_COLUMN: 16,
	SHORT_RED_COLUMN: 16,
	CANDLESTICK: 20,
	CANDELABRA: 16,
	HEART_COLUMN: 16,
	SKULL_COLUMN: 16,
	RED_SKULL: 20,
	YELLOW_SKULL: 20,
	BLUE_SKULL: 20,
	EVIL_EYE: 16,
	FLOATING_SKULL: 16,
	TORCH_TREE: 16,
	BLUE_TORCH: 16,
	GREEN_TORCH: 16,
	RED_TORCH: 16,
	STALAGTITE: 16,
	TECH_PILLAR: 16,
	BLOODY_TWITCH: 16,
	MEAT_2: 16,
	MEAT_3: 16,
	MEAT_4: 16,
	MEAT_5: 16,
	BIG_TREE: 32,
	SHORT_BLUE_TORCH: 16,
	SHORT_GREEN_TORCH: 16,
	SHORT_RED_TORCH: 16,
	SPECTRE: 30,
	ARCHVILE: 20,
	CHAINGUN_GUY: 20,
	REVENANT: 20,
	FATSO: 48,
	ARACHNOTRON: 64,
	HELL_KNIGHT: 24,
	BURNING_BARREL: 16,
	PAIN_ELEMENTAL: 31,
	COMMANDER_KEEN: 16,
	HANG_NO_GUTS: 16,
	HANG_BNO_BRAIN: 16,
	HANG_TLOOKING_DOWN: 16,
	HANG_TSKULL: 16,
	HANG_TLOOKING_UP: 16,
	HANG_TNO_BRAIN: 16,
	COLON_GIBS: 20,
	SMALL_BLOOD_POOL: 20,
	BRAIN_STEM: 20,
	SUPER_SHOTGUN: 20,
	MEGASPHERE: 20,
	WOLFENSTEIN_SS: 20,
	TECH_LAMP: 16,
	TECH_LAMP_2: 16,
	BOSS_TARGET: 20,
	BOSS_BRAIN: 16,
	BOSS_EYE: 20,
	SHOTGUN: 20,
	CHAINGUN: 20,
	ROCKET_LAUNCHER: 20,
	PLASMA_RIFLE: 20,
	CHAINSAW: 20,
	BFG_9000: 20,
	CLIP: 20,
	SHELL: 20,
	ROCKET_AMMO: 20,
	STIMPACK: 20,
	MEDIKIT: 20,
	SOULSPHERE: 20,
	HEALTH_BONUS: 20,
	ARMOR_BONUS: 20,
	GREEN_ARMOR: 20,
	BLUE_ARMOR: 20,
	INVULNERABILITY_SPHERE: 20,
	BERSERK: 20,
	BLUR_SPHERE: 20,
	RAD_SUIT: 20,
	ALLMAP: 20,
	COLUMN: 16,
	EXPLOSIVE_BARREL: 10,
	INFRARED: 20,
	ROCKET_BOX: 20,
	CELL: 20,
	CLIP_BOX: 20,
	SHELL_BOX: 20,
	DOOM_IMP: 20,
	DEMON: 30,
	BARON_OF_HELL: 24,
	ZOMBIE_MAN: 20,
	CACODEMON: 31,
	LOST_SOUL: 16,
};

export const getSizeOfMapThing = (thingType: WadMapThingType): number => {
	return thingSizes[thingType] || 20;
};
