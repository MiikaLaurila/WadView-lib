import {
	MapFormat,
	type Point,
	WadDetectedType,
	WadFileEvent,
	WadFileParser,
	type WadMap,
	type WadMapBlockMap,
	type WadMapLinedef,
	type WadMapNode,
	WadMapNodeChildType,
	type WadMapRejectTable,
	type WadMapSector,
	type WadMapSegment,
	type WadMapSidedef,
	type WadMapSubSector,
	type WadMapThing,
	WadMapThingChex,
	WadMapThingDoom,
	WadMapThingHeretic,
	type WadMapThingType,
	type WadParserOptions,
	type WadThing,
	defaultWadMap,
	defaultWadMapBlockmap,
	extractWadMapLinedefFlags,
	extractWadMapThingFlags,
	getSizeOfMapThing,
	getWadMapThingGroup,
	utf8ArrayToStr,
} from "../index.js";

export interface WadMapParsingOptions {
	parseSegments?: boolean;
	parseSubSectors?: boolean;
	parseNodes?: boolean;
	parseRejects?: boolean;
	parseBlockmap?: boolean;
}

interface WadMapParserOptions extends WadParserOptions, WadMapParsingOptions {
	mapName: string;
	detectedType: WadDetectedType;
}

export class WadFileMapParser extends WadFileParser {
	private options: WadMapParserOptions;
	private mapName: string;
	private detectedType: WadDetectedType;
	constructor(options: WadMapParserOptions) {
		super(options);
		this.options = options;
		this.mapName = options.mapName;
		this.detectedType = options.detectedType;
	}

	private thingTypeToString(thingType: WadThing): WadMapThingType {
		switch (this.detectedType) {
			case WadDetectedType.DOOM:
				return WadMapThingDoom[thingType] as WadMapThingType;
			case WadDetectedType.CHEX:
				return WadMapThingChex[thingType] as WadMapThingType;
			case WadDetectedType.HERETIC:
				return WadMapThingHeretic[thingType] as WadMapThingType;
			default:
				return WadMapThingDoom[thingType] as WadMapThingType;
		}
	}

