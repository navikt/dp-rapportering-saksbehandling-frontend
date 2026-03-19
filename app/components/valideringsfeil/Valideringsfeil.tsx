import { InfoCard } from "@navikt/ds-react";

import { formatterDag, hentUkedag } from "~/utils/dato.utils";
import type { IFeilmeldinger, IValideringsFeil } from "~/utils/meldekort-validering.helpers";

interface ISkjema {
  state: {
    visValideringsfeil: IValideringsFeil;
  };
  feilmeldinger: IFeilmeldinger;
}

interface ValideringsfeilProps {
  skjema: ISkjema;
}

const Valideringsfeil = ({ skjema }: ValideringsfeilProps) => {
  return (
    <>
      {skjema.state.visValideringsfeil.endringer && (
        <InfoCard data-color="danger" style={{ marginBottom: "1rem" }}>
          <InfoCard.Header>
            <InfoCard.Title>{skjema.feilmeldinger.ingenEndringer}</InfoCard.Title>
          </InfoCard.Header>
        </InfoCard>
      )}
      {skjema.state.visValideringsfeil.aktiviteter && (
        <InfoCard data-color="danger">
          <InfoCard.Header>
            <InfoCard.Title>Du må rette disse feilene før du kan fortsette:</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            <ul>
              {Array.from(skjema.state.visValideringsfeil.aktiviteter.keys()).map((key: string) => {
                return skjema.state.visValideringsfeil.aktiviteter
                  ?.get(key)
                  ?.map((value: string, innerIndex: number) => {
                    const tekst =
                      hentUkedag(key) +
                      " " +
                      formatterDag(key) +
                      " " +
                      skjema.feilmeldinger[value as keyof typeof skjema.feilmeldinger];

                    return <li key={`${key}-${value}-${innerIndex}`}>{tekst}</li>;
                  });
              })}
            </ul>
          </InfoCard.Content>
        </InfoCard>
      )}
    </>
  );
};

export default Valideringsfeil;
