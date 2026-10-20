#!/usr/bin/env python3
"""Refresh the committed public catalogue from a local app-repository checkout."""
import argparse
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-repo', required=True, type=Path)
parser.add_argument('--as-of', required=True, help='YYYY-MM-DD (UTC)')
args = parser.parse_args()
subprocess.run([
    sys.executable, str(args.source_repo.resolve() / 'scripts/export-public-stamps.py'),
    '--as-of', args.as_of, '--output', str(ROOT / '_data/guest_stamps.json'),
], check=True)
print('Review the JSON diff and run scripts/check-guest-overview.py after building Jekyll.')
