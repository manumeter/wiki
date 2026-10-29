(() => {
'use strict';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  el.append(...children);
  return el;
};
const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const INDEX = 'index.md';

const state = {
  siteTitle: document.title,
  nav: [],        // [{title, page|href}] or [{title, items: [...]}]
  flat: [],       // nav entries pointing to local .md pages, in order
  page: null,
  cache: new Map(), // page -> Promise<{text, modified}>
};

// ---------- paths & routing ----------

const isExternal = href => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
const dirname = p => p.slice(0, p.lastIndexOf('/') + 1);
const safeDecode = s => { try { return decodeURIComponent(s); } catch { return s; } };

function normalize(path) {
  const out = [];
  for (const part of path.split('/')) {
    if (part === '..') out.pop();
    else if (part && part !== '.') out.push(part);
  }
  return out.join('/');
}

// Resolves a link found in `page` -> {page, anchor} for wiki pages, {url} for anything else.
function resolveLink(href, page) {
  if (href.startsWith('#!')) return parseRoute(href.slice(2));
  if (href.startsWith('#')) return { page, anchor: safeDecode(href.slice(1)) };
  if (isExternal(href)) return { url: href, external: true };
  const i = href.indexOf('#');
  const path = safeDecode(i < 0 ? href : href.slice(0, i));
  const anchor = i < 0 ? '' : safeDecode(href.slice(i + 1));
  if (/\.md$/i.test(path)) return { page: path.startsWith('/') ? normalize(path) : normalize(dirname(page) + path), anchor };
  if (path.startsWith('/')) return { url: href };
  return { url: encodeURI(normalize(dirname(page) + path)) + (i < 0 ? '' : href.slice(i)) };
}

function parseRoute(route) {
  route = safeDecode(route);
  const i = route.indexOf('#');
  return { page: (i < 0 ? route : route.slice(0, i)) || INDEX, anchor: i < 0 ? '' : route.slice(i + 1) };
}

function currentRoute() {
  const hash = location.hash;
  if (hash.startsWith('#!')) return parseRoute(hash.slice(2));
  if (hash.length > 1 && !/\.md(#|$)/i.test(hash)) return { page: state.page || INDEX, anchor: safeDecode(hash.slice(1)) };
  return parseRoute(hash.slice(1));
}

const routeHref = (page, anchor) => '#!' + encodeURI(page) + (anchor ? '#' + encodeURIComponent(anchor) : '');

// Only same-origin markdown files may be loaded (the route comes from the URL).
function isAllowedPage(page) {
  if (!/\.md$/i.test(page) || isExternal(page)) return false;
  try { return new URL(page, location.href).origin === location.origin; } catch { return false; }
}

function fetchPage(page) {
  if (!state.cache.has(page)) {
    const p = fetch(encodeURI(page), { cache: 'no-cache' }).then(async res => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return { text: await res.text(), modified: res.headers.get('Last-Modified') };
    });
    p.catch(() => state.cache.delete(page));
    state.cache.set(page, p);
  }
  return state.cache.get(page);
}

// ---------- markdown ----------

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
}

// Code blocks without a language are almost always shell commands in this wiki;
// label other languages explicitly (```sql, ```ini, ```text, ...).
function highlight(text, lang) {
  const language = hljs.getLanguage(lang || 'bash') ? lang || 'bash' : 'plaintext';
  const html = hljs.highlight(text, { language, ignoreIllegals: true }).value;
  return { html, lang: ['text', 'txt', 'plaintext'].includes(lang) ? '' : lang };
}

const ICON_COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

// Renders markdown of `page` into a detached <article>. With `full`, also adds the
// interactive bits (highlighting, copy buttons, ...) that the search index doesn't need.
function renderPage(md, page, full = true) {
  const doc = h('article', { class: 'doc' });
  doc.innerHTML = marked.parse(md, { gfm: true });

  const seen = new Map();
  for (const hd of $$('h1, h2, h3, h4, h5, h6', doc)) {
    let id = slugify(hd.textContent);
    const n = seen.get(id) || 0;
    seen.set(id, n + 1);
    if (n) id += '-' + n;
    hd.id = id;
  }
  if (!full) return doc;

  for (const a of $$('a[href]', doc)) {
    const target = resolveLink(a.getAttribute('href'), page);
    if (target.url) {
      a.setAttribute('href', target.url);
      if (target.external) { a.target = '_blank'; a.rel = 'noopener'; a.classList.add('external'); }
    } else {
      a.setAttribute('href', routeHref(target.page, target.anchor));
    }
  }
  for (const img of $$('img[src]', doc)) {
    const src = img.getAttribute('src');
    if (!isExternal(src) && !src.startsWith('/')) img.setAttribute('src', resolveLink(src, page).url);
    img.loading = 'lazy';
    if (!img.closest('a')) img.classList.add('zoomable');
  }
  for (const hd of $$('h2, h3, h4', doc)) {
    hd.append(h('a', { class: 'anchor', href: routeHref(page, hd.id), 'aria-label': 'Link to this section' }, '#'));
  }
  for (const table of $$('table', doc)) table.replaceWith(h('div', { class: 'table-wrap' }, table.cloneNode(true)));
  for (const code of $$('pre > code', doc)) {
    const pre = code.parentElement;
    const lang = ([...code.classList].find(c => c.startsWith('language-')) || '').slice(9).toLowerCase();
    const text = code.textContent.replace(/\n$/, '');
    const res = highlight(text, lang);
    code.className = 'hljs';
    code.innerHTML = res.html;
    const copy = h('button', { class: 'copy', type: 'button', title: 'Copy', 'aria-label': 'Copy code' });
    copy.innerHTML = ICON_COPY;
    copy.addEventListener('click', () => copyText(text, copy));
    const block = h('div', { class: 'code-block' });
    pre.replaceWith(block);
    if (res.lang) block.append(h('span', { class: 'lang' }, res.lang));
    block.append(copy, pre);
  }
  return doc;
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = h('textarea', { style: 'position:fixed;opacity:0' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  button.innerHTML = ICON_CHECK;
  button.classList.add('done');
  setTimeout(() => { button.innerHTML = ICON_COPY; button.classList.remove('done'); }, 1500);
}

// ---------- navigation ----------

function firstLink(tokens) {
  for (const t of tokens || []) {
    if (t.type === 'link') return t;
    if (t.type === 'list') continue;
    const l = firstLink(t.tokens);
    if (l) return l;
  }
  return null;
}

function navEntry(link) {
  const href = link.href || '';
  const entry = { title: link.text.replace(/[*_`]/g, '') };
  const target = href && resolveLink(href, INDEX);
  if (target && target.page) entry.page = target.page;
  else if (target) { entry.href = target.url; entry.external = !!target.external; }
  return entry;
}

function parseNav(md) {
  const nav = [];
  let group = null;
  for (const t of marked.lexer(md)) {
    if (t.type === 'heading' && t.depth === 1) state.siteTitle = t.text;
    else if (t.type === 'heading') nav.push(group = { title: t.text, items: [] });
    else if (t.type === 'paragraph') {
      for (const l of t.tokens.filter(x => x.type === 'link')) {
        const entry = navEntry(l);
        if (!l.href || l.href === '#') nav.push(group = { title: entry.title, items: [] });
        else { nav.push(entry); group = null; }
      }
    } else if (t.type === 'list') {
      for (const item of t.items) {
        const l = firstLink(item.tokens);
        if (l) (group ? group.items : nav).push(navEntry(l));
      }
    }
  }
  return nav;
}

const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

function navLink(entry) {
  if (entry.page) return h('a', { class: 'nav-link', href: routeHref(entry.page), 'data-page': entry.page }, entry.title);
  const a = h('a', { class: 'nav-link', href: entry.href || '#' }, entry.title);
  if (entry.external) { a.target = '_blank'; a.rel = 'noopener'; }
  return a;
}

function renderNav() {
  const collapsed = new Set(JSON.parse(localStorage.getItem('wiki-collapsed') || '[]'));
  const root = $('#nav');
  root.textContent = '';
  for (const entry of state.nav) {
    if (!entry.items) { root.append(navLink(entry)); continue; }
    const group = h('section', { class: 'nav-group' + (collapsed.has(entry.title) ? ' collapsed' : '') });
    const btn = h('button', { class: 'nav-group-title', type: 'button' }, entry.title);
    btn.insertAdjacentHTML('beforeend', CHEVRON);
    btn.addEventListener('click', () => {
      group.classList.toggle('collapsed');
      const now = new Set(JSON.parse(localStorage.getItem('wiki-collapsed') || '[]'));
      group.classList.contains('collapsed') ? now.add(entry.title) : now.delete(entry.title);
      localStorage.setItem('wiki-collapsed', JSON.stringify([...now]));
    });
    group.append(btn, h('div', { class: 'nav-items' }, ...entry.items.map(navLink)));
    root.append(group);
  }
  $('#brand').textContent = state.siteTitle;
}

function markActiveNav(page) {
  for (const a of $$('#nav .active')) a.classList.remove('active');
  const a = $$('#nav a[data-page]').find(x => x.dataset.page === page);
  if (!a) return;
  a.classList.add('active');
  a.closest('.nav-group')?.classList.remove('collapsed');
  a.scrollIntoView({ block: 'nearest' });
}

function navInfo(page) {
  const i = state.flat.findIndex(e => e.page === page);
  const group = state.nav.find(e => e.items && e.items.some(x => x.page === page));
  return { entry: state.flat[i], prev: i > 0 ? state.flat[i - 1] : null, next: i >= 0 ? state.flat[i + 1] : null, group };
}

function pageTitle(page, doc) {
  const h1 = doc && $('h1', doc);
  if (h1) return h1.textContent;
  const entry = state.flat.find(e => e.page === page);
  if (entry) return entry.title;
  const name = page.split('/').pop().replace(/\.md$/i, '').replace(/[-_]+/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// ---------- page ----------

let scrollSpy = null;

async function show(route) {
  const { page, anchor } = route;
  if (page === state.page) { scrollToAnchor(anchor); return; }
  state.page = page;
  document.body.classList.remove('nav-open');
  markActiveNav(page);
  const main = $('#content');
  main.classList.add('loading');

  let doc, modified = null;
  try {
    if (!isAllowedPage(page)) throw new Error('Not a wiki page');
    const res = await fetchPage(page);
    if (state.page !== page) return;
    modified = res.modified;
    doc = renderPage(res.text, page);
  } catch (err) {
    if (state.page !== page) return;
    doc = h('article', { class: 'doc' },
      h('h1', {}, 'Page not found'),
      h('p', {}, 'Could not load ', h('code', {}, page), ` (${err.message}).`),
      h('p', {}, h('a', { href: routeHref(INDEX) }, 'Back to the start page')));
  }

  const info = navInfo(page);
  const title = pageTitle(page, doc);
  if (!$('h1', doc)) doc.prepend(h('h1', {}, title));
  if (info.group) doc.prepend(h('div', { class: 'eyebrow' }, info.group.title));
  document.title = page === INDEX ? state.siteTitle : `${title} · ${state.siteTitle}`;

  const footer = h('footer', { class: 'doc-footer' });
  if (modified) footer.append(h('div', { class: 'modified' }, 'Last updated ' + new Date(modified).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })));
  if (info.prev || info.next) {
    const pager = h('nav', { class: 'pager' });
    const card = (e, label, cls) => h('a', { class: 'pager-link ' + cls, href: routeHref(e.page) }, h('span', { class: 'pager-label' }, label), h('span', { class: 'pager-title' }, e.title));
    pager.append(info.prev ? card(info.prev, 'Previous', 'prev') : h('span'));
    if (info.next) pager.append(card(info.next, 'Next', 'next'));
    footer.append(pager);
  }

  main.replaceChildren(doc, footer);
  main.classList.remove('loading');
  buildToc(doc);
  scrollToAnchor(anchor);
}

function scrollToAnchor(anchor) {
  const el = anchor && document.getElementById(anchor);
  if (el) el.scrollIntoView();
  else window.scrollTo(0, 0);
  updateToc();
}

// Always shown (page title first), so the layout is the same on every page.
function buildToc(doc) {
  const heads = $$('h1, h2, h3', doc).filter((hd, i) => hd.tagName !== 'H1' || i === 0);
  const toc = $('#toc');
  toc.textContent = '';
  toc.append(h('div', { class: 'toc-title' }, 'On this page'));
  const list = h('ul');
  for (const hd of heads) {
    const text = [...hd.childNodes].filter(n => !(n.classList && n.classList.contains('anchor'))).map(n => n.textContent).join('');
    const anchor = hd.tagName === 'H1' ? '' : hd.id;
    list.append(h('li', { class: 'toc-' + hd.tagName.toLowerCase() }, h('a', { href: routeHref(state.page, anchor), 'data-id': hd.id }, text)));
  }
  toc.append(list);
  scrollSpy = heads.length ? heads : null;
}

function updateToc() {
  if (!scrollSpy) return;
  const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) + 120;
  let current = scrollSpy[0];
  for (const hd of scrollSpy) if (hd.getBoundingClientRect().top <= offset) current = hd;
  if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = scrollSpy[scrollSpy.length - 1];
  for (const a of $$('#toc a')) a.classList.toggle('active', a.dataset.id === current.id);
}

let tocFrame = 0;
window.addEventListener('scroll', () => {
  if (!tocFrame) tocFrame = requestAnimationFrame(() => { tocFrame = 0; updateToc(); });
}, { passive: true });

// ---------- search ----------

let searchIndex = null;

function buildSearchIndex() {
  if (searchIndex) return searchIndex;
  const pages = [...new Set([INDEX, ...state.flat.map(e => e.page)])];
  searchIndex = Promise.all(pages.map(async page => {
    try {
      const doc = renderPage((await fetchPage(page)).text, page, false);
      const title = pageTitle(page, doc);
      const sections = [{ page, title, heading: '', anchor: '', text: '' }];
      for (const el of doc.children) {
        if (/^H[1-6]$/.test(el.tagName)) {
          if (el.tagName === 'H1' && sections.length === 1 && !sections[0].text) continue;
          sections.push({ page, title, heading: el.textContent, anchor: el.id, text: '' });
        } else {
          sections[sections.length - 1].text += ' ' + el.textContent.replace(/\s+/g, ' ');
        }
      }
      return sections;
    } catch {
      return [];
    }
  })).then(all => all.flat().map(s => ({ ...s, hay: [s.title, s.heading, s.text].join('\n').toLowerCase() })));
  searchIndex.catch(() => { searchIndex = null; });
  return searchIndex;
}

function snippet(text, terms) {
  const lower = text.toLowerCase();
  let pos = -1;
  for (const t of terms) { const p = lower.indexOf(t); if (p >= 0 && (pos < 0 || p < pos)) pos = p; }
  const start = Math.max(0, pos - 50);
  let out = (start ? '…' : '') + text.slice(start, start + 160).trim() + (text.length > start + 160 ? '…' : '');
  out = escapeHtml(out);
  const re = new RegExp('(' + terms.map(t => escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
  return out.replace(re, '<mark>$1</mark>');
}

async function runSearch(query) {
  const results = $('#search-results');
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) { results.textContent = ''; return; }
  const index = await buildSearchIndex();
  if ($('#search-input').value !== query) return;
  const hits = [];
  for (const s of index) {
    if (!terms.every(t => s.hay.includes(t))) continue;
    let score = 0;
    for (const t of terms) {
      if (s.title.toLowerCase().includes(t)) score += 10;
      if (s.heading.toLowerCase().includes(t)) score += 5;
      score += Math.min(5, s.text.toLowerCase().split(t).length - 1);
    }
    if (!s.heading && !s.text.trim()) score -= 1;
    hits.push({ s, score });
  }
  hits.sort((a, b) => b.score - a.score);
  results.textContent = '';
  if (!hits.length) { results.append(h('li', { class: 'search-empty' }, 'No results for “' + query + '”')); return; }
  for (const { s } of hits.slice(0, 40)) {
    const text = h('span', { class: 'result-text' });
    text.innerHTML = snippet(s.text.trim(), terms);
    results.append(h('li', {}, h('a', { href: routeHref(s.page, s.anchor) },
      h('span', { class: 'result-title' }, s.title, s.heading ? h('span', { class: 'result-heading' }, ' › ' + s.heading) : ''),
      text)));
  }
  selectResult(0);
}

function selectResult(i) {
  const items = $$('#search-results a');
  items.forEach((a, j) => a.classList.toggle('selected', i === j));
  items[i]?.scrollIntoView({ block: 'nearest' });
}

function openSearch() {
  const dlg = $('#search');
  if (dlg.open) return;
  dlg.showModal();
  $('#search-input').select();
  buildSearchIndex();
}

// ---------- setup ----------

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('wiki-theme', theme);
}

function setup() {
  $('#theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('#menu-toggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#backdrop').addEventListener('click', () => document.body.classList.remove('nav-open'));
  $('#search-open').addEventListener('click', openSearch);

  const dlg = $('#search');
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('#search-results').addEventListener('click', e => { if (e.target.closest('a')) dlg.close(); });
  const input = $('#search-input');
  input.addEventListener('input', () => runSearch(input.value));
  input.addEventListener('keydown', e => {
    const items = $$('#search-results a');
    const i = items.findIndex(a => a.classList.contains('selected'));
    if (e.key === 'ArrowDown') { e.preventDefault(); selectResult(Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectResult(Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && items[i]) { e.preventDefault(); location.hash = items[i].getAttribute('href'); dlg.close(); }
  });

  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); openSearch(); }
  });

  const lightbox = $('#lightbox');
  lightbox.addEventListener('click', () => lightbox.close());
  $('#content').addEventListener('click', e => {
    const img = e.target.closest('img.zoomable');
    if (!img) return;
    $('img', lightbox).src = img.currentSrc || img.src;
    $('img', lightbox).alt = img.alt;
    lightbox.showModal();
  });

  $('#search-kbd').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
  window.addEventListener('hashchange', () => show(currentRoute()));
}

async function init() {
  setup();
  try {
    const nav = await fetch('navigation.md', { cache: 'no-cache' });
    if (nav.ok) state.nav = parseNav(await nav.text());
  } catch { /* no navigation, pages still work */ }
  state.flat = state.nav.flatMap(e => e.items || [e]).filter(e => e.page);
  renderNav();
  show(currentRoute());
}

init();
})();
