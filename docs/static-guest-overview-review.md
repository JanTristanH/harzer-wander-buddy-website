# Review: echte App mit statischem Datenprofil

Stand: 20. Oktober 2026.

## Ergebnis

Die Website baut die echte Expo-App in GitHub CI. Änderungen an Liste, Karte,
Navigation und Styling werden aus dem verfolgten App-Branch übernommen.
Es gibt keine getrennte Gast-UI, keine kopierten React-Komponenten und keinen
separaten Kartenstil. Die App verwendet auch öffentlich ihre OpenFreeMap-Karte.

Das Buildprofil trennt die Datenquelle vom UI-Code: Öffentliche Daten kommen
aus einem lokalen JSON-Katalog. Authentifizierte Funktionen bleiben bei der
laufenden App. Die Jekyll-Hülle enthält den echten Export und einen sichtbaren
Artikelindex, keine Nachbildung der App. Titel-URLs und vorhandene Artikel
bleiben erhalten. Der ursprüngliche HTML/CSS-Nachbau wurde entfernt.

## Behobene Befunde

- HWN 149 zeigte in CAP einen alten Standort und einen falschen Text/Bildsatz.
  Der Demo-Datensatz ist mit dem Website-Artikel zum Altenauer Herzweg am
  Mühlenberg abgeglichen. Produktionsdaten wurden nicht verändert.
- Der Export begrenzt öffentliche Felder ausdrücklich, einschließlich der
  Parkplätze. Nutzer-, Gruppen- und Besuchsdaten gelangen nicht in die Dateien.
- Ein reiner Gast-Provider vermeidet Auth0-Discovery, Session-Wiederherstellung
  und unbeabsichtigte Backend-Abfragen im statischen Build. Reads/Writes über
  die zentralen API-Funktionen werden dort abgewiesen.
- Der persistierte Query-Cache erhält einen Buster pro App-Revision, damit
  aktualisierte Daten nicht hinter einem alten Gast-Cache verschwinden.
- Beim erneuten lokalen Export hatte Metro noch den zuvor eingebetteten
  Revisionswert gecacht. Der Build leert deshalb den Metro-Cache und prüft,
  dass der aktuelle Revisionswert tatsächlich im erzeugten Bundle steht.
- Artikelnavigation und Login verlassen den eingebetteten Export und öffnen
  im Hauptfenster die bestehenden Artikel bzw. die laufende App.
- Die Preview nutzt einen Permalink mit abschließendem Slash, weil darunter
  der App-Export liegt. So kollidiert kein `overview.html` mit einem gleichnamigen
  Verzeichnis ohne Index.
- UI und Daten stammen aus demselben aufgelösten Commit. Der regelmäßige
  Workflow erkennt Änderungen selbst und vermeidet unnötige Wiederholungen.
- Der Pages-Jekyll-Container erzeugt Dateien als `root`. Die CI überträgt
  den Ausgabeordner deshalb vor dem Zusammenfügen an den Runner-Benutzer;
  andernfalls scheitert das Einfügen des Expo-Exports an Dateirechten.

## Validierung

- Vollständige App-Testsuite: 39 Suites, 199 Tests erfolgreich; darunter vier
  neue Adaptertests und ein zusätzlicher Buildprofil-Test.
- Fünf Python-Exporttests einschließlich öffentlichem Parkplatz-Datenvertrag.
- Reeller `expo export --platform web`: 28 statische Routen erfolgreich gebaut.
- Pages-Prüfung: echte Expo-Bundles und Build-Herkunft vorhanden; alle 222
  Artikel-URLs und Canonicals korrekt; lokale Bilder vorhanden; Preview aus
  der Sitemap ausgeschlossen; bisherige `/overview` weiter indexierbar.
- Browserprüfung der echten App auf Desktop/Mobil mit blockierten CAP-/
  Auth0-Zugriffen: Liste, Suche, leere Ergebnisse, Karte, Navigation, Übergang
  zum kanonischen Artikel und Login, sowie 222 Textlinks ohne JavaScript.
- Zusätzlich lokale Screenshots mit echten OpenFreeMap-Daten. Die CI simuliert
  die externe Grundkarte, verwendet aber die echte App-Kartenkomponente.

[Desktop-Liste](screenshots/static-guest-overview/desktop-list.png) ·
[Mobile Liste](screenshots/static-guest-overview/mobile-list.png) ·
[Desktop-Karte](screenshots/static-guest-overview/desktop-map.png) ·
[Mobile Karte](screenshots/static-guest-overview/mobile-map.png)

## Was wir als Nächstes verbessern können

1. **JavaScript-Ladegewicht reduzieren.** Der gemessene Expo-Export enthält
   rund 4,9 MB JavaScript vor Kompression. Statische Daten sparen CAP-Abfragen,
   machen dieses Bundle aber nicht kleiner. Route-/Funktionsaufteilung und
   Lazy Loading zuerst messen; dabei weiterhin die echten UI-Komponenten
   verwenden. Auch authentifizierte/admin Routen sind derzeit Teil des
   normalen Expo-Router-Exports, obwohl ihre Daten öffentlich gesperrt bleiben.
2. **Datenqualität gemeinsam pflegen.** CAP-Demodaten und Artikel können
   redaktionell auseinanderlaufen, wie HWN 149 gezeigt hat. Der technische
   Vertrag erkennt keine falsche Ortsbeschreibung. Ein gemeinsam gepflegter
   öffentlicher Katalog wäre der nächste sinnvolle Schritt.
3. **Release-Stand bewusst angleichen.** Nach der Bootstrap-Phase folgt die
   Website App-`main`. Die bestehende Backend-/App-Auslieferung muss denselben
   Release-Stand verwenden, wenn pixelgleicher Vergleich mit der laufenden
   angemeldeten App erwartet wird. Gemeinsam ist der Quellcode; ein alter
   noch laufender Server aktualisiert sich nicht durch den Website-Build.
4. **SEO-Hülle erhalten.** Die echte virtualisierte Liste allein ist keine
   vollständige HTML-Linkübersicht. Den vorhandenen sichtbaren Textindex und
   Artikel-Sitemap vor einer produktiven Umschaltung gezielt prüfen.

Die Live-Website wurde noch nicht umgeschaltet. Vor dem Website-Merge muss
Pages einmalig auf die Quelle **GitHub Actions** eingestellt werden. Der
bisherige Branch-Jekyll-Build kann die echte Expo-App nicht erstellen.
