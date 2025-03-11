import styles from "./Forhandsvisning.module.css";

interface IProps {
  ukenummer: string;
  formattertFraOgMed: string;
  formattertTilOgMed: string;
}

export function PeriodeMedUke({ ukenummer, formattertFraOgMed, formattertTilOgMed }: IProps) {
  return (
    <>
      <h3 className={styles.header}>Uke {ukenummer}</h3>
      <div className={styles.periode}>
        {formattertFraOgMed} - {formattertTilOgMed}
      </div>
    </>
  );
}
