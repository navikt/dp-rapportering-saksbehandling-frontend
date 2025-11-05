# ABC Testing System

Dette er et fleksibelt ABC-testing system for demo-miljøet som lar oss teste ulike UI-varianter side-om-side.

## Oversikt

ABC-testing systemet lar deg teste ulike UI-varianter i demo-miljøet ved å legge til `?variant=A/B/C` i URL-en.

**Varianter:**
- **Standard (ingen query param)** - Original layout
- **Variant A** (`?variant=A`) - Identisk med standard
- **Variant B** (`?variant=B`) - Alternativ UI-variant
- **Variant C** (`?variant=C`) - Alternativ UI-variant

**Viktig:**
- Kun aktivt i demo-miljø (dev/prod returnerer alltid `null`)
- Variant A og "ingen variant" bruker samme kode/styling
- Hver variant kan ha egne CSS-filer og/eller betinget rendering-logikk

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

.begrunnelse :global(.navds-textarea__input) {
  height: 115px !important;
  --__ac-textarea-height: 115px;
  --__axc-textarea-height: 115px;
}
```

## URL-struktur

```
/person/123/perioder              → Ingen variant (null)
/person/123/perioder?variant=A    → Variant A
/person/123/perioder?variant=B    → Variant B
/person/123/perioder?variant=C    → Variant C
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
- Lar brukeren bytte mellom Standard/B/C
- Oppdaterer URL med ny variant

## Miljø

- **Demo**: ABC-testing er aktivt, `getABTestVariant()` returnerer variant fra URL eller `null`
- **Dev/Prod**: ABC-testing er deaktivert, `getABTestVariant()` returnerer alltid `null`

## Utilities

### `getABTestVariant(request: Request): ABTestVariant`

Henter variant fra URL query parameter. Kun aktivt i demo-miljø.

```typescript
const variant = getABTestVariant(request);
// Returnerer "A" | "B" | "C" | null
```

### `getTogglePlacement(variant: ABTestVariant): TogglePlacement`

Bestemmer om toggle skal være på venstre eller høyre side.

```typescript
const placement = getTogglePlacement(variant);
// Returnerer "left" (standard, A, C) eller "right" (B)
```

### `isABTestingEnabled(): boolean`

Sjekker om ABC-testing er aktivert (dvs. om vi er i demo-miljø).

```typescript
if (isABTestingEnabled()) {
  // Vis VariantSwitcher eller annen test-spesifikk UI
}
```

### `buildVariantURL(baseURL: string, variant: ABTestVariant): string`

Bygger URL med variant query parameter.

```typescript
const url = buildVariantURL("/person/123/perioder", "B");
// Returnerer "/person/123/perioder?variant=B"
```

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
  variant === "D" ? stylesVariantD :
  variant === "C" ? stylesVariantC :
  variant === "B" ? stylesVariantB :
  stylesOriginal;
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
