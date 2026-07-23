# Automad MCP Server

[![CI](https://github.com/cabroe/automad-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/cabroe/automad-mcp/actions)
[![Tests](https://img.shields.io/badge/tests-236%20passing-brightgreen)](https://github.com/cabroe/automad-mcp/actions)

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server for **Automad v2** - provides AI assistants direct access to the [Automad CMS v2](https://automad.org/version-2) documentation, the official [Theme Starter Kit](https://github.com/automadcms/automad-theme-starter-kit), and theme development tools.

## Documentation

All documentation is based on [https://automad.org/version-2](https://automad.org/version-2).

## Features

- 📚 **Documentation** — Browse and search Automad v2 docs
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

### Testing & Preview

| Tool | Description |
|------|-------------|
| `get_docker_help` | Docker setup, commands, debugging |
| `live_preview` | Manage local PHP dev server |
| `get_theme_doc` | Read local theme documentation |

### Cache Management

| Tool | Description |
|------|-------------|
| `get_cache_stats` | Show cache statistics |
| `clear_cache` | Clear specific cache |
| `clear_all_caches` | Clear all caches |

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

### Docker Testing

```
get_docker_help({ topic: "setup" })
get_docker_help({ topic: "debug" })
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
