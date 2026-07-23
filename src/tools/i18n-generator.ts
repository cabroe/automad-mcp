import { z } from "zod";
import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export const i18nGeneratorInputSchema = z.object({
  templatePath: z.string().optional().describe("Path to template file to scan"),
  themePath: z.string().optional().describe("Theme path to scan all templates"),
  generate: z.boolean().optional().describe("Generate i18n.php skeleton"),
  languages: z.string().optional().describe("Comma-separated language codes"),
  pattern: z.enum(["all", "per-tree", "per-field", "mixed"]).optional().describe("i18n pattern to explain"),
});

export type I18nGeneratorInput = z.infer<typeof i18nGeneratorInputSchema>;

interface TranslationKey {
  key: string;
  value: string;
  source: string;
}

/**
 * Generate i18n skeleton, analyze templates, or explain i18n patterns
 */
export async function generateI18n(input: I18nGeneratorInput): Promise<string> {
  const { templatePath, themePath, generate, languages, pattern } = input;
  const langList = (languages || "de,en").split(",").map((l) => l.trim());
  const patternVal = pattern || "all";
  const generateFlag = generate ?? false;

  // Generate skeleton takes priority
  if (generateFlag) return generateSkeleton(langList);

  // Return pattern explanation when no scan target or pattern specified
  if (patternVal !== "all" || (!templatePath && !themePath)) {
    return formatI18nPatterns(patternVal, langList);
  }

  const filesToScan: string[] = [];

  if (themePath && existsSync(themePath)) {
    filesToScan.push(...(await getPhpFiles(themePath)));
  } else if (templatePath && existsSync(templatePath)) {
    filesToScan.push(templatePath);
  } else {
    return formatError("No template or theme path provided.");
  }

  const keys = await scanForTranslations(filesToScan);

  if (keys.length === 0) return "No translatable strings found.";

  const lines: string[] = [
    `## Translation Analysis\n`,
    `Scanned ${filesToScan.length} file(s), found ${keys.length} key(s)\n`,
    "---\n",
    "### Suggested i18n.php Structure\n",
    "```php",
    "<?php",
    "return [",
  ];

  for (const lang of langList) {
    lines.push(`    '${lang}' => [`);
    for (const k of keys) {
      const keyName = k.key.replace(/\./g, "_").toLowerCase();
      lines.push(`        '${keyName}' => '${lang === 'en' ? k.value : ''},`);
    }
    lines.push("    ],");
  }

  lines.push("];");
  lines.push("```");

  return lines.join("\n");
}

async function getPhpFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await getPhpFiles(fullPath)));
    else if (entry.name.endsWith(".php")) files.push(fullPath);
  }
  return files;
}

