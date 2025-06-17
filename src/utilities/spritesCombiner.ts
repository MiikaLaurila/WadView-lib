import type { WadSprite } from "../interfaces/index.js";

export function combineWadSprites(spriteArrays: WadSprite[][]): WadSprite[] {
	const combinedSprites: (WadSprite | undefined)[] = [];
	const spriteMap = new Map<string, WadSprite>();
	const appearanceOrder: string[] = [];

	for (const sprites of spriteArrays) {
		for (const sprite of sprites) {
			const spriteKey = `${sprite.name}_${sprite.animation}`;
			if (!spriteMap.has(spriteKey)) {
				appearanceOrder.push(spriteKey);
			}
			spriteMap.set(spriteKey, sprite);
		}
	}

	for (const name of appearanceOrder) {
		combinedSprites.push(spriteMap.get(name));
	}

	return combinedSprites.filter((f) => f !== undefined);
}
