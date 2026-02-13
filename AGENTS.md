# OSE Character Generator - Agent Guidelines

This document outlines the rules and workflows for AI agents contributing to the OSE Character Generator.

## Core Principles

- **[GOAL] Focus**: Keep changes small and focused.
- **[GOAL] Minimalism**: Do not edit parts of the code that are not directly related to the current change.
- **[GOAL] Safety**: Never commit directly to the `main` branch. Use feature branches created specifically for each change.
- **[GOAL] Testing**: Always run tests before and after making changes.

## Development Workflow

[CONTEXT] The user will review the diffs for each step. Every change must be easy for a human to review.

Follow this structured process for every feature or non-trivial change:

1.  **Refactor for Change**: Restructure the code to make the new feature easy to add. This may involve several small, incremental steps.
    - [CONSTRAINT] Refactors should be "clean" whenever possible (no change in functional behavior).
    - [CONSTRAINT] If existing tests are insufficient to verify a refactor, write tests *before* refactoring. Use `git stash` to manage work-in-progress if needed.
    - [CONSTRAINT] If a refactor cannot be completed "clean", split it into multiple steps. Use clean steps where possible, and keep non-clean changes as small as possible.
    - [CONSTRAINT] If a refactor would be simpler if a specific feature existed first, loop back to the implementation step.
2.  **User Approval (Refactoring)**: Prompt the user to approve the refactoring phase before proceeding further.
3.  **Implement Feature**: Add the new feature with appropriate tests. 
    - [CONSTRAINT] Break complex features into small, incremental steps.
    - [CONSTRAINT] If any implementation step would be simpler with a refactor before it, loop back to the refactor step.
4.  **Verify**: Run all tests to ensure correctness.
5.  **Clean Up**: Refine and polish the code.
6.  **Final Verification**: Run tests again to ensure no regressions were introduced during cleanup.

> [!IMPORTANT]
> Always prompt the user for approval before proceeding with any steps that are not reasonably trivial.

> [!IMPORTANT]
> Every step must be optimized for reviewability. The user reviews diffs for every incremental change.

## Coding Standards

- **[STYLE] Indentation**: Use 2-space indentation for all JSX, TSX, and JavaScript files.
- **[STYLE] DRY (Don't Repeat Yourself)**: Avoid duplicating code. If logic is repeated, refactor to consolidate it.
- **[STYLE] Philosophy**: Follow the "Refactor to make it easy to add new feature" principle for all structural improvements.
  