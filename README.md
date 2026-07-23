# Automad MCP Server

[![CI](https://github.com/cabroe/automad-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/cabroe/automad-mcp/actions)
[![Tests](https://img.shields.io/badge/tests-236%20passing-brightgreen)](https://github.com/cabroe/automad-mcp/actions)

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server for **Automad v2** - provides AI assistants direct access to the [Automad CMS](https://automad.org) documentation, the official [Theme Starter Kit](https://github.com/automadcms/automad-theme-starter-kit), and theme development tools.

> **Note:** This MCP server targets Automad v2. Automad v1 is no longer supported.

## Features

- 📚 **Documentation** — Browse and search all Automad docs (~100 pages)
- 🎨 **Theme Development** — Generate, validate, and compare themes
- 📝 **Template Snippets** — Reusable code snippets for Automad templates
- 🧱 **Block Layouts** — Block editor layout templates
- 🌐 **i18n Support** — Per-tree, per-field, and mixed multilingual patterns
- 🐳 **Docker Testing** — Setup and debugging guides for local testing
- 🔧 **Live Preview** — Manage local dev server

## Installation

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "automad-docs": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/automad-mcp/src/index.ts"]
    }
  }
}
```

### Cursor

Open **Settings → MCP** and add:

```json
{
  "automad-docs": {
    "command": "npx",
    "args": ["tsx", "/absolute/path/to/automad-mcp/src/index.ts"]
  }
}
```

## Quick Start

```bash
git clone https://github.com/cabroe/automad-mcp.git
cd automad-mcp
npm install
npm start
```

## Tools

### Documentation

| Tool | Description |
|------|-------------|
| `list_pages` | Browse all ~100 docs pages, filtered by section |
| `search_docs` | Search with relevance scoring |
| `get_page` | Fetch any docs page as Markdown (1h cache) |

### Theme Starter Kit

| Tool | Description |
|------|-------------|
| `list_starter_kit_files` | List all Starter Kit files |
| `get_starter_kit_file` | Read any file from GitHub (1h cache) |
| `get_block_template` | Fetch block template PHP code |

### Theme Development

| Tool | Description |
|------|-------------|
| `generate_theme` | Scaffold new theme (minimal, starter, blog, portfolio) |
| `validate_theme` | Check theme against best practices |
| `compare_themes` | Compare theme against Starter Kit |
| `analyze_fields` | Analyze which fields are used |

### Template Helpers

| Tool | Description |
|------|-------------|
| `get_template_syntax` | Complete syntax reference (<@ @>, @{ }, @{ + }) |
| `get_snippets` | Reusable code snippets (statements, variables, blocks, layout, i18n, navigation, helper) |
| `get_context_patterns` | Context manipulation (set, with, foreach, recursive) |
| `get_block_layouts` | Block editor layout templates |

### i18n & Multilingual

| Tool | Description |
|------|-------------|
| `generate_i18n` | Generate i18n skeleton or explain i18n patterns (per-tree, per-field, mixed) |

### Testing & Preview

| Tool | Description |
|------|-------------|
| `get_docker_help` | Docker setup, commands, debugging, troubleshooting |
| `live_preview` | Manage local PHP dev server |
| `get_theme_doc` | Read local theme documentation |

### Cache Management

| Tool | Description |
|------|-------------|
| `get_cache_stats` | Show cache statistics |
| `clear_cache` | Clear specific cache |
| `clear_all_caches` | Clear all caches |

## Documentation Sections

| Section | Filter value |
|---------|--------------|
| Getting Started | `getting-started` |
| System | `system` |
| User Guide | `user-guide` |
| Developer Guide | `developer-guide` |
| Headless Mode | `headless-mode` |
| Version 2 (Migration) | `version-2` |

## Usage Examples

### Documentation

```
list_pages({ section: "developer-guide" })
search_docs({ query: "template language" })
get_page({ url: "/developer-guide/building-themes/template-language" })
```

### Theme Development

```
generate_theme({ name: "my-theme", template: "starter" })
validate_theme({ themePath: "/path/to/theme" })
compare_themes({ starterKitAsBase: true })
analyze_fields({ themePath: "/path/to/theme" })
```

### Template Snippets

```
get_snippets({ category: "statements" })
get_snippets({ category: "variables", search: "markdown" })
get_template_syntax({ type: "blocks" })
get_context_patterns({ type: "foreach" })
```

### i18n Patterns

```
generate_i18n({ pattern: "all" })           # Compare all patterns
generate_i18n({ pattern: "per-tree" })     # Separate page trees
generate_i18n({ pattern: "mixed" })         # Recommended pattern
generate_i18n({ generate: true })           # Generate i18n.php skeleton
```

### Docker Testing

```
get_docker_help({ topic: "setup" })
get_docker_help({ topic: "debug" })
get_docker_help({ topic: "compose" })
```

### Block Layouts

```
get_block_layouts({ type: "all" })
get_block_layouts({ type: "hero" })
get_block_template({ type: "pagelist", variant: "grid" })
```

## Development

### Code Quality

```bash
# Lint (ESLint)
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format code
npm run format
```

### Branch Protection

The `main` branch is protected:
- ✅ CI must pass before merging
- ✅ No force pushes
- ✅ No branch deletion
- ✅ Pull requests required

### Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push and create PR
4. CI runs automatically
5. Merge after CI passes

```bash
# Install dependencies
npm install

# Run with hot-reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Open MCP Inspector
npm run inspect
```

## Architecture

```
src/
├── index.ts                    # MCP Server + all tool registrations (21 tools)
├── tools/
│   ├── documentation/          # Docs browsing & search
│   ├── theme/                  # Theme generation, validation, comparison
│   ├── template/               # Snippets, syntax, contexts, blocks
│   ├── i18n/                   # Internationalization
│   └── testing/                # Docker, live preview, cache
└── utils/
    ├── cache.ts               # Fetch caching with TTL
    ├── fetch.ts               # HTTP with retry logic
    ├── scraper.ts             # HTML → Markdown
    └── pages.ts               # Docs page index
```

## Requirements

- Node.js ≥ 18
- npm

## CI/CD

- **CI**: Runs on push/PR — TypeScript build + tests
- **Release**: Creates GitHub Release + artifacts on version tags

## License

MIT
