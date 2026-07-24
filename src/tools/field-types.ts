import { z } from 'zod';
import { BASE_URL } from '../utils/pages.js';

export const fieldTypesInputSchema = z.object({
  type: z.enum(['all', 'widget', 'dashboard']).optional().default('all').describe('Filter by type'),
});

export type FieldTypesInput = z.infer<typeof fieldTypesInputSchema>;

const FIELD_TYPES = {
  // Text inputs
  text: { widget: 'Text', desc: 'Single line text input', dashboard: 'Text' },
  textarea: { widget: 'Textarea', desc: 'Multi-line text (auto Markdown)', dashboard: 'Text' },
  url: { widget: 'Link Dialog', desc: 'URL input with link picker', dashboard: 'Link Dialog' },
  email: {
    widget: 'Email Field',
    desc: 'Email input (same as text, no special widget)',
    dashboard: 'Text',
  },

  // Content blocks
  '+': { widget: 'Block Editor', desc: 'Block editor for rich content', dashboard: 'Block Editor' },

  // Selection
  select: { widget: 'Dropdown', desc: 'Dropdown selection', dashboard: 'Dropdown' },
  checkbox: { widget: 'Toggle', desc: 'On/off toggle switch', dashboard: 'Toggle' },
  radio: { widget: 'Radio', desc: 'Radio button group', dashboard: 'Radio' },

  // Media
  image: { widget: 'Image Picker', desc: 'Image selection with preview', dashboard: 'Image' },
  file: { widget: 'File Picker', desc: 'File selection', dashboard: 'File' },

  // Numbers
  number: { widget: 'Number Input', desc: 'Numeric value input', dashboard: 'Number' },

  // Date/Time
  date: { widget: 'Date/Time Picker', desc: 'Date and time selection', dashboard: 'Date/Time' },

  // Colors
  color: { widget: 'Color Picker', desc: 'Color selection with picker', dashboard: 'Color' },

  // Special
  hidden: { widget: 'Hidden', desc: 'Hidden field (not shown in UI)', dashboard: 'Hidden' },
};

/**
 * List all available Automad field types
 */
export function listFieldTypes(input: FieldTypesInput): string {
  const { type } = input;

  const lines: string[] = [
    '## Automad Field Types\n',
    `Source: ${BASE_URL}/developer-guide/building-themes/theme-json\n`,
    '---\n',
    '### Naming Convention\n',
    'Field type is determined by the **prefix** of the field name:\n',
    '| Prefix | Widget | Dashboard Tab |\n',
    '|--------|--------|---------------|\n',
    '| `+` | Block Editor | Inhalt |\n',
    '| `text*` | Markdown Editor | Inhalt |\n',
    '| `color*` | Color Picker | Anpassungen |\n',
    '| `checkbox*` | Toggle | Einstellungen |\n',
    '| `date*` | Date/Time | Einstellungen |\n',
    '| `image*` | Image Picker | Einstellungen |\n',
    '| `number*` | Number Input | Einstellungen |\n',
    '| `select*` | Dropdown | Einstellungen |\n',
    '| `url*` | Link Dialog | Einstellungen |\n',
    '| Other | Textarea | Einstellungen |\n',
    '',
  ];

  if (type === 'widget' || type === 'all') {
    lines.push('### Widget Reference\n');
    lines.push('| Prefix | Widget Type | Description |\n');
    lines.push('|--------|-------------|-------------|\n');

    for (const [prefix, info] of Object.entries(FIELD_TYPES)) {
      lines.push(`| \`${prefix}\` | ${info.widget} | ${info.desc} |`);
    }
  }

  if (type === 'dashboard' || type === 'all') {
    lines.push('\n### Dashboard Tab Assignment\n');
    lines.push('| Tab | Field Prefixes |\n');
    lines.push('|-----|----------------|\n');
    lines.push('| **Inhalt** | `+`, `text*` |\n');
    lines.push('| **Anpassungen** | `color*` |\n');
    lines.push('| **Einstellungen** | Everything else |\n');
  }

  lines.push('\n---\n');
  lines.push('### Examples\n');
  lines.push('```json\n');
  lines.push('{');
  lines.push('  "fieldOrder": [');
  lines.push('    "+main",           // Block editor');
  lines.push('    "textTitle",       // Text in Inhalt tab');
  lines.push('    "colorAccent",     // Color picker in Anpassungen tab');
  lines.push('    "selectTheme",      // Dropdown in Einstellungen tab');
  lines.push('    "imageBanner",      // Image picker');
  lines.push('    "numberCount"      // Number input');
  lines.push('  ]');
  lines.push('}\n```\n');

  return lines.join('\n');
}

// Export for testing
export const fieldTypePrefixes = Object.keys(FIELD_TYPES);
