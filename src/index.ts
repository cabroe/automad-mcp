import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { SECTIONS } from "./utils/pages.js";
import { listPages } from "./tools/list-pages.js";
import { searchDocs } from "./tools/search.js";
import { getPage } from "./tools/get-page.js";
import { listStarterKitFiles } from "./tools/list-starter-kit-files.js";
import { getStarterKitFile } from "./tools/get-starter-kit-file.js";
import { getCacheStats, clearAllCaches, clearCache } from "./utils/cache.js";

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

// ─── Tool: cache ─────────────────────────────────────────────────────────────

server.tool(
  "get_cache_stats",
  "Get statistics about the internal cache. Shows how many pages/files are cached, TTL, and the oldest/newest entries. Useful for debugging or deciding whether to refresh.",
  {},
  async () => {
    const stats = getCacheStats();
    const lines: string[] = ["## Cache Statistics\n"];

    lines.push("### Documentation Pages (scraper)");
    lines.push(`- Entries: ${stats.scraper.entries}`);
    lines.push(`- TTL: ${formatMs(stats.scraper.ttlMs)}`);
    lines.push(`- Oldest: ${stats.scraper.oldestEntry ?? "(empty)"}`);
    lines.push(`- Newest: ${stats.scraper.newestEntry ?? "(empty)"}`);

    lines.push("\n### Starter Kit Files");
    lines.push(`- Entries: ${stats.starterKit.entries}`);
    lines.push(`- TTL: ${formatMs(stats.starterKit.ttlMs)}`);
    lines.push(`- Oldest: ${stats.starterKit.oldestEntry ?? "(empty)"}`);
    lines.push(`- Newest: ${stats.starterKit.newestEntry ?? "(empty)"}`);

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

server.tool(
  "clear_cache",
  "Clear the internal cache to force fresh data on the next request. Use this when documentation has been updated and you want to see the latest version.",
  {
    target: z
      .enum(["all", "scraper", "starterKit"])
      .optional()
      .describe("Which cache to clear. Defaults to 'all'."),
  },
  async (args) => {
    const target = args.target ?? "all";
    if (target === "all") {
      clearAllCaches();
    } else {
      clearCache(target);
    }
    return {
      content: [
        {
          type: "text",
          text: `✅ Cache cleared: ${target}. Next requests will fetch fresh data.`,
        },
      ],
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
        content: [{ type: "text", text: formatError("page", args.url, message) }],
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
        content: [{ type: "text", text: formatError("file", args.path ?? args.file ?? "", message) }],
        isError: true,
      };
    }
  }
);

// ─── Tool: version ─────────────────────────────────────────────────────────────

server.tool(
  "get_automad_version",
  "Get information about Automad Version 2 and how it differs from v1. " +
    "Includes migration tips and links to relevant documentation.",
  {},
  async () => {
    const lines: string[] = [
      "## Automad Version 2",
      "",
      "Automad v2 is the latest major version with significant improvements:",
      "",
      "### Key Changes",
      "- **New Template Engine**: Faster parsing, better error messages",
      "- **Dashboard Redesign**: Modern UI with block editor",
      "- **Package System**: GitHub-based theme/plugin installation",
      "- **TypeScript Support**: Native TS support in themes",
      "- **Performance**: Reduced PHP memory usage, faster page loads",
      "",
      "### Migration from v1",
      "- Themes need updates for new template syntax",
      "- Blocks replace the old content areas",
      "- Packages replace old shared components",
      "",
      "### Documentation",
      "- [Version 2 Overview](https://automad.org/version-2)",
      "- [Getting Started](https://automad.org/getting-started)",
      "- [Building Themes](https://automad.org/developer-guide/building-themes)",
      "- [Cheat Sheets](https://automad.org/developer-guide/cheat-sheets)",
      "",
      "### Starter Kit",
      "The [Automad Theme Starter Kit](https://github.com/automadcms/automad-theme-starter-kit) " +
        "is the recommended starting point for building v2 themes.",
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatError(type: "page" | "file", identifier: string, message: string): string {
  const lines: string[] = [];

  // Try to classify the error
  if (message.includes("ECONNABORTED") || message.includes("timeout")) {
    lines.push(`❌ **Timeout** — The request to ${identifier} took too long.`);
    lines.push("\nThe server may be slow or unavailable. Try again in a few minutes.");
  } else if (message.includes("404") || message.includes("Not Found")) {
    lines.push(`❌ **Not Found** — ${identifier} could not be found.`);
    lines.push("\nCheck the URL/path and try again.");
  } else if (message.includes("429") || message.includes("Too Many Requests")) {
    lines.push(`⚠️ **Rate Limited** — Too many requests.`);
    lines.push("\nWait a moment and try again. The cache will help reduce future requests.");
  } else if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
    lines.push(`❌ **Connection Error** — Cannot reach the server.`);
    lines.push("\nCheck your internet connection and try again.");
  } else {
    lines.push(`❌ **Error** — ${message}`);
  }

  if (type === "page") {
    lines.push("\nUse `list_pages` or `search_docs` to find valid documentation pages.");
  } else {
    lines.push("\nUse `list_starter_kit_files` to see available files.");
  }

  return lines.join("\n");
}

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
