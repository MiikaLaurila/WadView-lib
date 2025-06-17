import type { WadPatch, WadTexture, WadTextures } from "../interfaces/index.js";

export function combineWadTextures(texturesArray: WadTextures[]): WadTextures {
	const combinedPatchNames: string[] = [];
	const patchNameToIndex = new Map<string, number>();

	for (const textures of texturesArray) {
		for (const name of textures.patchNames) {
			if (!patchNameToIndex.has(name)) {
				patchNameToIndex.set(name, combinedPatchNames.length);
				combinedPatchNames.push(name);
			}
		}
	}

	const combinedPatches: Record<string, WadPatch> = {};
	for (const textures of texturesArray) {
		Object.assign(combinedPatches, textures.patches);
	}

	for (const name of Object.keys(combinedPatches)) {
		if (!patchNameToIndex.has(name)) {
			patchNameToIndex.set(name, combinedPatchNames.length);
			combinedPatchNames.push(name);
		}
	}

	const updateTexturePatches = (
		texture: WadTexture,
		sourcePatches: string[],
	): WadTexture => ({
		...texture,
		patches: texture.patches.map((patch) => {
			const oldName = sourcePatches[patch.patchNum];
			const newIndex = patchNameToIndex.get(oldName);
			return {
				...patch,
				patchNum: newIndex !== undefined ? newIndex : patch.patchNum,
			};
		}),
	});

	const combineTextureList = (texturesList: "texture1" | "texture2") => {
		const textureMap = new Map<string, WadTexture>();
		const appearanceOrder: string[] = [];

		for (const textures of texturesArray) {
			const list = textures[texturesList];
			for (const texture of list) {
				const updatedTexture = updateTexturePatches(
					texture,
					textures.patchNames,
				);
				if (!textureMap.has(updatedTexture.name)) {
					appearanceOrder.push(updatedTexture.name);
				}
				textureMap.set(updatedTexture.name, updatedTexture);
			}
		}

		return appearanceOrder
			.map((name) => textureMap.get(name))
			.filter((t) => t !== undefined);
	};

	return {
		patchNames: combinedPatchNames,
		patches: combinedPatches,
		texture1: combineTextureList("texture1"),
		texture2: combineTextureList("texture2"),
	};
}
