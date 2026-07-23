import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { SECTIONS } from "./utils/pages.js";
import { listPages } from "./tools/list-pages.js";
import { searchDocs } from "./tools/search.js";
import { getPage } from "./tools/get-page.js";
import { listStarterKitFiles } from "./tools/list-starter-kit-files.js";
import { getStarterKitFile } from "./tools/get-starter-kit-file.js";
import { getThemeDoc } from "./tools/get-theme-doc.js";
import { getCacheStats, clearAllCaches, clearCache } from "./utils/cache.js";
import { loadConfig, parseArgs, logVerbose } from "./utils/config.js";

// ─── Parse CLI Args ──────────────────────────────────────────────────────────

const { config: cliConfig } = parseArgs(process.argv.slice(2));
loadConfig().then(() => {
  logVerbose("Config loaded");
  logVerbose(`Verbose mode: ${cliConfig.verbose ? "on" : "off"}`);
});

// ─── MCP Server ─────────────────────────────────────────────────────────────

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
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Tool: search_docs ────────────────────────────────────────────────────────

server.tool(
  "search_docs",
  "Search the Automad documentation index by keyword. " +
    "Returns a ranked list of matching pages with URLs. " +
    "Use get_page to read the full content of any result. " +
    "Results are paginated.",
  {
    query: z
      .string()
      .min(1)
      .describe("The search term, e.g. 'template language', 'caching', 'pagelist'"),
    page: z
      .number()
      .int()
      .min(1)
      .default(1)
      .optional()
      .describe("Page number for pagination (default: 1)"),
    perPage: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .optional()
      .describe("Number of results per page (default: 10, max: 50)"),
  },
  async (args) => {
    const result = searchDocs({
      query: args.query,
      page: args.page,
      perPage: args.perPage,
    });
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Tool: get_page ──────────────────────────────────────────────────────────

server.tool(
  "get_page",
  "Fetch and read the full content of an Automad documentation page as Markdown. " +
    "Accepts full URLs or relative paths.",
  {
    url: z
      .string()
      .min(1)
      .describe(
        "Documentation page URL. Full (https://automad.org/...) or relative (/system/caching)."
      ),
  },
  async (args) => {
    try {
      const result = await getPage({ url: args.url });
      return { content: [{ type: "text", text: result }] };
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
  "List all files in the official Automad Theme Starter Kit. " +
    "Use get_starter_kit_file to read any file.",
  {
    directory: z
      .string()
      .optional()
      .describe("Optional directory filter, e.g. 'components', 'lib'"),
  },
  async (args) => {
    const result = listStarterKitFiles({ directory: args.directory });
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Tool: get_starter_kit_file ──────────────────────────────────────────────

server.tool(
  "get_starter_kit_file",
  "Fetch the raw content of any file from the Automad Theme Starter Kit. " +
    "Use list_starter_kit_files first to discover available file paths.",
  {
    path: z
      .string()
      .min(1)
      .optional()
      .describe("File path within the repo, e.g. 'theme.json', 'default.php'"),
    file: z
      .string()
      .min(1)
      .optional()
      .describe("Alias for 'path'"),
  },
  async (args) => {
    try {
      const result = await getStarterKitFile({
        path: args.path ?? args.file ?? "",
      });
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text",
            text: formatError(
              "file",
              args.path ?? args.file ?? "",
              message
            ),
          },
        ],
        isError: true,
      };
    }
  }
);

// ─── Tool: get_theme_doc ─────────────────────────────────────────────────────

server.tool(
  "get_theme_doc",
  "Read documentation from a local Automad theme project. " +
    "Looks for CLAUDE.md, README.md, theme.json, or specific files. " +
    "Useful when developing your own theme.",
  {
    path: z
      .string()
      .optional()
      .describe("Path within the theme, e.g. 'components/page.php', 'theme.json'"),
    themePath: z
      .string()
      .optional()
      .describe("Absolute path to theme directory"),
  },
  async (args) => {
    try {
      const result = await getThemeDoc({
        path: args.path,
        themePath: args.themePath,
      });
      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error reading theme: ${message}` }],
        isError: true,
      };
    }
  }
);

// ─── Tool: get_automad_version ───────────────────────────────────────────────

server.tool(
  "get_automad_version",
  "Get information about Automad Version 2 and migration tips.",
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
      "",
      "### Starter Kit",
      "The [Automad Theme Starter Kit](https://github.com/automadcms/automad-theme-starter-kit) " +
        "is the recommended starting point for building v2 themes.",
    ];
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ─── Tool: get_cache_stats ───────────────────────────────────────────────────

server.tool(
  "get_cache_stats",
  "Get statistics about the internal cache. Shows entries, TTL, and " +
    "oldest/newest entries for debugging.",
  {},
  async () => {
    const stats = getCacheStats();
    const lines: string[] = ["## Cache Statistics\n"];

    lines.push("### Documentation Pages");
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

// ─── Tool: clear_cache ───────────────────────────────────────────────────────

server.tool(
  "clear_cache",
  "Clear the internal cache to force fresh data on next request. " +
    "Use when documentation has been updated.",
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

// ─── Tool: health ────────────────────────────────────────────────────────────

server.tool(
  "health",
  "Health check endpoint. Returns server status, uptime, and version info. " +
    "Useful for monitoring and debugging.",
  {},
  async () => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();

    const lines: string[] = [
      "## Automad MCP Server - Health Check",
      "",
      "### Status",
      "- **Status**: ✅ Healthy",
      `- **Uptime**: ${formatUptime(uptime)}`,
      `- **Version**: 1.0.0`,
      "",
      "### Memory",
      `- **RSS**: ${formatBytes(memUsage.rss)}`,
      `- **Heap Used**: ${formatBytes(memUsage.heapUsed)}`,
      `- **Heap Total**: ${formatBytes(memUsage.heapTotal)}`,
      "",
      "### Environment",
      `- **Node.js**: ${process.version}`,
      `- **Platform**: ${process.platform}`,
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

function formatError(
  type: "page" | "file",
  identifier: string,
  message: string
): string {
  const lines: string[] = [];

  if (message.includes("ECONNABORTED") || message.includes("timeout")) {
    lines.push(
      `❌ **Timeout** — The request to ${identifier} took too long.`
    );
    lines.push(
      "\nThe server may be slow or unavailable. Try again in a few minutes."
    );
  } else if (message.includes("404") || message.includes("Not Found")) {
    lines.push(`❌ **Not Found** — ${identifier} could not be found.`);
    lines.push("\nCheck the URL/path and try again.");
  } else if (
    message.includes("429") ||
    message.includes("Too Many Requests")
  ) {
    lines.push(`⚠️ **Rate Limited** — Too many requests.`);
    lines.push(
      "\nWait a moment and try again. The cache will help reduce future requests."
    );
  } else if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
    lines.push(`❌ **Connection Error** — Cannot reach the server.`);
    lines.push("\nCheck your internet connection and try again.");
  } else {
    lines.push(`❌ **Error** — ${message}`);
  }

  if (type === "page") {
    lines.push(
      "\nUse `list_pages` or `search_docs` to find valid documentation pages."
    );
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
