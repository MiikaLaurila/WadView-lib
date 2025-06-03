import { dehackedLumpName } from "../interfaces/constants.js";
import {
	WadFileParser,
	type WadDehacked,
	defaultWadDehacked,
	type WadDehackedThing,
	type WadThing,
	WadMapThingGroup,
	WadDehackedToThingType,
} from "../interfaces/index.js";

export class WadFileDehackedParser extends WadFileParser {
	public parseDehacked = (): WadDehacked | null => {
		if (this.lumps.length === 0 || this.lumps[0].lumpName !== dehackedLumpName)
			return null;

		const dehackedCharSize = 1;
		const charCount = this.lumps[0].lumpSize / dehackedCharSize;
		const view = new Uint8Array(
			this.file.slice(
				this.lumps[0].lumpLocation,
				this.lumps[0].lumpLocation + this.lumps[0].lumpSize,
			),
		);

		const dehacked: WadDehacked = JSON.parse(
			JSON.stringify(defaultWadDehacked),
		);

		for (let i = 0; i < charCount; i++) {
			const viewStart = i * dehackedCharSize;
			dehacked.dehackedString += String.fromCharCode(view[viewStart]);
		}

		let lineBuffer: string[] = [];

		for (const lineRaw of dehacked.dehackedString.split("\n")) {
			const line = lineRaw.trim();
			if (line.toLowerCase().includes("thing ")) {
				lineBuffer.push(line);
			} else if (lineBuffer.length > 0 && line !== "") {
				lineBuffer.push(line);
			} else if (lineBuffer.length > 0 && line === "") {
				const dehackedThing = this.parseThingLine(lineBuffer);
				if (dehackedThing) dehacked.things.push(dehackedThing);
				lineBuffer = [];
			}
		}
		return dehacked;
	};

	//Mega cringe, will improve once I'll find some specs or just read dsda source lol
	private parseThingLine = (thingBlock: string[]): WadDehackedThing | null => {
		let dehackedThingType: WadThing | null = null;
		let dehackedThingName: string | null = null;
		let dehackedThingGroup: WadMapThingGroup | null = null;
		thingBlock.forEach((line, idx) => {
			if (idx === 0) {
				const parts = line.split(" ");
				if (parts[1])
					dehackedThingType = WadDehackedToThingType[Number(parts[1])];
				if (parts.length > 2) {
					parts.shift();
					parts.shift();
					dehackedThingName = parts.join(" ").replace("(", "").replace(")", "");
				}
			}
		});

		const bits = thingBlock.find((line) =>
			line.toLowerCase().includes("bits = "),
		);
		const hitPoints = thingBlock.find((line) =>
			line.toLowerCase().includes("hit points = "),
		);
		if (bits?.toLowerCase().includes("countkill") || hitPoints) {
			dehackedThingGroup = WadMapThingGroup.MONSTER;
		} else {
			dehackedThingGroup = WadMapThingGroup.UNKNOWN;
		}

		if (dehackedThingType && dehackedThingName && dehackedThingGroup) {
			return {
				from: dehackedThingType,
				to: { name: dehackedThingName, group: dehackedThingGroup },
			};
		}
		return null;
	};
}
