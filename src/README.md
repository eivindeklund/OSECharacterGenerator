# Testing Infrastructure

This project uses a combination of tools to ensure code quality and functionality.

## Tools

- **Unit Testing**: [Vitest](https://vitest.dev/)
    - A blazing fast unit test framework powered by Vite.
    - Configured in `vite.config.js`.
- **Component Testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
    - A library for testing React components in a way that resembles the way the software is used.
- **E2E Testing**: [Playwright](https://playwright.dev/)
    - A framework for Web Testing and Automation.
    - Configured in `playwright.config.js`.

## Commands

- `npm test`: Run unit tests.
- `npm run test:ui`: Run unit tests with a UI.
- `npm run test:e2e`: Run E2E tests.
- `npm run test:all`: Run all tests (unit and E2E) in a single pass.

## Standards

### Unit Tests
- Place unit tests in a `__tests__` directory alongside the code being tested.
- File naming convention: `Component.test.jsx` or `utility.test.js`.
- Mock external dependencies (like `react-i18next`) to isolate the component.
- Use `vi.mock()` for mocking modules.

### E2E Tests
- Place E2E tests in the `e2e` directory.
- File naming convention: `flow.spec.js`.
- Focus on critical user journeys and integrations.
- Ensure the dev server is running or let Playwright start it automatically (configured in `playwright.config.js`).

## Setup

- Ensure all dependencies are installed: `npm install`
- Install Playwright browsers: `npx playwright install`
