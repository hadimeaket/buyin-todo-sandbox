# Notizen-System mit MongoDB

Persistentes Notizen-System mit MongoDB und Docker.

## 🚀 Quick Start

```bash
# Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down

# Container stoppen und Daten löschen
docker-compose down -v
```

## 📋 Features

- **Persistente Datenspeicherung** mit Docker Volumes
- **Schema-Validierung** für Datenintegrität
- **Full-Text Search** über Titel und Inhalt
- **Indexierung** für optimale Performance
- **Web-UI** mit MongoDB Express (Port 8081)

## 🗄️ Datenbank-Schema

### Notes Collection

```javascript
{
  title: String (1-200 Zeichen, erforderlich),
  content: String (erforderlich),
  tags: Array<String>,
  category: String (max 50 Zeichen),
  priority: Enum['low', 'medium', 'high'],
  isPinned: Boolean,
  isArchived: Boolean,
  createdAt: Date (erforderlich),
  updatedAt: Date (erforderlich),
  metadata: {
    author: String,
    source: String
  }
}
```

## 🔌 Verbindung

### Für Anwendungen

```
mongodb://notes_user:notes_password@localhost:27018/notes_db
```

### Für Admin-Zugriff

```
mongodb://admin:admin123@localhost:27018/
```

### Web-UI

```
http://localhost:8081
Username: admin
Password: admin123
```

## 📊 Indizes

- **text_search_index**: Full-Text Search auf title und content
- **created_date_index**: Sortierung nach Erstellungsdatum
- **updated_date_index**: Sortierung nach Aktualisierung
- **tags_index**: Filterung nach Tags
- **category_index**: Filterung nach Kategorie
- **pinned_index**: Schneller Zugriff auf angepinnte Notizen

## 🔧 MongoDB Shell Befehle

```bash
# In Container einloggen
docker exec -it notes-mongodb mongosh -u admin -p admin123

# Alle Notizen anzeigen
use notes_db
db.notes.find().pretty()

# Notiz erstellen
db.notes.insertOne({
  title: "Meine Notiz",
  content: "Notizinhalt",
  tags: ["wichtig"],
  category: "Arbeit",
  priority: "high",
  isPinned: false,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date()
})

# Text-Suche
db.notes.find({ $text: { $search: "MongoDB" } })

# Nach Tags filtern
db.notes.find({ tags: "wichtig" })
```

## 🛡️ Security Best Practices

- Standardpasswörter in Produktion ändern
- Netzwerk-Isolation nutzen
- Regelmäßige Backups erstellen
- SSL/TLS für externe Verbindungen aktivieren

## 💾 Backup & Restore

```bash
# Backup erstellen
docker exec notes-mongodb mongodump -u admin -p admin123 --authenticationDatabase admin -o /backup

# Backup wiederherstellen
docker exec notes-mongodb mongorestore -u admin -p admin123 --authenticationDatabase admin /backup
```
