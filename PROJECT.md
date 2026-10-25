# Project: Datagenerator

## Doel en status

Status: actief. Realistische synthetische demonstratie- en testgegevens met Nederlandse bediening en eigen uitbreidingen. Robert is opdrachtgever/beheerder; Codex ondersteunt namens Robert.

Ontwikkelbron en beheerroute: C:/Projects/datagenerator, buiten STACK. Repository: https://github.com/Qndrs/generatedata. Pull request #1 is samengevoegd naar master; de lokale herstelbranch is codex/stack-recovery. Publicatie van nieuwe wijzigingen vraagt afzonderlijke opdracht.

## Huidige operationele state

- De drie lokale instanties op 19090, 19091 en 19094 draaien gecontroleerd vanuit de schone bron. Accounts, passwordhashes, rollen, accountstatus, datasets, historie en instellingen zijn behouden.
- Iedere instantie heeft een nieuw eigen volume met dezelfde database-engineversie. De hoofdinstantie en gebruikersflowproef gebruiken MariaDB 11.4.13; de oudere proef behoudt 10.5.8. Geen engine-upgrade uitgevoerd.
- Laatste bevroren back-ups, oorspronkelijke volumes en vastgezette images blijven als terugvalpunten bewaard. JWT-secrets en adressen zijn behouden; alle negen draaiende services zijn gezond.
- De oude bronmappen op D: blijven bewijs/historische referentie. De D:-synchronisatie in STACK is gepauzeerd. Productie is niet benaderd of gewijzigd.
- Runtimeconfiguraties en vertrouwelijk bewijs staan buiten Git. Beheer en terugval: [LOCAL-CUTOVER.md](docs/LOCAL-CUTOVER.md).

## Architectuur en blijvende besluiten

- Generatedata 5.0.0-beta4, upstreambasis 3cc52e0f10b4fa523e4369417667dfa94686f94d; volledige upstreamgeschiedenis, GPL-licentie en auteursvermeldingen behouden.
- Node 24, pnpm 10.31.0, TypeScript/React, GraphQL, nginx en MariaDB. Canonieke route: Dockerfile, compose.yaml en tools/local.mjs. /graphql gebruikt dezelfde origin; API/database hebben geen publieke hostpoorten.
- Publieke instellingen staan onder config/. Runtimegeheimen en datavolumes blijven buiten de repository. De API gebruikt de database-appgebruiker gdapp en krijgt geen database-rootwachtwoord.
- Accounts blijven beheerdergestuurd; geen zelfregistratie of ingerichte e-mail-/wachtwoordherstelworkflow. Lokale secrets niet regenereren voor te behouden data.
- Synthetische e-mailadressen moeten geloofwaardig ogen met bewust ongeldige domeinen. Betere voorbeelddata en nieuwe generatorfuncties zijn later werk.
- Actieve Git-repositories staan buiten bidirectionele bestandssynchronisatie. Origin is de Qndrs-fork; upstream is bronreferentie en tegen pushen afgeschermd.

## Verificatie

- Volledige kwaliteitsroute van de schone bron slaagt: lint, types, productiebuild, 124 clienttests, twintig servertests, tien worker-/isolatiechecks en echte API-/account-/SQL-exportproeven. Eén bestaande lege clienttest is overgeslagen.
- Alle drie actieve instanties hebben na afzonderlijk akkoord een exacte restorevergelijking en echte login-/opslag-/historie-/sessieproeven doorstaan. Bij vergelijking ná de proef zijn alleen verwachte accountvelden last_updated, last_logged_in en refresh_token uitgezonderd.
- De oorspronkelijke lokale databaseherstelproeven en inhoudsdigests blijven vastgelegd in de bestaande verificatiedocumenten. Geen volledige securityaudit of belastingtest geclaimd.
- De live terugvalprocedure is voorbereid, maar na succesvolle omschakeling niet opnieuw op de actieve instanties uitgevoerd.

## STACK-herstel: actuele stand

- Elf foutieve RENAME/Up-verplaatsingen zijn met overeenstemmende cloud-ID's in logs en het gekopieerde journal bevestigd. De verkeerde verplaatsingsherkenning is bewezen; hergebruikte NTFS-mapnummers zonder generatiebits zijn de sterk onderbouwde technische reconstructie van de trigger.
- Herstelstappen 1–4 zijn uitgevoerd: D: pauzeren, bewijs/back-ups veiligstellen, schone clone en gecontroleerde lokale omschakeling.
- Herstelstap 5 levert nu een lokaal onderbouwd dossier per verplaatsing en een bestandscatalogus. Op verzoek is de actuele cloud niet live gecontroleerd. Een terugverplaatsing van complete vermengde mappen is niet vrijgegeven.
- Het vertrouwelijke hersteloverzicht en de bronbewijzen staan buiten Git onder %LOCALAPPDATA%/Qndrs/DatageneratorRecovery/step5-reconstruction-20261026-004010. Alleen de technische samenvatting wordt in deze repository opgenomen.

## Eerstvolgende stap

Eerst de actuele cloudpaden, prullenbak en eventuele versies alleen-lezen vergelijken met het hersteloverzicht. Daarna een concrete herstelset en conflictlijst laten accorderen vóór enige cloudwijziging. D: blijft gepauzeerd.

## Documentatie

[Lokale installatie](docs/LOCAL-INSTALL.md), [kwaliteit](docs/QUALITY.md), [STACK-herstel](docs/STACK-RECOVERY.md), [lokale omschakeling](docs/LOCAL-CUTOVER.md), [databaseherstel](docs/DATABASE-RECOVERY.md), [PR-review](docs/PR-REVIEW.md) en [upstreamherkomst](docs/UPSTREAM.md).

De historische GitHub-voorbereidingsnotitie beschrijft de fase vóór publicatie; vermeldingen van toen aangetroffen lokale bestanden bewijzen geen opname in Git.
