import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { SECTIONS } from "./utils/pages.js";
import { listPages } from "./tools/list-pages.js";
import { searchDocs } from "./tools/search.js";
import { getPage } from "./tools/get-page.js";
import { listStarterKitFiles } from "./tools/list-starter-kit-files.js";
import { getStarterKitFile } from "./tools/get-starter-kit-file.js";

const server = new McpServer({
  name: "automad-docs",
  version: "1.0.0",
});

// ─── Tool: list_pages ────────────────────────────────────────────────────────

server.tool(
  "list_pages",
  "List all available Automad documentation pages, optionally filtered by section. " +
    "Returns a structured list with titles and URLs. " +
    `Available sections: ${SECTIONS.join(", ")}.`,
  {
    section: z
      .enum(SECTIONS)
      .optional()
      .describe(
        `Filter by section. One of: ${SECTIONS.join(", ")}. Omit to list all pages.`
      ),
  },
  async (args) => {
    const result = listPages({ section: args.section });
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

// ─── Tool: search_docs ───────────────────────────────────────────────────────

server.tool(
  "search_docs",
  "Search the Automad documentation index by keyword. " +
    "Returns a ranked list of matching pages with URLs. " +
    "Use get_page to read the full content of any result.",
  {
    query: z
      .string()
      .min(1)
      .describe("The search term, e.g. 'template language', 'caching', 'pagelist'"),
  },
  async (args) => {
    const result = searchDocs({ query: args.query });
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

// ─── Tool: get_page ──────────────────────────────────────────────────────────

server.tool(
  "get_page",
  "Fetch and read the full content of an Automad documentation page as Markdown. " +
    "Accepts full URLs (https://automad.org/...) or relative paths (/getting-started). " +
    "Page content is cached for 1 hour to reduce network requests. " +
    "Use search_docs or list_pages first to find the right URL.",
  {
    url: z
      .string()
      .min(1)
      .describe(
        "Documentation page URL. Full (https://automad.org/system/caching) or relative (/system/caching)."
      ),
  },
  async (args) => {
    try {
      const result = await getPage({ url: args.url });
      return {
        content: [{ type: "text", text: result }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error fetching page: ${message}` }],
        isError: true,
      };
    }
  }
);

// ─── Tool: list_starter_kit_files ────────────────────────────────────────────

server.tool(
  "list_starter_kit_files",
  "List all files in the official Automad Theme Starter Kit GitHub repository " +
    "(https://github.com/automadcms/automad-theme-starter-kit). " +
    "Each file comes with a description and a GitHub link. " +
    "Use get_starter_kit_file to read the content of any listed file.",
  {
    directory: z
      .string()
      .optional()
      .describe(
        "Optional directory filter, e.g. 'blocks', 'client', 'bin'. Omit to list all files."
      ),
  },
  async (args) => {
    const result = listStarterKitFiles({ directory: args.directory });
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

// ─── Tool: get_starter_kit_file ──────────────────────────────────────────────

server.tool(
  "get_starter_kit_file",
  "Fetch and read the raw content of any file from the Automad Theme Starter Kit " +
    "(https://github.com/automadcms/automad-theme-starter-kit). " +
    "Returns the file content with syntax highlighting. " +
    "Use list_starter_kit_files first to discover available file paths.",
  {
    path: z
      .string()
      .min(1)
      .optional()
      .describe(
        "File path within the repo, e.g. 'README.md', 'default.php', 'theme.json', 'blocks/pagelist/grid.php'"
      ),
    file: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Alias for 'path'. File path within the repo, e.g. 'README.md', 'default.php', 'theme.json'."
      ),
  },
  async (args) => {
    try {
      const result = await getStarterKitFile({ path: args.path ?? args.file ?? "" });
      return {
        content: [{ type: "text", text: result }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error fetching file: ${message}` }],
        isError: true,
      };
    }
  }
);

// ─── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Automad MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
