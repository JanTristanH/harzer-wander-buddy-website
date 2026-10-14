# Website: Veröffentlichung und Anbietervereinbarungen

Stand: 14. Oktober 2026. Website und App sind getrennte Projekte. Die Website verlinkt jetzt auf die verfügbare Web-App. Dieser PR deployt keine App-Funktionen und schließt keine Anbietervereinbarungen ab.

## Erledigt im Website-PR

- Betreiber: Nordfpad Solutions – Tristan Heisecke, Einzelunternehmen, Rotdornweg 12, 23683 Scharbeutz.
- USt-ID **DE462683424**, aus dem vom Betreiber bereitgestellten Zuteilungsschreiben übernommen. Keine separate behördliche Validierung behauptet.
- Impressum auf § 5 DDG umgestellt; veraltete TMG-/OS-Plattform-Texte entfernt.
- Website-Datenschutz getrennt von App-Datenschutz beschrieben.
- Tally-Einbettung und Wartelistenwerbung entfernt. Navigation, Footer, Autorenbeschreibung, Stempelübersicht und Share-Fallback verlinken auf https://app.harzer-wander-buddy.de.
- Produktseite unter /app; alte URL /app-waitlist führt zur Web-App weiter.
- Jekyll-Ausschlussliste zusammengeführt, damit docs und scripts nicht veröffentlicht werden.

## Recherche: bestätigt und noch kontobezogen zu prüfen

### STRATO: Domain und E-Mail

STRATO bestätigt die automatische AVV-Einbeziehung für Verträge ab **18.07.2022**. Bei älteren Verträgen kann die AVV im Kundenlogin abgeschlossen werden. Bestellbestätigung/Vertragsdatum prüfen und die geltende AVV archivieren. Für ein älteres Konto ohne AVV im Kundenlogin unter Kundendaten/Kontoinformation → Auftragsverarbeitung abschließen. Keine Hosting-Protokollfrist von STRATO auf GitHub Pages übertragen.

