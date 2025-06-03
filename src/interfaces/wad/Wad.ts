import type { WadColorMap } from "./WadColorMap.js";
import type { WadDehacked } from "./WadDehacked.js";
import type { WadDirectory } from "./WadDirectory.js";
import type { WadEndoom } from "./WadEndoom.js";
import type { WadHeader } from "./WadHeader.js";
import type { WadPlaypal } from "./WadPlayPal.js";
import type { WadMapGroupList, WadMapList } from "./map/WadMap.js";
import type { WadFlat } from "./texture/WadFlat.js";
import type { WadTextures } from "./texture/WadTextures.js";

export interface Wad {
	header: WadHeader;
	directory: WadDirectory;
	mapGroups: WadMapGroupList;
	textures: WadTextures;
	flats: WadFlat[];
	maps: WadMapList;
	playpal: WadPlaypal;
	colormap: WadColorMap;
	endoom: WadEndoom;
	dehacked: WadDehacked | null;
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
	dehacked: undefined,
};
