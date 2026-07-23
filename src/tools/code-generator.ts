import { z } from 'zod';

export const codeGeneratorInputSchema = z.object({
  type: z.enum(['nav', 'pagelist', 'form']).describe('Code type to generate'),
  style: z.enum(['simple', 'dropdown', 'tree', 'tabs', 'cards', 'masonry']).optional().default('simple').describe('Style variant'),
  options: z.string().optional().describe('Additional options (JSON)'),
});

export type CodeGeneratorInput = z.infer<typeof codeGeneratorInputSchema>;

/**
 * Generate common Automad template code
 */
export function generateCode(input: CodeGeneratorInput): string {
  const { type, style } = input;

  switch (type) {
    case 'nav':
      return generateNav(style || 'simple');
    case 'pagelist':
      return generatePagelist(style || 'simple');
    case 'form':
      return generateForm(style || 'simple');
    default:
      return 'Unknown code type';
  }
}

function generateNav(style: string): string {
  const simple = `<nav class="main-nav">
    <@ newPagelist { type: 'children' } @>
    <@ foreach in pagelist @>
        <a href="@{ :url }" <@ if @{ :current } @>class="active"<@ end @>>@{ :title }</a>
    <@ end @>
</nav>`;

  const dropdown = `<nav class="dropdown-nav">
    <@ newPagelist { type: 'children' } @>
    <@ foreach in pagelist @>
        <div class="dropdown">
            <a href="@{ :url }">@{ :title }</a>
            <@ if @{ :currentPath } @>
                <@ newPagelist { type: 'children' } @>
                <div class="dropdown-content">
                    <@ foreach in pagelist @>
                        <a href="@{ :url }">@{ :title }</a>
                    <@ end @>
                </div>
            <@ end @>
        </div>
    <@ end @>
</nav>`;

  const tree = `<nav class="tree-nav">
    <@ snippet tree @>
        <ul>
            <@ foreach in pagelist @>
                <li<@ if @{ :current } @> class="active"<@ end @>>
                    <a href="@{ :url }">@{ :title }</a>
                    <@ if @{ :currentPath } @>
                        <@ tree @>
                    <@ end @>
                </li>
            <@ end @>
        </ul>
    <@ end @>
    <@ newPagelist { type: 'children' } @>
    <@ tree @>
</nav>`;

  const tabs = `<nav class="tab-nav">
    <@ newPagelist { type: 'children' } @>
    <@ foreach in pagelist @>
        <a href="@{ :url }" class="tab<@ if @{ :current } @> active<@ end @>">
            @{ :title }
        </a>
    <@ end @>
</nav>`;

  const templates: Record<string, { code: string; css: string }> = {
    simple: { code: simple, css: '' },
    dropdown: { code: dropdown, css: getDropdownCSS() },
    tree: { code: tree, css: getTreeCSS() },
    tabs: { code: tabs, css: '' },
  };

  const t = templates[style] || templates.simple;
  let output = '```html\n' + t.code + '\n```';
  if (t.css) {
    output += '\n\n### CSS\n```css\n' + t.css + '\n```';
  }
  return output;
}

function generatePagelist(style: string): string {
  const simple = `<section class="pagelist">
    <@ newPagelist { type: 'children', sort: 'date desc' } @>
    <@ foreach in pagelist @>
        <article class="item">
            <h3><a href="@{ :url }">@{ :title }</a></h3>
            <p>@{ :date | dateFormat('d.m.Y') }</p>
            <p>@{ :teaser | shorten(150) }</p>
        </article>
    <@ end @>
</section>`;

  const cards = `<section class="card-grid">
    <@ newPagelist { type: 'children' } @>
    <@ foreach in pagelist @>
        <article class="card">
            @{ :thumbnail | resize:400 | crop:300:200 }
            <h3><a href="@{ :url }">@{ :title }</a></h3>
            <p>@{ :teaser | shorten(100) }</p>
        </article>
    <@ end @>
</section>`;

  const masonry = `<section class="masonry">
    <@ newPagelist { type: 'children' } @>
    <@ foreach in pagelist @>
        <div class="masonry-item">
            <img src="@{ :thumbnail | resize:600 }" alt="@{ :title }">
            <h4><a href="@{ :url }">@{ :title }</a></h4>
        </div>
    <@ end @>
</section>`;

  const templates: Record<string, string> = {
    simple,
    cards,
    masonry,
  };

  const code = templates[style] || simple;
  return '```html\n' + code + '\n```';
}

function generateForm(_style: string): string {
  return '```html\n<form method="POST" action="@{ formAction | def(\'/api/contact\') }">\n    <div class="form-group">\n        <label for="name">Name</label>\n        <input type="text" id="name" name="name" required>\n    </div>\n    \n    <div class="form-group">\n        <label for="email">Email</label>\n        <input type="email" id="email" name="email" required>\n    </div>\n    \n    <div class="form-group">\n        <label for="message">Message</label>\n        <textarea id="message" name="message" rows="5" required></textarea>\n    </div>\n    \n    <button type="submit">Send</button>\n</form>\n```';
}

function getDropdownCSS(): string {
  return `.dropdown { position: relative; }
.dropdown-content {
    display: none;
    position: absolute;
    background: white;
    min-width: 200px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.dropdown:hover .dropdown-content { display: block; }`;
}

function getTreeCSS(): string {
  return `.tree-nav ul { list-style: none; padding-left: 1rem; }
.tree-nav li { margin: 0.5rem 0; }
.tree-nav li.active > a { font-weight: bold; }`;
}
