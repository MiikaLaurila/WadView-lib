import type { WadMusic } from "../interfaces/index.js";

export function combineWadMusic(musicArrays: WadMusic[][]): WadMusic[] {
	const combinedMusic: (WadMusic | undefined)[] = [];
	const musicMap = new Map<string, WadMusic>();
	const appearanceOrder: string[] = [];

	for (const musicList of musicArrays) {
		for (const music of musicList) {
			if (!musicMap.has(music.name)) {
				appearanceOrder.push(music.name);
			}
			musicMap.set(music.name, music);
		}
	}

	for (const name of appearanceOrder) {
		combinedMusic.push(musicMap.get(name));
	}

	return combinedMusic.filter((m) => m !== undefined);
}
