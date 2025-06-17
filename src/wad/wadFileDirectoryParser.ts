import { type FileTypeResult, fileTypeFromBuffer } from "file-type";
import {
	LumpType,
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileMapInfoParser,
	WadFileParser,
	type WadHeader,
	type WadMapInfo,
	type WadParserOptions,
	colormapLumpName,
	compLvlLumpName,
	dehackedLumpName,
	demoMatcher,
	endoomLumpName,
	flatEndLumpMatcher,
	flatStartLumpMatcher,
	getWadMapInfoNames,
	hiresTexEndLumpName,
	hiresTexStartLumpName,
	isMapLump,
	mapInfoLumpMatcher,
	mapNameMatcher,
	menuGraphicLumpNames,
	musInfoLumpName,
	musicLumpNames,
	patchEndLumpMatcher,
	patchStartLumpMatcher,
	playpalLumpName,
	pnamesLumpName,
	spriteEndLumpMatcher,
	spriteStartLumpMatcher,
	standaloneTexEndLumpName,
	standaloneTexStartLumpName,
	statusBarLumpMatchers,
	texture1LumpName,
	texture2LumpName,
	utf8ArrayToStr,
} from "../index.js";
import {
	getWadMapInfoMenuGraphics,
	getWadMapInfoMusic,
	getWadMapInfoPatchNames,
} from "../interfaces/wad/WadMapInfo.js";

interface WadDirectoryParserOptions extends WadParserOptions {
	header: WadHeader;
}

export class WadFileDirectoryParser extends WadFileParser {
	private header: WadHeader;
	constructor(opts: WadDirectoryParserOptions) {
		super(opts);
		this.header = opts.header;
	}

	public parseDirectory = async (): Promise<
		[WadDirectory, WadMapInfo | undefined]
	> => {
		const directoryEntryLength = 16;
		const directory: WadDirectory = [];
		let mapInfo: WadMapInfo | undefined = undefined;
		const view = new Uint8Array(
			this.file.slice(
				this.header.directoryLocation,
				this.header.directoryLocation +
					this.header.directoryEntryCount * directoryEntryLength,
			),
		);

		await this.initialPass(view, directoryEntryLength, directory);

		const mapInfoLumps = directory.filter((d) => d.type === LumpType.MAPINFO);
		if (mapInfoLumps) {
			const mapInfoParser = new WadFileMapInfoParser({
				file: this.file,
				mapInfos: mapInfoLumps,
				sendEvent: this.sendEvent,
			});
			mapInfo = mapInfoParser.parseMapInfo();
		}

		if (mapInfo) {
			const names = getWadMapInfoNames(mapInfo);
			const musics = getWadMapInfoMusic(mapInfo);
			const patches = getWadMapInfoPatchNames(mapInfo);
			const menuGraphics = getWadMapInfoMenuGraphics(mapInfo);
			for (const e of directory) {
				if (names.has(e.lumpName)) {
					e.type = LumpType.MAPMARKER;
				} else if (musics.has(e.lumpName)) {
					e.type = LumpType.MUSIC;
					if (!e.musicType) this.detectPredefinedLumpContent(e);
				} else if (patches.includes(e.lumpName)) {
					e.type = LumpType.PATCH;
					if (!e.imageType) this.detectPredefinedLumpContent(e);
				} else if (menuGraphics.includes(e.lumpName)) {
					e.type = LumpType.MENU_PATCH;
					if (!e.imageType) this.detectPredefinedLumpContent(e);
				}
			}
		}

		for (const unknownLump of directory.filter(
			(d) => d.type === LumpType.UNKNOWN,
		)) {
			const content = this.file.slice(
				unknownLump.lumpLocation,
				unknownLump.lumpLocation + unknownLump.lumpSize,
			);

			const detection = await this.detectUnknownContent(content);

			if (detection && detection.category === "music") {
				unknownLump.type = LumpType.MUSIC;
				unknownLump.musicType = detection.type;
			}
			if (detection && detection.category === "sfx") {
				unknownLump.type = LumpType.SFX;
			}
			if (detection && detection.category === "patch") {
				unknownLump.type = LumpType.PATCH;
				unknownLump.imageType = detection.type;
			}
			if (detection && detection.category === "text") {
				unknownLump.type = LumpType.TEXT;
			}
		}

		return [directory, mapInfo];
	};

	private initialPass = async (
		view: Uint8Array<ArrayBuffer>,
		directoryEntryLength: number,
		directory: WadDirectory,
	) => {
		let lastMarker: LumpType | null = null;
		let lastMapName: string | null = null;

		for (let i = 0; i < this.header.directoryEntryCount; i++) {
			const viewStart = i * directoryEntryLength;
			const lumpLocation = new Int32Array(
				view.buffer.slice(viewStart, viewStart + 4),
			)[0];
			const lumpSize = new Int32Array(
				view.buffer.slice(viewStart + 4, viewStart + 8),
			)[0];
			const lumpName = utf8ArrayToStr(
				view.subarray(viewStart + 8, viewStart + 16),
			).toUpperCase();

			const [type, detectedMarker] = this.detectLumpType(
				lumpName,
				lumpSize,
				lastMarker,
			);
			lastMarker = detectedMarker;

			let imageType: FileTypeResult | undefined;
			let musicType: FileTypeResult | undefined;
			let mapName: string | undefined;

			if (type === LumpType.MAPMARKER) {
				lastMapName = lumpName;
			}

			if (type === LumpType.MAPDATA && lastMapName) {
				mapName = lastMapName;
			}

			const entry = {
				lumpLocation,
				lumpSize,
				lumpName,
				lumpIdx: i,
				type,
				imageType,
				musicType,
				mapName,
			};
			this.detectPredefinedLumpContent(entry);

			directory.push(entry);
		}
	};

