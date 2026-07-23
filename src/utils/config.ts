import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export interface Config {
  verbose: boolean;
  cacheDir: string;
  cacheTtlMs: number;
  themePath?: string;
}

const DEFAULT_CONFIG: Config = {
  verbose: false,
  cacheDir: join(process.env.HOME ?? ".", ".cache", "automad-mcp"),
  cacheTtlMs: 60 * 60 * 1000, // 1 hour
};

let cachedConfig: Config | null = null;

/**
 * Load configuration from ~/.automad-mcp.json
 */
export async function loadConfig(): Promise<Config> {
  if (cachedConfig !== null) {
    return cachedConfig;
  }

  const configPath = join(process.env.HOME ?? ".", ".automad-mcp.json");

  if (existsSync(configPath)) {
    try {
      const content = await readFile(configPath, "utf-8");
      const userConfig = JSON.parse(content);
      cachedConfig = { ...DEFAULT_CONFIG, ...userConfig };
    } catch (err) {
      console.error(`Failed to load config: ${(err as Error).message}`);
      cachedConfig = DEFAULT_CONFIG;
    }
  } else {
    cachedConfig = DEFAULT_CONFIG;
  }

  return cachedConfig as Config;
}

/**
 * Save configuration to ~/.automad-mcp.json
 */
export async function saveConfig(config: Partial<Config>): Promise<void> {
  const configPath = join(process.env.HOME ?? ".", ".automad-mcp.json");
  const current = await loadConfig();
  const updated = { ...current, ...config };

  // Ensure directory exists
  const dir = configPath.substring(0, configPath.lastIndexOf("/"));
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(configPath, JSON.stringify(updated, null, 2), "utf-8");
  cachedConfig = updated;
}

/**
 * Get the effective cache directory
 */
export async function getCacheDir(): Promise<string> {
  const config = await loadConfig();
  const cacheDir = config.cacheDir;

  if (!existsSync(cacheDir)) {
    await mkdir(cacheDir, { recursive: true });
  }

  return cacheDir;
}

/**
 * Parse command line arguments
 */
export function parseArgs(argv: string[]): {
  config: Partial<Config>;
  remaining: string[];
} {
  const config: Partial<Config> = {};
  const remaining: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case "-v":
      case "--verbose":
        config.verbose = true;
        break;
      case "--cache-dir":
        if (argv[i + 1]) {
          config.cacheDir = argv[i + 1];
          i++;
        }
        break;
      case "--no-cache":
        config.cacheTtlMs = 0;
        break;
      case "--theme-path":
        if (argv[i + 1]) {
          config.themePath = argv[i + 1];
          i++;
        }
        break;
      default:
        if (!arg.startsWith("-")) {
          remaining.push(arg);
        }
    }
  }

  return { config, remaining };
}

/**
 * Log message if verbose mode is enabled
 */
export function logVerbose(message: string): void {
  if (cachedConfig && cachedConfig.verbose) {
    console.error(`[verbose] ${message}`);
  }
}
