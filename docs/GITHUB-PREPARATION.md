# GitHub-voorbereiding — Qndrs/generatedata

Datum: 25 oktober 2026. Robert heeft de fork https://github.com/Qndrs/generatedata aangewezen om mee verder te werken.

## Geverifieerd en lokaal ingericht

- De repository is publiek en is daadwerkelijk een GitHub-fork van benkeen/generatedata. De geauthenticeerde gebruiker Qndrs heeft lees-, schrijf- en beheertoegang; zowel connector als GitHub CLI bevestigen de toegang.
- De standaardbranch is master. De fork en upstream staan op dezelfde basis als ons lokale project: Generatedata 5.0.0-beta4. Geen afwijkende remote-commits of conflicten gevonden.
- Origin verwijst lokaal naar https://github.com/Qndrs/generatedata.git. Upstream blijft de bronreferentie; zijn geblokkeerde push-URL is behouden.
- De shallow-beperking is verwijderd met een gefilterde fetch. De volledige vooroudergeschiedenis is beschikbaar: 2.895 commits tot de huidige basis. De lokale werkbranch codex/project-bootstrap en alle ongecommitteerde wijzigingen zijn behouden.
- GitHub Actions staat aan en staat de gebruikte Actions toe. De eigen Quality-workflow is lokaal voorbereid en getest via dezelfde kwaliteitsopdracht, maar nog niet naar GitHub gestuurd of daar uitgevoerd.

## Publicatie-inhoud

Bedoeld zijn de applicatiecorrecties, vertalingen, publieke configprofielen, canonieke Docker-/Compose-installatie, beheerscripts, regressietests, CI-workflow en projectdocumentatie. GPL-licentie, upstreamauteurs en herkomst blijven behouden.

Uitgesloten zijn echte runtimeconfiguratie, admin-/testcredentials, databases, back-ups, logs, outputs en gegenereerde buildbestanden. De kandidaatbestanden zijn gecontroleerd op private-key-/tokenpatronen en op exacte waarden van de bekende lokale runtimegeheimen. Er zijn daarbij geen treffers gevonden. De controle is gericht op onze nieuwe/gewijzigde bestanden; oorspronkelijke al publieke upstreaminhoud is geen nieuwe Qndrs-publicatie.

Ook uitgesloten, maar op schijf behouden:

- Niet-geversioneerde lms/story_content/slides-mappen onder enkele plugindirectories en scripts/slides: leerpakket-/presentatie-exportbestanden zoals SWF, MP4 en SCORM-JavaScript, zonder verwijzingen vanuit de geversioneerde applicatiecode.
- De oude tools/Dockerfile.generatedata-* overlays, check-persistence.cjs en generatedata-trial-smoke.cjs. De canonieke route gebruikt de actuele root-Dockerfile, compose.yaml en tools/local.mjs.

De uitsluitingen staan in .gitignore en .dockerignore. Niets is verwijderd. Het kandidaatmanifest met bestandsnamen en inhoudshashes staat lokaal in outputs/github-preparation/candidate-review.json; het bevat geen credentials en wordt zelf niet gepubliceerd.

## Voorgestelde publicatiestap

1. Remote-status en kandidaatmanifest opnieuw controleren op wijzigingen.
2. De beoordeelde wijzigingen bewust opnemen in samenhangende commits; de openbare auteursidentiteit controleren zonder automatisch een privé-e-mailadres over te nemen.
3. De ontwikkelbranch naar Qndrs/generatedata pushen en een pull request tegen master van deze fork openen. Niet rechtstreeks naar benkeen/generatedata pushen.
4. De echte GitHub Quality-run controleren en eventuele CI-specifieke fouten oplossen. Menselijke review volgt vóór samenvoegen; een AI-controle vervangt die review niet.

Bij afronding van deze voorbereiding waren er nog geen eigen commits, pushes, pull requests of merges uitgevoerd. Robert heeft daarna stap 7 expliciet geaccordeerd voor de gecontroleerde publicatie via ontwikkelbranch en pull request; samenvoegen valt daarbuiten. Actieve proefinstanties en productie zijn niet gewijzigd. Algemeen bruikbare correcties kunnen later in afzonderlijke pull requests aan Ben Keen worden aangeboden.

De laatste applicatievalidatie blijft STEP5-VERIFICATION.md: de volledige kwaliteitscyclus en een herhaling slagen. Tijdens deze voorbereiding zijn Git-remotes, historie, publicatie-inhoud en documentatie gecontroleerd; er is geen applicatielogica gewijzigd of volledige runtimecyclus opnieuw gedraaid.
