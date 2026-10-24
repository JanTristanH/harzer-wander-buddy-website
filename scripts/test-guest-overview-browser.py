#!/usr/bin/env python3
"""Exercise the real exported Expo UI while rejecting every backend request."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import threading
from urllib.parse import urlsplit

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
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    url = origin + '/preview/overview/'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=executable, args=[
                '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
            context = browser.new_context(viewport={'width': 1280, 'height': 900},
                geolocation={'latitude': 51.799, 'longitude': 10.618}, permissions=['geolocation'])
            forbidden = []
            requests = []

            def network(route):
                target = route.request.url
                requests.append(target)
                parts = urlsplit(target)
                if parts.hostname == 'app.harzer-wander-buddy.de' and parts.path == '/app/rnweb/login':
                    return route.fulfill(content_type='text/html', body='<title>Live app login handoff</title>')
                if '/odata/' in parts.path or parts.hostname in ['app.harzer-wander-buddy.de', 'localhost'] or 'auth0.com' in (parts.hostname or ''):
                    forbidden.append(target)
                    return route.abort()
                if parts.hostname == 'tiles.openfreemap.org':
                    return route.fulfill(content_type='application/json', body=json.dumps({
                        'version': 8, 'sources': {}, 'layers': [{'id': 'background', 'type': 'background', 'paint': {'background-color': '#e6e7dd'}}]}))
                route.continue_()

            context.route('**/*', network)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(url)
            app = page.frame_locator('.app-frame')
            search = app.get_by_placeholder('Suche nach Nummer oder Ort')
            expect(search).to_be_visible(timeout=30000)
            expect(app.get_by_text('222 gesamt', exact=True)).to_be_visible()
            expect(app.get_by_text('Stempelstellen', exact=True)).to_be_visible()
            def check_shell():
                # Neither wheel gestures nor programmatic scrolling may reveal
                # a second page below the app, including after mobile resize.
                expect(page.locator('.article-index')).to_have_count(0)
                expect(page.locator('.stamp-article-link')).to_have_count(0)
                page.mouse.move(5, 5)
                page.mouse.wheel(0, 2000)
                page.evaluate('window.scrollTo(0, 100000)')
                assert page.evaluate('scrollY === 0 && document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth')
                bounds = page.locator('.app-frame').bounding_box()
                assert bounds and bounds['x'] == 0 and bounds['y'] == 0
                assert abs(bounds['height'] - page.viewport_size['height']) <= 1

            check_shell()
            assert not forbidden, forbidden
            if screenshots:
                screenshots.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(screenshots / 'desktop-list.png'))
            search.fill('Brockenhaus')
            expect(app.get_by_text(re.compile(r'9.*Brockenhaus'))).to_be_visible()
            search.fill('not-a-stamp-xyz')
            expect(app.get_by_text('Keine passenden Stempelstellen', exact=True)).to_be_visible()
            search.fill('')
            page.set_viewport_size({'width': 390, 'height': 844})
            check_shell()
            if screenshots:
                page.screenshot(path=str(screenshots / 'mobile-list.png'))
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            app.get_by_text('Karte', exact=True).click()
            expect(app.locator('.leaflet-container')).to_be_visible(timeout=30000)
            expect(app.locator('.leaflet-marker-icon').first).to_be_visible(timeout=30000)
            expect(app.get_by_placeholder('Suche Stempel oder Parkplatz')).to_be_visible()
            check_shell()
            if screenshots:
                page.screenshot(path=str(screenshots / 'mobile-map.png'))
            page.set_viewport_size({'width': 1280, 'height': 900})
            check_shell()
            if screenshots:
                page.screenshot(path=str(screenshots / 'desktop-map.png'))
            app.get_by_text('Liste', exact=True).click()
            expect(search).to_be_visible()
            # Canonical detail navigation must leave the frame for the article.
            search.fill('Brockenhaus')
            app.get_by_text(re.compile(r'9.*Brockenhaus')).click()
            page.wait_for_url('**/stempelstelle-009-brockenhaus/')
            page.goto(url)
            app.get_by_text('Dein Fortschritt', exact=True).click()
            # Catch the navigation before a real authenticated server is contacted.
            page.wait_for_url('https://app.harzer-wander-buddy.de/app/rnweb/login', wait_until='commit')

            # The established search landing page keeps its canonical URL,
            # native HTML content and a usable app without outer-page scrolling.
            page.set_viewport_size({'width': 1280, 'height': 900})
            page.goto(origin + '/overview')
            expect(search).to_be_visible(timeout=30000)
            expect(page.locator('.stamp-table')).to_be_hidden()
            assert page.locator('link[rel="canonical"]').get_attribute('href').endswith('/overview')
            if screenshots:
                page.screenshot(path=str(screenshots / 'public-desktop-list.png'))
            for viewport in [{'width': 1280, 'height': 900}, {'width': 320, 'height': 568}, {'width': 390, 'height': 844}]:
                page.set_viewport_size(viewport)
                page.evaluate('window.scrollTo(0, 100000)')
                assert page.evaluate('scrollY === 0 && document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth')
                bounds = page.locator('.app-frame').bounding_box()
                assert bounds and bounds['y'] == 56 and abs(bounds['height'] - (viewport['height'] - 56)) <= 1
            if screenshots:
                page.screenshot(path=str(screenshots / 'public-mobile-list.png'))
            page.get_by_text('Übersicht & FAQ', exact=True).click()
            expect(page.locator('.stamp-table')).to_be_visible()
            expect(page.locator('.app-frame')).to_have_attribute('inert', '')
            expect(page.locator('.stamp-article-link')).to_have_count(222)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            if screenshots:
                page.screenshot(path=str(screenshots / 'public-mobile-info.png'))
            page.keyboard.press('Escape')
            expect(page.locator('.stamp-table')).to_be_hidden()
            expect(page.locator('.app-frame')).not_to_have_attribute('inert', '')
            expect(page.locator('summary')).to_be_focused()
            page.goto(origin + '/overview#alle-222-hwn-stempelstellen-als-%C3%BCbersichtstabelle')
            expect(page.locator('.stamp-table')).to_be_visible()
            page.goto(origin + '/overview#alle-222-hwn-stempelstellen-als-ubersichtstabelle')
            expect(page.locator('.stamp-table')).to_be_visible()
            page.locator('.stamp-map-link[href="/overview?stempel=114"]').click()
            expect(app.get_by_placeholder('Suche Stempel oder Parkplatz')).to_be_visible(timeout=30000)
            expect(app.get_by_text(re.compile(r'114.*Ramseck'))).to_be_visible(timeout=30000)
            if screenshots:
                page.screenshot(path=str(screenshots / 'public-mobile-stamp-map.png'))
            page.goto(origin + '/stempelstelle-114-ramseck/')
            page.get_by_role('link', name='HWN 114 auf der Karte ansehen', exact=True).click()
            expect(app.get_by_text(re.compile(r'114.*Ramseck'))).to_be_visible(timeout=30000)
            page.goto(origin + '/overview?ansicht=karte')
            expect(app.get_by_placeholder('Suche Stempel oder Parkplatz')).to_be_visible(timeout=30000)
            # Unknown/hostile input must stay on the safe, same-origin list.
            page.goto(origin + '/overview?stempel=https://example.org&ansicht=unknown')
            expect(search).to_be_visible(timeout=30000)
            assert page.locator('.app-frame').get_attribute('src') == origin + '/preview/overview/app/'
            assert not forbidden, forbidden
            assert sum('public-catalogue.json' in target for target in requests) >= 1
            assert not errors, errors
            context.close()
            plain = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
            page = plain.new_page()
            page.goto(url)
            expect(page.locator('.app-frame')).to_be_hidden()
            expect(page.locator('.stamp-article-link:visible')).to_have_count(222)
            page.locator('.stamp-article-link').last.scroll_into_view_if_needed()
            expect(page.locator('.stamp-article-link').last).to_be_in_viewport()
            assert page.evaluate('scrollY > 0'), 'The no-JavaScript fallback must remain scrollable'
            page.goto(origin + '/overview')
            expect(page.locator('.app-frame')).to_be_hidden()
            expect(page.locator('.stamp-article-link:visible')).to_have_count(222)
            page.locator('.stamp-article-link').last.scroll_into_view_if_needed()
            expect(page.locator('.stamp-article-link').last).to_be_in_viewport()
            plain.close()
            browser.close()
            print('PASS: actual Expo list/map, shared UI, canonical top navigation, external login, no backend, mobile and no JavaScript')
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
