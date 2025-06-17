export interface WadDehackedThing {
	dehId: number;
	name: string;
	id: number | null;
	initialFrame?: number;
	hitPoints?: number;
	firstMovingFrame?: number;
	alertSound?: number;
	reactionTime?: number;
	attackSound?: number;
	injuryFrame?: number;
	painChance?: number;
	painSound?: number;
	closeAttackFrame?: number;
	farAttackFrame?: number;
	deathFrame?: number;
	explodingFrame?: number;
	deathSound?: number;
	speed?: number;
	width?: number;
	height?: number;
	mass?: number;
	missileDamage?: number;
	actionSound?: number;
	bits?: WadDehackedThingFlag[];
	bits2?: number | string;
	respawnFrame?: number;
	droppedItem?: number;
	infightingGroup?: number;
	projectileGroup?: number;
	splashGroup?: number;
	mbf21Bits?: WadDehackedThingMBF21Flag[];
	ripSound?: number;
	fastSpeed?: number;
	meleeRange?: number;
	bloodColor?: number;
	pickupMessage?: string;
}

export interface WadDehackedFrame {
	index: number;
	spriteNumber?: number;
	spriteSubnumber?: number;
	duration?: number;
	nextFrame?: number;
	codepFrame?: number;
	unknown1?: number;
	unknown2?: number;
	args1?: number;
	args2?: number;
	args3?: number;
	args4?: number;
	args5?: number;
	args6?: number;
	args7?: number;
	args8?: number;
	mbf21Bits?: number;
}

export interface WadDehackedPointer {
	frameIndex: number;
	codepFrame: string | number;
}

export interface WadDehackedSound {
	index: number;
	offset?: number;
	zeroOne?: number;
	value?: number;
	zero1?: number;
	zero2?: number;
	zero3?: number;
	zero4?: number;
	negOne1?: number;
	negOne2?: number;
}

export interface WadDehackedAmmo {
	index: number;
	name: string;
	maxAmmo?: number;
	perAmmo?: number;
}

export interface WadDehackedWeapon {
	index: number;
	name: string;
	ammoType?: number;
	deselectFrame?: number;
	selectFrame?: number;
	bobbingFrame?: number;
	shootingFrame?: number;
	firingFrame?: number;
	ammoPerShot?: number;
	mbf21Bits?: WadDehackedWeaponMBF21Flag[];
}

export interface WadDehackedMisc {
	initialHealth?: number;
	initialBullets?: number;
	maxHealth?: number;
	maxArmor?: number;
	greenArmorClass?: number;
	blueArmorClass?: number;
	maxSoulsphere?: number;
	soulsphereHealth?: number;
	megasphereHealth?: number;
	godModeHealth?: number;
	idfaArmor?: number;
	idfaArmorClass?: number;
	idkfaArmor?: number;
	idkfaArmorClass?: number;
	bfgCellsPerShot?: number;
	monstersInfight?: number;
}

export interface WadDehackedText {
	oldLen: number;
	newLen: number;
	from: string;
	to: string;
}

export interface WadDehackedHelperThing {
	type: number;
}

export interface WadDehackedBexKvp {
	key: string;
	value: string | number;
}

export interface WadDehackedPar {
	episode?: number;
	map: number;
	time: number;
}

export interface WadDehackedCheats {
	changeMusic?: string;
	chainsaw?: string;
	godMode?: string;
	ammoAndKeys?: string;
	ammo?: string;
	noclip1?: string;
	noclip2?: string;
	invincibility?: string;
	berserk?: string;
	invisibility?: string;
	radiationSuit?: string;
	autoMap?: string;
	lightGoggles?: string;
	behold?: string;
	levelWarp?: string;
	playerPos?: string;
	mapCheat?: string;
}

