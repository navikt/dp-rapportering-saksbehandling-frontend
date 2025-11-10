export const MIN_TIMER = 0.5;
export const MAX_TIMER = 24;
export const STEP_TIMER = 0.5;

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

/**
 * Validerer at en tallverdi er innenfor gyldig område (MIN-MAX)
 */
export function validerTimerGrenser(value: number): ValidationResult {
  if (value < MIN_TIMER) {
    return {
      isValid: false,
      errorMessage: `Minimum ${MIN_TIMER} timer`,
    };
  }

  if (value > MAX_TIMER) {
    return {
      isValid: false,
      errorMessage: `Maksimum ${MAX_TIMER} timer`,
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
}

/**
 * Validerer at et tall er et gyldig step-increment (hele tall eller .5)
 */
export function validerTimerSteg(value: number): ValidationResult {
  const decimal = value % 1;

  if (decimal !== 0 && decimal !== 0.5) {
    return {
      isValid: false,
      errorMessage: "Kun hele eller halve timer (f.eks. 2 eller 2.5)",
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
}

/**
 * Validerer en input-verdi for arbeidstimer
 * Sjekker om verdien er et gyldig tall, innenfor grenser, og har gyldig steg
 */
export function validerTimerInput(inputValue: string): ValidationResult {
  // Tom streng er tillatt (for å kunne slette)
  if (inputValue === "") {
    return {
      isValid: true,
      errorMessage: null,
    };
  }

  // Sjekk om det bare er komma/punktum uten tall (f.eks. ".", ",", ".,", osv.)
  const trimmedValue = inputValue.trim();
  if (/^[.,]+$/.test(trimmedValue)) {
    return {
      isValid: false,
      errorMessage: "Ugyldig tall",
    };
  }

  const numValue = parseFloat(inputValue);

  if (isNaN(numValue)) {
    return {
      isValid: false,
      errorMessage: "Ugyldig tall",
    };
  }

  // Sjekk grenser
  const grenserResult = validerTimerGrenser(numValue);
  if (!grenserResult.isValid) {
    return grenserResult;
  }

  // Sjekk steg
  const stegResult = validerTimerSteg(numValue);
  if (!stegResult.isValid) {
    return stegResult;
  }

  return {
    isValid: true,
    errorMessage: null,
  };
}

/**
 * Beregner ny verdi ved inkrement, sikrer at den ikke overstiger MAX
 */
export function inkrementerTimer(currentValue: number): number {
  return Math.min(currentValue + STEP_TIMER, MAX_TIMER);
}

/**
 * Beregner ny verdi ved dekrement, sikrer at den ikke går under MIN
 */
export function dekrementerTimer(currentValue: number): number {
  return Math.max(currentValue - STEP_TIMER, MIN_TIMER);
}

/**
 * Sjekker om en verdi er ved maksimum
 */
export function erVedMaksimum(value: number): boolean {
  return value >= MAX_TIMER;
}

/**
 * Sjekker om en verdi er ved minimum
 */
export function erVedMinimum(value: number): boolean {
  return value <= MIN_TIMER;
}
