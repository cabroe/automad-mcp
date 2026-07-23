import { z } from "zod";

export const snippetsInputSchema = z.object({
  category: z
    .enum(["all", "template", "block", "layout", "i18n", "navigation", "helper"])
    .optional()
    .default("all")
    .describe("Filter snippets by category"),
  search: z
    .string()
    .optional()
    .describe("Search snippets by name or description"),
});

export type SnippetsInput = z.infer<typeof snippetsInputSchema>;

interface Snippet {
  name: string;
  category: string;
  description: string;
  code: string;
  example?: string;
}

const SNIPPETS: Snippet[] = [
  // Template Syntax
  {
    name: "Variable Output",
    category: "template",
    description: "Output a variable with optional default",
    code: `@{ variableName | def('default value') }`,
    example: `@{ title | def('Untitled') }`,
  },
  {
    name: "Markdown Content",
    category: "template",
    description: "Render markdown content",
    code: `@{ variable | markdown }`,
    example: `@{ textTeaser | markdown }`,
  },
  {
    name: "Conditional Block",
    category: "template",
    description: "Show content only if variable exists",
    code: `<@ if @{ variable } @>
    Content here
<@ end @>`,
    example: `<@ if @{ image } @>
    <img src="@{ image }">
<@ end @>`,
  },
  {
    name: "If-Else Block",
    category: "template",
    description: "Show alternative content based on condition",
    code: `<@ if @{ variable } @>
    True content
<@ else @>
    False content
<@ end @>`,
  },
  {
    name: "Loop (foreach)",
    category: "template",
    description: "Iterate over pagelist or tags",
    code: `<@ foreach @{ items } as $item @>
    <div>$item->get('title')</div>
<@ end @>`,
    example: `<@ foreach @{ :pagelist } as $page @>
    <a href="$page->get('url')">$page->get('title')</a>
<@ end @>`,
  },
  {
    name: "Set Runtime Variable",
    category: "template",
    description: "Define a variable for use in template",
    code: `<@ set { :myVar: 'value' } @>`,
    example: `<@ set { :theme: @{ selectColorTheme | def('dark') } } @>`,
  },

  // Block Editor
  {
    name: "Main Content Block",
    category: "block",
    description: "Block editor main content area",
    code: `@{ +main }`,
    example: `<div class="content">@{ +main }</div>`,
  },
  {
    name: "Named Block Area",
    category: "block",
    description: "Additional block area (e.g., for hero section)",
    code: `@{ +hero }`,
    example: `<section class="hero">@{ +hero }</section>`,
  },
  {
    name: "Block Container",
    category: "block",
    description: "Proper container for block content",
    code: `<div class="am-block">
    @{ +main }
</div>`,
  },
  {
    name: "Block Width Styling",
    category: "block",
    description: "CSS for proper block layout",
    code: `:root {
    --am-block-max-width: 50rem;
    --am-container-padding: 2rem;
}`,
  },

  // Layout / Inheritance
  {
    name: "Include Component",
    category: "layout",
    description: "Include a reusable component file",
    code: `<@ components/filename.php @>`,
    example: `<@ components/nav.php @>`,
  },
  {
    name: "Define Snippet",
    category: "layout",
    description: "Create a reusable snippet",
    code: `<@~ snippet mySnippet ~@>
    Snippet content
<@~ end ~@>`,
    example: `<@~ snippet article ~@>
    <article>
        <h1>@{ title }</h1>
        @{ +main }
    </article>
<@~ end ~@>`,
  },
  {
    name: "Call Snippet",
    category: "layout",
    description: "Execute a defined snippet",
    code: `<@ mySnippet @>`,
  },
  {
    name: "Override Snippet (Inheritance)",
    category: "layout",
    description: "Override snippet in derived template",
    code: `<@ master_template.php @>

<@~ snippet article ~@>
    <!-- New implementation -->
<@~ end ~@>`,
  },
  {
    name: "Snippets must be top-level",
    category: "layout",
    description: "Important: snippet overrides must be at template root",
    code: `<!-- CORRECT: Override on top level -->
<@ include.php @>
<@~ snippet nested ~@><@~ end ~@>

<!-- WRONG: Nested snippet override -->
<@ include.php @>
<@~ snippet outer ~@>
    <@~ snippet nested ~@><@~ end ~@>
<@~ end ~@>`,
  },

  // i18n
  {
    name: "Translation Helper",
    category: "i18n",
    description: "Get translated string by key",
    code: `<@ t { key: 'section.title' } @>`,
    example: `<@ t { key: 'nav.products', lang: 'de' } @>`,
  },
  {
    name: "Translation with Placeholder",
    category: "i18n",
    description: "Replace placeholders in translation",
    code: `<@ t { key: 'message.text', name: 'John', count: 5 } @>`,
    example: `// i18n.php
'message.text' => 'Hello {name}, you have {count} items'`,
  },
  {
    name: "Language Switch Link",
    category: "i18n",
    description: "Link to switch between languages",
    code: `<@ langSwitchLink @>`,
    example: `<nav>
    <@ langSwitchLink @>
</nav>`,
  },
  {
    name: "Language from Runtime",
    category: "i18n",
    description: "Get current language from Automad",
    code: `@{ :lang }`,
    example: `<html lang="@{ :lang | def('de') }">`,
  },

  // Navigation
  {
    name: "Navigation Tree",
    category: "navigation",
    description: "Full site navigation tree",
    code: `<@ navTree @>`,
  },
  {
    name: "Breadcrumbs",
    category: "navigation",
    description: "Show current page path",
    code: `<@ breadcrumbs @>`,
  },
  {
    name: "Page List",
    category: "navigation",
    description: "List of pages (children/siblings/all)",
    code: `<@ newPagelist { type: 'children' } @>
<@ foreach @pagelist as $page @>
    <a href="$page->get('url')">$page->get('title')</a>
<@ end @>`,
    example: `<@ newPagelist { type: 'children', sort: 'date desc' } @>`,
  },
  {
    name: "Link to Page",
    category: "navigation",
    description: "Create link to specific page",
    code: `<@ nav { url: '/blog' } @>`,
    example: `<@ nav { url: '/blog', label: 'Blog' } @>`,
  },

  // Helpers
  {
    name: "Image with Processing",
    category: "helper",
    description: "Responsive image with auto-resize",
    code: `<@ img { src: '@{ image }', width: 800 } @>`,
    example: `<@ img { src: '@{ imageTeaser }', width: 1200, alt: '@{ title }' } @>`,
  },
  {
    name: "File List",
    category: "helper",
    description: "List files from a directory",
    code: `<@ filelist { path: '/shared/downloads' } @>`,
  },
  {
    name: "Markdown Pipeline",
    category: "helper",
    description: "Chain multiple transformations",
    code: `@{ text | stripTags | shorten (200) | markdown }`,
    example: `@{ textTeaser | stripTags | 150 | markdown }`,
  },
  {
    name: "Date Formatting",
    category: "helper",
    description: "Format a date string",
    code: `@{ date | dateFormat ('d. F Y') }`,
    example: `@{ :created | dateFormat ('j. M Y') }`,
  },
  {
    name: "Escape for HTML",
    category: "helper",
    description: "Escape special characters",
    code: `@{ variable | escape }`,
  },
  {
    name: "URL Sanitize",
    category: "helper",
    description: "Make string URL-safe",
    code: `@{ title | sanitize }`,
    example: `<a href="/blog/@{ slug | sanitize }">@{ title }</a>`,
  },
];

