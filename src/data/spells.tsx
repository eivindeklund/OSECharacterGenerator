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
    { name: 'Charm Person',          combatInfo: '1 humanoid, save vs Spells or treats caster as trusted friend' },
    { name: 'Detect Magic' },
    { name: 'Floating Disc' },
    { name: 'Hold Portal' },
    { name: 'Light' },
    { name: 'Magic Missile',         combatInfo: '1d6+1 dmg, auto-hit, no save (1 missile at level 1)' },
    { name: 'Protection from Evil',  combatInfo: '+1 AC and saves; blocks summoned/enchanted creatures from attacking' },
    { name: 'Read Languages' },
    { name: 'Read Magic' },
    { name: 'Shield',                combatInfo: 'AC 17 vs melee, AC 19 vs missiles; immune to Magic Missile' },
    { name: 'Sleep',                 combatInfo: '2d8 HD of creatures (≤4 HD each, lowest HD first), no save' },
    { name: 'Ventriloquism' },
  ],
  // 2nd level
  [
    { name: 'Continual Light' },
    { name: 'Detect Evil' },
    { name: 'Detect Invisible' },
    { name: 'ESP' },
    { name: 'Invisibility',          combatInfo: 'Invisible until next attack or dispelled; enemies at −4 to hit' },
    { name: 'Knock' },
    { name: 'Levitate' },
    { name: 'Locate Object' },
    { name: 'Mirror Image',          combatInfo: '1d4 illusory duplicates; each absorbs 1 hit; lasts until dispelled' },
    { name: 'Phantasmal Force',      combatInfo: 'Illusion up to 240\'; deals real dmg if believed; save vs Spells to disbelieve' },
    { name: 'Web',                   combatInfo: '10\'×10\'×20\' area; save vs Spells or stuck 2d4 turns; flammable (2 rounds)' },
    { name: 'Wizard Lock' },
  ],
  // 3rd level
  [
    { name: 'Clairvoyance' },
    { name: 'Dispel Magic',          combatInfo: 'Remove all magic in 20\' radius; 50%+5%/level above target level' },
    { name: 'Fire Ball',             combatInfo: '6d6 fire in 20\' radius sphere; save vs Spells for half' },
    { name: 'Fly' },
    { name: 'Haste',                 combatInfo: '2× speed and attacks for 3 turns; ages target 1 year' },
    { name: 'Hold Person',           combatInfo: '1–4 humanoids; save vs Spells or paralyzed' },
    { name: 'Infravision' },
    { name: 'Invisibility 10\' Radius' },
    { name: 'Lightning Bolt',        combatInfo: '6d6 lightning, 60\' line; bounces off walls; save vs Spells for half' },
    { name: 'Protection from Evil 10\' Radius' },
    { name: 'Protection from Normal Missiles' },
    { name: 'Water Breathing' },
  ],
  // 4th level
  [
    { name: 'Charm Monster',         combatInfo: '1 monster (or 3d6 clumped ≤3 HD); save vs Spells or charmed' },
    { name: 'Confusion',             combatInfo: '2d8 creatures in 60\' area; save vs Spells each round or act randomly' },
    { name: 'Dimension Door' },
    { name: 'Growth of Plants' },
    { name: 'Hallucinatory Terrain' },
    { name: 'Massmorph' },
    { name: 'Polymorph Others',      combatInfo: '1 target; save vs Spells or polymorphed into any creature' },
    { name: 'Polymorph Self' },
    { name: 'Remove Curse' },
    { name: 'Wall of Fire',          combatInfo: '70\'×10\' wall or 20\' ring; 1d6+1 passing through; undead 3d6; concentration' },
    { name: 'Wall of Ice',           combatInfo: '70\'×10\' wall or 20\' ring; shattering deals 2d6 cold to adjacent creatures' },
    { name: 'Wizard Eye' },
  ],
  // 5th level
  [
    { name: 'Animate Dead',          combatInfo: 'Animate 1 HD/caster level as obedient skeletons or zombies' },
    { name: 'Cloudkill',             combatInfo: '30\'×20\'×20\' cloud; ≤4 HD die instantly, 4–5 HD save vs Death; moves 20\'/round' },
    { name: 'Conjure Elemental',     combatInfo: 'Summon 16 HD elemental; must concentrate to control; uncontrolled if distracted' },
    { name: 'Contact Higher Plane' },
    { name: 'Feeblemind',            combatInfo: '1 spell caster; save vs Spells −4 or loses spellcasting permanently' },
    { name: 'Hold Monster',          combatInfo: '1–4 monsters; save vs Spells or paralyzed' },
    { name: 'Magic Jar' },
    { name: 'Pass-Wall' },
    { name: 'Telekinesis',           combatInfo: 'Move up to 20 lbs/level; hurled as weapon: 1d6 per 20 lbs' },
    { name: 'Teleport' },
    { name: 'Transmute Rock to Mud' },
    { name: 'Wall of Stone' },
  ],
  // 6th level
  [
    { name: 'Anti-Magic Shell',      combatInfo: '10\' radius sphere around caster; all magic negated within' },
    { name: 'Control Weather' },
    { name: 'Death Spell',           combatInfo: '2d8×10 HP of creatures ≤8 HD in 60\' area die; no save' },
    { name: 'Disintegrate',          combatInfo: '1 target creature or object; save vs Death or disintegrated' },
    { name: 'Geas' },
    { name: 'Invisible Stalker' },
    { name: 'Lower Water' },
    { name: 'Move Earth' },
    { name: 'Part Water' },
    { name: 'Projected Image' },
    { name: 'Reincarnation' },
  ],
]

