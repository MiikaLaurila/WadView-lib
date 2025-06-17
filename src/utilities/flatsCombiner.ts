import type { WadFlat } from "../interfaces/index.js";

export function combineWadFlats(flatsArrays: WadFlat[][]): WadFlat[] {
	const combinedFlats: (WadFlat | undefined)[] = [];
	const flatMap = new Map<string, WadFlat>();
	const appearanceOrder: string[] = [];

	for (const flats of flatsArrays) {
		for (const flat of flats) {
			if (!flatMap.has(flat.name)) {
				appearanceOrder.push(flat.name);
			}
			flatMap.set(flat.name, flat);
		}
	}

	for (const name of appearanceOrder) {
		combinedFlats.push(flatMap.get(name));
	}

	return combinedFlats.filter((f) => f !== undefined);
}
