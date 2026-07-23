# Automad MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that gives AI assistants direct access to the [Automad CMS](https://automad.org) documentation and the official [Theme Starter Kit](https://github.com/automadcms/automad-theme-starter-kit).

## Tools

| Tool | Description |
|---|---|
| `list_pages` | Browse all ~100 documentation pages, optionally filtered by section |
| `search_docs` | Search by keyword with relevance scoring (top 10 results) |
| `get_page` | Fetch any Automad docs page as clean Markdown (1h cache) |
| `list_starter_kit_files` | List all files in the official Theme Starter Kit with descriptions |
| `get_starter_kit_file` | Read any file from the Theme Starter Kit directly from GitHub (1h cache) |

## Quick Start

```bash
git clone https://github.com/cabroe/automad-mcp.git
cd automad-mcp
npm install
npm start
```

## Installation

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Then restart Claude Desktop.

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

### VS Code (with Copilot MCP support)

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "automad-docs": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/automad-mcp/src/index.ts"]
    }
  }
}
```

## Available Documentation Sections

| Section | Filter value |
|---|---|
| Getting Started | `getting-started` |
| System | `system` |
| User Guide | `user-guide` |
| Developer Guide | `developer-guide` |
| Headless Mode | `headless-mode` |
| Version 2 | `version-2` |

## Usage Examples

### Search

```
search_docs({ query: "template language" })
search_docs({ query: "caching" })
search_docs({ query: "pagelist" })
```

### Browse documentation

```
list_pages({ section: "developer-guide" })
list_pages({ section: "system" })
list_pages()  // all sections
```

### Read a documentation page

```
get_page({ url: "/system/caching" })
get_page({ url: "/developer-guide/building-themes/template-language" })
get_page({ url: "https://automad.org/headless-mode" })
```

### Explore the Theme Starter Kit

```
list_starter_kit_files()                          // all files
list_starter_kit_files({ directory: "blocks" })   // only block templates
list_starter_kit_files({ directory: "client" })   // frontend source files

get_starter_kit_file({ path: "README.md" })
get_starter_kit_file({ path: "theme.json" })
get_starter_kit_file({ path: "default.php" })
get_starter_kit_file({ path: "blocks/pagelist/grid.php" })
```

### Typical theme development workflow

```
1. list_starter_kit_files()
2. get_starter_kit_file({ path: "theme.json" })
3. get_starter_kit_file({ path: "default.php" })
4. get_page({ url: "/developer-guide/building-themes/template-language" })
5. get_page({ url: "/developer-guide/building-themes/theme-json" })
```

## Development

```bash
# Run with hot-reload
npm run dev

# Open MCP Inspector in browser
npm run inspect
```

## Architecture

```
src/
├── index.ts                      # MCP Server + tool registration (5 tools)
├── tools/
│   ├── list-pages.ts             # list_pages
│   ├── search.ts                 # search_docs
│   ├── get-page.ts               # get_page
│   ├── list-starter-kit-files.ts # list_starter_kit_files
│   └── get-starter-kit-file.ts   # get_starter_kit_file
└── utils/
    ├── pages.ts                  # Full docs page index (~100 pages)
    ├── scraper.ts                # HTML → Markdown converter + cache
    └── starter-kit.ts           # Starter Kit file index + GitHub constants
```

## Requirements

- Node.js ≥ 18
- npm

## License

MIT
