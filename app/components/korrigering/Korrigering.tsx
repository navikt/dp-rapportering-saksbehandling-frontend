import { Button, Textarea } from "@navikt/ds-react";
import classNames from "classnames";
import { useFetcher } from "react-router";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { hentUkerFraPeriode } from "~/utils/dato.utils";
import type { IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

import { beregnTotalt } from "../rapporteringsperiode-visning/sammenlagt.utils";
import styles from "./Korrigering.module.css";
import { type SetKorrigerteDager } from "./korrigering.utils";
import { KorrigeringUke } from "./KorrigeringUke";

interface IProps {
  korrigerteDager: IRapporteringsperiodeDag[];
  setKorrigerteDager: SetKorrigerteDager;
  originalPeriode: IRapporteringsperiode;
  setKorrigertBegrunnelse: (value: string) => void;
  korrigertBegrunnelse: string;
}

export function Korrigering({
  korrigerteDager,
  setKorrigerteDager,
  originalPeriode,
  setKorrigertBegrunnelse,
  korrigertBegrunnelse,
}: IProps) {
  const fetcher = useFetcher();

  const [startUke, sluttUke] = hentUkerFraPeriode(originalPeriode.periode);
  const forsteUke = korrigerteDager.slice(0, 7);
  const andreUke = korrigerteDager.slice(7);

  const korrigertPeriode = {
    ...originalPeriode,
    dager: korrigerteDager,
    begrunnelseEndring: korrigertBegrunnelse,
  };

  const totalArbeid = beregnTotalt(korrigertPeriode, AKTIVITET_TYPE.Arbeid, false);
  const totalSyk = beregnTotalt(korrigertPeriode, AKTIVITET_TYPE.Syk, true);
  const totalFravaer = beregnTotalt(korrigertPeriode, AKTIVITET_TYPE.Fravaer, true);
  const totalUtdanning = beregnTotalt(korrigertPeriode, AKTIVITET_TYPE.Utdanning, true);

  function handleOnClick() {
    fetcher.submit(
      {
        rapporteringsperiode: JSON.stringify(korrigertPeriode),
      },
      { method: "post", action: "/api/rapportering" }
    );
  }

  return (
    <div className={styles.korrigeringsGrid}>
      <div className={styles.aktiviteter}>
        <div className={classNames(styles.arbeid, "arbeid")}>Jobb</div>
        <div className={classNames(styles.syk, "syk")}>Syk</div>
        <div className={classNames(styles.fravaer, "fravaer")}>
          Ferie, fravær og utenlandsopphold
        </div>
        <div className={classNames(styles.utdanning, "utdanning")}>
          Tiltak, kurs eller utdanning
        </div>
      </div>

      <div className={styles.ukeContainer}>
        <KorrigeringUke
          uke={forsteUke}
          setKorrigerteDager={setKorrigerteDager}
          ukenummer={startUke}
        />
        <KorrigeringUke
          uke={andreUke}
          setKorrigerteDager={setKorrigerteDager}
          ukenummer={sluttUke}
        />
      </div>

      <div className={styles.oppsummeringContainer}>
        <div className={classNames(styles.oppsummering)}>
          <p>{totalArbeid} timer</p>
        </div>
        <div className={classNames(styles.oppsummering)}>
          <p>{totalSyk} dager</p>
        </div>
        <div className={classNames(styles.oppsummering)}>
          <p>{totalFravaer} dager</p>
        </div>
        <div className={classNames(styles.oppsummering)}>
          <p>{totalUtdanning} dager</p>
        </div>
      </div>

      <div className={classNames(styles.begrunnelse)}>
        <Textarea
          label="Begrunnelse:"
          placeholder="Obligatorisk"
          onChange={(event) => setKorrigertBegrunnelse(event.target.value)}
          className={classNames("korrigering-tekstfelt")}
        ></Textarea>
      </div>

      <div className={styles.knapper}>
        <Button as="a" href="/person/17051412345/perioder" variant="secondary">
          Avbryt
        </Button>
        <Button variant="primary" onClick={handleOnClick}>
          Fullfør korrigering
        </Button>
      </div>
    </div>
  );
}
