# Automad MCP Server – Agent Installation Prompt

Copy and paste the following prompt into your AI assistant to have it automatically install and configure the Automad MCP server.

---

```
Please install and configure the Automad MCP server on my machine. Follow these steps:

## 1. Clone the repository

```bash
git clone https://github.com/cabroe/automad-mcp.git
cd automad-mcp
```

## 2. Install dependencies

```bash
npm install
```

## 3. Verify it works

```bash
npx tsx src/index.ts
```

It should print: `Automad MCP server running on stdio`
Press Ctrl+C to stop.

## 4. Configure my MCP client

Detect which MCP client I use (Claude Desktop, Cursor, or VS Code) and add the correct configuration:

### Claude Desktop (macOS)
File: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "automad-docs": {
      "command": "npx",
      "args": ["tsx", "<ABSOLUTE_PATH>/automad-mcp/src/index.ts"]
    }
  }
}
```

Replace `<ABSOLUTE_PATH>` with the absolute path where the repo was cloned.
If the file already contains other MCP servers, merge the `automad-docs` entry into the existing `mcpServers` object.

### Cursor
File: `~/.cursor/mcp.json` (or via Settings → MCP → Add Server)

```json
{
  "automad-docs": {
    "command": "npx",
    "args": ["tsx", "<ABSOLUTE_PATH>/automad-mcp/src/index.ts"]
  }
}
```

### VS Code
File: `.vscode/mcp.json` in the current workspace

```json
{
  "servers": {
    "automad-docs": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "<ABSOLUTE_PATH>/automad-mcp/src/index.ts"]
    }
  }
}
```

## 5. Restart the MCP client

After adding the configuration, restart the client application for the changes to take effect.

## 6. Verify the tools are available

After restart, confirm these 5 tools are available:
- `list_pages`
- `search_docs`
- `get_page`
- `list_starter_kit_files`
- `get_starter_kit_file`

You can test with: `list_pages({ section: "getting-started" })`
```

---

## What this MCP server provides

Once installed, your AI assistant can:

- **Search** the Automad documentation by keyword
- **Read** any of the ~100 documentation pages as clean Markdown
- **Browse** documentation by section (Getting Started, System, User Guide, Developer Guide, Headless Mode, Version 2)
- **Explore** the official [Theme Starter Kit](https://github.com/automadcms/automad-theme-starter-kit) – list and read all template files, configs, and source code directly from GitHub

## Manual installation (without an agent)

```bash
# 1. Clone
git clone https://github.com/cabroe/automad-mcp.git
cd automad-mcp

# 2. Install
npm install

# 3. Find your absolute path
pwd

# 4. Add to your MCP client config (replace /path/to with output of pwd)
# See README.md for client-specific config formats

# 5. Restart your MCP client
```

## Troubleshooting

**Server doesn't start**: Make sure Node.js ≥ 18 is installed (`node --version`).

**Tools not visible**: Check that `npx tsx` works: `npx tsx --version`. If not, run `npm install -g tsx`.

**Config file not found**: Create it manually if it doesn't exist yet.
