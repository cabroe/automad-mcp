import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const REFERENCE_FILES = [
  'template-syntax',
  'block-layouts',
  'blocks-snippets',
  'docker-testing',
  'i18n',
] as const;

export type ReferenceFile = (typeof REFERENCE_FILES)[number];

export const themeReferenceInputSchema = z.object({
  topic: z
    .enum(['all', ...REFERENCE_FILES])
    .optional()
    .default('all')
    .describe(`Reference topic: ${REFERENCE_FILES.join(', ')}`),
});

export async function getThemeReference(topic: string): Promise<string> {
  const refDir = join(__dirname, '../references');

  if (topic === 'all') {
    const results: string[] = [];
    for (const file of REFERENCE_FILES) {
      const content = await readFile(join(refDir, `${file}.md`), 'utf-8');
      results.push(`## ${file.replace(/-/g, ' ').toUpperCase()}\n\n${content}`);
    }
    return results.join('\n\n---\n\n');
  }

  const content = await readFile(join(refDir, `${topic}.md`), 'utf-8');
  return content;
}
