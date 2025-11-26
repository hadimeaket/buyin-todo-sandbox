# BuyIn Todo Sandbox

This repository is the automation playground for the BuyIn bachelor thesis. It mirrors the “challenge” surface that students are evaluated against: a lightweight todo backend, an expressive React frontend, and an orchestration script that proves whether automation tasks (linting, regression tests, E2E flows) succeed.

## Purpose

- **Benchmark real work** – Each backend or frontend task corresponds to a concrete business expectation (attachments, ICS export, multi-day calendar, etc.). Automated suites document what “done” means without a production deployment.
- **Grade automatically** – `evaluation/run.js` stitches together ESLint, Jest, Vitest, and Playwright, then emits JSON/Markdown so instructors can verify deliverables quickly.
- **Guide contributors** – The repo layout and docs keep bachelor candidates focused on the scenarios they must implement or debug, instead of reverse-engineering requirements from external slide decks.

## What to Know

| Area               | Why it matters for the bachelor                                                                                                               | Where to look                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Core todo domain   | Minimal Express API exposing CRUD plus task-specific hooks (file upload, recurring events, etc.). Task suites describe acceptance criteria.   | `backend/src`, `backend/tests`                                         |
| Challenge UI       | React SPA showcasing modal creation, grouped lists (“Today”, “Tomorrow”, “Overdue”), multi-day calendar bars, and performance stressors.      | `frontend/src/features`, `frontend/src/components/ui`                  |
| Automation harness | One command (`node evaluation/run.js`) drives lint/unit/E2E runs. GitHub Actions reuses the same script, so green locally equals green in CI. | `evaluation/run.js`, `.github/workflows/vibe-challenge-evaluation.yml` |
| Status artifact    | Up-to-date pass/fail record plus coverage commentary for supervisors.                                                                         | `EVALUATION_AUTOMATION_STATUS.md`                                      |

## Daily Workflow

```bash
npm ci --prefix backend
npm ci --prefix frontend
node evaluation/run.js
```

1. Install dependencies per workspace.
2. Implement or debug the relevant challenge task (backend specs in `backend/tests`, UI/Vitest specs in `frontend/tests`, Playwright flows in `frontend/e2e`).
3. Run `node evaluation/run.js` to generate `evaluation/result.json` and `evaluation/result.md`. The script forces `CI=1` and binds Playwright to an isolated port so it never clashes with local dev servers.
4. Push your branch—GitHub Actions executes the exact same script and uploads the artifacts for review.

## Constraints & Tips

- **Legacy UI suites** (DatePicker, TimePicker, AddTaskModal, TodoItem, TodoList) are opt-in via `RUN_LEGACY_UI_SPECS=true`. They capture historical flows but are not part of the bachelor baseline.
- **Backend task specs** rely on in-memory repositories plus `test.todo` placeholders. Passing specs proves the contract; filling TODOs activates the assertions.
- **Frontend E2E** focuses on Vibe Challenge scenarios (persistent todos, multi-day calendar bars, virtualization performance). Keep DOM hooks stable when iterating on UI.
- **Evaluation artifacts** (`evaluation/result.*`, test-result JSON files) are generated—don’t hand-edit them.

## Need More Detail?

- Current pass/fail snapshot & coverage commentary: `EVALUATION_AUTOMATION_STATUS.md`.
- Full repo tree, Docker scripts, and classic setup instructions exist in the Git history if ever required, but intentionally trimmed here to keep the bachelor documentation focused.
- Docker Compose

### Development Mode (with Hot Reload)

Build and start all services in development mode:

```bash
docker-compose up -d --build
```

Or just start (if already built):

```bash
docker-compose up -d
```

The frontend runs with Vite dev server and hot reload enabled. Any changes to files in `frontend/src/` will automatically reload in the browser.

### Access the Application

- **Frontend**: http://localhost:5173 (Development with hot reload)
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

### Production Mode

For production deployment without hot reload, update `docker-compose.yml`:

1. Change `dockerfile: Dockerfile.dev` to `dockerfile: Dockerfile`
2. Change port mapping from `5173:5173` to `80:80`
3. Remove the `volumes` section from the frontend service
4. Remove the `CHOKIDAR_USEPOLLING` environment variable

