# Öffentliche App-Übersicht veröffentlichen und auswerten

## Was dieser PR veröffentlicht

- `/overview` bleibt die bestehende, indexierbare Such-Landingpage mit derselben
  kanonischen URL. Sie enthält die echte App, ohne Anmeldung und ohne CAP-Backend.
- „Übersicht & FAQ“ öffnet Einführung, beliebte Ziele, alle 222 Artikelverweise,
  Kartenlinks und FAQ in einem separat scrollbar nutzbaren Bereich. Escape
  schließt ihn. Es gibt keine zweite, versehentlich erreichbare Seite unter der App.
- Die HTML-Inhalte werden an alle Browser gleich ausgeliefert. Ohne JavaScript
  bleibt das native `details`-Element offen; die ganze Übersicht ist benutzbar.
  Es gibt keine nur für Suchmaschinen versteckte Linkliste.
- `/overview?stempel=114` öffnet HWN 114 direkt auf der Karte.
  `/overview?ansicht=karte` öffnet die Karte ohne Vorauswahl. Nur öffentliche
  Nummern aus dem gebauten Katalog werden in vorhandene App-IDs übersetzt.
- Alle 222 Stempelstellen-Artikel verlinken ihren eigenen Kartenpunkt. `/badges`
  verlinkt die Übersicht. Die Artikel behalten ihre bisherigen Titel-URLs.
- Der interne Expo-Export liegt weiterhin unter `/preview/overview/app/`.
  Er und die Testhülle `/preview/overview/` bleiben `noindex,follow` und außerhalb
  der Sitemap. Der echte App-Quellcode und seine Anmeldung werden nicht verändert.
- Dieser PR aktiviert kein Analytics-Skript und keinen neuen Messdienst.

## Vor dem Merge

1. Im Website-PR den vollständigen Pages-Check einschließlich Browsertests
   abwarten. Er kontrolliert die Canonicals und Kartenlinks aller 222 Artikel.
2. In den CI-Artefakten `overview-screenshots` insbesondere die Bilder mit dem
   Präfix `public-` ansehen: Liste Desktop/Mobil, Informationsbereich und
   vorausgewählte Stempelstelle auf der Karte.
3. In Search Console einen Ausgangsstand exportieren: 28 Tage, Suchtyp Web,
   Seitenfilter „Genaue URL“ auf
   `https://www.harzer-wander-buddy.de/overview`; zusätzlich Suchanfragen und
   Geräteansicht als CSV speichern. Dasselbe für die gesamte Domain tun.
   Der vorliegende Sieben-Tage-Screenshot zeigt 107 Klicks / 6.890 Impressionen
   insgesamt und 39 Klicks / 2.606 Impressionen für `/overview`.
4. Prüfen, dass Pages bereits „GitHub Actions“ als Quelle verwendet. Es gibt
   keinen neuen Hostinganbieter und keine neue Domain. Den Website-PR nach
   `main` mergen; kein zusätzlicher App-PR und kein App-Release sind erforderlich.

## Nach dem Merge

1. Den erfolgreichen Deployment-Job abwarten. `/overview` ohne Schrägstrich am
   Ende bleibt die kanonische Adresse; keine Weiterleitung in die Preview anlegen.
2. Auf einem echten Mobilgerät testen: Liste suchen, Karte öffnen, „Übersicht &
   FAQ“ öffnen/schließen, Tabelle und Links nutzen, Anmeldung aus der App starten.
3. `/stempelstelle-114-ramseck/` aufrufen und „HWN 114 auf der Karte ansehen“
   anklicken. Die Karte muss Ramseck auswählen, ohne Anmeldung zu verlangen.
4. Auch einen vorhandenen Abschnittslink testen, etwa
   `/overview#alle-222-hwn-stempelstellen-als-ubersichtstabelle`.
   Der Informationsbereich öffnet sich und zeigt die Tabelle.
5. In Search Console die URL-Prüfung für `/overview` öffnen, „Live-URL testen“
   und gerendertes HTML/Screenshot ansehen. Es muss eine indexierbare Seite
   mit Canonical `/overview` und den HTML-Artikelverweisen sein. Anschließend
   einmal die Indexierung der geänderten Seite beantragen. Die bestehende
   `/sitemap.xml` bleibt gültig; Preview-URLs nicht zur Indexierung einreichen.
6. Datum und Commit des Deployments notieren. Nach 7 Tagen nur offensichtliche
   Ausfälle prüfen; nach 28 Tagen belastbarer vergleichen. Google kann Titel
   und Snippets umschreiben; Rankings und CTR sind nicht garantiert.

## Erfolg messen, ohne einen neuen Browser-Tracker einzubauen

Search Console genügt für Such-Impressionen, Klicks, CTR, durchschnittliche
Position, Suchanfragen, Seiten und Gerätetypen. Ihre Nutzung erfordert keinen
Tracking-Code auf dieser Website und für sich keinen zusätzlichen Cookiebanner.
Sie misst keine App-Klicks, Registrierungen oder alle Besucher außerhalb von Google.

