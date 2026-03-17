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

export const druidSpellsByLevel: readonly (readonly SpellDefinition[])[] = [
  // 1st level
  [
    { id: 'animal-friendship',       name: 'Animal Friendship' },
    { id: 'detect-danger',           name: 'Detect Danger' },
    { id: 'entangle',                name: 'Entangle',              combatInfo: 'All in 20\' radius; save vs Spells or immobilized 1 turn; success: move at half speed' },
    { id: 'faerie-fire',             name: 'Faerie Fire',           combatInfo: 'Targets in 60\' range outlined; counters invisibility; +2 to hit in low light; lasts 1 turn' },
    { id: 'invisibility-to-animals', name: 'Invisibility to Animals' },
    { id: 'locate-plant-or-animal',  name: 'Locate Plant or Animal' },
    { id: 'predict-weather',         name: 'Predict Weather' },
    { id: 'speak-with-animals',      name: 'Speak with Animals' },
  ],
  // 2nd level
  [
    { id: 'barkskin',          name: 'Barkskin',          combatInfo: '+1 AC and +1 to all non-magical saves for 1 turn per level' },
    { id: 'create-water',      name: 'Create Water' },
    { id: 'cure-light-wounds', name: 'Cure Light Wounds' },
    { id: 'heat-metal',        name: 'Heat Metal',        combatInfo: '30\' range; metal on 1 creature/2 levels heats over 7 rounds (1d3–1d6 dmg); white hot: save vs Spells or hand/body/head disabled' },
    { id: 'obscuring-mist',    name: 'Obscuring Mist' },
    { id: 'produce-flame',     name: 'Produce Flame' },
    { id: 'slow-poison',       name: 'Slow Poison' },
    { id: 'warp-wood',         name: 'Warp Wood',         combatInfo: '240\' range; 1 arrow-sized object/level warped useless; bows count as 4; magic items may resist' },
  ],
  // 3rd level
  [
    { id: 'call-lightning',         name: 'Call Lightning',         combatInfo: '360\' range; 8d6 lightning per strike (1/turn; 1 turn per level); save vs Spells for half; requires storm clouds above' },
    { id: 'growth-of-nature',       name: 'Growth of Nature',       combatInfo: '120\' range; doubles animal\'s strength and damage (12 turns); or creates impassable thorny jungle in 3,000 sq ft (permanent)' },
    { id: 'hold-animal',            name: 'Hold Animal',            combatInfo: '180\' range; up to 1 HD/level of normal/giant animals; save vs Spells or paralyzed 1 turn/level' },
    { id: 'protection-from-poison', name: 'Protection from Poison' },
    { id: 'tree-shape',             name: 'Tree Shape' },
    { id: 'water-breathing',        name: 'Water Breathing' },
  ],
  // 4th level
  [
    { id: 'cure-serious-wounds',                name: 'Cure Serious Wounds' },
    { id: 'dispel-magic',                       name: 'Dispel Magic',                       combatInfo: 'Remove all magic in 20\' cube; 5%/level fail chance if target\'s caster is higher level' },
    { id: 'protection-from-fire-and-lightning', name: 'Protection from Fire and Lightning' },
    { id: 'speak-with-plants',                  name: 'Speak with Plants' },
    { id: 'summon-animals',                     name: 'Summon Animals',                     combatInfo: 'Summon animals with total HD = caster level; attack enemies if caster is being attacked' },
    { id: 'temperature-control',                name: 'Temperature Control' },
  ],
  // 5th level
  [
    { id: 'commune-with-nature',                name: 'Commune with Nature' },
    { id: 'control-weather',                    name: 'Control Weather',                    combatInfo: 'Create fog (20\' vision), high winds (halve movement), or tornado (2d8 dmg, 75% hull dmg); outdoor only' },
    { id: 'pass-plant',                         name: 'Pass Plant' },
    { id: 'protection-from-plants-and-animals', name: 'Protection from Plants and Animals' },
    { id: 'transmute-rock-to-mud',              name: 'Transmute Rock to Mud',              combatInfo: '3,000 sq ft rock to mud; movement reduced 90% in mud' },
    { id: 'wall-of-thorns',                     name: 'Wall of Thorns',                     combatInfo: 'Up to 1,200 sq ft thorn wall; 1d8 + AC dmg per 10\' pushed through; 4 turns to hack per 10\'' },
  ],
]

