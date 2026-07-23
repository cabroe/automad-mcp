import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['tsx', 'src/index.ts'],
});

const client = new Client({ name: 'test-runner', version: '1.0.0' });
await client.connect(transport);

// All tools with test arguments
const toolTests: { name: string; args: Record<string, unknown> }[] = [
  { name: 'health', args: {} },
  { name: 'get_cache_stats', args: {} },
  { name: 'get_automad_version', args: {} },
  { name: 'list_pages', args: {} },
  { name: 'list_pages', args: { section: 'getting-started' } },
  { name: 'search_docs', args: { query: 'template' } },
  { name: 'search_docs', args: { query: '' } },
  { name: 'get_page', args: { url: '/getting-started' } },
  { name: 'get_page', args: { url: '' } },
  { name: 'list_starter_kit_files', args: {} },
  { name: 'get_starter_kit_file', args: { path: 'theme.json' } },
  { name: 'get_starter_kit_file', args: {} },
  { name: 'get_theme_doc', args: {} },
  { name: 'get_snippets', args: {} },
  { name: 'get_snippets', args: { category: 'blocks' } },
  { name: 'get_template_syntax', args: {} },
  { name: 'get_template_syntax', args: { type: 'statements' } },
  { name: 'get_block_templates', args: {} },
  { name: 'get_block_template', args: { type: 'pagelist', variant: 'grid' } },
  { name: 'get_block_template', args: { type: '' } },
  { name: 'get_context_patterns', args: {} },
  { name: 'get_block_layouts', args: {} },
  { name: 'get_block_layouts', args: { type: 'hero' } },
  { name: 'validate_theme', args: {} },
  { name: 'analyze_fields', args: {} },
  { name: 'compare_themes', args: {} },
  { name: 'generate_i18n', args: {} },
  { name: 'live_preview', args: { action: 'status' } },
  { name: 'get_block_docs', args: {} },
  { name: 'get_block_docs', args: { type: 'pagelist' } },
  { name: 'get_api_docs', args: {} },
  { name: 'get_cli_docs', args: {} },
  { name: 'check_theme', args: {} },
  { name: 'generate_code', args: { type: 'nav' } },
  { name: 'generate_code', args: { type: 'pagelist', style: 'cards' } },
  { name: 'compare_theme_versions', args: {} },
  { name: 'pack_theme', args: {} },
  { name: 'analyze_theme', args: {} },
  { name: 'find_theme_issues', args: {} },
  { name: 'list_field_types', args: {} },
  { name: 'generate_dashboard_template', args: { type: 'block-layout' } },
  { name: 'check_i18n_consistency', args: {} },
  { name: 'validate_field_names', args: {} },
  { name: 'check_broken_links', args: {} },
  { name: 'clear_cache', args: { target: 'all' } },
];

let passed = 0;
let failed = 0;
const failures: string[] = [];

for (const test of toolTests) {
  const label = `${test.name}(${JSON.stringify(test.args)})`;
  try {
    const result = await client.callTool({ name: test.name, arguments: test.args });
    const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? '';
    const preview = text.slice(0, 120).replace(/\n/g, ' ');
    const isError = result.isError === true;
    if (isError) {
      console.log(`❌ ${label}`);
      console.log(`   ERROR: ${preview}`);
      failed++;
      failures.push(`${label}: ${preview}`);
    } else {
      console.log(`✅ ${label}`);
      console.log(`   → ${preview}...`);
      passed++;
    }
  } catch (err) {
    const msg = (err as Error).message.slice(0, 150);
    console.log(`💥 ${label}`);
    console.log(`   CRASH: ${msg}`);
    failed++;
    failures.push(`${label}: CRASH - ${msg}`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${toolTests.length} tests`);
if (failures.length > 0) {
  console.log(`\nFailures:`);
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
}

await client.close();
process.exit(failed > 0 ? 1 : 0);
