# Automad MCP Server – Installation Prompt

Copy this prompt into your AI assistant to install and configure the Automad MCP server automatically.

---

```
Install and configure the Automad MCP server:

1. Clone: git clone https://github.com/cabroe/automad-mcp.git && cd automad-mcp
2. Install: npm install
3. Verify: npx tsx src/index.ts (should print "Automad MCP server running on stdio")
4. Detect my MCP client and configure it:
   See CLAUDE.md → MCP Client Configuration section for all supported clients
   (Claude Desktop, Cursor, VS Code, Windsurf, Continue).
   Replace <REPO_PATH> with the absolute path from step 1 (run pwd to get it).

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

---

## Uninstallation

To completely remove the Automad MCP server, run:

```
Uninstall the Automad MCP server:

1. Remove the automad-docs entry from my MCP client config:
   - Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json
   - Cursor: ~/.cursor/mcp.json
   - VS Code: .vscode/mcp.json
   - Windsurf: ~/.windsurf/mcp.json
   - Continue: ~/.continue/config.json

2. Delete the repository:
   rm -rf <REPO_PATH>/automad-mcp

3. Optionally remove global dependencies:
   npm uninstall -g tsx
```
