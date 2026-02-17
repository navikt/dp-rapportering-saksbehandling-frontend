# Sanity CMS Integrasjon

Dette prosjektet bruker Sanity CMS for å hente tekstinnhold.

## Mappestruktur

```
app/sanity/
├── client.ts                    # Sanity client konfigurasjon
├── fetchGlobalData.ts           # Henter alle globale Sanity-data parallelt
├── utils.ts                     # Utility-funksjoner (sanityDataMangler)
├── components/                  # Gjenbrukbare komponenter
│   └── SanityDevWarning.tsx     # Dev-warning for manglende data
├── sider/                       # Queries og types for sider
│   ├── forside/
│   ├── hovedside/
│   ├── fyll-ut/                 # Fyll ut meldekort-siden
│   └── korriger/                # Korriger meldekort-siden
├── modaler/                     # Queries og types for modaler
│   ├── bekreft-modal/
│   └── historikk-modal/
└── fellesKomponenter/           # Queries og types for felles komponenter (header, footer, osv.)
    ├── header/
    ├── personlinje/
    ├── kalender/
    ├── aktiviteter/
    ├── aktivitetstabell/
    ├── statuser/
    └── varsler/
```

Strukturen speiler `dp-sanity-cms-v3/schema/meldekort/saksbehandlerflate/`

## Konfigurasjon

### Miljøvariabler

Legg til følgende i `.env`:

```bash
SANITY_DATASETT="production"
SANITY_TOKEN=""  # Valgfri - kun nødvendig for private datasett
```

### Sanity-prosjekt

- **Project ID**: `rt6o382n`
- **Dataset**: Konfigurert via `SANITY_DATASETT` (default: `production`)
- **API Version**: `2022-03-07`

## Bruk

### Globale Sanity-data

Globale data (header, personlinje, kalender, osv.) hentes automatisk i root loader via `fetchGlobalData()`:

```typescript
// app/root.tsx
import { fetchGlobalSanityData } from "~/sanity/fetchGlobalData";

export async function loader({ request }: Route.LoaderArgs) {
  const sanityData = await fetchGlobalSanityData();
  return { sanity: sanityData };
}
```

Komponenter kan bruke `useGlobalSanityData()` hook for å få tilgang til disse dataene:

```typescript
import { useGlobalSanityData } from "~/hooks/useGlobalSanityData";
import { deepMerge } from "~/utils/deep-merge.utils";

function MinKomponent() {
  const sanityData = useGlobalSanityData();

  // Merge Sanity-data med hardkodede defaults
  const tekster = deepMerge(DEFAULT_TEKSTER, sanityData?.header);

  return <div>{tekster.tittel}</div>;
}
```

### Hente side-spesifikke data

For side-spesifikke data, bruk `sanityClient` direkte i loader:

```typescript
import { sanityClient } from "~/sanity/client";
import { forsideQuery } from "~/sanity/sider/forside/queries";
import type { IMeldekortForside } from "~/sanity/sider/forside/types";

export async function loader() {
  const forsideData = await sanityClient.fetch<IMeldekortForside>(forsideQuery);
  return { forside: forsideData };
}
```

### GROQ Queries

Sanity bruker GROQ (Graph-Relational Object Queries) for spørringer:

```typescript
// TODO: Dette er hentet fra hvordan dp-rapportering-frontend gjør det - oppdaterer så fort vi har lagt til egne spørringer.

// Hent enkeltdokument
const dokument = await sanityClient.fetch(
  '*[_type == "rapporteringAppText" && textId == $textId][0]',
  { textId: "mitt-text-id" },
);

// Hent med filter og sortering
const sortert = await sanityClient.fetch('*[_type == "brevBlokk"] | order(title asc)');

// Hent med referanser
const medRef = await sanityClient.fetch(`
  *[_type == "translation.metadata"]{
    _id,
    translations[]{
      _key,
      value->
    }
  }
`);
```

## Testing

Tester finnes i `client.test.ts`.

Kjør tester:

```bash
pnpm test -- client.test.ts
```

### Manuell testing

Du kan teste Sanity-tilkoblingen ved å lage en enkel loader:

```typescript
// app/routes/test-sanity.tsx
import { sanityClient } from "~/sanity/client";

export async function loader() {
  const data = await sanityClient.fetch('*[0..9]');
  return { data };
}

export default function TestSanity() {
  const { data } = useLoaderData<typeof loader>();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

Deretter besøk `http://localhost:5173/test-sanity`

## Ressurser

- [Sanity JS Client Dokumentasjon](https://www.sanity.io/docs/js-client)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Sanity Studio (CMS)](https://www.sanity.io/docs/sanity-studio)

## Feilsøking

### "Invalid projectId"

Sjekk at `projectId` i `client.ts` stemmer med Sanity-prosjektet ditt.

### "Dataset not found"

Verifiser at `SANITY_DATASETT` i `.env` matcher et eksisterende dataset i Sanity-prosjektet.

### Mangler tilgang til private data

Legg til en gyldig `SANITY_TOKEN` i `.env`. Token kan genereres i Sanity Studio under "API" → "Tokens".
