import { z } from 'zod';

export const snippetsInputSchema = z.object({
  category: z
    .enum(['all', 'statements', 'variables', 'blocks', 'layout', 'i18n', 'navigation', 'helper'])
    .optional()
    .default('all')
    .describe('Filter by category'),
  search: z.string().optional().describe('Search snippets by name or description'),
});

export type SnippetsInput = z.infer<typeof snippetsInputSchema>;

interface Snippet {
  name: string;
  category: string;
  description: string;
  code: string;
  note?: string;
}

const SNIPPETS: Snippet[] = [
  // Statements (mit <@ @>)
  {
    name: 'Include Component',
    category: 'statements',
    description: 'Lädt eine Component-Datei',
    code: '<@ components/nav.php @>',
    note: 'Mit <@ @> Klammern!',
  },
  {
    name: 'If-Block',
    category: 'statements',
    description: 'Bedingte Anzeige',
    code: '<@ if @{ variable } @>\n    Content\n<@ end @>',
  },
  {
    name: 'If-Else-Block',
    category: 'statements',
    description: 'Bedingte Anzeige mit Alternative',
    code: '<@ if @{ variable } @>\n    True\n<@ else @>\n    False\n<@ end @>',
  },
  {
    name: 'Foreach-Loop',
    category: 'statements',
    description: 'Über Liste iterieren',
    code: "<@ foreach @{ items } as $item @>\n    <div>$item->get('title')</div>\n<@ end @>",
  },
  {
    name: 'Set Variable',
    category: 'statements',
    description: 'Runtime-Variable setzen',
    code: '<@ set { :myVar: "value" } @>',
    note: 'Für Theme-Wechsel etc.',
  },
  {
    name: 'Snippet Definieren',
    category: 'statements',
    description: 'Wiederverwendbares Snippet erstellen',
    code: '<@~ snippet name ~@>\n    Content\n<@~ end ~@>',
    note: '~ statt normale Klammern!',
  },
  {
    name: 'Snippet Aufrufen',
    category: 'statements',
    description: 'Definiertes Snippet ausführen',
    code: '<@ meinSnippet @>',
  },

  // Variablen (@{ })
  {
    name: 'Page Variable',
    category: 'variables',
    description: 'Feld-Wert aus Dashboard',
    code: '@{ title }',
    note: 'OHNE <@ @> Klammern!',
  },
  {
    name: 'Mit Default',
    category: 'variables',
    description: 'Fallback wenn leer',
    code: "@{ title | def('Default Title') }",
  },
  {
    name: 'Markdown rendern',
    category: 'variables',
    description: 'Markdown zu HTML',
    code: '@{ text | markdown }',
  },
  {
    name: 'Runtime Variable',
    category: 'variables',
    description: 'System-Variable (immer mit :)',
    code: '@{ :lang }\n@{ :url }\n@{ :theme }',
  },
  {
    name: 'Pipes kombinieren',
    category: 'variables',
    description: 'Mehrere Filter ketten',
    code: '@{ text | stripTags | shorten (150) | markdown }',
  },

  // Block (@{ + })
  {
    name: 'Main Content Block',
    category: 'blocks',
    description: 'Block-Editor Hauptbereich',
    code: '@{ +main }',
    note: 'OHNE <@ @>! Plus mit Leerzeichen!',
  },
  {
    name: 'Benannter Block',
    category: 'blocks',
    description: 'Extra Block-Bereich (Hero, etc.)',
    code: '@{ +hero }\n@{ +sidebar }',
  },
  {
    name: 'Block mit Wrapper',
    category: 'blocks',
    description: 'Block im Container',
    code: '<div class="content">\n    @{ +main }\n</div>',
  },

  // Layout
  {
    name: 'Component-Based Layout',
    category: 'layout',
    description: 'Master-Template mit Includes',
    code: '<@ components/page.php @>',
  },
  {
    name: 'Snippet Override',
    category: 'layout',
    description: 'Snippet nach Include überschreiben',
    code: '<@ components/page.php @>\n\n<@~ snippet article ~@>\n    Neu Inhalt\n<@~ end ~@>',
  },
  {
    name: 'Navbar Component',
    category: 'layout',
    description: 'Navigation einbinden',
    code: '<@ components/nav.php @>',
  },
  {
    name: 'Footer Component',
    category: 'layout',
    description: 'Footer einbinden',
    code: '<@ components/footer.php @>',
  },

  // i18n
  {
    name: 'Übersetzung',
    category: 'i18n',
    description: 'Text aus Wörterbuch holen',
    code: '<@ t { key: "nav.products" } @>',
  },
  {
    name: 'Übersetzung mit Platzhalter',
    category: 'i18n',
    description: 'Platzhalter ersetzen',
    code: '<@ t { key: "msg.text", name: "Max" } @>',
    note: "In i18n.php: 'msg.text' => 'Hallo {name}'",
  },
  {
    name: 'Sprach-Link',
    category: 'i18n',
    description: 'Link zur anderen Sprache',
    code: '<@ langSwitchLink @>',
  },

  // Navigation
  {
    name: 'Navigation Tree',
    category: 'navigation',
    description: 'Vollständige Navigation',
    code: '<@ navTree @>',
  },
  {
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Pfad-Anzeige',
    code: '<@ breadcrumbs @>',
  },
  {
    name: 'Page List',
    category: 'navigation',
    description: 'Liste von Seiten',
    code: "<@ newPagelist { type: 'children' } @>",
  },
  {
    name: 'Page List mit Loop',
    category: 'navigation',
    description: 'Seiten durchgehen',
    code: "<@ newPagelist { type: 'children', sort: 'date desc' } @>\n<@ foreach @pagelist as $page @>\n    <a href=\"$page->get('url')\">$page->get('title')</a>\n<@ end @>",
  },

  // Helper
  {
    name: 'Bild mit Processing',
    category: 'helper',
    description: 'Responsives Bild',
    code: "<@ img { src: '@{ image }', width: 800 } @>",
  },
  {
    name: 'Datum formatieren',
    category: 'helper',
    description: 'Datum umwandeln',
    code: "@{ date | dateFormat ('d. F Y') }",
  },
  {
    name: 'Text kürzen',
    category: 'helper',
    description: 'Auf Zeichen limitieren',
    code: '@{ text | shorten (200) }',
  },
  {
    name: 'URL-sicher machen',
    category: 'helper',
    description: 'Für URLs bereinigen',
    code: '@{ title | sanitize }',
  },
];

