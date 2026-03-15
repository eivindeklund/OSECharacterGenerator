# Skill: Temporary Files

Guidance for creating and using temporary files during agent tasks in the OSE Character Generator workspace.

---

## 1. Always Use the Local `tmp/` Directory

**Never write to `/tmp` or any system-level temp directory.**

- System `/tmp` requires shell-command approval on every write, blocking unattended runs.
- The local `tmp/` directory (at the workspace root) is always writable without approval.
- It is safe to leave `tmp/` behind after a task; it is git-ignored.

```
/Users/eivind/src/OSECharacterGenerator/tmp/   ← correct
/tmp/                                           ← wrong
```

---

## 2. Creating the `tmp/` Directory

Before writing any file, ensure `tmp/` exists.  Do **not** assume it is present.

Use the `create_directory` tool (if available) or a shell `mkdir -p`:

```bash
mkdir -p tmp
```

A single `mkdir -p tmp` at the start of a task is sufficient for the whole session; subsequent writes to `tmp/` need no further checks.

---

## 3. Writing Temp Files — Prefer Direct File Tools

Write temp file content with `create_file` (for new files) or `replace_string_in_file` / `multi_replace_string_in_file` (to update existing ones).

**Do not pipe or redirect content through the shell (`echo … > file`, heredocs, `tee`, etc.).**  Shell escaping is fragile — quotes, dollar signs, backticks, and newlines inside code snippets frequently corrupt the output silently.

| Situation | Correct approach |
|---|---|
| Writing a new script / config snippet | `create_file` with the full content |
| Updating a temp file that already exists | `replace_string_in_file` or `multi_replace_string_in_file` |
| MCP server available for file I/O | Use MCP file-write tool as an alternative to `create_file` |
| Shell is the only viable option | Use a heredoc with `cat`, quoting carefully — verify the result |

---

## 4. Naming Conventions

Choose names that are:

- Descriptive of purpose, not generic (`tmp/patch-equipment-screen.ts`, not `tmp/file1.ts`).
- Unique enough to avoid collisions when multiple tasks run in parallel (`tmp/debug-pdf-export-run2.log`).
- Short-lived scripts/snippets: prefix with `scratch-` (`tmp/scratch-xp-calc.ts`).
- Test input/fixture data: prefix with `fixture-` (`tmp/fixture-character.json`).

---

## 5. Cleanup

Temp files are intentionally left in `tmp/` — do **not** delete them automatically at the end of a task unless the user requests it.  `tmp/` is git-ignored so leftover files never pollute commits.

If a task creates many temp files and cleanup seems appropriate, ask the user rather than deleting silently.

---

## 6. When Temp Files Are Actually Needed

Reach for a temp file when:

- Running a standalone script to verify logic before integrating it (e.g., testing a calculation).
- Generating intermediate output to inspect (e.g., a JSON snapshot of character state).
- Storing a patch or diff for review before applying it.
- Producing a one-off migration / data-transformation script.
- Exporting a file that will be fed back into another tool in the same session.

Do **not** create temp files just to pass data between two sequential tool calls — use in-memory reasoning instead.
