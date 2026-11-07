#!/usr/bin/env python3
"""Validate published special-stamp images, attribution and optional app linkage."""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://www.harzer-wander-buddy.de'


def check(root, catalog=None, built=False):
    manifest = json.loads((root / ('data/special-stamp-images.json' if built else '_data/special_stamp_images.json')).read_text())
    entries = manifest['stamps']
    assert manifest['schemaVersion'] == 1
    assert len(entries) == 151
    assert len({x['catalogKey'] for x in entries}) == len(entries)
    assert len({x['ID'] for x in entries}) == len(entries)
    by_key = {x['catalogKey']: x for x in entries}
    photos = [x for x in entries if x['imageStatus'] == 'verified']
    assert photos, 'No reviewed images'
    for entry in entries:
        if entry['imageStatus'] == 'missing':
            assert entry['missingReason'] and not entry.get('heroImageUrl')
            continue
        assert entry['imageStatus'] == 'verified'
        key = entry['catalogKey']
        path = f'assets/images/stampboxes/special/{key}.webp'
        assert entry['path'] == path
        assert entry['heroImageUrl'] == f'{ORIGIN}/{path}'
        image = (root / path).read_bytes()
        assert image[:4] == b'RIFF' and image[8:12] == b'WEBP'
        assert hashlib.sha256(image).hexdigest() == entry['sha256']
        assert 0 < entry['width'] <= 1280 and 0 < entry['height'] <= 1280
        assert entry['artist'] and entry['subjectEvidence'] and entry['changes']
        assert entry['sourceTimestamp'] and entry['sourceSha1']
        assert urlparse(entry['sourceUrl']).netloc == 'commons.wikimedia.org'
        assert entry['license'].startswith('CC BY') or entry['license'] == 'CC0'
        assert urlparse(entry['licenseUrl']).netloc == 'creativecommons.org'
        for value in [entry['sourceUrl'], entry['licenseUrl'], entry['artist']]:
            assert value in entry['imageCaption'], (key, value)
    actual = {p.stem for p in (root / 'assets/images/stampboxes/special').glob('*.webp')}
    assert actual == {x['catalogKey'] for x in photos}, 'Orphan or missing files'
    if catalog:
        app = json.loads(catalog.read_text())['stamps']
        assert {x['catalogKey'] for x in app} == set(by_key)
        for stamp in app:
            image = by_key[stamp['catalogKey']]
            assert stamp['ID'] == image['ID'] and stamp['name'] == image['name']
            for field in ['heroImageUrl', 'imageCaption']:
                assert stamp.get(field) == image.get(field), (stamp['catalogKey'], field)
    print(f'{len(photos)} verified images; {len(entries)-len(photos)} explicit gaps; links and attribution valid.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path)
    parser.add_argument('--catalog', type=Path)
    args = parser.parse_args()
    check(args.site or ROOT, args.catalog, bool(args.site))
