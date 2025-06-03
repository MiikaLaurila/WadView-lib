import {
	type WadParserOptions,
	WadFileParser,
	type WadDirectoryEntry,
	type WadPatch,
	type WadPatchPost,
} from "../interfaces/index.js";

interface WadFilePatchParserOptions extends WadParserOptions {
	patchLumps: WadDirectoryEntry[];
}

export class WadFilePatchParser extends WadFileParser {
	patchLumps: WadDirectoryEntry[];
	constructor(opts: WadFilePatchParserOptions) {
		super(opts);
		this.patchLumps = opts.patchLumps;
	}

	public parsePatches = (): WadPatch[] => {
		const patches: WadPatch[] = [];
		for (const patchLump of this.patchLumps) {
			patches.push(this.parsePatch(patchLump));
		}
		return patches;
	};

	private parsePatch = (patchLump: WadDirectoryEntry): WadPatch => {
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
					endReached = true;
				}
				prevYOffset = actualYOffset;
			}
		});

		return {
			name: patchLump.lumpName,
			width,
			height,
			xOffset,
			yOffset,
			columns,
		};
	};
}
