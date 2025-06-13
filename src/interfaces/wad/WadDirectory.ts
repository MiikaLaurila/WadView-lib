import type { FileTypeResult } from "file-type";

export enum LumpType {
	// MAP
	MAPMARKER = "MAPMARKER",
	MAPDATA = "MAPDATA",
	MAPINFO = "MAPINFO",

	// IMAGES
	TEXTURES1 = "TEXTURES1",
	TEXTURES2 = "TEXTURES2",
	SPRITE_START = "SPRITE_START",
	SPRITE = "SPRITE",
	SPRITE_END = "SPRITE_END",
	PATCH_START = "PATCH_START",
	PATCH = "PATCH",
	PATCH_END = "PATCH_END",
	FLAT_START = "FLAT_START",
	FLAT = "FLAT",
	FLAT_END = "FLAT_END",
	PNAMES = "PNAMES",
	TX_START = "TX_START",
	TX_PATCH = "TX_PATCH",
	TX_END = "TX_END",
	HI_START = "HI_START",
	HI_PATCH = "HI_PATCH",
	HI_END = "HI_END",
	STBAR_PATCH = "STBAR_PATCH",
	MENU_PATCH = "MENU_PATCH",

	// MISC
	COLORMAP = "COLORMAP",
	ENDOOM = "ENDOOM",
	DEHACKED = "DEHACKED",
	PLAYPAL = "PLAYPAL",
	DEMO = "DEMO",
	COMPLVL = "COMPLVL",
	TEXT = "TEXT",

	// MUSIC
	MUSIC = "MUSIC",
	SFX = "SFX",
	MUSINFO = "MUSINFO",

	UNKNOWN = "UNKNOWN",
}

export interface WadDirectoryEntry {
	lumpLocation: number;
	lumpSize: number;
	lumpName: string;
	lumpIdx: number;
	type: LumpType;
	imageType?: FileTypeResult;
	musicType?: FileTypeResult;
	mapName?: string;
}
export type WadDirectory = WadDirectoryEntry[];
