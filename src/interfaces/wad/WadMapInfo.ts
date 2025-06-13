/**
 *
 * UMAPINFO START
 *
 */

export interface WadUMapInfoMap {
	id: string;
	levelname: string;
	author: string;
	label: string | null;
	levelpic: string;
	next: string;
	nextsecret: string;
	skytexture: string;
	music: string;
	exitpic: string;
	enterpic: string;
	partime: number;
	endgame: boolean;
	endpic: string;
	endbunny: boolean;
	endcast: boolean;
	nointermission: boolean;
	intertext: string | null;
	intertextsecret: string | null;
	interbackdrop: string;
	intermusic: string;
	episode:
		| {
				patch: string;
				name: string;
				key: string;
		  }
		| string
		| null;
	bossaction: {
		thing: string;
		linespecial: number;
		tag: number;
	}[];
}

export const defaultWadUMapInfoMap: Readonly<WadUMapInfoMap> = {
	id: "",
	levelname: "",
	author: "",
	label: "",
	levelpic: "",
	next: "",
	nextsecret: "",
	skytexture: "",
	music: "",
	exitpic: "",
	enterpic: "",
	partime: 0,
	endgame: false,
	endpic: "",
	endbunny: false,
	endcast: false,
	nointermission: false,
	intertext: "",
	intertextsecret: "",
	interbackdrop: "",
	intermusic: "",
	episode: "",
	bossaction: [],
} as const;

export type WadUMapInfo = Record<string, WadUMapInfoMap>;

/**
 *
 * DMAPINFO START
 *
 */

export interface WadDMapInfoMap {
	id: string;
	displayName: string;
	next: string;
	secretnext: string;
	par: number;
	music: string;
	episodenumber: number;
	mapnumber: number;
	endsequence: string;
	sky1: {
		lump: string;
		scrollSpeed: number;
	};
	map07special: boolean;
}

export interface WadDMapInfoEpisode {
	lump: string;
	name: string;
}

export interface WadDMapInfoEndSequence {
	id: string;
	text: string[];
	flat: string;
	music: string;
}

export interface WadDMapInfo {
	maps: WadDMapInfoMap[];
	episodes: WadDMapInfoEpisode[];
	endsequences: WadDMapInfoEndSequence[];
}

export const defaultWadDMapInfoMap: WadDMapInfoMap = {
	id: "",
	displayName: "",
	next: "",
	secretnext: "",
	par: 0,
	music: "",
	episodenumber: 0,
	mapnumber: 0,
	endsequence: "",
	sky1: {
		lump: "",
		scrollSpeed: 0,
	},
	map07special: false,
};

export const defaultWadDMapInfoEpisode: Readonly<WadDMapInfoEpisode> = {
	lump: "",
	name: "",
} as const;

export const defaultWadDMapInfoEndSequence: Readonly<WadDMapInfoEndSequence> = {
	id: "",
	text: [],
	flat: "",
	music: "",
} as const;

export const defaultWadDMapInfo: Readonly<WadDMapInfo> = {
	maps: [],
	episodes: [],
	endsequences: [],
} as const;

/**
 *
 * ZMAPINFO
 *
 */

export interface WadMapZMapInfo {
	maps: WadMapZMapInfoMap[];
}

export interface WadMapZMapInfoMap {
	id: string;
	name: string;
	levelnum?: number;
	next?: string;
	secretnext?: string;
	cluster?: number;
	par?: number;
	titlepatch?: string;
	enterpic?: string;
	exitpic?: string;
	sky1?: string;
	sky2?: string;
	fade?: string;
	fadetable?: string;
	outsidefog?: string;
	lightmode?: number;
	music?: string;
	cdmusic?: string;
	soundsequence?: string;
	nointermission?: boolean;
	allowmonstertelefrags?: boolean;
	evenlighting?: boolean;
	smoothlighting?: boolean;
	forcenoskystretch?: boolean;
	forceskystretch?: boolean;
	fogdensity?: number;
	skyfog?: number;
	outsidefogdensity?: number;
	lightcolor?: string;
	fadecolor?: string;
	desaturate?: boolean;
	wallglowcolor?: string;
	wallglowspeed?: number;
	wallglowtype?: number;
	wallglowheight?: number;
	resethealth?: boolean;
	resetinventory?: boolean;
	specialaction?: string;
	compatflags: {
		[flag: string]: boolean | number;
	};
}

