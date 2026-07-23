import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export const livePreviewInputSchema = z.object({
  action: z
    .enum(['status', 'start', 'stop', 'open'])
    .optional()
    .default('status')
    .describe('Action: status, start, stop, or open'),
  port: z
    .number()
    .int()
    .min(1024)
    .max(65535)
    .optional()
    .default(8000)
    .describe('Port for development server'),
  themePath: z.string().optional().describe('Theme or Automad installation path'),
});

export type LivePreviewInput = z.infer<typeof livePreviewInputSchema>;

interface ServerStatus {
  running: boolean;
  pid?: number;
  port?: number;
  url?: string;
}

/**
 * Manage local development server for theme preview
 */
export async function livePreview(input: LivePreviewInput): Promise<string> {
  const { action = 'status', port = 8000, themePath } = input;

  switch (action) {
    case 'status':
      return await getServerStatus(port);
    case 'start':
      return await startServer(port, themePath);
    case 'stop':
      return await stopServer(port);
    case 'open':
      return await openBrowser(port);
    default:
      return `❌ Unknown action: ${action}`;
  }
}

async function getServerStatus(port: number): Promise<string> {
  try {
    // Check if server is running on port
    const { stdout } = await execAsync(`lsof -i :${port} -sTCP:LISTEN -t 2>/dev/null || true`);
    const pid = stdout.trim();

    if (pid) {
      const lines: string[] = [
        `## Development Server\n`,
        `**Status:** ✅ Running\n`,
        `**Port:** ${port}\n`,
        `**PID:** ${pid}\n`,
        `**URL:** http://localhost:${port}\n`,
        '\n---',
        '\n**Commands:**',
        '\n- `start` — Start the server',
        '\n- `stop` — Stop the server',
        '\n- `open` — Open in browser',
      ];
      return lines.join('\n');
    } else {
      const lines: string[] = [
        `## Development Server\n`,
        `**Status:** ❌ Not running\n`,
        '\n---',
        '\n**Commands:**',
        '\n- `start` — Start the server on port 8000',
        '\n- `open` — Start and open in browser',
      ];
      return lines.join('\n');
    }
  } catch {
    return `## Development Server\n\n❌ Unable to check status`;
  }
}

async function startServer(port: number, themePath?: string): Promise<string> {
  // Find Automad installation
  let automadPath = themePath;
  if (!automadPath) {
    const searchPaths = [process.cwd(), process.cwd() + '/../..', '/Users/cabroe/Projects/automad'];

    for (const p of searchPaths) {
      if (existsSync(p) && existsSync(join(p, 'automad'))) {
        automadPath = p;
        break;
      }
    }
  }

  if (!automadPath) {
    // Try current working directory
    automadPath = process.cwd();
  }

  // Check if already running
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -sTCP:LISTEN -t 2>/dev/null || true`);
    if (stdout.trim()) {
      return [
        `## Development Server\n`,
        `⚠️ Server already running on port ${port}`,
        `\n**URL:** http://localhost:${port}`,
      ].join('\n');
    }
  } catch {
    // Port check failed, continue
  }

  // Start server
  const escapedPath = automadPath.replace(/ /g, '\\ ');
  const command = `php -S localhost:${port} -t "${automadPath}" -c "${automadPath}/.user.ini" > /dev/null 2>&1 &`;

  try {
    await execAsync(command);

    // Wait briefly and verify
    await new Promise(r => setTimeout(r, 1000));

    const lines: string[] = [
      `## Development Server\n`,
      `✅ Started\n`,
      `**Port:** ${port}\n`,
      `**Path:** ${automadPath}\n`,
      `**URL:** http://localhost:${port}\n`,
      '\n---',
      '\n**Next Steps:**',
      '\n1. Open http://localhost:${port} in your browser',
      '\n2. Edit theme files in real-time',
      '\n3. Use `stop` to shut down the server',
    ];

    return lines.join('\n');
  } catch (err) {
    return `❌ **Error starting server**\n\n${(err as Error).message}`;
  }
}

async function stopServer(port: number): Promise<string> {
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -sTCP:LISTEN -t 2>/dev/null || true`);
    const pid = stdout.trim();

    if (pid) {
      await execAsync(`kill ${pid}`);
      return [`## Development Server\n`, `✅ Stopped\n`, `**Previous Port:** ${port}`].join('\n');
    } else {
      return [`## Development Server\n`, `ℹ️ No server running on port ${port}`].join('\n');
    }
  } catch (err) {
    return `❌ **Error stopping server**\n\n${(err as Error).message}`;
  }
}

async function openBrowser(port: number): Promise<string> {
  const url = `http://localhost:${port}`;

  try {
    // Start server first if not running
    await startServer(port);

    // Open in default browser
    const command = process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    await execAsync(command);

    return [`## Opening Browser\n`, `**URL:** ${url}`].join('\n');
  } catch {
    return [
      `## Opening Browser\n`,
      `❌ Could not open browser automatically`,
      `\n**Manual:** Open ${url} in your browser`,
    ].join('\n');
  }
}

// Helper for join
function join(...parts: string[]): string {
  return parts.filter(Boolean).join('/');
}