/**
 * Get available snippets
 */
export function getSnippets(input: SnippetsInput): string {
  const { category, search } = input;

  let filtered = SNIPPETS;

  // Filter by category
  if (category !== "all") {
    filtered = filtered.filter((s) => s.category === category);
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.code.toLowerCase().includes(searchLower)
    );
  }

  if (filtered.length === 0) {
    return `No snippets found${search ? ` for "${search}"` : ""}.\n\nTry a different search term or use \`category: "all"\`.`;
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
    `## Automad Snippets (${filtered.length} found)\n`,
    "Categories: template, block, layout, i18n, navigation, helper\n",
  ];

  for (const [cat, snippets] of grouped) {
    lines.push(`### ${formatCategory(cat)}`);
    for (const s of snippets) {
      lines.push(`\n**${s.name}**`);
      lines.push(`\n_${s.description}_`);
      lines.push("\n```");
      lines.push(s.code);
      lines.push("```");
      if (s.example) {
        lines.push(`_Example: \`${s.example}\`_`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    template: "📝 Template Syntax",
    block: "🧱 Block Editor",
    layout: "🎨 Layout & Inheritance",
    i18n: "🌐 Internationalization (i18n)",
    navigation: "🧭 Navigation",
    helper: "🛠️ Helper Functions",
  };
  return map[cat] ?? cat;
}

/**
 * Get snippet categories
 */
export function getSnippetCategories(): string[] {
  return [...new Set(SNIPPETS.map((s) => s.category))];
}
