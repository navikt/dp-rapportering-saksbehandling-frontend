# Saksbehandlerflate for dagpengemeldekort

## Kom i gang

Appen er basert på [React Router v7 i framework mode](https://reactrouter.com/start/framework/installation). Sjekk `.nvmrc` for ønsket Node-versjon, og pass på å holde den i sync med `Dockerfile`.

Vi bruker [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) til å formattere kode, så sørg for å ha det installert og satt opp som formatterer.

Kopier `.env.example` og gi den navnet `.env`. Pt. trenger du ikke gjøre noen endringer i `.env`, men det endrer seg når vi har en backend å gå mot. Enn så lenge er `VITE_IS_LOCALHOST="true"` og `VITE_USE_MSW="true"`. Da får du mock-data fra [MSW](https://mswjs.io/).

```
npm install
npm run dev
```

Testene er satt opp med Vitest og Testing library for enhets- og komponenttester, og Playwright for ende-til-ende-tester (men er det pt. ingen tester). Testene kjøres med hhv. `npm run test:vitest` og `npm run test:playwright`, eller bare `npm run test`.

Saksbehandlerflaten er dokumentert i [dp-dokumentasjon](https://dagpenger-dokumentasjon.ansatt.nav.no/innbyggerflate/ramp/losninger/rapportering/saksbehandlerflate). Skissene finner du under [Saksbehandlerflate - dagpenger i Figma](https://www.figma.com/design/uQm809LGIjlDRt0kBrvBVl/Behandlingsl%C3%B8sningen?node-id=14138-57188&p=f&t=HJ4yDUkUNOCI48KW-0).

### Slik kjører du appen mot backend i dev
Sørg for at du har miljøvariablene `DP_MELDEKORTREGISTER_TOKEN=""`, `DP_MELDEKORTREGISTER_URL="https://dp-meldekortregister.intern.dev.nav.no"`, `NAIS_CLUSTER_NAME="dev-gcp"`, `MICROSOFT_TOKEN=""`, og `VITE_USE_MSW="false"`.

For å få tak i token til `DP_MELDEKORTREGISTER_TOKEN` og `MICROSOFT_TOKEN` må du være på naisdevice og besøke disse sidene, og kopiere med deg tokenet:
* [meldekortregister_token](https://azure-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp.teamdagpenger.dp-meldekortregister)
* [microsoft_token](https://azure-token-generator.intern.dev.nav.no/api/obo?aud=https://graph.microsoft.com/.default)

Tokenet er gyldig i 1 time før du må generere nytt token.

Du trenger også en saksbehandler fra [IDA](https://ida.intern.nav.no/). Om du mangler tilgang til IDA sender du e-post til NAV IT identhåndtering.


## TODO

- Legge til scrolling i table body i `periodeVisning.tsx`

