import { z } from 'zod';

export const dashboardGeneratorInputSchema = z.object({
  type: z
    .enum(['block-layout', 'pagelist-block', 'columns-block', 'section-block'])
    .describe('Block type'),
  name: z.string().optional().describe('Custom name for the block'),
});

export type DashboardGeneratorInput = z.infer<typeof dashboardGeneratorInputSchema>;

/**
 * Generate block layout templates for the dashboard
 */
export function generateDashboardTemplate(input: DashboardGeneratorInput): string {
  const { type } = input;

  switch (type) {
    case 'block-layout':
      return generateBlockLayout();
    case 'pagelist-block':
      return generatePagelistBlock();
    case 'columns-block':
      return generateColumnsBlock();
    case 'section-block':
      return generateSectionBlock();
    default:
      return 'Unknown block type';
  }
}

function generateBlockLayout(): string {
  return `\`\`\`json
{
  "blocks": {
    "header": {
      "type": "section",
      "label": "Header",
      "icon": "heading",
      "maxItems": 1,
      "allowedBlocks": ["text"]
    },
    "content": {
      "type": "columns",
      "label": "Content",
      "icon": "columns",
      "allowedBlocks": ["text", "image", "video"]
    },
    "footer": {
      "type": "section",
      "label": "Footer",
      "icon": "minus",
      "maxItems": 1,
      "allowedBlocks": ["text"]
    }
  }
}
\`\`\`

Add to \`theme.json\` under \`blockLayouts\`.`;
}

function generatePagelistBlock(): string {
  return `\`\`\`html
<@ newPagelist {
  type: 'children',
  sort: 'date desc',
  limit: 10
} @>

<div class="pagelist">
  <@ foreach in pagelist @>
    <article class="pagelist__item">
      <@ if @{ :thumbnail } @>
        <img src="@{ :thumbnail | resize:800 }" alt="@{ :title }">
      <@ end @>
      <h2><a href="@{ :url }">@{ :title }</a></h2>
      <time datetime="@{ :date }">@{ :date | dateFormat('d.m.Y') }</time>
      <p>@{ :teaser | shorten(200) }</p>
    </article>
  <@ end @>
</div>
\`\`\`

Block layout config:
\`\`\`json
{
  "type": "pagelist",
  "label": "Article List",
  "icon": "list",
  "fields": {
    "type": {
      "type": "select",
      "label": "List Type",
      "options": {
        "children": "Child Pages",
        "tags": "By Tag",
        "search": "Search Results"
      }
    },
    "limit": {
      "type": "number",
      "label": "Max Items"
    }
  }
}
\`\`\``;
}

function generateColumnsBlock(): string {
  return `\`\`\`html
<div class="columns columns--@{ columns | def('2') }">
  <@ foreach in columns @>
    <div class="columns__item">
      @{ +content }
    </div>
  <@ end @>
</div>

<style>
.columns {
  display: grid;
  grid-template-columns: repeat(@{ columns | def('2') }, 1fr);
  gap: 2rem;
}
.columns--3 { grid-template-columns: repeat(3, 1fr); }
.columns--4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .columns { grid-template-columns: 1fr; }
}
</style>
\`\`\`

Block layout config:
\`\`\`json
{
  "type": "columns",
  "label": "Columns",
  "icon": "columns",
  "fields": {
    "columns": {
      "type": "select",
      "label": "Number of Columns",
      "options": {
        "2": "Two Columns",
        "3": "Three Columns",
        "4": "Four Columns"
      }
    },
    "gap": {
      "type": "number",
      "label": "Gap (rem)"
    }
  }
}
\`\`\``;
}

function generateSectionBlock(): string {
  return `\`\`\`html
<section class="section section--@{ background | def('default') }">
  <div class="section__inner">
    @{ +content }
  </div>
</section>

<style>
.section {
  padding: 4rem 0;
}
.section--dark {
  background: #1a1a1a;
  color: #fff;
}
.section--light {
  background: #f5f5f5;
}
.section__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
\`\`\`

Block layout config:
\`\`\`json
{
  "type": "section",
  "label": "Section",
  "icon": "minus",
  "fields": {
    "background": {
      "type": "select",
      "label": "Background",
      "options": {
        "default": "Default",
        "dark": "Dark",
        "light": "Light",
        "accent": "Accent Color"
      }
    },
    "padding": {
      "type": "select",
      "label": "Padding",
      "options": {
        "normal": "Normal",
        "large": "Large",
        "none": "None"
      }
    }
  }
}
\`\`\``;
}
