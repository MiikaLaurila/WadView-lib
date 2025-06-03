import {
	type WadParserOptions,
	type WadDirectory,
	WadFileParser,
	type WadTextures,
	type WadDirectoryEntry,
	type WadPatch,
	type WadPatchPost,
	type WadTexture,
	type WadTexturePatch,
	texture1LumpName,
	texture2LumpName,
	pnamesLumpName,
} from "../interfaces/index.js";
import { utf8ArrayToStr } from "../utilities/index.js";

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

		const tex1Lump = this.dir.find((l) => l.lumpName === texture1LumpName);
		if (tex1Lump) textures.texture1 = this.parseTextureLump(tex1Lump);

		const tex2Lump = this.dir.find((l) => l.lumpName === texture2LumpName);
		if (tex2Lump) textures.texture2 = this.parseTextureLump(tex2Lump);

		const pNamesLump = this.dir.find((l) => l.lumpName === pnamesLumpName);
		if (pNamesLump) textures.patchNames = this.parsePnames(pNamesLump);

		for (const pname of textures.patchNames) {
			const patchLump = this.dir.find((l) => l.lumpName === pname);
			if (patchLump) {
				textures.patches[pname] = this.parsePatch(patchLump, pname);
			}
		}
		return textures;
	};

	private parsePatch = (
		patchLump: WadDirectoryEntry,
		name: string,
	): WadPatch => {
		const view = new Uint8Array(
			this.file.slice(
				patchLump.lumpLocation,
				patchLump.lumpLocation + patchLump.lumpSize,
			),
		);

		const width = new Uint16Array(view.buffer.slice(0, 2))[0];
		const height = new Uint16Array(view.buffer.slice(2, 4))[0];
		const xOffset = new Int16Array(view.buffer.slice(4, 6))[0];
		const yOffset = new Int16Array(view.buffer.slice(6, 8))[0];
		const columns: WadPatchPost[][] = [];

		const columnOffsets: number[] = [];
		for (let i = 0; i < width; i++) {
			const location = 8 + i * 4;
			columnOffsets.push(
				new Uint32Array(view.buffer.slice(location, location + 4))[0],
			);
		}

		columnOffsets.forEach((colOffset, idx) => {
			let endReached = false;
			let viewPos = 0;
			let watchDog = 100;
			let prevYOffset = -1;
			columns.push([]);
			while (!endReached && watchDog >= 0) {
				const readYOffset = new Uint8Array(
					view.buffer.slice(colOffset + viewPos, colOffset + viewPos + 1),
				)[0];

				if (readYOffset === 255) {
					columns[idx].push({
						yOffset: 0,
						data: [],
					});
					endReached = true;
				}

				let actualYOffset = readYOffset;
				if (actualYOffset <= prevYOffset) {
					actualYOffset = prevYOffset + readYOffset;
				}

				const len = new Uint8Array(
					view.buffer.slice(colOffset + viewPos + 1, colOffset + viewPos + 2),
				)[0];
				const data: number[] = Array.from(
					new Uint8Array(
						view.buffer.slice(
							colOffset + viewPos + 3,
							colOffset + viewPos + 3 + len,
						),
					),
				);
				const nextByte = new Uint8Array(
					view.buffer.slice(
						colOffset + viewPos + 3 + len + 1,
						colOffset + viewPos + 3 + len + 2,
					),
				)[0];

				if (nextByte === 0xff) {
					endReached = true;
				} else {
					viewPos = viewPos + 3 + len + 1;
				}
				columns[idx].push({
					yOffset: actualYOffset,
					data,
				});
				watchDog--;
				if (watchDog === 0) {
					console.error(patchLump, "triggered watchdog in texture parsing");
				}
				prevYOffset = actualYOffset;
			}
		});

		return {
			name,
			width,
			height,
			xOffset,
			yOffset,
			columns,
		};
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
