# Prompt Examples

## T1
**Branch:** akbulut-burak-vibe

> ...e/cgoek/Studium/BA/buyin-todo-sandbox/backend/src/models/Todo.ts)    Basierend auf dem Screenshot und der Codebase-Analyse erstelle ich dir einen optimalen Prompt:    ---    ## **Optimaler Prompt für Task 1: Persistente Todos mit SQLite**    ```  Implementiere persistente Datenspeicherung für die Todo-App mit SQLite.    **Kontext:**  Die App nutzt aktuell ein In-Memory Repository (`InMemoryTodoRepository` in `backend/src/repositories/TodoRepository.ts`), wodurch alle Todos nach einem Server-Reload verloren gehen.    **Anforderungen:**    1. **SQLite-Datenbank einrichten:**     - Installiere `better-sqlite3` und `@types/better-sqlite3` als Dependencies     - Erstelle eine Datei `backend/src/d...

**Branch:** Dogan-Mansur-vibe

> ...d and removed  ✅ All changes staged (68 files)  ✅ Committed with message "Vibe coding challenge completed"  ✅ Pushed to `Dogan-Mansur-vibe` branch on GitHub    **Summary of implemented features:**  - Task 1: SQLite persistence with better-sqlite3  - Task 2: User authentication with JWT (registration, login, user isolation)  - Task 3: Categories with HEX color validation and badges  - Task 4: File attachments (upload/download PNG/JPG/PDF, max 5MB)  - Task 5: Multi-day calendar rendering with category colors  - Task 6: Email verification system (token-based, 24h expiry, console logging)  - Task 7: Performance optimization (pagination with infinite scroll for 1000+ todos)  - Task 8: ICS export...

**Branch:** goek-yasin-vibe

> ...!  ChatGPT said:    Thought for 14s  Perfekt, wir machen das wie ein „Operator“: ich baue dir die Prompts, du gibst sie 1:1 an Claude Sonnet weiter und lässt ihn den Code schreiben.  Wir starten mit Aufgabe 1: Persistente Todos (SQLite) und gehen wirklich Schritt für Schritt.    Gesamtplan für Aufgabe 1 (nur damit du weißt, was wir tun)  Architektur verstehen: Wo ist das InMemoryTodoRepository, wie laufen Requests vom Frontend zum Backend?    Datenbank wählen & einbauen: SQLite im Backend mit minimalem Setup (z. B. better-sqlite3 oder sqlite3).    Todo-Tabelle anlegen: einfache Migration/Init-Script.    Neues SqliteTodoRepository implementieren und das bisherige InMemoryTodoRepository erset...

**Branch:** tselekoglou-ioannis-vibe

