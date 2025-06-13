import {
	type WadDMapInfo,
	type WadDMapInfoEndSequence,
	type WadDMapInfoEpisode,
	type WadDMapInfoMap,
	type WadDirectoryEntry,
	WadFileParser,
	type WadMapInfo,
	WadMapInfoType,
	type WadMapZMapInfo,
	type WadMapZMapInfoMap,
	type WadParserOptions,
	type WadUMapInfo,
	type WadUMapInfoMap,
	defaultWadDMapInfo,
	defaultWadDMapInfoEndSequence,
	defaultWadDMapInfoEpisode,
	defaultWadDMapInfoMap,
	defaultWadUMapInfoMap,
	defaultWadZMapInfo,
	utf8ArrayToStr,
} from "../index.js";

interface WadMapGroupParserOptions extends WadParserOptions {
	mapInfos: WadDirectoryEntry[];
}

export class WadFileMapInfoParser extends WadFileParser {
	private mapInfos: WadDirectoryEntry[];
	constructor(opts: WadMapGroupParserOptions) {
		super(opts);
		this.mapInfos = opts.mapInfos;
	}

	public parseMapInfo(): WadMapInfo {
		const parsedMapInfo: WadMapInfo = {
			type: WadMapInfoType.UNKNOWN,
		};

		for (const mapInfo of this.mapInfos) {
			const view = new Uint8Array(
				this.file.slice(
					mapInfo.lumpLocation,
					mapInfo.lumpLocation + mapInfo.lumpSize,
				),
			);

			const data = utf8ArrayToStr(view);

			if (mapInfo.lumpName === "UMAPINFO") {
				parsedMapInfo.type = WadMapInfoType.UMAPINFO;
				parsedMapInfo.uMapInfo = this.parseUmapInfo(data);
			}
			if (mapInfo.lumpName === "DMAPINFO") {
				if (parsedMapInfo.type === WadMapInfoType.UNKNOWN) {
					parsedMapInfo.type = WadMapInfoType.DMAPINFO;
				}
				parsedMapInfo.dMapInfo = this.parseDMapInfo(data);
			}
			if (mapInfo.lumpName === "ZMAPINFO") {
				if (parsedMapInfo.type === WadMapInfoType.UNKNOWN) {
					parsedMapInfo.type = WadMapInfoType.ZMAPINFO;
				}
				parsedMapInfo.zMapInfo = this.parseWadMapZMapInfo(data);
			}
			if (mapInfo.lumpName === "MAPINFO" && !parsedMapInfo.zMapInfo) {
				if (parsedMapInfo.type === WadMapInfoType.UNKNOWN) {
					parsedMapInfo.type = WadMapInfoType.ZMAPINFO;
				}
				parsedMapInfo.zMapInfo = this.parseWadMapZMapInfo(data);
			}
		}
		return parsedMapInfo;
	}

	private parseUmapInfo(data: string): WadUMapInfo {
		let currentMap: WadUMapInfoMap = { ...defaultWadUMapInfoMap };
		const uWadInfo: WadUMapInfo = {};

		const lines = data.split(/\r?\n/);
		let inMapBlock = false;
		let currentKey = "";
		let currentValue = "";

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			if (line.startsWith("//") || line === "") {
				continue;
			}

			if (line.toLowerCase().startsWith("map ")) {
				const mapName = line.substring(4).trim();
				currentMap = { ...defaultWadUMapInfoMap, id: mapName.toUpperCase() };
				inMapBlock = true;
				continue;
			}

			if (inMapBlock) {
				if (line === "}") {
					if (currentMap) {
						uWadInfo[currentMap.id] = currentMap;
					}
					currentMap = { ...defaultWadUMapInfoMap };
					inMapBlock = false;
					continue;
				}

				const eqPos = line.indexOf("=");
				if (eqPos > 0) {
					currentKey = line.substring(0, eqPos).trim().toLowerCase();
					currentValue = line.substring(eqPos + 1).trim();

					if (currentValue.startsWith('"') && currentValue.endsWith('"')) {
						currentValue = currentValue.substring(1, currentValue.length - 1);
					}
					if (currentValue.startsWith('"') && currentValue.endsWith(",")) {
						currentValue = `${currentValue.substring(1, currentValue.length - 2).trim()}\n`;
					}

					this.processUmapInfoKeyValue(currentKey, currentValue, currentMap);
				} else if (currentKey !== "" && line.endsWith(",")) {
					currentValue += `${line.substring(1, line.length - 2).trim()}\n`;
				} else if (currentKey !== "" && !line.endsWith(",")) {
					currentValue += `${line.substring(1, line.length - 1).trim()}`;
					this.processUmapInfoKeyValue(currentKey, currentValue, currentMap);
				}
			}
		}

