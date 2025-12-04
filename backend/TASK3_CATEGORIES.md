# Kategorien (Task 3) - API Dokumentation

## Übersicht

Die Kategorien-Funktion ermöglicht es Benutzern, farbige Kategorien für ihre Todos zu erstellen und zu verwalten.

## Features

✅ **CRUD-Operationen** für Kategorien
✅ **HEX-Farbvalidierung** (#RGB oder #RRGGBB)
✅ **Kategorie einem Todo zuweisen**
✅ **Todo zeigt Farbe** der zugewiesenen Kategorie
✅ **Authentifizierung erforderlich** (Integration mit Task 2)
✅ **User-Scoping** - Jeder Nutzer sieht nur seine eigenen Kategorien

## API Endpoints

### 1. Kategorie erstellen

```http
POST /api/categories
```

**Request Body:**

```json
{
  "name": "Arbeit",
  "color": "#FF5733"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "name": "Arbeit",
    "color": "#FF5733",
    "createdAt": "2025-12-04T10:00:00.000Z",
    "updatedAt": "2025-12-04T10:00:00.000Z"
  }
}
```

**Fehler:**

- `400` - Ungültiges HEX-Format, Name fehlt, oder Kategorie existiert bereits
- `401` - Nicht authentifiziert

---

### 2. Alle Kategorien abrufen

```http
GET /api/categories
```

**Response (200 OK):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid1",
      "userId": "user-uuid",
      "name": "Arbeit",
      "color": "#FF5733",
      "createdAt": "2025-12-04T10:00:00.000Z",
      "updatedAt": "2025-12-04T10:00:00.000Z"
    },
    {
      "id": "uuid2",
      "userId": "user-uuid",
      "name": "Privat",
      "color": "#33FF57",
      "createdAt": "2025-12-04T10:05:00.000Z",
      "updatedAt": "2025-12-04T10:05:00.000Z"
    }
  ]
}
```

---

### 3. Einzelne Kategorie abrufen

```http
GET /api/categories/:id
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "name": "Arbeit",
    "color": "#FF5733",
    "createdAt": "2025-12-04T10:00:00.000Z",
    "updatedAt": "2025-12-04T10:00:00.000Z"
  }
}
```

**Fehler:**

- `404` - Kategorie nicht gefunden

---

### 4. Kategorie aktualisieren

```http
PUT /api/categories/:id
```

**Request Body:**

```json
{
  "name": "Work",
  "color": "#FF6633"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "name": "Work",
    "color": "#FF6633",
    "createdAt": "2025-12-04T10:00:00.000Z",
    "updatedAt": "2025-12-04T10:30:00.000Z"
  }
}
```

**Fehler:**

- `400` - Ungültige Daten
- `404` - Kategorie nicht gefunden

---

### 5. Kategorie löschen

```http
DELETE /api/categories/:id
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Hinweis:** Beim Löschen einer Kategorie wird `categoryId` bei allen zugehörigen Todos auf `null` gesetzt.

---

## Todo mit Kategorie

### Todo mit Kategorie erstellen

```http
POST /api/todos
```

**Request Body:**

```json
{
  "title": "Meeting vorbereiten",
  "description": "Agenda erstellen",
  "categoryId": "category-uuid"
}
```

**Response:** Todo mit `category`-Objekt:

```json
{
  "id": "todo-uuid",
  "userId": "user-uuid",
  "title": "Meeting vorbereiten",
  "categoryId": "category-uuid",
  "category": {
    "id": "category-uuid",
    "name": "Arbeit",
    "color": "#FF5733",
    ...
  },
  ...
}
```

### Todo-Kategorie aktualisieren

```http
PUT /api/todos/:id
```

**Request Body:**

```json
{
  "categoryId": "new-category-uuid"
}
```

Um die Kategorie zu entfernen:

```json
{
  "categoryId": null
}
```

---

## Validierung

### HEX-Farbformat

- ✅ `#RGB` - Kurzformat (z.B. `#F00`)
- ✅ `#RRGGBB` - Vollformat (z.B. `#FF0000`)
- ❌ `FF0000` - Kein `#`-Prefix
- ❌ `#GGGGGG` - Ungültige Zeichen
- ❌ `#12345` - Falsche Länge

**Regex:** `/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/`

### Kategoriename

- Min: 1 Zeichen (nach Trimming)
- Max: 50 Zeichen
- Muss eindeutig sein pro Benutzer

---

## Datenbank-Schema

### `categories` Tabelle

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_categories_userId ON categories(userId);
CREATE UNIQUE INDEX idx_categories_userId_name ON categories(userId, name);
```

### `todos` Tabelle (erweitert)

```sql
ALTER TABLE todos ADD COLUMN categoryId TEXT;
CREATE INDEX idx_todos_categoryId ON todos(categoryId);
```

---

## Integration mit Task 2 (Authentifizierung)

Alle Category-Endpoints benötigen Authentifizierung:

- `requireAuth` Middleware wird angewendet
- `userId` wird aus Session extrahiert
- Kategorien sind nutzer-spezifisch (User-Scoping)
- Nur eigene Kategorien sind sichtbar und bearbeitbar

---

## Beispiel-Workflow

1. **Benutzer registrieren/einloggen** (Task 2)
2. **Kategorie erstellen:**
   ```bash
   POST /api/categories
   { "name": "Urgent", "color": "#FF0000" }
   ```
3. **Todo mit Kategorie erstellen:**
   ```bash
   POST /api/todos
   { "title": "Fix bug", "categoryId": "category-id" }
   ```
4. **Todos abrufen** (mit Category-Informationen):
   ```bash
   GET /api/todos
   ```
   → Jedes Todo enthält `category`-Objekt mit Farbe

---

## Fehlerbehandlung

| Status | Beschreibung                             |
| ------ | ---------------------------------------- |
| 200    | Erfolg                                   |
| 201    | Ressource erstellt                       |
| 400    | Validierungsfehler (HEX, Name, Duplikat) |
| 401    | Nicht authentifiziert                    |
| 404    | Ressource nicht gefunden                 |
| 500    | Server-Fehler                            |