export const druidSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { name: 'Animal Friendship' },
  { name: 'Detect Danger' },
  { name: 'Entangle',              combatInfo: 'All in 20\' area; save vs Spells or entangled, can\'t move 2d4 rounds' },
  { name: 'Faerie Fire',           combatInfo: 'Creatures in 10\' radius outlined; attackers get +2 to hit; lasts 6 turns' },
  { name: 'Invisibility to Animals' },
  { name: 'Locate Plant or Animal' },
  { name: 'Predict Weather' },
  { name: 'Speak with Animals' },
]]

export const illusionistSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { name: 'Auditory Illusions' },
  { name: 'Chromatic Orb',         combatInfo: '3d6 dmg (energy type varies by level); save vs Spells for half' },
  { name: 'Colour Spray',          combatInfo: '1d6 creatures in 60\' cone; save vs Spells or stunned 2d4 rounds' },
  { name: 'Dancing Lights' },
  { name: 'Detect Illusion' },
  { name: 'Glamour' },
  { name: 'Hypnotism',             combatInfo: '2d4 HD in 30\'; save vs Spells or follow simple commands while in range' },
  { name: 'Light' },
  { name: 'Phantasmal Force',      combatInfo: 'Illusion up to 240\'; deals real dmg if believed; save vs Spells to disbelieve' },
  { name: 'Read Magic' },
  { name: 'Spook',                 combatInfo: '1 creature in 60\'; save vs Spells or flee at max speed 1d4 rounds' },
  { name: 'Wall of Fog' },
]]

export const necromancerSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { name: 'Chill Touch',           combatInfo: 'Touch attack; save vs Death or −1 STR (temporary)' },
  { name: 'Command Dead',          combatInfo: 'Control undead up to 2×caster level HD; no save; obey commands' },
  { name: 'Corpse Visage' },
  { name: 'Decay',                 combatInfo: 'Touch; living: save vs Death or lose 1d6 CON; organic objects rot' },
  { name: 'Deathlight',            combatInfo: '60\' cone; save vs Death or slain; undead immune' },
  { name: 'Detect Undead' },
  { name: 'Marionette',            combatInfo: 'Animate and fully control 1 humanoid corpse as a zombie' },
  { name: 'Pass Undead' },
  { name: 'Protection from Evil',  combatInfo: '+1 AC and saves; blocks summoned/enchanted creatures from attacking' },
  { name: 'Read Magic' },
  { name: 'Skull Speech' },
  { name: 'Undead Servitor',       combatInfo: 'Animate 1 undead ≤4 HD; serves permanently or until destroyed' },
]]

export const runesmithSpellsByLevel: readonly (readonly SpellDefinition[])[] = [[
  { name: 'Rune of Alarm' },
  { name: 'Rune of Ale' },
  { name: 'Rune of Finding' },
  { name: 'Rune of Fire',          combatInfo: 'Inscribed trap; 3d6 fire when triggered; save vs Spells for half' },
  { name: 'Rune of Grounding',     combatInfo: 'Self: immune to electrical damage for 1 day' },
  { name: 'Rune of Healing' },
  { name: 'Rune of Luck' },
  { name: 'Rune of the Forge' },
  { name: 'Rune of Shielding',     combatInfo: 'Self: +2 AC for 1 turn' },
  { name: 'Rune of Thunder',       combatInfo: '30\' radius; 1d6+1 sonic dmg; save vs Spells or deafened 1d4 rounds' },
  { name: 'Rune of Slaying',       combatInfo: 'Enchant weapon: +1 to hit and dmg; ×2 dmg to target creature type for 1 turn' },
  { name: 'Rune of Warding',       combatInfo: 'Inscribed trap; triggered creature takes 1d10 dmg; save vs Spells for half' },
]]

/**
 * All spells keyed by name for O(1) lookup.
 * Used by PDFExport to retrieve combatInfo for known spells.
 */
export const allSpellsByName: Readonly<Record<string, SpellDefinition>> = Object.fromEntries(
  [
    ...magicUserSpellsByLevel,
    ...illusionistSpellsByLevel,
    ...necromancerSpellsByLevel,
    ...runesmithSpellsByLevel,
    ...druidSpellsByLevel,
  ].flat().map(spell => [spell.name, spell])
)