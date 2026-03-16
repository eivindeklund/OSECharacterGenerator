import type { SpellDefinition } from '../types'

/**
 * Magic-User spells organised by spell level (0-indexed: index 0 = 1st-level spells).
 * Each entry is a SpellDefinition object. combatInfo is included for spells with
 * direct combat application; absent for non-combat utility spells.
 * Source: OSE SRD.
 */
export const magicUserSpellsByLevel: readonly (readonly SpellDefinition[])[] = [
  // 1st level
  [
    { id: 'charm-person',          name: 'Charm Person',          combatInfo: '1 humanoid, save vs Spells or treats caster as trusted friend' },
    { id: 'detect-magic',          name: 'Detect Magic' },
    { id: 'floating-disc',         name: 'Floating Disc' },
    { id: 'hold-portal',           name: 'Hold Portal' },
    { id: 'light',                 name: 'Light' },
    { id: 'magic-missile',         name: 'Magic Missile',         combatInfo: '1d6+1 dmg, auto-hit, no save (1 missile at level 1)' },
    { id: 'protection-from-evil',  name: 'Protection from Evil',  combatInfo: '+1 AC and saves; blocks summoned/enchanted creatures from attacking' },
    { id: 'read-languages',        name: 'Read Languages' },
    { id: 'read-magic',            name: 'Read Magic' },
    { id: 'shield',                name: 'Shield',                combatInfo: 'AC 17 vs melee, AC 19 vs missiles; immune to Magic Missile' },
    { id: 'sleep',                 name: 'Sleep',                 combatInfo: '2d8 HD of creatures (≤4 HD each, lowest HD first), no save' },
    { id: 'ventriloquism',         name: 'Ventriloquism' },
  ],
  // 2nd level
  [
    { id: 'continual-light',       name: 'Continual Light' },
    { id: 'detect-evil',           name: 'Detect Evil' },
    { id: 'detect-invisible',      name: 'Detect Invisible' },
    { id: 'esp',                   name: 'ESP' },
    { id: 'invisibility',          name: 'Invisibility',          combatInfo: 'Invisible until next attack or dispelled; enemies at −4 to hit' },
    { id: 'knock',                 name: 'Knock' },
    { id: 'levitate',              name: 'Levitate' },
    { id: 'locate-object',         name: 'Locate Object' },
    { id: 'mirror-image',          name: 'Mirror Image',          combatInfo: '1d4 illusory duplicates; each absorbs 1 hit; lasts until dispelled' },
    { id: 'phantasmal-force',      name: 'Phantasmal Force',      combatInfo: 'Illusion up to 240\'; deals real dmg if believed; save vs Spells to disbelieve' },
    { id: 'web',                   name: 'Web',                   combatInfo: '10\'×10\'×20\' area; save vs Spells or stuck 2d4 turns; flammable (2 rounds)' },
    { id: 'wizard-lock',           name: 'Wizard Lock' },
  ],
  // 3rd level
  [
    { id: 'clairvoyance',                     name: 'Clairvoyance' },
    { id: 'dispel-magic',                     name: 'Dispel Magic',          combatInfo: 'Remove all magic in 20\' radius; 50%+5%/level above target level' },
    { id: 'fire-ball',                        name: 'Fire Ball',             combatInfo: '6d6 fire in 20\' radius sphere; save vs Spells for half' },
    { id: 'fly',                              name: 'Fly' },
    { id: 'haste',                            name: 'Haste',                 combatInfo: '2× speed and attacks for 3 turns; ages target 1 year' },
    { id: 'hold-person',                      name: 'Hold Person',           combatInfo: '1–4 humanoids; save vs Spells or paralyzed' },
    { id: 'infravision',                      name: 'Infravision' },
    { id: 'invisibility-10-radius',           name: 'Invisibility 10\' Radius' },
    { id: 'lightning-bolt',                   name: 'Lightning Bolt',        combatInfo: '6d6 lightning, 60\' line; bounces off walls; save vs Spells for half' },
    { id: 'protection-from-evil-10-radius',   name: 'Protection from Evil 10\' Radius' },
    { id: 'protection-from-normal-missiles',  name: 'Protection from Normal Missiles' },
    { id: 'water-breathing',                  name: 'Water Breathing' },
  ],
  // 4th level
  [
    { id: 'charm-monster',        name: 'Charm Monster',        combatInfo: '1 monster (or 3d6 clumped ≤3 HD); save vs Spells or charmed' },
    { id: 'confusion',            name: 'Confusion',            combatInfo: '2d8 creatures in 60\' area; save vs Spells each round or act randomly' },
    { id: 'dimension-door',       name: 'Dimension Door' },
    { id: 'growth-of-plants',     name: 'Growth of Plants' },
    { id: 'hallucinatory-terrain',name: 'Hallucinatory Terrain' },
    { id: 'massmorph',            name: 'Massmorph' },
    { id: 'polymorph-others',     name: 'Polymorph Others',     combatInfo: '1 target; save vs Spells or polymorphed into any creature' },
    { id: 'polymorph-self',       name: 'Polymorph Self' },
    { id: 'remove-curse',         name: 'Remove Curse' },
    { id: 'wall-of-fire',         name: 'Wall of Fire',         combatInfo: '70\'×10\' wall or 20\' ring; 1d6+1 passing through; undead 3d6; concentration' },
    { id: 'wall-of-ice',          name: 'Wall of Ice',          combatInfo: '70\'×10\' wall or 20\' ring; shattering deals 2d6 cold to adjacent creatures' },
    { id: 'wizard-eye',           name: 'Wizard Eye' },
  ],
  // 5th level
  [
    { id: 'animate-dead',          name: 'Animate Dead',          combatInfo: 'Animate 1 HD/caster level as obedient skeletons or zombies' },
    { id: 'cloudkill',             name: 'Cloudkill',             combatInfo: '30\'×20\'×20\' cloud; ≤4 HD die instantly, 4–5 HD save vs Death; moves 20\'/round' },
    { id: 'conjure-elemental',     name: 'Conjure Elemental',     combatInfo: 'Summon 16 HD elemental; must concentrate to control; uncontrolled if distracted' },
    { id: 'contact-higher-plane',  name: 'Contact Higher Plane' },
    { id: 'feeblemind',            name: 'Feeblemind',            combatInfo: '1 spell caster; save vs Spells −4 or loses spellcasting permanently' },
    { id: 'hold-monster',          name: 'Hold Monster',          combatInfo: '1–4 monsters; save vs Spells or paralyzed' },
    { id: 'magic-jar',             name: 'Magic Jar' },
    { id: 'pass-wall',             name: 'Pass-Wall' },
    { id: 'telekinesis',           name: 'Telekinesis',           combatInfo: 'Move up to 20 lbs/level; hurled as weapon: 1d6 per 20 lbs' },
    { id: 'teleport',              name: 'Teleport' },
    { id: 'transmute-rock-to-mud', name: 'Transmute Rock to Mud' },
    { id: 'wall-of-stone',         name: 'Wall of Stone' },
  ],
  // 6th level
  [
    { id: 'anti-magic-shell',  name: 'Anti-Magic Shell',  combatInfo: '10\' radius sphere around caster; all magic negated within' },
    { id: 'control-weather',   name: 'Control Weather' },
    { id: 'death-spell',       name: 'Death Spell',       combatInfo: '2d8×10 HP of creatures ≤8 HD in 60\' area die; no save' },
    { id: 'disintegrate',      name: 'Disintegrate',      combatInfo: '1 target creature or object; save vs Death or disintegrated' },
    { id: 'geas',              name: 'Geas' },
    { id: 'invisible-stalker', name: 'Invisible Stalker' },
    { id: 'lower-water',       name: 'Lower Water' },
    { id: 'move-earth',        name: 'Move Earth' },
    { id: 'part-water',        name: 'Part Water' },
    { id: 'projected-image',   name: 'Projected Image' },
    { id: 'reincarnation',     name: 'Reincarnation' },
  ],
]

