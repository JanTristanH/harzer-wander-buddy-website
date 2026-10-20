#!/usr/bin/env python3
"""Check the built Pages output, including actual canonical article targets."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def find(self, tag, **attrs):
        return [item for name, item in self.tags if name == tag and all(item.get(k) == v for k, v in attrs.items())]


def output_file(site, url):
    path = site / unquote(urlsplit(url).path).lstrip('/')
    if path.is_dir():
        path = path / 'index.html'
    elif not path.exists() and not path.suffix:
        path = path.with_suffix('.html')
    assert path.is_file(), f'Missing built target: {url}'
    return path


def check(site):
    root = Path(__file__).resolve().parents[1]
    catalogue = json.loads((root / '_data/guest_stamps.json').read_text())
    assert catalogue['schemaVersion'] == 1
    assert re.fullmatch(r'[0-9a-f]{40}', catalogue['source']['revision'])
    assert re.fullmatch(r'[0-9a-f]{64}', catalogue['source']['sha256'])
    stamps = catalogue['stamps']
    assert [s['number'] for s in stamps] == list(range(1, 223))
    assert len({s['id'] for s in stamps}) == 222
    fields = {'id', 'number', 'name', 'description', 'latitude', 'longitude', 'validFrom', 'validTo'}
    assert all(set(s) == fields for s in stamps), 'Unexpected public fields'

    preview = Document(output_file(site, '/preview/overview').read_text())
    robots = preview.find('meta', name='robots')
    assert len(robots) == 1 and 'noindex' in robots[0]['content'].split(',')
    cards = preview.find('li', **{'class': 'stamp-card'})
    links = preview.find('a', **{'class': 'stamp-card-link'})
    assert len(cards) == len(links) == 222, 'All stamps must be present before JavaScript'
    assert [int(c['data-number']) for c in cards] == list(range(1, 223))
    assert len({link['href'] for link in links}) == 222
    for stamp, card, link in zip(stamps, cards, links):
        number = stamp['number']
        assert card['data-name'] == stamp['name']
        assert float(card['data-lat']) == stamp['latitude']
        assert float(card['data-lng']) == stamp['longitude']
        assert re.fullmatch(rf'/stempelstelle-{number:03d}-.+/', link['href']), link['href']
        detail = Document(output_file(site, link['href']).read_text())
        canonical = detail.find('link', rel='canonical')
        assert len(canonical) == 1 and urlsplit(canonical[0]['href']).path == link['href'], link['href']
    for asset in preview.find('link', rel='stylesheet') + preview.find('script'):
        url = asset.get('href') or asset.get('src')
        if url:
            output_file(site, url)
    for image in preview.find('img'):
        output_file(site, image['src'])
    for link in preview.find('a'):
        if link.get('href', '').startswith('/') and not urlsplit(link['href']).netloc:
            output_file(site, link['href'])
    sitemap = ET.parse(site / 'sitemap.xml')
    urls = [node.text for node in sitemap.findall('.//{*}loc')]
    assert not any('/preview/' in url for url in urls), 'Preview leaked into sitemap'
    assert any(urlsplit(url).path == '/overview' for url in urls)
    overview = Document(output_file(site, '/overview').read_text())
    assert not any('noindex' in item.get('content', '') for item in overview.find('meta', name='robots'))
    assert not (site / 'scripts').exists(), 'Build tooling must not be published'
    assert not (site / 'docs').exists(), 'Internal review docs must not be published'
    print('PASS: 222 static cards, canonical title URLs, assets, noindex, sitemap and production overview')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=Path('_site'))
    check(parser.parse_args().site.resolve())
