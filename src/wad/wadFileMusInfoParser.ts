import {
	type WadDirectoryEntry,
	WadFileParser,
	type WadMusInfo,
	type WadParserOptions,
	utf8ArrayToStr,
} from "../index.js";

interface WadFileMusInfoParserOptions extends WadParserOptions {
	musInfoLump: WadDirectoryEntry;
}

export class WadFileMusInfoParser extends WadFileParser {
	private musInfoLump: WadDirectoryEntry;
	constructor(opts: WadFileMusInfoParserOptions) {
		super(opts);
		this.musInfoLump = opts.musInfoLump;
	}

	public parseMusInfo(): WadMusInfo {
		const view = new Uint8Array(
			this.file.slice(
				this.musInfoLump.lumpLocation,
				this.musInfoLump.lumpLocation + this.musInfoLump.lumpSize,
			),
		);
		const data = utf8ArrayToStr(view);
		const lines = data.split("\n");
		const mapToMusic: Record<string, { music: string[] }> = {};
		let currentMap: string | null = null;

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			if (!/^\d/.test(trimmed)) {
				currentMap = trimmed;
				mapToMusic[currentMap] = { music: [] };
			} else if (currentMap) {
				const musicName = trimmed.replace(/^\d+\s+/, "");
				mapToMusic[currentMap].music.push(musicName);
			}
		}

		const musicToMap: Record<string, string[]> = {};

		// Invert the mapping from mapToMusic to musicToMap
		for (const [mapName, { music }] of Object.entries(mapToMusic)) {
			for (const track of music) {
				if (!musicToMap[track]) {
					musicToMap[track] = [];
				}
				musicToMap[track].push(mapName);
			}
		}
		return {
			mapToMusic,
			musicToMap,
		};
	}
}
