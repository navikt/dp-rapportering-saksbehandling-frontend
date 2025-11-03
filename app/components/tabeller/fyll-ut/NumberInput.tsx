import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { useEffect, useId, useRef, useState } from "react";

import {
  dekrementerTimer,
  erVedMaksimum,
  erVedMinimum,
  inkrementerTimer,
  MAX_TIMER,
  MIN_TIMER,
  STEP_TIMER,
  validerTimerInput,
} from "./NumberInput.helpers";
import styles from "./numberInput.module.css";

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  readOnly?: boolean;
  description?: string;
}

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
  const isAtMax = erVedMaksimum(currentValue);
  const isAtMin = erVedMinimum(currentValue);

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
    const newValue = inkrementerTimer(currentValue);
    onChange(newValue.toString());
  };

  const handleDecrement = () => {
    if (readOnly || isAtMin) return;
    const newValue = dekrementerTimer(currentValue);
    onChange(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const inputValue = e.target.value;

    const validationResult = validerTimerInput(inputValue);

    if (!validationResult.isValid) {
      setValidationError(validationResult.errorMessage);
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
          min={MIN_TIMER}
          max={MAX_TIMER}
          step={STEP_TIMER}
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
