import {
	type EventFunc,
	type WadDehacked,
	type WadDehackedAmmo,
	type WadDehackedBexKvp,
	type WadDehackedCheats,
	type WadDehackedFile,
	type WadDehackedFrame,
	type WadDehackedHelperThing,
	type WadDehackedMisc,
	type WadDehackedPar,
	type WadDehackedPointer,
	type WadDehackedSound,
	type WadDehackedText,
	type WadDehackedThing,
	WadDehackedThingFlag,
	WadDehackedToThingType,
	type WadDehackedWeapon,
	type WadDirectoryEntry,
	WadMapThingGroup,
	defaultWadDehacked,
	dehackedLumpName,
	getDehThingFlags,
	getDehThingMBF21Flags,
	getDehWeaponMBF21Flags,
	namesToDehThingFlags,
	namesToDehThingMBF21Flags,
	namesToDehWeaponMBF21Flags,
	weaponIdToDoomThing,
} from "../interfaces/index.js";

enum BlockType {
	THING = "THING",
	FRAME = "FRAME",
	WEAPON = "WEAPON",
	AMMO = "AMMO",
	TEXT = "TEXT",
	MISC = "MISC",
	BEXSTRINGS = "STRINGS",
	BEXPARS = "PARS",
	BEXCODEPTR = "CODEPTR",
	CHEATS = "CHEATS",
	SOUND = "SOUND",
	BEXHELPER = "HELPER",
	BEXSPRITES = "SPRITES",
	BEXSOUNDS = "BEXSOUNDS",
	BEXMUSIC = "MUSIC",
}

const bexBlocks: BlockType[] = [
	BlockType.BEXCODEPTR,
	BlockType.BEXHELPER,
	BlockType.BEXMUSIC,
	BlockType.BEXPARS,
	BlockType.BEXSOUNDS,
	BlockType.BEXSPRITES,
	BlockType.BEXSTRINGS,
] as const;

interface WadFileDehackedParserOptions {
	dehackedBuffer?: ArrayBuffer;
	file?: ArrayBuffer;
	fileName?: string;
	lumps?: WadDirectoryEntry[];
	sendEvent: EventFunc;
}

export class WadFileDehackedParser {
	private dehackedBuffer?: ArrayBuffer;
	private sendEvent: EventFunc;
	private file?: ArrayBuffer;
	private fileName?: string;
	private lumps: WadDirectoryEntry[];
	constructor(opts: WadFileDehackedParserOptions) {
		this.file = opts.file;
		this.sendEvent = opts.sendEvent;
		this.lumps = opts.lumps ?? [];
		this.dehackedBuffer = opts.dehackedBuffer;
		this.fileName = opts.fileName;
	}

	private getDehView = (): Uint8Array | null => {
		if (this.dehackedBuffer) {
			return new Uint8Array(this.dehackedBuffer);
		}
		if (
			!this.file ||
			this.lumps.length === 0 ||
			this.lumps[0].lumpName !== dehackedLumpName
		) {
			return null;
		}

		const view = new Uint8Array(
			this.file.slice(
				this.lumps[0].lumpLocation,
				this.lumps[0].lumpLocation + this.lumps[0].lumpSize,
			),
		);
		return view;
	};

	private getDehSource = (): string => {
		if (this.dehackedBuffer) {
			return "Loose .deh file";
		}
		return `Lump ${this.lumps[0].lumpName} in ${this.fileName}`;
	};

