# Test Adjustments for Empirical Evaluation

To ensure a fair and architecture-agnostic evaluation of the VibeCoding Challenge results, the automated tests for Tasks 2-5 were refactored. The original tests were placeholders ("NOT IMPLEMENTED") or too strict regarding implementation details.

## General Changes

- **Architecture-Agnostic:** Tests now verify behavior via the public API (`supertest`) instead of importing internal services.
- **Heuristic Validation:** Tests accept multiple valid field names (e.g., `token`, `accessToken`, `jwt`) and status codes (200, 201).
- **Robustness:** Tests handle missing dependencies (e.g., auth failure skips dependent tests instead of failing everything).

## Task-Specific Adjustments

### Task 2: Authentifizierung

- **Old:** Threw "NOT IMPLEMENTED".
- **New:**
  - Verifies `POST /api/auth/register` accepts email/password.
  - Verifies `POST /api/auth/login` returns a token.
  - Verifies `GET /api/todos` is protected.
  - Accepts variations in token response field.

### Task 3: Kategorien

- **Old:** No backend test.
- **New:**
  - Verifies creation of Todo with `category` field.
  - Attempts both inline string categories and relation-based categories (creating category first).
  - Verifies persistence of category data.

### Task 4: Attachments

- **Old:** Threw "NOT IMPLEMENTED".
- **New:**
  - Simulates `multipart/form-data` upload via `supertest`.
  - Verifies response contains attachment metadata.
  - Does not enforce specific storage backend (local vs. DB).

### Task 5: Kalender

#### T5 False-Positive Diagnosis

**Observed evaluation contradiction:** In `task_pipeline_v2.json`, many branches were marked `verified.T5=true` while `implemented.T5=false` for all branches (based on `deep_code_analysis.json`). Regardless of which metric is “right”, this indicates the Task 5 verification instrument was not aligned with the intended calendar/multi-day semantics.

**Root causes in the previous Task 5 backend test (injected via `evaluation/tests/task5.calendar.test.ts`):**

- It tested _single-day_ date filtering (`GET /api/todos?start=today&end=today`) using only a single date field (`dueDate`), not true multi-day todos.
- It effectively measured “supports date filtering” (and only for single-day items), which can be implemented independently of multi-day calendar capability.
- Most importantly: if authentication failed to return a token, the test returned early (`if (!authToken) return;`) and therefore **passed without validating anything**, which can inflate `verified.T5`.

**Branch sampling (mandatory sample; 5 branches with `verified.T5=true` in v2):**

- Theuerkauf-Jochen-vibe
- akbulut-burak-vibe
- allamani-rando-vibe
- august-martin-vibe
- bektas-cengizhan-vibe

Across these sampled branches, the backend frequently exposed or persisted an explicit multi-day range using fields like `dueDate` + `dueEndDate` (confirmed via API probing). This indicates that at least some v2 “verified” results were not necessarily false positives; however, the previous test still failed to validate the _calendar semantics_ that the frontend needs.

#### Done-When Definition (Task 5)

For Task 5, “done” is defined behaviorally via the backend API:

- A todo can represent a **true multi-day range** with $end > start$ (any of the accepted field-pairs).
- The multi-day range is **persisted and readable** via `GET /api/todos`.
- `GET /api/todos?start=...&end=...` performs **overlap-aware filtering** such that:
  - querying a day inside the multi-day range includes the spanning todo, and
  - querying that same day excludes a todo clearly outside the range.

This is intentionally stricter than “just storing two dates”, because generic CRUD persistence alone does not guarantee calendar usability.

#### New Test Behavior

The injected Task 5 test now:

- Creates a multi-day todo ($end = start + 2$ days), trying several common field name pairs (`dueDate`/`dueEndDate`, `startDate`/`endDate`, `start`/`end`, `from`/`to`).
- Validates the created todo is readable and contains a parsed range with $end > start$.
- Creates a clearly outside-range todo and asserts date filtering excludes it while including the spanning todo for the “middle day” query.
- Adds a negative control ensuring an `end == start` range is not treated as multi-day.
- Removes the previous silent-pass behavior: if the API requires auth but auth cannot be obtained, the test fails (it cannot evaluate calendar behavior).

**Trade-off:** This reduces false positives, but may increase false negatives for branches that store multi-day fields without implementing overlap-aware filtering.
