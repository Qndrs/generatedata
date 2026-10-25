# Actieve lokale databaseomschakeling — 2026-10-25

## Opdracht en resultaat

Robert heeft na de afzonderlijke stap-3-proeven expliciet akkoord gegeven voor omschakeling van de actieve lokale instantie op 19091. De eerdere afwijzing van automatische goedkeuring is daarmee opgevolgd; deze uitvoering valt binnen de aanvullende opdracht.

De actieve datagenerator-dev-database draait nu op MariaDB 11.4.13, image-digest `sha256:250e1609e93c0e6aecf64bfbab2d84d5e89d2481540fe77447ff6c855c3b1873`, met volume `datagenerator-dev_database114`. De URL blijft http://127.0.0.1:19091/nl/.

## Uitvoering

1. Actuele bron gecontroleerd: image mariadb:10.5.8 en volume datagenerator-dev_database. Nieuw doelvolume bestond nog niet.
2. Web en API gepauzeerd en een laatste volledige logische back-up gemaakt buiten Git. runtimeconfiguratie, oorspronkelijke bootstrapgegevens en testcredentials zijn in die vertrouwelijke bundel behouden.
3. Alleen image- en volumevelden van het externe lokale profiel gewijzigd. Databasecredentials en JWT-secrets behouden.
4. Dump in een nieuw 11.4-volume geïmporteerd; geen fysieke 10.5-databasebestanden door de nieuwe engine geopend.
5. Alle kolommen van accounts, datasets, dataset_history en settings vergeleken met de bevroren back-up. Digests waren exact gelijk: 3 accounts, 2 datasets, 3 historieversies en 0 settings vóór de applicatietests.
6. Applicatie gestart met healthchecks; bestaande accounts en wachtwoorden werden door init behouden.

## Verificatie

- Echte login, geweigerd fout wachtwoord, opslaan/wijzigen/teruglezen, historie, sessierotatie, logout en accountisolatie slagen op de actieve nieuwe database.
- Alle zes upstream-authenticatietests slagen.
- De tests schrijven uitsluitend eigen fictieve controledata; daardoor kunnen totaalaantallen na tests hoger zijn dan de migratiemomentopname.
- Werkelijke databaseversie via snapshot bevestigd als 11.4.13-MariaDB-ubu2404. Containerinspectie bevestigt het nieuwe image en volume.
- Browser na herladen opnieuw aangemeld zonder credentials te wijzigen. De bestaande dataset Zelfstandige installatie en haar generatie-aantal zijn onder Mijn account zichtbaar. Browser teruggezet naar de oorspronkelijke lege generatorweergave; geen gebruikersdataset gewijzigd.
- Het oude volume datagenerator-dev_database bestaat nog. De oudere proef op 19090 en productie zijn niet gewijzigd. Geen commits, pushes of GitHub-publicatie uitgevoerd.

## Terugval en bewijs

Oud volume: datagenerator-dev_database. Laatste oorspronkelijke back-up: buiten Git, met de lokale padverwijzing `active-cutover-backup-path.txt` in de datagenerator-dev-configuratiemap. De bundel bevat de oude runtime.env met image-/volumevelden en alle oorspronkelijke gegevens.

Terugval vraagt een nieuwe expliciete opdracht en moet rekening houden met wijzigingen die ná deze migratie in 11.4 zijn opgeslagen. Het oude volume is een bewaard migratiemoment, geen continu bijgewerkte kopie. Geen downgrade van nieuwere fysieke bestanden uitvoeren.

Lokale genegeerde evidence: backup-active-cutover.log, restore-active-cutover.log, test-active-cutover.log, snapshot-active-cutover.log en outputs/active-db-cutover.jpg. SQL en credentials staan niet in deze repository.

Compose kan bij starten melden dat het oude volume met dezelfde historische Compose-labels niet meer bij het actuele volumeprofiel hoort. Dat oude volume is bewust behouden; niet automatisch verwijderen.

## Vervolg

Stap 3 inclusief de aanvullend geaccordeerde actieve omschakeling is afgerond. Stap 4, robuuste foutafhandeling en gebruikersflow, wacht op afzonderlijk akkoord. Accounts blijven beheerdergestuurd; e-mailherstel is nog niet ingericht.
