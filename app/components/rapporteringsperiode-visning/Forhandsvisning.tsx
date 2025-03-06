import type { IRapporteringsperiode } from "~/utils/types";
import { formatterDato, getWeekDays, ukenummer } from "~/utils/dato.utils";
import { Uke } from "./Uke";
import { useSearchParams } from "react-router";
import styles from "./Forhandsvisning.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

export function Forhandsvisning({ periode }: IProps) {
  if (!periode) return null;

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });

  const forsteUke = [...periode.dager].slice(0, 7);
  const andreUke = [...periode.dager].slice(7, 14);

  const ukedager = getWeekDays();

  const [searchParams, setSearchParams] = useSearchParams();

  const byttAktivRapporteringsperiode = () => {
    const params = new URLSearchParams(searchParams);
    params.set("valgtId", periode.id);
    setSearchParams(params);
  };

  return (
    <div className="rapporteringsperiode">
      <h3 className={styles.header} onClick={byttAktivRapporteringsperiode}>
        Uke {ukenummer(periode)}
      </h3>
      <div className={styles.periode}>
        {formattertFraOgMed} - {formattertTilOgMed}
      </div>
      <table className={styles.rapporteringsperiodeTabell}>
        <thead>
          <tr>
            {ukedager.map((ukedag, index) => (
              <th key={`${periode.id}-${index}`}>
                <span>{ukedag.kort}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Uke uke={forsteUke} />
          <Uke uke={andreUke} />
        </tbody>
      </table>
    </div>
  );
}