	private detectPredefinedLumpContent = async (dirEntry: WadDirectoryEntry) => {
		const graphicTypes = [
			LumpType.PATCH,
			LumpType.MENU_PATCH,
			LumpType.STBAR_PATCH,
			LumpType.SPRITE,
		];
		if (
			graphicTypes.includes(dirEntry.type) ||
			dirEntry.type === LumpType.MUSIC
		) {
			const content = this.file.slice(
				dirEntry.lumpLocation,
				dirEntry.lumpLocation + dirEntry.lumpSize,
			);
			if (graphicTypes.includes(dirEntry.type)) {
				dirEntry.imageType =
					(await this.detectPatchContent(content)) ?? undefined;
			}
			if (dirEntry.type === LumpType.MUSIC) {
				dirEntry.musicType =
					(await this.detectMusicContent(content)) ?? undefined;
			}
		}
	};

	private detectLumpType = (
		lumpName: string,
		lumpSize: number,
		lastMarker: LumpType | null,
	): [LumpType, LumpType | null] => {
		// MARKERS
		if (lumpName.match(patchStartLumpMatcher))
			return [LumpType.PATCH_START, LumpType.PATCH_START];
		if (lumpName.match(patchEndLumpMatcher))
			return [LumpType.PATCH_END, LumpType.PATCH_END];
		if (lumpName.match(flatStartLumpMatcher))
			return [LumpType.FLAT_START, LumpType.FLAT_START];
		if (lumpName.match(flatEndLumpMatcher))
			return [LumpType.FLAT_END, LumpType.FLAT_END];
		if (lumpName.match(spriteStartLumpMatcher))
			return [LumpType.SPRITE_START, LumpType.SPRITE_START];
		if (lumpName.match(spriteEndLumpMatcher))
			return [LumpType.SPRITE_END, LumpType.SPRITE_END];
		if (lumpName === standaloneTexStartLumpName)
			return [LumpType.TX_START, LumpType.TX_START];
		if (lumpName === standaloneTexEndLumpName)
			return [LumpType.TX_END, LumpType.TX_END];
		if (lumpName === hiresTexStartLumpName)
			return [LumpType.HI_START, LumpType.HI_START];
		if (lumpName === hiresTexEndLumpName)
			return [LumpType.HI_END, LumpType.HI_END];
		if (lumpName.match(mapNameMatcher)) return [LumpType.MAPMARKER, lastMarker];

		// DATA
		if (lumpSize === 0) {
			return [LumpType.UNKNOWN, lastMarker];
		}

		if (lumpName === pnamesLumpName) return [LumpType.PNAMES, lastMarker];
		if (lumpName === texture1LumpName) return [LumpType.TEXTURES1, lastMarker];
		if (lumpName === texture2LumpName) return [LumpType.TEXTURES2, lastMarker];
		if (lastMarker === LumpType.PATCH_START) {
			return [LumpType.PATCH, lastMarker];
		}
		if (lastMarker === LumpType.SPRITE_START) {
			return [LumpType.SPRITE, lastMarker];
		}
		if (lastMarker === LumpType.FLAT_START) {
			return [LumpType.FLAT, lastMarker];
		}
		if (lastMarker === LumpType.TX_START) {
			return [LumpType.TX_PATCH, lastMarker];
		}
		if (lastMarker === LumpType.HI_START) {
			return [LumpType.HI_PATCH, lastMarker];
		}

		if (lumpName === compLvlLumpName) return [LumpType.COMPLVL, lastMarker];
		if (lumpName === playpalLumpName) return [LumpType.PLAYPAL, lastMarker];
		if (lumpName === colormapLumpName) return [LumpType.COLORMAP, lastMarker];
		if (lumpName === endoomLumpName) return [LumpType.ENDOOM, lastMarker];
		if (lumpName === dehackedLumpName) return [LumpType.DEHACKED, lastMarker];
		if (lumpName.match(demoMatcher)) return [LumpType.DEMO, lastMarker];
		if (lumpName === musInfoLumpName) return [LumpType.MUSINFO, lastMarker];

		if (lumpName.match(mapInfoLumpMatcher))
			return [LumpType.MAPINFO, lastMarker];
		if (isMapLump(lumpName)) return [LumpType.MAPDATA, lastMarker];

		for (const matcher of statusBarLumpMatchers) {
			if (lumpName.match(matcher)) return [LumpType.STBAR_PATCH, lastMarker];
		}
		for (const matcher of menuGraphicLumpNames) {
			if (lumpName.match(matcher)) return [LumpType.MENU_PATCH, lastMarker];
		}
		if (musicLumpNames.includes(lumpName)) return [LumpType.MUSIC, lastMarker];

		return [LumpType.UNKNOWN, lastMarker];
	};