	public parseDehacked = (): WadDehacked => {
		const view = this.getDehView();
		if (!view) {
			return JSON.parse(JSON.stringify(defaultWadDehacked));
		}

		const dehacked: WadDehacked = JSON.parse(
			JSON.stringify(defaultWadDehacked),
		);

		for (let i = 0; i < view.byteLength; i++) {
			dehacked.dehackedString += String.fromCharCode(view[i]);
		}
		dehacked.source = this.getDehSource();
		dehacked.parsed = this.parseDehString(dehacked.dehackedString);
		dehacked.thingTranslations = dehacked.parsed.things.map((t) => {
			if (
				t.bits?.includes(WadDehackedThingFlag.COUNTKILL) ||
				(t.hitPoints && !t.bits?.includes(WadDehackedThingFlag.NOBLOCKMAP))
			) {
				return {
					from: t.id,
					to: { name: t.name, group: WadMapThingGroup.MONSTER },
				};
			}
			if (t.bits?.includes(WadDehackedThingFlag.SOLID)) {
				return {
					from: t.id,
					to: { name: t.name, group: WadMapThingGroup.OBSTACLE },
				};
			}
			if (t.bits?.includes(WadDehackedThingFlag.SPECIAL)) {
				return {
					from: t.id,
					to: { name: t.name, group: WadMapThingGroup.ARTIFACT },
				};
			}
			const potentialWeapon = dehacked.parsed.weapons.find((w) =>
				t.name.toLowerCase().includes(w.name.toLowerCase()),
			);
			if (potentialWeapon) {
				return {
					from: weaponIdToDoomThing(potentialWeapon.index),
					to: { name: t.name, group: WadMapThingGroup.WEAPON },
				};
			}

			const potentialAmmo = dehacked.parsed.ammo.find((a) =>
				t.name.toLowerCase().includes(a.name.toLowerCase()),
			);
			if (potentialAmmo) {
				return {
					from: t.id,
					to: { name: t.name, group: WadMapThingGroup.AMMO },
				};
			}

			return {
				from: t.id,
				to: { name: t.name, group: WadMapThingGroup.DECORATION },
			};
		});
		return dehacked;
	};

