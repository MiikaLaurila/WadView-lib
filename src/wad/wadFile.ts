import {
	type Wad,
	type WadColorMap,
	type WadDehacked,
	WadDetectedType,
	type WadDirectory,
	type WadDirectoryEntry,
	type WadEndoom,
	WadFileEvent,
	type WadFileInfo,
	type WadFlat,
	type WadHeader,
	type WadMap,
	type WadMapGroup,
	type WadMapGroupList,
	type WadMapInfo,
	type WadMapList,
	type WadMenuGraphic,
	type WadMusInfo,
	type WadMusic,
	type WadPlaypal,
	type WadSprite,
	type WadStbarGraphic,
	type WadTextures,
	colormapLumpName,
	defaultWad,
	defaultWadDehacked,
	dehackedLumpName,
	endoomLumpName,
	playpalLumpName,
} from "../interfaces/index.js";
import {
	combineWadDehacked,
	combineWadFlats,
	combineWadMapInfos,
	combineWadMenuStbarGraphics,
	combineWadMusInfos,
	combineWadMusic,
	combineWadSprites,
	combineWadTextures,
} from "../utilities/index.js";

import {
	WadFileColormapParser,
	WadFileDehackedParser,
	WadFileDirectoryParser,
	WadFileEndoomParser,
	WadFileFlatsParser,
	WadFileHeaderParser,
	WadFileMapGroupParser,
	WadFileMapParser,
	WadFileMenuGraphicParser,
	WadFileMusicParser,
	WadFilePlaypalParser,
	WadFileSpritesParser,
	WadFileStbarGraphicParser,
	WadFileTexturesParser,
	type WadMapParsingOptions,
} from "./index.js";

interface LogMessage {
	evt: WadFileEvent;
	msg?: string;
}
interface WadFileOptions {
	fileUrl?: string;
	debugLog?: boolean;
	eventListener?: (evt: WadFileEvent, msg?: string) => void;
	readyCb?: (success: boolean, err?: string) => void;
	breatheInLog?: boolean;
	mapOpts?: WadMapParsingOptions;
}
export class WadFile {
	private _fileUrls: string[] = [];
	private _wadLoaded = false;
	private _wadLoadAttempted = false;
	private _wadLoadError = "";
	private _wadFiles: ArrayBuffer[] = [new ArrayBuffer(0)];
	private _wadStructs: Partial<Wad>[] = [
		JSON.parse(JSON.stringify(defaultWad)),
	];
	private _dehFile: ArrayBuffer | undefined = undefined;
	private _dehStruct: WadDehacked = JSON.parse(
		JSON.stringify(defaultWadDehacked),
	);
	private _wadName = "";
	private readonly _internalLog: LogMessage[] = [];
	private readonly _eventSink?: (evt: WadFileEvent, msg?: string) => void =
		undefined;
	private readonly mapOpts: WadMapParsingOptions;
	private readonly _debugLog: boolean = false;
	private readonly _breatheInLog: boolean = false;
	constructor(opts: WadFileOptions) {
		this.mapOpts = opts.mapOpts ?? {};
		this._debugLog = opts.debugLog ?? false;
		this._breatheInLog = opts.breatheInLog ?? false;
		if (opts.eventListener !== undefined) {
			this._eventSink = opts.eventListener;
		}
		if (opts.fileUrl !== undefined && opts.readyCb === undefined) {
			const msg =
				"Ready callback option is required when providing a file URL directly to constructor";
			console.info(msg);
			this.sendEvent(WadFileEvent.MISSING_READYCB, msg);
		}
		if (opts.fileUrl !== undefined && opts.readyCb !== undefined) {
			this._fileUrls = [opts.fileUrl];
			this.loadFileFromUrl(this._fileUrls[0], opts.readyCb);
		}
	}

