# Sanity CMS Integrasjon

Dette prosjektet bruker Sanity CMS for å hente tekstinnhold.

## Mappestruktur

```
app/sanity/
├── client.ts                    # Sanity client konfigurasjon
├── utils.ts                     # Utility-funksjoner (sanityDataMangler)
├── components/                  # Gjenbrukbare komponenter
│   └── SanityDevWarning.tsx     # Dev-warning for manglende data
├── sider/                       # Queries og types for sider
│   └── forside/
│       ├── queries.ts
│       └── types.ts
├── modaler/                     # Queries og types for modaler
└── fellesKomponenter/           # Queries og types for felles komponenter
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

### Hente data fra Sanity

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
npm test -- client.test.ts
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
