# Actieve lokale instanties na omschakeling

De drie instanties worden beheerd vanuit C:/Projects/datagenerator met compose.yaml en tools/local.mjs. Geen productie is gewijzigd.

| Instantie | Adres | Database |
| --- | --- | --- |
| datagenerator-dev | http://127.0.0.1:19091/nl/ | MariaDB 11.4.13 |
| datagenerator-flow-step4 | http://127.0.0.2:19094/nl/ | MariaDB 11.4.13 |
| generatedata-local-trial | http://localhost:19090/nl/ | MariaDB 10.5.8, historische proef |

Elke instantie heeft een eigen runtimeprofiel onder %LOCALAPPDATA%/Qndrs/Datagenerator/<instantienaam>. De profielbestanden bevatten de actuele volume- en database-imagekoppeling; regenereer ze niet. De oudere GeneratedataTrial-map en de oude bronmappen op D: zijn behouden als herstelreferentie.

## Beheer

Start PowerShell in de schone bronmap en kies de instantie expliciet:

    $env:DG_INSTANCE = 'datagenerator-dev'
    $env:DG_CONFIG_DIR = Join-Path $env:LOCALAPPDATA "Qndrs/Datagenerator/$env:DG_INSTANCE"
    node tools/local.mjs status

Gebruik dezelfde selectie bij up, stop, down of backup. down bewaart de volumes. Gebruik quality voor een eigen geïsoleerde ontwikkelproef. setup is niet nodig voor deze bestaande instanties en mag geen verloren runtimegeheimen of volumeconfiguratie vervangen.

## Gegevensbehoud en verificatie

Per instantie zijn web en API kort gestopt. De laatste SQL-dump en volledige rij-/kolomdigests zijn vastgelegd. De dump is naar een nieuw volume met dezelfde engineversie hersteld; alle vier applicatietabellen komen exact overeen vóór applicatiestart. De bestaande schema's zijn door initialisatie behouden.

Echte login, opslaan/bijwerken/teruglezen, datasetgeschiedenis, accountisolatie, sessierotatie en logout zijn daarna gecontroleerd met bestaande fictieve controleaccounts. De tijdelijke controledataset en haar historie zijn verwijderd. Alle bestaande data zijn opnieuw vergeleken; alleen last_updated, last_logged_in en refresh_token van accounts zijn wegens de controlelogins uitgezonderd. Passwordhashes, rollen, status en overige accountvelden blijven behouden.

Alle negen draaiende services zijn gezond. API/web gebruiken de vanuit de schone bron gebouwde images. JWT-secrets, bestaande adressen en database-engineversies zijn gelijk gebleven. Er zijn geen productieverbindingen, GitHub-publicatie of STACK-instellingen gewijzigd. D: blijft gepauzeerd.

## Terugval

De oorspronkelijke volumes, image-tags, runtimeprofielen en gerenderde Compose-recepten zijn veiliggesteld buiten STACK. Het vertrouwelijke herstelpakket staat onder:

    %LOCALAPPDATA%/Qndrs/DatageneratorRecovery/step4-cutover-20261026-002156

Het bevat TERUGVAL.md, plans.json, cutover.py en per instantie de laatste bevroren dump, hashmanifesten, controle-uitkomsten en rollback.compose.json. Het pakket bevat secrets; houd het buiten Git.

Terugval moet bewust per instantie worden uitgevoerd met het meegeleverde script en de oorspronkelijke images/volumes. Beide volumes blijven behouden. Bij terugval worden de gegevens van vóór omschakeling zichtbaar; gegevens die later in het nieuwe volume zijn toegevoegd moeten apart veiliggesteld en beoordeeld worden. Voer daarom geen blinde volumewissel of import over bestaande gegevens uit.

Het script bewaart waar mogelijk eerst een actuele dump van het nieuwe volume en laat dat volume bestaan. Na terugval is het private rollback-recept de beheerroute totdat configuratie en eventuele nieuwe gegevens zijn gereconcilieerd. Verwijder geen volumes of rollback-images zolang het hersteltraject loopt.

De oudere proef is niet naar een andere database-engine geüpgraded. Een eventuele latere database-upgrade is een afzonderlijke opdracht.

De terugvalprocedure en oorspronkelijke configuraties zijn voorbereid en gecontroleerd. Er is na de geslaagde omschakeling geen live terugvalproef uitgevoerd, om de actieve instanties niet opnieuw te onderbreken.
