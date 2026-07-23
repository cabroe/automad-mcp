import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ASSET_FILES = [
  'theme.json.example',
  'default.php.example',
  'docker-compose.yml.example',
] as const;

export type AssetFile = (typeof ASSET_FILES)[number];

export const themeAssetInputSchema = z.object({
  type: z
    .enum(['all', ...ASSET_FILES])
    .optional()
    .default('all')
    .describe(`Asset type: ${ASSET_FILES.join(', ')}`),
});

export async function getThemeAsset(type: string): Promise<string> {
  const assetDir = join(__dirname, '../assets');

  if (type === 'all') {
    const results: string[] = [];
    for (const file of ASSET_FILES) {
      const content = await readFile(join(assetDir, file), 'utf-8');
      const lang = file.endsWith('.php') ? 'php' : file.endsWith('.yml') ? 'yaml' : 'json';
      results.push(`## ${file}\n\n\`\`\`${lang}\n${content}\n\`\`\``);
    }
    return results.join('\n\n---\n\n');
  }

  const content = await readFile(join(assetDir, type), 'utf-8');
  return content;
}
