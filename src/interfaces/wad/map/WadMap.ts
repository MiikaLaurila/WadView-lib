import {
	type Point,
	type WadDirectoryEntry,
	type WadMapBlockMap,
	type WadMapLinedef,
	type WadMapNode,
	type WadMapRejectTable,
	type WadMapSector,
	type WadMapSegment,
	type WadMapSidedef,
	type WadMapSubSector,
	type WadMapThing,
	defaultWadMapBlockmap,
} from "../../index.js";

export enum MapFormat {
	DOOM = "DOOM",
	HEXEN = "HEXEN",
	UDMF = "UDMF",
}

export const mapLumps = [
	"HEADER",
	"THINGS",
	"LINEDEFS",
	"SIDEDEFS",
	"VERTEXES",
	"SEGS",
	"SSECTORS",
	"NODES",
	"SECTORS",
	"REJECT",
	"BLOCKMAP",
	"BEHAVIOR",
	"SCRIPTS",
	"TEXTMAP",
	"DIALOGUE",
	"ZNODES",
	"ENDMAP",
] as const;
export type MapLump = (typeof mapLumps)[number];
export const isMapLump = (lumpName: unknown): lumpName is MapLump => {
	return mapLumps.includes(lumpName as MapLump);
};

export interface MapGroupDirectoryEntry extends WadDirectoryEntry {
	lumpName: MapLump;
}

export type MapGroupDirectory = MapGroupDirectoryEntry[];

export const isMapGroupDirectoryEntry = (
	entry: unknown,
): entry is MapGroupDirectoryEntry => {
	return isMapLump((entry as MapGroupDirectoryEntry).lumpName);
};

export interface WadMapGroup {
	name: string;
	lumps: MapGroupDirectory;
}
export type WadMapGroupList = WadMapGroup[];
export interface WadMap {
	name: string;
	things: WadMapThing[];
	linedefs: WadMapLinedef[];
	sidedefs: WadMapSidedef[];
	vertices: Point[];
	segments: WadMapSegment[];
	subSectors: WadMapSubSector[];
	nodes: WadMapNode[];
	sectors: WadMapSector[];
	rejectTable: WadMapRejectTable;
	blockMap: WadMapBlockMap;
}
export const defaultWadMap: Readonly<WadMap> = {
	name: "",
	things: [],
	linedefs: [],
	sidedefs: [],
	vertices: [],
	segments: [],
	subSectors: [],
	nodes: [],
	sectors: [],
	rejectTable: [],
	blockMap: { ...defaultWadMapBlockmap },
};
export type WadMapList = WadMap[];
