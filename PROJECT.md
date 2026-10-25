# Project: Datagenerator

## Doel, status en stakeholders

Status: actief. Realistische synthetische demonstratie- en testgegevens genereren met Nederlandse bediening en eigen uitbreidingen. Robert is opdrachtgever/beheerder; Codex ondersteunt namens Robert.

Locatie: D:\_qndrs\datagenerator. Stappen 1 tot en met 3 zijn geaccordeerd en uitgevoerd. Stappen 4 en 5 zijn geaccordeerd en afzonderlijk lokaal uitgevoerd. Elke volgende roadmapstap vraagt afzonderlijk akkoord.

## Scope

Zelfstandige applicatieontwikkeling, lokale configuratie, tests en voorbereiding van GitHub-publicatie. Stap 3 heeft afzonderlijke database- en herstelproeven toegevoegd. De actieve lokale databaseomschakeling is daarna afzonderlijk geaccordeerd en uitgevoerd. Stap 4 heeft daarna de foutafhandeling en gebruikersflow verbeterd in een afzonderlijke lokale instantie. Stap 5 voegde een herhaalbare kwaliteitsroute, exportregressies en een voorbereide CI-workflow toe. Stap 7 is expliciet geaccordeerd: publicatie via de ontwikkelbranch en een pull request op de Qndrs-fork. Geen productieverbinding of nieuwe generatorfuncties; samenvoegen en deployment vallen buiten deze opdracht.

## Architectuur en besluiten

- Basis: Generatedata 5.0.0-beta4, upstreamcommit 3cc52e0f10b4fa523e4369417667dfa94686f94d. Volledige upstreamgeschiedenis en lokale branch codex/project-bootstrap behouden; origin verwijst naar de publieke fork Qndrs/generatedata. Eigen wijzigingen worden via codex/project-bootstrap en een pull request tegen master gepubliceerd.
- Node 24, pnpm 10.31.0, TypeScript/React, GraphQL, nginx en MariaDB. apps/client en apps/server, gedeelde onderdelen onder packages.
- Canonieke lokale route: Dockerfile, compose.yaml en tools/local.mjs. Build gebruikt officiële basisimages en het lockbestand, geen oude applicatie-images.
- Publieke instellingen onder config/; runtime-secrets en admin.json buiten de repository. Loginmodus en Nederlandse interface. /graphql via dezelfde origin; database/API alleen intern.
- Standaardinstantie datagenerator-dev op http://127.0.0.1:19091/nl/, met eigen named volume. 127.0.0.1 houdt cookies gescheiden van de oude localhost-proef op 19090, die niet is omgeschakeld.
- Database-appgebruiker gdapp; API krijgt geen database-rootwachtwoord. Initialisatie gebruikt alleen een lege database; bestaande accounts en wachtwoorden worden behouden.
- Synthetische e-mailadressen moeten geloofwaardig ogen met bewust ongeldige domeinen; betere voorbeelddata is later werk.

## Huidige state en verificatie

- Elf broncorrecties uit de oorspronkelijke proef behouden, waaronder vertalingen, same-origin API, sessies/accountstatus en datasetgeschiedenis. De overbodige TypeScript-directive is nu in de bron verwijderd.
- Schone lokale clone met expliciete overlay van de huidige ongecommitteerde projectbestanden gebouwd met --no-cache. Geen node_modules, echte configuraties, oude database of vooraf gemaakt applicatie-image overgenomen.
- Build/lint geslaagd. Geautomatiseerde login-/dataset-/historie-/sessie-/isolatietests en zes upstream-authenticatietests geslaagd op de nieuwe instantie.
- Setup tweemaal uitgevoerd met identieke runtimeconfiguratie. Nieuwe containers/netwerk verwijderd en opnieuw aangemaakt zonder volumeverwijdering: dataset- en historie-digest identiek gebleven; init behield bestaande accounts.
- Nieuwe beheerder na deze herstart in de browser aangemeld; JSON-naamgeneratie, opslaan en heropenen van `Zelfstandige installatie` geslaagd. Nieuwe tab is ingelogd achtergelaten. Bestaande proef op 19090 bleef actief.
- Details en beperkingen: docs/STEP2-VERIFICATION.md. Installatie/credentiallocatie: docs/LOCAL-INSTALL.md.

## Risico's en open punten

- Bètabasis; geen volledige securityaudit of belastingtest; de CI-workflow controleert de ontwikkelbranch op GitHub; de actuele uitvoeringsstatus staat bij de pull request. API-image bevat vooralsnog ook builddependencies.
- MariaDB 11.4.13 LTS is afzonderlijk getest, inclusief echt herstel en alle applicatiecontroles. De actieve hoofdinstantie draait na aanvullend akkoord op 11.4.13 met een nieuw volume; het oude 10.5-volume en de laatste back-up zijn behouden.
- E-mail/wachtwoordherstel is lokaal niet ingericht. Lokale configuratie mag niet worden geregenereerd bij een te behouden volume.
- Qndrs/generatedata is de gekozen publieke fork van benkeen/generatedata; toegang en gemeenschappelijke basis zijn geverifieerd. Publicatie van de gecontroleerde wijzigingen verloopt via een ontwikkelbranch en pull request.

## Eerstvolgende stap

De pull request op Qndrs/generatedata beoordelen na geslaagde GitHub-CI. Geen automatische merge, overname van actieve instanties of productiehandeling.

## Centrale context

