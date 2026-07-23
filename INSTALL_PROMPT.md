# Automad MCP Server – Installation Prompt

Copy this prompt into your AI assistant to install and configure the Automad MCP server automatically.

---

```
Install and configure the Automad MCP server:

1. Clone: git clone https://github.com/cabroe/automad-mcp.git && cd automad-mcp
2. Install: npm install
3. Verify: npx tsx src/index.ts (should print "Automad MCP server running on stdio")
4. Detect my MCP client and add this config:

   Claude Desktop (macOS):
   File: ~/Library/Application Support/Claude/claude_desktop_config.json
   Config: { "mcpServers": { "automad-docs": { "command": "npx", "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"] } } }

   Cursor:
   File: ~/.cursor/mcp.json
   Config: { "automad-docs": { "command": "npx", "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"] } }

   VS Code:
   File: .vscode/mcp.json
   Config: { "servers": { "automad-docs": { "type": "stdio", "command": "npx", "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"] } } }

   Windsurf:
   File: ~/.windsurf/mcp.json
   Config: { "automad-docs": { "command": "npx", "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"] } }

   Continue (VS Code/JetBrains):
   File: ~/.continue/config.json
   Add to "mcpServers": { "automad-docs": { "command": "npx", "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"] } }

Replace <REPO_PATH> with the absolute path from step 1 (run pwd to get it).
Merge configs if other MCP servers already exist.

5. Restart the MCP client
6. Verify with: list_pages({ section: "getting-started" })
```

---

## What it provides

Your AI assistant gains access to:

- **~100 Automad documentation pages** – search, browse, read as Markdown
- **Theme Starter Kit** – list and read any file directly from GitHub
- **39 tools** for theme development, template syntax, i18n, and more

## Quick install (manual)

```bash
git clone https://github.com/cabroe/automad-mcp.git
cd automad-mcp
npm install
# Get absolute path:
pwd
# Add to your MCP client config (see above)
# Restart client
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | `node --version` → need ≥18 |
| `npx tsx` not found | `npm install -g tsx` |
| Config file missing | Create it manually |
| Tools not visible | Restart the MCP client |
