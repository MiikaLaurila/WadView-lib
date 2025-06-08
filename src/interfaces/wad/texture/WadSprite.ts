import type { WadPatch } from "../../index.js";

export interface WadSpriteFrame {
	idx: string;
	mirrored: boolean;
	data: WadPatch;
}

export interface WadSprite {
	name: string;
	animation: string;
	frames: WadSpriteFrame[];
}
