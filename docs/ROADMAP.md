# Stapsgewijs ontwikkelplan

Elke stap vereist vooraf afzonderlijk akkoord. Na iedere stap volgt een resultaat met uitgevoerde controles en resterende punten.

1. **Zelfstandig project — afgerond.** Broncode, upstreamherkomst, correcties en ontwikkelafspraken in deze map; bestaande proef behouden.
2. **Reproduceerbare installatie — uitgevoerd, ter beoordeling.** Eén bouw-/startroute vanuit een schone clone, eigen configuratie en eigen database; geen vooraf gemaakte images vereist. Een tweede proef mag de bestaande niet verstoren.
3. **Database en herstel — afgerond, inclusief afzonderlijk geaccordeerde actieve omschakeling.** Onderhouden MariaDB-versie testen; accounts, datasets en historie back-uppen en herstellen in isolatie.
4. **Robuuste gebruikersflow — uitgevoerd in afzonderlijke lokale proef, ter beoordeling.** Opslagfouten, sessieverloop en API-uitval zichtbaar afhandelen; accountbeheer en wachtwoordherstel afspreken.
5. **Vaste kwaliteitscontrole — uitgevoerd, ter beoordeling.** Tests voor login, datasets, historie, toegang, generatie en exports herhaalbaar maken en CI voorbereiden.
6. **GitHub voorbereiden — uitgevoerd voor de aangewezen publieke fork Qndrs/generatedata.** Eigenaar/naam/zichtbaarheid/forkkeuze bepalen, te publiceren bestanden en geschiedenis beoordelen, documentatie en licenties nalopen.
7. **GitHub publiceren — geaccordeerd en in uitvoering.** Gecontroleerde inhoud via ontwikkelbranch en pull request op Qndrs/generatedata publiceren; echte GitHub-CI verifiëren. Samenvoegen en productieovername volgen niet automatisch.
8. **Uitbreidingen plannen.** Functies en betere voorbeelddata prioriteren met eigen scope en acceptatiecriteria.
9. **Productie voorbereiden.** Afzonderlijk hosting-, migratie-, back-up-, omschakel- en terugvalplan; nog geen productiehandeling.


De actieve databaseomschakeling is na apart akkoord uitgevoerd; zie DATABASE-CUTOVER-2026-10-25.md. Accounts blijven voorlopig beheerdergestuurd.


