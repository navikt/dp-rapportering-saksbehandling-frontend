import { Button, Heading, Tag } from "@navikt/ds-react";

import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId: string;
}

const numberFormat = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
});

export function PeriodeDetaljer({ periode, personId }: IProps) {
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = !!periode.originalId;

  const { fraOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const uker = ukenummer(periode);

  return (
    <div className={styles.periodeDetaljer}>
      <div>
        <div className={styles.header}>
          <Heading level="3" size="small">
            Uke {uker} | {formattertFraOgMed}
          </Heading>
          {erKorrigert && periode?.kilde?.rolle == "Saksbehandler" && (
            <Tag variant="info">Korrigering</Tag>
          )}
        </div>
        <table className={styles.detaljerTabell}>
          <tbody>
            <tr>
              <th scope="row">Status neste 14 dager:</th>
              <td>
                {periode.registrertArbeidssoker && (
                  <Tag variant={erArbeidssoker ? "success" : "error"}>
                    {erArbeidssoker ? "Arbeidssøker" : "Ikke arbeidssøker"}
                  </Tag>
                )}
              </td>
            </tr>

            {erKorrigert && periode?.kilde?.rolle && (
              <tr>
                <th scope="row">Korrigert av:</th>
                <td>{periode?.kilde?.rolle}</td>
              </tr>
            )}
            {periode.begrunnelseEndring && (
              <tr>
                <th scope="row">Grunn til endring:</th>
                <td>{periode.begrunnelseEndring}</td>
              </tr>
            )}
            {periode.bruttoBelop && (
              <tr>
                <th scope="row">Utbetaling av dagpenger:</th>
                <td>{periode.bruttoBelop ? numberFormat.format(periode.bruttoBelop) : "—"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button
        as="a"
        href={`/person/${personId}/periode/${periode.id}`}
        className={styles.korrigerKnapp}
      >
        Korriger meldekort
      </Button>
    </div>
  );
}
