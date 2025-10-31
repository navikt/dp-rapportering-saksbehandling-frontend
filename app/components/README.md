# Komponenter - Struktur og konvensjoner

Dette dokumentet beskriver hvordan vi organiserer komponenter i prosjektet.

## Mappestruktur

```
app/components/
├── meldekort-liste/
│   ├── MeldekortListe.tsx           # Hovedkomponent
│   ├── meldekortListe.module.css    # Styling for hovedkomponent
│   ├── utils.ts                      # Delte utils for hele modulen
│   └── components/
│       └── rad/
│           ├── MeldekortRad.tsx
│           ├── MeldekortRad.helpers.ts
│           ├── MeldekortRad.test.tsx
│           └── meldekortRad.module.css
```

## Filtyper og deres formål

### Komponenter (`*.tsx`)

**Hovedkomponent** - Definerer UI-strukturen og håndterer state

- Skal være så enkel og lesbar som mulig
- Ekstraherer kompleks logikk til helpers
- Fokuserer på rendering og brukerinteraksjon

```typescript
// MeldekortRad.tsx
export function MeldekortRad({ periode }: Props) {
  const statusConfig = getStatusConfig(periode); // Fra helpers

  return (
    <Table.DataCell>
      <Tag variant={statusConfig.variant}>
        {statusConfig.text}
      </Tag>
    </Table.DataCell>
  );
}
```

### Helper-funksjoner (`*.helpers.ts`)

**Komponent-spesifikk logikk** - Business logic tett knyttet til én komponent

- Kun brukt av én spesifikk komponent
- Gjør komponenten enklere å lese og vedlikeholde
- Enklere å teste isolert fra React

```typescript
// MeldekortRad.helpers.ts
export function getStatusConfig(periode: IRapporteringsperiode): StatusConfig {
  if (periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt) {
    return { text: "Innsendt", variant: "success" };
  }
  // ... mer logikk
}
```

**Når skal du bruke `.helpers.ts`?**

- ✅ Logikken er kun relevant for én komponent
- ✅ Det gjør komponenten mer lesbar å flytte ut logikken
- ✅ Du vil teste logikken isolert
- ✅ Kompleks beregning eller transformering av data

### Utils (`utils.ts` eller `*.utils.ts`)

**Delte funksjoner** - Gjenbrukbar logikk på tvers av komponenter

- Brukes av flere komponenter i samme modul eller app-wide
- Domeneuavhengig eller domene-spesifikk gjenbrukbar logikk

```typescript
// app/components/meldekort-liste/utils.ts
export function sorterAktiviteter(aktiviteter: TAktivitetType[]) {
  return aktiviteter.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));
}
```

**Når skal du bruke `utils.ts`?**

- ✅ Funksjonen brukes av flere komponenter
- ✅ Generisk transformering/formatering
- ✅ Domenespesifikk logikk som gjelder bredt

**Nivåer av utils:**

```
app/
├── utils/                          # Globale utils (dato, fetch, etc)
│   ├── dato.utils.ts
│   └── rapporteringsperiode.utils.ts
├── components/
│   └── meldekort-liste/
│       └── utils.ts                # Modul-spesifikke utils
```

### Tester (`*.test.ts`, `*.test.tsx`)

**Test helpers separat**

```typescript
// MeldekortRad.helpers.test.ts
describe("getStatusConfig", () => {
  it("skal returnere success for innsendt periode", () => {
    const result = getStatusConfig(innsendtPeriode);
    expect(result).toEqual({ text: "Innsendt", variant: "success" });
  });
});
```

**Test komponenten**

```typescript
// MeldekortRad.test.tsx
describe("MeldekortRad", () => {
  it("skal vise status tag", () => {
    render(<MeldekortRad periode={periode} />);
    expect(screen.getByText("Innsendt")).toBeInTheDocument();
  });
});
```

### CSS Modules (`*.module.css`)

**Component-scoped styling**

- Navngivning: camelCase for klasser (`periodeListe__row`)
- BEM-lignende struktur for readability

```css
/* meldekortRad.module.css */
.periodeListe__row {
  transition: background-color 0.2s ease-out;
}

.periodeListe__row--highlighted {
  animation: highlightBlinkAndFade 3.5s ease-out;
}
```

## Refaktoreringsflyt

Når du refaktorerer en komponent:

### 1. Start i komponenten

```typescript
// MeldekortRad.tsx (før refaktorering)
export function MeldekortRad({ periode }: Props) {
  const statusText =
    periode.status === "Innsendt"
      ? "Innsendt"
      : periode.kanSendes
        ? "Klar til utfylling"
        : "Meldekort opprettet";
  // Kompleks logikk direkte i komponenten
}
```

### 2. Flytt til helpers

```typescript
// MeldekortRad.helpers.ts
export function getStatusConfig(periode: IRapporteringsperiode) {
  // Logikk flyttet ut
}

// MeldekortRad.tsx (etter refaktorering)
export function MeldekortRad({ periode }: Props) {
  const statusConfig = getStatusConfig(periode);
  // Mye enklere!
}
```

### 3. Hvis gjenbrukt - flytt til utils

Hvis du senere oppdager at `getStatusConfig` brukes av andre komponenter:

```typescript
// Flytt fra MeldekortRad.helpers.ts
// Til   meldekort-liste/utils.ts (eller app/utils/ hvis global)
```

## Best practices

### ✅ DO

- Hold komponenter enkle og fokuserte
- Ekstraher kompleks logikk til helpers
- Skriv tester for både helpers og komponenter
- Bruk TypeScript types konsistent
- Kommenter hvorfor, ikke hva

### ❌ DON'T

- Ikke ha business logic direkte i JSX
- Ikke dupliser kode mellom komponenter
- Ikke blande styles med logic
- Ikke skip testing
- Ikke bruk magic numbers

## Eksempel: God komponentstruktur

```
meldekort-rad/
├── MeldekortRad.tsx              # kun rendering og state
├── MeldekortRad.helpers.ts       # business logic
├── MeldekortRad.helpers.test.ts  # test helpers
├── MeldekortRad.test.tsx         # test component
└── meldekortRad.module.css       # styling
```

**Fordeler med denne strukturen:**

- Lett å finne ting
- Enklere å teste
- Bedre lesbarhet
- Enklere vedlikehold
- Gjenbrukbar kode

## Spørsmål?

Kontakt #team-dagpenger på Slack hvis du lurer på noe!