	private getDoomMapThings(start: number, size: number): WadMapThing[] {
		const things: WadMapThing[] = [];
		const thingEntryLength = 10;
		const thingCount = size / thingEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < thingCount; i++) {
			const viewStart = i * thingEntryLength;
			const xPos = new Int16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const yPos = new Int16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];
			const angle = new Int16Array(
				view.buffer.slice(viewStart + 4, viewStart + 6),
			)[0];
			const thingType: WadThing = new Int16Array(
				view.buffer.slice(viewStart + 6, viewStart + 8),
			)[0];
			const thingTypeString = this.thingTypeToString(thingType);
			const thingGroup = getWadMapThingGroup(thingTypeString);
			const flags = new Int16Array(
				view.buffer.slice(viewStart + 8, viewStart + 10),
			)[0];
			const flagsString = extractWadMapThingFlags(flags);
			const size = getSizeOfMapThing(thingTypeString);
			things.push({
				x: xPos,
				y: yPos,
				angle,
				thingType,
				flags,
				thingTypeString,
				flagsString,
				thingGroup,
				size,
			});
		}
		return things;
	}

	private getHexenMapThings(start: number, size: number): WadMapThing[] {
		const things: WadMapThing[] = [];
		const thingEntryLength = 20;
		const thingCount = size / thingEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < thingCount; i++) {
			const viewStart = i * thingEntryLength;
			const xPos = new Int16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];
			const yPos = new Int16Array(
				view.buffer.slice(viewStart + 4, viewStart + 6),
			)[0];
			const angle = new Int16Array(
				view.buffer.slice(viewStart + 8, viewStart + 10),
			)[0];
			const thingType: WadMapThingDoom = new Int16Array(
				view.buffer.slice(viewStart + 10, viewStart + 12),
			)[0];
			const thingTypeString = this.thingTypeToString(thingType);
			const thingGroup = getWadMapThingGroup(thingTypeString);
			const flags = new Int16Array(
				view.buffer.slice(viewStart + 12, viewStart + 14),
			)[0];
			const flagsString = extractWadMapThingFlags(flags);
			const size = getSizeOfMapThing(thingTypeString);
			things.push({
				x: xPos,
				y: yPos,
				angle,
				thingType,
				flags,
				thingTypeString,
				flagsString,
				thingGroup,
				size,
			});
		}
		return things;
	}

	private getDoomMapLinedefs(start: number, size: number): WadMapLinedef[] {
		const linedefs: WadMapLinedef[] = [];
		const linedefEntryLength = 14;
		const linedefCount = size / linedefEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < linedefCount; i++) {
			const viewStart = i * linedefEntryLength;
			const start = new Uint16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const end = new Uint16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];
			const flags = new Uint16Array(
				view.buffer.slice(viewStart + 4, viewStart + 6),
			)[0];
			const flagsString = extractWadMapLinedefFlags(flags);
			const specialType = new Uint16Array(
				view.buffer.slice(viewStart + 6, viewStart + 8),
			)[0];
			const sectorTag = new Uint16Array(
				view.buffer.slice(viewStart + 8, viewStart + 10),
			)[0];
			const frontSideDef = new Uint16Array(
				view.buffer.slice(viewStart + 10, viewStart + 12),
			)[0];
			const backSideDef = new Uint16Array(
				view.buffer.slice(viewStart + 12, viewStart + 14),
			)[0];
			linedefs.push({
				start,
				end,
				flags,
				flagsString,
				specialType,
				sectorTag,
				frontSideDef,
				backSideDef,
			});
		}
		return linedefs;
	}

	private getHexenMapLineDefs(start: number, size: number): WadMapLinedef[] {
		const linedefs: WadMapLinedef[] = [];
		const linedefEntryLength = 16;
		const linedefCount = size / linedefEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < linedefCount; i++) {
			const viewStart = i * linedefEntryLength;
			const start = new Uint16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const end = new Uint16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];
			const flags = new Uint16Array(
				view.buffer.slice(viewStart + 4, viewStart + 6),
			)[0];
			const flagsString = extractWadMapLinedefFlags(flags);
			const specialType = new Uint8Array(
				view.buffer.slice(viewStart + 6, viewStart + 7),
			)[0];
			const frontSideDef = new Uint16Array(
				view.buffer.slice(viewStart + 12, viewStart + 14),
			)[0];
			const backSideDef = new Uint16Array(
				view.buffer.slice(viewStart + 14, viewStart + 16),
			)[0];
			linedefs.push({
				start,
				end,
				flags,
				flagsString,
				specialType,
				sectorTag: 0,
				frontSideDef,
				backSideDef,
			});
		}
		return linedefs;
	}

	private getMapSidedefs(start: number, size: number): WadMapSidedef[] {
		const sidedefs: WadMapSidedef[] = [];
		const sidedefEntryLength = 30;
		const sidedefCount = size / sidedefEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < sidedefCount; i++) {
			const viewStart = i * sidedefEntryLength;
			const xOffset = new Int16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const yOffset = new Int16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];
			const upperTex = utf8ArrayToStr(
				view.subarray(viewStart + 4, viewStart + 12),
			);
			const lowerTex = utf8ArrayToStr(
				view.subarray(viewStart + 12, viewStart + 20),
			);
			const middleTex = utf8ArrayToStr(
				view.subarray(viewStart + 20, viewStart + 28),
			);
			const sector = new Int16Array(
				view.buffer.slice(viewStart + 28, viewStart + 30),
			)[0];

			sidedefs.push({
				xOffset,
				yOffset,
				upperTex,
				lowerTex,
				middleTex,
				sector,
			});
		}
		return sidedefs;
	}

	private getMapVertices(start: number, size: number): Point[] {
		const vertices: Point[] = [];
		const vertexEntryLength = 4;
		const vertexCount = size / vertexEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < vertexCount; i++) {
			const viewStart = i * vertexEntryLength;
			const xPos = new Int16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const yPos = new Int16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];

			vertices.push({ x: xPos, y: yPos });
		}
		return vertices;
	}

	private getMapSegments(start: number, size: number): WadMapSegment[] {
		const segments: WadMapSegment[] = [];
		const segmentEntryLength = 12;
		const segmentCount = size / segmentEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < segmentCount; i++) {
			const viewStart = i * segmentEntryLength;
			const start = new Int16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const end = new Int16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];
			const angle = new Int16Array(
				view.buffer.slice(viewStart + 4, viewStart + 6),
			)[0];
			const linedef = new Int16Array(
				view.buffer.slice(viewStart + 6, viewStart + 8),
			)[0];
			const dir = new Int16Array(
				view.buffer.slice(viewStart + 8, viewStart + 10),
			)[0];
			const offset = new Int16Array(
				view.buffer.slice(viewStart + 10, viewStart + 12),
			)[0];

			segments.push({ start, end, angle, linedef, dir, offset });
		}
		return segments;
	}

	private getMapSubSectors(start: number, size: number): WadMapSubSector[] {
		const subSectors: WadMapSubSector[] = [];
		const subSectorEntryLength = 4;
		const subSectorCount = size / subSectorEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < subSectorCount; i++) {
			const viewStart = i * subSectorEntryLength;
			const segCount = new Int16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const firstSeg = new Int16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];

			subSectors.push({ segCount, firstSeg });
		}
		return subSectors;
	}

	private getMapNodes(start: number, size: number): WadMapNode[] {
		const nodes: WadMapNode[] = [];
		const nodeEntryLength = 28;
		const nodeCount = size / nodeEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		const getChildValues = (
			rawChild: number,
		): [number, WadMapNodeChildType] => {
			const mask = 1 << 15;
			let type = WadMapNodeChildType.SUBNODE;
			let val = rawChild;
			if ((rawChild & mask) !== 0) {
				type = WadMapNodeChildType.SUBSECTOR;
				val = rawChild & ~mask;
			}
			return [val, type];
		};
		for (let i = 0; i < nodeCount; i++) {
			if (
				view.buffer.slice(i * nodeEntryLength, i * nodeEntryLength + 28)
					.byteLength !== 28
			)
				continue;
			try {
				const viewStart = i * nodeEntryLength;
				const xPartStart = new Int16Array(
					view.buffer.slice(viewStart, viewStart + 2),
				)[0];
				const yPartStart = new Int16Array(
					view.buffer.slice(viewStart + 2, viewStart + 4),
				)[0];
				const xPartChange = new Int16Array(
					view.buffer.slice(viewStart + 4, viewStart + 6),
				)[0];
				const yPartChange = new Int16Array(
					view.buffer.slice(viewStart + 6, viewStart + 8),
				)[0];
				const rightBBoxRaw = Array.from(
					new Int16Array(view.buffer.slice(viewStart + 8, viewStart + 16)),
				);
				const rightBBox = {
					top: rightBBoxRaw[0],
					bottom: rightBBoxRaw[1],
					left: rightBBoxRaw[2],
					right: rightBBoxRaw[3],
				};
				const leftBBoxRaw = Array.from(
					new Int16Array(view.buffer.slice(viewStart + 16, viewStart + 24)),
				);
				const leftBBox = {
					top: leftBBoxRaw[0],
					bottom: leftBBoxRaw[1],
					left: leftBBoxRaw[2],
					right: leftBBoxRaw[3],
				};
				const rightChildRaw = new Uint16Array(
					view.buffer.slice(viewStart + 24, viewStart + 26),
				)[0];
				const leftChildRaw = new Uint16Array(
					view.buffer.slice(viewStart + 26, viewStart + 28),
				)[0];
				const rightChildValues = getChildValues(rightChildRaw);
				const rightChild = rightChildValues[0];
				const rightChildType = rightChildValues[1];
				const leftChildValues = getChildValues(leftChildRaw);
				const leftChild = leftChildValues[0];
				const leftChildType = leftChildValues[1];

				nodes.push({
					xPartStart,
					yPartStart,
					xPartChange,
					yPartChange,
					rightBBoxRaw,
					leftBBoxRaw,
					rightChildRaw,
					leftChildRaw,
					rightBBox,
					leftBBox,
					leftChild,
					leftChildType,
					rightChild,
					rightChildType,
				});
			} catch (e) {
				console.error(e);
			}
		}
		return nodes;
	}

	private getMapSectors(start: number, size: number): WadMapSector[] {
		const sectors: WadMapSector[] = [];
		const sectorEntryLength = 26;
		const sectorCount = size / sectorEntryLength;
		const view = new Uint8Array(this.file.slice(start, start + size));
		for (let i = 0; i < sectorCount; i++) {
			const viewStart = i * sectorEntryLength;
			const floorHeight = new Int16Array(
				view.buffer.slice(viewStart, viewStart + 2),
			)[0];
			const ceilingHeight = new Int16Array(
				view.buffer.slice(viewStart + 2, viewStart + 4),
			)[0];
			const floorTex = utf8ArrayToStr(
				view.subarray(viewStart + 4, viewStart + 12),
			);
			const ceilingTex = utf8ArrayToStr(
				view.subarray(viewStart + 12, viewStart + 20),
			);
			const lightLevel = new Int16Array(
				view.buffer.slice(viewStart + 20, viewStart + 22),
			)[0];
			const specialType = new Int16Array(
				view.buffer.slice(viewStart + 22, viewStart + 24),
			)[0];
			const tag = new Int16Array(
				view.buffer.slice(viewStart + 24, viewStart + 26),
			)[0];

			sectors.push({
				floorHeight,
				ceilingHeight,
				floorTex,
				ceilingTex,
				lightLevel,
				specialType,
				tag,
			});
		}
		return sectors;
	}

	private getMapRejectTable(
		start: number,
		size: number,
		sectorCount: number,
	): WadMapRejectTable {
		const tableToWrite = Array(sectorCount)
			.fill(Array(sectorCount).fill(false))
			.flat();
		const view = new Uint8Array(this.file.slice(start, start + size));

		for (let i = 0; i < size; i++) {
			let rawBinary = view[i].toString(2);
			rawBinary = "00000000".substring(0, 8 - rawBinary.length) + rawBinary;
			const bitsToWrite = Array.from(rawBinary)
				.reverse()
				.map((v) => v === "1");
			for (let j = 0; j < bitsToWrite.length; j++) {
				if (i * bitsToWrite.length + j < tableToWrite.length) {
					tableToWrite[i * bitsToWrite.length + j] = bitsToWrite[j];
				}
			}
		}

		const table: WadMapRejectTable = [];
		const tempTable = Array(sectorCount).fill(false);
		for (let i = 0; i < tableToWrite.length; i++) {
			tempTable[i % sectorCount] = tableToWrite[i];
			if (i % sectorCount === 0) {
				table.push(tempTable);
			}
		}
		return table;
	}

	private getMapBlockmap(start: number, size: number): WadMapBlockMap {
		const blockmap: WadMapBlockMap = JSON.parse(
			JSON.stringify(defaultWadMapBlockmap),
		);
		const view = new Uint8Array(this.file.slice(start, start + size));

		const xOrigin = new Int16Array(view.buffer.slice(0, 2))[0];
		const yOrigin = new Int16Array(view.buffer.slice(2, 4))[0];
		const columns = new Int16Array(view.buffer.slice(4, 6))[0];
		const rows = new Int16Array(view.buffer.slice(6, 8))[0];

		blockmap.xOrigin = xOrigin;
		blockmap.yOrigin = yOrigin;
		blockmap.columns = columns;
		blockmap.rows = rows;
		if (this.options.parseBlockmap) {
			const blockCount = columns * rows;
			const offsets = [];
			for (let i = 0; i < blockCount; i++) {
				const baseOffset = 8 + i * 2;
				const byte0 = new Uint8Array(
					view.buffer.slice(baseOffset, baseOffset + 1),
				)[0];
				const byte1 = new Uint8Array(
					view.buffer.slice(baseOffset + 1, baseOffset + 2),
				)[0];
				offsets.push((((byte1 & 0xff) << 8) | (byte0 & 0xff)) * 2);
			}
			blockmap.offsets = offsets;

			const blockList = [];
			for (let i = 0; i < offsets.length; i++) {
				const startPoint = offsets[i];
				let stopPoint: number | null = null;
				let readLength = 0;
				if (i < offsets.length - 1) {
					stopPoint = offsets[i + 1];
					readLength = stopPoint - startPoint;
				} else {
					let lastByte = 0;
					let readBytesCount = 0;
					while (lastByte !== 65535) {
						readBytesCount += 2;
						lastByte = new Uint16Array(
							view.buffer.slice(
								startPoint + readBytesCount,
								startPoint + readBytesCount + 2,
							),
						)[0];
					}
					readLength = readBytesCount + 2;
				}

				let linesOfBlock = [];
				for (let j = 0; j < readLength; j += 2) {
					linesOfBlock.push(
						new Uint16Array(
							view.buffer.slice(startPoint + j, startPoint + j + 2),
						)[0],
					);
				}
				linesOfBlock = linesOfBlock.filter((l) => l !== 0 && l !== 65535);
				blockList.push(linesOfBlock);
			}
			blockmap.blockList = blockList;
		}
		return blockmap;
	}

	public parseMap = async () => {
		const map: WadMap = JSON.parse(JSON.stringify(defaultWadMap));
		map.name = this.mapName;

		const format: MapFormat = (() => {
			if (this.lumps.find((lump) => lump.lumpName === "BEHAVIOR")) {
				return MapFormat.HEXEN;
			}
			if (this.lumps.find((lump) => lump.lumpName === "TEXTMAP")) {
				return MapFormat.UDMF;
			}
			return MapFormat.DOOM;
		})();

		const thingLump = this.lumps.find((lump) => lump.lumpName === "THINGS");
		if (thingLump !== undefined) {
			await this.sendEvent(
				WadFileEvent.MAP_THINGS_PARSING,
				`Things parsed for ${this.mapName} | Format: ${format}`,
			);
			switch (format) {
				case MapFormat.DOOM:
					map.things = this.getDoomMapThings(
						thingLump.lumpLocation,
						thingLump.lumpSize,
					);
					break;
				case MapFormat.HEXEN:
					map.things = this.getHexenMapThings(
						thingLump.lumpLocation,
						thingLump.lumpSize,
					);
					break;
				case MapFormat.UDMF:
					map.things = [];
					break;
			}
		}

		const linedefLump = this.lumps.find((lump) => lump.lumpName === "LINEDEFS");
		if (linedefLump !== undefined) {
			await this.sendEvent(
				WadFileEvent.MAP_LININGEFS_PARSING,
				`Linedefs parsing for ${this.mapName} | Format: ${format}`,
			);
			switch (format) {
				case MapFormat.DOOM:
					map.linedefs = this.getDoomMapLinedefs(
						linedefLump.lumpLocation,
						linedefLump.lumpSize,
					);
					break;
				case MapFormat.HEXEN:
					map.linedefs = this.getHexenMapLineDefs(
						linedefLump.lumpLocation,
						linedefLump.lumpSize,
					);
					break;
				case MapFormat.UDMF:
					map.linedefs = [];
					break;
			}
		}

		const sidedefLump = this.lumps.find((lump) => lump.lumpName === "SIDEDEFS");
		if (sidedefLump !== undefined) {
			await this.sendEvent(
				WadFileEvent.MAP_SIDINGEFS_PARSING,
				`Sidedefs parsing for ${this.mapName}`,
			);
			map.sidedefs = this.getMapSidedefs(
				sidedefLump.lumpLocation,
				sidedefLump.lumpSize,
			);
		}

		const verticesLump = this.lumps.find(
			(lump) => lump.lumpName === "VERTEXES",
		);
		if (verticesLump !== undefined) {
			await this.sendEvent(
				WadFileEvent.MAP_VERTICES_PARSING,
				`Vertices parsing for ${this.mapName}`,
			);
			map.vertices = this.getMapVertices(
				verticesLump.lumpLocation,
				verticesLump.lumpSize,
			);
		}

		if (this.options.parseSegments) {
			const segmentsLump = this.lumps.find((lump) => lump.lumpName === "SEGS");
			if (segmentsLump !== undefined) {
				await this.sendEvent(
					WadFileEvent.MAP_SEGMENTS_PARSING,
					`Segments parsing for ${this.mapName}`,
				);
				map.segments = this.getMapSegments(
					segmentsLump.lumpLocation,
					segmentsLump.lumpSize,
				);
			}
		} else {
			await this.sendEvent(
				WadFileEvent.MAP_SKIPPING_SEGMENTS,
				`SKIPPING Segments parsing for ${this.mapName}`,
			);
		}

		if (this.options.parseSubSectors) {
			const subSectorsLump = this.lumps.find(
				(lump) => lump.lumpName === "SSECTORS",
			);
			if (subSectorsLump !== undefined) {
				await this.sendEvent(
					WadFileEvent.MAP_SUBSECTORS_PARSING,
					`SubSectors parsing for ${this.mapName}`,
				);
				map.subSectors = this.getMapSubSectors(
					subSectorsLump.lumpLocation,
					subSectorsLump.lumpSize,
				);
			}
		} else {
			await this.sendEvent(
				WadFileEvent.MAP_SKIPPING_SUBSECTORS,
				`SKIPPING SubSectors parsing for ${this.mapName}`,
			);
		}

		if (this.options.parseNodes) {
			const nodesLump = this.lumps.find((lump) => lump.lumpName === "NODES");
			if (nodesLump !== undefined) {
				await this.sendEvent(
					WadFileEvent.MAP_NODES_PARSING,
					`Nodes parsing for ${this.mapName}`,
				);
				map.nodes = this.getMapNodes(
					nodesLump.lumpLocation,
					nodesLump.lumpSize,
				);
			}
		} else {
			await this.sendEvent(
				WadFileEvent.MAP_SKIPPING_NODES,
				`SKIPPING Nodes parsing for ${this.mapName}`,
			);
		}

		const sectorLump = this.lumps.find((lump) => lump.lumpName === "SECTORS");
		if (sectorLump !== undefined) {
			await this.sendEvent(
				WadFileEvent.MAP_SECTORS_PARSING,
				`Sectors parsing for ${this.mapName}`,
			);
			map.sectors = this.getMapSectors(
				sectorLump.lumpLocation,
				sectorLump.lumpSize,
			);
		}

		if (this.options.parseRejects) {
			const rejectLump = this.lumps.find((lump) => lump.lumpName === "REJECT");
			if (rejectLump !== undefined) {
				await this.sendEvent(
					WadFileEvent.MAP_REJECT_TABLE_PARSING,
					`RejectTable parsing for ${this.mapName}`,
				);
				map.rejectTable = this.getMapRejectTable(
					rejectLump.lumpLocation,
					rejectLump.lumpSize,
					map.sectors.length,
				);
			}
		} else {
			await this.sendEvent(
				WadFileEvent.MAP_SKIPPING_REJECT_TABLE,
				`SKIPPING RejectTable parsing for ${this.mapName}`,
			);
		}

		const blockmapLump = this.lumps.find(
			(lump) => lump.lumpName === "BLOCKMAP",
		);
		if (blockmapLump !== undefined) {
			await this.sendEvent(
				WadFileEvent.MAP_BLOCKMAP_PARSING,
				`BlockMap parsing for ${this.mapName}`,
			);
			if (!this.options.parseBlockmap) {
				await this.sendEvent(
					WadFileEvent.MAP_SKIPPING_BLOCKLIST,
					`SKIPPING BlockList parsing for ${this.mapName}`,
				);
			}
			map.blockMap = this.getMapBlockmap(
				blockmapLump.lumpLocation,
				blockmapLump.lumpSize,
			);
		}

		return map;
	};
}
