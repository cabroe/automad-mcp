# Automad MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that gives AI assistants access to the [Automad CMS documentation](https://automad.org).

## Features

- **`list_pages`** – Browse all ~100 documentation pages, optionally filtered by section
- **`search_docs`** – Search by keyword with relevance scoring
- **`get_page`** – Fetch any documentation page as clean Markdown (with in-memory caching)

## Quick Start

```bash
npm install
npm start
```

## Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "automad-docs": {
      "command": "node",
      "args": ["--import", "tsx/esm", "/absolute/path/to/automad-mcp/src/index.ts"]
    }
  }
}
```

Or using `npx tsx` directly:

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

## Usage with Cursor / VS Code

Add to your MCP settings:

```json
{
  "automad-docs": {
    "command": "npx",
    "args": ["tsx", "/absolute/path/to/automad-mcp/src/index.ts"]
  }
}
```

## Development

```bash
# Run with hot-reload
npm run dev

# Open MCP Inspector in browser
npm run inspect
```

## Available Sections

| Section | URL prefix |
|---|---|
| Getting Started | `/getting-started` |
| System | `/system` |
| User Guide | `/user-guide` |
| Developer Guide | `/developer-guide` |
| Headless Mode | `/headless-mode` |

## Examples

### Search for something

```
search_docs({ query: "template language" })
search_docs({ query: "caching" })
search_docs({ query: "pagelist" })
```

### List pages in a section

```
list_pages({ section: "developer-guide" })
list_pages({ section: "system" })
list_pages() // all pages
```

### Read a page

```
get_page({ url: "/system/caching" })
get_page({ url: "https://automad.org/developer-guide/building-themes/template-language" })
```

## Architecture

```
src/
├── index.ts              # MCP Server + tool registration
├── tools/
│   ├── list-pages.ts     # list_pages tool
│   ├── search.ts         # search_docs tool
│   └── get-page.ts       # get_page tool
└── utils/
    ├── pages.ts          # Full documentation page index (~100 pages)
    └── scraper.ts        # HTML → Markdown converter with caching
```

## License

MIT
