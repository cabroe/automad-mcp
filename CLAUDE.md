# CLAUDE.md

This file provides guidance to AI coding assistants working with this codebase.

## Project Overview

**automad-mcp** is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for **Automad CMS v2**. It provides AI assistants direct access to Automad documentation, the official Theme Starter Kit, and theme development tools.

## Tech Stack

- **Language**: TypeScript (ES2022, NodeNext module)
- **MCP SDK**: @modelcontextprotocol/sdk
- **Testing**: Vitest
- **Linting**: ESLint 9 + Prettier
- **Build**: TypeScript compiler (tsc)

## Commands

```bash
npm install          # Install dependencies
npm start            # Start MCP server (stdio)
npm run dev          # Dev mode with watch
npm run build        # TypeScript compile → dist/
npm test             # Run all tests
npm run lint         # ESLint check
npm run format:check # Prettier check
npm run format       # Prettier format
npm run refresh:pages # Update docs index
```

## Repository Structure

```
src/
├── index.ts          # MCP server entry point (39 tools)
├── tools/            # 33 MCP tool implementations
│   ├── list-pages.ts
│   ├── search.ts
│   ├── get-page.ts
│   ├── snippets.ts
│   ├── theme-*.ts    # Theme development tools
│   └── ...
├── utils/
│   ├── pages.ts      # Docs index (auto-generated)
│   ├── scraper.ts    # Web scraper for docs
│   ├── cache.ts      # TTL cache utilities
│   └── starter-kit.ts
└── __tests__/        # 18 test files, 210 tests
```

## Key Conventions

### TypeScript
- Use `z` from 'zod' for tool input schemas
- Export interfaces for all types
- Use `const` assertions for literal types (e.g., `as const`)

### MCP Tools
- Tool names: `snake_case` (e.g., `list_pages`)
- Use descriptive `.describe()` for parameters
- Always return `{ content: [{ type: 'text', text: '...' }] }`
- Use `try/catch` with formatted error messages

### Testing
- Unit tests alongside source files: `*.test.ts`
- Use Vitest with `describe`/`it`/`expect`
- Mock network calls in tests

### Code Style
- ESLint + Prettier enforced
- No `console.log` in production (use logging utility)
- Error messages should be user-friendly

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol
- `node-html-parser` - HTML parsing for scraper
- `z` (via SDK) - Schema validation

## CI/CD

- **CI**: GitHub Actions - Lint → Format → Build → Test
- **Release**: Creates GitHub Release on version tags
- **Branch Protection**: PR required, status checks required

## Common Tasks

### Adding a New Tool
1. Create `src/tools/my-tool.ts` with input schema and handler
2. Import and register in `src/index.ts`
3. Add tests in `src/__tests__/my-tool.test.ts`
4. Document in README.md tools table

### Updating Documentation Index
When Automad docs change:
```bash
npm run refresh:pages
```
This updates `src/utils/pages.ts`.

### Version Bump & Release
```bash
# Update version in package.json
npm version patch  # or minor, major
git push origin --tags
```
Release workflow creates GitHub Release automatically.

### MCP Client Configuration

#### Claude Desktop (macOS)
File: `~/Library/Application Support/Claude/claude_desktop_config.json`
```json
{
  "mcpServers": {
    "automad-docs": {
      "command": "npx",
      "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"]
    }
  }
}
```

#### Cursor
File: `~/.cursor/mcp.json`
```json
{
  "automad-docs": {
    "command": "npx",
    "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"]
  }
}
```

#### VS Code
File: `.vscode/mcp.json`
```json
{
  "servers": {
    "automad-docs": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"]
    }
  }
}
```

#### Windsurf
File: `~/.windsurf/mcp.json`
```json
{
  "automad-docs": {
    "command": "npx",
    "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"]
  }
}
```

#### Continue (VS Code/JetBrains)
File: `~/.continue/config.json`
Add to `"mcpServers"`:
```json
{
  "automad-docs": {
    "command": "npx",
    "args": ["tsx", "<REPO_PATH>/automad-mcp/src/index.ts"]
  }
}
```
