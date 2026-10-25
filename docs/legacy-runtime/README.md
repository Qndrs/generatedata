# Referentie van de eerdere proefopstelling

compose.trial.yml is uitsluitend een overgedragen referentie, geen startklare installatie. Relatieve Dockerfilepaden, oude imagenamen, externe credentials, genegeerde configuraties en trial-init.sql stammen uit de eerdere proefcontext. Voer dit bestand niet direct uit vanuit deze documentatiemap.

De oude proef blijft buiten dit project draaien en wordt bij stap 1 niet omgeschakeld. De geselecteerde Dockerfiles en tests onder tools zijn behouden voor stap 2; ze zijn niet opnieuw uitgevoerd vanuit deze map.

Geen secrets, echte configuratiebestanden, initialisatie-SQL met accounthash, databasevolume of loginbestand gekopieerd. Stap 2 moet een eigen veilige setup en één schone, reproduceerbare runtime toevoegen.

## Actuele zelfstandige route

Stap 2 heeft de afhankelijkheid van eerder gebouwde proefimages opgeheven. Gebruik Dockerfile, compose.yaml en tools/local.mjs met de publieke profielen onder config/. De oude Dockerfiles en deze Compose-referentie blijven uitsluitend historische hulpmiddelen. Zie ../LOCAL-INSTALL.md en ../STEP2-VERIFICATION.md.
