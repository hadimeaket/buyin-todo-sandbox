FROM mongo:7.0

# Setze Umgebungsvariablen für MongoDB
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=admin123
ENV MONGO_INITDB_DATABASE=notes_db

# Kopiere Initialisierungsskript
COPY init-mongo.js /docker-entrypoint-initdb.d/

# Exponiere MongoDB Port
EXPOSE 27017

# Volume für persistente Daten
VOLUME ["/data/db"]