WORKING-AGREEMENTS.md, standards/DOCUMENTATION.md en standards/SHARED_GIT_COLLABORATION.md onder ROBERT_AI_HOME. Lokale afspraken zijn zelfstandig leesbaar.

## Verificatie en besluiten stap 3

- Accounts blijven voorlopig beheerdergestuurd; geen zelfregistratie of e-mailworkflow toegevoegd.
- 10.5 → 11.4 en 11.4 → nieuw 11.4-volume logisch hersteld; volledige inhoudsdigests voor accounts, datasets, historie en settings gelijk. Login/opslag/sessies/isolatie en zes authenticatietests slagen op beide herstelde kopieën.
- Beschadigde dump, niet-leeg doel en bestaand gestopt volume worden geweigerd; de bijbehorende beveiligingen zijn getest. Tools en werkwijze staan in docs/DATABASE-RECOVERY.md; bewijs in docs/STEP3-VERIFICATION.md.
- Hersteltestcontainers gestopt met behoud van hun volumes en externe back-ups. De actieve hoofdinstantie en oude proef blijven beschikbaar.
- De automatische goedkeuringscontrole wees de voorgenomen omschakeling van de actieve hoofdinstantie af omdat het akkoord alleen test/herstel expliciet dekte. Robert heeft daarna expliciet akkoord gegeven; de omschakeling is inmiddels uitgevoerd met behoud van het oude volume en de laatste back-up.

## Actieve omschakeling na expliciet akkoord

- Actieve database: MariaDB 11.4.13, volume datagenerator-dev_database114, op dezelfde lokale URL 19091. Oude volume datagenerator-dev_database en originele logische back-up blijven behouden.
- Volledige inhoudsdigests vóór de applicatietests gelijk aan de laatste bevroren bron. Applicatie-/sessie-/isolatietests en zes authenticatietests slagen; browseraanmelding en bestaande dataset bevestigd na herladen.
- Rapport en terugvalgrenzen: docs/DATABASE-CUTOVER-2026-10-25.md. Geen productie of GitHub gewijzigd; stap 4 is daarna afzonderlijk geaccordeerd.

## Gebruikersflow stap 4

- Afzonderlijke proef op 127.0.0.2:19094, eigen configuratie/volume; hoofdinstantie 19091 en oude proef 19090 behouden.
- Duidelijke foutmeldingen, begrensde API-verzoeken, dubbele opslag voorkomen, concepten behouden bij sessieverloop en waarschuwingen vóór verwerpen. Beheerdergestuurde accounts en eerlijk handmatig wachtwoordherstel; geen mailvoorziening toegevoegd.
- Lint, TypeScript, productiefrontendbuild, 20 gerichte fouttests, API-opslag-/sessiecontroles, accountonboarding en zes authenticatietests slagen. Echte API-uitval en sessieherstel ook in de browser geverifieerd.
- De twee toen bestaande falende layouttests zijn in stap 5 hersteld; de volledige clienttestsuite slaagt nu. Details en testgrenzen: docs/STEP4-VERIFICATION.md; gebruikersafspraken: docs/USER-FLOW.md.

## Vaste kwaliteitscontrole stap 5

- Eén route: node tools/local.mjs quality, met eigen configuratie, volume en Compose-project; bestaande instanties worden niet overgenomen. De standaardcyclus en een herhaling met bewaarde configuratie/database slagen, inclusief opruimen van de eigen testcontainers.
- Volledige clienttestsuite: 120 geslaagd; één bestaande lege test overgeslagen. De layouttests en een onvolledig helpdialoogfixture zijn hersteld. Gebouwde worker-/exportcontroles, isolatiecontroles, authenticatie en echte API-/account-/SQL-proeven slagen.
- JSON-escaping, compacte JSON-batchscheiding en CSV-quotering gecorrigeerd na falende regressietests; geen nieuwe productieafhankelijkheid.
- GitHub Actions lokaal voorbereid met dezelfde opdracht, vaste actionrevisies en leesrechten; nog niet gepubliceerd of op GitHub gedraaid. Gebruik: docs/QUALITY.md; bewijs en grenzen: docs/STEP5-VERIFICATION.md.

## GitHub-voorbereiding stap 6

- Door Robert aangewezen publieke fork Qndrs/generatedata geverifieerd; lees-/schrijf-/beheertoegang en ingeschakelde Actions bevestigd. Origin lokaal gekoppeld; upstream blijft tegen pushen afgeschermd. Volledige upstreamgeschiedenis beschikbaar, werkbranch en wijzigingen behouden.
- Geen eigen commit, push, PR of merge uitgevoerd. Plan en grenzen: docs/GITHUB-PREPARATION.md; publiceren en echte GitHub-CI volgen pas na akkoord op stap 7.

## Publicatie stap 7

- Robert heeft publicatie via een ontwikkelbranch en pull request en verificatie van GitHub-CI expliciet geaccordeerd. Branch: codex/project-bootstrap; doelbranch: master van Qndrs/generatedata.
- Publicatiemanifest vóór de commit opnieuw gecontroleerd; alleen de bedoelde bron, configuratieprofielen, tests en documentatie worden opgenomen. Privécredentials en lokale uitvoer blijven uitgesloten; commitidentiteit gebruikt GitHub-noreply.
- Actuele review en CI-status: https://github.com/Qndrs/generatedata/pulls en https://github.com/Qndrs/generatedata/actions/workflows/quality.yml. Geen merge, deployment of productieverbinding onderdeel van deze publicatiestap.