		return uWadInfo;
	}

	private processUmapInfoKeyValue(
		key: string,
		value: string,
		currentMap: WadUMapInfoMap,
	) {
		switch (key) {
			case "intertextsecret":
			case "intertext":
			case "label":
				currentMap[key] = value === "clear" ? null : value;
				break;
			case "partime":
				currentMap.partime = Number.parseInt(value, 10) || 0;
				break;
			case "author":
			case "skytexture":
			case "music":
			case "exitpic":
			case "enterpic":
			case "endpic":
			case "interbackdrop":
			case "intermusic":
			case "next":
			case "nextsecret":
			case "levelpic":
			case "levelname":
				currentMap[key] = value;
				break;
			case "nointermission":
			case "endbunny":
			case "endcast":
			case "endgame":
				currentMap[key] = value.toLowerCase() === "true";
				break;
			case "episode":
				if (value === "clear") {
					currentMap.episode = null;
				} else {
					const parts = value
						.split(",")
						.map((p) => p.trim().replace(/^"|"$/g, ""));
					if (parts.length === 3) {
						currentMap.episode = {
							patch: parts[0],
							name: parts[1],
							key: parts[2],
						};
					}
				}
				break;
			case "bossaction":
				if (value === "clear") {
					currentMap.bossaction = [];
				} else {
					const parts = value.split(",").map((p) => p.trim());
					if (parts.length === 3) {
						currentMap.bossaction.push({
							thing: parts[0],
							linespecial: Number.parseInt(parts[1], 10) || 0,
							tag: Number.parseInt(parts[2], 10) || 0,
						});
					}
				}
				break;
		}
	}

	private parseDMapInfo(data: string): WadDMapInfo {
		const dMapInfo: WadDMapInfo = { ...defaultWadDMapInfo };
		let currentMap: WadDMapInfoMap = { ...defaultWadDMapInfoMap };
		let currentEpisode: WadDMapInfoEpisode = { ...defaultWadDMapInfoEpisode };
		let currentEndSequence: WadDMapInfoEndSequence = {
			...defaultWadDMapInfoEndSequence,
		};

		const lines = data.split(/\r?\n/);
		let currentBlock: "map" | "episode" | "endsequence" | null = null;
		let currentKey = "";

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			if (line.startsWith("//") || line === "") {
				continue;
			}

			if (line.toLowerCase().startsWith("map ")) {
				const match = line.match(/map\s+"([^"]+)"\s+"([^"]+)"/);
				if (match) {
					currentMap = {
						...defaultWadDMapInfoMap,
						id: match[1].toUpperCase(),
						displayName: match[2],
					};
					currentBlock = "map";
				}
				continue;
			}
			if (line.startsWith("episode ")) {
				const match = line.match(/episode\s+"([^"]+)"/);
				if (match) {
					currentEpisode = { ...defaultWadDMapInfoEpisode, lump: match[1] };
					currentBlock = "episode";
				}
				continue;
			}
			if (line.startsWith("endsequence ")) {
				const match = line.match(/endsequence\s+"([^"]+)"/);
				if (match) {
					currentEndSequence = {
						...defaultWadDMapInfoEndSequence,
						id: match[1],
					};
					currentBlock = "endsequence";
				}
				continue;
			}

			if (line === "}") {
				if (currentBlock === "map") {
					dMapInfo.maps.push(currentMap);
				} else if (currentBlock === "episode") {
					dMapInfo.episodes.push(currentEpisode);
				} else if (currentBlock === "endsequence") {
					dMapInfo.endsequences.push(currentEndSequence);
				}
				currentBlock = null;
				currentMap = { ...defaultWadDMapInfoMap };
				currentEpisode = { ...defaultWadDMapInfoEpisode };
				currentEndSequence = { ...defaultWadDMapInfoEndSequence };
				continue;
			}

			if (currentBlock) {
				const eqPos = line.indexOf("=");
				if (eqPos > 0) {
					currentKey = line.substring(0, eqPos).trim().toLowerCase();
					const value = line.substring(eqPos + 1).trim();

					this.processDMapInfoKeyValue(
						currentBlock,
						currentKey,
						value,
						currentMap,
						currentEpisode,
						currentEndSequence,
					);
				} else if (
					currentBlock === "endsequence" &&
					line.startsWith('"') &&
					line.endsWith('"')
				) {
					if (currentEndSequence) {
						currentEndSequence.text.push(line.substring(1, line.length - 1));
					}
				} else if (line === "map07special") {
					if (currentMap) {
						currentMap.map07special = true;
					}
				}
			}
		}

		return dMapInfo;
	}

	private processDMapInfoKeyValue(
		blockType: "map" | "episode" | "endsequence",
		key: string,
		value: string,
		currentMap: WadDMapInfoMap,
		currentEpisode: WadDMapInfoEpisode,
		currentEndSequence: WadDMapInfoEndSequence,
	) {
		switch (blockType) {
			case "map":
				switch (key) {
					case "secretnext":
					case "next":
					case "music":
					case "endsequence":
						currentMap[key] = this.stripQuotes(value);
						break;
					case "par":
					case "episodenumber":
					case "mapnumber":
						currentMap[key] = Number.parseInt(value, 10) || 0;
						break;
					case "sky1": {
						const parts = value.split(",").map((p) => p.trim());
						currentMap.sky1 = {
							lump: this.stripQuotes(parts[0]),
							scrollSpeed:
								parts.length > 1 ? Number.parseInt(parts[1], 10) || 0 : 0,
						};
						break;
					}
				}
				break;

			case "episode":
				if (key === "name") {
					currentEpisode.name = this.stripQuotes(value);
				}
				break;

			case "endsequence":
				switch (key) {
					case "music":
					case "flat":
						currentEndSequence[key] = this.stripQuotes(value);
						break;
				}
				break;
		}
	}

	private stripQuotes(value: string): string {
		if (value.startsWith('"') && value.endsWith('"')) {
			return value.substring(1, value.length - 1);
		}
		return value;
	}

	private parseWadMapZMapInfo(input: string): WadMapZMapInfo {
		const result: WadMapZMapInfo = { ...defaultWadZMapInfo };

		const parseProperties = (
			block: string,
		): Record<string, string | boolean | number> => {
			const props: Record<string, string | boolean | number> = {};
			const lines = block
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line);

			for (const line of lines) {
				if (line.startsWith("//")) continue;

				const matchAssignment = line.match(/^([a-zA-Z0-9_]+)\s*=\s*(.*)$/);
				if (matchAssignment) {
					const key = matchAssignment[1];
					let value: string | number | boolean = matchAssignment[2].trim();

					if (!Number.isNaN(Number(value))) {
						value = Number(value);
					} else if (value === "true" || value === "1") {
						value = true;
					} else if (value === "false" || value === "0") {
						value = false;
					} else if (value.startsWith('"') && value.endsWith('"')) {
						value = value.slice(1, -1);
					}
					props[key] = value;
					continue;
				}
				const matchFlag = line.match(/^([a-zA-Z0-9_]+)$/);
				if (matchFlag) {
					props[matchFlag[1]] = true;
				}
			}

			return props;
		};

		const regex = /map\s+([^\s]+)\s+"([^"]+)"\s*\{([^}]+)\}/gs;
		const sections = [];
		let match: RegExpExecArray | null;

		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		while ((match = regex.exec(input)) !== null) {
			const id = match[1].trim();
			const name = match[2].trim();
			const data = match[3].trim();
			sections.push([id, name, data]);
		}

		for (const section of sections) {
			const id = section[0];
			const name = section[1];
			const dataBlock = section[2];
			const props = parseProperties(dataBlock);
			const map: Partial<WadMapZMapInfoMap> = {
				id: id.toUpperCase(),
				name,
			};

			const compatFlags: Record<string, boolean> = {};
			for (const key of Object.keys(props)) {
				if (key.startsWith("compat_")) {
					compatFlags[key] = props[key] as boolean;
				} else {
					// @ts-ignore
					map[key.toLowerCase()] = props[key];
				}
			}

			result.maps.push(map as WadMapZMapInfoMap);
		}

		return result;
	}
}
