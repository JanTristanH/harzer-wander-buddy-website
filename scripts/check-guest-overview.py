#!/usr/bin/env python3
"""Validate the real Expo output plus Jekyll's canonical articles and SEO index."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def find(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]


def output_file(site, url):
    path = site / unquote(urlsplit(url).path).lstrip('/')
    if path.is_dir():
        path = path / 'index.html'
    elif not path.exists() and not path.suffix:
        path = path.with_suffix('.html')
    assert path.is_file(), f'Missing built target: {url}'
    return path


def check(site):
    preview = Document(output_file(site, '/preview/overview').read_text())
    assert preview.find('meta', name='robots')[0]['content'] == 'noindex,follow'
    frame = preview.find('iframe')[0]
    assert frame['src'] == '/preview/overview/app/'
    app = site / 'preview/overview/app'
    build = json.loads((app / 'app-build.json').read_text())
    assert re.fullmatch(r'[0-9a-f]{40}', build['revision'])
    assert build['dataMode'] == 'static' and build['basePath'] == '/preview/overview/app'
    assert build['ui'] == 'app/app/(tabs)/index.tsx + app/app/(tabs)/map.tsx'
    catalogue = json.loads((app / 'public-catalogue.json').read_text())
    assert catalogue['source']['revision'] == build['revision'], 'UI and data must come from the same app commit'
    assert [s['number'] for s in catalogue['stamps']] == list(range(1, 223))
    assert len({s['id'] for s in catalogue['stamps']}) == 222
    assert catalogue['parkingSpots']
    assert all(set(p) == {'ID', 'name', 'description', 'latitude', 'longitude'} for p in catalogue['parkingSpots'])
    expected = {'id', 'number', 'name', 'description', 'latitude', 'longitude', 'validFrom', 'validTo', 'articleUrl', 'heroImageUrl', 'imageCaption'}
    assert all(set(s) == expected for s in catalogue['stamps']), 'Unexpected public fields'
    links = preview.find('a', **{'class': 'stamp-article-link'})
    assert len(links) == 222, 'The parent page must expose every article without JavaScript'
    for stamp, link in zip(catalogue['stamps'], links):
        assert stamp['articleUrl'] == link['href']
        assert re.fullmatch(rf"/stempelstelle-{stamp['number']:03d}-.+/", link['href'])
        detail = Document(output_file(site, link['href']).read_text())
        assert urlsplit(detail.find('link', rel='canonical')[0]['href']).path == link['href']
        assert detail.find('a', href=f"/overview?stempel={stamp['number']}"), 'Article must link to its own map point'
        output_file(site, stamp['heroImageUrl'])
    entry = Document(output_file(site, frame['src']).read_text())
    scripts = [s['src'] for s in entry.find('script') if s.get('src')]
    assert scripts and any('/_expo/' in s for s in scripts), 'Missing actual Expo bundles'
    for script in scripts:
        output_file(site, script)
    assert (app / 'map.html').is_file(), 'The actual Expo map route must be exported'
    for page in app.rglob('*.html'):
        assert Document(page.read_text()).find('meta', name='robots')[0]['content'] == 'noindex,follow'
    urls = [n.text for n in ET.parse(site / 'sitemap.xml').findall('.//{*}loc')]
    assert not any('/preview/' in u for u in urls)
    assert any(urlsplit(u).path == '/overview' for u in urls)
    overview = Document(output_file(site, '/overview').read_text())
    assert not any('noindex' in m.get('content', '') for m in overview.find('meta', name='robots'))
    assert urlsplit(overview.find('link', rel='canonical')[0]['href']).path == '/overview'
    assert overview.find('iframe')[0]['data-app-base'] == '/preview/overview/app/'
    assert len(overview.find('h1')) == 1
    assert [link['href'] for link in overview.find('a', **{'class': 'stamp-article-link'})] == [stamp['articleUrl'] for stamp in catalogue['stamps']]
    assert [link['href'] for link in overview.find('a', **{'class': 'stamp-map-link'})] == [f"/overview?stempel={stamp['number']}" for stamp in catalogue['stamps']]
    assert all(script['src'].startswith('/') for script in overview.find('script') if script.get('src')), 'Public overview must not add a third-party analytics script'
    for internal in ['scripts', 'docs', 'static-app-source.json']:
        assert not (site / internal).exists()
    print('PASS: real Expo bundles, shared source revision, 222 canonical article URLs, static parking, noindex and sitemap')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=Path('_site'))
    check(parser.parse_args().site.resolve())
