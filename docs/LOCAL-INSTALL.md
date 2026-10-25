# Lokale installatie

## Voorwaarden

Docker met Linux-containers en een recente Docker Compose met `--wait` en `service_completed_successfully`, plus Node.js 24 op de host voor de beheerscripts. Node.js, pnpm en alle applicatiedependencies voor de build worden in Docker geïnstalleerd; er is geen hostinstallatie van pnpm nodig.

## Eerste installatie vanuit de bronmap

```powershell
node tools/local.mjs setup
node tools/local.mjs build
node tools/local.mjs up
node tools/local.mjs test
```

Open http://127.0.0.1:19091/nl/. De setup meldt de lokale configuratiemap. Het bestand `admin.json` daarin bevat de gegevens van de nieuwe lokale beheerder. Credentials worden niet naar de terminal afgedrukt. Op Windows is de standaardmap `%LOCALAPPDATA%\Qndrs\Datagenerator\datagenerator-dev`; op andere platforms wordt XDG_CONFIG_HOME of de gebruikersconfiguratiemap gebruikt.

De publieke applicatie-instellingen staan in `config/client.config.ts` en `config/server.config.ts`. Pas geen oude genegeerde configuraties onder packages/config/src aan: de Docker-build maakt die opnieuw vanuit config/. E-mail en wachtwoordherstel zijn in dit lokale profiel niet ingericht.

## Dagelijks gebruik

```powershell
node tools/local.mjs status
node tools/local.mjs stop
node tools/local.mjs up
node tools/local.mjs down
```

`stop` stopt containers; `down` verwijdert containers en netwerk maar bewaart het databasevolume. `up` wacht op database-initialisatie en de API-healthcheck. Bestaande accounts en wachtwoorden worden bij opnieuw starten niet vervangen. Een gedeeltelijk schema wordt niet overschreven.

Bewaar runtime.env en admin.json buiten de repository. Verwijder of regenereer geen configuratie wanneer een databasevolume behouden moet blijven. Herstel van verloren configuratie/database hoort bij het afzonderlijke herstelplan, niet bij setup.

## Extra onafhankelijke instantie

Kies vóór de eerste setup een eigen naam en vrije poort:

```powershell
$env:DG_INSTANCE = 'datagenerator-extra'
$env:DG_PORT = '19092'
node tools/local.mjs setup
node tools/local.mjs build
node tools/local.mjs up
```

De instantienaam bepaalt configmap, images, netwerk en eigen volume. Een bestaande instantie houdt de eerder opgeslagen poort; DG_PORT overschrijft bestaande configuratie niet. DG_CONFIG_DIR kan expliciet naar een map buiten de repository verwijzen. Verwijder de omgevingsvariabelen uit de shell om terug te gaan naar de standaardinstantie.

## Bouw- en datagrenzen

- Dockerfile gebruikt uitsluitend officiële Node- en nginx-basisimages en de vastgezette pnpm 10.31.0 met pnpm-lock.yaml; geen eerder gebouwde proefimages nodig.
- `build --no-cache` voert de bouwlagen opnieuw uit. Een aparte BuildKit-cache mag gedownloade openbare pnpm-pakketten hergebruiken; dit is geen voorgebouwd applicatie-image.
- Database en API hebben geen hostpoorten. Alleen web bindt aan 127.0.0.1. De browser gebruikt /graphql via nginx.
- De app gebruikt databasegebruiker gdapp; het database-rootwachtwoord wordt niet aan de API doorgegeven.
- Een lege database wordt automatisch ingericht uit het bron-schematemplate, zonder het oude voorbeeld-databaseaccount. Het beheerderwachtwoord wordt pas bij runtime gehasht en ingevoegd; geen persoonlijke of productiegegevens vereist.
- Nieuwe instanties gebruiken de gepinde MariaDB 11.4.13. De bestaande hoofdinstantie is na afzonderlijk akkoord ook naar een nieuw 11.4.13-volume omgeschakeld; het oude 10.5-volume is als terugvalpunt behouden. Compatibiliteit en herstel zijn afzonderlijk bewezen in stap 3. Zie DATABASE-RECOVERY.md.
- Gebruik geen oude upstream prod-commando's of tools/Dockerfile.generatedata-* als alternatieve startroute. De canonieke route is Dockerfile, compose.yaml en tools/local.mjs. Oudere bestanden zijn referentiemateriaal.

## Tests

`test` maakt twee fictieve controleaccounts met willekeurige credentials buiten de repository. De tests controleren echte login, opslag/wijziging/teruglezen, historie, accountisolatie, sessierotatie en logout en voeren de zes upstream-authenticatietests uit. De testaccounts zijn gescheiden van de lokale beheerder. Dit is nog geen uitgebreide CI-, belasting- of beveiligingsaudit.

Gebruik voor deze instantie 127.0.0.1 als browserhost: cookies zijn niet per poort gescheiden. Zo blijft een bestaande proef op localhost apart aangemeld.


Handmatige databasecommando's: node tools/local.mjs backup, restore <externe-map> en snapshot. Lees eerst [DATABASE-RECOVERY.md](DATABASE-RECOVERY.md); restore overschrijft geen bestaand doel.



## Afzonderlijke gebruikersflowproef

De stap-4-proef gebruikt DG_INSTANCE=datagenerator-flow-step4, DG_PORT=19094 en DG_BIND_HOST=127.0.0.2. De tweede loopbackhost scheidt ook browsercookies van 127.0.0.1 en localhost. Setup accepteert alleen 127.0.0.1 en 127.0.0.2 als bindhost. De ingestelde host wordt in de externe runtimeconfiguratie bewaard.

De beheerdergegevens van deze afzonderlijke proef staan in %LOCALAPPDATA%\Qndrs\Datagenerator\datagenerator-flow-step4\admin.json. De hoofdinstantie op 19091 en de oudere proef op 19090 gebruiken andere configuraties en volumes.

[Gebruikersflow en herstel](USER-FLOW.md) beschrijft opslagmeldingen, sessieverloop, lokale concepten en de afgesproken beheerderroute voor accounts en wachtwoorden.

## Vaste kwaliteitscontrole

Gebruik node tools/local.mjs quality voor de volledige afzonderlijke testcyclus. De opdracht bouwt de bron en draait de client-, generatie-, export-, API- en accountcontroles; daarna stopt en verwijdert zij uitsluitend haar eigen testcontainers, met behoud van het volume. Zie [QUALITY.md](QUALITY.md) voor opties en dekkingsgrenzen.
