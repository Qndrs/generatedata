# Stap 3: databasecompatibiliteit en herstel — 2026-10-25

## Resultaat

MariaDB 11.4.13 LTS is compatibel bevonden met de huidige applicatie in de uitgevoerde lokale proeven. Twee echte logische herstelproeven zijn uitgevoerd, zonder fysieke databasebestanden tussen majorversies te delen:

1. MariaDB 10.5.8 → afzonderlijk leeg MariaDB 11.4.13-volume: 3 accounts, 2 datasets, 3 historieversies en 0 settings. Alle kolommen, inclusief accounthashes en sessievelden, hadden identieke inhoudsdigests vóór applicatietests.
2. Back-up gemaakt op 11.4.13 → tweede leeg 11.4.13-volume: 3 accounts, 3 datasets, 5 historieversies en 0 settings. De volledige inhoudscontrole slaagde opnieuw.

Na beide herstelproeven slaagden de login-/opslag-/historie-/sessie-/isolatiecontroles en de zes upstream-authenticatietests. Deze tests voegen eigen fictieve controledatasets toe, waardoor de aantallen na tests hoger kunnen zijn dan de herstelde momentopname.

## Herstelbeveiliging

- Een gemuteerde SQL-dump met niet-passende SHA-256 werd vóór databasehandelingen geweigerd.
- Herstel naar een niet-lege testdatabase werd geweigerd; volledige inhoudsdigests waren vóór/na identiek.
- De definitieve preflightcontrole tegen niet-lege doelen is opnieuw getest en slaagde.
- Herstel met een bestaand gestopt testvolume werd geweigerd zonder de database te starten.
- Node-syntaxcontrole en git diff --check slagen. Er zijn geen applicatieafhankelijkheden toegevoegd en geen productie- of GitHub-mutaties uitgevoerd.

## Isolatie en runtime vóór het aanvullende omschakelakkoord

De herstelinstanties datagenerator-restore-step3 en datagenerator-recovery-step3 gebruikten eigen volumes en poorten 19092/19093. Ze zijn na de tests gestopt; hun volumes en externe back-ups blijven behouden. De bestaande proef op 19090 is niet gewijzigd.

De actieve hoofdinstantie op 19091 is niet naar 11.4 omgeschakeld. De daadwerkelijk gelezen versie bleef `10.5.8-MariaDB-1:10.5.8+maria~focal`, met het oorspronkelijke volume datagenerator-dev_database. Het bestaande profiel is expliciet op die image/volumecombinatie gezet zodat het nieuwe Compose-standaardprofiel niet ongemerkt een majorupgrade uitvoert.

Een voorgenomen actieve omschakeling is vóór uitvoering door de automatische goedkeuringscontrole afgewezen: het akkoord op stap 3 autoriseerde testen/herstellen, niet expliciet het vervangen van de actieve hoofdinstantie. Die actie blijft wachten op afzonderlijk akkoord. Geen omweg of indirecte omschakeling uitgevoerd.

## Bestanden en bewijs

- tools/database.mjs en tools/local.mjs: handmatige backup, restore en snapshot.
- compose.yaml: gepinde 11.4.13-standaard voor nieuwe instanties en expliciete volumeparameter.
- Externe back-upbundels onder de configuratiemappen van de broninstanties. De lokale padverwijzingen staan buiten Git in de hoofdconfiguratiemap; credentials en SQL-dumps zijn niet naar de repository gekopieerd.
- Genegeerde lokale logs: backup-step3.log, restore-step3.log, backup-step3-114.log, restore-step3-114.log, test-step3-restored.log, test-step3-recovery.log, guard3-*.log en restore-step3-checksum-refused.log.

De backupscripts pauzeren de betreffende lokale web/API kort voor een consistente vergelijking. Dit zijn kleine lokale datasets, geen belastingtest of productieherstelgarantie. Offsiteopslag, encryptie en retentie zijn nog niet ingericht.

## Besluit en vervolg

Robert maakt voorlopig accounts handmatig aan als beheerder; loginmodus blijft gehandhaafd en zelfregistratie is niet ingeschakeld. E-mailverzending/wachtwoordherstel blijven buiten stap 3.

De compatibiliteits- en hersteltest van stap 3 is afgerond. Beslis apart over omschakeling van de actieve lokale instantie; daarna kan Robert stap 4 accorderen. Zie DATABASE-RECOVERY.md voor de concrete vervolgaanpak.

## Bronnen

- https://mariadb.org/about/
- https://mariadb.org/mariadb-server-12-3-11-8-11-4-and-10-11-q3-2026-maintenance-releases-and-goodbye-10-6/
- https://mariadb.com/docs/server/clients-and-utilities/backup-restore-and-import-clients/mariadb-dump

## Latere actieve omschakeling
Robert heeft na deze proeven afzonderlijk akkoord gegeven. De actieve instantie op 19091 draait inmiddels op MariaDB 11.4.13 in een nieuw volume, met behouden oud volume en laatste back-up. Het actuele uitvoerings- en testrapport staat in DATABASE-CUTOVER-2026-10-25.md; eerdere vermeldingen van een wachtend omschakelakkoord beschrijven de voorgaande situatie.
