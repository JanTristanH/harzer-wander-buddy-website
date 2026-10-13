# Veröffentlichung der Website Rechtstexte

Stand: 13. Oktober 2026. Impressum und Website-Datenschutzerklärung sind auf Nordfpad Solutions – Tristan Heisecke und die bestätigte Infrastruktur angepasst. Dieser PR ist ein Entwurf, bis die Anbietervereinbarungen und die folgenden Betreiberangaben geprüft sind. Er deployt keine App-Funktionen und unterschreibt keine Verträge.

## Vor dem Merge

1. **Betreiberangaben prüfen.** Nordfpad Solutions ist das bestätigte Einzelunternehmen von Tristan Heisecke, Rotdornweg 12, 23683 Scharbeutz. In `_config.yml` `legal_vat_id`, `legal_business_id` und `legal_register` nur ausfüllen, wenn tatsächlich zugeteilt beziehungsweise eingetragen. § 5 DDG verlangt bei Vorliegen auch eine Wirtschafts-Identifikationsnummer. Die private Steuernummer wird nicht veröffentlicht. Bei journalistisch-redaktionellen Beiträgen die Benennung von Tristan Heisecke als verantwortliche Person nach § 18 Abs. 2 MStV bestätigen.
2. **Anbieter-Verträge prüfen und dokumentieren.** Für die Website sind GitHub Pages, STRATO (E-Mail), Formspree (Kontaktformular) und Tally (Warteliste) relevant. Ihre zum jeweiligen Konto gehörenden Vertragsparteien, AVV/DPA und einschlägigen Drittlandtransfer-Garantien dokumentieren. Zusätzliche Unterschriften sind nur erforderlich, wenn die passende Vereinbarung nicht bereits wirksam in die Konto-/Servicebedingungen einbezogen wurde. Nicht einfach die Existenz einer öffentlichen DPA-Seite als Abschlussnachweis verwenden. Den Abschnitt „Empfänger und internationale Übermittlungen“ in `_pages/privacy-policy.md` nach dieser Prüfung konkretisieren.
3. **Warteliste prüfen.** Im Tally-Dashboard für das Formular `wbYe7Z` feststellen, welche Angaben gesammelt werden. Eine klare freiwillige Einwilligung für die konkrete App-Benachrichtigung, einen Widerrufsweg und die Einwilligungsdokumentation sicherstellen. Das Laden des eingebetteten Formulars ist keine Einwilligung zum späteren E-Mail-Marketing. Zusätzliche Tracking-/Newsletterfunktionen nicht ungeprüft aktivieren.
4. **Löschung der Website-Daten organisieren.** Bei Widerruf einer Wartelistenanmeldung die Einträge in Tally und vorhandene Kopien löschen; bei erledigten Kontaktanfragen sowohl Formspree-Postfach als auch E-Mail-Kopien berücksichtigen. Aufbewahrung nach Zweckende beenden, soweit keine konkrete gesetzliche Pflicht oder erforderliche Rechtsverfolgung entgegensteht. Die Kriterien im Text sind keine automatisch eingerichtete Löschroutine.
5. **PR-Checks prüfen und mergen.** Die CI baut Jekyll mit Ruby 3.3 und prüft, dass Tally vor Freigabe nicht geladen wird und wieder geschlossen werden kann. Lokal: `node scripts/check-external-form.cjs`, danach mit einer zur Gemfile.lock passenden Ruby-Version `bundle install` und `JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter`. Das vorhandene macOS-System-Ruby 2.6 kann die aktuellen Lockfile-Abhängigkeiten nicht vollständig bauen; die CI verwendet deshalb Ruby 3.3.
6. **Nach dem Website-Deployment kontrollieren.** `/impressum`, `/privacy-policy`, `/contact` und `/app-waitlist` öffnen. Tally darf vor Klick auf „Wartelistenformular laden“ keine Verbindung herstellen; nach Klick erscheint das Formular, „Formular schließen“ entfernt es. Keine Testanmeldung oder Kontaktanfrage an echte Anbieter absenden, wenn hierfür keine Testumgebung vorgesehen ist.

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

## Quellen und konkrete Prüfeinstiege

- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) und [eingestellte OS-Plattform](https://consumer-redress.ec.europa.eu/site-relocation_en).
- [GitHub Pages und Besucher-IP-Adressen](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) sowie [GitHub Datenschutz](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
- [STRATO Datenschutz](https://www.strato.de/datenschutz/), [Formspree Datenschutz](https://formspree.io/legal/privacy-policy/) und [Formspree SCC-/Sicherheitsinformationen](https://formspree.io/security/).
- [Tally GDPR](https://tally.so/help/gdpr) erklärt die DPA-Einbeziehung für professionelle Nutzer über die Konto-Nutzungsbedingungen; [Tally-DPA](https://tally.so/help/data-processing-agreement) enthält Details.
- [Auth0-DPA beziehen](https://support.auth0.com/center/s/article/how-to-obtain-a-copy-of-the-auth0-data-processing-addendum-dpa), [Supabase-DPA](https://supabase.com/legal/customer-resources/data-processing-addendum) und [Google Cloud CDPA prüfen/gegebenenfalls annehmen](https://support.google.com/cloud/answer/6329727?hl=en). Google beschreibt einen zusätzlichen Opt-in nur, wenn das bestehende Abkommen den CDPA nicht bereits einbezieht.
- [Cloud Run Jobs mit Cloud Scheduler](https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule).
