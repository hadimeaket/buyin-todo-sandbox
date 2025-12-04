/**
 * MongoDB Initialisierungsskript für Notizen-Datenbank
 * Erstellt die Datenbank, Collections und Indizes
 */

// Wechsle zur notes_db Datenbank
db = db.getSiblingDB("notes_db");

// Erstelle Collection für Notizen mit Schema-Validierung
db.createCollection("notes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content", "createdAt", "updatedAt"],
      properties: {
        title: {
          bsonType: "string",
          description: "Titel der Notiz - erforderlich",
          minLength: 1,
          maxLength: 200,
        },
        content: {
          bsonType: "string",
          description: "Inhalt der Notiz - erforderlich",
          minLength: 1,
        },
        tags: {
          bsonType: "array",
          description: "Tags für Kategorisierung",
          items: {
            bsonType: "string",
          },
        },
        category: {
          bsonType: "string",
          description: "Kategorie der Notiz",
          maxLength: 50,
        },
        priority: {
          enum: ["low", "medium", "high"],
          description: "Priorität der Notiz",
        },
        isPinned: {
          bsonType: "bool",
          description: "Ist die Notiz angepinnt",
        },
        isArchived: {
          bsonType: "bool",
          description: "Ist die Notiz archiviert",
        },
        createdAt: {
          bsonType: "date",
          description: "Erstellungsdatum - erforderlich",
        },
        updatedAt: {
          bsonType: "date",
          description: "Aktualisierungsdatum - erforderlich",
        },
        metadata: {
          bsonType: "object",
          description: "Zusätzliche Metadaten",
          properties: {
            author: {
              bsonType: "string",
            },
            source: {
              bsonType: "string",
            },
          },
        },
      },
    },
  },
});

// Erstelle Indizes für Performance-Optimierung
db.notes.createIndex(
  { title: "text", content: "text" },
  { name: "text_search_index" }
);
db.notes.createIndex({ createdAt: -1 }, { name: "created_date_index" });
db.notes.createIndex({ updatedAt: -1 }, { name: "updated_date_index" });
db.notes.createIndex({ tags: 1 }, { name: "tags_index" });
db.notes.createIndex({ category: 1 }, { name: "category_index" });
db.notes.createIndex({ isPinned: 1 }, { name: "pinned_index" });

// Erstelle Benutzer mit Lese- und Schreibrechten für notes_db
db.createUser({
  user: "notes_user",
  pwd: "notes_password",
  roles: [
    {
      role: "readWrite",
      db: "notes_db",
    },
  ],
});

// Füge Beispiel-Notizen ein
db.notes.insertMany([
  {
    title: "Willkommen zu deinem Notizen-System",
    content:
      "Dies ist deine erste Notiz. Du kannst Notizen erstellen, bearbeiten, kategorisieren und durchsuchen.",
    tags: ["tutorial", "erste-schritte"],
    category: "System",
    priority: "high",
    isPinned: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      author: "System",
      source: "init",
    },
  },
  {
    title: "MongoDB Features",
    content:
      "MongoDB bietet:\n- Flexible Schema-Struktur\n- Horizontale Skalierung\n- Rich Query Language\n- Aggregation Pipeline\n- Full-Text Search",
    tags: ["mongodb", "datenbank", "features"],
    category: "Technologie",
    priority: "medium",
    isPinned: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      author: "System",
      source: "init",
    },
  },
]);

print("✓ Datenbank initialisiert");
print('✓ Collection "notes" mit Schema-Validierung erstellt');
print("✓ Indizes für Performance erstellt");
print('✓ Benutzer "notes_user" erstellt');
print("✓ Beispiel-Notizen eingefügt");
