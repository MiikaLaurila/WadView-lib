import { fileTypeFromBuffer } from "file-type";
import {
	WadDetectedType,
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileParser,
	type WadMusic,
	type WadParserOptions,
} from "../index.js";

interface WadFileMusicParserOptions extends WadParserOptions {
	dir: WadDirectory;
	detectedType: WadDetectedType;
}

export class WadFileMusicParser extends WadFileParser {
	private dir: WadDirectory;
	private detectedType: WadDetectedType;
	constructor(opts: WadFileMusicParserOptions) {
		super(opts);
		this.dir = opts.dir;
		this.detectedType = opts.detectedType;
	}

	public parseMusic = async (): Promise<WadMusic[]> => {
		const musicLumps: WadDirectoryEntry[] = [];
		if (this.detectedType !== WadDetectedType.DOOM) {
			return [];
		}
		const prefixes = ["D_", "H_", "O_"];
		const blacklist = [""];

		for (const lump of this.dir) {
			for (const prefix of prefixes) {
				if (
					lump.lumpName.startsWith(prefix) &&
					!blacklist.includes(lump.lumpName)
				) {
					musicLumps.push(lump);
				}
			}
		}

		const musics: WadMusic[] = [];

		for (const musicLump of musicLumps) {
			const data = new Uint8Array(
				this.file.slice(
					musicLump.lumpLocation,
					musicLump.lumpLocation + musicLump.lumpSize,
				),
			);
			let type = await fileTypeFromBuffer(data);
			if (!type) {
				const slice = data.slice(0, 3);
				if (slice[0] === 77 && slice[1] === 85 && slice[2] === 83) {
					type = { ext: "mus", mime: "audio/mus" };
				}
			}
			musics.push({
				name: musicLump.lumpName,
				data,
				type: type ?? { ext: "UNKNOWN", mime: "UNKNOWN" },
			});
		}

		musics.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});

		return musics;
	};
}
