import type {
	WadDehacked,
	WadDehackedFile,
	WadDehackedThingInfo,
	WadThing,
} from "../interfaces/index.js";

export function combineWadDehacked(dehs: WadDehacked[]): WadDehacked {
	const combinedDehackedString = dehs
		.map((deh) => {
			if (deh.dehackedString) {
				return `#--------\n#\n# DEH STRING SOURCE: ${deh.source}\n#\n#--------\n\n${deh.dehackedString}`;
			}
			return undefined;
		})
		.filter((s) => s !== undefined)
		.join("\n");

	const thingTranslationMap = new Map<WadThing | null, WadDehackedThingInfo>();
	for (const deh of dehs) {
		for (const trans of deh.thingTranslations) {
			thingTranslationMap.set(trans.from, trans.to);
		}
	}
	const combinedThingTranslations = Array.from(
		thingTranslationMap,
		([from, to]) => ({ from, to }),
	);

	const combinedParsed: WadDehackedFile = {
		things: [],
		frames: [],
		pointers: [],
		sounds: [],
		ammo: [],
		weapons: [],
		misc: {},
		texts: [],
		pars: [],
		bexStrings: [],
		bexSprites: [],
		bexSounds: [],
		bexMusic: [],
		cheats: {},
		helperThing: undefined,
	};

	// Merge arrays using identifier maps
	const arrayMergers: Array<{
		key: string;
		// biome-ignore lint/suspicious/noExplicitAny:
		source: (deh: WadDehacked) => any[];
		// biome-ignore lint/suspicious/noExplicitAny:
		target: (file: WadDehackedFile) => any[];
		// biome-ignore lint/suspicious/noExplicitAny:
		getKey: (item: any) => string;
	}> = [
		{
			key: "things",
			source: (deh) => deh.parsed.things,
			target: (file) => file.things,
			getKey: (thing) => `thing_${thing.dehId}`,
		},
		{
			key: "frames",
			source: (deh) => deh.parsed.frames,
			target: (file) => file.frames,
			getKey: (frame) => `frame_${frame.index}`,
		},
		{
			key: "pointers",
			source: (deh) => deh.parsed.pointers,
			target: (file) => file.pointers,
			getKey: (ptr) => `ptr_${ptr.frameIndex}`,
		},
		{
			key: "sounds",
			source: (deh) => deh.parsed.sounds,
			target: (file) => file.sounds,
			getKey: (sound) => `sound_${sound.index}`,
		},
		{
			key: "ammo",
			source: (deh) => deh.parsed.ammo,
			target: (file) => file.ammo,
			getKey: (ammo) => `ammo_${ammo.index}`,
		},
		{
			key: "weapons",
			source: (deh) => deh.parsed.weapons,
			target: (file) => file.weapons,
			getKey: (weapon) => `weapon_${weapon.index}`,
		},
		{
			key: "texts",
			source: (deh) => deh.parsed.texts,
			target: (file) => file.texts,
			getKey: (text) => `text_${text.from}`,
		},
		{
			key: "pars",
			source: (deh) => deh.parsed.pars,
			target: (file) => file.pars,
			getKey: (par) => `par_${par.episode ?? -1}_${par.map}`,
		},
		{
			key: "bexStrings",
			source: (deh) => deh.parsed.bexStrings,
			target: (file) => file.bexStrings,
			getKey: (bex) => `bexs_${bex.key}`,
		},
		{
			key: "bexSprites",
			source: (deh) => deh.parsed.bexSprites,
			target: (file) => file.bexSprites,
			getKey: (bex) => `bexs_${bex.key}`,
		},
		{
			key: "bexSounds",
			source: (deh) => deh.parsed.bexSounds,
			target: (file) => file.bexSounds,
			getKey: (bex) => `bexs_${bex.key}`,
		},
		{
			key: "bexMusic",
			source: (deh) => deh.parsed.bexMusic,
			target: (file) => file.bexMusic,
			getKey: (bex) => `bexs_${bex.key}`,
		},
	];

	for (const merger of arrayMergers) {
		// biome-ignore lint/suspicious/noExplicitAny:
		const map = new Map<string, any>();
		for (const deh of dehs) {
			for (const item of merger.source(deh)) {
				map.set(merger.getKey(item), item);
			}
		}
		// biome-ignore lint/suspicious/noExplicitAny:
		(merger.target(combinedParsed) as any[]).push(...Array.from(map.values()));
	}

	combinedParsed.things.sort((a, b) => a.dehId - b.dehId);
	combinedParsed.frames.sort((a, b) => a.index - b.index);
	combinedParsed.pointers.sort((a, b) => a.frameIndex - b.frameIndex);
	combinedParsed.sounds.sort((a, b) => a.index - b.index);
	combinedParsed.ammo.sort((a, b) => a.index - b.index);
	combinedParsed.weapons.sort((a, b) => a.index - b.index);
	combinedParsed.texts.sort((a, b) => a.from.localeCompare(b.from));
	combinedParsed.pars.sort(
		(a, b) => (a.episode ?? -1) - (b.episode ?? -1) || a.map - b.map,
	);
	combinedParsed.bexStrings.sort((a, b) => a.key.localeCompare(b.key));
	combinedParsed.bexSprites.sort((a, b) => a.key.localeCompare(b.key));
	combinedParsed.bexSounds.sort((a, b) => a.key.localeCompare(b.key));
	combinedParsed.bexMusic.sort((a, b) => a.key.localeCompare(b.key));

	combinedParsed.misc = {};
	combinedParsed.cheats = {};
	for (const deh of dehs) {
		combinedParsed.misc = { ...combinedParsed.misc, ...deh.parsed.misc };
		if (deh.parsed.helperThing !== undefined) {
			combinedParsed.helperThing = deh.parsed.helperThing;
		}
		combinedParsed.cheats = { ...combinedParsed.cheats, ...deh.parsed.cheats };
	}
	return {
		dehackedString: combinedDehackedString,
		thingTranslations: combinedThingTranslations,
		parsed: combinedParsed,
		source: "combined",
	};
}
