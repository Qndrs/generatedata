# Technische review van pull request #1

Datum: 25 oktober 2026. Robert heeft de technische review en het herstellen van bevindingen geaccordeerd. Deze review door Codex vervangt geen onafhankelijke menselijke beoordeling vóór samenvoegen. Productie en actieve lokale instanties blijven ongemoeid.

## Scope

Beoordeeld zijn de gewijzigde authenticatie-/opslagflow, de relevante omliggende accountmutaties, de historietoegang, de publieke/runtimeconfiguratiescheiding, installatie-/herstelgrenzen en de CI-route. Dit is een gerichte review van de forkbasis, geen volledige securityaudit van alle upstreamcode of een productieacceptatie.

## Bevindingen en herstel

| Prioriteit | Bevinding | Herstel en bewijs |
| --- | --- | --- |
| P1 | De historiequery interpoleerde een door de client aangeleverde GraphQL-ID rechtstreeks in SQL. De voorafgaande ORM-eigenaarscheck valideerde die tekst niet als canonieke ID. | Alleen positieve veilige numerieke IDs worden geaccepteerd; SQL gebruikt parameters voor ID en paginering. Tests weigeren SQL-achtige IDs vóór databasetoegang en controleren echte cross-account-isolatie. |
| P2 | Account-/wachtwoordmutaties en verwijderacties konden succes teruggeven terwijl hun database-Promise nog niet was afgerond. | Schrijfresultaten worden afgewacht; fouten worden doorgegeven. Dataset en bijbehorende historie worden in één transactie verwijderd. Tien tests controleren vertraging en databaseweigering; de API-proef controleert autorisatie en voltooid verwijderen. |
| P2 | Een vertraagd antwoord op opslaan of hernoemen kon na openen/resetten van een andere dataset de nieuwe lokale datasetkoppeling of het opslagcheckpoint overschrijven. | Het resultaat wordt alleen op dezelfde datasetcontext toegepast. Drie uitgestelde-antwoordtests bewaken dit. Een expliciete generatorreset wist ook het oude checkpoint. |
| P2 | De server vergeleek een accountvervaldatum in milliseconden met een tijdstip in seconden. | De vergelijking gebruikt nu consequent milliseconden, met een regressietest voor een reeds verstreken datum. |
| P2 | De bewust niet-afgewachte laatste-loginregistratie kon bij een databasefout een onbehandelde Promise-afwijzing veroorzaken. | Alleen deze niet-kritieke metriek blijft best-effort, met afhandeling van afwijzing; authenticatiekritieke writes worden wel afgewacht. Een test controleert succesvol inloggen bij een mislukte metriek. |

De nieuwe tests voor voortijdig succes, onveilige historie-invoer en een vertraagd contextantwoord faalden op de eerdere code en slagen na het herstel.

## Verificatie

- Clientlint en TypeScript geslaagd; volledige client-Jest-suite: 124 geslaagd, één bestaande lege upstreamtest overgeslagen.
- Server-TypeScript geslaagd; zes bestaande authenticatietests en veertien nieuwe reviewregressies geslaagd.
- In een eigen datagenerator-quality-review-instantie zijn de echte login-, dataset-, historie-, toegangs-, verwijder-, sessie-, account- en MySQL-exportcontroles geslaagd. De testcontainers zijn daarna verwijderd; het eigen volume is behouden. Deze lokale proef hergebruikte de bouwdependencies en de incrementeel gecompileerde API; de definitieve frontend- en serverbuild worden op de PR opnieuw door GitHub-CI gecontroleerd.
- Actuele CI-resultaten en exacte commit: https://github.com/Qndrs/generatedata/pull/1. De reviewcorrecties worden op dezelfde ontwikkelbranch aangeboden; er wordt niet automatisch samengevoegd.

Lokale rode/groene testlogs staan onder outputs/pr-review en blijven buiten Git. De CI-route voert de nieuwe serverregressies voortaan standaard mee uit.

## Open grenzen

De technische bevindingen hierboven zijn hersteld. Voor samenvoegen blijft menselijke beoordeling nodig, met bijzondere aandacht voor de beveiligingswijzigingen. Er is geen deployment uitgevoerd.

Bestaande access-JWTs worden bij accountblokkering niet onmiddellijk ingetrokken; zij kunnen tot het einde van hun korte levensduur geldig blijven, terwijl opnieuw inloggen en refresh worden geweigerd. Die sessiepolitiek is upstreamgedrag en moet bij het afzonderlijke productieplan worden beoordeeld. Deze PR-review is geen bevestiging dat alle productiebeveiliging en operationele maatregelen al zijn afgerond.
