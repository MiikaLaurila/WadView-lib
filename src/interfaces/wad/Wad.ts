import type {
	WadColorMap,
	WadDehacked,
	WadDirectory,
	WadEndoom,
	WadFlat,
	WadHeader,
	WadMapGroupList,
	WadMapInfo,
	WadMapList,
	WadMenuGraphic,
	WadMusInfo,
	WadMusic,
	WadPlaypal,
	WadSprite,
	WadStbarGraphic,
	WadTextures,
} from "../index.js";

export enum WadDetectedType {
	DOOM = "DOOM",
	HEXEN = "HEXEN",
	HERETIC = "HERETIC",
	CHEX = "CHEX",
	STRIFE = "STRIFE",
}

export interface Wad {
	header: WadHeader;
	directory: WadDirectory;
	mapGroups: WadMapGroupList;
	textures: WadTextures;
	flats: WadFlat[];
	sprites: WadSprite[];
	maps: WadMapList;
	playpal: WadPlaypal;
	colormap: WadColorMap;
	endoom: WadEndoom;
	dehacked: WadDehacked;
	detectedType: WadDetectedType;
	menuGraphics: WadMenuGraphic[];
	stbarGraphics: WadStbarGraphic[];
	music: WadMusic[];
	mapInfo: WadMapInfo;
	musInfo: WadMusInfo;
}

export const defaultWad: Readonly<Partial<Wad>> = {
	header: undefined,
	directory: undefined,
	mapGroups: undefined,
	maps: undefined,
	playpal: undefined,
	colormap: undefined,
	endoom: undefined,
	textures: undefined,
	flats: undefined,
	sprites: undefined,
	dehacked: undefined,
	detectedType: undefined,
	menuGraphics: undefined,
	music: undefined,
	mapInfo: undefined,
	musInfo: undefined,
};
