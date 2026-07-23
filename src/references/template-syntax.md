# Automad Template Language Reference

Automad templates are `*.php` files containing HTML + Automad's template language (not raw PHP). This reference is derived from the official docs (https://automad.org/developer-guide/building-themes/template-language) and verified against the real `automad/standard-v1` theme.

## Delimiters — three kinds

| Delimiter | Use | Example |
|-----------|-----|---------|
| `@{ ... }` | **Echo** a variable or piped expression | `@{ :title }` |
| `<@ ... @>` | **Statement** (control flow, includes, toolbox) | `<@ if @{ :title } @>` |
| `<# ... #>` | **Comment** (stripped from output) | `<# a note #>` |

### Whitespace stripping with `~`

`~` on a statement delimiter strips surrounding whitespace in the output:

- `<@~ ... @>` — strip whitespace **before**
- `<@ ... ~@>` — strip whitespace **after**
- `<@~ ... ~@>` — strip **both**

`~` is **not** a string-concatenation operator. To compose strings, embed variables inline in HTML or use `def('...@{ var }...')` with a literal containing `@{ }`.

## Variables

Echo a variable: `@{ variable_name }`. A variable's value depends on context — usually the current page, but `foreach` and `with` change it.

### System variables (built-in, leading colon)

| Variable | Meaning |
|----------|---------|
| `@{ :title }` | Page title |
| `@{ :url }` | Page URL |
| `@{ :description }` | Page description |
| `@{ :slug }` | Page slug |
| `@{ :parent }` | Parent page |
| `@{ :level }` | Depth in the page tree |
| `@{ :template }` | Template name |
| `@{ :now }` | Current timestamp |
| `@{ :language }` | Current language (multilingual) |

### Custom variables

