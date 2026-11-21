#!/usr/bin/env python3
"""Resolve the tracked app branch, with a bootstrap PR until its first merge."""
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.request
from datetime import datetime, timezone

root = Path(__file__).resolve().parents[1]
config = json.loads((root / 'static-app-source.json').read_text())
assert config['repository'] == 'JanTristanH/harzer-wander-buddy'
ref = config['ref']
pr_number = config.get('bootstrapPullRequest')
if pr_number:
    pr = json.loads(subprocess.check_output(['gh', 'api', f"repos/{config['repository']}/pulls/{int(pr_number)}"]))
    assert pr['head']['repo']['full_name'] == config['repository']
    if not pr['merged']:
        if pr['state'] != 'open':
            raise SystemExit('The bootstrap app PR was closed without merging; choose a reviewed app ref.')
        ref = pr['head']['sha']
    else:
        # The app uses Gitflow: the feature merges into develop first. Until
        # its release reaches main, keep using that reviewed merge commit.
        merged = pr['merge_commit_sha']
        comparison = subprocess.check_output(['gh', 'api', f"repos/{config['repository']}/compare/{merged}...{ref}", '--jq', '.status'], text=True).strip()
        if comparison not in ('ahead', 'identical'):
            ref = merged
revision = subprocess.check_output(['gh', 'api', f"repos/{config['repository']}/commits/{ref}", '--jq', '.sha'], text=True).strip()
assert re.fullmatch(r'[0-9a-f]{40}', revision)
website_revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
as_of = datetime.now(timezone.utc).date().isoformat()
needed = True
if os.environ.get('GITHUB_EVENT_NAME') == 'schedule':
    try:
        with urllib.request.urlopen('https://www.harzer-wander-buddy.de' + config['basePath'] + '/app-build.json', timeout=10) as response:
            deployed = json.load(response)
        needed = (deployed.get('revision'), deployed.get('websiteRevision'), deployed.get('asOf')) != (revision, website_revision, as_of)
    except (OSError, ValueError):
        pass  # Missing/unreachable deployment: produce a complete build.
outputs = {'revision': revision, 'as_of': as_of, 'needed': str(needed).lower()}
if os.environ.get('GITHUB_OUTPUT'):
    with open(os.environ['GITHUB_OUTPUT'], 'a') as stream:
        for key, value in outputs.items():
            stream.write(f'{key}={value}\n')
print(json.dumps(outputs))
