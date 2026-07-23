import { z } from 'zod';

export const blockLayoutsInputSchema = z.object({
  type: z
    .enum(['all', 'hero', 'gallery', 'faq', 'team', 'pricing', 'testimonials', 'cta'])
    .optional()
    .default('all')
    .describe('Filter by layout type'),
});

export type BlockLayoutsInput = z.infer<typeof blockLayoutsInputSchema>;

interface BlockLayout {
  name: string;
  type: string;
  description: string;
  templates: Record<string, string>;
  css?: string;
  usage: string;
}

const BLOCK_LAYOUTS: BlockLayout[] = [
  {
    name: 'Hero Section',
    type: 'hero',
    description: 'Full-width hero with title, subtitle, and CTA button',
    templates: {
      block: `<div class="hero-section">
    <h1 class="hero-title">@{+title}@></h1>
    <p class="hero-subtitle">@{+subtitle}@></p>
    <div class="hero-cta">@{+cta}@></div>
</div>`,
      css: `.hero-section {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 4rem 2rem;
}
.hero-title { font-size: 3rem; margin-bottom: 1rem; }
.hero-subtitle { font-size: 1.25rem; max-width: 600px; margin-bottom: 2rem; }
.hero-cta { display: flex; gap: 1rem; }`,
    },
    usage: 'Use for landing pages, product showcases, or feature introductions.',
  },
  {
    name: 'Image Gallery',
    type: 'gallery',
    description: 'Responsive grid of images with lightbox support',
    templates: {
      block: `<div class="gallery-grid">
    <@ foreach @{ :filelist } as $image @>
    <div class="gallery-item">
        <@ img { src: $image->get('url'), width: 400 } @>
    </div>
    <@ end @>
</div>`,
      css: `.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}
.gallery-item img {
    width: 100%;
    height: auto;
    border-radius: 8px;
}`,
    },
    usage: 'Combine with filelist block to upload images.',
  },
  {
    name: 'FAQ Accordion',
    type: 'faq',
    description: 'Expandable question/answer pairs',
    templates: {
      block: `<div class="faq-container">
    <@ foreach @{ items } as $item @>
    <details class="faq-item">
        <summary>@{ $item->get('question') }@></summary>
        <div class="faq-answer">@{ $item->get('answer') | markdown }@></div>
    </details>
    <@ end @>
</div>`,
      css: `.faq-container { max-width: 800px; margin: 0 auto; }
.faq-item {
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 0;
}
.faq-item summary {
    cursor: pointer;
    font-weight: 600;
    list-style: none;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-answer { margin-top: 1rem; color: #666; }`,
    },
    usage: 'Create FAQ pages or help sections.',
  },
  {
    name: 'Team Grid',
    type: 'team',
    description: 'Grid of team member cards with photo and bio',
    templates: {
      block: `<div class="team-grid">
    <@ foreach @{ members } as $member @>
    <div class="team-card">
        <@ img { src: @$member->get('photo'), width: 300, class: 'team-photo' } @>
        <h3>@{ $member->get('name') }@></h3>
        <p class="team-role">@{ $member->get('role') }@></p>
        <div class="team-bio">@{ $member->get('bio') | markdown }@></div>
    </div>
    <@ end @>
</div>`,
      css: `.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}
.team-card {
    text-align: center;
    padding: 2rem;
    border-radius: 8px;
    background: var(--color-bg);
}
.team-photo {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
}
.team-role { color: #666; margin-bottom: 1rem; }`,
    },
    usage: 'About pages or company presentations.',
  },
  {
    name: 'Pricing Table',
    type: 'pricing',
    description: 'Comparison table for pricing tiers',
    templates: {
      block: `<div class="pricing-grid">
    <@ foreach @{ plans } as $plan @>
    <div class="pricing-card @{ $plan->get('featured') ? 'featured' : '' }">
        <h3>@{ $plan->get('name') }@></h3>
        <div class="price">@{ $plan->get('price') }@></div>
        <ul class="features">@{ $plan->get('features') }@></ul>
        <a href="@{ $plan->get('ctaUrl') }" class="btn">@{ $plan->get('cta') }@></a>
    </div>
    <@ end @>
</div>`,
      css: `.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    align-items: start;
}
.pricing-card {
    padding: 2rem;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    text-align: center;
}
.pricing-card.featured {
    border-color: var(--color-accent, #3b82f6);
    transform: scale(1.05);
}
.price { font-size: 2.5rem; font-weight: bold; margin: 1rem 0; }
.features { list-style: none; padding: 0; margin: 1.5rem 0; }
.features li { padding: 0.5rem 0; border-bottom: 1px solid var(--color-border); }`,
    },
    usage: 'SaaS, subscription services, or product pricing pages.',
  },
  {
    name: 'Testimonials Slider',
    type: 'testimonials',
    description: 'Customer testimonials with quotes and attribution',
    templates: {
      block: `<div class="testimonials">
    <@ foreach @{ testimonials } as $t @>
    <blockquote class="testimonial">
        <p>"@{ $t->get('quote') }"</p>
        <footer>
            <@ img { src: @$t->get('avatar'), width: 60, class: 'avatar' } @>
            <cite>
                <strong>@{ $t->get('name') }</strong>
                <span>@{ $t->get('role') }</span>
            </cite>
        </footer>
    </blockquote>
    <@ end @>
</div>`,
      css: `.testimonials {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}
.testimonial {
    padding: 2rem;
    background: var(--color-bg);
    border-radius: 8px;
    border-left: 4px solid var(--color-accent, #3b82f6);
}
.testimonial p { font-size: 1.1rem; font-style: italic; }
.testimonial footer {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}
.avatar { border-radius: 50%; }
.testimonial cite { display: flex; flex-direction: column; }
.testimonial cite span { font-size: 0.875rem; color: #666; }`,
    },
    usage: 'Social proof sections on landing pages.',
  },
  {
    name: 'Call to Action Banner',
    type: 'cta',
    description: 'Full-width CTA with background and button',
    templates: {
      block: `<section class="cta-banner">
    <div class="cta-content">
        <h2>@{+cta_headline}@></h2>
        <p>@{+cta_text}@></p>
        <a href="@{+cta_url}" class="cta-button">@{+cta_button}@></a>
    </div>
</section>`,
      css: `.cta-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 2rem;
    text-align: center;
}
.cta-content { max-width: 600px; margin: 0 auto; }
.cta-banner h2 { font-size: 2rem; margin-bottom: 1rem; }
.cta-button {
    display: inline-block;
    padding: 1rem 2rem;
    background: white;
    color: #333;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 1.5rem;
}`,
    },
    usage: 'Newsletter signups, product launches, or conversion sections.',
  },
  {
    name: 'Feature Grid',
    type: 'hero',
    description: 'Grid of features with icons and descriptions',
    templates: {
      block: `<div class="features-grid">
    <@ foreach @{ features } as $feature @>
    <div class="feature">
        <div class="feature-icon">@{ $feature->get('icon') }@></div>
        <h3>@{ $feature->get('title') }@></h3>
        <p>@{ $feature->get('description') | markdown }@></p>
    </div>
    <@ end @>
</div>`,
      css: `.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 4rem 2rem;
}
.feature { text-align: center; }
.feature-icon { font-size: 3rem; margin-bottom: 1rem; }
.feature h3 { margin-bottom: 0.5rem; }`,
    },
    usage: 'Product feature overviews or service descriptions.',
  },
];

