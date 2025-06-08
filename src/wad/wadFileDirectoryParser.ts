import {
	type WadDirectory,
	WadFileParser,
	type WadHeader,
	type WadParserOptions,
	utf8ArrayToStr,
} from "../index.js";

interface WadDirectoryParserOptions extends WadParserOptions {
	header: WadHeader;
}

export class WadFileDirectoryParser extends WadFileParser {
	private header: WadHeader;
	constructor(opts: WadDirectoryParserOptions) {
		super(opts);
		this.header = opts.header;
	}

	public parseDirectory = () => {
		const directoryEntryLength = 16;
		const directory: WadDirectory = [];
		const view = new Uint8Array(
			this.file.slice(
				this.header.directoryLocation,
				this.header.directoryLocation +
					this.header.directoryEntryCount * directoryEntryLength,
			),
		);
		for (let i = 0; i < this.header.directoryEntryCount; i++) {
			const viewStart = i * directoryEntryLength;
			const lumpLocation = new Int32Array(
				view.buffer.slice(viewStart, viewStart + 4),
			)[0];
			const lumpSize = new Int32Array(
				view.buffer.slice(viewStart + 4, viewStart + 8),
			)[0];
			const lumpName = utf8ArrayToStr(
				view.subarray(viewStart + 8, viewStart + 16),
			).toUpperCase();
			directory.push({ lumpLocation, lumpSize, lumpName, lumpIdx: i });
		}
		return directory;
	};
}
