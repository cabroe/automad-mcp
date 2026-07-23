# Testing Automad Themes with Docker

Automad provides an official Docker image. This guide covers the complete setup and test loop, verified against the `automad/automad:v1` image.

Official source: https://automad.org/getting-started#docker

## Prerequisites

- Docker and Docker Compose installed (`docker --version`, `docker compose version`).
- Image: `automad/automad`. The `v1` tag is the current stable line (Automad 1.x).

## How the image is laid out (important)

The entire Automad installation lives at `/app` inside the container:

```
/app/
├── config/        # setup state, accounts, active settings
├── pages/         # your site's pages (content)
├── shared/        # shared media / assets
├── cache/         # rendered cache
└── packages/      # THEMES live here — including the built-in "standard" theme
    └── standard/
        ├── light/   (theme.json + templates)
        └── dark/    (theme.json + templates)
```

**Themes are discovered at `/app/packages/<vendor>/<theme>/`.** A folder there with a `theme.json` + at least one `*.php` template is a valid theme.

## Setup

### Directory structure (project root)

```
project-root/
├── docker-compose.yml
├── app/                          # created on first run — the live Automad install
│   └── packages/
│       └── acme/
│           └── my-theme/         # YOUR theme goes here
│               ├── theme.json
│               └── default.php
```

### docker-compose.yml

Use `assets/docker-compose.yml.example`. The key line:

```yaml
volumes:
  - ./app:/app
```

**Mount the entire `/app` directory** — this is the documented pattern. It persists config/pages/cache and keeps the built-in `standard` theme intact.

> ⚠️ **Do NOT** bind-mount only `/app/packages`. That shadows the image's `standard` theme and breaks first-run initialization, producing HTTP 403. If you need to mount only your theme dir, you must *also* ensure `standard` remains available — simplest is the whole-`/app` mount above.

## Running

```bash
# Start in the background (first run initializes ./app)
docker compose up -d

# Watch logs
docker compose logs -f automad

# Stop
docker compose down
```

### First-run setup

1. Start the container: `docker compose up -d`.
2. **The first run auto-creates a dashboard account and logs the credentials to the container logs.** Retrieve them with:
   ```bash
   docker compose logs automad | grep -iE "user|password|account"
   ```
3. Open `http://localhost:8080/dashboard` and sign in with those credentials.
4. The image ships with a pre-configured demo site (the `standard` theme + sample pages). Your theme appears alongside it.

### Adding / updating your theme

Your theme files live at `./app/packages/<vendor>/<theme>/` (a real directory on your host, since `/app` is mounted). Two options:

**Option A — develop directly in the mounted dir.** Copy your theme into `./app/packages/acme/my-theme/` once, then edit files in place. Changes appear on reload (hard-refresh the browser).

```bash
mkdir -p ./app/packages/acme
cp -r /path/to/my-theme ./app/packages/acme/my-theme
docker compose restart   # refresh theme discovery after adding a new theme
```

**Option B — copy into a running container** (useful when `/app` is a named volume rather than a bind mount):

```bash
docker compose exec automad sh -c 'mkdir -p /app/packages/acme'
docker compose cp ./my-theme automad:/app/packages/acme/my-theme
docker compose restart   # refresh theme discovery
```

### Activating your theme

Automad assigns templates **per page**, not globally. To see your theme render:

1. In the dashboard, open a page (e.g. **Home**).
2. Expand **Page Settings** → click the **Template** selector.
3. Your theme appears as `<Theme Name> / <template>` (e.g. `Golderner Hirsch / Default`), alongside the built-in `Standard` variants.
4. Select it and click **Apply and Reload**. The page now renders with your template.

To make a theme the default for new pages, set the shared template default in **Shared → General Data and Files**.

## Iterate on templates

Automad has **no build step** for plain `*.php` templates — edits appear immediately on reload.

1. Edit a `.php` template or `theme.json`.
2. Hard-refresh the browser (Cmd+Shift+R / Ctrl+Shift+R) to bypass cache.
3. If changes don't appear, clear Automad's cache (see below).

### Clearing the cache

When `theme.json` changes or block areas don't update, clear the cache:

```bash
# Via container shell
docker compose exec automad rm -rf /app/cache/*

# Or from the dashboard: System → Clear Cache
```

## Debugging

### Enable debug mode

Automad stores config in `/app/config/config.php`. Set the debug flag:

```yaml
services:
  automad:
    environment:
      - AM_DEBUG_ENABLED=true
```

Restart after changing env vars: `docker compose up -d`.

### Inspect logs

```bash
docker compose logs -f automad
```

Look for PHP errors, missing-file warnings, or template parse errors. Template syntax errors (`@{ }` / `<@ @>` mistakes) usually surface here.

### Common container issues

| Symptom | Cause & Fix |
|---------|-------------|
| HTTP 403 after mounting a theme | You bind-mounted only `/app/packages`, hiding the built-in `standard` theme. Mount the whole `/app` instead: `./app:/app`. |
| Theme not in dashboard list | Theme isn't at `/app/packages/<vendor>/<theme>/` with a `theme.json` + `*.php`, or you need to restart to refresh discovery. |
| 404 at localhost:8080 | Port conflict — change the host port in `ports:` (e.g. `8081:80`). |
| Permission errors on cache | Ensure `./app` is writable by the container user; on SELinux hosts add `:z` to the volume mount. |
| Changes not reflecting | Browser cache — hard-refresh; or clear Automad's `/app/cache`. |
| Account/config lost after restart | `./app` got corrupted or is from a mismatched version — `docker compose down -v` and re-init (⚠️ loses pages); on re-init a fresh dashboard account is auto-created and logged. |

### Reset completely (loses all content)

```bash
docker compose down -v
# also remove the bind-mounted dir if you used ./app:
rm -rf ./app
docker compose up -d
```

## Verifying your theme works

A theme is correctly installed when **all** of these hold:

1. It appears in **Dashboard → System → Themes**.
2. Selecting it renders pages using your templates.
3. Block areas (`+main` etc.) are editable in the block editor.
4. Custom fields appear in page settings with the labels/tooltips from `theme.json`.

If any fails, check the corresponding pitfall in `SKILL.md` and the table above.