export const defaultWadZMapInfo: Readonly<WadMapZMapInfo> = {
	maps: [],
} as const;

/**
 *
 * GENERATL WADMAPINFO
 *
 */
export enum WadMapInfoType {
	UMAPINFO = "UMAPINFO",
	DMAPINFO = "DMAPINFO",
	ZMAPINFO = "ZMAPINFO",
	UNKNOWN = "UNKNOWN",
}
export interface WadMapInfo {
	type: WadMapInfoType;
	uMapInfo?: WadUMapInfo;
	dMapInfo?: WadDMapInfo;
	zMapInfo?: WadMapZMapInfo;
}

export const getWadMapInfoNames = (
	mapInfo: WadMapInfo,
): Map<string, string> => {
	const nameMap = new Map<string, string>();
	if (mapInfo.type === WadMapInfoType.UMAPINFO && mapInfo.uMapInfo) {
		for (const info of Object.values(mapInfo.uMapInfo)) {
			nameMap.set(info.id, info.levelname);
		}
	}
	if (mapInfo.type === WadMapInfoType.DMAPINFO && mapInfo.dMapInfo) {
		for (const info of mapInfo.dMapInfo.maps) {
			nameMap.set(info.id, info.displayName);
		}
	}
	if (mapInfo.type === WadMapInfoType.ZMAPINFO && mapInfo.zMapInfo) {
		for (const info of mapInfo.zMapInfo.maps) {
			nameMap.set(info.id, info.name);
		}
	}
	return nameMap;
};

export const getWadMapInfoMusic = (
	mapInfo: WadMapInfo,
): Map<string, string> => {
	const musicMap = new Map<string, string>();
	if (mapInfo.type === WadMapInfoType.UMAPINFO && mapInfo.uMapInfo) {
		for (const info of Object.values(mapInfo.uMapInfo)) {
			if (info.music) {
				musicMap.set(info.music, info.id);
			}
		}
	}
	if (mapInfo.type === WadMapInfoType.DMAPINFO && mapInfo.dMapInfo) {
		for (const info of mapInfo.dMapInfo.maps) {
			if (info.music) {
				musicMap.set(info.music, info.id);
			}
		}
	}
	if (mapInfo.type === WadMapInfoType.ZMAPINFO && mapInfo.zMapInfo) {
		for (const info of mapInfo.zMapInfo.maps) {
			if (info.music) {
				musicMap.set(info.music, info.id);
			}
		}
	}
	return musicMap;
};

export const getWadMapInfoPatchNames = (mapInfo: WadMapInfo): string[] => {
	const patches: (string | undefined)[] = [];
	if (mapInfo.type === WadMapInfoType.UMAPINFO && mapInfo.uMapInfo) {
		for (const info of Object.values(mapInfo.uMapInfo)) {
			patches.push(info.skytexture);
		}
	}
	if (mapInfo.type === WadMapInfoType.DMAPINFO && mapInfo.dMapInfo) {
		for (const info of mapInfo.dMapInfo.maps) {
			patches.push(info.sky1.lump);
		}
	}
	if (mapInfo.type === WadMapInfoType.ZMAPINFO && mapInfo.zMapInfo) {
		for (const info of mapInfo.zMapInfo.maps) {
			patches.push(info.sky1);
			patches.push(info.sky2);
		}
	}
	return patches.filter((p) => p !== undefined && p) as string[];
};

export const getWadMapInfoMenuGraphics = (mapInfo: WadMapInfo): string[] => {
	const menuPatches: (string | undefined)[] = [];
	if (mapInfo.type === WadMapInfoType.UMAPINFO && mapInfo.uMapInfo) {
		for (const info of Object.values(mapInfo.uMapInfo)) {
			menuPatches.push(info.levelpic);
			menuPatches.push(info.exitpic);
			menuPatches.push(info.enterpic);
			menuPatches.push(info.endpic);
			if (info.episode && typeof info.episode === "object") {
				menuPatches.push(info.episode.patch);
			}
		}
	}
	if (mapInfo.type === WadMapInfoType.ZMAPINFO && mapInfo.zMapInfo) {
		for (const info of mapInfo.zMapInfo.maps) {
			menuPatches.push(info.titlepatch);
			menuPatches.push(info.exitpic);
			menuPatches.push(info.enterpic);
		}
	}
	return menuPatches.filter((p) => p !== undefined && p) as string[];
};
