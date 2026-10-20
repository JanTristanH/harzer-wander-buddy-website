#!/usr/bin/env python3
"""Exercise the built guest overview in Chromium; no CAP or external tiles needed."""
import argparse
import base64
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading

from playwright.sync_api import sync_playwright, expect


class PagesHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        result = Path(super().translate_path(path))
        if not result.exists() and not result.suffix and result.with_suffix('.html').exists():
            result = result.with_suffix('.html')
        return str(result)

    def log_message(self, *_):
        pass


def run(site, executable, screenshots):
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(PagesHandler, directory=str(site)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f'http://127.0.0.1:{server.server_port}/preview/overview'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=executable, args=['--no-sandbox'])
            context = browser.new_context(viewport={'width': 1280, 'height': 900},
                                          geolocation={'latitude': 51.799, 'longitude': 10.618},
                                          permissions=['geolocation'])
            tiles = []
            transparent_png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=')

            def tile(route):
                tiles.append(route.request.url)
                route.fulfill(status=200, content_type='image/png', body=transparent_png)

            context.route('https://tile.openstreetmap.org/**', tile)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(url)
            expect(page.locator('.stamp-card:visible')).to_have_count(222)
            assert not tiles, 'Tiles must not load before opening the map'
            search = page.locator('#stamp-search')
            search.fill('HWN 46')
            expect(page.locator('.stamp-card:visible')).to_have_count(1)
            expect(page.locator('.stamp-card:visible')).to_have_attribute('data-number', '46')
            search.fill('grenzmuseum erinnerung')
            expect(page.locator('.stamp-card:visible')).to_have_count(1)
            search.fill('not-a-stamp')
            expect(page.locator('[data-empty]')).to_be_visible()
            expect(page.locator('.stamp-card:visible')).to_have_count(0)
            search.fill('')
            page.locator('[data-filter="near"]').click()
            expect(page.locator('[data-filter="near"]')).to_have_attribute('aria-pressed', 'true')
            nearby = page.locator('.stamp-card:visible').count()
            assert 0 < nearby < 222
            distances = page.locator('.stamp-card:visible [data-distance]').all_text_contents()
            parsed = [float(value.split(' ')[0].replace(',', '.')) for value in distances]
            assert parsed == sorted(parsed) and max(parsed) <= 15
            page.locator('[data-filter="all"]').click()
            expect(page.locator('.stamp-card:visible')).to_have_count(222)
            search.blur()
            if screenshots:
                screenshots.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(screenshots / 'desktop-list.png'))
            page.locator('[data-view="karte"]').click()
            expect(page.locator('.hwb-marker')).to_have_count(222)
            expect(page.locator('#stamp-list-panel')).to_be_hidden()
            page.locator('.hwb-marker').first.click(force=True)
            expect(page.locator('.hwb-map-link')).to_have_attribute('href', '/stempelstelle-001-eckertalsperre-staumauer/')
            search.fill('9')
            expect(page.locator('.hwb-marker')).to_have_count(1)
            page.go_back()
            expect(page.locator('#stamp-list-panel')).to_be_visible()
            search.fill('')
            page.set_viewport_size({'width': 390, 'height': 844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Mobile overflow'
            if screenshots:
                page.screenshot(path=str(screenshots / 'mobile-list.png'))
            # Opening the map directly is a supported shareable UI state.
            page.goto(url + '#karte')
            expect(page.locator('.hwb-marker')).to_have_count(222)
            # Denied geolocation must keep the catalogue usable.
            context.clear_permissions()
            page.goto(url)
            page.locator('[data-filter="near"]').click()
            expect(page.locator('[data-location-status]')).to_contain_text('Standort nicht verfügbar')
            expect(page.locator('.stamp-card:visible')).to_have_count(222)
            assert not errors, errors
            context.close()

            plain = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
            page = plain.new_page()
            page.goto(url)
            expect(page.locator('.stamp-card:visible')).to_have_count(222)
            expect(page.locator('[data-controls]')).to_be_hidden()
            expect(page.locator('[data-view-switch]')).to_be_hidden()
            expect(page.locator('meta[name="robots"]')).to_have_attribute('content', 'noindex,follow')
            assert page.locator('.stamp-card-link').first.get_attribute('href').startswith('/stempelstelle-001-')
            plain.close()
            browser.close()
            print('PASS: desktop/mobile, search, empty state, geolocation, map/list/history, direct map and no JavaScript')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=Path('_site'))
    parser.add_argument('--browser', help='Optional Chromium executable path')
    parser.add_argument('--screenshots', type=Path)
    args = parser.parse_args()
    run(args.site.resolve(), args.browser, args.screenshots)
