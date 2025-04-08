import { Button, Textarea } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { hentUkerFraPeriode } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { beregnTotalt } from "../rapporteringsperiode-visning/sammenlagt.utils";
import styles from "./Korrigering.module.css";
import {
  type IKorrigertDag,
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
} from "./korrigering.utils";
import { KorrigeringUke } from "./KorrigeringUke";

interface IProps {
  korrigertPeriode: IRapporteringsperiode;
  setKorrigertPeriode: React.Dispatch<React.SetStateAction<IRapporteringsperiode>>;
  originalPeriode: IRapporteringsperiode;
}

export function Korrigering({ originalPeriode, korrigertPeriode, setKorrigertPeriode }: IProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [korrigerteDager, setKorrigerteDager] = useState<IKorrigertDag[]>(
    korrigertPeriode.dager.map(konverterTimerFraISO8601Varighet)
  );
  const [korrigertBegrunnelse, setKorrigertBegrunnelse] = useState<string>("");
  const [startUke, sluttUke] = hentUkerFraPeriode(originalPeriode.periode);
  const forsteUke = korrigerteDager.slice(0, 7);
  const andreUke = korrigerteDager.slice(7);

  useEffect(() => {
    setKorrigertPeriode((prev) => ({
      ...prev,
      dager: korrigerteDager.map(konverterTimerTilISO8601Varighet),
      begrunnelseEndring: korrigertBegrunnelse,
    }));
  }, [korrigerteDager, korrigertBegrunnelse]);

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
    navigate("/person/17051412345/perioder");
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
        <div className={styles.oppsummering}>
          <p>{totalArbeid} timer</p>
        </div>
        <div className={styles.oppsummering}>
          <p>{totalSyk} dager</p>
        </div>
        <div className={styles.oppsummering}>
          <p>{totalFravaer} dager</p>
        </div>
        <div className={styles.oppsummering}>
          <p>{totalUtdanning} dager</p>
        </div>
      </div>

      <div className={styles.begrunnelse}>
        <Textarea
          label="Begrunnelse:"
          placeholder="Obligatorisk"
          onChange={(event) => setKorrigertBegrunnelse(event.target.value)}
          className="korrigering-tekstfelt"
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
