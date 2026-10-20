# Echte App auf GitHub Pages

## Architektur

Die CI baut die echte Expo-Webapp aus `JanTristanH/harzer-wander-buddy` mit
einem statischen Datenadapter. Liste, Karte, Navigation, Schriften und Styling
stammen aus denselben Komponenten wie in der angemeldeten Webapp. Eine
separate HTML/CSS-Nachbildung der Gastoberfläche gibt es nicht.

Jekyll liefert weiterhin die vorhandenen Artikel und ihre Titel-URLs. Unter
`/preview/overview/` bindet eine minimale Hülle den echten Export als
gleichursprünglichen, bildschirmfüllenden Frame ein. Der Export selbst liegt
unter `/preview/overview/app/`. Diese Trennung verhindert, dass Website-CSS
die App verändert, und erhält deren Router und Layout unverändert. Darunter
steht ein sichtbarer HTML-Index mit allen 222 kanonischen Artikelverweisen.
Ohne JavaScript wird der Frame ausgeblendet; der Index bleibt nutzbar.

Der Pfad `/preview/overview` wird wegen des Unterverzeichnisses regulär auf
`/preview/overview/` normalisiert. `/overview` bleibt vorerst unverändert.

## Automatische UI-Updates

`static-app-source.json` legt das Quell-Repository und den verfolgten Branch
fest. Regulär wird `main` verwendet, damit öffentliche Website und freigegebene
Webapp denselben UI-Stand verwenden. Jeder Build löst den aktuellen Commit
auf und verwendet genau diesen Commit für UI und CAP-Daten.

Für die erste Einführung verweist `bootstrapPullRequest: 90` auf den
App-PR mit dem neuen Buildprofil. Solange er offen ist, wird sein Head geprüft.
Nach dem Merge nach `develop` wird vorübergehend dessen Merge-Commit verwendet,
bis dieser über Gitflow auch in `main` angekommen ist. Danach folgt die
Website automatisch wieder `main`. Ein ohne Merge geschlossener Bootstrap-PR
bricht den Build ab; es gibt keinen stillen Rückfall auf einen inkompatiblen
Stand. Nach dem ersten Release kann das Bootstrap-Feld entfernt werden.

Die CI läuft bei Website-Änderungen, manuell und planmäßig stündlich. Bei
geplanten Läufen vergleicht sie App-Commit, Website-Commit und UTC-Datum mit
der veröffentlichten Build-Herkunft. Unveränderte Stände werden am selben Tag
nicht erneut gebaut. Neue UI wird automatisch neu gebaut und nach bestandenen
Checks veröffentlicht; GitHub kann geplante Läufe verzögert ausführen.

## Einmalige Pages-Umstellung vor dem Website-Merge

Das Repository verwendet aktuell den direkten Jekyll-Build aus `main`.
Dieser kann Expo nicht bauen. Daher vor dem Merge des Website-PRs einstellen:

**Settings → Pages → Build and deployment → Source → GitHub Actions**.

Die bestehende Domain `www.harzer-wander-buddy.de` und `CNAME` bleiben erhalten.
Der neue Workflow baut Jekyll und Expo, prüft beide und lädt ein vollständiges
Pages-Artefakt hoch. Nur Läufe auf Website-`main` veröffentlichen es mit
`actions/deploy-pages`; PRs stellen ausschließlich prüfbare Artefakte bereit.
Es gibt keinen konkurrierenden zweiten Publish-Weg. Diese Repository-
Einstellung wurde bei der PR-Vorbereitung noch nicht geändert.

Merge-Reihenfolge: App-PR zuerst, Pages-Quelle umstellen, Website-PR mergen.
Die GitHub-Pages-Umgebung muss Deployments vom Website-Branch `main` erlauben.

## Daten, Links und Anmeldung

Der Build exportiert öffentliche Stempelstellen und Parkplätze aus CAP-
Demodaten für einen einmal ermittelten UTC-Stichtag. `_data/guest_stamps.json`
wird erzeugt und nicht mehr versioniert. Jekyll ergänzt die realen Artikel-
URLs, lokalen Bilder und Bildnachweise in `public-catalogue.json`.

Der App-Adapter lädt diesen Katalog einmal statt CAP aufzurufen. Er stellt
keine Sitzung wieder her und kontaktiert Auth0 nicht. Versehendliche Backend-
Reads/Writes sind im statischen Profil blockiert. „Anmelden“ öffnet die
laufende App im Hauptfenster; Artikelaufrufe öffnen die bisherigen Titel-URLs.
Ein späterer Live-Betrieb kann denselben UI-Code mit dem normalen API-/
Auth-Profil verwenden; er benötigt passende Hosting- und Auth-Konfiguration.

## Lokal reproduzieren

```sh
npm ci --prefix ../harzer-wander-buddy/app
python3 ../harzer-wander-buddy/scripts/export-public-stamps.py --as-of 2026-10-20 --output _data/guest_stamps.json
bundle exec jekyll build
node ../harzer-wander-buddy/scripts/build-static-website.mjs /tmp/expo-website
python3 scripts/assemble-static-app.py --app-dir /tmp/expo-website --site _site
python3 scripts/check-guest-overview.py --site _site
python3 -m pip install playwright==1.55.0
python3 -m playwright install chromium
python3 scripts/test-guest-overview-browser.py --site _site
```

Der CI-Build nutzt die offizielle GitHub-Pages-Jekyll-Laufzeit. Die
Browserprüfung simuliert nur die externen OpenFreeMap-Daten für zuverlässige
Tests; App-Komponenten, Router und Datenadapter sind der echte Build.

## SEO und spätere Umschaltung

Preview-Hülle und alle exportierten App-HTML-Dateien erhalten `noindex,follow`.
Keine Preview-Seite steht in der Sitemap. `robots.txt` bleibt offen, damit
Suchmaschinen die Regeln lesen können. Alle 222 Detail-URLs werden mit den
Canonicals der gebauten Artikel abgeglichen.

Vor einer Umschaltung auf `/overview` muss die SEO-Hülle gezielt indexierbar
werden. Bestehende Einführung/FAQ erhalten, Canonical und Sitemap prüfen und
die Textverweise behalten: Die echte App nutzt eine virtualisierte Liste und
rendert nicht alle 222 Karten gleichzeitig. Den gesamten App-Export pauschal
indexieren zu lassen ist kein Ersatz für diese SEO-Struktur.
