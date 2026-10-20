# Review der statischen Gastansicht

Stand: 20. Oktober 2026. Reviewumfang: Datenexport, Jekyll-Ausgabe, bestehende
Titel-URLs, Preview-SEO, Gastinteraktionen und GitHub-Pages-Auslieferung.

## Ergebnis und behobene Befunde

- **Datenkorrektheit:** HWN 149 war in CAP noch „Kleine Oker“ mit alten
  Koordinaten, falscher Naturmythenpfad-Beschreibung und falschem Bild. Der
  App-PR gleicht den Demo-Datensatz mit dem gepflegten Website-Artikel ab:
  Altenauer Herzweg/Mühlenberg, 51.803286 / 10.450144, gültig seit 2025-01-01.
  Das verändert keine produktive Datenbank.
- **Öffentliche Daten:** Ein enger Feldvertrag verhindert die versehentliche
  Veröffentlichung der im selben CSV enthaltenen Besuchs-/Gruppenfelder.
  Gültigkeitsprüfung, Vollständigkeit und Koordinaten werden vorab geprüft.
- **Reproduzierbarkeit:** Ein expliziter Stichtag, Quell-Commit und CSV-Hash
  machen den Snapshot nachvollziehbar. Ein uncommittierter CSV-Stand wird
  abgewiesen; CI vergleicht den Snapshot mit dem festgelegten Quellstand.
- **URL-Erhalt:** Statt Slugs aus CAP-Namen zu bauen, nutzt die Liste die
  echten Jekyll-`post.url`-Werte. Alle 222 Zielseiten samt Canonicals wurden
  geprüft, einschließlich bestehender Schreibweisen und Umlaute in Slugs.
- **SEO-Isolation:** `noindex,follow` steht im initialen Preview-HTML. Kein
  Preview-Eintrag in der Sitemap; `/overview` bleibt indexierbar. Ohne
  JavaScript stehen alle 222 Detailverweise zur Verfügung.
- **Suche:** Rein numerische Suchbegriffe treffen die exakte Stempelnummer;
  „HWN 46“ liefert nicht zusätzlich HWN 146. Mehrere Wörter, Groß-/
  Kleinschreibung, Umlaute und ß werden normalisiert.
- **Standort:** Erst ein Klick auf „In der Nähe“ fragt die Position ab.
  Ablehnung und verspätete Antworten nach Rückkehr zu „Alle“ lassen die Liste
  nutzbar. Die Position wird lokal verarbeitet, nicht in die URL geschrieben.
- **Auslieferung:** Der zusätzliche Workflow validiert PRs und erzeugt ein
  Build-Artefakt. Die vorhandene Pages-Veröffentlichung aus `main` bleibt der
  einzige Deployment-Weg. PRs allein schalten die Website nicht um.

## Validierung

- Vier Exporttests für Datenvertrag, CSV-Inhalte, zeitliche Auswahl sowie
  fehlende/doppelte Nummern und ungültige Koordinaten.
- Vollständiger Build mit `ghcr.io/actions/jekyll-build-pages:v1.0.13`, also
  der offiziellen GitHub-Pages-Jekyll-Laufzeit.
- Prüfung aller 222 statischen Karten, Detail-Canonicals und lokalen Assets,
  der Sitemap und des unveränderten Indexierungsstatus von `/overview`.
- Chromium auf Desktop und Mobil: Suche, leere Ergebnisse, Standortfreigabe
  und -ablehnung, Entfernungsreihenfolge, Karte/Liste, Browser-Zurück,
  direkter Einstieg mit `#karte`, kein horizontaler Überlauf und JavaScript aus.
- Die Browser-CI simuliert Kartenkacheln für verlässliche Tests. Reale
  Kartendienste werden dadurch nicht bei jedem CI-Lauf aufgerufen.
- Zusätzlich lokal mit echten OSM-Kacheln geprüft: Karte auf Desktop und
  Mobil. [Desktop-Liste](screenshots/static-guest-overview/desktop-list.png),
  [mobile Liste](screenshots/static-guest-overview/mobile-list.png),
  [Desktop-Karte](screenshots/static-guest-overview/desktop-map.png),
  [mobile Karte](screenshots/static-guest-overview/mobile-map.png).

## Nächste Verbesserungen, nach Priorität

1. **Datenqualität systematisch abgleichen.** Die Prüfung entdeckt technische
   Inkonsistenzen, ersetzt aber keine redaktionelle Kontrolle aller Standorte.
   HWN 149 zeigt, warum CAP-Daten und Website-Artikel künftig aus einem
   gemeinsam gepflegten öffentlichen Katalog gespeist werden sollten.
2. **Datenaktualisierungen komfortabler machen.** Aktuell ist ein bewusster
   Refresh-PR nötig. Später kann ein geplanter Job einen Daten-Diff als PR
   vorbereiten; Aktualisierungen sollten weiterhin prüfbar bleiben.
3. **Design gemeinsam pflegen.** HTML/CSS bilden die Gastansicht nach, teilen
   aber keinen UI-Code mit Expo. Gemeinsame Designwerte und Vergleichsbilder
   verringern künftige Abweichungen. Der App-Fortschritt wird öffentlich durch
   einen passenden App-Einstieg ersetzt, statt einen persönlichen Stand zu
   erfinden. Persönliche Filter und Besuchsaktionen bleiben in der App.
4. **Grundkarte angleichen.** Die Preview nutzt lokal eingebundenes Leaflet
   mit OSM-Rasterkacheln; die App nutzt OpenFreeMap-Vektorkarten. Bei gewünschter
   vollständiger Kartenparität den gleichen Kartenstil übernehmen. Das
   bestehende Raster-Setup lädt nur beim Kartenaufruf und zeigt Attribution.
5. **Vor der Umschaltung messen.** Reale Mobilgeräte, langsame Verbindungen
   und Search Console prüfen. Die Liste ist vollständig vorgerendert; das
   HTML umfasst dadurch rund 330 KB vor Kompression. Bei deutlich größerem
   Katalog eine crawlbare Seiteneinteilung prüfen. Für 222 Einträge wird die
   Lesbarkeit ohne JavaScript vorerst höher gewichtet als Virtualisierung.

Die Preview ist für einen parallelen Test vorbereitet. Die produktive
Übersichtsseite wird mit diesen PRs noch nicht ersetzt. Für die spätere
Umschaltung bleibt der bestehende Pfad `/overview` vorgesehen; die Detail-URLs
werden auch dann beibehalten.