export const druidSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { id: 'animal-friendship',       name: 'Animal Friendship' },
  { id: 'detect-danger',           name: 'Detect Danger' },
  { id: 'entangle',                name: 'Entangle',              combatInfo: 'All in 20\' area; save vs Spells or entangled, can\'t move 2d4 rounds' },
  { id: 'faerie-fire',             name: 'Faerie Fire',           combatInfo: 'Creatures in 10\' radius outlined; attackers get +2 to hit; lasts 6 turns' },
  { id: 'invisibility-to-animals', name: 'Invisibility to Animals' },
  { id: 'locate-plant-or-animal',  name: 'Locate Plant or Animal' },
  { id: 'predict-weather',         name: 'Predict Weather' },
  { id: 'speak-with-animals',      name: 'Speak with Animals' },
]]

export const illusionistSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { id: 'auditory-illusions', name: 'Auditory Illusions' },
  { id: 'chromatic-orb',      name: 'Chromatic Orb',         combatInfo: '3d6 dmg (energy type varies by level); save vs Spells for half' },
  { id: 'colour-spray',       name: 'Colour Spray',          combatInfo: '1d6 creatures in 60\' cone; save vs Spells or stunned 2d4 rounds' },
  { id: 'dancing-lights',     name: 'Dancing Lights' },
  { id: 'detect-illusion',    name: 'Detect Illusion' },
  { id: 'glamour',            name: 'Glamour' },
  { id: 'hypnotism',          name: 'Hypnotism',             combatInfo: '2d4 HD in 30\'; save vs Spells or follow simple commands while in range' },
  { id: 'light',              name: 'Light' },
  { id: 'phantasmal-force',   name: 'Phantasmal Force',      combatInfo: 'Illusion up to 240\'; deals real dmg if believed; save vs Spells to disbelieve' },
  { id: 'read-magic',         name: 'Read Magic' },
  { id: 'spook',              name: 'Spook',                 combatInfo: '1 creature in 60\'; save vs Spells or flee at max speed 1d4 rounds' },
  { id: 'wall-of-fog',        name: 'Wall of Fog' },
]]

