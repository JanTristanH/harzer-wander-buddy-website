# Sonderstempelbilder für die App

`_data/special_stamp_images.json` enthält alle 151 stabilen Sonderstempel-Identitäten aus App-PR #123. 50 Einträge haben ein geprüftes Foto; 101 bleiben ausdrücklich ohne Bild. Fehlende Fotos, Wappen, nur ähnlich benannte Orte und unklare Nutzungsrechte werden nicht automatisch ersetzt.

Die Fotos zeigen den zugehörigen Ort oder die Einrichtung, nicht zwingend den heutigen Stempelkasten. Beispielsweise zeigt das Luftfahrtmuseum-Foto einen Museumshangar und das Wiperti-Foto die Krypta. Dies ist im Dateinamen/Bildnachweis nachvollziehbar. Die Bilder sind keine Belege für Zugänglichkeit oder aktuelle Standorte.

## Öffentliche Schnittstellen

- Bilder: `https://www.harzer-wander-buddy.de/assets/images/stampboxes/special/<catalogKey>.webp`
- Zuordnung und Nachweise: `https://www.harzer-wander-buddy.de/data/special-stamp-images.json`
- Lesbare Nachweise: `https://www.harzer-wander-buddy.de/sonderstempel-bildnachweise/`

`heroImageUrl` und `imageCaption` werden identisch im App-Katalog und dessen Entwicklungs-CSV geführt. Die regulären 222 Einträge im Gastkatalog bleiben unverändert. Die Website muss veröffentlicht sein, bevor neue Bildlinks in der App verwendet werden. Ein PR veröffentlicht noch keine Dateien.

## Lizenz und Pflege

Jedes Foto hat einen Commons-Dateilink, Urheber, genaue Creative-Commons-Lizenz samt Link, Quellversion (Zeitstempel/SHA1), Motivbeleg, Ausgabegröße und SHA256. Die Dateien wurden ohne Beschnitt auf maximal 1280 Pixel verkleinert und als WebP gespeichert. Die jeweilige Bildlizenz gilt weiter; die Repository-Lizenz ersetzt sie nicht. Die App muss den `imageCaption` anzeigen.

Keine Bilder der offiziellen HWN-Website wurden ohne Nutzungsnachweis übernommen. Neue Fotos erst nach Motiv- und Lizenzprüfung ergänzen. Änderungen an Bildern müssen gleichzeitig Manifest und App-Katalog/CSV aktualisieren. Vorhandene produktive Datensätze werden durch diese PRs nicht verändert; der Initialisierungsbutton überspringt bereits angelegte Identitäten einschließlich individueller Bilder.

## Prüfung

```sh
python3 scripts/check-special-stamp-images.py
python3 scripts/check-special-stamp-images.py --catalog ../harzer-wander-buddy/backend/hwb/catalogue/special-stamps.json
bundle exec jekyll build --destination _site
python3 scripts/check-special-stamp-images.py --site _site
python3 scripts/test-special-stamp-images-browser.py --site _site
```

CI prüft Manifest und tatsächlich gebaute Ausgabe auf eindeutige Identitäten, vollständige Bildnachweise, exakte Dateipfade, Bildformat und Dateihashes. Der optionale Katalogvergleich prüft jedes App-Bild samt Beschriftung. Es werden keine produktiven Meldungen oder Datenbanken angefasst.
