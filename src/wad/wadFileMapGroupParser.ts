import {
	LumpType,
	type WadDirectory,
	WadFileParser,
	type WadMapGroup,
	type WadParserOptions,
	isMapLump,
} from "../index.js";

interface WadMapGroupParserOptions extends WadParserOptions {
	directory: WadDirectory;
}

export class WadFileMapGroupParser extends WadFileParser {
	private directory: WadDirectory;
	constructor(opts: WadMapGroupParserOptions) {
		super(opts);
		this.directory = opts.directory;
	}

	public parseMapGroups = () => {
		const mapGroups: WadMapGroup[] = [];
		const mapMarkers = this.directory.filter((entry) => {
			return entry.type === LumpType.MAPMARKER;
		});
		const mapNames = mapMarkers.map((m) => m.lumpName);
		for (const mapName of mapNames) {
			mapGroups.push({
				name: mapName,
				lumps: this.directory
					.map((e) => {
						if (isMapLump(e.lumpName) && e.mapName === mapName) {
							return {
								...e,
								lumpName: e.lumpName,
							};
						}
						return undefined;
					})
					.filter((e) => e !== undefined),
			});
		}

		mapGroups.sort((a, b) => a.name.localeCompare(b.name));
		return mapGroups;
	};
}
