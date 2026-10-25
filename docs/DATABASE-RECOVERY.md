# Databaseback-up en herstel

## Ondersteunde basis en huidige situatie

Nieuwe lokale instanties gebruiken MariaDB 11.4.13, vastgezet op image-digest `sha256:250e1609e93c0e6aecf64bfbab2d84d5e89d2481540fe77447ff6c855c3b1873`. De 11.4-LTS-reeks heeft Community-onderhoud tot mei 2029 volgens https://mariadb.org/about/.

De actieve datagenerator-dev-instantie op 19091 gebruikt na expliciet aanvullend akkoord MariaDB 11.4.13 en volume datagenerator-dev_database114. Het oude volume datagenerator-dev_database en de laatste logische back-up zijn behouden. Zie DATABASE-CUTOVER-2026-10-25.md.

## Back-up nemen

```powershell
node tools/local.mjs backup
```

Dit pauzeert web en API kort, laat de database draaien, neemt een consistente logische dump en start web/API daarna weer. Gebruik alleen tijdens een passend lokaal moment. De bundel komt standaard onder de externe configuratiemap in backups/<tijdstip-id>.

De bundel bevat database.sql, manifest.json en de aanwezige runtime.env, admin.json en test-users.json. Hij bevat dus databasegegevens, wachtwoordhashes en credentials: houd hem buiten Git en behandel hem als vertrouwelijk. De lokale bundel is niet versleuteld en er is geen offsitekopie of automatische retentie ingericht.

De dump bevat schema en gegevens, inclusief routines, events en triggers. SHA-256 controleert de dump en configuratiebestanden. De inhoudscontrole vergelijkt alle kolommen van accounts, datasets, dataset_history en settings; inhoud en credentials worden niet afgedrukt. Zie ook de officiële dumpdocumentatie: https://mariadb.com/docs/server/clients-and-utilities/backup-restore-and-import-clients/mariadb-dump.

## Herstellen naar een afzonderlijke nieuwe instantie

```powershell
$env:DG_INSTANCE = 'datagenerator-herstel'
$env:DG_PORT = '19094'
node tools/local.mjs setup
node tools/local.mjs build
node tools/local.mjs restore '<volledig pad naar externe back-upmap>'
node tools/local.mjs up
node tools/local.mjs test
```

Voer restore vóór de eerste volledige up uit: anders maakt init al een schema aan en wordt herstel terecht geweigerd. restore start uitsluitend een lege doeldatabase, importeert de dump en vergelijkt de volledige inhoud van de vier applicatietabellen. Pas daarna start up de applicatie. De doelinstantie behoudt eigen databasecredentials en JWT-secrets; de herstelde accounts houden hun databasewachtwoorden. admin.json bevat de oorspronkelijke bootstrapgegevens en kan verouderd zijn als een beheerder zijn wachtwoord later zelf heeft gewijzigd.

Gebruik voor browserproeven geen tweede poort met dezelfde browserhost als een actieve sessie zonder eerst de cookie-isolatie te regelen. De geautomatiseerde tests werken intern via het eigen Docker-netwerk en beïnvloeden de cookie van de actieve browser niet.

## Beveiligingen

- Geen overschrijven van een bestaande back-upmap.
- Gewijzigde of incomplete bundels worden vóór databasehandelingen geweigerd.
- Een bestaand gestopt volume wordt niet automatisch opgestart voor herstel.
- Een bestaande database met een afwijkende engine/volumekoppeling wordt niet voor herstel herstart.
- Een niet-lege draaiende doeldatabase wordt vóór een Compose-mutatie geweigerd.
- Een nieuw doel wordt ook na opstart op leegte gecontroleerd.
- Bestaande volumes worden nooit door deze hulpmiddelen verwijderd. Er is bewust geen force/overwrite-restoreoptie.

## Toekomstige databaseomschakelingen

Dit vraagt een aparte expliciete opdracht: korte schrijfpauze, een laatste back-up, herstel naar een nieuw 11.4-volume, inhoudscontrole, hervatten en applicatietests. Het oude 10.5-volume en de originele back-up blijven behouden. Wijzig niet alleen het image bovenop een bestaand 10.5-volume. Een downgrade van een 11.4-dump naar 10.5 is niet getest; gebruik bij terugval het bewaarde oude volume/de oorspronkelijke back-up.

De eerste stap-3-proeven lieten de actieve instantie ongemoeid. Na een apart expliciet akkoord is de actieve omschakeling alsnog uitgevoerd; zie DATABASE-CUTOVER-2026-10-25.md. Voor toekomstige omschakelingen blijft afzonderlijke autorisatie nodig.