/**
 * Get snippets filtered by category or search
 */
export function getSnippets(input: SnippetsInput): string {
  const { category, search } = input;

  let filtered = SNIPPETS;

  if (category !== 'all') {
    filtered = filtered.filter(s => s.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.code.toLowerCase().includes(searchLower)
    );
  }

  if (filtered.length === 0) {
    return `No snippets found${search ? ` for "${search}"` : ''}.\n\nCategories: statements, variables, blocks, layout, i18n, navigation, helper`;
  }

  // Group by category
  const grouped = new Map<string, Snippet[]>();
  for (const snippet of filtered) {
    if (!grouped.has(snippet.category)) {
      grouped.set(snippet.category, []);
    }
    grouped.get(snippet.category)!.push(snippet);
  }

  const lines: string[] = [
    `## Snippets (${filtered.length} found)\n`,
    'Categories: statements, variables, blocks, layout, i18n, navigation, helper\n',
  ];

  for (const [cat, snippets] of grouped) {
    lines.push(`\n### ${formatCategory(cat)}`);
    for (const s of snippets) {
      lines.push(`\n**${s.name}**`);
      lines.push(`_${s.description}_`);
      lines.push('\n```');
      lines.push(s.code);
      lines.push('```');
      if (s.note) {
        lines.push(`⚠️ ${s.note}`);
      }
    }
  }

  lines.push('\n---\n');
  lines.push('\n**Tipp:** Nutze `get_template_syntax` für eine vollständige Syntax-Referenz!\n');

  return lines.join('\n');
}

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    statements: '📋 Statements `<@ @>`',
    variables: '🔧 Variablen `@{ }`',
    blocks: '🧱 Blocks `@{ + }`',
    layout: '🎨 Layout & Components',
    i18n: '🌐 Internationalisierung',
    navigation: '🧭 Navigation',
    helper: '🛠️ Helper Funktionen',
  };
  return map[cat] ?? cat;
}

export function getSnippetCategories(): string[] {
  return [...new Set(SNIPPETS.map(s => s.category))];
}