Any non-system name you echo becomes a dashboard-editable field automatically. The **prefix** of the name determines the dashboard control type (verified from the standard theme's `theme.json`):

| Prefix | Field type | Example |
|--------|-----------|---------|
| `+name` | **Block area** (block-editor region) | `+main`, `+hero` |
| `checkboxName` | Checkbox (boolean) | `checkboxHideTitle` |
| `colorName` | Color picker | `colorPageBackground` |
| `imageName` | Image file picker | `imageFavicon` |
| `iconName` | SVG icon picker | `iconNav` |
| `selectName` | Dropdown (options in `theme.json`) | `selectColorTheme` |
| `textName` | Text/HTML field | `textFooter` |
| `formatName` | Format string field | `formatDatePost` |
| `urlName` | URL field | `urlSearchResults` |
| `labelName` | Label string | `labelShowAll` |
| `filterName` | Filter expression | `filterPagelistByUrl` |

## Pipes — `@{ var | function }`

`|` passes a value into a **pipe function**. Functions chain left to right. Arguments use parentheses or a colon:

```
@{ variable | function }
@{ variable | function | anotherFunction }
@{ :now | dateFormat('Y') }
@{ count | +5 }
```

### Pipe functions (used in `@{ ... }`)

| Function | Example | Purpose |
|----------|---------|---------|
| `def('fallback')` | `@{ title \| def('404') }` | Default value when empty. The literal can contain `@{ }` that get resolved: `@{ brand \| def('@{ sitename }') }` |
| `markdown` | `@{ text \| markdown }` | Render markdown to HTML |
| `sanitize` | `@{ theme \| sanitize }` | Slug-ify for class names |
| `dateFormat('fmt')` | `@{ :now \| dateFormat('Y') }` | Format a date (PHP date format) |
| `replace('/regex/', 'str')` | `@{ +hero \| replace ('/^(.+)$/is', '<section>$1</section>') }` | Regex replace |
| `resize:800` | `@{ image \| resize:800 }` | Resize image to max width |
| `crop:800:600` | `@{ image \| crop:800:600 }` | Crop to dimensions |
| `stripTags` | `@{ :teaser \| stripTags }` | Strip HTML tags |
| `findFirstImage` | `@{ +main \| findFirstImage }` | Find first image in a block area |
| `find('*.jpg')` | `@{ files \| find('*.jpg') }` | Filter files by glob |

## Objects — iteratable lists

Objects are lists auto-populated with items, iterated via `foreach in <object>`. They are **not** pipe functions.

| Object | Contents |
|--------|----------|
| `pagelist` | The current page list (children, or filtered set) |
| `filelist` | Files attached to a page |
| `breadcrumb` | Pages forming the breadcrumb trail |
| `nav` | Pages for navigation menus |

## Statements — `<@ ... @>`

### if / else

```
<@ if @{ checkboxHideTitle } @>
  <h1 class="hidden">@{ :title }</h1>
<@ else @>
  <h1>@{ :title }</h1>
<@ end @>
```

Inline conditional inside an attribute:

```
<section <@ if @{ :pagelistDisplayCount } < 3 @>class="am-block"<@ end @>>
```

Comparisons (`<`, `>`, `==`) work inline.

### foreach — loop over an object

```
<@ foreach in pagelist @>
  <a href="@{ url }">@{ title }</a>
<@ end @>
```

Note the `in` keyword — `foreach` iterates an object **by name**, not via `@{ }`. Inside the loop the context switches to each item, and item fields are available as **custom variables without the `:` prefix** — use `@{ title }` and `@{ url }`, not `@{ :title }` / `@{ :url }`. The `:`-prefixed system variables refer to the *currently requested page*, not the loop item.

### with — change context to a page

```
<@ with '/some-page' @>
  <h2>@{ :title }</h2>
<@ end @>
```

`with` takes a page URL (string) and switches context to that page.

## Toolbox statement functions — `<@ function { options } @>`

These are statement functions (not pipes), called with an options object:

| Function | Purpose | Example |
|----------|---------|---------|
| `pagelist` | Build a configured page list | `<@ pagelist { match: '{"checkboxShowInNavbar":"/1/"}' } @>` |
| `newPagelist` | Create a fresh pagelist for iteration | `<@ newPagelist { excludeHidden: false } @>` then `<@ foreach in pagelist @>` |
| `filelist` | Build a configured file list | `<@ filelist { ... } @>` |
| `nav` | Build a navigation | `<@ nav { ... } @>` |
| `breadcrumb` | Build a breadcrumb | `<@ breadcrumb { ... } @>` |
| `set` | Set variables in context | `<@ set { :description: @{ metaDescription \| def(@{ :teaser \| stripTags }) } } @>` |
| `redirect` | Redirect to a URL | `<@ redirect '/new-location' @>` |

## Includes

Include another template file by relative path inside a statement — no function name, just the path:

```
<@ elements/navbar.php @>
<@ blocks/pagelist/blog.php @>
```

The path is relative to the current template's directory.

## Snippets — define + render reusable blocks

A snippet is a named block of markup you define once and render by name. Snippets **inherit the current context** and are the basis for recursion (nested navigation menus).

Define a snippet (with a default body):

```
<@ snippet main @>
  <main class="content">
    <@ elements/content.php @>
  </main>
<@ end @>
```

Render a snippet by name:

```
<@ main @>
```

Recursive snippet example (a nested nav tree):

```
<@ snippet tree @>
  <ul>
    <@ foreach in pagelist @>
      <li>
        <a href="@{ :url }">@{ :title }</a>
        <@ tree @>
      </li>
    <@ end @>
  </ul>
<@ end @>
```

## Template inheritance

A template extends another by naming it in a statement at the **top of the file**:

```
<@ post.php @>
```

The child can override snippets (like `main`) that the base renders via `<@ main @>`. This is how `blog.php`, `portfolio.php`, and `page_not_found.php` derive from `post.php` in the standard theme.

**The base template must define and call the snippet for the override to work.** A typical base layout:

```
<# Define a default main snippet. #>
<@ snippet main @>
  <main class="content">
    @{ +main }
  </main>
<@ end @>

<# Render it — a child template's override takes effect here. #>
<@ main @>
```

If the base instead outputs `@{ +main }` directly (without wrapping it in a snippet), a child template **cannot** override that region — the snippet mechanism is what enables inheritance.

## Comments

```
<# Stripped from rendered HTML. #>
```

A common pattern lists variables in a comment so they appear in the dashboard even when not echoed elsewhere:

```
<#
@{ imageCard }
@{ checkboxHideThumbnails }
#>
```

## Plain PHP

Plain `<?php ?>` is supported in templates but discouraged: variables used in PHP blocks **won't appear in the dashboard**, and mixing PHP with template syntax is error-prone. Prefer Automad's syntax; reach for PHP only for version guards or logic the template language can't express.

## Multilingual content

`@{ :language }` returns the current language. To persist a language selection across pages, the standard pattern uses a session/cookie-based approach — see the Multilingual Content doc. Per-page translations are typically modeled with language-suffixed variables or separate page trees.

## Rendering block areas

A block area (field named with `+`) is echoed like any variable:

```
@{ +main }
```

To wrap content in markup only when non-empty, pipe through `replace` with an anchored regex:

```
@{ +hero | replace ('/^(.+)$/is', '<section class="hero">$1</section>') }
```

See `references/block-layouts.md` for block-area registration and layout styling.

## Complete minimal template

`default.php`:

```html
<!DOCTYPE html>
<html lang="@{ :language | def('en') }" class="@{ selectColorTheme | def('light') | sanitize }">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@{ :title | def('@{ sitename }') }</title>
  <link rel="stylesheet" href="/packages/acme/my-theme/dist/style.css">
</head>
<body>
  <@ elements/navbar.php @>

  @{ +hero | replace ('/^(.+)$/is', '<section class="hero">$1</section>') }

  <main class="content">
    @{ +main }
  </main>

  <footer class="site-footer">
    @{ textFooter | def('&copy; @{ :now | dateFormat("Y") } @{ sitename }') }
  </footer>
</body>
</html>
```

## Useful patterns

### Navigation from the page list

```html
<nav>
  <@ foreach in pagelist @>
    <a href="@{ :url }">@{ :title }</a>
  <@ end @>
</nav>
```

### Recursive navigation tree

```
<@ snippet tree @>
  <ul>
    <@ foreach in pagelist @>
      <li><a href="@{ :url }">@{ :title }</a><@ tree @></li>
    <@ end @>
  </ul>
<@ end @>
```

### Conditional hero

```html
<@ if @{ +hero } @>
  @{ +hero | replace ('/^(.+)$/is', '<section class="hero">$1</section>') }
<@ else @>
  <h1>@{ :title }</h1>
<@ end @>
```

### Inheriting from a base layout

`page.php` (child) overriding the `main` snippet of `default.php`:

```
<@ default.php @>

<@ snippet main @>
  <main class="page">
    @{ +main }
  </main>
<@ end @>
```