async function scanForTranslations(files: string[]): Promise<TranslationKey[]> {
  const keys: TranslationKey[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    if (!existsSync(file)) continue;
    const content = await readFile(file, "utf-8");
    const relativePath = file.split("/").pop() ?? file;

    // Find @ t { key: '...' } patterns
    const tMatches = content.matchAll(/@\{\s*t\s*\{\s*key:\s*['"]([^'"]+)['"]/g);
    for (const match of tMatches) {
      const key = match[1] as string;
      if (!seen.has(key)) { seen.add(key); keys.push({ key, value: key.split(".").pop() ?? key, source: relativePath }); }
    }

    // Find hardcoded strings
    const patterns = [
      /['"](?:Products?|Pre-order|Blog|Contact|Imprint|Privacy|Submit|Cancel)['"]/gi,
      /['"](?:Produkte|Vorbestellen|Kontakt|Impressum|Datenschutz|Absenden)['"]/gi,
    ];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const value = (match[0] as string).replace(/['"]/g, "");
        const key = value.toLowerCase().replace(/[^a-z]/g, "_");
        if (!seen.has(key)) { seen.add(key); keys.push({ key, value, source: `${relativePath} (hardcoded)` }); }
      }
    }
  }

  return keys;
}

function generateSkeleton(languages: string[]): string {
  const commonKeys = [
    { key: "nav.products", en: "Products", de: "Produkte" },
    { key: "nav.preorder", en: "Pre-order", de: "Vorbestellen" },
    { key: "nav.blog", en: "Blog", de: "Blog" },
    { key: "footer.imprint", en: "Imprint", de: "Impressum" },
    { key: "footer.privacy", en: "Privacy", de: "Datenschutz" },
    { key: "form.submit", en: "Submit", de: "Absenden" },
    { key: "error.notfound", en: "Page not found", de: "Seite nicht gefunden" },
  ];

  const lines: string[] = [
    "<?php",
    "/** Translation skeleton - copy to lib/i18n.php */",
    "return [",
  ];

  for (const lang of languages) {
    lines.push(`    '${lang}' => [`);
    for (const k of commonKeys) {
      lines.push(`        '${k.key}' => '${lang === "en" ? k.en : k.de}',`);
    }
    lines.push("        // Add more keys here");
    lines.push("    ],");
  }

  lines.push("];");

  return [
    "## Generated i18n.php Skeleton\n",
    "```php",
    lines.join("\n"),
    "```\n",
    "---\n",
    "**Files to create:**",
    "1. `lib/i18n.php` - the dictionary above",
    "2. Add `t` helper to `lib/functions.php`",
  ].join("\n");
}

function formatI18nPatterns(pattern: string, languages: string[]): string {
  const langs = languages.join(" / ");

  const perTree = `
### 🌳 Per-Tree Pattern

**Struktur:** Separate Seitenbäume für jede Sprache

\`\`\`
pages/
├── de/
│   ├── home.txt
│   ├── produkte.txt
│   └── kontakt.txt
└── en/
    ├── home.txt
    ├── products.txt
    └── contact.txt
\`\`\`

**Template:**
\`\`\`html
<nav>
  <a href="/de">DE</a>
  <a href="/en">EN</a>
</nav>
\`\`\`

**✓ Vorteile**
- SEO-freundlich (hreflang, saubere URLs)
- Jede Seite hat eigene URL-Struktur
- Einfach zu pflegen

**✗ Nachteile**
- Seiten müssen doppelt erstellt werden
- Umbenennen = beide Bäume anpassen

**→ Für:** Onepager, Marketing-Sites, Blogs`;

  const perField = `
### 🏷️ Per-Field Pattern

**Struktur:** Felder mit Sprach-Suffix

\`\`\`html
<h1>@{ textHeroTitle_de | def('@{ :title }') }</h1>
<h1>@{ textHeroTitle_en | def('@{ :title }') }</h1>
\`\`\`

**theme.json:**
\`\`\`json
{
  "tooltips": {
    "textHeroTitle_de": "Titel (DE)",
    "textHeroTitle_en": "Title (EN)"
  }
}
\`\`\`

**✓ Vorteile**
- Eine URL, beide Sprachen
- Alles an einem Ort

**✗ Nachteile**
- Viele Felder (\`_de\`, \`_en\` pro Feld)
- Tooltips müssen pro Sprache wiederholt werden
- Wartung aufwändig

**→ Für:** Single-Page-Landingpages`;

  const mixed = `
### 🔀 Mixed Pattern (Empfohlen)

**Struktur:** Per-Tree für Navigation/SEO, Per-Field für Inhalte

\`\`\`
pages/
├── de/
│   ├── home.txt
│   └── produkte.txt
└── en/
    ├── home.txt
    └── products.txt
\`\`\`

**Template:**
\`\`\`html
<html lang="@{ :language | def('de') }">
  <!-- Navigation via Per-Tree -->
  <nav>
    <@ newPagelist { type: 'children' } @>
    <a href="@{ :url }">@{ :title }</a>
  </nav>

  <!-- Inhalte via t() Helper -->
  <h1>@{ :title }</h1>
  <@ t { key: 'hero.welcome', lang: @{ :language } @>
</html>
\`\`\`

**✓ Vorteile**
- SEO-freundlich (deepe URLs pro Sprache)
- Sprachwechsel einfach
- UI-Texte zentral in i18n.php
- Seiteninhalte flexibel

**→ Für:** Die meisten mehrsprachigen Sites`;

  const comparison = `
---

## 📊 Vergleich

| Kriterium | Per-Tree | Per-Field | Mixed |
|-----------|----------|-----------|-------|
| SEO | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Pflege | ★★★★☆ | ★★★☆☆ | ★★★★★ |
| URLs | /de/ /en/ | /seite | /de/ /en/ |
| Aufwand | Mittel | Hoch | Optimal |

## 🎯 Entscheidungshilfe

1. **Onepager / Landingpage?** → Per-Field oder Mixed
2. **Blog / Multi-Page Site?** → Per-Tree oder Mixed
3. **Nur 2 Sprachen, wenig Content?** → Per-Field reicht
4. **Ernsthaftes SEO?** → Per-Tree oder Mixed

## 📝 Automad i18n Setup

1. **Dashboard:** \`/de\` und \`/en\` als Sprachwurzeln anlegen
2. **theme.json:** Sprach-Fallback konfigurieren
3. **lib/i18n.php:** UI-Texte zentral (Buttons, Labels, Fehlermeldungen)
4. **Template:** \`@{ :language }\` für \`lang="..."\` Attribut
`;

  let result = `## i18n Pattern Guide (${langs})\n`;

  if (pattern === "all" || pattern === "per-tree") result += perTree;
  if (pattern === "all" || pattern === "per-field") result += perField;
  if (pattern === "all" || pattern === "mixed") result += mixed;
  result += comparison;

  return result;
}

function formatError(message: string): string {
  return `❌ Error\n\n${message}`;
}
