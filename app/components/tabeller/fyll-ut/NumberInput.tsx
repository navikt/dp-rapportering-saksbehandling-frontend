import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { useEffect, useId, useRef, useState } from "react";

import styles from "./numberInput.module.css";

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  readOnly?: boolean;
  description?: string;
}

const MIN = 0.5;
const MAX = 24;
const STEP = 0.5;

export function NumberInput({
  value,
  onChange,
  label,
  readOnly = false,
  description,
}: NumberInputProps) {
  const id = useId();
  const [validationError, setValidationError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentValue = parseFloat(value) || 0;
  const isAtMax = currentValue >= MAX;
  const isAtMin = currentValue <= MIN;

  useEffect(() => {
    if (validationError) {
      // Skjul feilmelding etter 3 sekunder
      timeoutRef.current = setTimeout(() => {
        setValidationError(null);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [validationError]);

  const handleIncrement = () => {
    if (readOnly || isAtMax) return;
    const newValue = Math.min(currentValue + STEP, MAX);
    onChange(newValue.toString());
  };

  const handleDecrement = () => {
    if (readOnly || isAtMin) return;
    const newValue = Math.max(currentValue - STEP, MIN);
    onChange(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const inputValue = e.target.value;

    // Tillat tom streng for å kunne slette
    if (inputValue === "") {
      setValidationError(null);
      onChange(inputValue);
      return;
    }

    // Valider at bare tall med .5 desimal eller hele tall er tillatt
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setValidationError("Ugyldig tall");
      return;
    }

    // Sjekk om verdien er innenfor min/max grenser
    if (numValue < MIN) {
      setValidationError(`Minimum ${MIN} timer`);
      return;
    }

    if (numValue > MAX) {
      setValidationError(`Maksimum ${MAX} timer`);
      return;
    }

    // Sjekk om tallet er et gyldig step-increment (hele tall eller .5)
    const decimal = numValue % 1;
    if (decimal !== 0 && decimal !== 0.5) {
      setValidationError("Kun hele eller halve timer (f.eks. 2 eller 2.5)");
      return;
    }

    setValidationError(null);
    onChange(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} role="group" aria-labelledby={`${id}-label`}>
        <label id={`${id}-label`} htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          type="number"
          id={id}
          className={`${styles.input} ${validationError ? styles.inputError : ""}`}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          min={MIN}
          max={MAX}
          step={STEP}
          readOnly={readOnly}
          title={description}
          aria-invalid={validationError ? true : undefined}
        />
        {validationError && (
          <div className={styles.tooltip} role="alert">
            {validationError}
          </div>
        )}
        {!readOnly && (
          <div className={styles.buttons} role="group" aria-label="Juster verdi">
            <button
              type="button"
              className={styles.button}
              onClick={handleIncrement}
              disabled={isAtMax}
              aria-label={`Øk ${label}`}
              aria-controls={id}
            >
              <ChevronUpIcon aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={handleDecrement}
              disabled={isAtMin}
              aria-label={`Reduser ${label}`}
              aria-controls={id}
            >
              <ChevronDownIcon aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
