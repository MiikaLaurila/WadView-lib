import {
	LumpType,
	type WadDehacked,
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileMusInfoParser,
	WadFileParser,
	type WadMapInfo,
	type WadMusInfo,
	type WadMusic,
	type WadParserOptions,
	dehackedLevelTextToMusicId,
	doomMapIdToMusic,
	doomMusicToNameMap,
	getWadMapInfoMusic,
	getWadMapInfoNames,
	globalMapNameMatcher,
	huStrToMap,
} from "../index.js";

interface WadFileMusicParserOptions extends WadParserOptions {
	dir: WadDirectory;
	mapInfo?: WadMapInfo;
	dehacked?: WadDehacked;
}

export class WadFileMusicParser extends WadFileParser {
	private dir: WadDirectory;
	private mapInfo?: WadMapInfo;
	private dehacked?: WadDehacked;
	constructor(opts: WadFileMusicParserOptions) {
		super(opts);
		this.dir = opts.dir;
		this.mapInfo = opts.mapInfo;
		this.dehacked = opts.dehacked;
	}

	public parseMusic = async (): Promise<
		[WadMusic[], WadMusInfo | undefined]
	> => {
		const musicLumps: WadDirectoryEntry[] = this.dir.filter(
			(d) => d.type === LumpType.MUSIC,
		);

		let musInfo: WadMusInfo | undefined = undefined;

		const musInfoLump = this.dir.find((d) => d.type === LumpType.MUSINFO);

		if (musInfoLump) {
			const musInfoParser = new WadFileMusInfoParser({
				file: this.file,
				sendEvent: this.sendEvent,
				musInfoLump,
			});
			musInfo = musInfoParser.parseMusInfo();
		}

		const musics: WadMusic[] = [];

		for (const musicLump of musicLumps) {
			const data = new Uint8Array(
				this.file.slice(
					musicLump.lumpLocation,
					musicLump.lumpLocation + musicLump.lumpSize,
				),
			);

			const mapName = this.deduceMapName(musicLump, musInfo);

			musics.push({
				name: musicLump.lumpName,
				data,
				type: musicLump.musicType ?? { ext: "UNKNOWN", mime: "UNKNOWN" },
				inMap: mapName ? mapName : musicLump.lumpName,
			});
		}

		musics.sort((a, b) => a.inMap.localeCompare(b.inMap));

		return [musics, musInfo];
	};

	private deduceMapName(
		musicLump: WadDirectoryEntry,
		musInfo?: WadMusInfo,
	): string {
		const musicMap = this.mapInfo
			? getWadMapInfoMusic(this.mapInfo)
			: new Map();
		const mapNameMap = this.mapInfo
			? getWadMapInfoNames(this.mapInfo)
			: new Map();

		let mapName = "";

		// Check mapinfo for map name
		const musicMapId = musicMap.get(musicLump.lumpName);
		if (musicMapId) {
			const foundName = mapNameMap.get(musicMapId);
			if (foundName) {
				if (foundName.match(globalMapNameMatcher)) {
					mapName = `${foundName}`;
				} else {
					mapName = `${musicMapId}: ${foundName}`;
				}
			}
		}

		// check musinfo for a doom map id where music appears
		if (
			!mapName &&
			musInfo?.musicToMap[musicLump.lumpName] &&
			musInfo.musicToMap[musicLump.lumpName].length > 0
		) {
			if (mapNameMap) {
				const mapId = musInfo.musicToMap[musicLump.lumpName][0];
				const foundName = mapNameMap.get(mapId);
				if (foundName) {
					if (foundName.match(globalMapNameMatcher)) {
						mapName = `${foundName}`;
					} else {
						mapName = `${mapId}: ${foundName}`;
					}
				}
			}
		}

		// check [STRINGS] from dehacked
		if (!mapName && this.dehacked?.parsed.bexStrings) {
			for (const str of this.dehacked.parsed.bexStrings) {
				const mapId = huStrToMap[str.key];
				if (mapId) {
					const musicLumpName = doomMapIdToMusic[mapId];
					if (musicLumpName === musicLump.lumpName) {
						const nameStr = str.value.toString();
						if (nameStr.match(globalMapNameMatcher)) {
							mapName = `${nameStr}`;
						} else {
							mapName = `${mapId}: ${nameStr}`;
						}
						break;
					}
				}
			}
		}

		// check old style text replacements from dehacked
		if (!mapName && this.dehacked?.parsed.texts) {
			const keys = Object.keys(dehackedLevelTextToMusicId);
			for (const dehText of this.dehacked.parsed.texts) {
				if (
					keys.includes(dehText.from) &&
					dehackedLevelTextToMusicId[dehText.from] === musicLump.lumpName
				) {
					mapName = dehText.to;
					break;
				}
			}
		}

		if (!mapName) mapName = doomMusicToNameMap[musicLump.lumpName];
		return mapName;
	}
}
