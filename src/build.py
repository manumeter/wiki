#!/usr/bin/env python3
"""Assemble the sources in src/ and the vendored libraries into the single-file ../index.html."""
import pathlib, re, sys

src = pathlib.Path(__file__).resolve().parent
vendor = src / 'vendor'
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else src.parent / 'index.html'

def js(text):
    text = re.sub(r'^//# sourceMappingURL=.*$', '', text, flags=re.M)
    return text.replace('</script', '<\\/script').strip()

marked = (vendor / 'marked.umd.js').read_text()
hljs = (vendor / 'highlight.min.js').read_text()
languages = sorted((vendor / 'languages').glob('*.min.js'))

parts = {
    'MARKED_VERSION': re.search(r'marked v([\d.]+)', marked).group(1),
    'HLJS_VERSION': re.search(r'Highlight\.js v([\d.]+)', hljs).group(1),
    'CSS': (src / 'app.css').read_text().strip(),
    'MARKED': js(marked),
    'HLJS': js('\n'.join([hljs] + [l.read_text() for l in languages])),
    'APP': js((src / 'app.js').read_text()),
}
html = re.sub(r'\{\{(\w+)\}\}', lambda m: parts[m.group(1)], (src / 'template.html').read_text())
out.write_text(html)
print(f'{out}: {len(html) // 1024} KiB (marked {parts["MARKED_VERSION"]}, highlight.js {parts["HLJS_VERSION"]}'
      f' + {", ".join(l.name.split(".")[0] for l in languages)})')