Für die Bewertung 28 Tage vor/nach dem Deployment vergleichen, getrennt für
`/overview` und die Artikel. Geräte und Suchanfragen prüfen, insbesondere
„hwn stempelstellen übersichtstabelle“, „harzer wandernadel stempelstellen karte“
und einzelne HWN-Nummern. Saisonalität, Wochenenden, Wetter und veränderte
Suchanfragen beachten. Durchschnittsposition und CTR nicht isoliert bewerten.

## Optional: Reichweite und Klicks ohne Analyse-Cookies

Empfehlung für eine zweite Stufe: einen auf Datenschutz ausgerichteten Dienst
wie Plausible mit geeigneter EU-Verarbeitung prüfen. Selbsthosting benötigt
einen zusätzlichen Server; GitHub Pages kann keinen Analytics-Collector betreiben.
GitHub stellt hier auch keinen frei auswertbaren Website-Zugriffslog bereit.

„Ohne Cookies“ bedeutet nicht automatisch „ohne Einwilligung“ oder „ohne
personenbezogene Daten“. § 25 TDDDG betrifft auch andere Zugriffe auf Endgeräte;
die DSGVO gilt daneben. IP-Adressen, User-Agent, daraus gebildete Kennungen,
Verarbeitung durch den Anbieter und Transfers sind zu berücksichtigen.
Cookiefreies GA4 oder serverseitiges Weiterleiten sind keine pauschale Befreiung.

Konkreter Ablauf, bevor ein Dienst aktiviert wird:

1. Anbieter und Hostingregion auswählen, Auftragsverarbeitung, Unterauftragnehmer,
   Transfergrundlagen, Aufbewahrung und Löschung prüfen. Bei Plausible die
   aktuelle Datenrichtlinie lesen; auch kurzlebige Hashes aus IP/User-Agent
   nicht ungeprüft als anonym behandeln.
2. Für die konkrete Konfiguration Rechtsgrundlage und gegebenenfalls Einwilligung
   prüfen. Falls berechtigtes Interesse tragfähig ist: Interessenabwägung,
   Datenschutzhinweis und Widerspruchsmöglichkeit dokumentieren. „Bannerfrei“
   nicht allein aus der Werbeaussage des Anbieters ableiten.
3. Die Datenschutzerklärung passend zur tatsächlichen Verarbeitung aktualisieren.
   Sie enthält derzeit generische Google-Analytics-Angaben, während das GA-Snippet
   im Template auskommentiert ist. Diese Angaben mit dem separaten Rechtstexte-PR
   abgleichen; ein neuer Messdienst ist damit noch nicht beschrieben.
4. Einen separaten, standardmäßig deaktivierten Integrations-PR erstellen. Im
   Dashboard als gemessene Seite nur `/overview` zählen; den iframe nicht als
   zusätzlichen Seitenbesuch zählen. Keine vollständigen Querystrings, Hashes,
   Suchtexte, Standortkoordinaten, Benutzer-IDs, E-Mails oder Auth-Daten senden.
5. Als Ereignisse reichen `overview_info_open`, `article_map_open`,
   `overview_map_open`, `stamp_article_open` und `login_start` mit höchstens
   der festen Herkunft `overview`/`article`/`badges`. Die App-Ereignisse erfordern
   einen kleinen, geprüften Hook im echten App-Code; nicht den iframe überwachen
   oder Suchbegriffe aus dem DOM auslesen.
6. Cookies, Local-/SessionStorage und Netzwerkrequests der Messintegration mit
   Browserwerkzeugen prüfen; technische App-Caches getrennt bewerten. Die
   Messung muss bei Blockierung ausfallen dürfen, ohne die App zu beeinträchtigen.

Ein `login_start` ist noch keine Registrierung. Abgeschlossene Registrierungen
können später im Backend aggregiert gezählt werden. Die Zuordnung einer
Registrierung zu einem Websitebesuch über Geräte/Sitzungen hinweg ist mit
diesem datensparsamen Ansatz bewusst nicht vorgesehen. Für den Anfang reichen
Suchklicks und aggregierte Interaktionszahlen; keine Nutzerprofile aufbauen.

Quellen:

- [Search Console: Leistungsbericht](https://support.google.com/webmasters/answer/7576553?hl=de)
- [Plausible: Datenrichtlinie](https://plausible.io/data-policy)
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)

## Rückweg bei Problemen

Bei einem roten Build wird nichts Neues veröffentlicht. Bei einem Fehler nach
der Veröffentlichung den Merge dieses PRs im Website-Repository revertieren
und den erfolgreichen Pages-Deploy abwarten. Dann ist `/overview` wieder die
bisherige HTML-Seite; Preview, Artikel-URLs und App-Build bleiben erhalten.
Keine Search-Console-Entfernung, keine Domainumstellung und keinen Redirect
auf die Preview verwenden.