	private async breathe(ms: number): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, ms));
	}

	private async sendEvent(
		evt: WadFileEvent,
		msg?: string,
		addDelay?: number,
	): Promise<void> {
		if (this._eventSink !== undefined) {
			if (!this._debugLog && evt.includes("DEBUG")) return;
			this._eventSink(evt, msg);
			this._internalLog.push({ evt, msg });
			if (this._breatheInLog) {
				await this.breathe(addDelay || 1);
			}
		}
	}

	get eventLog(): LogMessage[] {
		return this._internalLog;
	}

	get fileUrls(): string[] {
		return this._fileUrls;
	}

	get niceFileNames(): string[] {
		return this.fileUrls.map((s) => {
			const removeWad = s.split(/[.]WAD/i)[0];
			const afterSlash = removeWad.split("/").pop();
			if (afterSlash) return afterSlash;
			return removeWad;
		});
	}

	get wadLoaded(): boolean {
		return this._wadLoaded;
	}

	private set wadLoaded(loaded: boolean) {
		this._wadLoaded = loaded;
	}

	get wadLoadAttempted(): boolean {
		return this._wadLoadAttempted;
	}

	private set wadLoadAttempted(attempted: boolean) {
		this._wadLoadAttempted = attempted;
	}

	get wadLoadError(): string {
		return this._wadLoadError;
	}

	private set wadLoadError(errMsg: string) {
		this._wadLoadError = errMsg;
	}

	private get wadFiles(): ArrayBuffer[] {
		return this._wadFiles;
	}

	private set wadFiles(files: ArrayBuffer[]) {
		this._wadFiles = files;
	}

	get wadFileLengths(): number[] {
		return this._wadFiles.map((f) => f.byteLength);
	}

	private get fileLoaded(): boolean {
		return (
			this.wadLoadAttempted &&
			this.wadLoaded &&
			this.wadFiles.length > 0 &&
			this.wadFiles[0].byteLength > 0
		);
	}

	get wadName(): string {
		return this._wadName;
	}

	public loadFile(
		file: File,
		callback?: (success: boolean, err?: string) => void,
	): void {
		this.wadLoadAttempted = true;
		this._wadStructs = [JSON.parse(JSON.stringify(defaultWad))];
		this._fileUrls = [file.name];
		this._wadFiles = [new ArrayBuffer(0)];
		try {
			file
				.arrayBuffer()
				.then((buf) => {
					this.wadFiles = [buf];
					this.wadLoaded = true;
					void this.sendEvent(WadFileEvent.FILE_LOADED);
					if (callback !== undefined) callback(true);
				})
				.catch((e) => {
					console.error(e);
					this.wadLoadError = (e as Error).message;
					if (callback !== undefined) callback(false, e);
				});
		} catch (e) {
			console.error(e);
			this.wadLoadError = (e as Error).message;
			if (callback !== undefined) callback(false, this.wadLoadError);
		}
	}

	public loadArrayBuffer(
		file: ArrayBuffer,
		fileName: string,
		callback?: (success: boolean, err?: string) => void,
	): void {
		this.wadLoadAttempted = true;
		this._wadStructs = [JSON.parse(JSON.stringify(defaultWad))];
		this._fileUrls = [fileName];
		this.wadFiles = [file];
		this.wadLoaded = true;
		void this.sendEvent(WadFileEvent.FILE_LOADED, `Loaded ${fileName}`);
		if (callback !== undefined) callback(true);
	}

	public loadArrayBuffers(
		files: ArrayBuffer[],
		fileNames: string[],
		wadName: string,
		callback?: (success: boolean, err?: string) => void,
	): void {
		const wadFiles = Array.from(fileNames)
			.map((f, idx) => {
				if (f.toLowerCase().endsWith(".wad")) {
					return files[idx];
				}
				return undefined;
			})
			.filter((f) => f !== undefined);

		const dehFiles = Array.from(fileNames)
			.map((f, idx) => {
				if (f.toLowerCase().endsWith(".deh")) {
					return files[idx];
				}
				return undefined;
			})
			.filter((f) => f !== undefined);

		this.wadLoadAttempted = true;
		this._wadStructs = [];
		for (let i = 0; i < wadFiles.length; i++) {
			this._wadStructs.push(JSON.parse(JSON.stringify(defaultWad)));
		}
		this._fileUrls = fileNames.filter((f) => f.toLowerCase().endsWith(".wad"));
		this.wadFiles = wadFiles;
		this._dehFile = dehFiles.length > 0 ? dehFiles[0] : this._dehFile;
		this._dehStruct = JSON.parse(JSON.stringify(defaultWadDehacked));
		this.wadLoaded = true;
		this._wadName = wadName;
		void this.sendEvent(
			WadFileEvent.FILE_LOADED,
			`Loaded ${fileNames.join(", ")}`,
		);
		if (callback !== undefined) callback(true);
	}

	public loadFileFromUrl(
		fileUrl: string,
		callback?: (success: boolean, err?: string) => void,
	): void {
		this.wadLoadAttempted = true;
		this._wadStructs = [JSON.parse(JSON.stringify(defaultWad))];
		this._fileUrls = [fileUrl];
		this._wadFiles = [new ArrayBuffer(0)];
		fetch(fileUrl)
			.then(async (res) => {
				try {
					this.wadFiles = [await res.arrayBuffer()];
					this.wadLoaded = true;
					void this.sendEvent(WadFileEvent.FILE_LOADED);
					if (callback !== undefined) callback(true);
				} catch (e) {
					console.error(e);
					this.wadLoadError = (e as Error).message;
					if (callback !== undefined) callback(false, this.wadLoadError);
				}
			})
			.catch((e) => {
				console.error(e);
				this.wadLoadError = (e as Error).message;
				if (callback !== undefined) callback(false, this.wadLoadError);
			});
	}

	// biome-ignore lint/suspicious/noExplicitAny: Can't find a solution to this
	private async parseForAllWads<T extends any[], K>(
		props: (keyof Wad)[],
		requirements: () => Promise<K>,
		parserFn: (idx: number, reqs: K) => Promise<T | undefined>,
	): Promise<{ [I in keyof T]: T[I] | undefined }[]> {
		const reqs = await requirements();
		const results: { [I in keyof T]: T[I] | undefined }[] = [];

		for (let idx = 0; idx < this._wadFiles.length; idx++) {
			let result: (T[number] | undefined)[] = [];
			for (let propIdx = 0; propIdx < props.length; propIdx++) {
				const prop = props[propIdx];
				const struct = this._wadStructs[idx];
				result.push(struct?.[prop]);
			}
			if (result.includes(undefined)) {
				result = [];
				const parseRes = await parserFn(idx, reqs);

				if (parseRes) {
					result.push(...parseRes);
				} else {
					result.push(...Array(props.length).fill(undefined));
				}
			}
			results.push(result as { [I in keyof T]: T[I] | undefined });
		}
		return results;
	}

	private async generateWadFileInfos<T>(
		data: (T | undefined)[],
		wadFileNames: string[],
	): Promise<WadFileInfo<T>[]> {
		return data
			.map((h, idx) => {
				if (!h) return;
				return {
					wadFileName: wadFileNames[idx],
					wadIdx: idx,
					...h,
				};
			})
			.filter((d) => d !== undefined);
	}

	private async headers(): Promise<(WadHeader | undefined)[]> {
		if (!this.fileLoaded) {
			return this._wadStructs.map((s) => undefined);
		}

		if (this._wadStructs.every((w) => w.header)) {
			return this._wadStructs.map((w) => w.header);
		}

		const result = await this.parseForAllWads<[WadHeader], null>(
			["header"],
			async () => null,
			async (idx, _) => {
				await this.sendEvent(
					WadFileEvent.HEADER_PARSING,
					`Header parsing for ${this._fileUrls[idx]}`,
				);
				const headerParser = new WadFileHeaderParser({
					file: this._wadFiles[idx],
					sendEvent: this.sendEvent,
				});
				const res = headerParser.parseHeader();
				return res ? [res] : undefined;
			},
		);

		const headers = result.map((r) => r[0]);

		this.setHeaders(headers);
		return headers;
	}

	private setHeaders(headers: (WadHeader | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.header = headers[idx];
		});
	}

	public async header(): Promise<WadFileInfo<WadHeader>[]> {
		return await this.generateWadFileInfos<WadHeader>(
			await this.headers(),
			this.niceFileNames,
		);
	}

	private async detectedTypes(): Promise<(WadDetectedType | undefined)[]> {
		if (!this.fileLoaded) {
			return [undefined];
		}
		if (this._wadStructs.every((s) => s.detectedType)) {
			return this._wadStructs.map((s) => s.detectedType);
		}

		const detectedTypes: WadDetectedType[] = [];
		for (const niceFileName of this.niceFileNames) {
			const fileNameCheck = niceFileName.toLowerCase();

			let currentDetectType = WadDetectedType.DOOM;

			if (fileNameCheck.includes("heretic"))
				currentDetectType = WadDetectedType.HERETIC;

			if (fileNameCheck.includes("hexen"))
				currentDetectType = WadDetectedType.HEXEN;

			if (fileNameCheck.includes("chex"))
				currentDetectType = WadDetectedType.CHEX;

			if (fileNameCheck.includes("strife"))
				currentDetectType = WadDetectedType.STRIFE;

			await this.sendEvent(
				WadFileEvent.DETECTED_TYPE_SET,
				`Set detected WAD type of ${niceFileName} to ${currentDetectType}`,
			);
			detectedTypes.push(currentDetectType);
		}
		this.setDetectedTypes(detectedTypes);
		return detectedTypes;
	}

	private setDetectedTypes(detectedTypes: WadDetectedType[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.detectedType = detectedTypes[idx];
		});
	}

	public async detectedType(): Promise<WadFileInfo<WadDetectedType>[]> {
		return await this.generateWadFileInfos<WadDetectedType>(
			await this.detectedTypes(),
			this.niceFileNames,
		);
	}

	private async directories(): Promise<(WadDirectory | undefined)[]> {
		if (this._wadStructs.every((w) => w.directory)) {
			return this._wadStructs.map((w) => w.directory);
		}

		const result = await this.parseForAllWads<
			[WadDirectory, WadMapInfo | undefined],
			(WadHeader | undefined)[]
		>(
			["directory", "mapInfo"],
			async () => {
				return await this.headers();
			},
			async (idx, headers) => {
				await this.sendEvent(
					WadFileEvent.DIRECTORY_PARSING,
					`Directory parsing for ${this._fileUrls[idx]}`,
				);
				if (headers[idx]) {
					const directoryParser = new WadFileDirectoryParser({
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
						header: headers[idx],
					});
					const [directory, mapInfo] = await directoryParser.parseDirectory();
					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${directory.length} lumps`,
					);
					return [directory, mapInfo];
				}
				return undefined;
			},
		);

		const directories = result.map((r) => r[0]);
		const mapInfos = result.map((r) => r[1]);

		this.setDirectories(directories);
		this.setMapInfos(mapInfos);
		return directories;
	}

	private setDirectories(dirs: (WadDirectory | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.directory = dirs[idx];
		});
	}

	public async directory(): Promise<WadFileInfo<WadDirectoryEntry>[]> {
		const rawDirs = (await this.directories()).filter((d) => d !== undefined);

		return (
			await this.generateWadFileInfos<{ data: WadDirectory }>(
				rawDirs.map((d) => {
					return { data: d };
				}),
				this.niceFileNames,
			)
		).flatMap((e) => {
			return e.data.map((d) => {
				return {
					...d,
					wadIdx: e.wadIdx,
					wadFileName: e.wadFileName,
				} as WadFileInfo<WadDirectoryEntry>;
			});
		});
	}

	private async mapInfos(): Promise<(WadMapInfo | undefined)[]> {
		await this.directories();
		return this._wadStructs.map((s) => s.mapInfo);
	}

	private setMapInfos(mapInfos: (WadMapInfo | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.mapInfo = mapInfos[idx];
		});
	}

	public async mapInfo(): Promise<WadMapInfo> {
		const mapInfos = (await this.mapInfos()).filter((d) => d !== undefined);
		return combineWadMapInfos(mapInfos);
	}

	private async mapGroupLists(): Promise<(WadMapGroupList | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadMapGroupList],
			(WadDirectory | undefined)[]
		>(
			["mapGroups"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.MAPGROUPS_PARSING,
						`MapGroups parsing for ${this._fileUrls[idx]}`,
					);

					const mapGroupParser = new WadFileMapGroupParser({
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
						directory: dirs[idx],
					});
					return [mapGroupParser.parseMapGroups()];
				}
				return undefined;
			},
		);

		const mapGroups = result.map((r) => r[0]);

		this.setMapGroups(mapGroups);
		return mapGroups;
	}

	private setMapGroups(groups: (WadMapGroupList | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.mapGroups = groups[idx];
		});
	}

	public async mapGroups(): Promise<WadFileInfo<WadMapGroup>[]> {
		const mapGroups = (await this.mapGroupLists())
			.filter((d) => d !== undefined)
			.flat();

		return await this.generateWadFileInfos<WadMapGroup>(
			mapGroups,
			this.niceFileNames,
		);
	}

	private async mapsLists(): Promise<(WadMapList | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadMapList],
			(WadMapGroupList | undefined)[]
		>(
			["maps"],
			async () => {
				return await this.mapGroupLists();
			},
			async (idx, mapGroupsList) => {
				if (mapGroupsList[idx]) {
					await this.sendEvent(
						WadFileEvent.MAPS_PARSING,
						`Maps parsing for ${this._fileUrls[idx]}`,
					);

					const maps: WadMapList = [];
					for (let i = 0; i < mapGroupsList[idx].length; i++) {
						const mapGroup = mapGroupsList[idx][i];
						const mapParser = new WadFileMapParser({
							...this.mapOpts,
							lumps: mapGroup.lumps,
							mapName: mapGroup.name,
							file: this._wadFiles[idx],
							sendEvent: this.sendEvent,
							detectedType:
								(await this.detectedType())[idx] ?? WadDetectedType.DOOM,
						});
						const map = await mapParser.parseMap();
						maps.push(map);
					}

					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${maps.length} maps`,
					);
					return [maps];
				}
				return undefined;
			},
		);

		const maps = result.map((r) => r[0]);

		this.setMaps(maps);
		return maps;
	}

	private setMaps(maps: (WadMapList | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.maps = maps[idx];
		});
	}

	public async maps(): Promise<WadFileInfo<WadMap>[]> {
		const maps = (await this.mapsLists()).filter((d) => d !== undefined).flat();
		return await this.generateWadFileInfos<WadMap>(maps, this.niceFileNames);
	}

	private async playpals(): Promise<(WadPlaypal | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadPlaypal],
			(WadDirectory | undefined)[]
		>(
			["playpal"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.PLAYPAL_PARSING,
						`Playpal parsing for ${this._fileUrls[idx]}`,
					);

					const playPalLump = dirs[idx].find(
						(e) => e.lumpName === playpalLumpName,
					);
					if (playPalLump === undefined) {
						return undefined;
					}

					const playpalParser = new WadFilePlaypalParser({
						lumps: [playPalLump],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					return [playpalParser.parsePlaypal()];
				}
				return undefined;
			},
		);

		const playpals = result.map((r) => r[0]);

		this.setPlaypals(playpals);
		return playpals;
	}

	private setPlaypals(playpals: (WadPlaypal | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.playpal = playpals[idx];
		});
	}

	public async playpal(): Promise<WadFileInfo<WadPlaypal>[]> {
		return await this.generateWadFileInfos<WadPlaypal>(
			await this.playpals(),
			this.niceFileNames,
		);
	}

	private async colormaps(): Promise<(WadColorMap | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadColorMap],
			(WadDirectory | undefined)[]
		>(
			["colormap"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					const colormapLump = dirs[idx].find(
						(e) => e.lumpName === colormapLumpName,
					);
					if (colormapLump === undefined) {
						return undefined;
					}
					await this.sendEvent(
						WadFileEvent.COLORMAP_PARSING,
						`ColorMap parsing for ${this._fileUrls[idx]}`,
					);

					const colormapParser = new WadFileColormapParser({
						lumps: [colormapLump],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					return [colormapParser.parseColormap()];
				}
				return undefined;
			},
		);

		const colormaps = result.map((r) => r[0]);

		this.setColormaps(colormaps);
		return colormaps;
	}

	private setColormaps(colormaps: (WadColorMap | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.colormap = colormaps[idx];
		});
	}

	public async colormap(): Promise<WadFileInfo<WadColorMap>[]> {
		return await this.generateWadFileInfos<WadColorMap>(
			await this.colormaps(),
			this.niceFileNames,
		);
	}

	private async endooms(): Promise<(WadEndoom | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadEndoom],
			(WadDirectory | undefined)[]
		>(
			["endoom"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					const endoomLump = dirs[idx].find(
						(e) => e.lumpName === endoomLumpName,
					);
					if (endoomLump === undefined) {
						return undefined;
					}
					await this.sendEvent(
						WadFileEvent.ENDOOM_PARSING,
						`Endoom parsing for ${this._fileUrls[idx]}`,
					);
					const endoomParser = new WadFileEndoomParser({
						lumps: [endoomLump],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					return [endoomParser.parseEndoom()];
				}
				return undefined;
			},
		);

		const endooms = result.map((r) => r[0]);

		this.setEndooms(endooms);
		return endooms;
	}

	private setEndooms(endooms: (WadEndoom | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.endoom = endooms[idx];
		});
	}

	public async endoom(): Promise<WadFileInfo<WadEndoom>[]> {
		return await this.generateWadFileInfos<WadEndoom>(
			await this.endooms(),
			this.niceFileNames,
		);
	}

	private async dehackeds(): Promise<(WadDehacked | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadDehacked],
			(WadDirectory | undefined)[]
		>(
			["dehacked"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					const dehackedLump = dirs[idx].find(
						(e) => e.lumpName === dehackedLumpName,
					);
					if (dehackedLump === undefined) {
						return undefined;
					}
					await this.sendEvent(
						WadFileEvent.DEHACKED_PARSING,
						`Dehacked parsing for ${this._fileUrls[idx]}`,
					);
					const dehackedParser = new WadFileDehackedParser({
						lumps: [dehackedLump],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
						fileName: this.fileUrls[idx],
					});
					return [dehackedParser.parseDehacked()];
				}
				return undefined;
			},
		);

		const dehackeds = result.map((r) => r[0]);

		this.setDehackeds(dehackeds);
		return dehackeds;
	}

	private setDehackeds(dehackeds: (WadDehacked | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.dehacked = dehackeds[idx];
		});
	}

	private async dehackedExternal(): Promise<WadDehacked | undefined> {
		if (!this._dehFile) {
			return undefined;
		}
		if (this._dehStruct.dehackedString) {
			return this._dehStruct;
		}
		await this.sendEvent(
			WadFileEvent.DEHACKED_PARSING,
			"Dehacked parsing from external DEH file",
		);
		const dehackedParser = new WadFileDehackedParser({
			lumps: [],
			sendEvent: this.sendEvent,
			dehackedBuffer: this._dehFile,
		});
		const dehacked = dehackedParser.parseDehacked();
		this.setDehackedExternal(dehacked);
		return dehacked;
	}

	private setDehackedExternal(dehacked: WadDehacked): void {
		this._dehStruct = dehacked;
	}

	public async dehacked(): Promise<WadDehacked> {
		const parsedDehs = await this.dehackeds();
		const externalDeh = await this.dehackedExternal();
		const allDehs = [...parsedDehs, externalDeh].filter((d) => d !== undefined);
		return combineWadDehacked(allDehs);
	}

	private async texturesList(): Promise<(WadTextures | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadTextures],
			(WadDirectory | undefined)[]
		>(
			["textures"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.TEXTURES_PARSING,
						`Textures parsing for ${this._fileUrls[idx]}`,
					);
					const texturesParser = new WadFileTexturesParser({
						lumps: [],
						dir: dirs[idx],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					const parsedTextures = texturesParser.parseTextures();
					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${parsedTextures.texture1.length + parsedTextures.texture2.length} textures with ${Object.keys(parsedTextures.patches).length} patches`,
					);
					return [parsedTextures];
				}
				return undefined;
			},
		);

		const textures = result.map((r) => r[0]);

		this.setTextures(textures);
		return textures;
	}

	private setTextures(textures: (WadTextures | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.textures = textures[idx];
		});
	}

	public async textures(): Promise<WadTextures> {
		const textures = (await this.texturesList()).filter((d) => d !== undefined);
		return combineWadTextures(textures);
	}

	private async flatsList(): Promise<(WadFlat[] | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadFlat[]],
			(WadDirectory | undefined)[]
		>(
			["flats"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.FLATS_PARSING,
						`Flats parsing for ${this._fileUrls[idx]}`,
					);
					const texturesParser = new WadFileFlatsParser({
						lumps: [],
						dir: dirs[idx],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					const parsedFlats = texturesParser.parseFlats();
					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${parsedFlats.length} flats`,
					);
					return [parsedFlats];
				}
				return undefined;
			},
		);

		const flats = result.map((r) => r[0]);
		this.setFlats(flats);
		return flats;
	}

	private setFlats(flats: (WadFlat[] | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.flats = flats[idx];
		});
	}

	public async flats(): Promise<WadFlat[]> {
		const flats = (await this.flatsList()).filter((d) => d !== undefined);
		return combineWadFlats(flats);
	}

	private async spritesList(): Promise<(WadSprite[] | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadSprite[]],
			(WadDirectory | undefined)[]
		>(
			["sprites"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.SPRITES_PARSING,
						`Sprites parsing for ${this._fileUrls[idx]}`,
					);
					const spritesParser = new WadFileSpritesParser({
						lumps: [],
						dir: dirs[idx],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					const parsedSprites = spritesParser.parseSprites();
					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${parsedSprites.length} sprites with ${parsedSprites.reduce((p, c) => p + c.frames.length, 0)} frames`,
					);
					return [parsedSprites];
				}
				return undefined;
			},
		);

		const sprites = result.map((r) => r[0]);

		this.setSprites(sprites);
		return sprites;
	}

	private setSprites(sprites: (WadSprite[] | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.sprites = sprites[idx];
		});
	}

	public async sprites(): Promise<WadSprite[]> {
		const sprites = (await this.spritesList()).filter((d) => d !== undefined);
		return combineWadSprites(sprites);
	}

	private async menuGraphicsList(): Promise<(WadMenuGraphic[] | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadMenuGraphic[]],
			(WadDirectory | undefined)[]
		>(
			["menuGraphics"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.MENU_GRAPHICS_PARSING,
						`Menu graphics parsing for ${this._fileUrls[idx]}`,
					);
					const menuGraphicsParser = new WadFileMenuGraphicParser({
						lumps: [],
						dir: dirs[idx],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					const parsedMenuGraphics = menuGraphicsParser.parseMenuGraphics();
					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${parsedMenuGraphics.length} menu graphics`,
					);
					return [parsedMenuGraphics];
				}
				return undefined;
			},
		);

		const menuGraphics = result.map((r) => r[0]);

		this.setMenuGraphics(menuGraphics);
		return menuGraphics;
	}

	private setMenuGraphics(
		menuGraphics: (WadMenuGraphic[] | undefined)[],
	): void {
		this._wadStructs.forEach((w, idx) => {
			w.menuGraphics = menuGraphics[idx];
		});
	}

	public async menuGraphics(): Promise<WadMenuGraphic[]> {
		const menuGraphics = (await this.menuGraphicsList()).filter(
			(d) => d !== undefined,
		);
		return combineWadMenuStbarGraphics(menuGraphics);
	}

	private async stbarGraphicsList(): Promise<
		(WadStbarGraphic[] | undefined)[]
	> {
		const result = await this.parseForAllWads<
			[WadStbarGraphic[]],
			(WadDirectory | undefined)[]
		>(
			["stbarGraphics"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.STBAR_GRAPHICS_PARSING,
						`Stbar graphics parsing for ${this._fileUrls[idx]}`,
					);
					const menuGraphicsParser = new WadFileStbarGraphicParser({
						lumps: [],
						dir: dirs[idx],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
					});
					const parsedStbarGraphics = menuGraphicsParser.parseStbarGraphics();
					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${parsedStbarGraphics.length} stbar graphics`,
					);
					return [parsedStbarGraphics];
				}
				return undefined;
			},
		);

		const stbarGraphics = result.map((r) => r[0]);

		this.setStbarGraphics(stbarGraphics);
		return stbarGraphics;
	}

	private setStbarGraphics(
		stbarGraphics: (WadStbarGraphic[] | undefined)[],
	): void {
		this._wadStructs.forEach((w, idx) => {
			w.stbarGraphics = stbarGraphics[idx];
		});
	}

	public async stbarGraphics(): Promise<WadStbarGraphic[]> {
		const stbarGraphics = (await this.stbarGraphicsList()).filter(
			(d) => d !== undefined,
		);
		return combineWadMenuStbarGraphics(stbarGraphics);
	}

	private async musicList(): Promise<(WadMusic[] | undefined)[]> {
		const result = await this.parseForAllWads<
			[WadMusic[], WadMusInfo | undefined],
			(WadDirectory | undefined)[]
		>(
			["music"],
			async () => {
				return await this.directories();
			},
			async (idx, dirs) => {
				if (dirs[idx]) {
					await this.sendEvent(
						WadFileEvent.MUSIC_PARSING,
						`Music parsing for ${this._fileUrls[idx]}`,
					);
					const musicParser = new WadFileMusicParser({
						lumps: [],
						dir: dirs[idx],
						file: this._wadFiles[idx],
						sendEvent: this.sendEvent,
						mapInfo: await this.mapInfo(),
						dehacked: await this.dehacked(),
					});
					const [music, musInfo] = await musicParser.parseMusic();
					await this.sendEvent(
						WadFileEvent.PARSED_COUNT,
						`Parsed ${music.length} music files`,
					);

					return [music, musInfo];
				}
				return undefined;
			},
		);

		const musics = result.map((r) => r[0]);
		const musInfos = result.map((r) => r[1]);

		this.setMusics(musics);
		this.setMusInfos(musInfos);

		return musics;
	}

	private setMusics(musics: (WadMusic[] | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.music = musics[idx];
		});
	}

	public async music(): Promise<WadMusic[]> {
		const musics = (await this.musicList()).filter((d) => d !== undefined);
		return combineWadMusic(musics);
	}

	private async musInfos(): Promise<(WadMusInfo | undefined)[]> {
		await this.musicList();
		return this._wadStructs.map((s) => s.musInfo);
	}

	private setMusInfos(musInfos: (WadMusInfo | undefined)[]): void {
		this._wadStructs.forEach((w, idx) => {
			w.musInfo = musInfos[idx];
		});
	}

	public async musInfo(): Promise<WadMusInfo> {
		const musInfos = (await this.musInfos()).filter((d) => d !== undefined);
		return combineWadMusInfos(musInfos);
	}
}
