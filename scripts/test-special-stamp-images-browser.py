#!/usr/bin/env python3
"""Serve a built site and verify images and credits in Chromium."""
import argparse
import asyncio
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
from playwright.async_api import async_playwright


async def check(site, screenshots):
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(site)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            request = await p.request.new_context()
            response = await request.get(origin + '/data/special-stamp-images.json')
            assert response.status == 200
            manifest = await response.json()
            for image in manifest['stamps']:
                if image['imageStatus'] == 'verified':
                    result = await request.get(origin + '/' + image['path'])
                    assert result.status == 200 and result.headers['content-type'] == 'image/webp'
            for label, width, height in [('desktop', 1280, 900), ('mobile', 390, 844)]:
                page = await browser.new_page(viewport={'width': width, 'height': height})
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                response = await page.goto(origin + '/sonderstempel-bildnachweise/', wait_until='networkidle')
                assert response.status == 200
                await page.evaluate('document.fonts.ready')
                await page.locator('#special-jungborn img').scroll_into_view_if_needed()
                await page.locator('#special-jungborn img').evaluate('(img) => img.decode()')
                assert await page.locator('#special-jungborn a[href*="commons.wikimedia.org"]').count() == 1
                assert await page.locator('#special-jungborn a[href*="creativecommons.org"]').count() == 1
                assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), label
                assert not errors, errors
                screenshots.mkdir(parents=True, exist_ok=True)
                await page.screenshot(path=str(screenshots / f'special-stamp-credits-{label}.png'))
                await page.close()
            await request.dispose()
            await browser.close()
            print('All reviewed images load as WebP; credits work on desktop and mobile without overflow or JS errors.')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=Path('_site'))
    parser.add_argument('--screenshots', type=Path, default=Path('/tmp/special-stamp-images-screenshots'))
    args = parser.parse_args()
    asyncio.run(check(args.site, args.screenshots))
