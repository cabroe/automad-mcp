import { z } from "zod";

export const contextPatternsInputSchema = z.object({
  type: z.enum(["all", "set", "with", "foreach", "recursive"]).optional().default("all").describe("Context pattern type"),
});

export type ContextPatternsInput = z.infer<typeof contextPatternsInputSchema>;

/**
 * Get Automad context manipulation patterns
 */
export function getContextPatterns(input: ContextPatternsInput): string {
  const type = input.type || "all";

  switch (type) {
    case "set":
      return formatSet();
    case "with":
      return formatWith();
    case "foreach":
      return formatForeach();
    case "recursive":
      return formatRecursive();
    default:
      return formatAll();
  }
}

function formatAll(): string {
  return [
    formatSet(),
    "",
    formatWith(),
    "",
    formatForeach(),
    "",
    formatRecursive(),
  ].join("\n---\n\n");
}

function formatSet(): string {
  const code = "<@ set { } @>";
  const codeBlock = "<@ set { :classArticle: 'card', :showFooter: true } @>";
  const codeFilter = "<@ set { filter: '{\"checkboxShowInNavbar\":\"/[^0]+/\"}', sort: 'date desc' } @>";
  const codeClasses = "<@ set { :classes: 'cards masonry' } @>";
  const codeStrip = "<@~ set { :count: 6 } ~@>";
  
  return `## Context setzen mit \`${code}\`

\`set\` mutiert den aktuellen Context für alles Folgende.

### Basis-Syntax

\`\`\`html
${codeBlock}
\`\`\`

### Anwendungsbeispiele

**Pagelist konfigurieren (Standard-Theme Pattern):**

\`\`\`html
${codeFilter}
<@ newPagelist @>
<@ foreach in pagelist @>
  ...
<@ end @>
\`\`\`

**Klassen für Template-Varianten:**

\`\`\`html
${codeClasses}
<@ blocks/pagelist/blog.php @>
\`\`\`

**Whitespace stripping mit ~:**

\`\`\`html
${codeStrip}
\`\`\`

Entfernt Umgebungs-Whitespace für sauberes HTML.`;
}

function formatWith(): string {
  const code = "<@ with @>";
  const codePage = "<@ with '/kontakt' @>\n  <h2>@{ :title }</h2>\n<@ end @>";
  const codeImage = "<@ with @{ imageLogo } @>\n  <img src=\"@{ imageLogo }\" alt=\"@{ :basename }\">\n<@ end @>";
  
  return `## Kontext wechseln mit \`${code}\`

\`with\` wechselt den Context zu einer anderen Seite oder einem Objekt.

### Seite referenzieren

\`\`\`html
${codePage}
\`\`\`

### Image-Kontext

\`\`\`html
${codeImage}
\`\`\`

### Image mit Resizing

\`\`\`html
<@ with @{ imageLogo } @>
  <img src="<@ with @{ :file } { height: @{ logoHeight | def(40) } } @>@{ :fileResized }<@ end @>"
       alt="@{ :basename }">
<@ end @>
\`\`\`

**Wichtig:** :file, :fileResized, :basename existieren **nur** innerhalb eines \`with :file { }\` Blocks!`;
}

function formatForeach(): string {
  const code = "<@ foreach in @>";
  const codeLoop = "<@ foreach in pagelist @>\n  <article>\n    <h3>@{ :title }</h3>\n    <a href=\"@{ :url }\">Weiterlesen</a>\n  </article>\n<@ end @>";
  const codeActive = "<@ foreach in pagelist @>\n  <li<@ if @{ :current } @> class=\"active\"<@ end @>>\n    <a href=\"@{ :url }\">@{ :title }</a>\n  </li>\n<@ end @>";
  
  return `## Schleifen mit \`${code}\`

\`foreach\` iteriert über Objekte (pagelist, filelist, nav, breadcrumb).

### Basis-Syntax

\`\`\`html
${codeLoop}
\`\`\`

### Loop-Variablen (OHNE \`:\` Prefix!)

Innerhalb von \`foreach\` sind die Variablen **ohne Doppelpunkt**:

| Variable | Bedeutung |
|----------|-----------|
| \`@{ :title }\` | Titel der aktuellen Seite |
| \`@{ :url }\` | URL der aktuellen Seite |
| \`@{ :date }\` | Erstelldatum |
| \`@{ :teaser }\` | Teaser-Text |
| \`@{ :current }\` | Ist die aktuell angeforderte Seite? |
| \`@{ :currentPath }\` | Liegt auf dem Pfad zur aktuellen Seite? |

### Aktive Seite hervorheben

\`\`\`html
${codeActive}
\`\`\``;
}

function formatRecursive(): string {
  const snippet = "<@ snippet tree @>";
  const treeCode = `<@ snippet tree @>
  <ul>
    <@ foreach in pagelist @>
      <li<@ if @{ :current } @> class="active"<@ end @>>
        <a href="@{ :url }">@{ :title }</a>
        <@ if @{ :currentPath } @>
          <@ tree @>  <!-- Rekursiver Aufruf! -->
        <@ end @>
      </li>
    <@ end @>
  </ul>
<@ end @>`;
  const useCode = `<nav>
  <@ newPagelist { type: 'children' } @>
  <@ tree @>
</nav>`;
  
  return `## Rekursive Snippets (Navigation)

Ein Snippet kann sich selbst aufrufen - für verschachtelte Menüs.

### Rekursives Nav-Snippet

\`\`\`html
${treeCode}
\`\`\`

### Verwendung

\`\`\`html
${useCode}
\`\`\`

### :current vs :currentPath

| Variable | Bedeutung |
|----------|-----------|
| \`:current\` | "Diese Seite **ist** die aktuelle Seite" |
| \`:currentPath\` | "Diese Seite liegt **auf dem Weg** zur aktuellen Seite" |

\`currentPath\` hält den Baum zum aktiven Punkt offen - zeigt auch
Untermenüs auf dem gesamten Pfad zur aktuellen Seite.`;
}

// Export for testing
export const contextTypes = ["all", "set", "with", "foreach", "recursive"];