Quellen: [STRATO AVV-FAQ](https://www.strato.de/faq/vertrag/fragen-zur-auftragsverarbeitungsvertrag-avv-und-der-neuen-eu-datenschutzgrundverordnung-dsgvo/), [AVV](https://www.strato.de/agb/avv/).

### GitHub Pages

GitHub bestätigt das Protokollieren der Besucher-IP für Sicherheitszwecke. Die Datenschutzerklärung beschreibt internationale Verarbeitung, EU-US Data Privacy Framework und Standardvertragsklauseln. Der veröffentlichte DPA bildet einen Teil des GitHub Customer Agreement; daraus lässt sich ohne Konto-/Vertragsunterlagen keine pauschale Einbeziehung für dieses persönliche Pages-Konto bestätigen. GitHub unterscheidet eigene Verantwortlichkeit und Auftragsverarbeitung je nach Zweck.

Den für das Konto geltenden Vertrag archivieren und, soweit GitHub für die konkrete Pages-Verarbeitung Auftragsverarbeiter ist, die anwendbare DPA-Einbeziehung prüfen; bei Unklarheit GitHub Support um schriftliche Bestätigung für dieses Konto und GitHub Pages bitten. Öffentliches DPA-Dokument und DPF-Teilnahme sind keine gleichbedeutenden Nachweise.

Quellen: [Pages und Besucher-IP](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [GitHub Datenschutz](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement), [GitHub DPA](https://github.com/customer-terms/github-data-protection-agreement).

### Formspree: verbleibendes Kontaktformular

Formspree bestätigt Hosting bei AWS in den USA und die Verwendung von SCC als Auftragsverarbeiter. Die öffentlichen Nutzungsbedingungen beschreiben außerdem eigene Verantwortlichkeit; sie erlauben allein keine eindeutige Bestätigung einer für dieses Konto geltenden AVV einschließlich ausgefüllter SCC-Anlagen. Deshalb bleibt der Nachweis kontobezogen offen.

Im Konto nach DPA/AVV und SCC suchen und gültige Dokumente sichern. Falls nicht verfügbar, Formspree Support um die für das konkrete Konto geltende Vereinbarung und Rollenklärung bitten. Vor Veröffentlichung klären; eine Alternative ohne Formspree wäre eine reine Kontaktseite mit E-Mail-Link. Das Kontaktformular bleibt in diesem PR erhalten.

Quellen: [Sicherheit/SCC](https://formspree.io/security/), [Nutzungsbedingungen](https://formspree.io/legal/terms-of-service/), [Datenschutz](https://formspree.io/legal/privacy-policy/).

### Ehemalige Tally-Warteliste

Es werden über die Website keine neuen Tally-Anmeldungen mehr erhoben. Bereits gespeicherte Anmeldungen bleiben jedoch bei Tally und gegebenenfalls im E-Mail-Postfach, bis der Betreiber sie löscht. Formular wbYe7Z im Tally-Konto schließen, eingebettete und direkte Anmeldung deaktivieren und Daten/Kopien nach Zweckende löschen, soweit keine konkrete Aufbewahrungspflicht besteht. Keine automatische Kontolöschung durch diesen PR.

## Deine Reihenfolge für die Website

1. STRATO-Vertragsdatum/AVV nachsehen; GitHub-/Formspree-Unterlagen wie oben sichern und verbleibende Vertragsfragen klären.
2. Alte Tally-Warteliste schließen und nicht mehr benötigte Einträge/Kopien löschen. Erledigte Kontaktanfragen auch in Formspree und E-Mail-Postfach löschen.
3. Betreiberangaben und gegebenenfalls separat zugeteilte Wirtschafts-ID/Registereintrag prüfen. Eine USt-ID ist kein Nachweis einer Wirtschafts-ID. Tristan Heisecke als redaktionell verantwortliche Person für die Beiträge bestätigen.
4. Grüne CI prüfen, PR mergen und GitHub-Pages-Deployment abwarten.
5. /impressum, /privacy-policy, /contact, /app und /app-waitlist sowie Navigation, Footer und Share-Links kontrollieren. App-Links müssen zur produktiven Web-App führen; keine Verbindung zu Tally soll entstehen.

Prüfungen: `node scripts/check-website-release.cjs` und mit passender Ruby-/Bundler-Version `JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter`. Die CI nutzt Ruby 3.3.

## Danach die App veröffentlichen

Die bereits im App-Repository vorbereiteten Änderungen benötigen ein separates App-/Backend-Deployment:

1. AVV/DPA und Transfergarantien bei Auth0/Okta, Supabase und Google Cloud prüfen; `LEGAL_TRANSFER_DETAILS` im Backend entsprechend vervollständigen. Auth0 US-4 liegt in den USA, Supabase eu-west-2 in London (Vereinigtes Königreich), Cloud Run europe-west1 in Belgien.
2. Das App-Datenbankschema mit den neuen Lösch-, Melde- und Blockierungstabellen regulär migrieren. Auth0-M2M-Anwendung mit `delete:users` und serverseitigen Zugangsdaten einrichten. Vollständige Auth0-Nutzerlöschung nur für einen dafür geeigneten/dedizierten Tenant aktivieren, damit keine Konten anderer Anwendungen betroffen sind.
3. Den vorbereiteten Einstieg `util/runAccountDeletionJob.js` als Cloud Run Job in europe-west1 deployen und über Cloud Scheduler, zum Beispiel alle fünf Minuten, ausführen lassen. Gleiche migrierte Datenbank und Server-Secrets verwenden. Job-Fehler/überfällige Warteschlangeneinträge überwachen. Die erfolgreiche Einrichtung mit `ACCOUNT_DELETION_SCHEDULER_CONFIRMED=true` bestätigen. Der Timer im Webserver allein ist bei anfragebasierter CPU-Zuteilung/Skalierung auf null kein verlässlicher Scheduler.
4. `MOBILE_CORS_ORIGINS` auf die produktiven Web-Ursprünge setzen, `npm run check:legal-release --prefix backend/hwb` ausführen und mit einem isolierten produktionsnahen Testkonto Export, Kontolöschung und Provider-Wiederholung testen.
5. Nach erfolgreichem Deployment die öffentlichen URLs prüfen. Anschließend in diesem Website-Repository `_config.yml` setzen:

   ```yaml
   app_privacy_url: 'https://app.harzer-wander-buddy.de/legal/datenschutz'
   app_account_deletion_url: 'https://app.harzer-wander-buddy.de/legal/konto-loeschen'
   ```

   Die URLs bleiben bis dahin leer, damit dieser Website-PR keine noch nicht bereitgestellten API-Seiten verlinkt.

6. Native Release-Builds mit den reduzierten Berechtigungen erstellen. Datenschutz-URL, Google-Play-Lösch-URL, Data Safety/Apple Privacy Labels, EU-Händlerstatus und Review-Testzugang in den Store-Konsolen vervollständigen. Falls Sign in with Apple angeboten wird, dessen Tokenwiderruf bei Löschung gesondert implementieren. Eine erfolgreiche Website-Veröffentlichung ersetzt diese Store-Schritte nicht.


## Rechtliche Quellen

- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html)
- [Eingestellte OS-Plattform](https://consumer-redress.ec.europa.eu/site-relocation_en)
- [Auth0-DPA](https://support.auth0.com/center/s/article/how-to-obtain-a-copy-of-the-auth0-data-processing-addendum-dpa), [Supabase-DPA](https://supabase.com/legal/customer-resources/data-processing-addendum), [Google Cloud CDPA](https://support.google.com/cloud/answer/6329727?hl=en)
- [Cloud Run Jobs mit Cloud Scheduler](https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule)
