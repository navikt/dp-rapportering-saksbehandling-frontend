import type { IRapporteringsperiode } from "~/utils/types";

interface KorrigeringProps {
  setKorrigertPeriode: React.Dispatch<React.SetStateAction<IRapporteringsperiode>>;
}

// eslint-disable-next-line react/prop-types
export const Korrigering: React.FC<KorrigeringProps> = ({ setKorrigertPeriode }) => {
  const handleKorrigering = () => {
    setKorrigertPeriode((prevPeriode) => ({
      ...prevPeriode,
    }));
  };

  return (
    <div>
      <button onClick={handleKorrigering}>Korriger Periode</button>
    </div>
  );
};
