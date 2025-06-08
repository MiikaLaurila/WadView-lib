export const playpalLumpName = "PLAYPAL";
export const colormapLumpName = "COLORMAP";
export const endoomLumpName = "ENDOOM";
export const dehackedLumpName = "DEHACKED";
export const texture1LumpName = "TEXTURE1";
export const texture2LumpName = "TEXTURE2";
export const pnamesLumpName = "PNAMES";
export const patchStartLumpMatcher = /^P+\d*_START$/;
export const patchEndLumpMatcher = /^P+\d*_END$/;
export const flatStartLumpMatcher = /^F+\d*_START$/;
export const flatEndLumpMatcher = /^F+\d*_END$/;
export const spriteStartLumpMatcher = /^S+\d*_START$/;
export const spriteEndLumpMatcher = /^S+\d*_END$/;
export const spriteFrameMatcher =
	/^([A-Za-z0-9]{4})([A-Za-z\\\[\]])([0-9A-G])$/;
export const spriteMirroredFrameMatcher =
	/^([A-Za-z0-9]{4})([A-Z])([0-9A-G])[A-Z]([0-9A-G])$/;
