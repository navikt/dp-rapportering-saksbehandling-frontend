import { Tag, Popover, Heading } from "@navikt/ds-react";
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
      <>
        <Tag
          ref={tagRef}
          variant="error"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          {formatterDato({ dato: mottattDato })}
        </Tag>

        <Popover
          open={open}
          onClose={() => setOpen(false)}
          anchorEl={tagRef.current}
          placement="top-start"
        >
          <Popover.Content>
            <Heading size="xsmall">Fristen er overskredet</Heading>
            <p>
              Frist:{" "}
              {sisteFristForTrekk ? formatterDato({ dato: sisteFristForTrekk }) : "Ingen frist"}
            </p>
          </Popover.Content>
        </Popover>
      </>
    );
  }

  return (
    <div className="neutralTag">
      <Tag variant="neutral">{formatterDato({ dato: mottattDato })}</Tag>
    </div>
  );
}
