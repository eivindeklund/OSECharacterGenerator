# List of TODOs

TODO-list for maintainer work on OSECharacterGenerator.  Tracked here instead of github issues for ease of use, especially for small TODOs.

## Bugs

[ ] Recover CSS font etc styling to what it was before
[ ] Make the B/X filter look at all decent; it should also be set up to work the
    same as the filters for the weapons visually.  Current implementation is the
    minimum I could have to get the filter.  Should also find out if OSE has
    exactly the same equipment.
[ ] Tavern navigation to character does not work
[ ] Auto gen equipment w/Elf 120GP doesn't spend all the gold, same w/Magic-User
    120 gold (total "optimal" pack is 21 gold).  Pack C is 47GP, so at least
    that should be in there.
[ ] Thieves' tools need lower pri compared to adventuring gear

## Necessary to get the fork to "completion" for handback to matthewfee

This is what eivindelkund wants to do before offering the fork back to matthewfee

### Correctness status

[ ] Check all implementation details against official class descriptions, at
    least for the main classes
      [X] Import the OSE SRE as Markdown so we can check against the class
          descriptions.
      [ ] XP bonus descriptions are missing from the SRD; add them manually.
      [ ] Use Carcass Crawler PDFs to check the Carcass Crawler classes

### Unregress

[ ] Test on mobile
[ ] Make the download of PDFs with nice names work again, instead of only showing the PDF in the browser.

### Code status

[ ] Finish TS migration
  [X] All files migrated
  [ ] Clean up interfaces
[ ] Get rid of dupe code
  [X] Merge checkBox / checkBoxStyled
  [X] Merge different classOptionsData XP modifiers calculation implementations
[ ] Clean up classOptionsData
  [X] Clean up the XP bonus calculations
[ ] Full sync with changes matthewfee has done since the original fork
[X] Remove all use of randomNumbers (the ones that we previously got from api.random.org)
[ ] Add a document with architecture information, so the agents don't have to
    read all the code each time to understand what is going on.

### Abilities page

[ ] Add description of the XP bonus system for that class to the class description

### Equipemnt page

[X] Weapon Categories, showing grayed-out or similar if there are no weapons
    in that category that can be used by the current class
[X] Stop the use of the separate ledger, just have next page
[X] Show cost in gold for currently selected items
[ ] Auto-include holy symbol for cleric
[ ] No armor selection for magic-user
[ ] Automatic "best" equipment pack based on class & available gold.

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
[ ] Fill in missing bits
[ ] Fix formatting so the 1-of-6 etc boxes have the same font throughout
[ ] Fill in complete information for special abilities; e.g, description of
    first spell, complete list of thief's abilities w/percentages
[ ] Encumberance sums per different parts of our list of stuff, so it's easy to
    get to a final sum if something update.  One part per column in the
    inventory, and one part for gold/gems/etc, and one part for magic items.
[ ] Weapon list: Weapon / Lvl / Damage / Defence / Range / Special ?  Encumberance?


## Large features (wishlist)

[ ] Level increases & manual updates to character sheets
[ ] Share through Google Drive
[ ] Concurrent updates from different users
[ ] GM can set what requirements they want for e.g. rerolls, what languages are
    available, etc.
[X] Generate full description, w/quirks
[ ] Auto-generate equipment list based on gold & class
[ ] Auto-character - go through the entire build, rolling stats, selecting one
    of the best classes, random spell, best equipment, random name, random
    alignment, description

## Planned prompts

### Scrolling during navigation

The code is for a D&D character generation wizard.

After navigation, what the user wants to do will typically not be in the same
position on the page as they were on the previous page.

The following rules applies:

* When navigating to a page in the character generation wizard, if the "next button" can't be
  clicked, it makes sense to scroll to the topmost place in the page where there
  is a thing that needs to be fixed to be able to proceed.
  E.g, if the user comes to the Character Details page for the first time, they
  need to see the empty name and the button to roll the name.

* When navigating backwards in the character generation wizard, it is most
  useful to scroll so the prev page / next page buttons are at the bottom of the
  page, so the user can quickly get to the earlier pages again.  Since the user
  is navigating backwards, all the required fields must already be set.

* When navigating from the characterSheet screen to the tavern, it's most useful
  to scroll so the character the user has just worked on is visible in the
  frame.

* When navigating to the start page, we need to scroll to the top

Can you fix the scrolling logic?  If possible, use red/green TDD during development.