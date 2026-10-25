# Kwaliteitscontrole

## Eén herhaalbare route

Vanaf de projectmap, met Node.js 24 en Docker met Linux-containers:

```powershell
node tools/local.mjs quality
```

Deze opdracht voert setup, de canonieke Docker-build en tests uit in het eigen Compose-project datagenerator-quality, op loopback 127.0.0.2:19095. De bestaande instanties op 19090, 19091 en 19094 worden niet vervangen of gestopt. Credentials worden automatisch buiten de repository aangemaakt. Na afloop worden alleen de testcontainers en het testnetwerk opgeruimd, ook bij testfalen; het eigen volume en de externe configuratie blijven behouden.

De opdracht faalt met een niet-nul exitcode bij een mislukte controle. Bestaande runtimeconfiguratie van een ander project wordt geweigerd vóór Docker wordt aangeroepen. Een overgeërfde Compose-projectnaam of databasevolumenaam wordt vervangen door de naam van de kwaliteitsinstantie. Er worden geen productiecredentials of GitHub-secrets gebruikt.

## Dekkingsgrenzen

| Controle | Uitvoering | Doel |
| --- | --- | --- |
| Lint en types | tools/check-quality.cjs | Onderhouden clientcorrecties, JSON/CSV-generators en client-TypeScript |
| Clientregressie | Volledige Jest-suite van apps/client | Store, layout, onderdelen, opslagfouten en sessies |
| Generatie en exports | tools/tests/generation-exports.test.cjs | Werkelijk gebouwde Names-, JSON-, CSV- en SQL-workers via hun berichteninterface |
| Login, opslag en historie | tools/generatedata-login-storage-test.cjs | Echte login, bewaren/bijwerken/teruglezen, versiehistorie, eigendomsisolatie, sessies en geblokkeerde accounts via nginx |
| API-authenticatie | apps/server/tests/auth-security.test.cjs | JWT-controles en toegang tot beschermde resolvers |
| MySQL-export | tools/generatedata-sql-export-test.cjs | Gebouwde SQL-uitvoer uitvoeren op MariaDB en de exacte Unicode-, tekst- en getalwaarden teruglezen |
| Beheerderflow | tools/generatedata-account-flow-test.cjs | Account aanmaken, tijdelijk wachtwoord en overstap naar eigen wachtwoord; geen zelfregistratie |
| Isolatie van testroute | tools/tests/quality-runner.test.cjs | Actieve projectnaam, afwijkende configuratie en onbekende opties weigeren |

De workercontroles draaien de gebouwde JavaScript-workers in een Node VM met importScripts/postMessage, zonder de generators te mocken. Dit is geen geautomatiseerde browserbediening. De echte browserfoutproeven van stap 4 blijven apart gedocumenteerd. De SQL-proef gebruikt een tijdelijke tabel op één verbinding, die bij sluiten verdwijnt; bestaande tabellen worden niet gewijzigd. Alleen het MySQL/MariaDB-exportdoel wordt daadwerkelijk door een database uitgevoerd; andere SQL-dialecten zijn hiermee niet gevalideerd.

De lintcontrole omvat de onderhouden applicatiecorrecties en de gewijzigde exportgenerators. Dit is geen claim dat alle upstreamcode foutloos is gelint of dat alle monorepopakketten een volledige testsuite hebben. Een bestaande lege GridRow.container-test blijft expliciet als overgeslagen zichtbaar.

## Sneller lokaal herhalen

```powershell
node tools/local.mjs quality --skip-build
```

Dit hergebruikt uitsluitend de al gebouwde kwaliteitsimages en voert de controles daarop opnieuw uit. Het valideert geen nog niet gebouwde bronwijzigingen. Gebruik de standaardopdracht vóór beoordeling van nieuwe wijzigingen.

Optioneel: DG_QUALITY_INSTANCE (alleen datagenerator-quality/datagenerator-ci, of een naam met extra koppelteken-suffix), DG_QUALITY_CONFIG_DIR (buiten de repository) en DG_QUALITY_PORT. De standaardwaarden zijn voldoende voor lokaal gebruik. Bij een bestaand volume mag de externe configuratie niet worden geregenereerd.

## Voorbereide GitHub Actions

.github/workflows/quality.yml gebruikt dezelfde opdracht voor pull requests, pushes en handmatige runs. De workflow bouwt op een Linux-runner met Node 24, gebruikt alleen leesrechten voor de repository en heeft geen deployment- of publicatiestap. Checkout en Node-setup zijn aan een vaste commit gekoppeld; checkout bewaart geen credentials in de bronkopie. Alleen een eigen tijdelijke CI-configuratiemap wordt gebruikt. Er worden geen credentials, databases of configuratiebestanden als artifact gepubliceerd.

De workflow is lokaal voorbereid. Een daadwerkelijke GitHub-run kan pas na de afzonderlijk geaccordeerde repositorypublicatie worden bevestigd. Referentie voor de gebruikte instellingen: [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [checkout](https://github.com/actions/checkout) en [setup-node](https://github.com/actions/setup-node).

[Verificatie stap 5](STEP5-VERIFICATION.md) bevat de uitgevoerde volledige cyclus, de herhaling en de concrete testresultaten.
