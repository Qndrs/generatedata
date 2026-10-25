# Verificatie stap 2 — 2026-10-25

## Uitgevoerde proef

Een verse lokale Git-clone van de upstreambasis is aangevuld met de expliciet geselecteerde huidige projectbestanden. Omdat er nog geen eigen commits zijn, is dit een clone met een bronoverlay; niet een clone van een al gepubliceerde afgeleide release. Genegeerde lokale configuraties, credentials, databases, node_modules en uitvoer zijn niet overgenomen.

Vanuit die bronkopie is `node tools/local.mjs build --no-cache` uitgevoerd. De canonieke Dockerfile bouwde API en web uitsluitend vanuit officiële Node-/nginx-images, met pnpm 10.31.0 en het lockbestand. Er is geen eerder gebouwd Generatedata-/Datagenerator-applicatie-image als basis gebruikt. Officiële image-downloads en een aparte openbare pnpm-downloadcache mogen worden hergebruikt. De eerste poging had een ECONNRESET bij de corepack-download; de definitieve route installeert de vastgezette pnpm via npm met downloadretries en slaagde.

## Controles en resultaat

- Node-syntaxcontroles, gerichte lintcontrole en volledige build geslaagd. Bestaande upstreamwaarschuwingen over bundleomvang blijven bestaan.
- Leeg eigen volume datagenerator-dev_database geïnitialiseerd met een nieuw lokaal beheerderaccount; geen oude database of trial-init.sql nodig.
- API draait met gdapp. Database en API hebben geen hostpoort; web luistert uitsluitend op 127.0.0.1:19091.
- `node tools/local.mjs test` slaagt: verkeerd wachtwoord geweigerd, echte login, nieuwe/gewijzigde dataset en exacte inhoud, historie, accountisolatie, sessierotatie, logout en blokkade van een uitgeschakeld testaccount.
- Alle zes upstream-authenticatietests slagen.
- Herhaalde setup liet runtime.env byte-identiek. `down` en `up` verwijderden alleen de nieuwe containers/netwerk, niet het volume. Voor en na waren één testdataset en twee historieversies met dezelfde SHA-256-inhoudsdigest aanwezig. Init meldde dat bestaande accounts en wachtwoorden werden behouden.
- Browser na opnieuw aanmaken: aanmelden als nieuwe beheerder, Nederlandse UI, JSON-naamgeneratie, `Zelfstandige installatie` opslaan en vanuit Mijn account heropenen geslaagd. Geen browserconsole-errors gezien. De dataset is ingelogd achtergelaten.
- De oudere generatedata-local-trial-containers bleven naast deze installatie actief op 19090; ze zijn niet gestopt of gewijzigd. Productie is niet benaderd.
- Git diff --check en uitsluitregels voor lokale logs/configuraties zijn gecontroleerd. Er zijn geen commits, pushes of GitHub-wijzigingen uitgevoerd.

## Bewijs en grenzen

Lokale, genegeerde artifacts: build-step2-clean.log, test-step2.log, persistence-before.log, persistence-after.log en outputs/step2-independent-installation.jpg. De bronkopie staat in de lokale tijdelijke map; de locatie is alleen lokaal vastgelegd buiten Git.

Dit is een herstart-/recreateproef, geen back-up-/restoretest. MariaDB 10.5.8 is voor deze stap behouden. Onderhouden databaseversie, hersteltest, uitgebreide foutafhandeling, CI en productieacceptatie blijven de volgende afzonderlijk te accorderen stappen.

Hostcommando's worden vanuit de projectmap uitgevoerd. De gegenereerde configuratie staat buiten Git; admin.json bevat de nieuwe lokale inloggegevens. Geen host-pnpm-installatie, productiedata of productiesleutels vereist.
