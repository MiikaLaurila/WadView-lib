import {
	LumpType,
	type WadDetectedType,
	type WadDirectory,
	WadFileParser,
	WadFilePatchParser,
	type WadMenuGraphic,
	type WadParserOptions,
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
		const patchParser = new WadFilePatchParser({
			file: this.file,
			sendEvent: this.sendEvent,
		});
		const menuGraphics: WadMenuGraphic[] = [];
		const menuGraphicLumps = this.dir.filter(
			(d) => d.type === LumpType.MENU_PATCH,
		);

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
