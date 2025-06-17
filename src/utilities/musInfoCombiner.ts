import type { WadMusInfo } from "../interfaces/index.js";

export function combineWadMusInfos(musInfos: WadMusInfo[]): WadMusInfo {
	const combinedMapToMusic: Record<string, { music: string[] }> = {};
	const combinedMusicToMap: Record<string, string[]> = {};

	const addUnique = <T>(arr: T[], ...items: T[]) => {
		for (const item of items) {
			if (!arr.includes(item)) {
				arr.push(item);
			}
		}
	};

	for (const musInfo of musInfos) {
		for (const [mapName, mapData] of Object.entries(musInfo.mapToMusic)) {
			if (!combinedMapToMusic[mapName]) {
				combinedMapToMusic[mapName] = { music: [] };
			}
			addUnique(combinedMapToMusic[mapName].music, ...mapData.music);
		}

		for (const [musicName, mapNames] of Object.entries(musInfo.musicToMap)) {
			if (!combinedMusicToMap[musicName]) {
				combinedMusicToMap[musicName] = [];
			}
			addUnique(combinedMusicToMap[musicName], ...mapNames);
		}
	}

	for (const [mapName, mapData] of Object.entries(combinedMapToMusic)) {
		for (const musicName of mapData.music) {
			if (!combinedMusicToMap[musicName]) {
				combinedMusicToMap[musicName] = [];
			}
			addUnique(combinedMusicToMap[musicName], mapName);
		}
	}

	for (const [musicName, mapNames] of Object.entries(combinedMusicToMap)) {
		for (const mapName of mapNames) {
			if (!combinedMapToMusic[mapName]) {
				combinedMapToMusic[mapName] = { music: [] };
			}
			addUnique(combinedMapToMusic[mapName].music, musicName);
		}
	}

	return {
		mapToMusic: combinedMapToMusic,
		musicToMap: combinedMusicToMap,
	};
}
