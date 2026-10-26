# Datagenerator

Lokale doorontwikkeling van Ben Keens Generatedata voor realistische demonstratie- en testgegevens, met Nederlandse bediening en eigen uitbreidingen.

## Lokale installatie

De ontwikkelbron en de beheerroute van de drie lokale instanties staan op C:/Projects/datagenerator, buiten STACK. De gecontroleerde omschakeling behoudt accounts, datasets en dezelfde adressen. Zie [lokaal beheer en terugval](docs/LOCAL-CUTOVER.md).

Vereist: Node.js 24 en Docker met Linux-containers en een recente Compose-versie.

```powershell
node tools/local.mjs setup
node tools/local.mjs build
node tools/local.mjs up
node tools/local.mjs test
```

Open http://127.0.0.1:19091/nl/. De setup meldt de externe configuratiemap; `admin.json` daarin bevat de nieuwe lokale beheerdergegevens. Geen credentials of database uit een andere proef nodig. Gebruik deze browserhost om cookies gescheiden te houden van een eventuele oude localhost-proef.

[Installatie en dagelijks gebruik](docs/LOCAL-INSTALL.md) beschrijft configuratie, stoppen/starten en extra instanties. De zelfstandige route is getest vanuit een verse bronkopie zonder vooraf gemaakte applicatie-images. [Verificatie stap 2](docs/STEP2-VERIFICATION.md) beschrijft de precieze testgrenzen.

## Documentatie en bijdragen

- [PROJECT.md](PROJECT.md): actuele state, besluiten en eerstvolgende stap.
- [CONTRIBUTING.md](CONTRIBUTING.md): afspraken vóór commits, pushes en bijdragen.
- [AGENTS.md](AGENTS.md): instructies voor AI-assistenten.
- [docs/ROADMAP.md](docs/ROADMAP.md): afzonderlijk te accorderen stappen.
- [docs/UPSTREAM.md](docs/UPSTREAM.md): herkomst en lokale correcties.
- [docs/UPSTREAM-README.md](docs/UPSTREAM-README.md): oorspronkelijke introductie.

Gebruik voor dit project uitsluitend Dockerfile, compose.yaml en tools/local.mjs. De oude upstream prod-commando's en Dockerfiles onder tools zijn referentiemateriaal, geen alternatieve installatiehandleiding.

## Projectstatus

Stappen 1 tot en met 3 zijn uitgevoerd; gebruikersflow en kwaliteitscontrole van stappen 4 en 5 zijn afzonderlijk lokaal geverifieerd. De zelfstandige instantie heeft een eigen database en runtimeconfiguratie. De oudere proef blijft apart beschikbaar. MariaDB 11.4.13 en echte back-up/herstel zijn in afzonderlijke volumes getest. De actieve instantie op 19091 is na aanvullend akkoord naar 11.4.13 omgeschakeld; het oude volume en de laatste back-up zijn behouden. Productieovergang is niet uitgevoerd. Publicatie van de eigen correcties verloopt via een ontwikkelbranch en pull request op de Qndrs-fork.

## Techniek, herkomst en licentie

TypeScript-monorepo met React, Node.js/GraphQL, nginx en MariaDB. De Docker-build installeert pnpm 10.31.0 en gebruikt pnpm-lock.yaml. Publieke instellingen staan onder config/; echte runtime-secrets staan buiten de repository.

Upstream: https://github.com/benkeen/generatedata — tag `5.0.0-beta4`, commit `3cc52e0f10b4fa523e4369417667dfa94686f94d`. De meegeleverde [GPL-3.0-licentie](LICENSE) en auteursvermeldingen zijn behouden. Eigen fork: https://github.com/Qndrs/generatedata. Eigen correcties worden via een ontwikkelbranch en pull request aangeboden; de CI-status staat op GitHub.

[Databaseback-up en herstel](docs/DATABASE-RECOVERY.md) en [verificatie stap 3](docs/STEP3-VERIFICATION.md) beschrijven de nieuwe hulpmiddelen en de behouden actieve situatie.

[Actieve databaseomschakeling](docs/DATABASE-CUTOVER-2026-10-25.md) beschrijft uitvoering, tests en terugvalgrenzen.

[Gebruikersflow en herstel](docs/USER-FLOW.md) en [verificatie stap 4](docs/STEP4-VERIFICATION.md) beschrijven de lokale verbeteringen. De afzonderlijke stap-4-proef staat op http://127.0.0.2:19094/nl/; de hoofdinstantie op 19091 is hiervoor niet vervangen.

[Vaste kwaliteitscontrole](docs/QUALITY.md): voer node tools/local.mjs quality uit voor een afzonderlijke build en regressieproef. Deze route en de voorbereide GitHub Actions-workflow publiceren niets en vervangen geen bestaande instantie.

[GitHub-voorbereiding](docs/GITHUB-PREPARATION.md) beschrijft de gekoppelde Qndrs-fork en de gecontroleerde publicatiestap.
