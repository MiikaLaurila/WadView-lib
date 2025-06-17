import type { WadMenuGraphic, WadStbarGraphic } from "../interfaces/index.js";

export function combineWadMenuStbarGraphics(
	graphicsArrays: (WadMenuGraphic | WadStbarGraphic)[][],
): (WadMenuGraphic | WadStbarGraphic)[] {
	const combinedGraphics: (WadMenuGraphic | undefined)[] = [];
	const graphicMap = new Map<string, WadMenuGraphic | WadStbarGraphic>();
	const appearanceOrder: string[] = [];

	for (const graphics of graphicsArrays) {
		for (const graphic of graphics) {
			if (!graphicMap.has(graphic.name)) {
				appearanceOrder.push(graphic.name);
			}

			graphicMap.set(graphic.name, graphic);
		}
	}

	for (const name of appearanceOrder) {
		combinedGraphics.push(graphicMap.get(name));
	}

	return combinedGraphics.filter((g) => g !== undefined);
}