export const necromancerSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { id: 'chill-touch',          name: 'Chill Touch',           combatInfo: 'Touch attack; save vs Death or −1 STR (temporary)' },
  { id: 'command-dead',         name: 'Command Dead',          combatInfo: 'Control undead up to 2×caster level HD; no save; obey commands' },
  { id: 'corpse-visage',        name: 'Corpse Visage' },
  { id: 'decay',                name: 'Decay',                 combatInfo: 'Touch; living: save vs Death or lose 1d6 CON; organic objects rot' },
  { id: 'deathlight',           name: 'Deathlight',            combatInfo: '60\' cone; save vs Death or slain; undead immune' },
  { id: 'detect-undead',        name: 'Detect Undead' },
  { id: 'marionette',           name: 'Marionette',            combatInfo: 'Animate and fully control 1 humanoid corpse as a zombie' },
  { id: 'pass-undead',          name: 'Pass Undead' },
  { id: 'protection-from-evil', name: 'Protection from Evil',  combatInfo: '+1 AC and saves; blocks summoned/enchanted creatures from attacking' },
  { id: 'read-magic',           name: 'Read Magic' },
  { id: 'skull-speech',         name: 'Skull Speech' },
  { id: 'undead-servitor',      name: 'Undead Servitor',       combatInfo: 'Animate 1 undead ≤4 HD; serves permanently or until destroyed' },
]]

export const runesmithSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { id: 'rune-of-alarm',    name: 'Rune of Alarm' },
  { id: 'rune-of-ale',      name: 'Rune of Ale' },
  { id: 'rune-of-finding',  name: 'Rune of Finding' },
  { id: 'rune-of-fire',     name: 'Rune of Fire',     combatInfo: 'Inscribed trap; 3d6 fire when triggered; save vs Spells for half' },
  { id: 'rune-of-grounding',name: 'Rune of Grounding',combatInfo: 'Self: immune to electrical damage for 1 day' },
  { id: 'rune-of-healing',  name: 'Rune of Healing' },
  { id: 'rune-of-luck',     name: 'Rune of Luck' },
  { id: 'rune-of-the-forge',name: 'Rune of the Forge' },
  { id: 'rune-of-shielding',name: 'Rune of Shielding',combatInfo: 'Self: +2 AC for 1 turn' },
  { id: 'rune-of-thunder',  name: 'Rune of Thunder',  combatInfo: '30\' radius; 1d6+1 sonic dmg; save vs Spells or deafened 1d4 rounds' },
  { id: 'rune-of-slaying',  name: 'Rune of Slaying',  combatInfo: 'Enchant weapon: +1 to hit and dmg; ×2 dmg to target creature type for 1 turn' },
  { id: 'rune-of-warding',  name: 'Rune of Warding',  combatInfo: 'Inscribed trap; triggered creature takes 1d10 dmg; save vs Spells for half' },
]]

const _allSpellsFlat: readonly SpellDefinition[] = [
  ...magicUserSpellsByLevel,
  ...illusionistSpellsByLevel,
  ...necromancerSpellsByLevel,
  ...runesmithSpellsByLevel,
  ...druidSpellsByLevel,
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

/**
 * Map from spell name to spell id.
 * Used by the normalization layer to migrate legacy saves that stored spell names.
 */
export const spellNameToId: Readonly<Record<string, string>> = Object.fromEntries(
  _allSpellsFlat.map(spell => [spell.name, spell.id])
)