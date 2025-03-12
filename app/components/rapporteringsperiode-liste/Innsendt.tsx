import { Tag, Popover, Heading, Tooltip } from "@navikt/ds-react";
import { differenceInDays, parseISO } from "date-fns";
import { formatterDato } from "~/utils/dato.utils";
import { useState, useRef } from "react";

interface IProps {
  mottattDato: string;
  tilOgMed: string;
  sisteFristForTrekk: string | null;
}

export const SISTE_FRIST = 10; // Endre til hvor mange dager det skal være for sent

export function Innsendt({ mottattDato, tilOgMed, sisteFristForTrekk }: IProps) {
  const dagerForskjell = differenceInDays(parseISO(mottattDato), parseISO(tilOgMed));
  const forSent = dagerForskjell >= SISTE_FRIST;
  const tagRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  if (forSent) {
    return (
      <Tooltip
        content={`Frist: ${
          sisteFristForTrekk ? formatterDato({ dato: sisteFristForTrekk }) : "Ingen frist"
        }`}
      >
        <Tag
          ref={tagRef}
          variant="error"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          {formatterDato({ dato: mottattDato })}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <div className="neutralTag">
      <Tooltip
        content={`Frist: ${
          sisteFristForTrekk ? formatterDato({ dato: sisteFristForTrekk }) : "Ingen frist"
        }`}
      >
        <Tag variant="neutral">{formatterDato({ dato: mottattDato })}</Tag>
      </Tooltip>
    </div>
  );
}
