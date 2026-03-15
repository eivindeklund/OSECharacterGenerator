/**
 * Magic-User spells organised by spell level (0-indexed: index 0 = 1st-level spells).
 * Source: OSE SRD.
 */
export const magicUserSpellsByLevel: readonly (readonly string[])[] = [
  // 1st level
  [
    "Charm Person",
    "Detect Magic",
    "Floating Disc",
    "Hold Portal",
    "Light",
    "Magic Missile",
    "Protection from Evil",
    "Read Languages",
    "Read Magic",
    "Shield",
    "Sleep",
    "Ventriloquism",
  ],
  // 2nd level
  [
    "Continual Light",
    "Detect Evil",
    "Detect Invisible",
    "ESP",
    "Invisibility",
    "Knock",
    "Levitate",
    "Locate Object",
    "Mirror Image",
    "Phantasmal Force",
    "Web",
    "Wizard Lock",
  ],
  // 3rd level
  [
    "Clairvoyance",
    "Dispel Magic",
    "Fire Ball",
    "Fly",
    "Haste",
    "Hold Person",
    "Infravision",
    "Invisibility 10' Radius",
    "Lightning Bolt",
    "Protection from Evil 10' Radius",
    "Protection from Normal Missiles",
    "Water Breathing",
  ],
  // 4th level
  [
    "Charm Monster",
    "Confusion",
    "Dimension Door",
    "Growth of Plants",
    "Hallucinatory Terrain",
    "Massmorph",
    "Polymorph Others",
    "Polymorph Self",
    "Remove Curse",
    "Wall of Fire",
    "Wall of Ice",
    "Wizard Eye",
  ],
  // 5th level
  [
    "Animate Dead",
    "Cloudkill",
    "Conjure Elemental",
    "Contact Higher Plane",
    "Feeblemind",
    "Hold Monster",
    "Magic Jar",
    "Pass-Wall",
    "Telekinesis",
    "Teleport",
    "Transmute Rock to Mud",
    "Wall of Stone",
  ],
  // 6th level
  [
    "Anti-Magic Shell",
    "Control Weather",
    "Death Spell",
    "Disintegrate",
    "Geas",
    "Invisible Stalker",
    "Lower Water",
    "Move Earth",
    "Part Water",
    "Projected Image",
    "Reincarnation",
  ],
];

/** Flat list of all Magic-User spells across all levels (kept for backward compatibility). */
export const magicUserSpells: string[] = (magicUserSpellsByLevel as string[][]).flat();

export const druidSpells = [
  "Animal Friendship",
  "Detect Danger",
  "Entangle",
  "Faerie Fire",
  "Invisibility to Animals",
  "Locate Plant or Animal",
  "Predict Weather",
  "Speak with Animals"
];

export const illusionistSpells = [
  "Auditory Illusions",
  "Chromatic Orb",
  "Colour Spray",
  "Dancing Lights",
  "Detect Illusion",
  "Glamour",
  "Hypnotism",
  "Light",
  "Phantasmal Force",
  "Read Magic",
  "Spook",
  "Wall of Fog"
];

export const necromancerSpells = [
  "Chill Touch",
  "Command Dead",
  "Corpse Visage",
  "Decay",
  "Deathlight",
  "Detect Undead",
  "Marionette",
  "Pass Undead",
  "Protection from Evil",
  "Read Magic",
  "Skull Speech",
  "Undead Servitor"
];

export const runesmithSpells = [
  "Rune of Alarm",
  "Rune of Ale",
  "Rune of Finding",
  "Rune of Fire",
  "Rune of Grounding",
  "Rune of Healing",
  "Rune of Luck",
  "Rune of the Forge",
  "Rune of Shielding",
  'Rune of Thunder',
  "Rune of Slaying",
  "Rune of Warding"
];

/**
 * Spell lists for non-MU arcane casters grouped by level.
 * Currently these classes only have level-1 spell data in the SRD reference,
 * so each is a single-element array. Expand as more level data becomes available.
 */
export const illusionistSpellsByLevel: readonly (readonly string[])[] = [illusionistSpells];
export const necromancerSpellsByLevel: readonly (readonly string[])[] = [necromancerSpells];
export const runesmithSpellsByLevel: readonly (readonly string[])[] = [runesmithSpells];
export const druidSpellsByLevel: readonly (readonly string[])[] = [druidSpells];