/**
 * Get block layout templates
 */
export function getBlockLayouts(input: BlockLayoutsInput): string {
  const { type } = input;

  let filtered = BLOCK_LAYOUTS;

  if (type !== 'all') {
    filtered = filtered.filter(l => l.type === type);
  }

  if (filtered.length === 0) {
    return `No layouts found for type "${type}".\n\nAvailable types: hero, gallery, faq, team, pricing, testimonials, cta`;
  }

  const lines: string[] = [
    `## Block Layout Templates (${filtered.length} found)\n`,
    'Types: hero, gallery, faq, team, pricing, testimonials, cta\n',
  ];

  for (const layout of filtered) {
    lines.push(`---\n\n### ${layout.name}`);
    lines.push(`_${layout.description}_`);
    lines.push(`\n**Type:** \`${layout.type}\``);
    lines.push(`\n**Usage:** ${layout.usage}\n`);

    lines.push('**Template:**\n```html');
    lines.push(layout.templates.block);
    lines.push('```');

    if (layout.templates.css) {
      lines.push('\n**CSS:**\n```css');
      lines.push(layout.templates.css);
      lines.push('```');
    }

    // Show block fields
    const blockFields = layout.templates.block.match(/@\{\+(\w+)\}/g) || [];
    if (blockFields.length > 0) {
      const fields = [...new Set(blockFields.map((f: string) => f.replace(/@\{\+|\}/g, '')))];
      lines.push(`\n**Block Fields:** ${fields.map((f: string) => `\`+${f}\``).join(', ')}`);
    }
  }

  lines.push(
    "\n---\n\n_Combine these layouts with the block editor's section and stretch features for best results._"
  );

  return lines.join('\n');
}

/**
 * Get available layout types
 */
export function getLayoutTypes(): string[] {
  return [...new Set(BLOCK_LAYOUTS.map(l => l.type))];
}
