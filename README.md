# harzer-wander-buddy-website
Harzer Wander Buddy Website

## Statische Gastansicht

Die öffentliche Karten-/Listenansicht unter `/overview` verwendet die echte
Expo-Webapp. GitHub Actions baut sie mit statischem CAP-Datenadapter zusammen
mit der Jekyll-Website. Neue freigegebene App-UI wird automatisch übernommen;
die bestehenden Titel-URLs der Stempelstellen bleiben erhalten. „Übersicht & FAQ“
öffnet Tabelle und Wanderinfos; die Vorschau bleibt unter `/preview/overview/`.

[Veröffentlichen, Search Console auswerten und datensparsame Messung vorbereiten](docs/public-overview-launch.md)

[Build, Datenaktualisierung und SEO-Umschaltung](docs/static-guest-overview.md)
· [Review und nächste Verbesserungen](docs/static-guest-overview-review.md)


## Used jeykell theme
[Memoirs](https://bootstrapstarter.com/jekyll-theme-memoirs/)

## Commands to run
- `gem install bundler`
- `bundle install`
- `bundle exec jekyll serve --watch`

## Compress images

[Using sqoosh app.](https://squoosh.app/editor)

## Colors

|usage|color hex|
|-----|-----|
| background current| #f4f4f4 |
| background | #e6e7dd |
| accent | #189726 |
|||
