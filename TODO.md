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
[X] When we navigate back to the Ability Scores page, it is not visible which
    class has been selected, apart from the "XXX details" button appearing.
[X] "Reset equipment" does not return the spent gold
[ ] There's a legacy "spell" field, in additions to the spells array.  Get rid
    of the 'spell' field; there's odd interactions.

## Necessary to get the fork to "completion" for handback to matthewfee

This is what eivindeklund wants to do before offering the fork back to matthewfee

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
[X] Clean up the ledger code in the equipmentscreen - it uses the item names
    rather than the item ids to be able to deal with holy water/oil/torches being in both weapons and equipment.  They have to be in weapons for the purposes of having damage data, but should maybe be hidden on the equipment page?
[X] Lots of stuff uses risky aspects of display strings to determine behavior; e.g. the exact same name of an item between Weapons and Equipment, a.name.includes('Listening at Doors').
   [X] Change to using ids and better data structures rather than looking inside strings
   [X] remove selectedWeapon and setters and things that call the setters unless
       it still is used in a way that affects the UI / what the user sees; if it
       still is used migrate into classOptionsData instead of having the series of ifs.
   [X] Replace the literal string based ids like 'leather', 'chainmail',
       'plate_mail', 'shield', 'listening_at_doors', 'detect_secret_doors',
       'detect_room_traps', with references to constant strings defined in
       constant.tsx.  Ids where the literal is only used in one place outside
       tests (typically, the weapon or equipment list) can keep using a literal
       string there.
   [X] add an accessor that generate the equivalent of classOptionsData.armour
        from allowedArmour, rather than having repeated data
   [X] create a constant that means 'any armour' instead of repeating
        ["leather","chainmail","plate_mail","shield"] for every class in
        classOptionsData that can take any armour.
   [X] `return Object.entries(itemCounts).map(([id, count]) => ({ id, count }))` in consolidateItems looks like a useless map.  Remove if useless.

   [X] Add a test that checks that the ids in equipmentList are unique, and one
       that checks that the ids in weaponsList are unique.
   [ ] Remove the access pattern `name = allItemsById[id]?.name ?? id`; replace with a getter that logs an error + stacktrace if the id is not available, and fails if the item is not available and we are running a unit or integration test or in dev.   Incorrect ids are bugs and should not be papered over automatically, especially not in test conditions.  Note TODO in the getter for making the failure notify some monitoring system.
   [ ] Scrub missing ids on load (with a warning) rather than having "safety" throughout the code.  The code should "fail" (log an error + notify monitoring) if enountering missing ids in prod, and plain fail if encountering them unit tests/integration tests/dev.
   [X] Rename isThiefEquivalent to canUseThiefTools

[ ] We've removed the access pattern `name = allItemsById[id]?.name ?? id`, replacing it with a getter that logs an error + stacktrace and notifies monitoring if the id is not available in prod, and failing if the item is not available and we are running a unit or integration test or in dev.   Incorrect ids are bugs and should not be papered over automatically, especially not in test conditions.  See if there are other use of similar patterns (`foo = bar[baz]?.quz ?? some_default`) elsewhere in the codebase that also are just "work if we have bugs", and replace them with getters a la the one described for item id -> item name.  
[ ] Remove dead code

[ ] Add CSS tests
[ ] Update "create new UI" skill so it runs e2e tests and CSS tests and capture new golden images.
[ ] Add skill for updating anything that's close to the UI but should not change anything to run e2e tests and run golden UI checks

### Abilities page

[X] Add description of the XP bonus system for that class to the class description

### Equipemnt page

[X] Auto-include holy symbol for cleric
[X] No armor selection for magic-user
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
[ ] Have some options/variants be common and some rare, instead of having all
    options be the same.  "Simple" variants should be common, "complicated"
    variants should be rare.

#### Name generation

Consider delaying this until after we have campaign support; it would make sense
to allow it to be tuned per campaign.

[ ] Names should have different priorities
[ ] Some names could be used across different races
[ ] Names could be marked as male/female
[ ] Possibly use Gygax book of names as inspiration for some of the setup?

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
    first spell, complete list of thief's abilities w/percentages.  We already
    have this for abilities in the web page; it should go into the PDF fill
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
[ ] Add character IDs to the URLs, so it is possible to reference separate
    characters.  Especially important for the "sheet" URL.

## Level upgrades

[ ] Cleanup: Get rid of "spell" field, only "spells"
[ ] Modal claims "Gets access to 2nd level spells" rather than "gets another 2nd level spell"
[ ] Text in modal is miniscule
[ ] Misalignment of text vs radio buttons in modal
[ ] Scroll problem in modal - sometimes I start randomly scrolling the screen
    instead of the spell list
[ ] HP increase display (when rolling) should show existing HP
[ ] On going from L6 to L7, the Magic-User should get access to one L1 and one
    L4 spell.  Only the L4 spell shows up in the level up modal.

## Large features (wishlist)

[X] Level increases
[ ] Manual updates to character sheets
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
[ ] Entire system structured around "Campaigns"

## Campaign system

[ ] Per campaign configuration for generation, examples:

  [ ] What classes are available
  [ ] What equipment is available
  [ ] Special rules for when a user can reroll stats
  [ ] What equipment is available
  [ ] Name lists for auto-generation, possibly including cool things like different regions etc
  [ ] Custom class support
  [ ] Custom starting gold or starting equipment support
  [ ] Custom equipment pricing
  [ ] Enable/disable particular per-class rules (e.g, what weapons a cleric can
      use).  Maybe ultra-generic structures and some way to call out to an LLM to
      negotiate exactly what the GM wants, instead of having a complicated UI
      that can configure everything?
  
[ ] Access control - one or more GMs with access to a campaign
[ ] Access control - users create characters inside the campaign, GM keeps access
[ ] Access control - users can maybe "port characters out"?
[ ] Campaign naming, managing several campaigns

## Planned prompts

The code is for a D&D character generation wizard.
