# Projectinstructies voor AI-assistenten

Lees eerst dit bestand, PROJECT.md en CONTRIBUTING.md. Deze instructies zijn zelfstandig bruikbaar; raadpleeg in Roberts omgeving alleen relevante ROBERT-AI-context via ROBERT_AI_HOME.

## Scope en bevoegdheid

- Dit is het afzonderlijke applicatieproject Datagenerator, met een zelfstandige geteste lokale runtime. De oudere proef op 19090 blijft apart beschikbaar.
- Voer alleen de door Robert geaccordeerde stap uit. Start een volgende roadmapstap pas na nieuw akkoord.
- Geen productieverbindingen, deployments, database- of serverwijzigingen, GitHub-publicatie of externe configuratiewijzigingen zonder expliciete opdracht.
- Codex handelt namens Robert. Andere assistenten handelen uitsluitend binnen de bevoegdheid van hun opdrachtgever; Git-toegang geeft geen aanvullende operationele bevoegdheid.

## Ontwikkeling

- Behoud upstreamherkomst, licentie en auteursvermeldingen. Houd eigen wijzigingen klein en vergelijkbaar met de vastgezette upstreambasis.
- Behoud dezelfde-originroute /graphql en de afscherming van database/API.
- Gebruik fictieve lokale accounts en eigen proefvolumes; overschrijf geen actieve proef of andermans werk.
- Bewaar geen echte credentials, gegenereerde configuratie met secrets, databases, dumps of persoonlijke data in Git. Lees secrets niet naar tooluitvoer.
- Neem onverwachte bestanden niet zonder onderzoek over. Bewaar technische naamtemplates zoals Name Surname: deze kunnen generatorsyntax zijn.
- Voer relevante bestaande tests uit na gedragswijzigingen en rapporteer alleen daadwerkelijk geslaagde controles. Werk PROJECT.md bij bij betekenisvolle wijzigingen.

## Git en samenwerking

- Lees CONTRIBUTING.md vóór commits en pushes. Inspecteer bestaande wijzigingen en actuele remote-status vóór nieuw Git-werk; fetch pas wanneer remote-synchronisatie relevant is voor de opdracht.
- Werk op een herkenbare branch, stage bewust en neem geen werk van anderen mee.
- De remote upstream is uitsluitend bronreferentie; de push-URL is bewust geblokkeerd. Origin is de Qndrs-fork; pushen en publicatie volgen alleen na expliciet akkoord op de publicatiestap.
- Geen force-push op gedeelde hoofdbranches, verplaatsen van gepubliceerde tags of overschrijven van gedeelde geschiedenis.
- Gebruik bij gedeelde ontwikkeling pull requests en bevoegde menselijke review; vermeld AI-bijdragen namens de opdrachtgever. Stop bij onverwachte remote-wijzigingen, conflicten of onduidelijk eigenaarschap.

## Lokale runtime
Gebruik uitsluitend Dockerfile, compose.yaml en tools/local.mjs als canonieke route. Lees docs/LOCAL-INSTALL.md. Elke instantie heeft een eigen configuratie en volume; de oude proef mag niet worden overschreven. Geen volume verwijderen of configuratie regenereren wanneer gegevens behouden moeten blijven. Houd publieke config/ gescheiden van echte runtime-secrets.

