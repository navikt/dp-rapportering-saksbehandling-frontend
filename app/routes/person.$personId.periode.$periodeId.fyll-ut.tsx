import {
  BodyShort,
  Button,
  DatePicker,
  Heading,
  Radio,
  RadioGroup,
  Textarea,
} from "@navikt/ds-react";
import { useState } from "react";
import { Form, redirect, useLoaderData, useNavigate } from "react-router";
import invariant from "tiny-invariant";

import {
  type IKorrigertDag,
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
  type SetKorrigerteDager,
} from "~/components/korrigering/korrigering.utils";
import { FyllUtTabell } from "~/components/tabeller/FyllUtTabell";
import { hentPeriode, oppdaterPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types/person.$personId.periode.$periodeId.fyll-ut";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ periode: IRapporteringsperiode }> {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periode = await hentPeriode(request, params.periodeId);

  return { periode };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.personId, "Person ID mangler");
  invariant(params.periodeId, "Periode ID mangler");

  const formData = await request.formData();
  const meldedato = formData.get("meldedato") as string;
  const registrertArbeidssoker = formData.get("registrertArbeidssoker") === "true";
  const begrunnelse = formData.get("begrunnelse") as string;
  const dagerData = formData.get("dager") as string;

  try {
    const saksbehandler = await hentSaksbehandler(request);
    const dager = JSON.parse(dagerData);
    const oppdatertPeriode = {
      innsendtTidspunkt: meldedato,
      registrertArbeidssoker,
      begrunnelse,
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      dager: dager.map(konverterTimerTilISO8601Varighet),
      kilde: {
        rolle: "Saksbehandler" as const,
        ident: saksbehandler.onPremisesSamAccountName,
      },
    };

    // Oppdater perioden via mock/backend
    await oppdaterPeriode(request, params.periodeId, oppdatertPeriode);

    // Redirect tilbake til perioder siden
    return redirect(`/person/${params.personId}/perioder?updated=${params.periodeId}`);
  } catch (error) {
    console.error("Feil ved oppdatering av periode:", error);
    throw new Error("Kunne ikke oppdatere periode");
  }
}

export default function FyllUtPeriode() {
  const dagensDato = new Date();
  const navigate = useNavigate();

  const { periode } = useLoaderData<typeof loader>();

  const [dager, setDager] = useState<IKorrigertDag[]>(
    periode.dager.map(konverterTimerFraISO8601Varighet)
  );

  const setKorrigerteDager: SetKorrigerteDager = setDager;
  const [registrertArbeidssoker, setRegistrertArbeidssoker] = useState<boolean | null>(null);
  const [begrunnelse, setBegrunnelse] = useState<string>("");
  const [valgtDato, setValgtDato] = useState<Date | undefined>(dagensDato);

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });

  const handleDateSelect = (date?: Date) => {
    setValgtDato(date);
  };

  const handleAvbryt = () => {
    navigate(`/person/${periode.ident}/perioder`);
  };

  return (
    <div className={styles.fyllroot}>
      <div className={styles.skjema}>
        <div className={styles.title}>
          <Heading level="1" size="medium">
            Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
          </Heading>
          <BodyShort size="small">(utfylles av saksbehandler)</BodyShort>
        </div>
        <Heading level="2" size="small" className={styles.skjemaTittel}>
          Fyll ut meldekort
        </Heading>
        <Form method="post">
          <div className={styles.details}>
            <div>
              <DatePicker
                mode="single"
                selected={valgtDato}
                onSelect={handleDateSelect}
                fromDate={new Date(tilOgMed)}
                toDate={new Date()}
              >
                <DatePicker.Input
                  label="Velg dato for innsending"
                  placeholder="dd.mm.åååå"
                  size="small"
                  value={
                    valgtDato
                      ? formatterDato({ dato: valgtDato.toISOString(), format: DatoFormat.Kort })
                      : ""
                  }
                />
              </DatePicker>
              <RadioGroup
                size="small"
                legend="Vil bruker fortsatt være registrert som arbeidssøker?"
                value={registrertArbeidssoker?.toString() || ""}
                onChange={(val) => setRegistrertArbeidssoker(val === "true")}
              >
                <Radio value="true">Ja</Radio>
                <Radio value="false">Nei</Radio>
              </RadioGroup>
            </div>
            <div>
              <Textarea
                size="small"
                label="Begrunnelse"
                placeholder="Legg til begrunnelse om meldekortet..."
                value={begrunnelse}
                onChange={(e) => setBegrunnelse(e.target.value)}
                rows={3}
                className={styles.begrunnelse}
              />
            </div>
          </div>
          <FyllUtTabell dager={dager} setKorrigerteDager={setKorrigerteDager} />
          <div className={styles.handlinger}>
            <Button variant="secondary" size="small" onClick={handleAvbryt}>
              Avbryt utfylling
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              disabled={registrertArbeidssoker === null || !valgtDato || begrunnelse.trim() === ""}
            >
              Send inn meldekort
            </Button>
          </div>
          {/* Skjulte input felter for form data */}
          <input
            type="hidden"
            name="meldedato"
            value={valgtDato ? valgtDato.toISOString().split("T")[0] : ""}
          />
          <input
            type="hidden"
            name="registrertArbeidssoker"
            value={registrertArbeidssoker?.toString() || ""}
          />
          <input type="hidden" name="begrunnelse" value={begrunnelse} />
          <input type="hidden" name="dager" value={JSON.stringify(dager)} />
        </Form>
      </div>
    </div>
  );
}
