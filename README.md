# Automad MCP Server

[![CI](https://github.com/cabroe/automad-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/cabroe/automad-mcp/actions)
[![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0-brightgreen)](https://github.com/cabroe/automad-mcp/security)
[![Tests](https://img.shields.io/badge/tests-210%20passing-brightgreen)](https://github.com/cabroe/automad-mcp/actions)

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server for **Automad v2** — provides AI assistants direct access to the [Automad CMS v2](https://automad.org/version-2) documentation, the official [Theme Starter Kit](https://github.com/automadcms/automad-theme-starter-kit), and theme development tools.

## Status

| Check | Status |
|-------|--------|
| Tests | ✅ 218 bestanden |
| Lint | ✅ 0 Warnings |
| Format | ✅ OK |
| Tools | ✅ 39 dokumentiert |
| Branch Protection | ✅ Aktiv |

## Documentation

All documentation is based on [https://automad.org/version-2](https://automad.org/version-2).

## Features

- 📚 **Documentation** — Browse and search Automad v2 docs
- 🎨 **Theme Development** — Generate, validate, and compare themes
- 📝 **Template Snippets** — Reusable code snippets for Automad templates
- 🧱 **Block Layouts** — Block editor layout templates
- 🌐 **i18n Support** — Per-tree, per-field, and mixed multilingual patterns
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
| `list_pages` | Browse all docs pages, filtered by section |
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
| `get_snippets` | Reusable code snippets |
| `get_context_patterns` | Context manipulation (set, with, foreach, recursive) |
| `get_block_layouts` | Block editor layout templates |

### i18n & Multilingual

| Tool | Description |
|------|-------------|
| `generate_i18n` | Generate i18n skeleton or explain i18n patterns |

### Block & API Documentation

| Tool | Description |
|------|-------------|
| `get_block_docs` | Block type documentation (text, image, gallery...) |
| `get_api_docs` | PHP/REST/Webhooks API reference |
| `get_cli_docs` | CLI commands documentation |

### Theme Analysis & Checks

| Tool | Description |
|------|-------------|
| `check_theme` | Schema, a11y, SEO checks |
| `compare_theme_versions` | Compare two themes or versions |

### Code Generation

| Tool | Description |
|------|-------------|
| `generate_code` | Generate nav, pagelist, form templates |
| `pack_theme` | Get info for theme packaging |

### Testing & Preview

| Tool | Description |
|------|-------------|
| `live_preview` | Manage local PHP dev server |
| `get_theme_doc` | Read local theme documentation |

### Server Tools

| Tool | Description |
|------|-------------|
| `get_automad_version` | Get Automad v2 info |
| `health` | Health check endpoint |

### Cache Management

| Tool | Description |
|------|-------------|
| `get_cache_stats` | Show cache statistics |
| `clear_cache` | Clear specific cache |
| `clear_all_caches` | Clear all caches |

### Theme Analysis

| Tool | Description |
|------|-------------|
| `analyze_theme` | Analyze and visualize theme structure |
| `find_theme_issues` | Find Automad-specific issues |
| `check_broken_links` | Check for broken internal links |
| `validate_field_names` | Validate naming conventions |
| `list_field_types` | List all field types with widget mapping |

### Dashboard Generator

| Tool | Description |
|------|-------------|
| `generate_dashboard_template` | Generate block layout templates |

### I18n Helpers

| Tool | Description |
|------|-------------|
| `check_i18n_consistency` | Check i18n consistency |
| `validate_field_names` | Validate field naming conventions |

## Usage Examples

### Documentation

```
list_pages()
search_docs({ query: "template language" })
get_page({ url: "/getting-started" })
```

### Theme Development

```
generate_theme({ name: "my-theme", template: "starter" })
validate_theme({ themePath: "/path/to/theme" })
```

### Template Snippets

```
get_snippets({ category: "statements" })
get_template_syntax({ type: "blocks" })
get_context_patterns({ type: "foreach" })
```

### Code Generation

```
generate_code({ type: "nav", style: "dropdown" })
generate_code({ type: "pagelist", style: "cards" })
```

### Block & API Docs

```
get_block_docs({ type: "text" })
get_api_docs({ type: "rest" })
get_cli_docs({ command: "install" })
```

## Development

### Code Quality

```bash
npm run lint      # ESLint
npm run format   # Prettier
npm test         # Run tests
```

### Branch Protection

The `main` branch is protected:
- ✅ CI must pass before merging
- ✅ No force pushes
- ✅ No branch deletion
- ✅ Pull requests required

## Requirements

- Node.js ≥ 18
- npm

## CI/CD

- **CI**: Runs on push/PR — TypeScript build + tests
- **Release**: Creates GitHub Release + artifacts on version tags

## License

MIT
