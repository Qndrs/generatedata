# Herstel na STACK-vervuiling

## Huidige scheiding

De ontwikkelbron staat op C:/Projects/datagenerator, rechtstreeks gecloned van de samengevoegde master van Qndrs/generatedata. De oude map D:/_qndrs/datagenerator blijft intact. Na afzonderlijk akkoord op herstelstap 4 zijn de lokale instanties op 19090, 19091 en 19094 omgeschakeld naar de schone bron. Runtimeconfiguraties, datavolumes en herstelkopieën blijven buiten de clone; de oorspronkelijke volumes blijven beschikbaar voor terugval.

STACK synchroniseert de volledige D-schijf met /qback; deze koppeling is gepauzeerd. De nieuwe ontwikkelmap valt buiten de geconfigureerde synchronisatieroots. Houd actieve Git-repositories buiten bidirectionele bestandssynchronisatie.

## Overname van lokale wijzigingen


## Geïsoleerde verificatie

De canonieke kwaliteitsroute wordt uitgevoerd met DG_QUALITY_INSTANCE=datagenerator-quality-clean, DG_QUALITY_PORT=19096 en een nieuwe externe DG_QUALITY_CONFIG_DIR. De route bouwt eigen images, gebruikt een eigen volume en ruimt alleen haar testcontainers/netwerk op. Configuratie en testvolume blijven behouden voor reproduceerbaarheid.

Gebruik de geïsoleerde kwaliteitsroute voor ontwikkeling en regressieproeven. De standaard node tools/local.mjs-commando's beheren na herstelstap 4 de omgeschakelde hoofdinstantie datagenerator-dev. Kies voor andere instanties expliciet DG_INSTANCE en DG_CONFIG_DIR; zie LOCAL-CUTOVER.md.

De uiteindelijke controle-uitkomsten en de vergelijking van actieve containers staan in het afzonderlijke lokale verificatiebewijs. De proef is geen productie- of belastingtest.

## Afzonderlijk te accorderen vervolg

Herstelstap 4 is uitgevoerd: de drie lokale instanties gebruiken de schone bron, met behoud van gegevens en terugvalpunten. Herstelstap 5 is de nog te accorderen reconstructie van de foutieve cloudverplaatsingen. Cloudherstel en het opnieuw inrichten/hervatten van STACK volgen apart. Deze ontwikkelmap verandert geen synchronisatie-instellingen.

Herstelkopieën en vertrouwelijk onderzoek blijven buiten Git. Publicatie van documentatiewijzigingen gebeurt alleen na afzonderlijke opdracht.

## Uitkomst herstelstap 3

- GitHub-basis: mergecommit a69cc7a5abc84a3a2a5764f35cca37a50ea7ae2d; lokale branch codex/stack-recovery. git fsck --full slaagt op de nieuwe clone.
- De volledige canonieke kwaliteitsroute slaagt na een nieuwe applicatiebuild: lint, TypeScript, productiefrontendbuild, 124 clienttests en twintig servertests. Eén bestaande lege clienttest is overgeslagen.
- Tien worker-/isolatiechecks en de echte API-, sessie-, dataset-/historie-, accountbeheer- en MySQL-exportproeven slagen.
- Alle negen actieve lokale containers behouden hun ID, starttijd, image, volumekoppelingen en poorten en zijn gezond. De oude projectmap is behouden; haar PROJECT.md is niet gewijzigd.
- De eigen kwaliteitscontainers en het eigen testnetwerk zijn opgeruimd; het testvolume en de externe testconfiguratie zijn behouden. Er is geen nieuwe blijvende webinstantie gestart.
- D: blijft gepauzeerd in STACK. Geen productieverbinding, actieve omschakeling, commit of push uitgevoerd.
- Privébewijs: %LOCALAPPDATA%/Qndrs/DatageneratorRecovery/step3-clean-20261025-235818, met result.json, source-review.json, active-before.json, active-after.json, test-summaries.txt en quality.log.

De kwaliteitsroute test synthetische accounts en data in een nieuw testvolume. Overname van bestaande accounts en datasets hoort bij herstelstap 4; deze proef schakelt geen bestaande instantie om.

## Uitkomst herstelstap 4

De drie instanties zijn succesvol omgeschakeld. Exacte datacontroles, echte API-/opslag-/sessieproeven en de gezamenlijke healthcheck slagen. De oorspronkelijke volumes en images blijven bewaard. Beheer en terugval staan in [LOCAL-CUTOVER.md](LOCAL-CUTOVER.md). Historische uitspraken onder herstelstap 3 beschrijven de toestand vóór deze afzonderlijk geaccordeerde omschakeling.

## Uitkomst herstelstap 5: lokale reconstructie

De elf foutieve cloudverplaatsingen zijn per cloud-ID, bronpad, doelpad en logtijd gereconstrueerd. De latere synchronisatie van verwijderingen en nieuwe Git/projectbestanden is meegenomen. Het gaat om vermengde mappen; een eenvoudige omgekeerde mapverplaatsing is daarom geen gecontroleerd herstel.

Op verzoek is voorlopig alleen lokaal bewijs gebruikt. De actuele cloudtoestand, prullenbak en versies zijn nog niet live geverifieerd. Het volledige overzicht, de bestandscatalogus en checksuminformatie blijven vertrouwelijk buiten Git. Er zijn in deze stap geen cloudwijzigingen of productiehandelingen uitgevoerd.

Herstel vereist eerst een actuele alleen-lezen cloudinventaris, daarna een per module beoordeelde herstelset en conflictlijst. Naam- en grootteovereenkomsten zijn alleen herstelkandidaten, geen bewijs van identieke oorspronkelijke inhoud. De oorspronkelijke module lm_1409 heeft verweven en verspreide onderdelen; behandel die als één herstelgebied.

De oude D:-Git-map blijft forensisch bewijs en is geen actieve ontwikkelrepository. Git-integriteits- en branchcontroles hebben betrekking op de schone C:-clone.
