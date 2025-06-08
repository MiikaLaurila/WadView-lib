import {
	type MapGroupDirectory,
	type WadDirectory,
	WadFileParser,
	type WadMapGroupList,
	type WadParserOptions,
	isMapGroupDirectoryEntry,
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
		let currentGroup: MapGroupDirectory = [];
		let currentMapName: string | null = null;
		let mapGroups: WadMapGroupList = [];

		this.directory.forEach((entry, idx, arr) => {
			const isValid = isMapGroupDirectoryEntry(entry);
			if (isValid && !currentMapName) {
				currentMapName = arr[idx - 1].lumpName;
				currentGroup.push(entry);
			} else if (isValid && currentMapName) {
				currentGroup.push(entry);
			} else if ((!isValid || idx === arr.length - 1) && currentMapName) {
				mapGroups.push({ name: currentMapName, lumps: currentGroup });
				currentMapName = null;
				currentGroup = [];
			}
		});

		if (currentMapName) {
			mapGroups.push({ name: currentMapName, lumps: currentGroup });
		}

		mapGroups = mapGroups.sort((a, b) => a.name.localeCompare(b.name));
		return mapGroups;
	};
}
