import { z } from "zod";

export const templateSyntaxInputSchema = z.object({
  type: z
    .enum(["all", "statements", "variables", "blocks", "snippets", "debug"])
    .optional()
    .default("all")
    .describe("Filter by syntax type"),
});

export type TemplateSyntaxInput = z.infer<typeof templateSyntaxInputSchema>;

/**
 * Get comprehensive Automad template syntax reference
 */
export function getTemplateSyntax(input: TemplateSyntaxInput): string {
  const { type } = input;

  const sections: string[] = [
    "## Automad Template Syntax Reference\n",
  ];

  if (type === "all" || type === "statements") {
    sections.push(...getStatementsSection());
  }

  if (type === "all" || type === "variables") {
    sections.push(...getVariablesSection());
  }

  if (type === "all" || type === "blocks") {
    sections.push(...getBlocksSection());
  }

  if (type === "all" || type === "snippets") {
    sections.push(...getSnippetsSection());
  }

  if (type === "all" || type === "debug") {
    sections.push(...getDebugSection());
  }

  return sections.join("\n");
}

function getStatementsSection(): string[] {
  return [
    "## 📋 Statements (`<@ ... @>`)\n",
    "",
    "Statements sind PHP-ähnliche Kontrollstrukturen. **Immer mit `<@ ... @>`!**",
    "",
    "### Include Component",
    "```",
    '<@ components/filename.php @>',
    "```",
    "_Lädt eine wiederverwendbare Template-Datei._",
    "",
    "### Conditional",
    "```",
    "<@ if @{ variable } @>",
    "    Content here",
    "<@ end @>",
    "",
    "<@ if @{ variable } @>",
    "    True",
    "<@ else @>",
    "    False",
    "<@ end @>",
    "```",
    "",
    "### Loop (foreach)",
    "```",
    "<@ foreach @{ items } as $item @>",
    "    <div>$item->get('title')</div>",
    "<@ end @>",
    "```",
    "",
    "### Set Variable",
    "```",
    '<@ set { :myVar: "value" } @>',
    '  <@ set { :theme: @{ selectColorTheme | def("dark") } } @>',
    "```",
    "",
    "### Helper Functions",
    "```",
    "<@ navTree @>",
    "<@ newPagelist { type: 'children' } @>",
    "<@ breadcrumbs @>",
    "```",
    "",
    "---\n",
  ];
}

function getVariablesSection(): string[] {
  return [
    "## 🔧 Variablen (`@{ ... }`)\n",
    "",
    "**Wichtig:** Variablen haben KEINE `<@ @>` Klammern! Nur `@{ ... }`",
    "",
    "### Page/Shared Variables",
    "```",
    "@{ title }",
    "@{ text }",
    "@{ image }",
    "@{ selectTheme }",
    "```",
    "_Holt den Wert eines Dashboard-Feldes._",
    "",
    "### Runtime Variables",
    "```",
    "@{ :lang }",
    "@{ :url }",
    "@{ :title }",
    "@{ :theme }",
    "```",
    "_System-Variablen (immer mit Doppelpunkt)._",
    "",
    "### Pipes (Filter)",
    "```",
    "@{ title | def('Default') }",
    "@{ text | markdown }",
    "@{ text | stripTags | shorten (200) }",
    "@{ date | dateFormat ('d. F Y') }",
    "```",
    "",
    "### Math Operations",
    "```",
    "@{ count | +1 }",
    "@{ price | *1.19 }",
    "@{ width | /2 }",
    "```",
    "",
    "---\n",
  ];
}

function getBlocksSection(): string[] {
  return [
    "## 🧱 Block Variables (`@{ +variablename }`)\n",
    "",
    "**Ohne `<@ @>`!** Nur `@{ +name }` — das Plus-Zeichen macht den Block-Editor.",
    "",
    "```",
    "@{ +main }",
    "@{ +hero }",
    "@{ +sidebar }",
    "```",
    "",
    "### Korrekte Verwendung",
    "```html",
    "<div class=\"content\">",
    "    @{ +main }",
    "</div>",
    "```",
    "",
    "### ❌ Falsch",
    "```",
    "<@ @{ +main } @>",  // NICHT! <@ @> Klammern nicht bei Block-Variablen
    "@{+main}",          // Leerzeichen vor dem Plus fehlt
    "@{ + main }",       // Leerzeichen nach dem Plus"
    "```",
    "",
    "### Block-Variablen im theme.json",
    "```json",
    '{',
    '  "masks": { "page": [], "shared": [] },',
    '  "tooltips": {',
    '    "+main": "Haupt-Inhaltsbereich"',
    "  }",
    '  "fieldOrder": ["+main"]',
    "}",
    "```",
    "",
    "---\n",
  ];
}