export interface WadDehackedFile {
	things: WadDehackedThing[];
	frames: WadDehackedFrame[];
	pointers: WadDehackedPointer[];
	sounds: WadDehackedSound[];
	ammo: WadDehackedAmmo[];
	weapons: WadDehackedWeapon[];
	misc: WadDehackedMisc;
	texts: WadDehackedText[];
	pars: WadDehackedPar[];
	helperThing?: WadDehackedHelperThing;
	bexStrings: WadDehackedBexKvp[];
	bexSprites: WadDehackedBexKvp[];
	bexSounds: WadDehackedBexKvp[];
	bexMusic: WadDehackedBexKvp[];
	cheats: WadDehackedCheats;
}

export const initialWadDehackedFile: Readonly<WadDehackedFile> = {
	things: [],
	frames: [],
	pointers: [],
	sounds: [],
	ammo: [],
	weapons: [],
	misc: {},
	texts: [],
	bexStrings: [],
	helperThing: undefined,
	bexMusic: [],
	bexSounds: [],
	bexSprites: [],
	pars: [],
	cheats: {},
} as const;

export enum WadDehackedThingFlag {
	SPECIAL = 0x00000001,
	SOLID = 0x00000002,
	SHOOTABLE = 0x00000004,
	NOSECTOR = 0x00000008,
	NOBLOCKMAP = 0x00000010,
	AMBUSH = 0x00000020,
	JUSTHIT = 0x00000040,
	JUSTATTACKED = 0x00000080,
	SPAWNCEILING = 0x00000100,
	NOGRAVITY = 0x00000200,
	DROPOFF = 0x00000400,
	PICKUP = 0x00000800,
	NOCLIP = 0x00001000,
	SLIDE = 0x00002000,
	FLOAT = 0x00004000,
	TELEPORT = 0x00008000,
	MISSILE = 0x00010000,
	DROPPED = 0x00020000,
	SHADOW = 0x00040000,
	NOBLOOD = 0x00080000,
	CORPSE = 0x00100000,
	INFLOAT = 0x00200000,
	COUNTKILL = 0x00400000,
	COUNTITEM = 0x00800000,
	SKULLFLY = 0x01000000,
	NOTDMATCH = 0x02000000,
	TRANSLATION1 = 0x04000000,
	TRANSLATION2 = 0x08000000,
	TOUCHY = 0x10000000,
	BOUNCES = 0x20000000,
	FRIEND = 0x40000000,
	TRANSLUCENT = 0x80000000,
}

export enum WadDehackedThingMBF21Flag {
	LOGRAV = 0x00000001,
	SHORTMRANGE = 0x00000002,
	DMGIGNORED = 0x00000004,
	NORADIUSDMG = 0x00000008,
	FORCERADIUSDMG = 0x00000010,
	HIGHERMPROB = 0x00000020,
	RANGEHALF = 0x00000040,
	NOTHRESHOLD = 0x00000080,
	LONGMELEE = 0x00000100,
	BOSS = 0x00000200,
	MAP07BOSS1 = 0x00000400,
	MAP07BOSS2 = 0x00000800,
	E1M8BOSS = 0x00001000,
	E2M8BOSS = 0x00002000,
	E3M8BOSS = 0x00004000,
	E4M6BOSS = 0x00008000,
	E4M8BOSS = 0x00010000,
	RIP = 0x00020000,
	FULLVOLSOUNDS = 0x00040000,
}

export enum WadDehackedWeaponMBF21Flag {
	NOTHRUST = 0x00000001,
	SILENT = 0x00000002,
	NOAUTOFIRE = 0x00000004,
	FLEEMELEE = 0x00000008,
	AUTOSWITCHFROM = 0x00000010,
	NOAUTOSWITCHTO = 0x00000020,
}

export function getDehThingFlags(bits: number): WadDehackedThingFlag[] {
	const activeFlags: WadDehackedThingFlag[] = [];

	for (const entry of Object.values(WadDehackedThingFlag)) {
		if ((bits & (entry as WadDehackedThingFlag)) === entry) {
			activeFlags.push(entry);
		}
	}

	return activeFlags;
}

export function hasDehThingFlags(
	bits: number,
	...flags: WadDehackedThingFlag[]
): boolean {
	const combinedFlags = flags.reduce((acc, flag) => acc | flag, 0);
	return (bits & combinedFlags) === combinedFlags;
}

