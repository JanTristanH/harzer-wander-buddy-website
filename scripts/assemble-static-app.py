#!/usr/bin/env python3
"""Add the real Expo export to the Jekyll output without replacing its articles."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--app-dir', required=True, type=Path)
parser.add_argument('--site', type=Path, default=Path('_site'))
args = parser.parse_args()
destination = args.site / 'preview/overview/app'
catalogue = destination / 'public-catalogue.json'
if not catalogue.is_file():
    raise SystemExit('Build the Jekyll public catalogue before assembling the app.')
shutil.copytree(args.app_dir, destination, dirs_exist_ok=True)
for page in destination.rglob('*.html'):
    html = page.read_text()
    html = html.replace('<head>', '<head><meta name="robots" content="noindex,follow">', 1)
    html = html.replace('lang="en"', 'lang="de-DE"', 1)
    page.write_text(html)
provenance_path = destination / 'app-build.json'
provenance = json.loads(provenance_path.read_text())
provenance['websiteRevision'] = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
provenance['asOf'] = json.loads(catalogue.read_text())['source']['asOf']
provenance_path.write_text(json.dumps(provenance, indent=2) + '\n')
print('Assembled real Expo app:', provenance['revision'])
