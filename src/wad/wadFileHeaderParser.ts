import {
	WadFileEvent,
	WadFileParser,
	type WadHeader,
	WadType,
	utf8ArrayToStr,
} from "../index.js";

export class WadFileHeaderParser extends WadFileParser {
	public parseHeader = () => {
		const view = new Uint8Array(this.file, 0, 12);
		const type: WadType = utf8ArrayToStr(view.subarray(0, 4)) as WadType;
		if (type !== WadType.IWAD && type !== WadType.PWAD) {
			void this.sendEvent(
				WadFileEvent.NOT_WAD,
				`This is not a wad file! ${type}`,
			);
			return undefined;
		}
		const directoryEntryCount: number = new Int32Array(
			view.buffer.slice(4, 8),
		)[0];
		const directoryLocation: number = new Int32Array(
			view.buffer.slice(8, 12),
		)[0];
		const header: WadHeader = {
			type,
			directoryEntryCount,
			directoryLocation,
		};
		return header;
	};
}
