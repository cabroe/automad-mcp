import { z } from 'zod';
import { BASE_URL } from '../utils/pages.js';

export const cliDocsInputSchema = z.object({
  command: z.string().optional().describe('Specific CLI command'),
});

export type CliDocsInput = z.infer<typeof cliDocsInputSchema>;

const CLI_COMMANDS = [
  {
    name: 'php amd create-package',
    desc: 'Create a new package (theme/extension)',
    args: '<type> <name>',
    example: 'php amd create-package theme my-theme',
  },
  {
    name: 'php amd install',
    desc: 'Install packages from Packagist',
    args: '<package1> <package2> ...',
    example: 'php amd install automad/bolt-theme',
  },
  {
    name: 'php amd update',
    desc: 'Update installed packages',
    args: '[package]',
    example: 'php amd update',
  },
  {
    name: 'php amd clear-cache',
    desc: 'Clear the render cache',
    args: '',
    example: 'php amd clear-cache',
  },
  {
    name: 'php amd user create',
    desc: 'Create a new user account',
    args: '<email> <password> [role]',
    example: 'php amd user create admin@example.com secret123 admin',
  },
  {
    name: 'php amd user list',
    desc: 'List all users',
    args: '',
    example: 'php amd user list',
  },
  {
    name: 'php amd user delete',
    desc: 'Delete a user',
    args: '<email>',
    example: 'php amd user delete old@example.com',
  },
  {
    name: 'php amd export',
    desc: 'Export site data',
    args: '[format]',
    example: 'php amd export json',
  },
];

/**
 * Get CLI command documentation
 */
export function getCliDocs(input: CliDocsInput): string {
  const { command } = input;

  if (command) {
    const cmd = CLI_COMMANDS.find(c => c.name.includes(command));
    if (cmd) {
      return [
        `## ${cmd.name}\n`,
        `${cmd.desc}\n`,
        '\n### Usage\n',
        '```bash',
        `${cmd.name} ${cmd.args}`,
        '```\n',
        '\n### Example\n',
        '```bash',
        cmd.example,
        '```\n',
      ].join('\n');
    }
    return `No CLI command found matching: ${command}`;
  }

  const lines: string[] = [
    '## Automad v2 CLI Commands\n',
    `Source: ${BASE_URL}/cli\n`,
    '\nRun with: `php amd <command>`\n',
    '---\n',
    '| Command | Description |',
    '|---------|-------------|\n',
  ];

  for (const cmd of CLI_COMMANDS) {
    lines.push(`| \`${cmd.name}\` | ${cmd.desc} |`);
  }

  lines.push('\n---\n');
  lines.push('### Usage\n');
  lines.push('```bash');
  lines.push('# In Automad directory');
  lines.push('php amd <command> [args]');
  lines.push('```\n');

  return lines.join('\n');
}
