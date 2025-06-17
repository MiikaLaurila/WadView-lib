import {
	type WadMapInfo,
	WadMapInfoType,
	type WadUMapInfo,
} from "../interfaces/index.js";

export function combineWadMapInfos(mapInfos: WadMapInfo[]): WadMapInfo {
	const combined: Required<WadMapInfo> = {
		type: WadMapInfoType.UNKNOWN,
		uMapInfo: {},
		dMapInfo: {
			maps: [],
			episodes: [],
			endsequences: [],
		},
		zMapInfo: {
			maps: [],
		},
	};

	const uMapOrder: string[] = [];
	const dMapOrder: string[] = [];
	const dEpisodeOrder: string[] = [];
	const dEndseqOrder: string[] = [];
	const zMapOrder: string[] = [];

	for (const mapInfo of mapInfos) {
		if (mapInfo.uMapInfo) {
			for (const [mapId, mapData] of Object.entries(mapInfo.uMapInfo)) {
				if (!combined.uMapInfo[mapId]) {
					uMapOrder.push(mapId);
				}
				combined.uMapInfo[mapId] = mapData;
			}
		}

		if (mapInfo.dMapInfo) {
			for (const map of mapInfo.dMapInfo.maps) {
				if (!combined.dMapInfo.maps.some((m) => m.id === map.id)) {
					dMapOrder.push(map.id);
				}

				combined.dMapInfo.maps = [
					...combined.dMapInfo.maps.filter((m) => m.id !== map.id),
					map,
				];
			}

			for (const episode of mapInfo.dMapInfo.episodes) {
				const key = `${episode.lump}|${episode.name}`;
				if (!dEpisodeOrder.includes(key)) {
					dEpisodeOrder.push(key);
				}

				combined.dMapInfo.episodes = [
					...combined.dMapInfo.episodes.filter(
						(e) => `${e.lump}|${e.name}` !== key,
					),
					episode,
				];
			}

			for (const seq of mapInfo.dMapInfo.endsequences) {
				if (!dEndseqOrder.includes(seq.id)) {
					dEndseqOrder.push(seq.id);
				}

				combined.dMapInfo.endsequences = [
					...combined.dMapInfo.endsequences.filter((s) => s.id !== seq.id),
					seq,
				];
			}
		}

		if (mapInfo.zMapInfo) {
			for (const map of mapInfo.zMapInfo.maps) {
				if (!combined.zMapInfo.maps.some((m) => m.id === map.id)) {
					zMapOrder.push(map.id);
				}

				combined.zMapInfo.maps = [
					...combined.zMapInfo.maps.filter((m) => m.id !== map.id),
					map,
				];
			}
		}
	}

	if (combined.uMapInfo && Object.keys(combined.uMapInfo).length > 0) {
		const orderedUMap: WadUMapInfo = {};
		for (const id of uMapOrder) {
			orderedUMap[id] = combined.uMapInfo[id];
		}

		combined.uMapInfo = orderedUMap;
	}

	if (combined.dMapInfo) {
		combined.dMapInfo.maps = dMapOrder
			.map((id) => combined.dMapInfo.maps.find((m) => m.id === id))
			.filter((m) => m !== undefined);

		combined.dMapInfo.episodes = dEpisodeOrder
			.map((key) =>
				combined.dMapInfo.episodes.find((e) => `${e.lump}|${e.name}` === key),
			)
			.filter((m) => m !== undefined);

		combined.dMapInfo.endsequences = dEndseqOrder
			.map((id) => combined.dMapInfo.endsequences.find((s) => s.id === id))
			.filter((m) => m !== undefined);
	}

	if (combined.zMapInfo) {
		combined.zMapInfo.maps = zMapOrder
			.map((id) => combined.zMapInfo.maps.find((m) => m.id === id))
			.filter((m) => m !== undefined);
	}

	if (combined.uMapInfo && Object.keys(combined.uMapInfo).length > 0) {
		combined.type = WadMapInfoType.UMAPINFO;
	} else if (combined.dMapInfo && combined.dMapInfo.maps.length > 0) {
		combined.type = WadMapInfoType.DMAPINFO;
	} else if (combined.zMapInfo && combined.zMapInfo.maps.length > 0) {
		combined.type = WadMapInfoType.ZMAPINFO;
	}

	return combined;
}