	private parseDehString(content: string): WadDehackedFile {
		const lines = content.split("\n");
		const result: WadDehackedFile = {
			things: [],
			frames: [],
			pointers: [],
			sounds: [],
			ammo: [],
			weapons: [],
			misc: {},
			texts: [],
			pars: [],
			helperThing: undefined,
			bexStrings: [],
			bexSprites: [],
			bexSounds: [],
			bexMusic: [],
			cheats: {},
		};

		let currentBlock: BlockType | null = null;

		let currentThing: Partial<WadDehackedThing> = {};
		let currentFrame: Partial<WadDehackedFrame> = {};
		let currentWeapon: Partial<WadDehackedWeapon> = {};
		let currentText: Partial<WadDehackedText> = {};
		let currentAmmo: Partial<WadDehackedAmmo> = {};
		let currentSound: Partial<WadDehackedSound> = {};
		let currentMisc: Partial<WadDehackedMisc> = {};
		let currentCheats: Partial<WadDehackedCheats> = {};
		let currentHelper: Partial<WadDehackedHelperThing> = {};
		let currentPars: WadDehackedPar[] = [];
		let currentCodePtrs: WadDehackedPointer[] = [];
		let currentBexKvpArray: WadDehackedBexKvp[] = [];

		let processingTextBlock = false;
		let textToProcess = "";
		let expectedTextLength = 0;
		let processingMultiLineBexString = false;
		let currentBexStringKey = "";
		let currentBexStringValue = "";

		const getName = (line: string) => {
			let name = line.match(/\(([\s\S]*)\)/)?.[1] ?? "UNKNOWN_NAME";
			if (name.startsWith("_")) {
				name = name.replace("_", "");
			}
			return name;
		};

		const pushBlock = () => {
			if (
				currentBlock === BlockType.THING &&
				currentThing.dehId !== undefined
			) {
				if (!currentThing.id) {
					currentThing.id = WadDehackedToThingType[currentThing.dehId] ?? null;
				}
				result.things.push(currentThing as WadDehackedThing);
				currentThing = {};
			}

			if (
				currentBlock === BlockType.FRAME &&
				currentFrame.index !== undefined
			) {
				result.frames.push(currentFrame as WadDehackedFrame);
				currentFrame = {};
			}

			if (
				currentBlock === BlockType.WEAPON &&
				currentWeapon.index !== undefined
			) {
				result.weapons.push(currentWeapon as WadDehackedWeapon);
				currentWeapon = {};
			}

			if (currentBlock === BlockType.AMMO && currentAmmo.index !== undefined) {
				result.ammo.push(currentAmmo as WadDehackedWeapon);
				currentAmmo = {};
			}

			if (
				currentBlock === BlockType.SOUND &&
				currentSound.index !== undefined
			) {
				result.sounds.push(currentSound as WadDehackedSound);
				currentSound = {};
			}

			if (currentBlock === BlockType.MISC) {
				result.misc = currentMisc as WadDehackedMisc;
				currentMisc = {};
			}

			if (currentBlock === BlockType.BEXHELPER) {
				result.helperThing = currentHelper as WadDehackedHelperThing;
				currentHelper = {};
			}

			if (currentBlock === BlockType.CHEATS) {
				result.cheats = currentCheats as WadDehackedCheats;
				currentCheats = {};
			}

			if (currentBlock === BlockType.BEXSTRINGS) {
				result.bexStrings = [...currentBexKvpArray];
				currentBexKvpArray = [];
			}

			if (currentBlock === BlockType.BEXSPRITES) {
				result.bexSprites = [...currentBexKvpArray];
				currentBexKvpArray = [];
			}

			if (currentBlock === BlockType.BEXSOUNDS) {
				result.bexSounds = [...currentBexKvpArray];
				currentBexKvpArray = [];
			}

			if (currentBlock === BlockType.BEXMUSIC) {
				result.bexMusic = [...currentBexKvpArray];
				currentBexKvpArray = [];
			}

			if (currentBlock === BlockType.BEXCODEPTR) {
				result.pointers = [...currentCodePtrs];
				currentCodePtrs = [];
			}

			if (currentBlock === BlockType.BEXPARS) {
				result.pars = [...currentPars];
				currentPars = [];
			}

			if (
				currentBlock === BlockType.TEXT &&
				currentText.oldLen &&
				currentText.newLen
			) {
				processingTextBlock = false;
				const from = textToProcess
					.substring(0, currentText.oldLen)
					.trim()
					.replaceAll("\r", "\n");
				const to = textToProcess
					.substring(
						currentText.oldLen,
						currentText.oldLen + currentText.newLen,
					)
					.trim()
					.replaceAll("\r", "\n");
				currentText.from = from;
				currentText.to = to;
				result.texts.push(currentText as WadDehackedText);
				currentText = {};
			}

			currentBlock = null;
		};

		const isBlockStart = (trimmed: string): boolean => {
			return (
				trimmed.startsWith("Thing ") ||
				(trimmed.startsWith("Frame ") && !trimmed.includes("=")) ||
				trimmed.startsWith("Weapon ") ||
				trimmed.startsWith("Ammo ") ||
				trimmed.startsWith("Sound ") ||
				trimmed.startsWith("Misc") ||
				trimmed.startsWith("Cheat") ||
				trimmed.startsWith("[STRINGS]") ||
				trimmed.startsWith("[SPRITES]") ||
				trimmed.startsWith("[SOUNDS]") ||
				trimmed.startsWith("[MUSIC]") ||
				trimmed.startsWith("[CODEPTR]") ||
				trimmed.startsWith("[PARS]") ||
				trimmed.startsWith("[HELPER]") ||
				trimmed.startsWith("Text ")
			);
		};

		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed.startsWith("#")) continue;

			if (processingTextBlock) {
				if (isBlockStart(trimmed)) {
					pushBlock();
					continue;
				}
				textToProcess += `${trimmed}\n`;
				if (textToProcess.length >= expectedTextLength) {
					pushBlock();
				}
			}

			if (processingMultiLineBexString) {
				currentBexStringValue += trimmed.replace("\\", "");
				if (!trimmed.endsWith("\\")) {
					currentBexKvpArray.push({
						key: currentBexStringKey,
						value: currentBexStringValue,
					});
					processingMultiLineBexString = false;
				}
			}

