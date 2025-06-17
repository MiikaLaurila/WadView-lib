import {
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileParser,
	WadFilePatchParser,
	type WadParserOptions,
	type WadSprite,
	spriteEndLumpMatcher,
	spriteFrameMatcher,
	spriteMirroredFrameMatcher,
	spriteStartLumpMatcher,
} from "../index.js";

interface WadFileSpritesParserOptions extends WadParserOptions {
	dir: WadDirectory;
}

export class WadFileSpritesParser extends WadFileParser {
	dir: WadDirectory;
	constructor(opts: WadFileSpritesParserOptions) {
		super(opts);
		this.dir = opts.dir;
	}

	public parseSprites = (): WadSprite[] => {
		const spriteLumps: WadDirectoryEntry[] = [];

		let currentStart: WadDirectoryEntry | null = null;
		for (const entry of this.dir) {
			if (entry.lumpName.match(spriteStartLumpMatcher)) {
				currentStart = entry;
				continue;
			}
			if (!entry.lumpName.match(spriteEndLumpMatcher) && currentStart) {
				spriteLumps.push(entry);
			}
			if (entry.lumpName.match(spriteEndLumpMatcher) && currentStart) {
				currentStart = null;
			}
		}

		const patchParser = new WadFilePatchParser({
			file: this.file,
			sendEvent: this.sendEvent,
		});
		const sprites: WadSprite[] = [];

		for (const spriteLump of spriteLumps) {
			const normalMatches = spriteLump.lumpName.match(spriteFrameMatcher);
			const mirroredMatches = spriteLump.lumpName.match(
				spriteMirroredFrameMatcher,
			);

			if (
				(!normalMatches || normalMatches.length !== 4) &&
				(!mirroredMatches || mirroredMatches.length !== 5)
			) {
				console.log(
					"Could not match sprite format from sprite lump:",
					spriteLump,
				);
				continue;
			}

			let name: string | null = null;
			let animation: string | null = null;
			let frame1: string | null = null;
			let frame2: string | null = null;

			if (normalMatches) {
				name = normalMatches[1];
				animation = normalMatches[2];
				frame1 = normalMatches[3];
			}
			if (!normalMatches && mirroredMatches) {
				name = mirroredMatches[1];
				animation = mirroredMatches[2];
				frame1 = mirroredMatches[3];
				frame2 = mirroredMatches[4];
			}

			if (name === null || animation === null || frame1 === null) {
				console.log(
					"Could not parse matches from lump name | NormalMatcher: ",
					normalMatches,
					" | MirroredMatcher:",
					mirroredMatches,
				);
				continue;
			}

			const frameData = patchParser.parsePatch(spriteLump);
			if (!frameData) {
				console.log("Could not parse sprite fame for", spriteLump.lumpName);
				continue;
			}

			const frames = [{ idx: frame1, data: frameData, mirrored: false }];
			if (frame2) frames.push({ idx: frame2, data: frameData, mirrored: true });

			const existingSprite = sprites.find(
				(sprite) => sprite.name === name && sprite.animation === animation,
			);

			if (!existingSprite) {
				sprites.push({
					name,
					animation,
					frames,
				});
			} else {
				existingSprite.frames.push(...frames);
			}
		}

		sprites.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			if (a.animation < b.animation) return -1;
			if (a.animation > b.animation) return 1;
			return 0;
		});

		for (const sprite of sprites) {
			sprite.frames.sort((a, b) => {
				if (a.idx < b.idx) return -1;
				if (a.idx > b.idx) return 1;
				return 0;
			});
		}

		return sprites;
	};
}
