# List of TODOs

TODO-list for maintainer work on OSECharacterGenerator.  Tracked here instead of github issues for ease of use, especially for small TODOs.

## Bugs

[ ] Recover CSS font etc styling to what it was before
[ ] Make the B/X filter look at all decent; it should also be set up to work the
    same as the filters for the weapons visually.  Current implementation is the
    minimum I could have to get the filter.  Should also find out if OSE has
    exactly the same equipment.
[X] If HP is rolled and the user change character class, the HP from the old
    roll is kept.  It needs or a scaling of the old roll to fit the new hit
    dice.  Hit Dice has to be a d4, d6, d8, d10, d12 or d20
    (d12 and d20 are not currently used).  Every number can be represented with
    the factors 2 * 2 * 2 * 3 * 5.  So get a random number N from 1-120 and
    store it, and get the dice by d4 = N/30, d6 = N/20, d8=N/15, d10=N/12,
    d12=N/10, and d20=N/6.
[ ] When we navigate back to the Ability Scores page, it is not visible which
    class has been selected, apart from the "XXX details" button appearing.

## Necessary to get the fork to "completion" for handback to matthewfee

This is what eivindelkund wants to do before offering the fork back to matthewfee

### Correctness status

[ ] Check all implementation details against official class descriptions, at
    least for the main classes
      [ ] Use Carcass Crawler PDFs to check the Carcass Crawler classes

### Unregress

[ ] Test on mobile
[ ] Make the download of PDFs with nice names work again, instead of only showing the PDF in the browser.

### Code status

[ ] Finish TS migration
  [ ] Clean up interfaces
[ ] Get rid of dupe code
[ ] Clean up classOptionsData
  [ ] Rename to characterClasses.ts, and look over for cleanup opportunities
[ ] Full sync with changes matthewfee has done since the original fork
[X] Add a document with architecture information, so the agents don't have to
    read all the code each time to understand what is going on.
[ ] Clean up general naming
[ ] Check whether the code for suggested packs has lots of duplication of the
    equipment data; it shouldn't have any, but had previously
[ ] Check for overall data duplication
[ ] Clean up the ledger code in the equipmentscreen - it uses the item names
    rather than the item ids to be able to deal with holy water/oil/torches being in both weapons and equipment.  They have to be in weapons for the purposes of having damage data, but should maybe be hidden on the equipment page?

### Abilities page

[X] Add description of the XP bonus system for that class to the class description

### Equipemnt page

[X] Auto-include holy symbol for cleric
[ ] No armor selection for magic-user
[X] Automatic "best" equipment pack based on class & available gold.
   [X] Fix so this fills ~the full gold is used
[ ] Give the auto-packs "Elf" and "Dwarf" and etc flavor
[ ] Suggested equipment pack should look at what items already exists in the
    user's inventory and not include those in the pack.

### Character Details (page)

#### Character description generation

[ ] Increase the number of templates, at least per-class
[ ] Connect the per-class templates in classOptions, maybe even put the
    per-class templates there
[ ] Connect some of the description to the alignment of the character
[ ] Update to more different structures/elements that can be put in a
    description.
[ ] Consider if the physical description should always be at the start; it tends
    to look a bit out of place when it's moved into the middle.
[ ] Consider if certain templates for other things should be able to override
    the physical description template.  In particular, there's a bunch of details that describe the eyes of a character, and the eye color is typically the last bit of the physical description table.  It ends up a bit weird if those two sentences aren't merged, and I suspect there's a bunch of nice things that could be done with custom physical descriptions.
[ ] Description based on low/high scores.  Very high strength, very high wisdom, abmyssal constitution in my example.
[ ] Go through AC1 to find different sentence patterns

### Character Sheet (page)

[ ] Print & download support - show PDF as downloadable w/printer icon next to it for printing

### Character Sheet (PDF)

[ ] Weapons list w/damage, including strength etc bonus if there is one (ie, 1d8 + STR => 1d8 + 1)
[ ] Cleaner weapons list - one per line
[ ] Download vs show PDF
[ ] Ammo slots (torches, rations, waterskins, holy water) as 4-6 checkboxes.
[ ] Quiver block w/20 circles for any character that has arrows/slingshots/crossbow bolts
[ ] Count weight
[ ] Also fill in alternate sheet (slot encumberance)
   [ ] Shade out the slots the character does not have strength to use without penalty
[ ] Fill in missing fields
[ ] Fix formatting so the 1-of-6 etc boxes have the same font throughout
[ ] Fill in complete information for special abilities; e.g, description of
    first spell, complete list of thief's abilities w/percentages
[ ] Encumberance sums per different parts of our list of stuff, so it's easy to
    get to a final sum if something update.  One part per column in the
    inventory, and one part for gold/gems/etc, and one part for magic items.
[ ] Weapon list: Weapon / Lvl / Damage / Defence / Range / Special ?  Encumberance?

### Overall UI

[ ] Move forward/back navigation buttons to the bottom of the screen, so people
    can navigate back without scrolling.
[ ] Have Gemini go through the UI to see what should be fixed CSS/HTML-wise to get a
    "nice styling".  Claude Sonnet can't look at images.
[ ] Have Gemini go through the UI to come with suggestion for improvements
    functionality-wise.

## Large features (wishlist)

[ ] Level increases & manual updates to character sheets
[ ] Share through Google Drive
[ ] Concurrent updates from different users
[ ] GM can set what requirements they want for e.g. rerolls, what languages are
    available, etc.
[X] Generate full description, w/quirks
[X] Auto-generate equipment list based on gold & class
[ ] Auto-character - go through the entire build, rolling stats, selecting one
    of the best classes, random spell, best equipment, random name, random
    alignment, description
[ ] Have Claude/Gemini go through the system and look for what user journeys we
    should support.  Maybe not even look through the system?
    [ ] Migrate user journeys already found in Gemini into git
[ ] Migrate storage to Supabase w/authentication through federated login
    (Discord, Google, ++?)

## Planned prompts

The code is for a D&D character generation wizard.
