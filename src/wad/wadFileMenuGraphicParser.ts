import {
	WadDetectedType,
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileParser,
	WadFilePatchParser,
	type WadMenuGraphic,
	type WadParserOptions,
	flatEndLumpMatcher,
	flatStartLumpMatcher,
	patchEndLumpMatcher,
	patchStartLumpMatcher,
	spriteEndLumpMatcher,
	spriteStartLumpMatcher,
} from "../index.js";

interface WadFileMenuGraphicParserOptions extends WadParserOptions {
	dir: WadDirectory;
	detectedType: WadDetectedType;
}

export class WadFileMenuGraphicParser extends WadFileParser {
	private dir: WadDirectory;
	private detectedType: WadDetectedType;
	constructor(opts: WadFileMenuGraphicParserOptions) {
		super(opts);
		this.dir = opts.dir;
		this.detectedType = opts.detectedType;
	}

	public parseMenuGraphics = (): WadMenuGraphic[] => {
		if (this.detectedType !== WadDetectedType.DOOM) {
			return [];
		}
		const spriteRanges: { start: number; end: number }[] = [];
		const patchRanges: { start: number; end: number }[] = [];
		const flatRanges: { start: number; end: number }[] = [];

		for (let i = 0; i < this.dir.length; i++) {
			const lump = this.dir[i];

			if (lump.lumpName.match(spriteStartLumpMatcher)) {
				const end = this.dir.find(
					(e, j) => j > i && e.lumpName.match(spriteEndLumpMatcher),
				);
				if (end) {
					spriteRanges.push({
						start: lump.lumpIdx,
						end: end.lumpIdx,
					});
				}
			}

			if (lump.lumpName.match(patchStartLumpMatcher)) {
				const end = this.dir.find(
					(e, j) => j > i && e.lumpName.match(patchEndLumpMatcher),
				);
				if (end) {
					patchRanges.push({ start: lump.lumpIdx, end: end.lumpIdx });
				}
			}

			if (lump.lumpName.match(flatStartLumpMatcher)) {
				const end = this.dir.find(
					(e, j) => j > i && e.lumpName.match(flatEndLumpMatcher),
				);
				if (end) {
					flatRanges.push({ start: lump.lumpIdx, end: end.lumpIdx });
				}
			}
		}

		const isBetweenMarkers = (lump: WadDirectoryEntry) => {
			const loc = lump.lumpIdx;
			for (const range of spriteRanges) {
				if (loc > range.start && loc < range.end) return true;
			}
			for (const range of patchRanges) {
				if (loc > range.start && loc < range.end) return true;
			}
			for (const range of flatRanges) {
				if (loc > range.start && loc < range.end) return true;
			}
			return false;
		};

		const menuGraphicLumps: WadDirectoryEntry[] = [];
		const prefixes = [
			"HELP1",
			"HELP2",
			"CREDIT",
			"TITLEPIC",
			"AMMNUM",
			"ST",
			"M_",
			"BRDR",
			"WI",
		];

		const blacklist = ["CREDITS"];

		for (const lump of this.dir) {
			if (isBetweenMarkers(lump)) continue; // Skip if inside a sprite/patch/flat block

			for (const prefix of prefixes) {
				if (
					lump.lumpName.startsWith(prefix) &&
					!blacklist.includes(lump.lumpName)
				) {
					menuGraphicLumps.push(lump);
					break; // No need to check other prefixes
				}
			}
		}

		const patchParser = new WadFilePatchParser({
			file: this.file,
			sendEvent: this.sendEvent,
		});
		const menuGraphics: WadMenuGraphic[] = [];

		for (const menuGraphicLump of menuGraphicLumps) {
			const patch = patchParser.parsePatch(menuGraphicLump);
			if (!patch) {
				console.log(
					"Could not parse menu graphic for",
					menuGraphicLump.lumpName,
				);
				continue;
			}
			menuGraphics.push({ name: menuGraphicLump.lumpName, data: patch });
		}

		menuGraphics.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});

		return menuGraphics;
	};
}
