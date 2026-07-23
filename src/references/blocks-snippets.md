# Advanced Blocks, Snippets, and Context

The basics live in `template-syntax.md` and `block-layouts.md`. This reference covers the patterns that show up in real themes (the official `standard` theme, `revitron`, third-party hotel/restaurant themes) once you go past a single-template demo.

## Context manipulation — `<@ set { ... } @>`

`<@ set { key: value, key2: value2 } @>` mutates the current context for everything that follows, until the end of the current scope or until overridden. Most common use: setting presentation defaults (variables used by an included partial).

```html
<@ set {
  :classArticle: 'card card-large',
  :showFooter: true
} @>
```

Patterns from the wild:

- **`standard/templates/blocks/pagelist/blog.php`** opens with `<@ set { filter, sort, ... } @>` to configure the pagelist before iterating over `pagelist`. The set-merge semantics let templates compose pagelist config from per-block overrides.
- **`standard/templates/elements/navbar.php`** sets `:sidebarNav`, `:classNav`, `:classSearch` before rendering the navigation, so child templates can flip nav behavior with a single snippet override.
- **`standard/templates/blocks/pagelist/blog_alt.php`** uses the bare form `<@ set { :classes: 'cards cards-large masonry' } ~@>` to push a single class string into a parent context.

Whitespace-stripping (`~`) is useful when you're setting mid-paragraph.

## Statement-level toolbox functions

Beyond the variables and pipes in `template-syntax.md`, these statement functions are heavily used in real themes:

| Function | Common use | Example |
|----------|-----------|---------|
| `<@ pagelist { ... } @>` | Configure then iterate; matches dashboard-filtered list | `<@ pagelist { match: '{"checkboxShowInNavbar":"/[^0]+/"}' } @>` |
| `<@ newPagelist { ... } @>` | Build a fresh configured list (ignores current dashboard filter) | `<@~ newPagelist { excludeHidden: false, sort: 'date asc' } @>` then `<@~ foreach in pagelist ~@>` |
| `<@ set { ... } @>` | Mutate context variables | `<@ set { :pagelistDisplayCount: 6 } @>` |
| `<@ with prev @>` | Step into the previous sibling of the current pagelist item | Used in `prev_next.php` |
| `<@ with next @>` | Same, for the next sibling | |
| `<@ with @{ :file } { ... } @>` | Step into an image file context (`:file`, `:fileResized`, `:basename`) | `<@ with @{ :file } { height: 80 } @>@{ :fileResized }<@ end @>` |
| `<@ with @{ imageLogo } @>` | Step into the image picked by the `imageLogo` field | See `standard/templates/elements/navbar.php` |

**Pagelist filters** use a JSON `match` expression. Field values match against regexes; multiple fields combine with AND, multiple patterns within a field combine with OR:

```
match: '{ "checkboxShowInNavbar": "/[^0]+/" }'
```

The expression `"/[^0]+/"` means "not 0, not empty" — i.e. the checkbox is on. Negative: `"/[^0]+/"` against `0` fails; against any non-empty value passes.

## Image assets via `:with` context

Once you have an image field (`imageLogo`, `imageCard`, `imagesSlideshow`), Automad wraps the file as a context with extras:

- `:basename` — original filename
- `:fileResized` — resized version (when wrapped with height/width args)
- `:file` — original file reference

```
<@~ with @{ imageLogo } ~@>
  <img src="<@ with @{ :file } { height: @{ logoHeight | def(40) } } @>@{ :fileResized }<@ end @>"
       srcset="... @{ :file } { height: @{ logoHeight | def(40) | *2 } } @>@{ :fileResized } 2x ..."
       alt="@{ :basename }">
<@~ else ~@>
  @{ brand | def(@{ sitename }) }
<@~ end ~@>
```

`:file` and friends only exist inside a `:with @{ :file } @>` block. Outside, you can't reference them. `:with @{ imageLogo } @>` (the field itself) is a higher-level switch into a single-image context — useful when you don't need resizing.

**No resize variant?** Use the original directly: `<img src="@{ imageLogo }">`. Resize is for shrinking large uploaded images for the layout.

## Snippet mechanics (deep dive)

`template-syntax.md` covers the basics. Three subtleties that bite in production:

### 1. A child template cannot override what the base didn't render via `<@ name @>`

If the base layout contains `*just*` `@{ +main }` (no snippet), child templates have no hook to inject their layout. The base must wrap the rendering site in `<@ snippet main @>...<@ main @>`.

```
<# base: post.php #>
<@ snippet main @>
  <main class="post">
    @{ +main }
  </main>
<@ end @>
<@ main @>

<# child: blog.php #>
<@ post.php @>
<@ snippet main @>
  <main class="blog-list">
    @{ +main }
    <@ foreach in pagelist @> ... <@ end @>
  </main>
<@ end @>
```

### 2. Snippet inheritance across deep chains

`blog.php → post.php → default.php` works as long as each layer defines AND renders `main`. The chain of definitions vs renders: the *innermost* template with a snippet `main` overrides; the *innermost* template's `<@ main @>` call wins.

In practice, the standard pattern is: define `main` in the base (post.php), override in children (blog.php). Don't define `main` in default.php unless you want a default fallback for templates that extend default.php directly.

### 3. Recursive snippets

A snippet can call itself. This is the navigation-tree pattern:

```
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
```

`:currentPath` means "this page is on the path to the currently active page" — use it to render only the active branch. `:current` means "this page IS the currently active page" — use it for highlighting.

Per-item variables in `foreach`: `:url`, `:title`, `:date`, `:teaser`, etc. **No** leading `:` on the per-item system vars *unless* they collide — Automad is forgiving here; check the standard theme for canonical usage.

## Pagelist blocks (`blocks/pagelist/*.php`)

Automad's block editor offers a *pagelist* block (a built-in block that displays child pages). The actual render is fully theme-controlled: place a file under `blocks/pagelist/<variant>.php` and Automad loads it.

Conventions from the standard theme:

- `blog.php` — the default pagelist layout (grid of post cards)
- `blog_alt.php` — alternative layout (large cards, masonry)
- `portfolio.php` — projects layout
- `portfolio_alt.php` — alternative projects layout
- `simple.php` — minimal text-only listing (used by `revitron/automad-revitron/blocks/pagelist/simple.php`)

To switch based on a checkbox:

```html
<@ if @{ checkboxUseAlternativePagelistLayout } @>
  <@ blocks/pagelist/blog_alt.php @>
<@ else @>
  <@ blocks/pagelist/blog.php @>
<@ end @>
```

To override a built-in block type, copy the original template from Automad's core (`/app/blocks/<type>/...` in the container) into your theme's `blocks/<type>/...` and modify.

## Block-editor section/column primitives

Editors compose layouts in the dashboard using **sections** (full-width rows) and **columns** (multi-column rows inside a section). Both produce markup you can target from CSS:

- Sections render as `<am-section class="...">...</am-section>`
- Columns render as `<am-flex>` with `<am-1-2>`, `<am-1-3>`, etc. children for ratio-based splits
- Buttons render as `<am-buttons><a class="am-button">…</a>...</am-buttons>`

Target these from your CSS:

```css
am-section { padding: 4rem 1rem; }
am-flex { display: flex; gap: 1rem; flex-wrap: wrap; }
am-1-2 { flex: 1 1 calc(50% - 0.5rem); }
```

The standard theme ships a complete LESS set (`less/block.less`, `less/grid.less`, `less/hero.less`) that's worth reading as a working reference for all block types.
