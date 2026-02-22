# Old School Essentials Character Generator
A character generator for the 1981 B/X Edition of Dungeons and Dragons. 
## About

This is a character generator for the 1981 Basic/Expert edition Dungeons and Dragons. It is designed for used with [Old School Essentials](https://necroticgnome.com/). The character generator guides you through creating a character from start to finish. It enforces all of the game rules so that you can create a character quickly and get back to playing. Once your character is created, you can export your character to an official character sheet with all the data values filled in for you.

## Recent changes
- Carcass crawler classes added by ptaranat

## Additional Features

- One click generation

## Available Scripts

In the project directory, you can run:

### `npm run dev` - dev server

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build` - production build

Builds the app for production to the `diff` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run test` - unit tests (vitest)

### `npm run test:ui` - unit test debugging UI

Run the debugging UI for vitest (our unit test framework).
[Documentation](https://vitest.dev/guide/ui.html)

### `npm run test:e2e` - end to end test (playwright)

We've set up playwright to test on chrome, firefox and webkit.

* [Playwright general documentation](https://playwright.dev)
* [How to debug playwright tests](https://playwright.dev/docs/running-tests#debugging-tests).  You likely want to start by running the test in UI mode through `npm run test:e2e-ui`


### `npm run test:e2e-ui` - end to end test debugging UI.

Run the debugging UI for playwright (our end to end test framework).
[Documentation](https://playwright.dev/docs/test-ui-mode)

### `npm run test:all` - run all available tests (currently unittests and e2e tests)

### `npm run check-types` - check typescript types (without compiling output)

### `npm find-duplicate-code` - run duplicate code finders

Run jscpd and jsinspect-plus to find duplicate code, ignoring appropriate files.

These find duplicate code in slightly different ways, and thus can complement
each other.