export const illusionistSpellsByLevel: readonly (readonly SpellDefinition[])[] = [
  // 1st level
  [
    { id: 'auditory-illusion', name: 'Auditory Illusion' },
    { id: 'chromatic-orb',     name: 'Chromatic Orb',         combatInfo: '1d4–2d8 dmg unerringly (scales with level/gem); secondary effect by colour (blindness, paralysis, etc.)' },
    { id: 'colour-spray',      name: 'Colour Spray',          combatInfo: '1d6 creatures in 60\' cone; HD ≤ caster: unconscious 2d4 rounds; up to 2 HD higher: blind 1d4 rounds; 3+ HD higher: stunned 1 round' },
    { id: 'dancing-lights',    name: 'Dancing Lights' },
    { id: 'detect-illusion',   name: 'Detect Illusion' },
    { id: 'glamour',           name: 'Glamour' },
    { id: 'hypnotism',         name: 'Hypnotism',             combatInfo: 'Up to 1d6 creatures in 30\'; save vs Spells or obey suggestion while in range for duration' },
    { id: 'light',             name: 'Light' },
    { id: 'phantasmal-force',  name: 'Phantasmal Force',      combatInfo: 'Illusory monster (AC 9), attack, or scene in 20\' cube; concentration; save vs Spells negates attacks/harm' },
    { id: 'read-magic',        name: 'Read Magic' },
    { id: 'spook',             name: 'Spook',                 combatInfo: '1 intelligent creature in 10\'; save vs Spells or flee caster until new save succeeds each round' },
    { id: 'wall-of-fog',       name: 'Wall of Fog' },
  ],
  // 2nd level
  [
    { id: 'blindness-deafness',        name: 'Blindness / Deafness',        combatInfo: '1 creature in 30\'; save vs Spells or permanently blinded or deafened (removable by dispel magic)' },
    { id: 'blur',                      name: 'Blur',                        combatInfo: 'Attackers at −4 to hit caster (−2 on subsequent attacks); +1 to saves vs direct magic' },
    { id: 'detect-magic',              name: 'Detect Magic' },
    { id: 'false-aura',                name: 'False Aura' },
    { id: 'fascinate',                 name: 'Fascinate',                   combatInfo: '1 creature in 30\'; save vs Spells or besotted with caster; obeys commands (CHA check per request)' },
    { id: 'hypnotic-pattern',          name: 'Hypnotic Pattern',            combatInfo: 'Up to 24 HD of creatures in 30\' sq; save vs Spells or entranced while watching; concentration' },
    { id: 'improved-phantasmal-force', name: 'Improved Phantasmal Force',   combatInfo: 'Illusory monster (AC 7), attack, or scene + minor sounds; persists 2 rounds after concentration ends' },
    { id: 'invisibility',              name: 'Invisibility',                combatInfo: 'Invisible until next attack or dispelled; enemies at −4 to hit' },
    { id: 'magic-mouth',               name: 'Magic Mouth' },
    { id: 'mirror-image',              name: 'Mirror Image',                combatInfo: '1d4 illusory duplicates; each absorbs 1 hit (even a miss); lasts 6 turns' },
    { id: 'quasimorph',                name: 'Quasimorph' },
    { id: 'whispering-wind',           name: 'Whispering Wind' },
  ],
  // 3rd level
  [
    { id: 'blacklight',             name: 'Blacklight' },
    { id: 'dispel-illusion',        name: 'Dispel Illusion',         combatInfo: 'End all illusions in 20\' cube; auto vs non-illusionists; 5%/level fail chance vs higher-level illusionist' },
    { id: 'fear',                   name: 'Fear',                    combatInfo: '60\' cone (30\' wide at end); save vs Spells or flee 1 round/level; 60% chance to drop held items' },
    { id: 'hallucinatory-terrain',  name: 'Hallucinatory Terrain' },
    { id: 'invisibility-10-radius', name: 'Invisibility 10\' Radius', combatInfo: 'All within 10\' of chosen creature invisible; broken per individual when they attack or cast' },
    { id: 'nondetection',           name: 'Nondetection' },
    { id: 'paralysation',           name: 'Paralysation',            combatInfo: 'Up to 2 HD/level in 20\' cube; save vs Spells or paralyzed 6 turns; lowest HD first' },
    { id: 'phantom-steed',          name: 'Phantom Steed' },
    { id: 'rope-trick',             name: 'Rope Trick' },
    { id: 'spectral-force',         name: 'Spectral Force',          combatInfo: 'Illusory monster (AC 5), attack, or scene + sound/smell/heat; persists 3 rounds after concentration ends' },
    { id: 'suggestion',             name: 'Suggestion',              combatInfo: '1 creature in 30\'; save vs Spells (−2 if reasonable wording) or follow suggestion for duration' },
    { id: 'wraithform',             name: 'Wraithform',              combatInfo: 'Caster semi-ethereal 1 turn; only ethereal creatures or magic can harm; undead ignore caster' },
  ],
  // 4th level
  [
    { id: 'confusion',             name: 'Confusion',             combatInfo: '3d6 creatures in 60\' area confused 12 rounds; 2+1 HD+ save vs Spells each round to act freely' },
    { id: 'dispel-magic',          name: 'Dispel Magic',          combatInfo: 'Remove all magic in 20\' cube; 5%/level fail chance if target\'s caster is higher level' },
    { id: 'emotion',               name: 'Emotion',               combatInfo: '40\' sq area; save vs Spells or fear/hate (+2 to attacks)/hopelessness/rage (+1 hit, +3 dmg) as chosen' },
    { id: 'illusory-stamina',      name: 'Illusory Stamina',      combatInfo: '4 creatures touched gain bonus HP = 50% of missing HP; absorbed first when damaged; removed at duration end' },
    { id: 'improved-invisibility', name: 'Improved Invisibility', combatInfo: 'Subject may attack while invisible; if detected: +4 AC and saves vs such attacks' },
    { id: 'massmorph',             name: 'Massmorph' },
    { id: 'minor-creation',        name: 'Minor Creation' },
    { id: 'phantasmal-killer',     name: 'Phantasmal Killer',     combatInfo: '1 creature; save vs Spells (+2 bonus) or nightmare pursues 1 round/level; one hit = instant death from terror' },
    { id: 'rainbow-pattern',       name: 'Rainbow Pattern',       combatInfo: 'Up to 24 HD in 30\' sq; save vs Spells or entranced; pattern may drift away drawing creatures with it' },
    { id: 'shadow-monsters',       name: 'Shadow Monsters',       combatInfo: 'Up to caster-level HD of shadow monsters; fail save: real dmg; pass save: ¼ dmg, AC 9; 1d2 HP/HD' },
    { id: 'solid-fog',             name: 'Solid Fog',             combatInfo: 'Fog blocks vision; creatures move at 1/10 rate; only very strong winds can dispel prematurely' },
    { id: 'veil-of-abandonment',   name: 'Veil of Abandonment' },
  ],
  // 5th level
  [
    { id: 'chaos',                  name: 'Chaos',                  combatInfo: 'All in 60\' diameter confused 12 rounds; only illusionists / innate illusion-users may save' },
    { id: 'demi-shadow-monsters',   name: 'Demi-Shadow Monsters',   combatInfo: 'Up to caster-level HD of shadow monsters; fail save: real dmg; pass save: ½ dmg, AC 9; 1d4 HP/HD' },
    { id: 'illusion',               name: 'Illusion',               combatInfo: 'Illusory monster (AC 5), attack, or scene + sound/smell/heat; autonomous; 1 round/level; no concentration needed' },
    { id: 'looking-glass',          name: 'Looking Glass' },
    { id: 'major-creation',         name: 'Major Creation' },
    { id: 'maze-of-mirrors',        name: 'Maze of Mirrors',        combatInfo: '1 creature trapped in extra-dimensional mirror maze; duration by INT (1d4 rounds to 2d4 turns)' },
    { id: 'projected-image',        name: 'Projected Image',        combatInfo: 'Illusory caster duplicate; subsequent spells appear to originate from it; vanishes if touched in melee' },
    { id: 'seeming',                name: 'Seeming' },
    { id: 'shadowcast',             name: 'Shadowcast' },
    { id: 'shadowy-transformation', name: 'Shadowy Transformation', combatInfo: 'Creature/object insubstantial; only ethereal/magical attacks harm; undead ignore; save vs Spells to resist' },
    { id: 'time-flow',              name: 'Time Flow' },
    { id: 'visitation',             name: 'Visitation' },
  ],
  // 6th level
  [
    { id: 'acid-fog',                  name: 'Acid Fog',                  combatInfo: 'Fog bank; 1/2/4/8 acid dmg per round; blocks vision; move at 1/10 rate' },
    { id: 'dream-quest',               name: 'Dream Quest',               combatInfo: '1 creature; save vs Spells or compelled to complete quest or lose 1 HP/day (non-fatal)' },
    { id: 'impersonation',             name: 'Impersonation' },
    { id: 'manifest-dream',            name: 'Manifest Dream' },
    { id: 'mass-suggestion',           name: 'Mass Suggestion',           combatInfo: '1 creature/level in 90\'; save vs Spells (−2 if reasonable) or follow suggestion for duration' },
    { id: 'mislead',                   name: 'Mislead',                   combatInfo: 'Illusory double acts independently (full combat capability); caster invisible and may attack; +4 AC/saves if detected' },
    { id: 'permanent-illusion',        name: 'Permanent Illusion',        combatInfo: 'Permanent illusory monster (AC 5) or scene + sound/smell/heat; behaves autonomously as set when cast' },
    { id: 'shades',                    name: 'Shades',                    combatInfo: 'Up to caster-level HD of shadow monsters; fail save: real dmg; pass save: ¾ dmg, AC 9; 1d6 HP/HD' },
    { id: 'through-the-looking-glass', name: 'Through the Looking Glass', combatInfo: 'Scrying mirror; caster may step into viewed scene; portal closes at duration end (save vs death or lost to another plane)' },
    { id: 'triggered-illusion',        name: 'Triggered Illusion',        combatInfo: 'Triggers illusory monster (AC 5), attack, or scene when condition met; lasts 1 round/level' },
    { id: 'true-seeing',               name: 'True Seeing' },
    { id: 'vision',                    name: 'Vision' },
  ],
]

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