			if (isBlockStart(trimmed) && currentBlock) {
				pushBlock();
			}

			if (trimmed.startsWith("Thing ")) {
				currentBlock = BlockType.THING;
				const dehId = Number.parseInt(trimmed.split(" ")[1], 10);
				currentThing = { dehId, name: getName(trimmed) };
			} else if (trimmed.startsWith("Frame ") && !trimmed.includes("=")) {
				currentBlock = BlockType.FRAME;
				const index = Number.parseInt(trimmed.split(" ")[1], 10);
				currentFrame = { index };
			} else if (trimmed.startsWith("Weapon ")) {
				currentBlock = BlockType.WEAPON;
				const index = Number.parseInt(trimmed.split(" ")[1], 10);
				currentWeapon = { index, name: getName(trimmed) };
			} else if (trimmed.startsWith("Ammo ")) {
				currentBlock = BlockType.AMMO;
				const index = Number.parseInt(trimmed.split(" ")[1], 10);
				currentAmmo = { index, name: getName(trimmed) };
			} else if (trimmed.startsWith("Sound ")) {
				currentBlock = BlockType.SOUND;
				const index = Number.parseInt(trimmed.split(" ")[1], 10);
				currentSound = { index };
			} else if (trimmed.startsWith("Misc")) {
				currentBlock = BlockType.MISC;
				currentMisc = {};
			} else if (trimmed.startsWith("Cheat")) {
				currentBlock = BlockType.CHEATS;
				currentCheats = {};
			} else if (trimmed.startsWith("[STRINGS]")) {
				currentBlock = BlockType.BEXSTRINGS;
				currentBexKvpArray = [];
			} else if (trimmed.startsWith("[SPRITES]")) {
				currentBlock = BlockType.BEXSPRITES;
				currentBexKvpArray = [];
			} else if (trimmed.startsWith("[SOUNDS]")) {
				currentBlock = BlockType.BEXSOUNDS;
				currentBexKvpArray = [];
			} else if (trimmed.startsWith("[MUSIC]")) {
				currentBlock = BlockType.BEXMUSIC;
				currentBexKvpArray = [];
			} else if (trimmed.startsWith("[CODEPTR]")) {
				currentBlock = BlockType.BEXCODEPTR;
				currentCodePtrs = [];
			} else if (trimmed.startsWith("[PARS]")) {
				currentBlock = BlockType.BEXPARS;
				currentPars = [];
			} else if (trimmed.startsWith("[HELPER]")) {
				currentBlock = BlockType.BEXHELPER;
				currentHelper = {};
			} else if (trimmed.startsWith("Text ")) {
				currentBlock = BlockType.TEXT;
				const oldLen = Number.parseInt(trimmed.split(" ")[1], 10);
				const newLen = Number.parseInt(trimmed.split(" ")[2], 10);
				currentText = { oldLen, newLen };
				processingTextBlock = true;
				expectedTextLength = oldLen + newLen;
				textToProcess = "";
			} else if (currentBlock) {
				const [key, value] = this.parseKeyValue(trimmed);

				switch (currentBlock) {
					case BlockType.THING:
						if (!key || value === undefined || value === null) continue;
						this.processThingKey(currentThing, key, value);
						break;
					case BlockType.FRAME:
						if (!key || value === undefined || value === null) continue;
						this.processFrameKey(currentFrame, key, value);
						break;
					case BlockType.WEAPON:
						if (!key || value === undefined || value === null) continue;
						this.processWeaponKey(currentWeapon, key, value);
						break;
					case BlockType.AMMO:
						if (!key || value === undefined || value === null) continue;
						this.processAmmoKey(currentAmmo, key, value);
						break;
					case BlockType.SOUND:
						if (!key || value === undefined || value === null) continue;
						this.processSoundKey(currentSound, key, value);
						break;
					case BlockType.MISC:
						if (!key || value === undefined || value === null) continue;
						this.processMiscKey(currentMisc, key, value);
						break;
					case BlockType.CHEATS:
						if (!key || value === undefined || value === null) continue;
						this.processCheatsKey(currentCheats, key, value);
						break;
					case BlockType.BEXSTRINGS:
						if (!key || value === undefined || value === null) continue;
						if (typeof value === "string" && value.endsWith("\\")) {
							processingMultiLineBexString = true;
							currentBexStringKey = key;
							currentBexStringValue = value.replace("\\", "");
						} else {
							currentBexKvpArray.push({ key, value });
						}
						break;
					case BlockType.BEXSPRITES:
					case BlockType.BEXSOUNDS:
					case BlockType.BEXMUSIC:
						if (!key || value === undefined || value === null) continue;
						currentBexKvpArray.push({ key, value });
						break;
					case BlockType.BEXCODEPTR:
						if (!key || value === undefined || value === null) continue;
						currentCodePtrs.push({
							frameIndex: Number.parseInt(key.split(" ")[1]),
							codepFrame: value,
						});
						break;
					case BlockType.BEXPARS:
						this.processParLine(currentPars, trimmed);
						break;
					case BlockType.BEXHELPER:
						if (
							!key ||
							value === undefined ||
							value === null ||
							typeof value !== "number" ||
							key !== "type"
						)
							continue;
						currentHelper.type = value;
				}
			}
		}

		pushBlock();

		return result;
	}

	private parseKeyValue(line: string): [string | null, number | string | null] {
		const parts = line.split("=").map((p) => p.trim());
		if (parts.length < 2) return [null, null];

		const key = parts[0];
		const value = parts[1];
		const numValue = Number.parseInt(value, 10);

		return [key, Number.isNaN(numValue) ? value : numValue];
	}

	private processThingKey(
		thing: Partial<WadDehackedThing>,
		key: string,
		value: number | string,
	) {
		if (typeof value !== "number") {
			switch (key) {
				case "Pickup message":
					thing.pickupMessage = value;
					break;
				case "Bits":
					thing.bits = getDehThingFlags(
						namesToDehThingFlags(value.split(/\+|\||\s+|,/)),
					);
					break;
				case "Bits2":
					thing.bits2 = value;
					break;
				case "MBF21 Bits":
					thing.mbf21Bits = getDehThingMBF21Flags(
						namesToDehThingMBF21Flags(value.split(/\+|\||\s+|,/)),
					);
					break;
				case "Name1":
					thing.name = value;
					break;
				default:
					console.log(`Unknown thing KVP | key: ${key} | value: ${value}`);
			}
		} else {
			switch (key) {
				case "ID #":
					thing.id = value;
					break;
				case "Initial frame":
					thing.initialFrame = value;
					break;
				case "Hit points":
					thing.hitPoints = value;
					break;
				case "First moving frame":
					thing.firstMovingFrame = value;
					break;
				case "Alert sound":
					thing.alertSound = value;
					break;
				case "Reaction time":
					thing.reactionTime = value;
					break;
				case "Attack sound":
					thing.attackSound = value;
					break;
				case "Injury frame":
					thing.injuryFrame = value;
					break;
				case "Pain chance":
					thing.painChance = value;
					break;
				case "Pain sound":
					thing.painSound = value;
					break;
				case "Close attack frame":
					thing.closeAttackFrame = value;
					break;
				case "Far attack frame":
					thing.farAttackFrame = value;
					break;
				case "Exploding frame":
					thing.explodingFrame = value;
					break;
				case "Death frame":
					thing.deathFrame = value;
					break;
				case "Death sound":
					thing.deathSound = value;
					break;
				case "Speed":
					thing.speed = value;
					break;
				case "Width":
					thing.width = value;
					break;
				case "Height":
					thing.height = value;
					break;
				case "Mass":
					thing.mass = value;
					break;
				case "Missile damage":
					thing.missileDamage = value;
					break;
				case "Action sound":
					thing.actionSound = value;
					break;
				case "Bits":
					thing.bits = getDehThingFlags(value);
					break;
				case "Bits2":
					thing.bits2 = value;
					break;
				case "Respawn frame":
					thing.respawnFrame = value;
					break;
				case "Dropped item":
					thing.droppedItem = value;
					break;
				case "Infighting group":
					thing.infightingGroup = value;
					break;
				case "Projectile group":
					thing.projectileGroup = value;
					break;
				case "Splash group":
					thing.splashGroup = value;
					break;
				case "MBF21 Bits":
					thing.mbf21Bits = getDehThingMBF21Flags(value);
					break;
				case "Rip sound":
					thing.ripSound = value;
					break;
				case "Fast speed":
					thing.fastSpeed = value;
					break;
				case "Melee range":
					thing.meleeRange = value;
					break;
				case "Blood colod":
					thing.bloodColor = value;
					break;
				default:
					console.log(`Unknown thing KVP | key: ${key} | value: ${value}`);
			}
		}
	}

	private processFrameKey(
		frame: Partial<WadDehackedFrame>,
		key: string,
		value: number | string,
	) {
		if (typeof value !== "number") return;

		switch (key) {
			case "Sprite number":
				frame.spriteNumber = value;
				break;
			case "Sprite subnumber":
				frame.spriteSubnumber = value;
				break;
			case "Duration":
				frame.duration = value;
				break;
			case "Next frame":
				frame.nextFrame = value;
				break;
			case "Codep Frame":
				frame.codepFrame = value;
				break;
			case "Unknown 1":
				frame.unknown1 = value;
				break;
			case "Unknown 2":
				frame.unknown2 = value;
				break;
			case "Args1":
				frame.args1 = value;
				break;
			case "Args2":
				frame.args2 = value;
				break;
			case "Args3":
				frame.args3 = value;
				break;
			case "Args4":
				frame.args4 = value;
				break;
			case "Args5":
				frame.args5 = value;
				break;
			case "Args6":
				frame.args6 = value;
				break;
			case "Args7":
				frame.args7 = value;
				break;
			case "Args8":
				frame.args8 = value;
				break;
			case "MBF21 Bits":
				frame.mbf21Bits = value;
				break;
		}
	}

	private processWeaponKey(
		weapon: Partial<WadDehackedWeapon>,
		key: string,
		value: number | string,
	) {
		if (typeof value !== "number") {
			switch (key) {
				case "MBF21 Bits":
					weapon.mbf21Bits = getDehWeaponMBF21Flags(
						namesToDehWeaponMBF21Flags(value.split(/\+|\||\s+|,/)),
					);
					break;
				default:
					console.log(`Unknown thing KVP | key: ${key} | value: ${value}`);
			}
		} else {
			switch (key) {
				case "Ammo type":
					weapon.ammoType = value;
					break;
				case "Deselect frame":
					weapon.deselectFrame = value;
					break;
				case "Select frame":
					weapon.selectFrame = value;
					break;
				case "Bobbing frame":
					weapon.bobbingFrame = value;
					break;
				case "Shooting frame":
					weapon.shootingFrame = value;
					break;
				case "Firing frame":
					weapon.firingFrame = value;
					break;
				case "Ammo per shot":
					weapon.ammoPerShot = value;
					break;
				case "MBF21 Bits":
					weapon.mbf21Bits = getDehWeaponMBF21Flags(value);
					break;
			}
		}
	}

	private processAmmoKey(
		ammo: Partial<WadDehackedAmmo>,
		key: string,
		value: number | string,
	) {
		if (typeof value !== "number") return;

		switch (key) {
			case "Max ammo":
				ammo.maxAmmo = value;
				break;
			case "Per ammo":
				ammo.perAmmo = value;
				break;
		}
	}

	private processMiscKey(
		misc: Partial<WadDehackedMisc>,
		key: string,
		value: number | string,
	) {
		if (typeof value !== "number") return;

		switch (key) {
			case "Initial Health":
				misc.initialHealth = value;
				break;
			case "Initial Bullets":
				misc.initialBullets = value;
				break;
			case "Max Health":
				misc.maxHealth = value;
				break;
			case "Max Armor":
				misc.maxArmor = value;
				break;
			case "Green Armor Class":
				misc.greenArmorClass = value;
				break;
			case "Blue Armor Class":
				misc.blueArmorClass = value;
				break;
			case "Max Soulsphere":
				misc.maxSoulsphere = value;
				break;
			case "Soulsphere Health":
				misc.soulsphereHealth = value;
				break;
			case "Megasphere Health":
				misc.megasphereHealth = value;
				break;
			case "God Mode Health":
				misc.godModeHealth = value;
				break;
			case "IDFA Armor":
				misc.idfaArmor = value;
				break;
			case "IDFA Armor Class":
				misc.idfaArmorClass = value;
				break;
			case "IDKFA Armor":
				misc.idkfaArmor = value;
				break;
			case "IDKFA Armor Class":
				misc.idkfaArmorClass = value;
				break;
			case "BFG Cells/Shot":
				misc.bfgCellsPerShot = value;
				break;
			case "Monsters Infight":
				misc.monstersInfight = value;
				break;
		}
	}

	private processCheatsKey(
		cheats: Partial<WadDehackedCheats>,
		key: string,
		value: number | string,
	) {
		if (typeof value !== "string") return;

		switch (key) {
			case "Change music":
				cheats.changeMusic = value;
				break;
			case "Chainsaw":
				cheats.chainsaw = value;
				break;
			case "God mode":
				cheats.godMode = value;
				break;
			case "Ammo & Keys":
				cheats.ammoAndKeys = value;
				break;
			case "Ammo":
				cheats.ammo = value;
				break;
			case "No Clipping 1":
				cheats.noclip1 = value;
				break;
			case "No Clipping 2":
				cheats.noclip2 = value;
				break;
			case "Invincibility":
				cheats.invincibility = value;
				break;
			case "Berserk":
				cheats.berserk = value;
				break;
			case "Invisibility":
				cheats.invisibility = value;
				break;
			case "Radiation Suit":
				cheats.radiationSuit = value;
				break;
			case "Auto-map":
				cheats.autoMap = value;
				break;
			case "Lite-amp Goggles":
				cheats.lightGoggles = value;
				break;
			case "BEHOLD menu":
				cheats.behold = value;
				break;
			case "Level Warp":
				cheats.levelWarp = value;
				break;
			case "Player Position":
				cheats.playerPos = value;
				break;
			case "Map cheat":
				cheats.mapCheat = value;
				break;
		}
	}

	private processSoundKey(
		sound: Partial<WadDehackedSound>,
		key: string,
		value: number | string,
	) {
		if (typeof value !== "number") return;

		switch (key) {
			case "Offset":
				sound.offset = value;
				break;
			case "Zero/One":
				sound.zeroOne = value;
				break;
			case "Zero 1":
				sound.zero1 = value;
				break;
			case "Zero 2":
				sound.zero2 = value;
				break;
			case "Zero 3":
				sound.zero3 = value;
				break;
			case "Zero 4":
				sound.zero4 = value;
				break;
			case "Neg. One 1":
				sound.negOne1 = value;
				break;
			case "Neg. One 2":
				sound.negOne2 = value;
				break;
		}
	}

	private processParLine(currentPars: WadDehackedPar[], line: string) {
		const cleanedLine = line.split("//")[0].trim();

		const parts = cleanedLine.split(/\s+/);

		if (parts.length < 2 || parts[0] !== "par") {
			return;
		}

		if (parts.length === 4) {
			currentPars.push({
				episode: Number.parseInt(parts[1], 10),
				map: Number.parseInt(parts[2], 10),
				time: Number.parseInt(parts[3], 10),
			});
		}

		if (parts.length === 3) {
			currentPars.push({
				episode: undefined,
				map: Number.parseInt(parts[1], 10),
				time: Number.parseInt(parts[2], 10),
			});
		}
	}
}
