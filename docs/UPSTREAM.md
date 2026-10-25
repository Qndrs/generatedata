# Upstream en lokale wijzigingen

Bron: https://github.com/benkeen/generatedata, tag 5.0.0-beta4, commit 3cc52e0f10b4fa523e4369417667dfa94686f94d. De volledige upstreamgeschiedenis, tag, LICENSE en auteursvermeldingen zijn behouden. Remote upstream bevat de publieke bron-URL; pushen naar upstream is bewust geblokkeerd. Origin verwijst naar de publieke fork https://github.com/Qndrs/generatedata; de eigen correcties worden via een ontwikkelbranch en pull request op deze fork aangeboden.

## Overgenomen bronwijzigingen

- apps/client/src/core/apolloClient.ts: /graphql via dezelfde weborigin.
- apps/client/src/store/main/main.actions.ts: serverlogout vóór cookie-/cacheopschoning.
- apps/server/src/schema/auth/resolvers/Mutation/login.ts: accountstatuscontrole.
- apps/server/src/schema/auth/resolvers/Mutation/refreshToken.ts: accountstatus en verlopen accounts controleren.
- apps/server/src/schema/auth/resolvers/Mutation/logout.ts: intrekking opslaan vóór antwoord.
- apps/server/src/schema/dataSets/resolvers/Query/dataSetHistory.ts: telling uit het juiste rijobject lezen.
- packages/i18n-core/locales/nl.json: 84 Nederlandse kernlabels.
- packages/plugins/src/dataTypes/IBAN/i18n/nl.json: correcte IBAN-benaming.
- packages/plugins/src/exportTypes/{CSV,JSON,SQL}/i18n/nl.json: exportlabels.

## Overgenomen bouwcorrecties

De Dockerfiles onder tools leggen Node 24/pnpm 10.31.0, beschikbaarstelling van ontbrekende Node-typedefinities en verwijdering van een overbodige TypeScript-directive vast. De lokale-fixesroute gebruikt een eerder lokaal gebouwd beta4-image. Dit is een bekende afhankelijkheid voor stap 2, geen afgeronde schone bouwroute.

## Bestaande verificatie

In de eerdere lokale proef slaagden build/lint, behoud van vertalingssleutels/invulplaatsen, zes authenticatietests en integratiecontroles voor echte login, opslag/wijziging/teruglezen, historie, sessierotatie, logout en datasetisolatie. De browserproef slaagde met opslaan, opnieuw inloggen en terugladen van een gewijzigde dataset. Geen productiedata gebruikt.

Stap 1 herhaalt deze runtimechecks niet: bronintegriteit en projectgrenzen worden gecontroleerd. Nieuwe runtimechecks volgen pas na akkoord op stap 2. Ruwe logs, screenshots, databases en credentials uit de oude proef worden niet onderdeel van deze repository.

## Zelfstandige installatie na stap 2

Dockerfile, compose.yaml, config/ en tools/local.mjs vervangen de eerdere image-overlays als canonieke bouwroute. De ontbrekende typedefinities blijven expliciet in Docker beschikbaar gemaakt; de overbodige @ts-expect-error is nu direct uit apps/server/src/app.ts verwijderd. Runtime-database-initialisatie gebruikt het schema-template zonder oude voorbeeldgebruiker en zonder een vooraf gebouwde SQL-export. Zie LOCAL-INSTALL.md en STEP2-VERIFICATION.md.
