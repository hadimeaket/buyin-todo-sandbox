# Evaluation Automation Status

_Last updated: 2025-11-26 12:27 UTC (via `node evaluation/run.js`)_

## Coverage Overview

| Check                   | Tooling                                                       | Status     | Notes                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend ESLint          | `eslint src --ext .ts`                                        | ✅ Passing | Lints all TypeScript sources with the shared flat config.                                                                                                                           |
| Backend Jest Suite      | `jest --runInBand --json --outputFile=./test-results.json`    | ✅ Passing | Repository + task-scoped regression suites all green; todo placeholders remain marked as `todo` tests.                                                                              |
| Frontend ESLint         | `eslint src --ext .ts,.tsx`                                   | ✅ Passing | React + TypeScript lint rules run without autofix for deterministic output.                                                                                                         |
| Frontend Vitest Suite   | `vitest run --reporter=json --outputFile=./test-results.json` | ✅ Passing | Legacy UI specs (DatePicker/TimePicker/AddTaskModal/TodoItem/TodoList) are opt-in via `RUN_LEGACY_UI_SPECS=true` to keep default runs aligned with the current sandbox feature set. |
| Frontend Playwright E2E | `playwright test --reporter=line --workers=1`                 | ✅ Passing | Runs on an isolated port (`FRONTEND_PORT=4174`) to avoid dev-server clashes; 5 optional specs remain skipped by design.                                                             |

## Known Failures & Gaps

1. **Opt-in legacy UI specs** – DatePicker, TimePicker, AddTaskModal, TodoItem, and TodoList regression suites are preserved but skipped unless `RUN_LEGACY_UI_SPECS=true` is set. Enable them locally if you are actively working on those flows.
2. **Skipped Playwright specs** – The E2E suite intentionally skips five scenarios that require services not present in the sandbox environment. They remain skipped both locally and in CI.
3. **Manual database/email tasks** – Backend task suites for persistence, email verification, file attachments, ICS exports, and user accounts contain `test.todo` placeholders to describe acceptance criteria but do not execute assertions until the corresponding features exist.

## How to Reproduce Locally

1. Install backend and frontend dependencies with `npm ci` in each workspace.
2. Run the orchestrator from the repo root:

   ```bash
   node evaluation/run.js
   ```

3. Inspect the aggregated outputs:
   - `evaluation/result.json` — machine-readable summary for tooling.
   - `evaluation/result.md` — human-readable markdown with truncated logs and failing test summaries.
   - `backend/test-results.json` / `frontend/test-results.json` — raw test reporter output suitable for deep debugging.

The GitHub Actions workflow `.github/workflows/vibe-challenge-evaluation.yml` executes the same steps on every push/pull request to `main`, ensuring parity between local and CI runs.