export function namesToDehThingFlags(names: string[]): number {
	let result = 0;

	for (const name of names) {
		const entry = Object.keys(WadDehackedThingFlag).find(
			(e) => e === name.trim().toUpperCase(),
		);
		if (entry) {
			result |=
				WadDehackedThingFlag[entry as keyof typeof WadDehackedThingFlag];
		}
	}

	return result;
}

export function getDehThingMBF21Flags(
	bits: number,
): WadDehackedThingMBF21Flag[] {
	const activeFlags: WadDehackedThingMBF21Flag[] = [];

	for (const entry of Object.values(WadDehackedThingMBF21Flag)) {
		if ((bits & (entry as WadDehackedThingMBF21Flag)) === entry) {
			activeFlags.push(entry);
		}
	}

	return activeFlags;
}

export function hasDehThingMBF21Flags(
	bits: number,
	...flags: WadDehackedThingMBF21Flag[]
): boolean {
	const combinedFlags = flags.reduce((acc, flag) => acc | flag, 0);
	return (bits & combinedFlags) === combinedFlags;
}

export function namesToDehThingMBF21Flags(names: string[]): number {
	let result = 0;

	for (const name of names) {
		const entry = Object.keys(WadDehackedThingMBF21Flag).find(
			(e) => e === name.trim().toUpperCase(),
		);
		if (entry) {
			result |=
				WadDehackedThingMBF21Flag[
					entry as keyof typeof WadDehackedThingMBF21Flag
				];
		}
	}

	return result;
}

export function getDehWeaponMBF21Flags(
	bits: number,
): WadDehackedWeaponMBF21Flag[] {
	const activeFlags: WadDehackedWeaponMBF21Flag[] = [];

	for (const entry of Object.values(WadDehackedWeaponMBF21Flag)) {
		if ((bits & (entry as WadDehackedWeaponMBF21Flag)) === entry) {
			activeFlags.push(entry);
		}
	}

	return activeFlags;
}

export function hasDehWeaponMBF21Flags(
	bits: number,
	...flags: WadDehackedWeaponMBF21Flag[]
): boolean {
	const combinedFlags = flags.reduce((acc, flag) => acc | flag, 0);
	return (bits & combinedFlags) === combinedFlags;
}

export function namesToDehWeaponMBF21Flags(names: string[]): number {
	let result = 0;

	for (const name of names) {
		const entry = Object.keys(WadDehackedWeaponMBF21Flag).find(
			(e) => e === name.trim().toUpperCase(),
		);
		if (entry) {
			result |=
				WadDehackedWeaponMBF21Flag[
					entry as keyof typeof WadDehackedWeaponMBF21Flag
				];
		}
	}

	return result;
}

export const huStrToMap: Record<string, string> = {
	HUSTR_1: "MAP01",
	HUSTR_2: "MAP02",
	HUSTR_3: "MAP03",
	HUSTR_4: "MAP04",
	HUSTR_5: "MAP05",
	HUSTR_6: "MAP06",
	HUSTR_7: "MAP07",
	HUSTR_8: "MAP08",
	HUSTR_9: "MAP09",
	HUSTR_10: "MAP10",
	HUSTR_11: "MAP11",
	HUSTR_12: "MAP12",
	HUSTR_13: "MAP13",
	HUSTR_14: "MAP14",
	HUSTR_15: "MAP15",
	HUSTR_16: "MAP16",
	HUSTR_17: "MAP17",
	HUSTR_18: "MAP18",
	HUSTR_19: "MAP19",
	HUSTR_20: "MAP20",
	HUSTR_21: "MAP21",
	HUSTR_22: "MAP22",
	HUSTR_23: "MAP23",
	HUSTR_24: "MAP24",
	HUSTR_25: "MAP25",
	HUSTR_26: "MAP26",
	HUSTR_27: "MAP27",
	HUSTR_28: "MAP28",
	HUSTR_29: "MAP29",
	HUSTR_30: "MAP30",
	HUSTR_31: "MAP31",
	HUSTR_32: "MAP32",
};
