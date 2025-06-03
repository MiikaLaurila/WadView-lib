import type { Point } from "../../Point.js";
import type { WadDirectoryEntry } from "../WadDirectory.js";
import { type WadMapBlockMap, defaultWadMapBlockmap } from "./WadMapBlockmap.js";
import type { WadMapLinedef } from "./WadMapLinedef.js";
import type { WadMapNode } from "./WadMapNode.js";
import type { WadMapRejectTable } from "./WadMapRejectTable.js";
import type { WadMapSector } from "./WadMapSector.js";
import type { WadMapSegment } from "./WadMapSegment.js";
import type { WadMapSidedef } from "./WadMapSidedef.js";
import type { WadMapSubSector } from "./WadMapSubSector.js";
import type { WadMapThing } from "./WadMapThing.js";

export const mapLumps = [
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
