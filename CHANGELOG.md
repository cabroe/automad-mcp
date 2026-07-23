# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-07-23

### Added

- **21 MCP Tools** for Automad CMS theme development
- **Documentation Tools**: list_pages, search_docs, get_page
- **Theme Starter Kit**: list_starter_kit_files, get_starter_kit_file, get_block_template
- **Theme Development**: generate_theme, validate_theme, compare_themes, analyze_fields
- **Template Helpers**: get_template_syntax, get_snippets, get_context_patterns, get_block_layouts, get_block_templates
- **i18n**: generate_i18n with per-tree/per-field/mixed patterns
- **Testing**: get_docker_help, live_preview, get_theme_doc
- **Cache**: get_cache_stats, clear_cache, clear_all_caches

### Documentation

- Comprehensive README.md with all tool descriptions
- Usage examples for each tool category
- ESLint + Prettier configuration
- GitHub Actions CI/CD workflows

### Infrastructure

- TypeScript with strict mode
- 236+ tests with Vitest
- Fetch caching with TTL
- Retry logic for network failures
