# Statische Gastansicht: Build, Veröffentlichung und Umschaltung

## Bestehende GitHub-Pages-Auslieferung

Die Repository-Einstellung ist aktuell „Deploy from a branch“, `main`, `/`.
Diese Einstellung bleibt bestehen. Nach dem Merge des Website-PRs rendert der
vorhandene Pages-Build die neue Seite unter:

`https://www.harzer-wander-buddy.de/preview/overview`

Es gibt keinen zweiten Deployment-Workflow, keinen neuen Hosting-Dienst und
keine Zugangsdaten für CAP. Der zusätzliche Actions-Workflow **Validate GitHub
Pages overview** baut PRs mit derselben offiziellen GitHub-Pages-Jekyll-Laufzeit,
prüft SEO und Interaktionen und stellt den fertigen Build als Artefakt bereit.
Er veröffentlicht PR-Branches nicht auf der produktiven Domain.

Den zugehörigen App-PR zuerst mergen, danach den Website-PR. Der erste Snapshot
verweist auf den geprüften App-PR-Commit. Nach einem Squash-Merge kann die
Quellrevision mit einem erneuten Export auf den gemergten Commit gesetzt werden;
der Inhalt bleibt bei unveränderten CAP-Daten gleich.

## Daten aktualisieren

Der Exporter liegt im App-Repository in `scripts/export-public-stamps.py`.
Der zugehörige Quell-Commit steht in `_data/guest_stamps.json` unter
`source.revision`, zusammen mit Stichtag und CSV-Prüfsumme. Der Website-CI-Job
checkt genau diesen Commit aus und vergleicht den erzeugten Export bytegenau.
So fließen spätere App-Änderungen nicht unbemerkt in den Website-Build ein.

```sh
# Vorher den gewünschten, geprüften Quellstand im App-Checkout auschecken.
python3 scripts/refresh-guest-stamps.py --source-repo ../harzer-wander-buddy --as-of 2026-10-20
bundle exec jekyll build
python3 scripts/check-guest-overview.py --site _site
python3 -m pip install playwright==1.55.0
python3 -m playwright install chromium
python3 scripts/test-guest-overview-browser.py --site _site
```

Die Daten müssen im App-Checkout committed sein, damit die Quellrevision exakt
auf den veröffentlichten Stand verweist. Den JSON-Diff und Änderungen an
verlegten Stempelstellen redaktionell prüfen. Es werden nur aktive reguläre
HWN 1–222 exportiert. Sonderstempel sind nicht Teil des Datenvertrags.

## URLs und SEO

- `/overview` und sämtliche vorhandenen Artikel bleiben unverändert.
- Die Preview hat `noindex,follow` im initialen HTML und `sitemap: false`.
  Das gilt über Jekyll-Defaults auch für künftige Seiten in `_pages/preview`.
- `robots.txt` bleibt für die Preview offen, damit Suchmaschinen `noindex`
  lesen können. Kein zusätzlicher Indexierungsblock per JavaScript.
- Die 222 Karten und Detailverweise sind bereits ohne JavaScript vorhanden.
- Details verlinken direkt auf `post.url` der bestehenden Jekyll-Beiträge.
  Die Nummer ordnet den passenden Beitrag zu; CAP-Namen werden nicht in neue
  URLs umgewandelt. Der Build-Check prüft jeden Zielartikel und dessen Canonical.
- Karte und Liste nutzen `#karte` / `#liste`. Suchbegriffe, Standort und Filter
  erzeugen keine zusätzlichen indexierbaren URLs.
- Bilder und Bildnachweise kommen aus den bestehenden Beiträgen. Die Nachweise
  stehen direkt an jeder Karte in einem aufklappbaren Element.

## Interaktion und Grenzen

Die Gestaltung übernimmt Farben, Karten, Suchfeld und Ansichtswechsel der
Expo-Gastansicht. Die Website verwendet semantisches HTML statt der kompletten
Expo-App. Gemeinsam ist der öffentliche Datenvertrag, nicht der UI-Code.

Leaflet 1.9.4 ist lokal samt BSD-Lizenz und benötigten Bilddateien eingebunden.
Nur beim Öffnen der Karte werden OSM-Rasterkacheln geladen; die Liste lädt keine
Kacheln. Attribution und normale Browser-Caches bleiben erhalten. Kein
Vorabladen oder Offline-Download von Kacheln. Die Standortabfrage erfolgt nur
nach Klick auf „In der Nähe“, verarbeitet die Position lokal und verwendet
15 km Luftlinie als Radius. Die Website schreibt keine Besuche ins Backend.

Die Grundkarte verwendet zunächst OSM-Rasterkacheln; die App verwendet
OpenFreeMap-Vektorkarten. Eine identische Grundkarte kann später nachgezogen
werden. Exportdatum und fehlende Live-Daten sind bei Änderungen von Standorten
zu beachten. Ein Daten-Refresh erfolgt bewusst über einen geprüften PR.

## Später produktiv umschalten

1. Gastansicht auf Mobilgeräten und mit realen Kartendaten abnehmen; bei
   verlegten Standorten CAP-Daten gegen die Artikel prüfen.
2. Das bestehende `_pages/overview.md` auf das neue Layout/Include umstellen.
   Den Permalink `/overview`, relevante Einführung/FAQ und bewährte interne
   Links erhalten. Die Preview nicht einfach auf die Startseite umbenennen.
3. Auf `/overview` keinen `noindex` setzen; Canonical und Sitemap prüfen.
4. Preview entfernen oder über eine vom Hosting unterstützte Weiterleitung
   auf `/overview` führen. GitHub Pages bietet keine frei konfigurierbaren
   serverseitigen 301-Regeln; eine echte 301 benötigt ggf. die vorgeschaltete
   Hosting-/Proxy-Ebene. Keine echte 301 durch ein HTML-Redirect versprechen.
5. Nach Veröffentlichung Search Console, Indexierung, Ladezeit und Nutzung
   beobachten. Artikel-URLs bleiben auch bei der Umschaltung erhalten.
