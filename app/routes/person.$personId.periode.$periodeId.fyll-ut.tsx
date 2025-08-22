import {
  BodyShort,
  Button,
  DatePicker,
  Heading,
  Radio,
  RadioGroup,
  Textarea,
} from "@navikt/ds-react";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { Form, redirect, useLoaderData, useNavigate, useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";

import {
  type IKorrigertDag,
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
  type SetKorrigerteDager,
} from "~/components/korrigering/korrigering.utils";
import { FyllUtTabell } from "~/components/tabeller/FyllUtTabell";
import { BekreftModal } from "~/modals/BekreftModal";
import { hentPeriode, oppdaterPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import type { loader as personLoader } from "~/routes/person.$personId";
import { MODAL_ACTION_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "./+types/person.$personId.periode.$periodeId.fyll-ut";

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<{ periode: IRapporteringsperiode }> {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periode = await hentPeriode(request, params.personId, params.periodeId);

  return { periode };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.personId, "Person ID mangler");
  invariant(params.periodeId, "Periode ID mangler");

  const formData = await request.formData();
  const personId = formData.get("personId") as string;
  const meldedato = formData.get("meldedato") as string;
  const registrertArbeidssoker = formData.get("registrertArbeidssoker") === "true";
  const begrunnelse = formData.get("begrunnelse") as string;
  const dagerData = formData.get("dager") as string;

  try {
    const saksbehandler = await hentSaksbehandler(request);
    const dager = JSON.parse(dagerData);

    // Sjekk om dette er en ekte korrigering (perioden har allerede data) eller første gangs utfylling

    const oppdatertPeriode = {
      personId,
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
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const { periode } = useLoaderData<typeof loader>();
  const personData = useRouteLoaderData<typeof personLoader>("routes/person.$personId");

  const [dager, setDager] = useState<IKorrigertDag[]>(
    periode.dager.map(konverterTimerFraISO8601Varighet),
  );

  const setKorrigerteDager: SetKorrigerteDager = setDager;
  const [registrertArbeidssoker, setRegistrertArbeidssoker] = useState<boolean | null>(null);
  const [begrunnelse, setBegrunnelse] = useState<string>("");
  const [valgtDato, setValgtDato] = useState<Date | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });

  const handleDateSelect = (date?: Date) => {
    setValgtDato(date);
  };

  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleBekreft = () => {
    if (modalType === MODAL_ACTION_TYPE.AVBRYT) {
      navigate(`/person/${personData?.person.id}/perioder`);
    } else if (modalType === MODAL_ACTION_TYPE.FULLFOR) {
      // Submit form using React ref
      if (formRef.current) {
        formRef.current.submit();
      }
    }
  };

  const handleAvbryt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(MODAL_ACTION_TYPE.AVBRYT);
  };

  return (
    <div className={styles.fyllroot}>
      <div className={styles.skjema}>
        <div className={styles.title}>
          <Heading level="1" size="medium">
            Fyll ut meldekort
          </Heading>
          <BodyShort size="small">
            Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
          </BodyShort>
        </div>

        <Form method="post" ref={formRef}>
          <div className={styles.details}>
            <div>
              <DatePicker
                mode="single"
                selected={valgtDato}
                onSelect={handleDateSelect}
                toDate={new Date()}
                defaultMonth={new Date(periode.periode.tilOgMed)}
              >
                <DatePicker.Input
                  label="Sett meldedato"
                  placeholder="dd.mm.åååå"
                  size="small"
                  value={
                    valgtDato
                      ? formatterDato({ dato: valgtDato.toISOString(), format: DatoFormat.Kort })
                      : ""
                  }
                />
              </DatePicker>
            </div>
            <div>
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
            <div className={styles.begrunnelse}>
              <Textarea
                size="small"
                label="Begrunnelse"
                value={begrunnelse}
                onChange={(e) => setBegrunnelse(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <FyllUtTabell
            dager={dager}
            setKorrigerteDager={setKorrigerteDager}
            periode={periode.periode}
          />
          <div className={styles.handlinger}>
            <Button variant="secondary" size="small" onClick={handleAvbryt}>
              Avbryt utfylling
            </Button>
            <Button
              type="button"
              variant="primary"
              size="small"
              disabled={registrertArbeidssoker === null || !valgtDato || begrunnelse.trim() === ""}
              onClick={() => openModal(MODAL_ACTION_TYPE.FULLFOR)}
            >
              Send inn meldekort
            </Button>
          </div>
          {/* Skjulte input felter for form data */}
          <input type="hidden" name="personId" value={periode.personId} />
          <input
            type="hidden"
            name="meldedato"
            value={valgtDato ? format(valgtDato, "yyyy-MM-dd") : ""}
          />
          <input
            type="hidden"
            name="registrertArbeidssoker"
            value={registrertArbeidssoker?.toString() || ""}
          />
          <input type="hidden" name="begrunnelse" value={begrunnelse} />
          <input type="hidden" name="dager" value={JSON.stringify(dager)} />
        </Form>

        <BekreftModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          tittel={
            modalType === MODAL_ACTION_TYPE.AVBRYT
              ? "Vil du avbryte utfyllingen?"
              : "Vil du fullføre utfyllingen?"
          }
          tekst={
            modalType === MODAL_ACTION_TYPE.AVBRYT ? (
              <>
                Hvis du avbryter, vil <strong>ikke</strong> det du har fylt ut så langt lagres
              </>
            ) : (
              "Ved å trykke “Ja” vil utfyllingen sendes inn."
            )
          }
          bekreftTekst={modalType === MODAL_ACTION_TYPE.AVBRYT ? "Ja, avbryt" : "Ja, send inn"}
          avbrytTekst={modalType === MODAL_ACTION_TYPE.AVBRYT ? "Nei, fortsett" : "Nei, avbryt"}
          onBekreft={handleBekreft}
        />
      </div>
    </div>
  );
}