	private detectPatchContent = async (
		data: ArrayBuffer,
	): Promise<FileTypeResult | null> => {
		if (this.isDoomPatch(data)) {
			return { ext: "patch", mime: "image/doom-patch" };
		}
		const autoDetectType = await fileTypeFromBuffer(data);
		if (autoDetectType?.mime.startsWith("image")) return autoDetectType;
		return null;
	};

	private isDoomPatch = (content: ArrayBuffer) => {
		if (content.byteLength < 12) return false;

		const view = new DataView(content);
		const width = view.getUint16(0, true);
		const height = view.getUint16(2, true);
		if (width === 0 || height === 0 || width > 4096 || height > 4096) {
			return false;
		}

		if (content.byteLength < 8 + width * 4) return false;

		const columnofs: number[] = [];
		for (let i = 0; i < width; i++) {
			const offset = view.getUint32(8 + i * 4, true);
			columnofs.push(offset);
			if (offset >= content.byteLength) return false;
		}
		return true;
	};

	private detectMusicContent = async (
		data: ArrayBuffer,
	): Promise<FileTypeResult | null> => {
		const slice = new Uint8Array(data.slice(0, 3));
		if (slice[0] === 77 && slice[1] === 85 && slice[2] === 83) {
			return { ext: "mus", mime: "audio/mus" };
		}

		const autoDetectType = await fileTypeFromBuffer(data);
		if (autoDetectType?.mime.startsWith("audio")) return autoDetectType;
		const modFileType = this.detectModuleType(data);

		if (modFileType) {
			return { ext: modFileType, mime: "audio/x-mod" };
		}
		return null;
	};

	private detectModuleType(content: ArrayBuffer) {
		const maxSignatureSize = 0x30;
		if (content.byteLength < maxSignatureSize) return null;

		const signature = new Uint8Array(content, 0, maxSignatureSize);

		const checkSignature = (offset: number, str: string) => {
			for (let i = 0; i < str.length; i++) {
				if (signature[offset + i] !== str.charCodeAt(i)) {
					return false;
				}
			}
			return true;
		};

		if (signature.length >= 4) {
			if (checkSignature(0, "IMPM")) {
				return "it";
			}
			if (signature.length >= 17 && checkSignature(0, "Extended Module: ")) {
				return "xm";
			}
			if (signature.length >= 0x30 && checkSignature(0x2c, "SCRM")) {
				return "s3m";
			}
			if (signature.length >= 4 && checkSignature(0, "PSM ")) {
				return "psm";
			}
			if (signature.length >= 3 && checkSignature(0, "MTM")) {
				return "mtm";
			}
			if (signature.length >= 4 && checkSignature(0, "RIFF")) {
				return "riff";
			}
		}

		if (content.byteLength >= 1084) {
			const modSignature = new Uint8Array(content, 1080, 4);
			const modSigStr = String.fromCharCode(...modSignature);
			const validModSignatures = [
				"M.K.",
				"M!K!",
				"FLT4",
				"FLT8",
				"4CHN",
				"6CHN",
				"8CHN",
				"12CH",
				"16CH",
				"32CH",
			];

			if (validModSignatures.includes(modSigStr)) {
				return "mod";
			}
		}

		return null;
	}

	private detectUnknownContent = async (
		data: ArrayBuffer,
	): Promise<{
		type: FileTypeResult;
		category: "patch" | "music" | "sfx" | "text";
	} | null> => {
		const doomSfx = this.isDoomSFX(data);
		if (doomSfx) return { type: doomSfx, category: "sfx" };
		const music = await this.detectMusicContent(data);
		if (music) return { type: music, category: "music" };
		const patch = await this.detectPatchContent(data);
		if (patch) return { type: patch, category: "patch" };

		const autoDetectType = await fileTypeFromBuffer(data);
		if (autoDetectType?.mime.startsWith("text"))
			return { type: autoDetectType, category: "text" };
		return null;
	};

	private isDoomSFX = (data: ArrayBuffer) => {
		const view = new DataView(data);

		if (data.byteLength < 4) {
			return null;
		}

		const format = view.getUint16(0, true);

		if (format === 3) {
			if (data.byteLength < 8) return null;
			const sampleCountWithPadding = view.getUint32(4, true);
			const expectedLength = 24 + (sampleCountWithPadding - 16);
			if (data.byteLength === expectedLength)
				return { ext: "dmx", mime: "audio/x-doom-sfx-dmx" };
		}
		if (format === 0) {
			const sampleCount = view.getUint16(2, true);
			const expectedLength = 4 + sampleCount;
			if (data.byteLength === expectedLength)
				return { ext: "spk", mime: "audio/x-doom-sfx-speaker" };
		}

		return null;
	};
}
