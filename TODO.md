# List of TODOs

TODO-list for maintainer work on OSECharacterGenerator.  Tracked here instead of github issues for ease of use, especially for small TODOs.

## Necessary to get the fork to "completion" for handback to matthewfee

This is what eivindelkund wants to do before offering the fork back to matthewfee

### Features (small, to be done)

[ ] Abilities screen
  [ ] Add description of the XP bonus system for that class to the class description

[ ] Equipemnt screen
  [ ] Weapon Categories, showing grayed-out or similar if there are no weapons
      in that category that can be used by the current class
  [ ] Stop the use of the separate ledger, just have next page
  [ ] Show cost in gold for currently selected items
  [ ] Auto-include holy symbol for cleric
  [ ] No armor selection for magic-user
  [ ] Automatic "best" equipment pack based on class & available gold.

[ ] Character sheet screen
  [ ] Print support
  [ ] Print as D&D B/X sheet if possible
  [ ] Change to switching CSS rather than having the PDF generation stuff
      (maybe - it is possible the PDFs are based on the ability to form-fill and
      it's useful for having PDFs that can be used later.)

### Correctness status

[ ] Check all implementation details against official class descriptions, at
    least for the main classes
      [X] Import the OSE SRE as Markdown so we can check against the class
          descriptions.
      [ ] XP bonus descriptions are missing from the SRD; add them manually.
      [ ] Use Carcass Crawler PDFs to check the Carcass Crawler classes

### Unregress

[ ] Recover CSS styling to what it was before
[ ] Test on mobile

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
[ ] Remove all use of randomNumbers (the ones that we previously got from api.random.org)

## Large features (wishlist)

[ ] Level increases & manual updates to character sheets
[ ] Share through Google Drive
[ ] Concurrent updates from different users
[ ] GM can set what requirements they want for e.g. rerolls, what languages are
    available, etc.
