# Verificatie stap 4 — gebruikersflow

Datum: 25 oktober 2026. Robert gaf akkoord voor stap 4. Geen productieverbinding of GitHub-publicatie uitgevoerd.

## Afzonderlijke proef

- URL: http://127.0.0.2:19094/nl/; Compose-project datagenerator-flow-step4; eigen volume datagenerator-flow-step4_database114 op MariaDB 11.4.13.
- Afzonderlijke externe runtimeconfiguratie en beheerderaccount. Er zijn uitsluitend fictieve controleaccounts en testdatasets gebruikt.
- Hoofdinstantie op 127.0.0.1:19091 en oudere proef op localhost:19090 zijn niet vervangen, gestopt of van database gewijzigd. De actieve overname van deze gebruikersflowcorrecties naar 19091 is niet uitgevoerd.
- Voor deze ontwikkelproef is de reeds geverifieerde dependency-image van stap 3 hergebruikt. De gewijzigde bron, publieke configuratie, dependencybuild, assets, generatie-worker, TypeScript en geoptimaliseerde webpackbundel zijn opnieuw verwerkt. Dit is geen nieuwe volledige --no-cache-installatieproef. De canonieke Dockerfile bevat dezelfde gewijzigde bronroute, lintcontrole en de vijf gerichte testsuites; er is geen nieuwe productieafhankelijkheid toegevoegd.

## Geslaagde controles

- ESLint voor alle zestien gewijzigde applicatiebestanden; TypeScript tsc --noEmit; dependencybuild en localevalidatie; assets/worker en webpackproductiebundel. Webpack geeft twee waarschuwingen over bundelgrootte.
- Vijf gerichte Jest-suites: 20 tests geslaagd. Afwijzing/netwerkfouten bij opslaan, bijwerken, hernoemen en accountwijzigingen; dubbele opslag; loginspinner; verlopen refresh; vervallen JWT; behoud van concept; browseropslagweigering/quota; bevestiging vóór afmelden; handmatig wachtwoordherstel.
- Bestaande echte API-controles via nginx slagen ook op het definitieve kandidaatimage: login/wachtwoordweigering, dataset aanmaken/bijwerken/teruglezen, historie, eigendomsisolatie, refreshrotatie, afmelden en geblokkeerde accounts. Zes bestaande server-authenticatietests slagen.
- Aanvullende API-accountproef: alleen beheerder kan aanmaken; eerste login met tijdelijk wachtwoord, wijziging naar eigen wachtwoord, oude tijdelijke waarde geweigerd, normale login geslaagd. Het script tools/generatedata-account-flow-test.cjs leest alleen de testbeheerdergegevens via stdin en toont geen credentials.

## Browserproeven

1. Op de nieuwe interface een Namen-veld met veldnaam demonaam geconfigureerd.
2. Alleen de API-container van deze proef gestopt. Opslaan toonde een foutmelding en behield de naam Gebruikersflow stap 4, de volledige configuratie en de open dialoog. De opslagknop werd weer beschikbaar. Geen automatische herhaling.
3. API herstart; dezelfde invoer opgeslagen. In de datasetlijst precies één overeenkomstige dataset aangetroffen en succesvol heropend.
4. API opnieuw gestopt; sorteren van de datasetlijst leidde tot een zichtbare verbindingsmelding met Opnieuw proberen. Na API-herstart herstelde die knop de lijst; dataset opnieuw geopend.
5. Veldnaam gewijzigd naar bewaard_na_sessie zonder opslag. De refreshsessie bewust ongeldig gemaakt via een afzonderlijke API-login van hetzelfde testaccount. In een nieuwe browsertab bleef het lokale concept behouden, was de oude datasetkoppeling losgelaten en kon opnieuw worden ingelogd.
6. Wachtwoord vergeten toonde de beheerderroute en deed geen aanvraag voor een niet-geconfigureerde resetmail. Daarna het behouden concept als Gebruikersflow na sessieherstel opgeslagen. De ingelogde eindtab is als resultaat open gelaten.

Screenshots en lokale logs staan onder outputs/step4-verification (genegeerd door Git). De bouwcontainer is na afloop gestopt; de proefinstantie blijft beschikbaar.

## Bekende grenzen en vervolg

De bredere bestaande store-suite geeft 42 geslaagde en twee mislukte tests. Beide afwijkingen zitten in generator.test.ts: die tests verwachten een verticale standaardindeling, terwijl de bron horizontaal gebruikt. Dezelfde twee tests zijn opnieuw gefaald in het ongewijzigde image van vóór stap 4 (14 van 16 tests daar geslaagd). Dit is geen aangetoonde regressie van de gebruikersflow. Uitlijnen van de bredere testsuite hoort bij de afzonderlijk te accorderen stap 5.

De foutpaden zijn gericht getest, geen volledige security- of belastingaudit. De twintigseconden-timeout bewijst niet dat de server een afgebroken schrijfactie heeft teruggedraaid; controleer daarom de datasetlijst vóór een herhaling. Browserconcepten zijn geen databaseback-up. Mailherstel, zelfregistratie, betere voorbeelddata en nieuwe functies zijn niet toegevoegd.

Zie USER-FLOW.md voor de gebruikersafspraken. Eerst Robert laten beoordelen; stap 5 en eventuele actieve lokale overname vragen hun eigen akkoord.
