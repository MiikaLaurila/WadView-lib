import {
	getWadMapInfoMusic,
	getWadMapInfoNames,
	LumpType,
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileMusInfoParser,
	WadFileParser,
	type WadMapInfo,
	type WadMusic,
	type WadMusInfo,
	type WadParserOptions,
} from "../index.js";
import { doomMusicToNameMap } from "../interfaces/wad/WadMusic.js";

interface WadFileMusicParserOptions extends WadParserOptions {
	dir: WadDirectory;
	mapInfo: WadMapInfo | null;
}

export class WadFileMusicParser extends WadFileParser {
	private dir: WadDirectory;
	private mapInfo: WadMapInfo | null;
	constructor(opts: WadFileMusicParserOptions) {
		super(opts);
		this.dir = opts.dir;
		this.mapInfo = opts.mapInfo;
	}

	public parseMusic = async (): Promise<[WadMusic[], WadMusInfo | null]> => {
		const musicLumps: WadDirectoryEntry[] = this.dir.filter(
			(d) => d.type === LumpType.MUSIC,
		);

		let musInfo: WadMusInfo | null = null;

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

		const musicMap = this.mapInfo
			? getWadMapInfoMusic(this.mapInfo)
			: new Map();
		const mapNameMap = this.mapInfo
			? getWadMapInfoNames(this.mapInfo)
			: new Map();

		for (const musicLump of musicLumps) {
			const data = new Uint8Array(
				this.file.slice(
					musicLump.lumpLocation,
					musicLump.lumpLocation + musicLump.lumpSize,
				),
			);
			let mapName = "";

			const musicMapId = musicMap.get(musicLump.lumpName);
			if (musicMapId) {
				mapName = mapNameMap.get(musicMapId) ?? mapName;
			}

			if (
				!mapName &&
				musInfo?.musicToMap[musicLump.lumpName] &&
				musInfo.musicToMap[musicLump.lumpName].length > 0
			) {
				if (mapNameMap) {
					mapName = mapNameMap.get(musInfo.musicToMap[musicLump.lumpName][0]);
				}
			}

			if (!mapName) mapName = doomMusicToNameMap[musicLump.lumpName];

			musics.push({
				name: musicLump.lumpName,
				data,
				type: musicLump.musicType ?? { ext: "UNKNOWN", mime: "UNKNOWN" },
				inMap: mapName ? mapName : musicLump.lumpName,
			});
		}

		musics.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});

		return [musics, musInfo];
	};
}