Then rebuild:

```bash
docker-compose up -d --build
```

Access at: http://localhost

### View Logs

View logs from all services:

```bash
docker-compose logs -f
```

View logs from a specific service:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

Stop services:

```bash
docker-compose stop
```

Stop and remove containers, networks:

```bash
docker-compose down
```

Stop and remove everything including images:

```bash
docker-compose down --rmi all
```

## API Endpoints

### Health Check

- **GET** `/api/health` - Check API health status
  - Response: `{ status: "ok", timestamp: "...", uptime: 123.45 }`

### Todos

- **GET** `/api/todos` - Get all todos

  - Response: Array of todo objects

- **GET** `/api/todos/:id` - Get a specific todo by ID

  - Response: Todo object or 404

- **POST** `/api/todos` - Create a new todo

  - Request Body: `{ "title": "Todo title" }`
  - Response: Created todo object

- **PUT** `/api/todos/:id` - Update a todo

  - Request Body: `{ "title": "New title", "completed": true }`
  - Response: Updated todo object or 404

- **PATCH** `/api/todos/:id/toggle` - Toggle todo completion status

  - Response: Updated todo object or 404

- **DELETE** `/api/todos/:id` - Delete a todo
  - Response: 204 No Content or 404

### Todo Object Structure

```json
{
  "id": "uuid-string",
  "title": "Todo title",
  "completed": false,
  "createdAt": "2025-11-15T10:30:00.000Z",
  "updatedAt": "2025-11-15T10:30:00.000Z"
}
```

## Development

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Testing

### Backend Tests

The backend uses Jest for testing. Tests are located alongside the source files with `.test.ts` extension.

Run tests:

```bash
cd backend
npm test
```

### Frontend Tests

The frontend uses Vitest and React Testing Library. Tests are located alongside components with `.test.tsx` extension.

Run tests:

```bash
cd frontend
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## Automated Evaluation & CI

- Run `node evaluation/run.js` from the repo root to execute backend/frontend linting, unit tests, and Playwright E2E suites in one shot. The runner enforces `CI=1`, truncates noisy logs, and writes machine-readable results to `evaluation/result.json` plus a human summary in `evaluation/result.md`.
- Generated test reports (`backend/test-results.json`, `frontend/test-results.json`) provide detailed failure diagnostics and are automatically refreshed whenever the evaluation script runs.
- GitHub Actions workflow `.github/workflows/vibe-challenge-evaluation.yml` executes the same script on every push and pull request targeting `main`, ensuring the Vibe Challenge checks remain reproducible in CI. The workflow uploads the evaluation artifacts so failures can be inspected without rerunning locally.
- Current automation coverage and the latest run status (including any intentionally failing suites) are tracked in `EVALUATION_AUTOMATION_STATUS.md`.
- Legacy component regression suites (DatePicker, TimePicker, AddTaskModal, TodoItem, TodoList) are skipped by default to match the sandbox UI; set `RUN_LEGACY_UI_SPECS=true` before running Vitest if you need to exercise them locally.

## Architecture Notes

### Backend Architecture

- **Repository Pattern**: Data access is abstracted through repositories for easy replacement of storage mechanisms
- **Controller Pattern**: Business logic is separated from route handlers
- **Middleware**: Centralized error handling and request logging
- **In-Memory Storage**: Currently uses an in-memory array (easily replaceable with a database)

### Frontend Architecture

- **Component-Based**: Modular React components with single responsibility
- **Service Layer**: API calls are abstracted in a dedicated service layer
- **Type Safety**: Full TypeScript coverage with strict type checking
- **State Management**: React hooks (useState, useEffect) for local state

## Future Enhancements

- [ ] Add database persistence (PostgreSQL, MongoDB)
- [ ] Implement user authentication and authorization
- [ ] Add todo categories/tags
- [ ] Implement due dates and reminders
- [ ] Add todo search and filtering
- [ ] Implement pagination for large todo lists
- [ ] Add unit tests for controllers
- [ ] Add E2E tests with Playwright or Cypress
- [ ] Implement CI/CD pipeline
- [ ] Add monitoring and logging (e.g., Winston, Prometheus)

## License

ISC
