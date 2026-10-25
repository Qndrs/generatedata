# Gebruikersflow en herstel

## Werkwijze

Accounts worden door de beheerder aangemaakt. Zelfregistratie blijft uit. In het lokale profiel staat GD_PASSWORD_RESET_ENABLED op false: de link bij inloggen verwijst met een melding naar de beheerder, zonder een onbruikbare resetmail te beloven. De beheerder verstrekt een tijdelijk wachtwoord via een geschikt kanaal; bij de eerste aanmelding kiest de gebruiker een eigen wachtwoord.

## Opslaan en verbindingsproblemen

- Nieuwe en bestaande datasets, hernoemen en accountwijzigingen geven alleen succes na een bevestigend API-antwoord. Bij afwijzing blijven de invoer en generatorconfiguratie staan.
- Tijdens opslaan is de dialoog geblokkeerd tegen dubbel indienen. Gelijktijdige identieke account-/opslagmutaties worden ook bij de actie afgehouden. De naam wordt direct verwerkt, zonder invoervertraging.
- API-verzoeken hebben een grens van twintig seconden. Een verbroken verbinding kan betekenen dat de server de wijziging al heeft uitgevoerd. Daarom worden schrijfverzoeken niet automatisch herhaald. Controleer eerst de datasetlijst voordat je opnieuw opslaat, vooral bij Opslaan als.
- De datasetlijst toont laden, een foutmelding en Opnieuw proberen. Een mislukte verwijdering sluit de bevestigingsdialoog niet en wist het raster niet.

## Sessies en lokaal werk

Een verlopen sessie wist de generatorconfiguratie niet. De koppeling met de eerder geopende dataset wordt losgelaten, zodat een volgende gebruiker die dataset niet per ongeluk overschrijft. Na opnieuw inloggen kan het behouden werk als dataset worden opgeslagen. Afmelden en sessieverloop verwijderen de accountgegevens uit de interface en legen de Apollo-cache. Een nieuwe sessietimer vervangt een oude timer; afmelden stopt deze timer.

De configuratie wordt lokaal in deze browser bewaard. Vóór uitloggen of het openen van een andere dataset wordt gevraagd om niet-opgeslagen wijzigingen te verwerpen. Bij sluiten/herladen waarschuwt de browser als de configuratie afwijkt van het laatst geladen/opgeslagen exemplaar. Wijzigingen tijdens een lopende opslag blijven als niet-opgeslagen herkenbaar: de controle gebruikt de verzonden inhoud.

Bij geweigerde browseropslag of een volle opslagruimte blijft de app bruikbaar en verschijnt een waarschuwing. Houd de pagina dan open en sla de dataset op zodra dat mogelijk is. Browseropslag is geen databaseback-up; wissen van browsergegevens verwijdert het lokale concept. Deel geen browserprofiel voor vertrouwelijke generatorconfiguraties.

## Testgrenzen

Gerichte fouttests horen bij stap 4. De bredere regressiesuite en CI blijven stap 5. Nieuwe meldingen zijn Nederlands en Engels; andere ondersteunde talen gebruiken voor deze nieuwe meldingen voorlopig de Engelse tekst.