> ...utes, main UI components)     - Any existing validation or error handling patterns     - List 3-5 files that will be most important for implementing persistence    **Important:**   We will start with Task 1 (Persistent Todos) next, which requires replacing the in-memory storage with SQLite. Don't implement anything yet—just understand the current structure.    Please work methodically and provide a clear summary before we proceed.    GitHub Copilot: I'll systematically explore this repository to understand its structure and current implementation. Let me start by gathering information.     Read [](file:///c%3A/Users/janni/g%C3%B6k_ba/buyin-todo-sandbox/README.md#1-1), lines 1 to 100    Read...

**Branch:** helling-max-vibe

> ...s/react-window --save    Ran terminal command: cd /home/cgoek/Studium/BA/buyin-todo-sandbox/frontend && npm install react-window @types/react-window --save    Starting: *Implement SQLite persistence (Task 1)* (2/9)    Now let me read the current Todo model and TodoRepository to understand the structure:     Read [](file:///home/cgoek/Studium/BA/buyin-todo-sandbox/backend/src/models/Todo.ts)    Read [](file:///home/cgoek/Studium/BA/buyin-todo-sandbox/backend/src/repositories/TodoRepository.ts#1-1), lines 1 to 100    Read [](file:///home/cgoek/Studium/BA/buyin-todo-sandbox/backend/src/repositories/TodoRepository.ts#100-100), lines 100 to 125    Now let me create the SQLite repository and updat...

**Branch:** allamani-rando-vibe

> .../Studium/BA/buyin-todo-sandbox/backend && npm test 2>&1 | grep -A 5 "Test Suites:"    The 12 failed tests are for unimplemented features (tasks 2, 4, 6, 8), which is expected. The important tests for task 1 (persistent todos) are passing. Let me verify the implementation is complete by checking the git diff:     Read changed files in [](file:///home/cgoek/Studium/BA/buyin-todo-sandbox)    Perfect! Let me compile and verify the complete implementation is working:     Ran terminal command: cd /home/cgoek/Studium/BA/buyin-todo-sandbox/backend && npm test -- tests/task1.persistent-todos.test.ts 2>&1 | tail -20    Perfect! All implementation is complete. Let me create a summary of what was implem...

## T2
**Branch:** akbulut-burak-vibe

> ...- ✅ Todo-API erkennt authentifizierten User  - ✅ Todos werden korrekt geladen    Teste jetzt die UI unter http://localhost:5173!    Made changes.  Burak Akbulut: Führe die Aufgabe 3 parallel während Aufgabe 2 gemacht wird. Die Aufgabe 3 soll alles was in Aufgabe 2 steht und noch stehen wird berücksichtigen    GitHub Copilot: Ich verstehe, dass Sie möchten, dass ich Aufgabe 3 (Kategorien) parallel zu Aufgabe 2 implementiere. Allerdings sehe ich aktuell nicht die Details von Aufgabe 2 in Ihrem Workspace oder in den Anhängen.    Um Aufgabe 3 korrekt zu implementieren und dabei alles aus Aufgabe 2 zu berücksichtigen, benötige ich:    1. **Die Details von Aufgabe 2** - Was genau wird dort implem...

**Branch:** Dogan-Mansur-vibe

> ...cker-compose restart frontend    Ran terminal command: docker logs todo-frontend --tail 30    Completed: *Frontend-Integration testen* (7/7)    Perfekt! Ich habe die komplette Authentifizierung für **Task 2** implementiert:    ## ✅ Backend (bereits getestet und funktioniert):  - **User-Registrierung**: Email + Passwort (min. 8 Zeichen)  - **bcrypt** für sicheres Password-Hashing  - **JWT-Token** mit 7 Tagen Gültigkeit  - **Login-Endpoint** mit Validierung  - **Auth-Middleware** schützt alle Todo-Routen  - **User-Isolation**: Todos sind per `userId` gefiltert - jeder User sieht nur seine eigenen    ## ✅ Frontend (neu implementiert):  - **AuthContext**: Verwaltet User-State, Token in localStor...

**Branch:** goek-yasin-vibe

> ...gone,    empty title → visible error in UI.    Provide the Dockerfile / docker-compose changes as full snippets so I can paste them directly.    Wenn du willst, machen wir danach genau so weiter mit Aufgabe 2 (User Accounts).  Sag einfach Bescheid, sobald du Claude mit Schritt 1 gefüttert hast und was er geantwortet hat – dann passe ich die nächsten Prompts fein an eure konkrete Codebasis an.    You said:  auf deutsch   ChatGPT said:  Alles klar — hier ist alles auf Deutsch, perfekt formatiert, damit du es 1:1 an Claude Sonnet weitergeben kannst.  Wir gehen Aufgabe für Aufgabe, Schritt für Schritt.  Start ist Aufgabe 1: Persistente Todos (SQLite).    ✅ ALLGEMEINER START-PROMPT (einmalig für...

**Branch:** tselekoglou-ioannis-vibe

> ...todos/*` - All routes now require authentication  - User-scoped data - cada user only accesses their own todos    ### **Next Step: Frontend Integration**  The backend is fully functional. To complete Task 2, we need frontend auth UI. However, this is a significant undertaking.     **Options:**  1. **Continue with full frontend auth** (Login/Register pages, Auth context, token storage, redirects) - ~30-45 min  2. **Stop here and document** - Backend auth is working, frontend can be done separately    The backend authentication system is production-ready. All acceptance criteria for the backend portion are met. Would you like me to proceed with the frontend integration, or should we document w...

**Branch:** helling-max-vibe

> ...packages in parallel at start (`better-sqlite3 bcryptjs jsonwebtoken multer` backend, `react-window` frontend) to avoid context-switching delays during implementation?    2. **SSO implementation** — Task 2 marks Google/Apple SSO as "optional" with mock allowed. Skip SSO entirely and focus on email/password (tests only validate email/password), or add mock SSO route returning hardcoded JWT for bonus points?    3. **Database migrations vs inline schema** — Create proper migration system with versioning, or initialize schema directly in `server.ts` startup? Inline is faster but less scalable—acceptable for 1-hour challenge?    4. **File storage location** — Store attachments in `backend/data/u...

**Branch:** allamani-rando-vibe

> ...nd && npm test 2>&1 | grep -E "(FAIL|PASS)" | head -20    Good! The tests that are failing (task4, task6, task8) are for features that haven't been implemented yet. The important tests for Task 1 and Task 2 are passing. Let me update the todo list and provide a summary.     Completed: *Run and verify tests* (12/12)    Perfect! User authentication feature is fully implemented. Let me verify the implementation once more by checking that all the key components are in place:     Checked , no problems found    Excellent! The user authentication feature has been successfully implemented. Here's a summary:    ## ✅ Task 2: User Authentication - COMPLETED    ### Implementation Summary    **All 4 test...

## T3
**Branch:** akbulut-burak-vibe

> ...erung setzt Session-Cookie  - ✅ Todo-API erkennt authentifizierten User  - ✅ Todos werden korrekt geladen    Teste jetzt die UI unter http://localhost:5173!    Made changes.  Burak Akbulut: Führe die Aufgabe 3 parallel während Aufgabe 2 gemacht wird. Die Aufgabe 3 soll alles was in Aufgabe 2 steht und noch stehen wird berücksichtigen    GitHub Copilot: Ich verstehe, dass Sie möchten, dass ich Aufgabe 3 (Kategorien) parallel zu Aufgabe 2 implementiere. Allerdings sehe ich aktuell nicht die Details von Aufgabe 2 in Ihrem Workspace oder in den Anhängen.    Um Aufgabe 3 korrekt zu implementieren und dabei alles aus Aufgabe 2 zu berücksichtigen, benötige ich:    1. **Die Details von Aufgabe 2** -...

**Branch:** Dogan-Mansur-vibe

> ...iert (user1 sieht nur seine Todos, user2 sieht 0)    Die App ist jetzt unter **http://localhost:5173** verfügbar und sollte dich zur Login-Seite umleiten wenn du nicht eingeloggt bist!    hadimeaket: Aufgabe 3    Es müssen noch Kategorien erstellt werden, unter Kategorieren kannst du dir zum Beispiel Sachen vorstellen wie "Gym", "Kochen", "Einkaufen" etc. dort sollen die Nutzer selber Kategorien Erstellen können. Dafür musst du erstmal Kategorien einbauen. Die Aufgabe ist so aufgebaut:  Farbige Kategorien für Todos.  Zu tun:  • Kategorien CRUD  • HEX-Farbvalidierung  • Kategorie einem Todo zuweisen  Fertig, wenn:  • Kategorie erstellt werden kann  • Todo zeigt Farbe  • Ungültige Farbe → Fehl...

**Branch:** goek-yasin-vibe

> ...r-Flow    Logout-Flow    automatische UI-Umschaltung    User-spezifische Todos    Das ist im echten Leben ein kompletter Fullstack-Mini-SaaS.    Dein Bruder wird dich dafür feiern. 😄    🔥 Willst du Aufgabe 3 bauen? (Attachments für Todos)  Das wäre:    Upload von Bildern/PDFs pro Todo    Speicherung im Docker-Volume    Sichtbarkeit nur für den eigenen User    Download-API    UI-Integration mit Drag-and-Drop oder Button    Thumbnails / Icons im UI    Oder:    🔥 Willst du vorher Aufgabe 4 machen? (ICS-Export)  „Add task → export as .ics → Outlook/Apple/Google Calendar kompatibel“    Oder willst du etwas anderes?    Sag einfach:    👉 3 = wir starten File-Attachments  👉 4 = wir starten ICS...

**Branch:** tselekoglou-ioannis-vibe

> ...named color (red)** - rejected with error message    ✅ **Category assignment to todo** - working (category_id stored)    ✅ **Category deletion cascade** - working (todo's category_id set to NULL)    Task 3 backend is complete. The category system is fully functional with:  - User-scoped categories  - HEX color validation (#RRGGBB format)  - CRUD operations (create, read, update, delete)  - Category assignment to todos  - Graceful handling of category deletion (todos retain data but lose category reference)    Made changes.    IoannisTselekoglou: **Task: Implement File Attachments for Todos**    **Goal:**  Allow users to upload and download files attached to their todos.    **Requirements:**...

**Branch:** helling-max-vibe

> ...g  - JWT middleware for protected routes  - Auth routes: `/api/auth/register`, `/api/auth/login`  - Password validation (minimum 8 characters)  - All todo endpoints scoped to authenticated users    **Task 3: Categories** ✅  - Category model with HEX color validation  - CategoryRepository and CRUD endpoints  - HEX regex validation (`^#[0-9A-Fa-f]{6}$`)  - Added `categoryId` to Todo model    **Task 4: File Attachments** ✅  - Attachment model and repository  - Multer middleware with file validation (PNG/JPG/PDF, max 5MB)  - Upload, download, and delete endpoints  - Files stored in uploads    **Task 6: Email Verification** ✅  - Verification token generation (24h expiry)  - Token logged to stdout...

## T4
**Branch:** Dogan-Mansur-vibe

> ...Category-Manager Modal zum Erstellen/Bearbeiten/Löschen von Kategorien  - Farbiger Badge bei Todos mit Kategorie  - Category-Auswahl im "Add Task" Modal    Made changes.    hadimeaket: Bevor wir mit Aufgabe 4 weitermachen, baue ein das man den Login Button bzw. registeiren Button je nachdem in welchem modus man ist (White Mode/Dark mode) erkennbar ist. Akteull ist es so wenn ich im White mode bin, sehe ich nicht den Login button weil der weiß ist. Danach mache Aufgabe 4.  Ich möchte Dateianhänge hinzufügen, dafür musst du das erstmal einbauen. Das ich überhaupt an Todos Dateien anhängen kann. Die Aufgabe lautet: Anhänge zu Todos hochladen.  Zu tun:  • Upload zu einem Todo  • Erlaubt: PNG /...

**Branch:** goek-yasin-vibe

> ...do    Speicherung im Docker-Volume    Sichtbarkeit nur für den eigenen User    Download-API    UI-Integration mit Drag-and-Drop oder Button    Thumbnails / Icons im UI    Oder:    🔥 Willst du vorher Aufgabe 4 machen? (ICS-Export)  „Add task → export as .ics → Outlook/Apple/Google Calendar kompatibel“    Oder willst du etwas anderes?    Sag einfach:    👉 3 = wir starten File-Attachments  👉 4 = wir starten ICS Export  👉 STOP = wir hören auf    Du entscheidest.    You said:  gib drei hadi   ChatGPT said:    Thought for 9s  Jawoll, Aufgabe 3 incoming 😎📎    Wir machen wieder zuerst Plan mit Claude, dann Umsetzung.  Hier ist dein nächster Prompt für Sonnet – einfach rüberkopieren:    Prompt...

**Branch:** tselekoglou-ioannis-vibe

> ...CRUD is straightforward  Main complexity is the color validation and visual display  The "what happens on delete?" question is important architectural decision  Should we adjust anything or move to Task 4?  J  can you write a prompt but it should just make sure that we solve the task without any extras. I feel like it does a bit to much and gets lost:  Task 3: Categories - Simplified Prompt  **Task: Implement Colored Categories for Todos**    **Requirements:**    1. **Category CRUD:**     - Create, read, update, delete categories     - Each category has: name and color (HEX format)     - Categories are scoped per user    2. **HEX Color Validation:**     - Only accept format: #RRGGBB (e.g.,...

**Branch:** helling-max-vibe

> ...**Task 3: Categories** ✅  - Category model with HEX color validation  - CategoryRepository and CRUD endpoints  - HEX regex validation (`^#[0-9A-Fa-f]{6}$`)  - Added `categoryId` to Todo model    **Task 4: File Attachments** ✅  - Attachment model and repository  - Multer middleware with file validation (PNG/JPG/PDF, max 5MB)  - Upload, download, and delete endpoints  - Files stored in uploads    **Task 6: Email Verification** ✅  - Verification token generation (24h expiry)  - Token logged to stdout during registration  - `/api/auth/verify/:token` endpoint  - Login blocked for unverified email/password users  - SSO users auto-verified    **Task 8: ICS Export** ✅  - Manual RFC 5545 compliant...

## T5
**Branch:** Dogan-Mansur-vibe

> ...d implementieren  Fertig, wenn:  • Upload funktioniert  • Zu groß → Fehler  • Falsches Format → Fehler  • Download funktioniert  Nachdem du Aufgabe 4 Vollständig erledigt hast und getestet. Mache mit Aufgabe 5 "Mehrtages-Todos" weiter:  Todos sollen im Kalender mehrere Tage  überspannen.  Zu tun:  • Balken über mehrere Tage rendern  • Überlappungen visuell erhalten  • Kategorie-Farben anzeigen  Fertig, wenn:  • 3-Tages-Todo → 3-Tages-Balken  • Überlappungen sichtbar  • Farben korrekt.  Nachdem du Aufgabe 5 Vollständig durchgeführt und getestet hast, mache mit Aufgabe 6 "E-Mail-Bestätigung" weiter. Die Aufgabe lautet: Nur für Nutzer, die sich mit E-Mail + Passwort  registrieren. SSO-Nutzer ge...

**Branch:** tselekoglou-ioannis-vibe

> ...Todos should span multiple days in the calendar. To do: • Render multi-day bars • Keep overlaps visible • Show category colors Done when: • 3-day todo → 3-day bar • Overlaps visible • Colors correct  Task 5: Multi-day Todos - Implementation Prompt  **Task: Implement Multi-day Todo Display in Calendar**    **Goal:**  Todos should visually span multiple days in the calendar view as continuous bars, with proper overlap handling and category colors.    **Requirements:**    1. **Multi-day Date Range:**     - Add end_date field to todos (start_date already exists)     - Allow users to set start and end dates when creating/editing todos     - End date is optional (single-day todos remain valid)...

**Branch:** helling-max-vibe

> ...LETED:**    **Task 7: Performance Optimization** 🟡  - Installed `react-window` library  - Backend ready for pagination  - **NEEDS**: Frontend virtualization implementation in TodoList component    **Task 5: Multi-day Calendar Bars** 🟡  - Data model supports `dueDate` + `dueEndDate`  - Backend includes category colors  - **NEEDS**: Frontend MonthView rendering logic for spanning bars    ### 📋 **REMAINING FRONTEND WORK (10-15 minutes):**    1. **Create Login/Register Components** (5 min)  2. **Integrate react-window in TodoList** (3 min)  3. **Add Category UI (badge + selector)** (4 min)  4. **Multi-day calendar rendering** (5 min)  5. **ICS Export button in AppBar** (2 min)  6. **Attachmen...

