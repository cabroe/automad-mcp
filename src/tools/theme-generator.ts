import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const themeGeneratorInputSchema = z.object({
  name: z.string().min(1).optional().describe("Theme name (e.g., 'My Theme')"),
  outputPath: z.string().optional().describe('Output directory for new theme'),
  template: z
    .enum(['minimal', 'starter', 'blog', 'portfolio'])
    .optional()
    .default('starter')
    .describe('Template type'),
  author: z.string().optional().default('Developer').describe('Author name'),
});

export type ThemeGeneratorInput = z.infer<typeof themeGeneratorInputSchema>;

interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * Generate a new Automad theme from template
 */
export async function generateTheme(input: ThemeGeneratorInput): Promise<string> {
  const { name = 'My Theme', outputPath, template = 'starter', author = 'Developer' } = input;

  // Determine output path
  const themeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const basePath = outputPath ?? join(process.cwd(), themeName);
  const fullPath = join(basePath, themeName);

  // Check if exists
  if (existsSync(fullPath)) {
    return `❌ **Error**\n\nTheme directory already exists: ${fullPath}`;
  }

  // Generate files
  const files = getTemplateFiles(themeName, name, author, template);

  // Create directories
  const dirs = new Set(
    files.map(f => join(fullPath, f.path.substring(0, f.path.lastIndexOf('/'))))
  );

  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }

  // Write files
  for (const file of files) {
    const filePath = join(fullPath, file.path);
    await writeFile(filePath, file.content, 'utf-8');
  }

  // Format output
  const lines: string[] = [
    `## Theme Generated: ${name}\n`,
    `**Path:** \`${fullPath}\`\n`,
    `**Template:** ${template}\n`,
    '---\n',
  ];

  lines.push('### Generated Files\n');
  for (const file of files) {
    lines.push(`- \`${file.path}\``);
  }
  lines.push('');

  lines.push('### Next Steps\n');
  lines.push('```bash');
  lines.push(`cd ${fullPath}`);
  lines.push('npm install');
  lines.push('npm run dev');
  lines.push('```\n');

  lines.push('Then activate the theme in your Automad dashboard.\n');

  if (template === 'minimal') {
    lines.push('**Note:** This is a minimal theme. For production, consider:\n');
    lines.push('- Adding `lib/i18n.php` for translations');
    lines.push('- Pre-compiling CSS to `dist/`');
    lines.push('- Adding proper error handling');
  }

  return lines.join('\n');
}

function getTemplateFiles(
  themeName: string,
  displayName: string,
  author: string,
  template: string
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // README.md
  files.push({
    path: 'README.md',
    content: `# ${displayName}

An Automad theme.

## Installation

Copy to your Automad packages directory and activate in dashboard.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## License

MIT`,
  });

  // theme.json
  files.push({
    path: 'theme.json',
    content: JSON.stringify(
      {
        name: displayName,
        description: `A custom Automad theme`,
        author: author,
        version: '1.0.0',
        license: 'MIT',
        masks: { page: [], shared: [] },
        tooltips: {
          '+main': 'Main content area — use the block editor',
        },
      },
      null,
      2
    ),
  });

  // composer.json
  files.push({
    path: 'composer.json',
    content: JSON.stringify(
      {
        name: `custom/${themeName}`,
        description: `A custom Automad theme`,
        type: 'automad-package',
        license: 'MIT',
      },
      null,
      2
    ),
  });

  // default.php
  files.push({
    path: 'default.php',
    content: `<#

    Default page template.

#>
<@ components/page.php @>
`,
  });

  // page_not_found.php
  files.push({
    path: 'page_not_found.php',
    content: `<#

    404 page template.

#>
<@ components/page.php @>

<@~ snippet hdMain ~@>
<main class="error-page">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
</main>
<@~ end ~@>
`,
  });

  // components/page.php
  files.push({
    path: 'components/page.php',
    content: `<# Shared page layout #>
<!DOCTYPE html>
<html lang="@{ :lang | def('de') }">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@{ title | def('${displayName}') }</title>
    <link rel="stylesheet" href="/packages/@{ theme }/dist/main.css">
</head>
<body>
    <@~ snippet hdMain ~@>
    <@~ end ~@>

    <@ hdMain @>
</body>
</html>
`,
  });

  // dist/main.css
  files.push({
    path: 'dist/main.css',
    content: `/* ${displayName} Theme */

:root {
    --color-bg: #ffffff;
    --color-text: #1a1a1a;
    --color-link: #3b82f6;
    --color-border: #e5e5e5;
    --max-width: 1200px;
}

* { box-sizing: border-box; }

body {
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-bg);
    margin: 0;
    padding: 0;
}

main {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 2rem;
}

h1 { font-size: 2.5rem; margin-bottom: 1rem; }
h2 { font-size: 2rem; margin: 2rem 0 1rem; }
h3 { font-size: 1.5rem; margin: 1.5rem 0 0.75rem; }

a { color: var(--color-link); }

.content > * {
    max-width: 70ch;
}

.error-page {
    text-align: center;
    padding: 4rem 2rem;
}

@media (max-width: 600px) {
    main { padding: 1rem; }
    h1 { font-size: 2rem; }
}
`,
  });

  // lib/functions.php
  files.push({
    path: 'lib/functions.php',
    content: `<?php

use Automad\\Core\\Automad;

/**
 * Add your helper functions here.
 * Available: $Automad->Context->get(), $Automad->Shared->get(), $Automad->Runtime->get()
 */
`,
  });

  // Add template-specific files
  if (template === 'blog' || template === 'starter') {
    files.push({
      path: 'blog.php',
      content: `<#

    Blog overview template.

#>
<@ components/page.php @>

<@~ snippet hdMain ~@>
<main class="blog">
    <h1>@{ title | def('Blog') }</h1>
    <div class="posts">
        <@ newPagelist { type: 'children', sort: 'date desc' } @>
        <@ foreach @pagelist as $page @>
        <article class="post-preview">
            <h2><a href="$page->get('url')">$page->get('title')</a></h2>
            <time>$page->get('date | dateFormat ("d. F Y")')</time>
            <p>$page->get('+main | shorten (200)')</p>
        </article>
        <@ end @>
    </div>
</main>
<@~ end ~@>
`,
    });

    files.push({
      path: 'post.php',
      content: `<#

    Single blog post template.

#>
<@ components/page.php @>

<@~ snippet hdMain ~@>
<main class="post">
    <article>
        <header>
            <h1>@{ title }</h1>
            <time>@{ date | dateFormat ("d. F Y") }</time>
        </header>
        <div class="content">
            @{ +main }
        </div>
    </article>
    <nav class="post-nav">
        <a href="@{ :urlParent }">← Back</a>
    </nav>
</main>
<@~ end ~@>
`,
    });
  }

  // .gitignore
  files.push({
    path: '.gitignore',
    content: `.DS_Store
node_modules/
*.map
`,
  });

  return files;
}
