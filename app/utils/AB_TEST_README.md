# AB Testing System

Dette er et fleksibelt AB-testing system for demo-miljøet som lar oss teste ulike UI-varianter side-om-side.

## Oversikt

AB-testing systemet lar deg teste ulike UI-varianter i demo-miljøet. Varianter kan velges på to måter:
1. Via lenker på forsiden (`/`) som automatisk legger til `?variant=A` eller `?variant=B` i URL-en
2. Ved å legge til `?variant=A/B` manuelt i URL-en

**Varianter:**

- **Standard (ingen query param)** - Original layout (samme som Variant A)
- **Variant A** (`?variant=A`) - Standardversjon av grensesnittet
- **Variant B** (`?variant=B`) - Alternativ UI-variant for testing

**Viktig:**

- Kun aktivt i demo-miljø (dev/prod returnerer alltid `null`)
- Variant A og "ingen variant" bruker samme kode/styling
- Hver variant kan ha egne CSS-filer og/eller betinget rendering-logikk

## Demo-forsiden

I demo-miljøet viser forsiden (`/`) en liste over testpersoner. For hver person vises to lenker:

```typescript
// app/routes/_index.tsx
{data.personer.flatMap((person) => [
  <LinkCard key={`${person.id}-A`}>
    <LinkCard.Anchor href={`/person/${person.id}/perioder?variant=A`}>
      {navn}
    </LinkCard.Anchor>
    <LinkCard.Description>Variant A</LinkCard.Description>
  </LinkCard>,
  <LinkCard key={`${person.id}-B`}>
    <LinkCard.Anchor href={`/person/${person.id}/perioder?variant=B`}>
      {navn}
    </LinkCard.Anchor>
    <LinkCard.Description>Variant B</LinkCard.Description>
  </LinkCard>,
])}
```

Dette gjør det enkelt å åpne samme testperson i ulike varianter for sammenligning.

## Hvordan det fungerer

### 1. Hente variant i route loader

I en route (f.eks. `person.$personId.perioder.tsx`):

```typescript
import { getABTestVariant } from "~/utils/ab-test.server";

export async function loader({ request }: Route.LoaderArgs) {
  const variant = getABTestVariant(request);
  // Returnerer "A", "B", "C" eller null (kun i demo-miljø)

  return { variant };
}
```

### 2. Sende variant til komponenter

```typescript
export default function Rapportering({ loaderData }: Route.ComponentProps) {
  const { variant } = loaderData;

  return (
    <MeldekortListe
      perioder={perioder}
      variant={variant}
    />
  );
}
```

### 3. Bruke variant i komponenter

#### Metode A: Velge CSS-fil basert på variant

```typescript
import stylesOriginal from "~/styles/route-styles/korriger.module.css";
import stylesVariantB from "~/styles/route-styles/korrigerVariantB.module.css";
import stylesVariantC from "~/styles/route-styles/korrigerVariantC.module.css";

export default function Korriger({ variant }) {
  // Variant A og null bruker begge stylesOriginal (standard)
  const styles =
    variant === "C" ? stylesVariantC :
    variant === "B" ? stylesVariantB :
    stylesOriginal; // Fallback for både Variant A og null

  return <div className={styles.container}>...</div>;
}
```

#### Metode B: Betinget rendering basert på variant

```typescript
export function Kalender({ variant }) {
  // Variant C: Stacked layout med synlige uke-labels
  if (variant === "C") {
    return (
      <table className={stylesVariantC.kalenderTabellC}>
        <UkeRad dager={forsteUke} ukenummer={1} showLabel={true} />
        <UkeRad dager={andreUke} ukenummer={2} showLabel={true} />
      </table>
    );
  }

  // Standard (null/A/B): Side-by-side layout
  return (
    <table className={styles.kalenderTabell}>
      <UkeRad dager={forsteUke} />
      <UkeRad dager={andreUke} />
    </table>
  );
}
```

#### Metode C: Toggle placement og labels

```typescript
import { getTogglePlacement } from "~/utils/ab-test.server";

export function FyllUtTabell({ variant }) {
  const togglePlacement = getTogglePlacement(variant);
  // Returnerer "left" (default, A, C) eller "right" (B)

  const useVariantLabels = variant === "B" || variant === "C";
  // Variant B og C bruker alternative labels

  return (
    <div>
      {togglePlacement === "right" && <Toggle />}
      <Label>{useVariantLabels ? "Ny label" : "Original label"}</Label>
      {togglePlacement === "left" && <Toggle />}
    </div>
  );
}
```

## Variant-spesifikk styling

Hver komponent/route kan ha separate CSS-filer per variant:

```
app/styles/route-styles/
  ├── korriger.module.css          # Standard/fallback
  ├── korrigerVariantB.module.css  # Variant B spesifikk
  └── korrigerVariantC.module.css  # Variant C spesifikk

app/components/tabeller/kalender/
  ├── kalender.module.css          # Standard/fallback
  ├── kalenderVariantB.module.css  # Variant B spesifikk
  └── kalenderVariantC.module.css  # Variant C spesifikk
```

### Eksempel på variant-spesifikk CSS

```css
/* korrigerVariantC.module.css */
.begrunnelse {
  flex: 2;
}

.begrunnelse :global(.aksel-textarea__input) {
  height: 115px !important;
  --__ac-textarea-height: 115px;
  --__axc-textarea-height: 115px;
}
```

## URL-struktur

```
/                                 → Demo-forsiden med liste over testpersoner
/person/123/perioder              → Ingen variant (null, bruker standard)
/person/123/perioder?variant=A    → Variant A (standard)
/person/123/perioder?variant=B    → Variant B (alternativ UI)
```

## VariantSwitcher komponenten

I demo-miljøet vises en `VariantSwitcher` komponent som lar brukere bytte variant via radio buttons:

```typescript
import { VariantSwitcher } from "~/components/variant-switcher/VariantSwitcher";

// Vises kun i demo-miljø
{isABTestingEnabled() && <VariantSwitcher />}
```

Komponenten:

- Leser current variant fra URL
- Lar brukeren bytte mellom Standard/A/B
- Oppdaterer URL med ny variant
- Gjør det enkelt å sammenligne varianter uten å gå tilbake til forsiden

## Miljø

- **Demo** (MSW aktivert): AB-testing er aktivt, `getABTestVariant()` returnerer variant fra URL eller `null`
  - Forsiden viser liste over testpersoner med lenker til Variant A og B
  - VariantSwitcher vises for å bytte mellom varianter
- **Dev/Prod**: AB-testing er deaktivert, `getABTestVariant()` returnerer alltid `null`
  - Demo-forsiden vises ikke
  - Kun standard UI brukes

## Utilities

### AB Test utilities (ab-test.server.ts / ab-test.utils.ts)

#### `getABTestVariant(request: Request): ABTestVariant`

Henter variant fra URL query parameter. Kun aktivt i demo-miljø.

```typescript
const variant = getABTestVariant(request);
// Returnerer "A" | "B" | null
```

#### `getTogglePlacement(variant: ABTestVariant): TogglePlacement`

Bestemmer om toggle skal være på venstre eller høyre side.

```typescript
const placement = getTogglePlacement(variant);
// Returnerer "left" (standard, A) eller "right" (B)
```

#### `isABTestingEnabled(): boolean`

Sjekker om AB-testing er aktivert (dvs. om vi er i demo-miljø).

```typescript
if (isABTestingEnabled()) {
  // Vis VariantSwitcher eller annen test-spesifikk UI
}
```

#### `buildVariantURL(baseURL: string, variant: ABTestVariant): string`

Bygger URL med variant query parameter.

```typescript
const url = buildVariantURL("/person/123/perioder", "B");
// Returnerer "/person/123/perioder?variant=B"
```

### Demo params utilities (demo-params.utils.ts)

Disse utilities håndterer automatisk propagering av demo-parametere (som `variant`) gjennom navigasjon og redirects.

#### `getDemoParams(url: string | URL | Request): Record<string, string>`

Henter alle demo-relevante query params fra en URL.

```typescript
const params = getDemoParams(request);
// Returnerer { variant: "B" } hvis URL er /person/123?variant=B
```

#### `addDemoParamsToURL(targetUrl: URL, sourceUrl?: string | URL | Request): void`

Legger til alle demo params fra source URL til target URL. Brukes i redirects for å bevare variant.

```typescript
// I en action function
const url = new URL(`/person/${personId}/perioder`, request.url);
addDemoParamsToURL(url, request); // Bevarer ?variant=B fra request
return redirect(url.pathname + url.search);
```

#### `buildURLWithDemoParams(path: string, additionalParams?: Record<string, string>): string`

Lager en URL med demo params fra current context. Brukes i Link-komponenter.

```typescript
// I en komponent
const href = buildURLWithDemoParams(`/person/${personId}/periode/${periodeId}/fyll-ut`);
// Automatisk legger til ?variant=B hvis det er i current URL
```

#### `getVariant(url: string | URL | Request): ABTestVariant`

Type-safe getter for variant parameter.

```typescript
const variant = getVariant(request);
// Returnerer "A" | "B" | null
```

### Hvorfor demo-params utilities?

Før disse utilities ble lagt til, måtte vi manuelt propagere `variant` parameter i hver redirect og link. Dette var feilutsatt og lett å glemme.

**Før:**
```typescript
// Måtte manuelt legge til variant i hver redirect
return redirect(`/person/${personId}/perioder?variant=${variant}`);
```

**Etter:**
```typescript
// Automatisk propagering av alle demo params
const url = new URL(`/person/${personId}/perioder`, request.url);
addDemoParamsToURL(url, request);
return redirect(url.pathname + url.search);
```

Dette sikrer at variant-parameter aldri går tapt når brukere navigerer rundt i applikasjonen.

## Legge til en ny variant

### 1. Oppdater type-definisjon (hvis nødvendig)

```typescript
// app/utils/ab-test.utils.ts
export type ABTestVariant = "A" | "B" | "C" | "D" | null;
```

### 2. Opprett variant-spesifikk CSS

```css
/* app/styles/route-styles/korrigerVariantD.module.css */
.container {
  /* Variant D spesifikk styling */
}
```

### 3. Importer og bruk i komponenten

```typescript
import stylesVariantD from "~/styles/route-styles/korrigerVariantD.module.css";

const styles =
  variant === "D"
    ? stylesVariantD
    : variant === "C"
      ? stylesVariantC
      : variant === "B"
        ? stylesVariantB
        : stylesOriginal;
```

### 4. Legg til i VariantSwitcher (hvis ønsket)

```typescript
<Radio value="D">Variant D</Radio>
```

## Eksempel: Komplett flow

```typescript
// 1. Route loader henter variant
export async function loader({ request }: Route.LoaderArgs) {
  const variant = getABTestVariant(request);
  return { variant };
}

// 2. Route bruker variant for å velge styles
export default function Korriger({ loaderData }) {
  const { variant } = loaderData;
  const styles =
    variant === "C" ? stylesVariantC :
    variant === "B" ? stylesVariantB :
    stylesOriginal;

  return (
    <div className={styles.container}>
      <Kalender variant={variant} />
      <FyllUtTabell variant={variant} />
    </div>
  );
}

// 3. Komponenter tilpasser UI basert på variant
export function Kalender({ variant }) {
  if (variant === "C") {
    return <StackedKalender />;
  }
  return <SideBySideKalender />;
}
```
