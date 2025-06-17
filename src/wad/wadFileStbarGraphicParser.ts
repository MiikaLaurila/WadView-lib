import {
	LumpType,
	type WadDirectory,
	WadFileParser,
	WadFilePatchParser,
	type WadParserOptions,
	type WadStbarGraphic,
} from "../index.js";

interface WadFileStbarGraphicParserOptions extends WadParserOptions {
	dir: WadDirectory;
}

export class WadFileStbarGraphicParser extends WadFileParser {
	private dir: WadDirectory;
	constructor(opts: WadFileStbarGraphicParserOptions) {
		super(opts);
		this.dir = opts.dir;
	}

	public parseStbarGraphics = (): WadStbarGraphic[] => {
		const patchParser = new WadFilePatchParser({
			file: this.file,
			sendEvent: this.sendEvent,
		});
		const stbarGraphics: WadStbarGraphic[] = [];
		const stbarGraphicLumps = this.dir.filter(
			(d) => d.type === LumpType.STBAR_PATCH,
		);

		for (const stbarGraphicLump of stbarGraphicLumps) {
			const patch = patchParser.parsePatch(stbarGraphicLump);
			if (!patch) {
				console.log(
					"Could not parse stbar graphic for",
					stbarGraphicLump.lumpName,
				);
				continue;
			}
			stbarGraphics.push({ name: stbarGraphicLump.lumpName, data: patch });
		}

		stbarGraphics.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});

		return stbarGraphics;
	};
}
