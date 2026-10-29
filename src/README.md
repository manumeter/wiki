# Wiki renderer

`../index.html` is a single self-contained page that renders the wiki's markdown files in the
browser (successor of MDwiki). The webserver serves the repo as-is (`pull/index.php` just runs
`git pull`), so there is no build step on the server: build locally and commit `index.html`
together with the source change.

## Build

Requires only Python 3:

    python3 src/build.py            # writes ./index.html
    python3 src/build.py /tmp/x.html

To try it locally, serve the repo root (markdown is loaded with `fetch`, so `file://` won't work):

    python3 -m http.server 8000     # http://localhost:8000/

## Files

| File | |
|------|-|
| `template.html` | page skeleton, `{{...}}` placeholders are filled in by `build.py` |
| `app.css` | styles, light/dark colour variables at the top |
| `app.js` | navigation, routing, rendering, outline, search |
| `vendor/` | [marked](https://marked.js.org) (markdown) and [highlight.js](https://highlightjs.org) (syntax highlighting), unmodified upstream builds |
| `vendor/languages/` | highlight.js languages on top of its default bundle |
| `update-vendor.sh` | refreshes `vendor/` from npm |

## Updating the libraries

    src/update-vendor.sh                  # latest versions
    src/update-vendor.sh 18.1.2 11.12.0   # specific marked / highlight.js versions
    python3 src/build.py

To support another highlight.js language, copy its `languages/<name>.min.js` from the
`@highlightjs/cdn-assets` package into `vendor/languages/` and rebuild.

## Writing pages

- `navigation.md` defines the sidebar: the `#` heading is the site title, every other link
  (`[Name](page.md)`) or heading is a top-level entry, and a list directly below it becomes its
  children. Nested lists give deeper levels; `[Name]()` is an entry without a page of its own.
  Entries with children are collapsible and start collapsed, except the branch of the open page.
- Pages are linked as `#!path/page.md` (or `#!path/page.md#heading-id`); relative links and
  images in a page resolve relative to that page.
- Code blocks without a language are highlighted as shell (with command names and `-o`/`--options`
  marked on top of highlight.js' bash grammar, see `app.js`). Give everything else an explicit
  language: ```` ```sql ````, ```` ```ini ````, ```` ```yaml ````, ```` ```text ```` (no highlighting), ...
- Markdown is parsed as CommonMark/GFM: a code block inside a list item must be indented to the
  item's content (or be a fenced block indented like the item text).
