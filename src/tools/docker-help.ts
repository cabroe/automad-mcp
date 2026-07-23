import { z } from "zod";

export const dockerHelpInputSchema = z.object({
  topic: z.enum(["all", "setup", "commands", "debug", "compose"]).optional().default("all").describe("Docker help topic"),
});

export type DockerHelpInput = z.infer<typeof dockerHelpInputSchema>;

/**
 * Get Docker testing help for Automad themes
 */
export function getDockerHelp(input: DockerHelpInput): string {
  const { topic } = input;

  if (topic === "setup") {
    return formatSetup();
  }
  if (topic === "commands") {
    return formatCommands();
  }
  if (topic === "debug") {
    return formatDebug();
  }
  if (topic === "compose") {
    return formatCompose();
  }

  return formatAll();
}

function formatAll(): string {
  return [
    formatSetup(),
    "",
    formatCommands(),
    "",
    formatDebug(),
    "",
    formatCompose(),
  ].join("\n---\n\n");
}

function formatSetup(): string {
  return `## Docker Setup für Automad Theme Testing

### Verzeichnisstruktur

\`\`\`
project-root/
├── docker-compose.yml
├── app/                          # Automad Installation (wird beim ersten Start erstellt)
│   └── packages/
│       └── vendor/
│           └── mein-theme/        # DEIN Theme kommt hier hin
│               ├── theme.json
│               └── default.php
\`\`\`

### Voraussetzungen

- Docker + Docker Compose installiert
- Automad Image: \`automad/automad\` (v1 = stable)

### Theme Pfad im Container

**Wichtig:** Themes müssen im Container unter \`/app/packages/<vendor>/<theme>/\` liegen.

\`\`\`bash
# Theme aktivieren (nach Neustart)
docker compose restart
\`\`\``;
}

function formatCommands(): string {
  return `## Docker Commands

### Starten/Stoppen

\`\`\`bash
# Starten (im Hintergrund)
docker compose up -d

# Logs beobachten
docker compose logs -f automad

# Stoppen
docker compose down
\`\`\`

### Theme hinzufügen

\`\`\`bash
# Variante A: Direkt im gemounteten Verzeichnis entwickeln
mkdir -p ./app/packages/vendor
cp -r ./mein-theme ./app/packages/vendor/mein-theme
docker compose restart

# Variante B: In laufenden Container kopieren
docker compose exec automad sh -c 'mkdir -p /app/packages/vendor'
docker compose cp ./mein-theme automad:/app/packages/vendor/mein-theme
docker compose restart
\`\`\`

### Cache leeren

\`\`\`bash
# Im Container
docker compose exec automad rm -rf /app/cache/*

# Oder: Dashboard → System → Clear Cache
\`\`\``;
}

function formatDebug(): string {
  return `## Debugging

### Debug-Modus aktivieren

In \`docker-compose.yml\`:

\`\`\`yaml
services:
  automad:
    environment:
      - AM_DEBUG_ENABLED=true
\`\`\`

\`\`\`bash
docker compose up -d
\`\`\`

### Logs prüfen

\`\`\`bash
# Alle Logs
docker compose logs -f automad

# Nur Fehler
docker compose logs automad | grep -i error

# Account-Daten nach erstem Start
docker compose logs automad | grep -iE "user|password|account"
\`\`\`

### Dashboard Credentials

Beim ersten Start werden automatisch Login-Daten erstellt und geloggt:

\`\`\`bash
docker compose logs automad | grep -iE "user|password|account"
\`\`\`

Dann anmelden: http://localhost:8080/dashboard

### Häufige Probleme

| Symptom | Ursache & Lösung |
|---------|----------------|
| HTTP 403 | Nur \`/app/packages\` gemountet → ganzes \`./app:/app\` mounten |
| Theme nicht in Liste | Theme nicht in \`/app/packages/<vendor>/<theme>/\` oder Neustart fehlt |
| 404 auf localhost:8080 | Port belegt → z.B. \`8081:80\` in compose |
| Änderungen erscheinen nicht | Browser-Cache oder Automad-Cache leeren |
| Theme verschwindet | \`standard\` Theme fehlt → \`./app:/app\` mount prüfen |`;
}

function formatCompose(): string {
  return `## docker-compose.yml Beispiel

\`\`\`yaml
services:
  automad:
    image: automad/automad:v1
    ports:
      - "8080:80"
    volumes:
      - ./app:/app        # WICHTIG: Ganzes /app mounten!
    environment:
      - AM_DEBUG_ENABLED=false

# Optional für persistente Logs
  # logs:
  #   driver: "json-file"
  #   options:
  #     max-size: "10m"
\`\`\`

### ⚠️ Häufiger Fehler

**Falsch:**
\`\`\`yaml
volumes:
  - ./app/packages:/app/packages  # VERMEIDEN!
\`\`\`

**Richtig:**
\`\`\`yaml
volumes:
  - ./app:/app  # Komplettes /app mounten
\`\`\`

Nur \`/app/packages\` zu mounten:
- Versteckt das eingebaute \`standard\` Theme
- Kann HTTP 403 beim ersten Start verursachen
- Bricht die Initialisierung ab`;
}

// Export for testing
export const dockerHelpTopics = ["all", "setup", "commands", "debug", "compose"];
