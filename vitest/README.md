# Test dokumentasjon

Denne dokumentasjonen beskriver testmønstre og best practices for testing i dp-rapportering-saksbehandling-frontend.

## Teststruktur

### Verktøy
- **Vitest**: Enhetstester og komponenttester
- **@testing-library/react**: React-komponenttesting
- **@testing-library/user-event**: Brukerinteraksjon-simulering
- **MSW (Mock Service Worker)**: API-mocking
- **Playwright**: End-to-end testing

### Filplassering
Vi følger co-location-mønsteret der testfiler plasseres ved siden av kildekoden:

```
app/
├── components/
│   ├── Kalender.tsx
│   ├── Kalender.test.tsx          # Komponenttest
│   ├── Kalender.helpers.ts
│   └── Kalender.helpers.test.ts   # Hjelpefunksjonstest
```

### Navnekonvensjon
- Testfiler: `*.test.ts` eller `*.test.tsx`
- E2E-tester: `*.spec.ts` (i `playwright/`-mappen)
- Test-beskrivelser: Norsk, bruker "skal"-mønster

## Testmønstre

### Enhetstester

**Fokus**: Isolerte funksjoner og utilities

**Best practices**:
- **AAA-mønster**: Arrange (forbered), Act (utfør), Assert (verifiser)
- **En assertion per test**: Fokuser på én ting per testcase
- **Edge cases**: Test grenseverdier, tomme arrays, null/undefined
- **Beskrivende navn**: Tydelig hva som testes og forventet resultat

**Eksempel**:
```typescript
describe("dato.utils", () => {
  it("skal gruppere objekter etter år", () => {
    // Arrange
    const items = [
      { id: 1, dato: "2024-01-15" },
      { id: 2, dato: "2023-12-01" },
    ];

    // Act
    const result = groupByYear(items, "dato");

    // Assert
    expect(result["2024"]).toHaveLength(1);
    expect(result["2023"]).toHaveLength(1);
  });
});
```

### Komponenttester

**Fokus**: Rendering, brukerinteraksjon og tilgjengelighet

**Best practices**:
- **Testing Library queries**: Foretrekk tilgjengelighetsfokuserte queries:
  - `getByRole()` - Søk etter ARIA-roller (mest foretrukket)
  - `getByLabelText()` - For skjemaelementer
  - `getByText()` - For synlig tekst
  - Unngå `getByTestId()` - Bruk kun som siste utvei
- **User Event**: Bruk `@testing-library/user-event` for realistiske interaksjoner
- **Async handling**: Bruk `waitFor()` for asynkrone oppdateringer
- **Fake timers**: Bruk `vi.useFakeTimers()` for tidssensitiv logikk

**Eksempel**:
```typescript
describe("Toast", () => {
  it("skal lukke når bruker klikker lukk-knapp", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast melding="Test" onClose={onClose} />);

    await user.click(screen.getByLabelText("Lukk"));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

### Hook-tester

**Fokus**: Custom hooks isolert fra komponenter

**Best practices**:
- **renderHook**: Bruk fra `@testing-library/react`
- **act()**: Wrap tilstandsoppdateringer i `act()`
- **Mock dependencies**: Mock eksterne hooks med `vi.mock()`

**Eksempel**:
```typescript
describe("useMeldekortSkjema", () => {
  it("skal oppdatere arbeidssoker ved change", () => {
    const { result } = renderHook(() => useMeldekortSkjema(props));

    act(() => {
      result.current.handleArbeidssokerChange(true);
    });

    expect(result.current.arbeidssoker).toBe(true);
  });
});
```

### Integrasjonstester

**Fokus**: Samhandling mellom flere komponenter/systemer

**Best practices**:
- **Mock eksterne avhengigheter**: Mock kun API-kall, database, etc.
- **Test hele flyten**: Verifiser at data flyter korrekt
- **Reset mocks**: Bruk `beforeEach` med `vi.clearAllMocks()`
- **Test feilscenarier**: Både "happy path" og feilhåndtering

**Eksempel**:
```typescript
// Mock server-side models
vi.mock("~/models/rapporteringsperiode.server", () => ({
  oppdaterPeriode: vi.fn(),
}));

