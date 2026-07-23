export interface DocPage {
  title: string;
  url: string;
  parent: string;
  section: string;
}

export const BASE_URL = 'https://automad.org/version-2';

export const SECTIONS = ['version-2'] as const;
export type Section = (typeof SECTIONS)[number];

/**
 * Full index of all Automad v2 documentation pages.
 */
export const PAGES: DocPage[] = [
  { title: 'Version 2', url: '/', parent: '', section: 'version-2' },
  { title: 'Getting Started', url: '/getting-started', parent: 'Version 2', section: 'version-2' },
  {
    title: 'Local Installation',
    url: '/getting-started/local-installation',
    parent: 'Getting Started',
    section: 'version-2',
  },
  {
    title: 'System Requirements',
    url: '/getting-started/system-requirements',
    parent: 'Getting Started',
    section: 'version-2',
  },
  {
    title: 'Docker Installation',
    url: '/getting-started/docker-installation',
    parent: 'Getting Started',
    section: 'version-2',
  },
  {
    title: 'Installing Packages',
    url: '/getting-started/installing-packages',
    parent: 'Getting Started',
    section: 'version-2',
  },
  { title: 'Dashboard', url: '/dashboard', parent: 'Version 2', section: 'version-2' },
  {
    title: 'Creating Pages',
    url: '/dashboard/creating-pages',
    parent: 'Dashboard',
    section: 'version-2',
  },
  {
    title: 'Using Blocks',
    url: '/dashboard/using-blocks',
    parent: 'Dashboard',
    section: 'version-2',
  },
  {
    title: 'Page Settings',
    url: '/dashboard/page-settings',
    parent: 'Dashboard',
    section: 'version-2',
  },
  {
    title: 'Shared Data',
    url: '/dashboard/shared-data',
    parent: 'Dashboard',
    section: 'version-2',
  },
  {
    title: 'Packages',
    url: '/dashboard/packages',
    parent: 'Dashboard',
    section: 'version-2',
  },
  {
    title: 'Users & Roles',
    url: '/dashboard/users-and-roles',
    parent: 'Dashboard',
    section: 'version-2',
  },
  {
    title: 'System Settings',
    url: '/dashboard/system-settings',
    parent: 'Dashboard',
    section: 'version-2',
  },
  { title: 'Building Themes', url: '/building-themes', parent: 'Version 2', section: 'version-2' },
  {
    title: 'Theme Structure',
    url: '/building-themes/theme-structure',
    parent: 'Building Themes',
    section: 'version-2',
  },
  {
    title: 'theme.json',
    url: '/building-themes/theme-json',
    parent: 'Building Themes',
    section: 'version-2',
  },
  {
    title: 'Block Layouts',
    url: '/building-themes/block-layouts',
    parent: 'Building Themes',
    section: 'version-2',
  },
  {
    title: 'Customizing Blocks',
    url: '/building-themes/customizing-blocks',
    parent: 'Building Themes',
    section: 'version-2',
  },
  {
    title: 'Template Language',
    url: '/template-language',
    parent: 'Version 2',
    section: 'version-2',
  },
  {
    title: 'Variables',
    url: '/template-language/variables',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Reserved Variables',
    url: '/template-language/reserved-variables',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Runtime Variables',
    url: '/template-language/runtime-variables',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Control Structures',
    url: '/template-language/control-structures',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'for',
    url: '/template-language/control-structures/for',
    parent: 'Control Structures',
    section: 'version-2',
  },
  {
    title: 'foreach',
    url: '/template-language/control-structures/foreach',
    parent: 'Control Structures',
    section: 'version-2',
  },
  {
    title: 'if',
    url: '/template-language/control-structures/if',
    parent: 'Control Structures',
    section: 'version-2',
  },
  {
    title: 'with',
    url: '/template-language/control-structures/with',
    parent: 'Control Structures',
    section: 'version-2',
  },
  {
    title: 'set',
    url: '/template-language/control-structures/set',
    parent: 'Control Structures',
    section: 'version-2',
  },
  {
    title: 'Pipe',
    url: '/template-language/pipe',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'markdown',
    url: '/template-language/pipe/markdown',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'def',
    url: '/template-language/pipe/def',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'replace',
    url: '/template-language/pipe/replace',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'sanitize',
    url: '/template-language/pipe/sanitize',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'dateFormat',
    url: '/template-language/pipe/dateformat',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'stripTags',
    url: '/template-language/pipe/striptags',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'findFirstImage',
    url: '/template-language/pipe/findfirstimage',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'findFirstParagraph',
    url: '/template-language/pipe/findfirstparagraph',
    parent: 'Pipe',
    section: 'version-2',
  },
  {
    title: 'Objects',
    url: '/template-language/objects',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'pagelist',
    url: '/template-language/objects/pagelist',
    parent: 'Objects',
    section: 'version-2',
  },
  {
    title: 'filelist',
    url: '/template-language/objects/filelist',
    parent: 'Objects',
    section: 'version-2',
  },
  {
    title: 'tags',
    url: '/template-language/objects/tags',
    parent: 'Objects',
    section: 'version-2',
  },
  {
    title: 'breadcrumb',
    url: '/template-language/objects/breadcrumb',
    parent: 'Objects',
    section: 'version-2',
  },
  {
    title: 'Snippets',
    url: '/template-language/snippets',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Includes',
    url: '/template-language/includes',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Inheritance',
    url: '/template-language/inheritance',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Images',
    url: '/template-language/images',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Multilingual',
    url: '/template-language/multilingual',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'Helpers',
    url: '/template-language/helpers',
    parent: 'Template Language',
    section: 'version-2',
  },
  {
    title: 'nav',
    url: '/template-language/helpers/nav',
    parent: 'Helpers',
    section: 'version-2',
  },
  {
    title: 'img',
    url: '/template-language/helpers/img',
    parent: 'Helpers',
    section: 'version-2',
  },
  {
    title: 'redirect',
    url: '/template-language/helpers/redirect',
    parent: 'Helpers',
    section: 'version-2',
  },
  {
    title: 'Blocks Reference',
    url: '/blocks',
    parent: 'Version 2',
    section: 'version-2',
  },
  {
    title: 'Text Block',
    url: '/blocks/text',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Image Block',
    url: '/blocks/image',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Gallery Block',
    url: '/blocks/gallery',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Pagelist Block',
    url: '/blocks/pagelist',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Section Block',
    url: '/blocks/section',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Columns Block',
    url: '/blocks/columns',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Button Block',
    url: '/blocks/button',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Quote Block',
    url: '/blocks/quote',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Code Block',
    url: '/blocks/code',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Divider Block',
    url: '/blocks/divider',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Video Block',
    url: '/blocks/video',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'Embed Block',
    url: '/blocks/embed',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  {
    title: 'RSS Feed Block',
    url: '/blocks/rss-feed',
    parent: 'Blocks Reference',
    section: 'version-2',
  },
  { title: 'API Reference', url: '/api', parent: 'Version 2', section: 'version-2' },
  {
    title: 'PHP API',
    url: '/api/php',
    parent: 'API Reference',
    section: 'version-2',
  },
  {
    title: 'REST API',
    url: '/api/rest',
    parent: 'API Reference',
    section: 'version-2',
  },
  {
    title: 'Webhooks',
    url: '/api/webhooks',
    parent: 'API Reference',
    section: 'version-2',
  },
  {
    title: 'CLI Commands',
    url: '/cli',
    parent: 'Version 2',
    section: 'version-2',
  },
  {
    title: 'Headless Mode',
    url: '/headless',
    parent: 'Version 2',
    section: 'version-2',
  },
];
