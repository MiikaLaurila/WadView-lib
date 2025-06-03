import {
	type WadParserOptions,
	type WadDirectory,
	WadFileParser,
	type WadDirectoryEntry,
	type WadFlat,
	flatStartLumpMatcher,
	flatEndLumpMatcher,
} from "../interfaces/index.js";

interface WadFileFlatsParserOptions extends WadParserOptions {
	dir: WadDirectory;
}

export class WadFileFlatsParser extends WadFileParser {
	dir: WadDirectory;
	constructor(opts: WadFileFlatsParserOptions) {
		super(opts);
		this.dir = opts.dir;
	}

	public parseFlats = (): WadFlat[] => {
		const flatLumps: WadDirectoryEntry[] = [];

		let currentStart: WadDirectoryEntry | null = null;
		for (const entry of this.dir) {
			if (entry.lumpName.match(flatStartLumpMatcher)) {
				currentStart = entry;
				continue;
			}
			if (!entry.lumpName.match(flatEndLumpMatcher) && currentStart) {
				flatLumps.push(entry);
			}
			if (entry.lumpName.match(flatEndLumpMatcher) && currentStart) {
				currentStart = null;
			}
		}

		const flats: WadFlat[] = [];
		for (const flatLump of flatLumps) {
			const newFlat: WadFlat = {
				name: flatLump.lumpName,
				pixels: Array.from(
					new Uint8Array(
						this.file.slice(
							flatLump.lumpLocation,
							flatLump.lumpLocation + flatLump.lumpSize,
						),
					),
				),
				height: Math.floor(flatLump.lumpSize / 64),
				width: 64,
			};

			flats.push(newFlat);
		}

		return flats;
	};
}
