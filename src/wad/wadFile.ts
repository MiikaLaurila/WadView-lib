import {
	playpalLumpName,
	colormapLumpName,
	endoomLumpName,
	dehackedLumpName,
} from "../interfaces/constants.js";
import {
	WadFileEvent,
	type Wad,
	defaultWad,
	type WadHeader,
	type WadDirectory,
	type WadMapGroupList,
	type WadMapList,
	type WadPlaypal,
	preFilledPlaypal,
	type WadColorMap,
	type WadEndoom,
	type WadDehacked,
	type WadTextures,
} from "../interfaces/index.js";
import { WadFileColormapParser } from "./wadFileColormapParser.js";
import { WadFileDehackedParser } from "./wadFileDehackedParser.js";
import { WadFileDirectoryParser } from "./wadFileDirectoryParser.js";
import { WadFileEndoomParser } from "./wadFileEndoomParser.js";
import { WadFileHeaderParser } from "./wadFileHeaderParser.js";
import { WadFileMapGroupParser } from "./wadFileMapGroupParser.js";
import {
	type WadMapParsingOptions,
	WadFileMapParser,
} from "./wadFileMapParser.js";
import { WadFilePlaypalParser } from "./wadFilePlaypalParser.js";
import { WadFileTexturesParser } from "./wadTextureParser.js";

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
	private _fileUrl = "";
	private _wadLoaded = false;
	private _wadLoadAttempted = false;
	private _wadLoadError = "";
	private _wadFile: ArrayBuffer = new ArrayBuffer(0);
	private _wadStruct: Partial<Wad> = JSON.parse(JSON.stringify(defaultWad));
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
		if (opts.fileUrl !== undefined && opts.readyCb !== undefined) {
			this._fileUrl = opts.fileUrl;
			this.loadFileFromUrl(this._fileUrl, opts.readyCb);
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

	get fileUrl(): string {
		return this._fileUrl;
	}

	get niceFileName(): string {
		const removeWad = this._fileUrl.split(/[.]WAD/i)[0];
		const afterSlash = removeWad.split("/").pop();
		if (afterSlash) return afterSlash;
		return removeWad;
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

	private get wadFile(): ArrayBuffer {
		return this._wadFile;
	}

	private set wadFile(file: ArrayBuffer) {
		this._wadFile = file;
	}

	get wadFileLength(): number {
		return this._wadFile.byteLength;
	}

	private get fileLoaded(): boolean {
		return (
			this.wadLoadAttempted && this.wadLoaded && this.wadFile.byteLength > 0
		);
	}

	public loadFile(
		file: File,
		callback?: (success: boolean, err?: string) => void,
	): void {
		this.wadLoadAttempted = true;
		this._wadStruct = JSON.parse(JSON.stringify(defaultWad));
		this._fileUrl = file.name;
		this._wadFile = new ArrayBuffer(0);
		try {
			file
				.arrayBuffer()
				.then((buf) => {
					this.wadFile = buf;
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
		this._wadStruct = JSON.parse(JSON.stringify(defaultWad));
		this._fileUrl = fileName;
		this.wadFile = file;
		this.wadLoaded = true;
		void this.sendEvent(WadFileEvent.FILE_LOADED);
		if (callback !== undefined) callback(true);
	}

	public loadFileFromUrl(
		fileUrl: string,
		callback?: (success: boolean, err?: string) => void,
	): void {
		this.wadLoadAttempted = true;
		this._wadStruct = JSON.parse(JSON.stringify(defaultWad));
		this._fileUrl = fileUrl;
		this._wadFile = new ArrayBuffer(0);
		fetch(fileUrl)
			.then(async (res) => {
				try {
					this.wadFile = await res.arrayBuffer();
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

	public async header(): Promise<WadHeader | null> {
		if (!this.fileLoaded) {
			return null;
		}
		if (this._wadStruct.header !== undefined) {
			return this._wadStruct.header;
		}
		await this.sendEvent(
			WadFileEvent.HEADER_PARSING,
			`Header parsing for ${this._fileUrl}`,
		);
		const headerParser = new WadFileHeaderParser({
			file: this.wadFile,
			sendEvent: this.sendEvent,
		});
		const header = headerParser.parseHeader();
		if (header) this.setHeader(header);
		return header;
	}

	private setHeader(header: WadHeader): void {
		this._wadStruct.header = header;
	}

	public async directory(): Promise<WadDirectory | null> {
		const header = await this.header();
		if (header === null) {
			return null;
		}
		if (this._wadStruct.directory !== undefined) {
			return this._wadStruct.directory;
		}
		await this.sendEvent(
			WadFileEvent.DIRECTORY_PARSING,
			`Directory parsing for ${this._fileUrl}`,
		);
		const directoryParser = new WadFileDirectoryParser({
			file: this.wadFile,
			sendEvent: this.sendEvent,
			header,
		});
		const directory = directoryParser.parseDirectory();
		this.setDirectory(directory);
		return directory;
	}

	private setDirectory(dir: WadDirectory): void {
		this._wadStruct.directory = dir;
	}

	public async mapGroups(): Promise<WadMapGroupList | null> {
		const dir = await this.directory();

		if (dir === null) {
			return null;
		}

		if (this._wadStruct.mapGroups !== undefined) {
			return this._wadStruct.mapGroups;
		}

		await this.sendEvent(
			WadFileEvent.MAPGROUPS_PARSING,
			`MapGroups parsing for ${this._fileUrl}`,
		);

		const mapGroupParser = new WadFileMapGroupParser({
			file: this.wadFile,
			sendEvent: this.sendEvent,
			directory: dir,
		});
		const mapGroups = mapGroupParser.parseMapGroups();

		this.setMapGroups(mapGroups);
		return mapGroups;
	}

	private setMapGroups(groups: WadMapGroupList): void {
		this._wadStruct.mapGroups = groups;
	}

	public async maps(): Promise<WadMapList | null> {
		const mapGroups = await this.mapGroups();

		if (mapGroups === null) {
			return null;
		}

		if (this._wadStruct.maps !== undefined) {
			return this._wadStruct.maps;
		}

		await this.sendEvent(
			WadFileEvent.MAPS_PARSING,
			`Maps parsing for ${this._fileUrl}`,
		);

		const maps: WadMapList = [];
		for (let i = 0; i < mapGroups.length; i++) {
			const mapGroup = mapGroups[i];
			const mapParser = new WadFileMapParser({
				...this.mapOpts,
				lumps: mapGroup.lumps,
				mapName: mapGroup.name,
				file: this.wadFile,
				sendEvent: this.sendEvent,
			});
			const map = await mapParser.parseMap();
			maps.push(map);
		}

		this.setMaps(maps);
		return maps;
	}

	private setMaps(maps: WadMapList): void {
		this._wadStruct.maps = maps;
	}

	public async playpal(): Promise<WadPlaypal | null> {
		const dir = await this.directory();

		if (dir === null) {
			return null;
		}

		if (this._wadStruct.playpal !== undefined) {
			return this._wadStruct.playpal;
		}
		await this.sendEvent(
			WadFileEvent.PLAYPAL_PARSING,
			`Playpal parsing for ${this._fileUrl}`,
		);

		const playPalLump = dir.find((e) => e.lumpName === playpalLumpName);
		if (playPalLump === undefined) {
			this.setPlaypal(preFilledPlaypal);
			return preFilledPlaypal;
		}

		const playpalParser = new WadFilePlaypalParser({
			lumps: [playPalLump],
			file: this.wadFile,
			sendEvent: this.sendEvent,
		});
		const playpal = playpalParser.parsePlaypal();

		this.setPlaypal(playpal);
		return playpal;
	}

	private setPlaypal(playpal: WadPlaypal): void {
		this._wadStruct.playpal = playpal;
	}

	public async colormap(): Promise<WadColorMap | null> {
		const dir = await this.directory();

		if (dir === null) {
			return null;
		}

		if (this._wadStruct.colormap !== undefined) {
			return this._wadStruct.colormap;
		}

		const colormapLump = dir.find((e) => e.lumpName === colormapLumpName);
		if (colormapLump === undefined) {
			return null;
		}
		await this.sendEvent(
			WadFileEvent.COLORMAP_PARSING,
			`ColorMap parsing for ${this._fileUrl}`,
		);

		const colormapParser = new WadFileColormapParser({
			lumps: [colormapLump],
			file: this.wadFile,
			sendEvent: this.sendEvent,
		});
		const colormap = colormapParser.parseColormap();

		this.setColormap(colormap);
		return colormap;
	}

	private setColormap(colorMap: WadColorMap): void {
		this._wadStruct.colormap = colorMap;
	}

	public async endoom(): Promise<WadEndoom | null> {
		const dir = await this.directory();

		if (dir === null) {
			return null;
		}

		if (this._wadStruct.endoom !== undefined) {
			return this._wadStruct.endoom;
		}

		const endoomLump = dir.find((e) => e.lumpName === endoomLumpName);
		if (endoomLump === undefined) {
			return null;
		}
		await this.sendEvent(
			WadFileEvent.ENDOOM_PARSING,
			`Endoom parsing for ${this._fileUrl}`,
		);
		const endoomParser = new WadFileEndoomParser({
			lumps: [endoomLump],
			file: this.wadFile,
			sendEvent: this.sendEvent,
		});
		const endoom = endoomParser.parseEndoom();

		this.setEndoom(endoom);
		return endoom;
	}

	private setEndoom(endoom: WadEndoom): void {
		this._wadStruct.endoom = endoom;
	}

	public async dehacked(): Promise<WadDehacked | null> {
		const dir = await this.directory();

		if (dir === null) {
			return null;
		}

		if (this._wadStruct.dehacked !== undefined) {
			return this._wadStruct.dehacked;
		}

		const dehackedLump = dir.find((e) => e.lumpName === dehackedLumpName);
		if (dehackedLump === undefined) {
			return null;
		}
		await this.sendEvent(
			WadFileEvent.DEHACKED_PARSING,
			`Dehacked parsing for ${this._fileUrl}`,
		);
		const dehackedParser = new WadFileDehackedParser({
			lumps: [dehackedLump],
			file: this.wadFile,
			sendEvent: this.sendEvent,
		});
		const dehacked = dehackedParser.parseDehacked();

		this.setDehacked(dehacked);
		return dehacked;
	}

	private setDehacked(dehacked: WadDehacked | null): void {
		this._wadStruct.dehacked = dehacked;
	}

	public async textures(): Promise<WadTextures | null> {
		const dir = await this.directory();

		if (dir === null) {
			return null;
		}

		if (this._wadStruct.textures !== undefined) {
			return this._wadStruct.textures;
		}

		await this.sendEvent(
			WadFileEvent.TEXTURES_PARSING,
			`Textures parsing for ${this._fileUrl}`,
		);
		const texturesParser = new WadFileTexturesParser({
			lumps: [],
			dir: dir,
			file: this.wadFile,
			sendEvent: this.sendEvent,
		});
		const textures = texturesParser.parseTextures();

		this.setTextures(textures);
		return textures;
	}

	private setTextures(textures: WadTextures): void {
		this._wadStruct.textures = textures;
	}
}
