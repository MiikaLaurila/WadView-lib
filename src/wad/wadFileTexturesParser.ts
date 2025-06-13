import {
	LumpType,
	type WadDirectory,
	type WadDirectoryEntry,
	WadFileParser,
	WadFilePatchParser,
	type WadParserOptions,
	type WadTexture,
	type WadTexturePatch,
	type WadTextures,
	patchEndLumpMatcher,
	patchStartLumpMatcher,
	pnamesLumpName,
	texture1LumpName,
	texture2LumpName,
	utf8ArrayToStr,
} from "../index.js";

interface WadFileTexturesParserOptions extends WadParserOptions {
	dir: WadDirectory;
}

export class WadFileTexturesParser extends WadFileParser {
	dir: WadDirectory;
	constructor(opts: WadFileTexturesParserOptions) {
		super(opts);
		this.dir = opts.dir;
	}

	public parseTextures = (): WadTextures => {
		const textures: WadTextures = {
			texture1: [],
			texture2: [],
			patchNames: [],
			patches: {},
		};

		const tex1Lump = this.dir.find((l) => l.type === LumpType.TEXTURES1);
		if (tex1Lump) textures.texture1 = this.parseTextureLump(tex1Lump);

		const tex2Lump = this.dir.find((l) => l.type === LumpType.TEXTURES2);
		if (tex2Lump) textures.texture2 = this.parseTextureLump(tex2Lump);

		const pNamesLump = this.dir.find((l) => l.type === LumpType.PNAMES);
		if (pNamesLump) textures.patchNames = this.parsePnames(pNamesLump);

		const patchLumps: WadDirectoryEntry[] = [];
		for (const pname of textures.patchNames) {
			const patchLump = this.dir.find(
				(l) => l.lumpName === pname && l.type === LumpType.PATCH,
			);
			if (patchLump) {
				patchLumps.push(patchLump);
			}
		}

		const patchParser = new WadFilePatchParser({
			patchLumps,
			file: this.file,
			sendEvent: this.sendEvent,
		});

		for (const patch of patchParser.parsePatches()) {
			textures.patches[patch.name] = patch;
		}

		return textures;
	};

	private parseTextureLump = (textureLump: WadDirectoryEntry): WadTexture[] => {
		const textures: WadTexture[] = [];
		const baseTextureEntryLength = 22;
		const patchEntryLength = 10;

		const view = new Uint8Array(
			this.file.slice(
				textureLump.lumpLocation,
				textureLump.lumpLocation + textureLump.lumpSize,
			),
		);

		const textureCount = new Int32Array(view.buffer.slice(0, 4))[0];

		const textureOffsets: number[] = [];
		for (let i = 0; i < textureCount; i++) {
			const location = 4 + i * 4;
			textureOffsets.push(
				new Int32Array(view.buffer.slice(location, location + 4))[0],
			);
		}

		for (const offset of textureOffsets) {
			const name = utf8ArrayToStr(view.subarray(offset, offset + 8));
			const masked = Boolean(
				new Int32Array(view.buffer.slice(offset + 8, offset + 12))[0],
			);
			const width = new Int16Array(
				view.buffer.slice(offset + 12, offset + 14),
			)[0];
			const height = new Int16Array(
				view.buffer.slice(offset + 14, offset + 16),
			)[0];
			const colDir = new Int32Array(
				view.buffer.slice(offset + 16, offset + 20),
			)[0];
			const patchCount = new Int16Array(
				view.buffer.slice(offset + 20, offset + 22),
			)[0];
			const patches: WadTexturePatch[] = [];

			for (let i = 0; i < patchCount; i++) {
				const location = offset + baseTextureEntryLength + i * patchEntryLength;

				const xOffset = new Int16Array(
					view.buffer.slice(location, location + 2),
				)[0];
				const yOffset = new Int16Array(
					view.buffer.slice(location + 2, location + 4),
				)[0];
				const patchNum = new Int16Array(
					view.buffer.slice(location + 4, location + 6),
				)[0];
				const stepDir = new Int16Array(
					view.buffer.slice(location + 6, location + 8),
				)[0];
				const colormap = new Int16Array(
					view.buffer.slice(location + 8, location + 10),
				)[0];

				patches.push({
					xOffset,
					yOffset,
					patchNum,
					stepDir,
					colormap,
				});
			}

			textures.push({
				name,
				masked,
				width,
				height,
				colDir,
				patchCount,
				patches,
			});
		}

		return textures;
	};

	private parsePnames = (pNamesLump: WadDirectoryEntry): string[] => {
		const pNames: string[] = [];
		const pNameEntryLength = 8;
		const view = new Uint8Array(
			this.file.slice(
				pNamesLump.lumpLocation,
				pNamesLump.lumpLocation + pNamesLump.lumpSize,
			),
		);

		const pnameCount = new Int32Array(view.buffer.slice(0, 4))[0];

		for (let i = 0; i < pnameCount; i++) {
			const viewStart = i * pNameEntryLength;
			const pName = utf8ArrayToStr(
				view.subarray(viewStart + 4, viewStart + 4 + 8),
			).toUpperCase();
			pNames.push(pName);
		}
		return pNames.filter((p) => p);
	};
}
