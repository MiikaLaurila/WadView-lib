import {
	LumpType,
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileParser,
	type WadFlat,
	type WadParserOptions,
	flatEndLumpMatcher,
	flatStartLumpMatcher,
} from "../index.js";

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
		const flatLumps: WadDirectoryEntry[] = this.dir.filter(
			(d) => d.type === LumpType.FLAT,
		);

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
