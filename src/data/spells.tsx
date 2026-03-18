import type { SpellDefinition } from '../types';

/**
 * combatUse rating constants — 1–5 scale indicating how combat-relevant a spell is.
 *   COMBAT_USE.OUT_OF_COMBAT   (1) — useful only outside combat
 *   COMBAT_USE.MOSTLY_UTILITY  (2) — mostly utility, minor situational combat use
 *   COMBAT_USE.BOTH            (3) — valuable in both combat and out-of-combat contexts
 *   COMBAT_USE.MOSTLY_COMBAT   (4) — primarily combat-focused
 *   COMBAT_USE.COMBAT_ONLY     (5) — virtually no application outside combat
 */
export const COMBAT_USE = {
  OUT_OF_COMBAT:  1,
  MOSTLY_UTILITY: 2,
  BOTH:           3,
  MOSTLY_COMBAT:  4,
  COMBAT_ONLY:    5,
} as const; // TODO not yet supported by web compilation: satisfies Record<string, 1 | 2 | 3 | 4 | 5>

/**
 * Magic-User spells organised by spell level (0-indexed: index 0 = 1st-level spells).
 * Each entry is a SpellDefinition object.
 * Source: OSE SRD.
 */
export const magicUserSpellsByLevel: readonly (readonly SpellDefinition[])[] = [
  // 1st level
  [
    { id: 'charm-person',            name: 'Charm Person',          duration: "Special",   range: "120'",  combatUse: COMBAT_USE.BOTH,           shortDesc: '1 humanoid, save vs Spells or treats caster as trusted friend' },
    { id: 'detect-magic',            name: 'Detect Magic',          duration: "2 turns",   range: "60'",   combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Reveal all magic auras in range' },
    { id: 'floating-disc',           name: 'Floating Disc',         duration: "6 turns",   range: "6'",    combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Floating 3\' disc carries up to 5,000 coins; follows caster' },
    { id: 'hold-portal',             name: 'Hold Portal',           duration: "2d6 turns", range: "10'",   combatUse: COMBAT_USE.BOTH,            shortDesc: 'Holds a door, gate, or window shut' },
    { id: 'mu-light',                name: 'Light',                 duration: "6 turns + 1/level",   range: "120'",  combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: '15\' radius light; or blind a target (save vs Spells)' },
    { id: 'magic-missile',           name: 'Magic Missile',         duration: "1 turn",    range: "150'",  combatUse: COMBAT_USE.COMBAT_ONLY,     shortDesc: '1d6+1 dmg, auto-hit, no save (1 missile at level 1)' },
    { id: 'mu-protection-from-evil', name: 'Protection from Evil',  duration: "6 turns",   range: "Touch", combatUse: COMBAT_USE.BOTH,            shortDesc: '+1 AC and saves; blocks summoned/enchanted creatures from attacking' },
    { id: 'read-languages',          name: 'Read Languages',        duration: "2 turns",   range: "0",     combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Read any non-magical text or map' },
    { id: 'read-magic',              name: 'Read Magic',            duration: "1 turn",    range: "0",     combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Decipher magical writing on scrolls or spellbooks' },
    { id: 'shield',                  name: 'Shield',                duration: "2 turns",   range: "0",     combatUse: COMBAT_USE.COMBAT_ONLY,     shortDesc: 'AC 17 vs melee, AC 19 vs missiles; immune to Magic Missile' },
    { id: 'sleep',                   name: 'Sleep',                 duration: "4d4 turns", range: "240'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: '2d8 HD of creatures (≤4 HD each, lowest HD first), no save' },
    { id: 'ventriloquism',           name: 'Ventriloquism',         duration: "2 turns",   range: "60'",   combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Throw voice up to 60\' in any direction' },
  ],
  // 2nd level
  [
    { id: 'continual-light',       name: 'Continual Light',       duration: "Permanent", range: "120'",  combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: '30\' radius permanent light; or permanently blind a target (save vs Spells)' },
    { id: 'mu-detect-evil',        name: 'Detect Evil',           duration: "2 turns",   range: "60'",   combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Sense evil intent or enchantment within range' },
    { id: 'detect-invisible',      name: 'Detect Invisible',      duration: "6 turns",   range: "10'/level", combatUse: COMBAT_USE.BOTH,        shortDesc: 'See invisible creatures and objects' },
    { id: 'esp',                   name: 'ESP',                   duration: "12 turns",  range: "60'",   combatUse: COMBAT_USE.BOTH,            shortDesc: 'Detect surface thoughts of 1 creature; 1 turn to lock on' },
    { id: 'invisibility',          name: 'Invisibility',          duration: "Permanent", range: "240'",  combatUse: COMBAT_USE.BOTH,            shortDesc: 'Invisible until next attack or dispelled; enemies at −4 to hit' },
    { id: 'knock',                 name: 'Knock',                 duration: "Immediate", range: "60'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Opens locked, held, or wizard-locked doors or chests' },
    { id: 'levitate',              name: 'Levitate',              duration: "6 turns + 1/level", range: "20'/level", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Float up or down at 6\'/round; cannot move horizontally' },
    { id: 'mu-locate-object',      name: 'Locate Object',         duration: "6 turns",   range: "60' + 10'/level", combatUse: COMBAT_USE.OUT_OF_COMBAT, shortDesc: 'Sense direction of a known object within range' },
    { id: 'mirror-image',          name: 'Mirror Image',          duration: "6 turns",   range: "0",     combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: '1d4 illusory duplicates; each absorbs 1 hit; lasts until dispelled' },
    { id: 'phantasmal-force',      name: 'Phantasmal Force',      duration: "Concentration", range: "240'", combatUse: COMBAT_USE.BOTH,         shortDesc: 'Illusion up to 240\'; deals real dmg if believed; save vs Spells to disbelieve' },
    { id: 'web',                   name: 'Web',                   duration: "48 turns",  range: "10'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: '10\'×10\'×20\' area; save vs Spells or stuck 2d4 turns; flammable (2 rounds)' },
    { id: 'wizard-lock',           name: 'Wizard Lock',           duration: "Permanent", range: "10'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Locks a door, gate, or portal; requires dispel magic or knock' },
  ],
  // 3rd level
  [
    { id: 'clairvoyance',                     name: 'Clairvoyance',                     duration: "12 turns", range: "60'",  combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'See through a known location up to 60\' away' },
    { id: 'dispel-magic',                     name: 'Dispel Magic',                     duration: "Instant",  range: "120'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Remove all magic in 20\' radius; 50%+5%/level above target level' },
    { id: 'fire-ball',                        name: 'Fire Ball',                        duration: "Instant",  range: "240'", combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '6d6 fire in 20\' radius sphere; save vs Spells for half' },
    { id: 'fly',                              name: 'Fly',                              duration: "1d6 turns + 1/level", range: "Touch", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Fly at 120\' per turn (40\' per round); duration is secret' },
    { id: 'haste',                            name: 'Haste',                            duration: "3 turns",  range: "240'", combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '2× speed and attacks for 3 turns; ages target 1 year' },
    { id: 'mu-hold-person',                   name: 'Hold Person',                      duration: "1 turn/level", range: "120'", combatUse: COMBAT_USE.COMBAT_ONLY, shortDesc: '1–4 humanoids; save vs Spells or paralyzed' },
    { id: 'infravision',                      name: 'Infravision',                      duration: "1 day",    range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Grant 60\' infravision for 1 day' },
    { id: 'invisibility-10-radius',           name: "Invisibility 10' Radius",          duration: "Permanent", range: "240'", combatUse: COMBAT_USE.BOTH,          shortDesc: 'All within 10\' of target invisible until they attack or cast' },
    { id: 'lightning-bolt',                   name: 'Lightning Bolt',                   duration: "Instant",  range: "180'", combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '6d6 lightning, 60\' line; bounces off walls; save vs Spells for half' },
    { id: 'protection-from-evil-10-radius',   name: "Protection from Evil 10' Radius",  duration: "12 turns", range: "0",    combatUse: COMBAT_USE.BOTH,           shortDesc: '+1 AC and saves to all within 10\'; blocks summoned/enchanted attackers' },
    { id: 'protection-from-normal-missiles',  name: 'Protection from Normal Missiles',  duration: "12 turns", range: "30'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: 'Immune to all non-magical ranged attacks' },
    { id: 'water-breathing',                  name: 'Water Breathing',                  duration: "1 day",    range: "30'",  combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Breathe underwater freely for 1 day' },
  ],
  // 4th level
  [
    { id: 'charm-monster',         name: 'Charm Monster',         duration: "Special",     range: "120'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '1 monster (or 3d6 clumped ≤3 HD); save vs Spells or charmed' },
    { id: 'confusion',             name: 'Confusion',             duration: "12 rounds",   range: "120'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '2d8 creatures in 60\' area; save vs Spells each round or act randomly' },
    { id: 'dimension-door',        name: 'Dimension Door',        duration: "Instant",     range: "10'",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'Teleport up to 360\' to a precisely named location' },
    { id: 'growth-of-plants',      name: 'Growth of Plants',      duration: "Permanent",   range: "120'",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Entangle up to 3,000 sq ft of plants; impassable thicket' },
    { id: 'hallucinatory-terrain', name: 'Hallucinatory Terrain', duration: "Until touched", range: "240'", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Make one type of terrain appear as another' },
    { id: 'massmorph',             name: 'Massmorph',             duration: "Until dispelled", range: "240'", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Up to 100 creatures appear as trees; no concentration needed' },
    { id: 'polymorph-others',      name: 'Polymorph Others',      duration: "Permanent",   range: "60'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '1 target; save vs Spells or polymorphed into any creature' },
    { id: 'polymorph-self',        name: 'Polymorph Self',        duration: "6 turns + 1/level", range: "0", combatUse: COMBAT_USE.BOTH,         shortDesc: 'Take any creature form; gain movement but not attacks or abilities' },
    { id: 'remove-curse',          name: 'Remove Curse',          duration: "Permanent",   range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Remove one curse from a creature or object' },
    { id: 'wall-of-fire',          name: 'Wall of Fire',          duration: "Concentration", range: "60'", combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '70\'×10\' wall or 20\' ring; 1d6+1 passing through; undead 3d6; concentration' },
    { id: 'wall-of-ice',           name: 'Wall of Ice',           duration: "12 turns",    range: "60'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '70\'×10\' wall or 20\' ring; shattering deals 2d6 cold to adjacent creatures' },
    { id: 'wizard-eye',            name: 'Wizard Eye',            duration: "6 turns",     range: "240'",  combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Invisible eye moves at 120\'/turn, allows caster to see through it' },
  ],
  // 5th level
  [
    { id: 'animate-dead',          name: 'Animate Dead',          duration: "Permanent",   range: "60'",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'Animate 1 HD/caster level as obedient skeletons or zombies' },
    { id: 'cloudkill',             name: 'Cloudkill',             duration: "6 turns",     range: "30'",   combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '30\'×20\'×20\' cloud; ≤4 HD die instantly, 4–5 HD save vs Death; moves 20\'/round' },
    { id: 'conjure-elemental',     name: 'Conjure Elemental',     duration: "Concentration", range: "240'", combatUse: COMBAT_USE.MOSTLY_COMBAT, shortDesc: 'Summon 16 HD elemental; must concentrate to control; uncontrolled if distracted' },
    { id: 'contact-higher-plane',  name: 'Contact Higher Plane',  duration: "Special",     range: "0",     combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Ask up to 1 yes/no question per 2 planes contacted; risk of insanity' },
    { id: 'feeblemind',            name: 'Feeblemind',            duration: "Permanent",   range: "240'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '1 spell caster; save vs Spells −4 or loses spellcasting permanently' },
    { id: 'hold-monster',          name: 'Hold Monster',          duration: "1 turn/level", range: "120'", combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '1–4 monsters; save vs Spells or paralyzed' },
    { id: 'magic-jar',             name: 'Magic Jar',             duration: "Special",     range: "30'",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'Transfer life force to a jar; possess bodies within 120\'' },
    { id: 'pass-wall',             name: 'Pass-Wall',             duration: "3 turns",     range: "30'",   combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Open a 10\' deep hole through solid rock' },
    { id: 'telekinesis',           name: 'Telekinesis',           duration: "6 rounds",    range: "120'",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Move up to 20 lbs/level; hurled as weapon: 1d6 per 20 lbs' },
    { id: 'teleport',              name: 'Teleport',              duration: "Instant",     range: "Touch", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Teleport to a known location; risk of death based on familiarity' },
    { id: 'transmute-rock-to-mud', name: 'Transmute Rock to Mud', duration: "3d6 days",   range: "120'",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Turn up to 3,000 sq ft of rock to mud; movement reduced 90%' },
    { id: 'wall-of-stone',         name: 'Wall of Stone',         duration: "Permanent",   range: "60'",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'Create a stone wall up to 1,000 sq ft per caster level' },
  ],
  // 6th level
  [
    { id: 'anti-magic-shell',  name: 'Anti-Magic Shell',  duration: "12 turns",    range: "0",    combatUse: COMBAT_USE.BOTH,           shortDesc: '10\' radius sphere around caster; all magic negated within' },
    { id: 'control-weather',   name: 'Control Weather',   duration: "Concentration", range: "0",  combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Change weather in a large area; takes 10 minutes; outdoor only' },
    { id: 'death-spell',       name: 'Death Spell',       duration: "Instant",     range: "240'", combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '2d8×10 HP of creatures ≤8 HD in 60\' area die; no save' },
    { id: 'disintegrate',      name: 'Disintegrate',      duration: "Instant",     range: "60'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '1 target creature or object; save vs Death or disintegrated' },
    { id: 'geas',              name: 'Geas',              duration: "Special",     range: "30'",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Compel creature to complete a task; death if abandoned' },
    { id: 'invisible-stalker', name: 'Invisible Stalker', duration: "Special",     range: "10'",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Summon invisible 8 HD servant to complete one task' },
    { id: 'lower-water',       name: 'Lower Water',       duration: "10 turns",    range: "240'", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Lower water depth by half in up to 10,000 sq ft' },
    { id: 'move-earth',        name: 'Move Earth',        duration: "6 turns",     range: "240'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Reshape earth/soil in a large area; up to 60\'/turn' },
    { id: 'part-water',        name: 'Part Water',        duration: "6 turns",     range: "120'", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Part a body of water to create a path through it' },
    { id: 'projected-image',   name: 'Projected Image',   duration: "6 turns",     range: "240'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Illusory duplicate of caster; spells appear to originate from it' },
    { id: 'reincarnation',     name: 'Reincarnation',     duration: "Permanent",   range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT, shortDesc: 'Restore a just-dead character in a random new body' },
  ],
]

export const druidSpellsByLevel: readonly (readonly SpellDefinition[])[] = [
  // 1st level
  [
    { id: 'animal-friendship',       name: 'Animal Friendship',       duration: "Permanent",   range: "10'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Befriend 1 normal animal permanently if it fails save' },
    { id: 'detect-danger',           name: 'Detect Danger',           duration: "3 turns",     range: "0",     combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Detect danger (traps, dangerous creatures) within 60\'' },
    { id: 'entangle',                name: 'Entangle',                duration: "1 turn",      range: "80'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: 'All in 20\' radius; save vs Spells or immobilized 1 turn; success: move at half speed' },
    { id: 'faerie-fire',             name: 'Faerie Fire',             duration: "1 turn",      range: "80'",   combatUse: COMBAT_USE.BOTH,            shortDesc: 'Targets outlined; counters invisibility; +2 to hit in low light' },
    { id: 'invisibility-to-animals', name: 'Invisibility to Animals', duration: "1 turn + 1/level", range: "Touch", combatUse: COMBAT_USE.BOTH,     shortDesc: 'Animals ignore up to 1 creature/level; broken if they attack' },
    { id: 'locate-plant-or-animal',  name: 'Locate Plant or Animal',  duration: "3 turns",     range: "Special", combatUse: COMBAT_USE.OUT_OF_COMBAT, shortDesc: 'Sense direction of a known species of plant or animal' },
    { id: 'predict-weather',         name: 'Predict Weather',         duration: "Instant",     range: "0",     combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Perfectly predict weather for next 12 hours in local area' },
    { id: 'speak-with-animals',      name: 'Speak with Animals',      duration: "6 turns",     range: "30'",   combatUse: COMBAT_USE.BOTH,            shortDesc: 'Converse with normal animals; ask favours (reaction roll applies)' },
  ],
  // 2nd level
  [
    { id: 'barkskin',          name: 'Barkskin',          duration: "1 turn/level", range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: '+1 AC and +1 to all non-magical saves for 1 turn per level' },
    { id: 'create-water',      name: 'Create Water',      duration: "Permanent",   range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Create up to 50 gallons of pure water' },
    { id: 'cure-light-wounds', name: 'Cure Light Wounds', duration: "Permanent",   range: "Touch", combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: 'Heal 1d6+1 HP; or reverse to cause same damage (save vs Spells)' },
    { id: 'heat-metal',        name: 'Heat Metal',        duration: "7 rounds",    range: "30'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Metal on 1 creature/2 levels heats (1d3–1d6 dmg); white hot: save or disabled' },
    { id: 'obscuring-mist',    name: 'Obscuring Mist',    duration: "4 rounds/level", range: "0", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Dense mist fills a 30\' radius; blocks missile fire and spells' },
    { id: 'produce-flame',     name: 'Produce Flame',     duration: "2 turns/level", range: "0",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Flame in hand; touch for 1d4 dmg; throw 40\' for 1d4 dmg' },
    { id: 'slow-poison',       name: 'Slow Poison',       duration: "24 hours",    range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Slow poison for 24 hours; must cure before the time is up' },
    { id: 'warp-wood',         name: 'Warp Wood',         duration: "Permanent",   range: "240'",  combatUse: COMBAT_USE.BOTH,           shortDesc: '1 arrow/level warped useless; bows count as 4; magic items may resist' },
  ],
  // 3rd level
  [
    { id: 'call-lightning',         name: 'Call Lightning',         duration: "1 turn/level", range: "360'", combatUse: COMBAT_USE.COMBAT_ONLY,   shortDesc: '8d6 lightning per strike (1/turn); save vs Spells for half; requires storm clouds' },
    { id: 'growth-of-nature',       name: 'Growth of Nature',       duration: "Special",      range: "120'", combatUse: COMBAT_USE.BOTH,          shortDesc: 'Double animal size/damage (12 turns) OR create impassable thorny jungle' },
    { id: 'hold-animal',            name: 'Hold Animal',            duration: "1 turn/level", range: "180'", combatUse: COMBAT_USE.COMBAT_ONLY,   shortDesc: 'Up to 1 HD/level of normal/giant animals; save vs Spells or paralyzed' },
    { id: 'protection-from-poison', name: 'Protection from Poison', duration: "1 turn/level", range: "Touch", combatUse: COMBAT_USE.BOTH,         shortDesc: 'Immunity to all poisons for duration' },
    { id: 'tree-shape',             name: 'Tree Shape',             duration: "1 turn/level", range: "0",    combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Appear as a small tree; still aware of surroundings' },
    { id: 'water-breathing',        name: 'Water Breathing',        duration: "1 day",        range: "30'",  combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Breathe underwater freely for 1 day' },
  ],
  // 4th level
  [
    { id: 'cure-serious-wounds',                name: 'Cure Serious Wounds',                duration: "Permanent",   range: "Touch",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: 'Heal 2d6+2 HP; or reverse to cause same damage (save vs Spells)' },
    { id: 'dispel-magic',                       name: 'Dispel Magic',                       duration: "Instant",     range: "120'",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'Remove all magic in 20\' cube; 5%/level fail chance if target\'s caster is higher level' },
    { id: 'protection-from-fire-and-lightning', name: 'Protection from Fire and Lightning', duration: "1 turn/level", range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Immune to normal fire/lightning; +4 save, half damage from magical' },
    { id: 'speak-with-plants',                  name: 'Speak with Plants',                  duration: "3 turns",     range: "30'",    combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Converse with plants; ask them to make way or similar favours' },
    { id: 'summon-animals',                     name: 'Summon Animals',                     duration: "Special",     range: "30'",    combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Summon animals with total HD = caster level; attack enemies if caster attacked' },
    { id: 'temperature-control',                name: 'Temperature Control',                duration: "4 turns",     range: "240'",   combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Control temperature in a 30\' area (extreme heat or cold possible)' },
  ],
  // 5th level
  [
    { id: 'commune-with-nature',                name: 'Commune with Nature',                duration: "Instant",     range: "0",     combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Learn terrain and lore within miles; 1 fact per level' },
    { id: 'control-weather',                    name: 'Control Weather',                    duration: "Concentration", range: "0",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'Create fog/high winds/tornado (2d8 dmg, 75% hull dmg); outdoor only' },
    { id: 'pass-plant',                         name: 'Pass Plant',                         duration: "Special",     range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Enter a tree and exit from another tree of same species within 300 miles' },
    { id: 'protection-from-plants-and-animals', name: 'Protection from Plants and Animals', duration: "1 turn/level", range: "Touch", combatUse: COMBAT_USE.BOTH,         shortDesc: 'Plants and animals cannot harm, block, or follow the protected creature' },
    { id: 'transmute-rock-to-mud',              name: 'Transmute Rock to Mud',              duration: "3d6 days",    range: "120'",  combatUse: COMBAT_USE.BOTH,           shortDesc: '3,000 sq ft rock to mud; movement reduced 90% in mud' },
    { id: 'wall-of-thorns',                     name: 'Wall of Thorns',                     duration: "1 turn/level", range: "60'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Up to 1,200 sq ft thorn wall; 1d8 + AC dmg per 10\' pushed through' },
  ],
]

export const illusionistSpellsByLevel: readonly (readonly SpellDefinition[])[] = [
  // 1st level
  [
    { id: 'auditory-illusion', name: 'Auditory Illusion', duration: "Concentration", range: "60'/level", combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Create sounds from a chosen location; concentration' },
    { id: 'chromatic-orb',    name: 'Chromatic Orb',     duration: "Special",       range: "30'",       combatUse: COMBAT_USE.COMBAT_ONLY,     shortDesc: '1d4–2d8 dmg unerringly (scales with level/gem); secondary effect by colour' },
    { id: 'colour-spray',     name: 'Colour Spray',      duration: "Special",       range: "0",         combatUse: COMBAT_USE.COMBAT_ONLY,     shortDesc: '1d6 creatures in 60\' cone; HD ≤ caster: unconscious; higher HD: blind or stunned' },
    { id: 'dancing-lights',   name: 'Dancing Lights',    duration: "2 turns",       range: "40'/level", combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Up to 4 lights (torches, lanterns, or glowing orbs); fully controllable' },
    { id: 'detect-illusion',  name: 'Detect Illusion',   duration: "2 turns + 1/level", range: "0",    combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'See through illusions in a 10\' wide path' },
    { id: 'glamour',          name: 'Glamour',           duration: "Special",       range: "10'",       combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Make a creature or object appear different; save vs Spells to disbelieve' },
    { id: 'hypnotism',        name: 'Hypnotism',         duration: "1 round/level", range: "30'",       combatUse: COMBAT_USE.BOTH,            shortDesc: 'Up to 1d6 creatures; save vs Spells or obey suggestion while in range' },
    { id: 'light',            name: 'Light',             duration: "6 turns",       range: "120'",      combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: '15\' radius light; or blind a target (save vs Spells)' },
    { id: 'phantasmal-force', name: 'Phantasmal Force',  duration: "Concentration", range: "240'",      combatUse: COMBAT_USE.BOTH,            shortDesc: 'Illusory monster (AC 9), attack, or scene; save vs Spells negates' },
    { id: 'read-magic',       name: 'Read Magic',        duration: "1 turn",        range: "0",         combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Decipher magical writing on scrolls or spellbooks' },
    { id: 'spook',            name: 'Spook',             duration: "Special",       range: "10'",       combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: '1 intelligent creature; save vs Spells or flee until further saves succeed' },
    { id: 'wall-of-fog',      name: 'Wall of Fog',       duration: "4 rounds/level", range: "30'",      combatUse: COMBAT_USE.BOTH,            shortDesc: 'Thick fog wall blocks sight; dissipates in wind' },
  ],
  // 2nd level
  [
    { id: 'blindness-deafness',        name: 'Blindness / Deafness',        duration: "Permanent",   range: "30'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: '1 creature; save vs Spells or permanently blinded or deafened' },
    { id: 'blur',                      name: 'Blur',                        duration: "3 rounds + 1/level", range: "0", combatUse: COMBAT_USE.MOSTLY_COMBAT, shortDesc: 'Attackers at −4 to hit caster (−2 on subsequent attacks); +1 to saves' },
    { id: 'detect-magic',              name: 'Detect Magic',                duration: "2 turns",     range: "60'",   combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Reveal all magic auras in range' },
    { id: 'false-aura',                name: 'False Aura',                  duration: "Permanent",   range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Make a magical item appear non-magical or vice versa' },
    { id: 'fascinate',                 name: 'Fascinate',                   duration: "1 turn/level", range: "30'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: '1 creature; save vs Spells or besotted with caster; obeys commands (CHA check)' },
    { id: 'hypnotic-pattern',          name: 'Hypnotic Pattern',            duration: "Concentration", range: "30'", combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: 'Up to 24 HD of creatures; save vs Spells or entranced while watching' },
    { id: 'improved-phantasmal-force', name: 'Improved Phantasmal Force',   duration: "Concentration + 2 rounds", range: "240'", combatUse: COMBAT_USE.BOTH, shortDesc: 'Illusory monster (AC 7), attack, or scene + sounds; persists briefly after concentration' },
    { id: 'invisibility',              name: 'Invisibility',                duration: "Permanent",   range: "240'",  combatUse: COMBAT_USE.BOTH,            shortDesc: 'Invisible until next attack or dispelled; enemies at −4 to hit' },
    { id: 'magic-mouth',               name: 'Magic Mouth',                 duration: "Special",     range: "10'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Store a message; triggers when a set condition is met' },
    { id: 'mirror-image',              name: 'Mirror Image',                duration: "6 turns",     range: "0",     combatUse: COMBAT_USE.MOSTLY_COMBAT,   shortDesc: '1d4 illusory duplicates; each absorbs 1 hit; lasts 6 turns' },
    { id: 'quasimorph',                name: 'Quasimorph',                  duration: "1 turn/level", range: "0",    combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Alter one physical feature of self (eyes, voice, skin, etc.)' },
    { id: 'whispering-wind',           name: 'Whispering Wind',             duration: "Special",     range: "1 mile/level", combatUse: COMBAT_USE.OUT_OF_COMBAT, shortDesc: 'Send a 25-word message to a known location; arrives within 1 hour' },
  ],
  // 3rd level
  [
    { id: 'blacklight',             name: 'Blacklight',             duration: "1 turn/level", range: "0",    combatUse: COMBAT_USE.BOTH,           shortDesc: 'Only caster sees; others in 30\' radius in magical darkness' },
    { id: 'dispel-illusion',        name: 'Dispel Illusion',        duration: "Instant",      range: "120'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'End all illusions in 20\' cube; auto vs non-illusionists; 5%/level fail vs higher' },
    { id: 'fear',                   name: 'Fear',                   duration: "1 round/level", range: "0",   combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '60\' cone; save vs Spells or flee; 60% chance to drop held items' },
    { id: 'hallucinatory-terrain',  name: 'Hallucinatory Terrain',  duration: "Until touched", range: "240'", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Make one type of terrain appear as another' },
    { id: 'invisibility-10-radius', name: "Invisibility 10' Radius", duration: "Permanent",   range: "240'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'All within 10\' invisible; broken per individual when they attack or cast' },
    { id: 'nondetection',           name: 'Nondetection',           duration: "1 turn/level", range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Shield creature from clairvoyance, ESP, and divination magic' },
    { id: 'paralysation',           name: 'Paralysation',           duration: "6 turns",      range: "60'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: 'Up to 2 HD/level in 20\' cube; save vs Spells or paralyzed; lowest HD first' },
    { id: 'phantom-steed',          name: 'Phantom Steed',          duration: "1 hour/level", range: "10'",  combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Summon a horse-like mount; 240\' MV; only caster can ride' },
    { id: 'rope-trick',             name: 'Rope Trick',             duration: "2 turns/level", range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT, shortDesc: 'Rope hangs into extra-dimensional space; up to 8 creatures may hide there' },
    { id: 'spectral-force',         name: 'Spectral Force',         duration: "Concentration + 3 rounds", range: "60'", combatUse: COMBAT_USE.BOTH, shortDesc: 'Illusory monster (AC 5), attack, or scene + sound/smell/heat; persists briefly after' },
    { id: 'suggestion',             name: 'Suggestion',             duration: "Special",      range: "30'",  combatUse: COMBAT_USE.BOTH,           shortDesc: '1 creature; save vs Spells (−2 if reasonable) or follow suggestion for duration' },
    { id: 'wraithform',             name: 'Wraithform',             duration: "1 turn/level", range: "0",    combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Caster semi-ethereal; only ethereal/magic can harm; undead ignore caster' },
  ],
  // 4th level
  [
    { id: 'confusion',             name: 'Confusion',             duration: "12 rounds",    range: "120'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '3d6 creatures confused 12 rounds; only high HD creatures may save' },
    { id: 'dispel-magic',          name: 'Dispel Magic',          duration: "Instant",      range: "120'",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Remove all magic in 20\' cube; 5%/level fail chance if target\'s caster is higher level' },
    { id: 'emotion',               name: 'Emotion',               duration: "Concentration", range: "40'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '40\' sq; save vs Spells or fear/hate (+2 atk)/hopelessness/rage (+1 hit, +3 dmg)' },
    { id: 'illusory-stamina',      name: 'Illusory Stamina',      duration: "Special",      range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: '4 creatures gain bonus HP = 50% of missing HP; absorbed first; removed when spell ends' },
    { id: 'improved-invisibility', name: 'Improved Invisibility', duration: "4 rounds + 1/level", range: "Touch", combatUse: COMBAT_USE.MOSTLY_COMBAT, shortDesc: 'May attack while invisible; if detected: +4 AC and saves' },
    { id: 'massmorph',             name: 'Massmorph',             duration: "Until dispelled", range: "240'", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Up to 100 creatures appear as trees; no concentration needed' },
    { id: 'minor-creation',        name: 'Minor Creation',        duration: "1 hour/level", range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Create a non-magical vegetable matter object up to 1 cubic foot/level' },
    { id: 'phantasmal-killer',     name: 'Phantasmal Killer',     duration: "1 round/level", range: "60'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '1 creature; save vs Spells (+2) or nightmare pursues; one hit = instant death' },
    { id: 'rainbow-pattern',       name: 'Rainbow Pattern',       duration: "Special",      range: "30'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Up to 24 HD; save vs Spells or entranced; pattern may lead them away' },
    { id: 'shadow-monsters',       name: 'Shadow Monsters',       duration: "1 round/level", range: "30'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Up to caster-level HD of shadow monsters; 1d2 HP/HD; fail save: real dmg; pass: ¼ dmg' },
    { id: 'solid-fog',             name: 'Solid Fog',             duration: "2 rounds/level", range: "30'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Fog blocks vision; creatures move at 1/10 rate; only strong winds can dispel' },
    { id: 'veil-of-abandonment',   name: 'Veil of Abandonment',   duration: "Special",      range: "30'",   combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Target believes all allies have abandoned them; −2 to all rolls' },
  ],
  // 5th level
  [
    { id: 'chaos',                  name: 'Chaos',                  duration: "12 rounds",   range: "0",     combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: 'All in 60\' diameter confused 12 rounds; only illusionists may save' },
    { id: 'demi-shadow-monsters',   name: 'Demi-Shadow Monsters',   duration: "1 round/level", range: "30'", combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Up to caster-level HD; 1d4 HP/HD; fail save: real dmg; pass save: ½ dmg' },
    { id: 'illusion',               name: 'Illusion',               duration: "1 round/level", range: "60'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Illusory monster (AC 5), attack, or scene + sound/smell/heat; autonomous, no concentration' },
    { id: 'looking-glass',          name: 'Looking Glass',          duration: "1 hour/level", range: "Special", combatUse: COMBAT_USE.OUT_OF_COMBAT, shortDesc: 'Remote viewing window into any known location' },
    { id: 'major-creation',         name: 'Major Creation',         duration: "Special",     range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Create any non-magical material object up to 1 cubic foot/level' },
    { id: 'maze-of-mirrors',        name: 'Maze of Mirrors',        duration: "Special",     range: "60'",   combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '1 creature trapped in mirror maze; duration by INT (1d4 rounds to 2d4 turns)' },
    { id: 'projected-image',        name: 'Projected Image',        duration: "1 turn/level", range: "240'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Illusory caster duplicate; spells appear to originate from it; vanishes if touched' },
    { id: 'seeming',                name: 'Seeming',                duration: "1 turn/level", range: "30'",  combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Change appearance of up to 1 creature/2 levels' },
    { id: 'shadowcast',             name: 'Shadowcast',             duration: "1 round/level", range: "60'", combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Any spell of 4th level or below as a shadow; targets must save or treat it as real' },
    { id: 'shadowy-transformation', name: 'Shadowy Transformation', duration: "1 turn/level", range: "Touch", combatUse: COMBAT_USE.MOSTLY_COMBAT, shortDesc: 'Target insubstantial; only ethereal/magic can harm; undead ignore; save to resist' },
    { id: 'time-flow',              name: 'Time Flow',              duration: "1 round/level", range: "60'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Alter apparent flow of time in a 20\' area; haste or slow targets as desired' },
    { id: 'visitation',             name: 'Visitation',             duration: "Special",     range: "Special", combatUse: COMBAT_USE.OUT_OF_COMBAT, shortDesc: 'Project illusory double to any known location; can speak and see but not interact' },
  ],
  // 6th level
  [
    { id: 'acid-fog',                  name: 'Acid Fog',                  duration: "1 round/level", range: "30'",    combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Fog bank; 1/2/4/8 acid dmg per round; blocks vision; move at 1/10 rate' },
    { id: 'dream-quest',               name: 'Dream Quest',               duration: "Special",       range: "Special", combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: '1 creature; save vs Spells or compelled to complete quest or lose 1 HP/day' },
    { id: 'impersonation',             name: 'Impersonation',             duration: "1 hour/level",  range: "0",       combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Perfectly impersonate a known individual in appearance, voice, and manner' },
    { id: 'manifest-dream',            name: 'Manifest Dream',            duration: "1 turn/level",  range: "60'",     combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: 'Project dream images into the real world; concentration' },
    { id: 'mass-suggestion',           name: 'Mass Suggestion',           duration: "Special",       range: "90'",     combatUse: COMBAT_USE.BOTH,           shortDesc: '1 creature/level; save vs Spells (−2 if reasonable) or follow suggestion' },
    { id: 'mislead',                   name: 'Mislead',                   duration: "1 round/level", range: "0",       combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Illusory double acts independently; caster invisible and may attack; +4 AC/saves if detected' },
    { id: 'permanent-illusion',        name: 'Permanent Illusion',        duration: "Permanent",     range: "60'",     combatUse: COMBAT_USE.BOTH,           shortDesc: 'Permanent illusory monster (AC 5) or scene + sound/smell/heat; autonomous' },
    { id: 'shades',                    name: 'Shades',                    duration: "1 round/level", range: "30'",     combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Up to caster-level HD; 1d6 HP/HD; fail save: real dmg; pass save: ¾ dmg' },
    { id: 'through-the-looking-glass', name: 'Through the Looking Glass', duration: "1 round/level", range: "Special", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Scrying mirror; caster may step in; portal closes at end (save vs death or lost to another plane)' },
    { id: 'triggered-illusion',        name: 'Triggered Illusion',        duration: "Special",       range: "60'",     combatUse: COMBAT_USE.BOTH,           shortDesc: 'Triggers illusory monster (AC 5) or scene when condition met; lasts 1 round/level' },
    { id: 'true-seeing',               name: 'True Seeing',               duration: "1 round/level", range: "Touch",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'See through illusions, invisible creatures, disguises, and into the ethereal' },
    { id: 'vision',                    name: 'Vision',                    duration: "Special",       range: "0",       combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Ask a question about a creature, object, or location; risk of powerful reaction' },
  ],
]

// TODO: The descriptions/duration/range/combatUse for these spells are all
// likely hallucinated.
export const necromancerSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { id: 'chill-touch',          name: 'Chill Touch',           duration: "1 round/level", range: "Touch",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: 'Touch attack; save vs Death or −1 STR (temporary)' },
  { id: 'command-dead',         name: 'Command Dead',          duration: "1 day/level",   range: "60'",    combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Control undead up to 2×caster level HD; no save; obey commands' },
  { id: 'corpse-visage',        name: 'Corpse Visage',         duration: "1 hour/level",  range: "0",      combatUse: COMBAT_USE.BOTH,           shortDesc: 'Appear as a decomposed corpse; undead and those fearing undead react accordingly' },
  { id: 'decay',                name: 'Decay',                 duration: "Permanent",     range: "Touch",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Touch; living: save vs Death or lose 1d6 CON; organic objects rot' },
  { id: 'deathlight',           name: 'Deathlight',            duration: "Instant",       range: "0",      combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '60\' cone; save vs Death or slain; undead immune' },
  { id: 'detect-undead',        name: 'Detect Undead',         duration: "3 turns",       range: "0",      combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Detect presence and HD of undead within 60\'' },
  { id: 'marionette',           name: 'Marionette',            duration: "1 hour/level",  range: "10'",    combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Animate and fully control 1 humanoid corpse as a zombie' },
  { id: 'pass-undead',          name: 'Pass Undead',           duration: "1 turn/level",  range: "0",      combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Undead ignore a number of creatures equal to caster level' },
  { id: 'protection-from-evil', name: 'Protection from Evil',  duration: "6 turns",       range: "Touch",  combatUse: COMBAT_USE.BOTH,           shortDesc: '+1 AC and saves; blocks summoned/enchanted creatures from attacking' },
  { id: 'read-magic',           name: 'Read Magic',            duration: "1 turn",        range: "0",      combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Decipher magical writing on scrolls or spellbooks' },
  { id: 'skull-speech',         name: 'Skull Speech',          duration: "1 turn",        range: "10'",    combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Speak with a skull to learn information from the deceased' },
  { id: 'undead-servitor',      name: 'Undead Servitor',       duration: "Permanent",     range: "10'",    combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Animate 1 undead ≤4 HD; serves permanently or until destroyed' },
]]

// TODO: The descriptions/duration/range/combatUse for these spells are all
// likely hallucinated.
export const runesmithSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { id: 'rune-of-alarm',    name: 'Rune of Alarm',    duration: "Until triggered", range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Silent or audible alarm when triggered; conditions set at casting' },
  { id: 'rune-of-ale',      name: 'Rune of Ale',      duration: "Permanent",       range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Bless a cask of ale; all who drink gain +1 to saves for 24 hours' },
  { id: 'rune-of-finding',  name: 'Rune of Finding',  duration: "Until found",     range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Mark an object; caster always knows its direction while on same plane' },
  { id: 'rune-of-fire',     name: 'Rune of Fire',     duration: "Until triggered", range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Inscribed trap; 3d6 fire when triggered; save vs Spells for half' },
  { id: 'rune-of-grounding',name: 'Rune of Grounding',duration: "1 day",           range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Self: immune to electrical damage for 1 day' },
  { id: 'rune-of-healing',  name: 'Rune of Healing',  duration: "1 day",           range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Inscribe healing rune; activates on touch to heal 1d6+1 HP' },
  { id: 'rune-of-luck',     name: 'Rune of Luck',     duration: "1 day",           range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Bearer may re-roll one die roll; rune fades after use' },
  { id: 'rune-of-the-forge',name: 'Rune of the Forge',duration: "Permanent",       range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Inscribe rune to strengthen a metal item; +1 to saves vs damage' },
  { id: 'rune-of-shielding',name: 'Rune of Shielding',duration: "1 turn",          range: "Touch", combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Self: +2 AC for 1 turn' },
  { id: 'rune-of-thunder',  name: 'Rune of Thunder',  duration: "Instant",         range: "30'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '30\' radius; 1d6+1 sonic dmg; save vs Spells or deafened 1d4 rounds' },
  { id: 'rune-of-slaying',  name: 'Rune of Slaying',  duration: "1 turn",          range: "Touch", combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Enchant weapon: +1 to hit and dmg; ×2 dmg to target creature type' },
  { id: 'rune-of-warding',  name: 'Rune of Warding',  duration: "Until triggered", range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Inscribed trap; triggered creature takes 1d10 dmg; save vs Spells for half' },
]]

/**
 * Cleric spells organised by spell level (0-indexed: index 0 = 1st-level spells).
 * Reversible spells note the reversed form in shortDesc where relevant.
 * Source: OSE SRD.
 */
export const clericSpellsByLevel: readonly (readonly SpellDefinition[])[] = [
  // 1st level
  [
    { id: 'cure-light-wounds',            name: 'Cure Light Wounds',            duration: "Instant",   range: "Touch",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Heal 1d6+1 HP or cure paralysis; reverse: cause 1d6+1 dmg (melee attack)' },
    { id: 'cleric-detect-evil',           name: 'Detect Evil',                  duration: "6 turns",   range: "120'",   combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Objects under evil enchantment and creatures with evil intent glow' },
    { id: 'detect-magic',                 name: 'Detect Magic',                 duration: "2 turns",   range: "60'",    combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: 'Reveal all magic auras in range' },
    { id: 'cleric-light',                 name: 'Light',                        duration: "12 turns",  range: "120'",   combatUse: COMBAT_USE.MOSTLY_UTILITY,  shortDesc: '15\' radius light or blind target (save vs Spells); reverse: 15\' magical darkness' },
    { id: 'cleric-protection-from-evil',  name: 'Protection from Evil',         duration: "12 turns",  range: "0",      combatUse: COMBAT_USE.BOTH,            shortDesc: '+1 saves, −1 to enemy attacks; blocks summoned/enchanted melee attacks' },
    { id: 'purify-food-and-water',        name: 'Purify Food and Water',        duration: "Permanent", range: "10'",    combatUse: COMBAT_USE.OUT_OF_COMBAT,   shortDesc: 'Purify contaminated food/water: 6 qt drink, 1 ration, or food for 12 people' },
    { id: 'remove-fear',                  name: 'Remove Fear',                  duration: "2 turns",   range: "Touch",  combatUse: COMBAT_USE.BOTH,            shortDesc: 'Purge fear; dispel magical fear (+1/level to save); reverse: cause fear at 120\'' },
    { id: 'resist-cold',                  name: 'Resist Cold',                  duration: "6 turns",   range: "30'",    combatUse: COMBAT_USE.BOTH,            shortDesc: 'Immune to non-magical cold; +2 saves vs magical cold; −1/die cold damage' },
  ],
  // 2nd level
  [
    { id: 'bless',                name: 'Bless',                  duration: "6 turns",  range: "60'",   combatUse: COMBAT_USE.BOTH,           shortDesc: '+1 attack/damage/morale to allies in 20\' sq before melee; reverse: −1 penalty (save vs Spells)' },
    { id: 'find-traps',           name: 'Find Traps',             duration: "2 turns",  range: "30'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Trapped areas glow blue; reveals magical and mechanical traps; no disarming info' },
    { id: 'cleric-hold-person',   name: 'Hold Person',            duration: "9 turns",  range: "180'",  combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: '1 humanoid (save −2) or 1d4 humanoids; save vs Spells or paralyzed; ≤4+1 HD only' },
    { id: 'know-alignment',       name: 'Know Alignment',         duration: "1 round",  range: "10'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Reveal alignment of 1 creature, object, or area' },
    { id: 'resist-fire',          name: 'Resist Fire',            duration: "2 turns",  range: "30'",   combatUse: COMBAT_USE.BOTH,           shortDesc: 'Immune to non-magical fire; +2 saves vs magical fire; −1/die fire damage' },
    { id: 'silence-15-radius',    name: "Silence 15' Radius",     duration: "12 turns", range: "180'",  combatUse: COMBAT_USE.BOTH,           shortDesc: '15\' radius utter silence; spellcasting impossible; cast on creature (save vs Spells)' },
    { id: 'snake-charm',          name: 'Snake Charm',            duration: "1d4+1 rounds/turns", range: "60'", combatUse: COMBAT_USE.MOSTLY_COMBAT, shortDesc: 'Charm up to 1 HD/level of snakes; 1d4+1 rounds if attacking, turns if not' },
    { id: 'speak-with-animals',   name: 'Speak with Animals',     duration: "6 turns",  range: "30'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Converse with 1 type of normal/giant animal; may request services (reaction applies)' },
  ],
  // 3rd level
  [
    { id: 'continual-light',        name: 'Continual Light',   duration: "Permanent", range: "120'",  combatUse: COMBAT_USE.MOSTLY_UTILITY, shortDesc: '30\' radius permanent daylight; or permanently blind target (save vs Spells)' },
    { id: 'cure-disease',           name: 'Cure Disease',      duration: "Instant",   range: "30'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Cure any disease (incl. magical); kills green slime; reverse: wasting disease (2d12 days, save vs Spells)' },
    { id: 'growth-of-animal',       name: 'Growth of Animal',  duration: "12 turns",  range: "120'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '1 normal/giant animal: double size, damage, and carrying capacity' },
    { id: 'cleric-locate-object',   name: 'Locate Object',     duration: "6 turns",   range: "120'",  combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Sense direction of a general object type or specific visualised object' },
    { id: 'remove-curse',           name: 'Remove Curse',      duration: "Instant",   range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Remove one curse; reverse: curse (save vs Spells): −2 saves / −4 attack / −50% ability score' },
    { id: 'striking',               name: 'Striking',          duration: "1 turn",    range: "30'",   combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '1 weapon deals +1d6 damage and counts as magical for 1 turn' },
  ],
  // 4th level
  [
    { id: 'create-water',                    name: 'Create Water',                    duration: "Permanent", range: "Touch", combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Create ~50 gallons of water (sustains 12 humans + mounts for 1 day)' },
    { id: 'cure-serious-wounds',             name: 'Cure Serious Wounds',             duration: "Instant",   range: "Touch", combatUse: COMBAT_USE.COMBAT_ONLY,    shortDesc: 'Heal 2d6+2 HP; reverse causes same damage (save vs Spells)' },
    { id: 'neutralize-poison',               name: 'Neutralize Poison',               duration: "Instant",   range: "Touch", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Neutralize poison in creature or object; revive character dead ≤10 rounds from poison' },
    { id: 'protection-from-evil-10-radius',  name: "Protection from Evil 10' Radius", duration: "12 turns",  range: "0",    combatUse: COMBAT_USE.BOTH,           shortDesc: '+1 saves, −1 enemy attacks for all allies within 10\'; blocks summoned/enchanted melee' },
    { id: 'speak-with-plants',               name: 'Speak with Plants',               duration: "3 turns",   range: "30'",   combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Communicate with normal and monstrous plants; request simple favors' },
    { id: 'sticks-to-snakes',                name: 'Sticks to Snakes',                duration: "6 turns",   range: "120'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '2d8 sticks become 1 HD snakes (50% poisonous); follow caster; revert when killed' },
  ],
  // 5th level
  [
    { id: 'commune',        name: 'Commune',        duration: "3 turns",         range: "0",    combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Ask divine power 3 yes/no questions per casting (6 once/year); once per week only' },
    { id: 'create-food',    name: 'Create Food',    duration: "Permanent",       range: "0",    combatUse: COMBAT_USE.OUT_OF_COMBAT,  shortDesc: 'Conjure food sufficient for 12 humans + mounts for 1 day' },
    { id: 'dispel-evil',    name: 'Dispel Evil',    duration: "Concentration",   range: "30'",  combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: 'Banish/destroy enchanted or undead monsters (save vs Spells); or dispel a cursed item\'s hold' },
    { id: 'insect-plague',  name: 'Insect Plague',  duration: "Concentration",   range: "480'", combatUse: COMBAT_USE.MOSTLY_COMBAT,  shortDesc: '60\' diameter swarm; obscures vision; drives away ≤2 HD creatures; above ground only' },
    { id: 'quest',          name: 'Quest',          duration: "Until completed", range: "30'",  combatUse: COMBAT_USE.BOTH,           shortDesc: 'Compel 1 creature to complete a task or suffer a curse (save vs Spells negates)' },
    { id: 'raise-dead',     name: 'Raise Dead',     duration: "Instant",         range: "120'", combatUse: COMBAT_USE.BOTH,           shortDesc: 'Restore life (dead ≤4 days/level above 7th) or destroy 1 undead; reverse: instant death ray' },
  ],
]

const _allSpellsFlat: readonly SpellDefinition[] = [
  ...magicUserSpellsByLevel,
  ...illusionistSpellsByLevel,
  ...necromancerSpellsByLevel,
  ...runesmithSpellsByLevel,
  ...druidSpellsByLevel,
  ...clericSpellsByLevel,
].flat()

/**
 * All spells keyed by id for O(1) lookup.
 * Used by PDFExport to retrieve name/combatInfo for a stored spell id.
 */
export const allSpellsById: Readonly<Record<string, SpellDefinition>> = Object.fromEntries(
  _allSpellsFlat.map(spell => [spell.id, spell])
)

/**
 * All spells keyed by name for O(1) lookup.
 * Used by the normalization layer to migrate legacy saves that stored spell names.
 */
export const allSpellsByName: Readonly<Record<string, SpellDefinition>> = Object.fromEntries(
  _allSpellsFlat.map(spell => [spell.name, spell])
)

// TODO: Rename allSpellByName to spellNameToSpell, and get rid of this since spellNameToSpell[name].id is just as easy as spellNameToId[name].
/**
 * Map from spell name to spell id.
 * Used by the normalization layer to migrate legacy saves that stored spell names.
 */
export const spellNameToId: Readonly<Record<string, string>> = Object.fromEntries(
  _allSpellsFlat.map(spell => [spell.name, spell.id])
)

// ── Spell list registry ───────────────────────────────────────────────────────

export const SPELL_LIST_IDS = [
  'magic-user',
  'cleric',
  'druid',
  'illusionist',
  'necromancer',
  'runesmith',
] as const;

export type SpellListId = typeof SPELL_LIST_IDS[number];

export interface SpellListEntry {
  id: SpellListId;
  name: string;
  byLevel: readonly (readonly SpellDefinition[])[];
}

export const SPELL_LIST_REGISTRY: Readonly<Record<SpellListId, SpellListEntry>> = {
  'magic-user':  { id: 'magic-user',  name: 'Magic-User',  byLevel: magicUserSpellsByLevel },
  'cleric':      { id: 'cleric',      name: 'Cleric',      byLevel: clericSpellsByLevel },
  'druid':       { id: 'druid',       name: 'Druid',       byLevel: druidSpellsByLevel },
  'illusionist': { id: 'illusionist', name: 'Illusionist', byLevel: illusionistSpellsByLevel },
  'necromancer': { id: 'necromancer', name: 'Necromancer', byLevel: necromancerSpellsByLevel },
  'runesmith':   { id: 'runesmith',   name: 'Runesmith',   byLevel: runesmithSpellsByLevel },
};

export function getSpellListById(id: string): SpellListEntry | undefined {
  return SPELL_LIST_REGISTRY[id as SpellListId];
}