function getSnippetsSection(): string[] {
  return [
    "## 🔄 Snippets (Component-Based Templates)\n",
    "",
    "### Snippet definieren",
    "```",
    "<@~ snippet meinSnippet ~@>",
    "    <div class=\"snippet\">",
    "        @{ +main }",
    "    </div>",
    "<@~ end ~@>",
    "```",
    "",
    "### Snippet aufrufen",
    "```",
    "<@ meinSnippet @>",
    "```",
    "",
    "### Snippet überschreiben (Inheritance)",
    "```php",
    "<?php",
    "// default.php (Master-Template)",
    "<@ components/page.php @>",
    "",
    "// Override nach dem Include:",
    "<@~ snippet article ~@>",
    "    <article>",
    "        <h1>@{ title }</h1>",
    "        @{ +main }",
    "    </article>",
    "<@~ end ~@>",
    "```",
    "",
    "### ❌ Wichtig: Top-Level Override",
    "```",
    "// RICHTIG: Override auf oberster Ebene",
    "<@ components/page.php @>",
    "<@~ snippet nested ~@>Neu Inhalt<@~ end ~@>",
    "",
    "// FALSCH: Nested Override",
    "<@ components/page.php @>",
    "<@~ snippet outer ~@>",
    "    <@~ snippet nested ~@>Fehler!<@~ end ~@>",
    "<@~ end ~@>",
    "```",
    "",
    "### Minimal Theme mit Component-Based",
    "```",
    "// default.php",
    "<@ components/page.php @>",
    "",
    "// components/page.php",
    "<!DOCTYPE html>",
    "<html lang=\"@{ :lang | def('de') }\">",
    "<head>",
    "    <link href=\"/packages/@{ theme }/dist/main.css\" rel=\"stylesheet\">",
    "</head>",
    "<body>",
    "    <main>",
    "        @{ +main }",
    "    </main>",
    "</body>",
    "</html>",
    "```",
    "",
    "---\n",
  ];
}

function getDebugSection(): string[] {
  return [
    "## 🔍 Debugging\n",
    "",
    "### 1. Cache leeren nach Änderungen",
    "```",
    "rm -rf automad/cache/*",
    "// Oder im Browser: Dashboard > Einstellungen > Cache leeren",
    "```",
    "",
    "### 2. Aktives Theme prüfen",
    "```json",
    "// In der Seiten-Data:",
    '{ "theme": "hangdrang/automad-theme-hangdrang" }',
    "```",
    "",
    "### 3. Theme.json wird nicht neu geladen?",
    "- Server neu starten",
    "- Browser-Cache leeren (Ctrl+Shift+R)",
    "- Automad-Cache: `cache/` Verzeichnis leeren",
    "",
    "### 4. Template wird nicht gefunden?",
    "```",
    "// Prüfe:",
    "1. Template-Datei existiert im Theme-Ordner",
    "2. Template ist in theme.json definiert (oder Standard-Template)",
    "3. Seite nutzt das richtige Template",
    "```",
    "",
    "### 5. `<@` wird nicht interpretiert?",
    "```",
    "// Prüfe php.ini:",
    "short_open_tag = On",
    "",
    "// Oder .user.ini im Automad-Root:",
    "short_open_tag = On",
    "```",
    "",
    "### 6. Syntax im Vergleich",
    "```",
    '<@ components/nav.php @>     // Statement: Component laden',
    "@{ title }                  // Variable: Feld-Wert ausgeben",
    "@{ +main }                  // Block: Block-Editor Inhalt",
    "@{ :lang }                  // Runtime: System-Variable",
    "@{ title | markdown }        // Pipe: Wert filtern",
    "",
    "// Statements (mit <@ @>):",
    "<@ if @{ x } @>...<@ end @>",
    "<@ foreach @{ items } as $i @>...<@ end @>",
    "<@ set { :var: 'val' } @>",
    "",
    "// Block-Variablen (KEIN <@ @>):",
    "@{ +main }",
    "@{ +hero }",
    "```",
    "",
    "### 7. Minimal funktionierendes Theme",
    "```json",
    "// theme.json",
    "{",
    '    "name": "Minimal Theme",',
    '    "masks": { "shared": ["+main"] },',
    '    "tooltips": { "+main": "Content" }',
    "}",
    "```",
    "```php",
    "// default.php",
    "<@ components/page.php @>",
    "```",
    "```php",
    "// components/page.php",
    "<!DOCTYPE html>",
    "<html>",
    "<body>@{ +main }</body>",
    "</html>",
    "```",
    "",
    "---\n",
    "",
    "**Tipp:** Nutze `get_snippets` für wiederverwendbare Code-Snippets!\n",
  ];
}