describe("api.rapportering action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skal kalle oppdaterPeriode med riktig data", async () => {
    const { oppdaterPeriode } = await import("~/models/rapporteringsperiode.server");
    vi.mocked(oppdaterPeriode).mockResolvedValue({ id: "abc" });

    const response = await action({ request: mockRequest });

    expect(oppdaterPeriode).toHaveBeenCalledOnce();
  });
});
```

### E2E-tester

**Fokus**: Hele brukerflyter i nettleseren

**Best practices**:
- **Test kritiske flyter**: Fokuser på viktigste brukeropplevelser
- **Isolasjon**: Hver test uavhengig av andre
- **Autentisering**: Sett opp cookies/session før tester
- **Vente på elementer**: Bruk `expect().toBeVisible()` i stedet for hardkodede waits

**Eksempel**:
```typescript
test("skal kunne fylle ut og sende inn meldekort", async ({ page }) => {
  await page.goto("/person/123/periode/abc/fyll-ut");

  await page.getByLabel(/timer dag 1/i).fill("7,5");
  await page.getByRole("checkbox", { name: /arbeidssøker/i }).check();
  await page.getByRole("button", { name: /send inn/i }).click();

  await expect(page).toHaveURL(/\/kvittering/);
});
```

## Mock-strategi

### MSW (Mock Service Worker)

**Setup**:
```typescript
// vitest/helpers/setup.ts
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Bruk i tester**:
```typescript
test("skal håndtere 404 feil", async () => {
  server.use(
    http.get("/api/periode/:id", () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  // Test koden din...
});
```

### Vi.mock() for komponenter og hooks

```typescript
// Mock komponenter
vi.mock("~/components/MeldekortVisning", () => ({
  MeldekortVisning: vi.fn(() => <div>Mocked</div>),
}));

// Mock hooks
vi.mock("@navikt/ds-react", () => ({
  useDatepicker: vi.fn(() => ({
    datepickerProps: {},
    inputProps: {},
  })),
}));
```

## Testdata

### Base objekter med spread operator

```typescript
const basePeriode: IRapporteringsperiode = {
  id: "abc-123",
  fraOgMed: "2024-01-01",
  tilOgMed: "2024-01-14",
  status: "TilUtfylling",
};

// Bruk spread for varianter
const innsendt = { ...basePeriode, status: "Innsendt" };
```

### Factory-funksjoner

```typescript
function createMockPeriode(overrides: Partial<IRapporteringsperiode> = {}) {
  return {
    id: "abc-123",
    fraOgMed: "2024-01-01",
    tilOgMed: "2024-01-14",
    status: "TilUtfylling",
    ...overrides,
  };
}

const periode = createMockPeriode({ status: "Innsendt" });
```

## Best practices

### Generelle prinsipper

1. **Test behavior, ikke implementation** - Test hva, ikke hvordan
2. **Isolasjon** - Hver test uavhengig, bruk `beforeEach` for setup
3. **Beskrivende navn** - Norsk "skal"-mønster
4. **DRY med måte** - Abstraher felles kode, men behold lesbarhet
5. **Test edge cases** - Tomme arrays, null/undefined, grenseverdier

### Tilgjengelighet

- Bruk accessibility queries (`getByRole`, `getByLabelText`)
- Test tastaturnavigasjon
- Verifiser ARIA-attributter

### Coverage

Kjør coverage regelmessig:
```bash
npm run test:coverage
```

**Mål**: Lines 80%, Functions 80%, Branches 75%, Statements 80%

## Kjøre tester

```bash
npm test                    # Kjør alle enhetstester
npm run test:watch          # Watch mode
npm run test:coverage       # Med coverage
npm run test:playwright     # E2E-tester
```

## Debugging

**Vitest**:
```bash
npm run test -- --ui                # UI mode
npm run test -- -t "skal vise"      # Spesifikk test
```

**Playwright**:
```bash
npx playwright test --headed        # Synlig browser
npx playwright test --debug         # Debug mode
```

## Ressurser

- [Vitest dokumentasjon](https://vitest.dev/)
- [Testing Library dokumentasjon](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright dokumentasjon](https://playwright.dev/)
- [MSW dokumentasjon](https://mswjs.io/)
- [Kent C. Dodds - Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
