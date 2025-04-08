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