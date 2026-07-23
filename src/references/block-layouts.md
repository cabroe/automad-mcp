# Automad Block Layouts Reference

Automad's block editor lets editors compose page content from blocks (text, image, code, etc.) arranged into flexible layouts. Themes define **block areas** where content goes and may **override built-in block templates** via a `blocks/` directory.

Official sources:
- https://automad.org/developer-guide/building-themes/block-layouts
- https://automad.org/developer-guide/building-themes/customizing-blocks
- https://automad.org/user-guide/using-blocks

## Block areas

A block area is a theme field whose name starts with `+`. It becomes an editable region in the dashboard's block editor.

### Output a block area

Echo it like any variable:

```
@{ +main }
```

To wrap the content in markup only when the area has content, pipe through `replace` with an anchored regex — the canonical pattern from the standard theme:

```
@{ +hero | replace ('/^(.+)$/is', '<section class="hero">$1</section>') }
```

- `^(.+)$` matches any non-empty block content.
- `$1` substitutes the content inside your wrapper.
- An empty block area renders nothing (the regex won't match).

### Conventional areas

| Area | Typical use |
|------|-------------|
| `+main` | Primary page content (the default block area) |
| `+hero` | Top hero/teaser section |

### Registering areas in theme.json

Block areas need entries in `theme.json` so the dashboard labels/tooltips them, alongside normal fields:

```json
{
  "tooltips": {
    "+hero": "The hero section",
    "+main": "The main content block area"
  }
}
```

### Making an area shared (global, edited once)

To edit a block area once and show it on every page, list it under `masks.shared`. It disappears from per-page settings and is edited in the global/shared settings:

```json
{
  "masks": {
    "shared": ["+hero", "+main"]
  }
}
```

Use carefully — `+main` shared means one content block for the whole site. Usually `+main` stays per-page; only secondary areas (a global footer) are shared.

## Layout primitives — sections and columns

The block editor provides layout blocks editors compose in the dashboard:

- **Sections** — full-width layout containers. Create distinct horizontal bands (hero, features, footer band). Sections have their own background/padding settings.
- **Columns** — split a row into multiple columns. Blocks dropped into each column flow independently.

Editors compose these in the dashboard; the theme's job is to render the resulting HTML/CSS. Automad outputs layout as nested custom elements and classes the theme can target.

### Styling block layouts

The theme controls layout appearance through CSS. Verified patterns from the standard theme:

- The `.am-block` class wraps individual blocks — target it for spacing/typography.
- Sections render as `<am-section>` elements; columns as `<am-flex>` with `<am-1-2>` children — target these for grid/flex layout.
- Buttons render as `<am-buttons>` with `.am-button` links.
- The standard theme ships a complete LESS source set (`less/block.less`, `less/grid.less`, `less/hero.less`, etc.) — worth studying as a reference for styling all block types.

When building from scratch, include base styles for `.am-block` and the common block wrappers so editor-composed layouts render predictably.

## Overriding built-in block templates — the blocks/ directory

The rendered block templates are **fully customizable**. A theme can override Automad's built-in block templates by placing modified versions in a `blocks/` directory within the theme:

```
my-theme/
└── blocks/
    └── pagelist/           # overrides the pagelist block rendering
        ├── blog.php
        ├── blog_alt.php
        ├── portfolio.php
        └── simple.php
```

Each file under `blocks/<block-type>/` corresponds to a built-in block type. To override, copy the original template from Automad's core into your theme's `blocks/` dir and modify it.

Include a custom block template from a page template:

```
<@ if @{ checkboxUseAlternativePagelistLayout } @>
  <@ blocks/pagelist/blog_alt.php @>
<@ else @>
  <@ blocks/pagelist/blog.php @>
<@ end @>
```

Overriding is optional — if your theme only needs standard block rendering and CSS styling, you don't need a `blocks/` directory. Add one when you want to control how a specific block type (especially pagelists) renders.

## Practical template with block areas

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>@{ :title }</title>
  <link rel="stylesheet" href="/packages/acme/my-theme/dist/style.css">
</head>
<body>
  <@ elements/navbar.php @>

  @{ +hero | replace ('/^(.+)$/is', '<section class="hero">$1</section>') }

  <main class="content">
    @{ +main }
  </main>

  <footer class="site-footer">
    @{ textFooter }
  </footer>
</body>
</html>
```

## Checking your block setup

1. **Area shows nothing on the page** — confirm you echoed `@{ +area }`, and that the area has content in the dashboard.
2. **Area isn't editable in the dashboard** — the field name must start with `+`, and not be masked out (`masks.page` / `masks.shared`) when you expected per-page editing.
3. **Layout (sections/columns) looks unstyled** — your CSS isn't targeting `.am-block`, `<am-section>`, or `<am-flex>`. Inspect the rendered HTML for the right selectors.
4. **Wrapper markup appears even when empty** — your `replace` regex isn't anchored. Use `/^(.+)$/is` so it only matches non-empty content.
5. **Want to change how a block type renders** — add a `blocks/<type>/` directory to your theme and copy/modify the core template.
