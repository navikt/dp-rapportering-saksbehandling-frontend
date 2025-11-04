# AB Testing System

Dette er et fleksibelt AB-testing system for demo-miljøet.

## Oversikt

- **Variant A**: Standard/original layout (toggle venstre)
- **Variant B**: Toggle på høyre side
- **Variant C**: Fleksibel variant som kan konfigureres per feature

## Hvordan bruke systemet

### 1. Enkel toggle placement

For å bare sjekke toggle placement (venstre/høyre):

```typescript
import { getTogglePlacement } from "~/utils/ab-test.server";

const togglePlacement = getTogglePlacement(variant);
// Returns "left" eller "right"
```

### 2. Feature-spesifikk logikk (f.eks. for Variant C)

Hvis du vil at Variant C skal oppføre seg forskjellig basert på kontekst (f.eks. kun for korrigering):

```typescript
import { shouldShowFeature, AB_TEST_FEATURES } from "~/utils/ab-test.server";

// I en komponent som har tilgang til periode-data:
const erKorrigering = !!periode.originalMeldekortId;

const skalViseSpesiellLayout = shouldShowFeature(
  variant,
  AB_TEST_FEATURES.KORRIGERING_LAYOUT,
  { isKorrigering: erKorrigering }
);

if (skalViseSpesiellLayout) {
  // Vis spesiell layout for Variant C + korrigering
}
```

### 3. Legge til nye features

I `ab-test.server.ts`:

```typescript
export const AB_TEST_FEATURES = {
  TOGGLE_PLACEMENT: "toggle-placement",
  KORRIGERING_LAYOUT: "korrigering-layout",
  NY_FEATURE: "ny-feature", // Legg til her
} as const;

export const VARIANT_C_CONFIG: Record<ABTestFeature, string> = {
  [AB_TEST_FEATURES.TOGGLE_PLACEMENT]: "left",
  [AB_TEST_FEATURES.KORRIGERING_LAYOUT]: "special",
  [AB_TEST_FEATURES.NY_FEATURE]: "config-value", // Legg til her
};
```

Oppdater `shouldShowFeature` funksjonen med ny logikk:

```typescript
export function shouldShowFeature(
  variant: ABTestVariant,
  feature: ABTestFeature,
  context?: Record<string, unknown>,
): boolean {
  if (!variant) return false;

  if (variant === "C" && feature === AB_TEST_FEATURES.KORRIGERING_LAYOUT) {
    return context?.isKorrigering === true;
  }

  // Legg til ny feature-logikk her
  if (variant === "C" && feature === AB_TEST_FEATURES.NY_FEATURE) {
    return context?.someCondition === true;
  }

  return false;
}
```

## Eksempel: Variant C for korrigering

```typescript
// I MeldekortRad eller MeldekortListe:
import { shouldShowFeature, AB_TEST_FEATURES } from "~/utils/ab-test.server";

interface Props {
  periode: IRapporteringsperiode;
  variant?: ABTestVariant;
  // ... andre props
}

export function MeldekortRad({ periode, variant, ... }: Props) {
  const erKorrigering = !!periode.originalMeldekortId;

  const skalViseKorrigeringLayout = shouldShowFeature(
    variant,
    AB_TEST_FEATURES.KORRIGERING_LAYOUT,
    { isKorrigering: erKorrigering }
  );

  if (skalViseKorrigeringLayout) {
    // Render spesiell layout for Variant C når det er korrigering
    return <SpeciellKorrigeringLayout {...props} />;
  }

  // Normal layout
  return <NormalLayout {...props} />;
}
```

## URL-struktur

- `/person/123/perioder` - I demo: default til Variant A
- `/person/123/perioder?variant=A` - Variant A (toggle venstre)
- `/person/123/perioder?variant=B` - Variant B (toggle høyre)
- `/person/123/perioder?variant=C` - Variant C (kontekst-avhengig)

## Miljø

- **Demo**: AB-testing er aktivt, default til Variant A
- **Dev/Prod**: AB-testing er deaktivert, returnerer `null`
