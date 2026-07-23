import { z } from "zod";
import { fetchWithRetry } from "../utils/fetch.js";

export const blockTemplatesInputSchema = z.object({
  type: z.enum(["all", "pagelist", "sections"]).optional().default("all").describe("Block template type"),
});

export const blockTemplateInputSchema = z.object({
  type: z.string().min(1).describe("Block type (e.g., 'pagelist')"),
  variant: z.string().optional().describe("Variant name (e.g., 'grid', 'blog')"),
});

export type BlockTemplatesInput = z.infer<typeof blockTemplatesInputSchema>;
export type BlockTemplateInput = z.infer<typeof blockTemplateInputSchema>;

// Block templates available in the starter kit
const BLOCK_TEMPLATES: Record<string, { path: string; description: string }[]> = {
  pagelist: [
    { path: "blocks/pagelist/grid.php", description: "Grid layout for pagelist" },
  ],
  // Additional patterns based on Automad standard theme
  sections: [
    { path: "blocks/section.php", description: "Section wrapper block" },
  ],
};

const STARTER_KIT_BASE = "https://raw.githubusercontent.com/automadcms/automad-theme-starter-kit/master";

/**
 * List available block templates
 */
export async function getBlockTemplates(input: BlockTemplatesInput): Promise<string> {
  const { type } = input;

  const lines: string[] = [
    "## Automad Block Templates\n",
    "Block templates customize how blocks render in the editor.\n",
    "### Verfügbare Block-Typen\n",
  ];

  const types = type === "all" ? Object.keys(BLOCK_TEMPLATES) : [type];

  for (const t of types) {
    const templates = BLOCK_TEMPLATES[t] || [];
    if (templates.length === 0) continue;

    lines.push(`#### ${t.charAt(0).toUpperCase() + t.slice(1)}`);
    lines.push("");
    lines.push("| Variante | Pfad | Beschreibung |");
    lines.push("|----------|------|-------------|");
    for (const tmpl of templates) {
      lines.push(`| \`${tmpl.path.split("/").pop()?.replace(".php", "")}\` | \`${tmpl.path}\` | ${tmpl.description} |`);
    }
    lines.push("");
  }

  // Usage section
  lines.push("### Verwendung in Templates");
  lines.push("");
  lines.push("```html");
  lines.push("<# Automad nutzt das Block-Template automatisch,");
  lines.push("   wenn es in blocks/<type>/<variant>.php liegt. #>");
  lines.push("");
  lines.push('<@ blocks/pagelist/grid.php @>');
  lines.push("```");
  lines.push("");
  lines.push("### Eigenes Block-Template erstellen");
  lines.push("");
  lines.push("1. Kopiere ein bestehendes Template aus dem Starter Kit");
  lines.push("2. Lege es unter `blocks/<typ>/<variante>.php` ab");
  lines.push("3. Automad lädt es automatisch für diesen Block-Typ");

  return lines.join("\n");
}

/**
 * Get a specific block template from the starter kit
 */
export async function getBlockTemplate(input: BlockTemplateInput): Promise<string> {
  const { type, variant } = input;

  // Build path
  const path = variant
    ? `blocks/${type}/${variant}.php`
    : `blocks/${type}.php`;

  const url = `${STARTER_KIT_BASE}/${path}`;

  try {
    const response = await fetchWithRetry({ url, retries: 3, delayMs: 500, timeoutMs: 10000 });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const content = await response.text();

    return [
      `## Block Template: ${variant || "default"}`,
      "",
      `**Typ:** ${type}`,
      `**Pfad:** \`${path}\``,
      "",
      "---",
      "",
      "```php",
      content,
      "```",
      "",
      "---",
      "",
      "### Verwendung",
      "",
      `Place this file at \`blocks/${type}/${variant || "default"}.php\` in your theme.`,
      "",
      "### Anpassen",
      "",
      "1. Kopiere den Code in dein Theme",
      "2. Passe Styling/HTML an deine Bedürfnisse an",
      "3. Das Template wird automatisch von Automad geladen",
    ].join("\n");
  } catch (err) {
    const error = err as Error;
    if (error.message.includes("404")) {
      return [
        `❌ Block Template nicht gefunden`,
        "",
        `**Typ:** ${type}`,
        `**Variante:** ${variant || "default"}`,
        `**Pfad:** \`${path}\``,
        "",
        "Verfügbare Block-Typen:",
        ...Object.keys(BLOCK_TEMPLATES).map((t) => `  - ${t}`),
        "",
        "Tipp: Nutze `get_block_templates` für eine Übersicht.",
      ].join("\n");
    }
    throw err;
  }
}

// Export available types for validation
export const blockTypes = Object.keys(BLOCK_TEMPLATES);
