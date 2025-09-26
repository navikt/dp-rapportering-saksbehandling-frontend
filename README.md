# Saksbehandlerflate for dagpengemeldekort

En moderne React-basert saksbehandlerløsning for rapportering og behandling av dagpengemeldekort i NAV.

## Om prosjektet

Dette er en saksbehandlerflate utviklet av team RAMP som gir saksbehandlere mulighet til å:

- Behandle og godkjenne dagpengemeldekort
- Korrigere innsendte meldekort
- Følge opp rapporteringsperioder
- Administrere periodedata for brukere

Applikasjonen er bygget med moderne webteknologier og følger NAVs designsystem.

## Teknisk stack

- **Framework**: React Router v7 (framework mode)
- **Frontend**: React 19 med TypeScript
- **Styling**: NAV Aksel designsystem (@navikt/ds-react)
- **Mocking**: MSW (Mock Service Worker) for utvikling
- **Testing**: Vitest + Testing Library (enhetstester) og Playwright (e2e-tester)
- **Deployment**: NAIS på Google Cloud Platform
- **Node.js**: Versjon 22+ (se `.nvmrc`)

## Kom i gang

### Forutsetninger

- Node.js v22+ (sjekk `.nvmrc` for eksakt versjon)
- npm
- VS Code med Prettier-plugin anbefales

### Oppsett for lokal utvikling

1. **Klon repositoryet**

   ```bash
   git clone https://github.com/navikt/dp-rapportering-saksbehandling-frontend.git
   cd dp-rapportering-saksbehandling-frontend
   ```

2. **Installer avhengigheter**

   ```bash
   npm install
   ```

3. **Konfigurer miljøvariabler**

   ```bash
   cp .env.example .env
   ```

   For lokal utvikling med mock-data kan du beholde standardverdiene:

   ```
   VITE_IS_LOCALHOST="true"
   VITE_USE_MSW="true"
   ```

4. **Start utviklingsserveren**
   ```bash
   npm run dev
   ```

Applikasjonen vil være tilgjengelig på `http://localhost:5173`

### Kjøring mot backend i dev

For å teste mot faktisk backend i dev-miljø:

1. **Sett opp miljøvariabler**:

   ```bash
   DP_MELDEKORTREGISTER_TOKEN="[token]"
   DP_MELDEKORTREGISTER_URL="https://dp-meldekortregister.intern.dev.nav.no"
   NAIS_CLUSTER_NAME="dev-gcp"
   MICROSOFT_TOKEN="[token]"
   VITE_USE_MSW="false"
   ```

2. **Hent nødvendige tokens** (krever naisdevice):
   - [Meldekortregister token](https://azure-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp.teamdagpenger.dp-meldekortregister)
   - [Microsoft token](https://azure-token-generator.intern.dev.nav.no/api/obo?aud=https://graph.microsoft.com/.default)

   **Merk**: Tokens er gyldige i 1 time.

3. **Saksbehandlertilgang**: Du trenger tilgang via [IDA](https://ida.intern.nav.no/). Kontakt NAV IT identhåndtering for tilgang.

## Testing

```bash
# Alle tester
npm run test

# Kun enhetstester (Vitest)
npm run test:vitest

# Ende-til-ende tester (Playwright)
npm run test:playwright
```

## Utvikling

### Viktige kommandoer

```bash
npm run dev          # Start utviklingsserver
npm run build        # Bygg produksjonsversjon
npm run start        # Kjør produksjonsserver
npm run typecheck    # TypeScript type-sjekking
npm run lint         # ESLint kodesjekk
```

### Pre-commit hooks

Prosjektet bruker Husky for pre-commit hooks som automatisk:

- Formatter kode med Prettier
- Kjører ESLint
- Utfører TypeScript type-sjekking

### Mappestruktur

```
app/
├── components/          # Gjenbrukbare React-komponenter
├── routes/             # React Router ruter og sider
├── hooks/              # Custom React hooks
├── models/             # TypeScript typer og modeller
├── mocks/              # MSW mock handlers
├── utils/              # Hjelpefunksjoner
├── styles/             # Globale CSS-filer
└── context/            # React Context providers
```

## Dokumentasjon

- **Faglig dokumentasjon**: [dp-dokumentasjon](https://dagpenger-dokumentasjon.ansatt.nav.no/innbyggerflate/ramp/losninger/rapportering/saksbehandlerflate)
- **Design**: [Figma - Saksbehandlerflate dagpenger](https://www.figma.com/design/uQm809LGIjlDRt0kBrvBVl/Behandlingsl%C3%B8sningen?node-id=14138-57188&p=f&t=HJ4yDUkUNOCI48KW-0)
- **React Router v7**: [Offisiell dokumentasjon](https://reactrouter.com/start/framework/installation)

## Deployment

Applikasjonen deployes automatisk til NAIS ved push til main branch. Deployment-konfigurasjon finnes i `.nais/`-mappen.

### Miljøer

- **Development**: Automatisk deployment ved PR merge
- **Production**: Manuell deployment via GitHub Actions

## Bidra til utvikling

1. Opprett en feature branch fra `main`
2. Gjør endringer og sørg for at alle tester passerer
3. Opprett en Pull Request med beskrivelse av endringene
4. Vent på code review og godkjenning

### Kodestandarder

- Bruk Prettier for formattering
- Følg TypeScript strict mode
- Skriv tester for ny funksjonalitet
- Følg NAV Aksel designsystem

## Support

- **Team**: Team Dagpenger
- **Slack**: #team-dagpenger
- **Issues**: Opprett issue i dette repositoryet

---

**Utviklet av Team RAMP, NAV IT**
