# Verificatie stap 5 — vaste kwaliteitscontrole

Datum: 25 oktober 2026. Robert heeft stap 5 en het herstellen van de twee bestaande layouttests geaccordeerd.

## Uitgevoerd

De standaardopdracht node tools/local.mjs quality is volledig uitgevoerd met exitcode 0: canonieke Docker-build uit de applicatiebron, eigen MariaDB-initialisatie, controles en opruimen van de testcontainers. De build gebruikte het vastgezette lockbestand en de bestaande pnpm-downloadcache; er is geen eerder gebouwd applicatie-image als basis gebruikt en dit was geen --no-cache-proef.

Daarna is node tools/local.mjs quality --skip-build eveneens met exitcode 0 uitgevoerd. Deze herhaling hergebruikte de zojuist gebouwde images, hetzelfde eigen volume en dezelfde externe configuratie. De SHA-256 van runtime.env was vóór en na die herhaling gelijk. Bestaand schema, accounts en wachtwoorden zijn bij opnieuw starten behouden.

Beide cycli gebruikten uitsluitend datagenerator-quality, loopback 127.0.0.2:19095 en volume datagenerator-quality_database114. Na afloop zijn de eigen containers en het netwerk verwijderd; het eigen volume en de externe configuratie blijven behouden. De instanties op 19090, 19091 en 19094 zijn niet vervangen. Productie, GitHub-repositoryinstellingen en publicatie zijn ongemoeid; geen commit of push uitgevoerd.

## Resultaten

| Controle | Resultaat |
| --- | --- |
| Onderhouden clientcode en JSON/CSV-generators linten | Geslaagd |
| Dependencybuild en localevalidatie | Geslaagd |
| Client-TypeScript en geoptimaliseerde productiefrontendbuild | Geslaagd |
| Volledige client-Jest-suite | 120 geslaagd, één bestaande lege test overgeslagen |
| Gebouwde generatie-/exportworkers | Zeven geslaagd |
| Isolatie en argumentafhandeling van de kwaliteitsroute | Drie geslaagd |
| Bestaande server-authenticatietests | Zes geslaagd |
| Login, opslaan/bijwerken/teruglezen, historie, eigendom, refresh, afmelden en geblokkeerde accounts via nginx | Geslaagd |
| Uitvoeren en exact teruglezen van MySQL-export op MariaDB | Geslaagd |
| Beheerdergestuurde accountaanmaak, tijdelijk wachtwoord en eigen wachtwoord | Geslaagd |
| GitHub-workflow-YAML, triggers, leesrechten, vaste actionrevisies en ingangspunt | Lokaal gecontroleerd |

Dezelfde client-, worker-, isolatie-, authenticatie-, SQL- en API-controles zijn tijdens de herhaalde cyclus opnieuw geslaagd. Lokale logs staan in outputs/step5-verification/quality.log en repeat.log, buiten Git.

## Herstelde bevindingen

- De twee layouttests verwachten nu de feitelijke standaard: horizontaal, daarna verticaal bij omschakelen en weer horizontaal bij nogmaals omschakelen. Het applicatiegedrag is hiervoor niet gewijzigd; de tests worden daadwerkelijk uitgevoerd.
- De helpdialoogtest kreeg het volledige taalbundle als coreI18n en initialiseerde de gedeelde taalcontext niet. Het fixture gebruikt nu de core-sectie en initialiseert de taal; de volledige clienttestsuite slaagt.
- De nieuwe workercontroles faalden eerst op JSON-escaping, een ontbrekende komma tussen compacte complexe JSON-batches en CSV-quotering. De generators zijn gecorrigeerd; de regressietests slagen nu met aanhalingstekens, backslashes, regeleinden, Unicode en bijzondere kolomnamen.
- De broncontrole maakt de noodzakelijke gegenereerde worker-typeverwijzing alleen aan wanneer die ontbreekt. Een eerste build heeft daardoor geen vooraf gegenereerd bronbestand nodig. De echte workerverwijzing wordt tijdens de normale frontendbuild aangemaakt en bij runtimecontroles behouden.

## Voorbereide CI en grenzen

.github/workflows/quality.yml gebruikt dezelfde lokale opdracht, Node 24 en een afzonderlijk CI-project. De repositoryrechten zijn alleen-lezen; checkout bewaart geen credentials. Actions zijn aan vaste commits gekoppeld. Er is geen deployment, publicatie of vereiste voor productiecredentials. Een echte run op GitHub is nog niet uitgevoerd: de eigen repository en publicatie horen bij latere, afzonderlijk te accorderen stappen.

De ene overgeslagen test is de al bestaande lege GridRow.container.test.tsx. Dit zijn geen uitgeschakelde layout- of fouttests. De workercontroles gebruiken de echte gebouwde scripts in een Node VM, geen geautomatiseerde browser. Alleen het MySQL/MariaDB-exportdoel is tegen een echte database uitgevoerd. De overige pluginpakketten en SQL-dialecten zijn hiermee niet volledig getest. Bestaande waarschuwingen over bundelgrootte, source maps en ts-jest-deprecatie zijn geen geslaagde audit van die onderwerpen.

Er zijn geen productieafhankelijkheden toegevoegd. De huidige actieve proefinstanties blijven op hun bestaande images; de exportcorrecties staan in de bron en de nieuwe kwaliteitsimages. Overname naar een actieve instantie is niet uitgevoerd.

Zie QUALITY.md voor het dagelijkse gebruik en de precieze dekkingsgrenzen. Eerstvolgende roadmapstap na beoordeling en akkoord: GitHub voorbereiden, nog niet publiceren.
