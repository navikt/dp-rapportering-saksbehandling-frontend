import {
  BodyShort,
  Button,
  DatePicker,
  Heading,
  Radio,
  RadioGroup,
  Textarea,
  useDatepicker,
} from "@navikt/ds-react";
import { format, subDays } from "date-fns";
import { useRef, useState } from "react";
import { Form, redirect, useLoaderData, useNavigate } from "react-router";
import invariant from "tiny-invariant";

import {
  type IKorrigertDag,
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
  type SetKorrigerteDager,
} from "~/components/korrigering/korrigering.utils";
import { FyllUtTabell } from "~/components/tabeller/FyllUtTabell";
import { useNavigationWarning } from "~/hooks/useNavigationWarning";
import { BekreftModal } from "~/modals/BekreftModal";
import { hentPeriode, oppdaterPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import {
  MODAL_ACTION_TYPE,
  QUERY_PARAMS,
  RAPPORTERINGSPERIODE_STATUS,
  ROLLE,
} from "~/utils/constants";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { ISendInnMeldekort } from "~/utils/types";

import type { Route } from "./+types/person.$personId.periode.$periodeId.fyll-ut";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");
  const personId = params.personId;

  const periode = await hentPeriode(request, params.personId, params.periodeId);

  return { periode, personId };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.personId, "Person ID mangler");
  invariant(params.periodeId, "Periode ID mangler");

  const formData = await request.formData();
  const personId = params.personId;
  const meldedato = formData.get("meldedato") as string;
  const registrertArbeidssoker = formData.get("registrertArbeidssoker") === "true";
  const begrunnelse = formData.get("begrunnelse") as string;
  const dagerData = formData.get("dager") as string;

  try {
    const saksbehandler = await hentSaksbehandler(request);

    const dager = JSON.parse(dagerData);

    // Sjekk om dette er en ekte korrigering (perioden har allerede data) eller første gangs utfylling

    const periode = await hentPeriode(request, personId, params.periodeId);

    const oppdatertPeriode: ISendInnMeldekort = {
      ident: periode.ident,
      id: periode.id,
      periode: periode.periode,
      registrertArbeidssoker,
      begrunnelse,
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      dager: dager.map(konverterTimerTilISO8601Varighet),
      kilde: {
        rolle: ROLLE.Saksbehandler,
        ident: saksbehandler.onPremisesSamAccountName,
      },
      meldedato,
      kanSendesFra: periode.kanSendesFra,
      sisteFristForTrekk: periode.sisteFristForTrekk,
      opprettetAv: periode.opprettetAv,
    };

    // Oppdater perioden via mock/backend
    await oppdaterPeriode({
      periode: oppdatertPeriode,
      personId,
      request,
    });

    // Redirect tilbake til perioder siden
    return redirect(
      `/person/${params.personId}/perioder?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${params.periodeId}`,
    );
  } catch (error) {
    console.error("Feil ved oppdatering av periode:", error);
    throw new Error("Kunne ikke oppdatere periode");
  }
}

export default function FyllUtPeriode() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const meldedatoRef = useRef<HTMLInputElement>(null);
  const arbeidssokerRef = useRef<HTMLInputElement>(null);
  const begrunnelseRef = useRef<HTMLTextAreaElement>(null);

  const { periode, personId } = useLoaderData<typeof loader>();

  const [dager, setDager] = useState<IKorrigertDag[]>(
    periode.dager.map(konverterTimerFraISO8601Varighet),
  );

  const handleSetKorrigerteDager: SetKorrigerteDager = (nyeDager) => {
    setDager(nyeDager);
    // Fjern aktiviteter-feil hvis brukeren legger til aktiviteter
    if (typeof nyeDager !== "function") {
      const harAktiviteter = nyeDager.some((dag) =>
        dag.aktiviteter.some((aktivitet) => aktivitet !== null),
      );
      if (harAktiviteter && visValideringsfeil.aktiviteter) {
        setVisValideringsfeil((prev) => ({ ...prev, aktiviteter: false }));
      }
    }
  };
  const [registrertArbeidssoker, setRegistrertArbeidssoker] = useState<boolean | null>(null);
  const [begrunnelse, setBegrunnelse] = useState<string>("");
  const [valgtDato, setValgtDato] = useState<Date | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [visValideringsfeil, setVisValideringsfeil] = useState({
    meldedato: false,
    arbeidssoker: false,
    begrunnelse: false,
    aktiviteter: false,
  });

  // Sjekk om det finnes ulagrede endringer
  const hasChanges =
    registrertArbeidssoker !== null || begrunnelse.trim() !== "" || valgtDato !== undefined;
  const { disableWarning } = useNavigationWarning({ hasChanges });

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });

  const { inputProps, datepickerProps } = useDatepicker({
    onDateChange: (date) => {
      setValgtDato(date);
      if (date && visValideringsfeil.meldedato) {
        setVisValideringsfeil((prev) => ({ ...prev, meldedato: false }));
      }
    },
    defaultSelected: valgtDato,
    fromDate: subDays(new Date(periode.periode.tilOgMed), 1),
    toDate: new Date(),
    inputFormat: "dd.MM.yyyy",
  });

  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleBekreft = () => {
    if (modalType === MODAL_ACTION_TYPE.AVBRYT) {
      disableWarning();
      navigate(
        `/person/${personId}/perioder?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${periode.id}&${QUERY_PARAMS.OPPDATERT}=${periode.id}`,
      );
    } else if (modalType === MODAL_ACTION_TYPE.FULLFOR) {
      // Skru av navigation warning før man sender inn meldekort
      disableWarning();
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
    <section aria-labelledby="fyll-ut-heading" className={styles.fyllroot}>
      <div className={styles.skjema}>
        <div className={styles.title}>
          <Heading level="1" size="medium" id="fyll-ut-heading">
            Fyll ut meldekort
          </Heading>
          <BodyShort size="small">
            Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
          </BodyShort>
        </div>

        <Form
          method="post"
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();

            // Valider alle obligatoriske felter
            const harAktiviteter = dager.some((dag) =>
              dag.aktiviteter.some((aktivitet) => aktivitet !== null),
            );

            const feil = {
              meldedato: !valgtDato,
              arbeidssoker: registrertArbeidssoker === null,
              begrunnelse: begrunnelse.trim() === "",
              aktiviteter: !harAktiviteter,
            };

            setVisValideringsfeil(feil);

            // Hvis det er feil, fokuser på første feilende felt og ikke send inn
            if (feil.meldedato) {
              meldedatoRef.current?.focus();
              return;
            }
            if (feil.arbeidssoker) {
              arbeidssokerRef.current?.focus();
              return;
            }
            if (feil.begrunnelse) {
              begrunnelseRef.current?.focus();
              return;
            }
            if (feil.aktiviteter) {
              // Finn første input felt i tabellen
              const forsteInputFelt = document.querySelector(
                'input[type="text"]',
              ) as HTMLInputElement;
              forsteInputFelt?.focus();
              return;
            }

            // Hvis ingen feil, åpne modal
            openModal(MODAL_ACTION_TYPE.FULLFOR);
          }}
        >
          <fieldset className={styles.details} style={{ border: "none", padding: 0, margin: 0 }}>
            <legend className="sr-only">Grunnleggende informasjon</legend>
            <div>
              <DatePicker {...datepickerProps}>
                <DatePicker.Input
                  {...inputProps}
                  ref={meldedatoRef}
                  label="Sett meldedato"
                  placeholder="dd.mm.åååå"
                  size="small"
                  error={visValideringsfeil.meldedato ? "Meldedato må fylles ut" : undefined}
                />
              </DatePicker>
            </div>
            <div>
              <RadioGroup
                size="small"
                legend="Registrert som arbeidssøker de neste 14 dagene?"
                error={
                  visValideringsfeil.arbeidssoker
                    ? "Du må velge om bruker skal være registrert som arbeidssøker"
                    : undefined
                }
                value={registrertArbeidssoker?.toString() || ""}
                onChange={(val) => {
                  setRegistrertArbeidssoker(val === "true");
                  if (visValideringsfeil.arbeidssoker) {
                    setVisValideringsfeil((prev) => ({ ...prev, arbeidssoker: false }));
                  }
                }}
              >
                <Radio ref={arbeidssokerRef} value="true">
                  Ja
                </Radio>
                <Radio value="false">Nei</Radio>
              </RadioGroup>
            </div>
            <div className={styles.begrunnelse}>
              <Textarea
                ref={begrunnelseRef}
                size="small"
                label="Begrunnelse"
                name="begrunnelse"
                error={visValideringsfeil.begrunnelse ? "Begrunnelse må fylles ut" : undefined}
                value={begrunnelse}
                onChange={(e) => {
                  setBegrunnelse(e.target.value);
                  if (e.target.value.trim() !== "" && visValideringsfeil.begrunnelse) {
                    setVisValideringsfeil((prev) => ({ ...prev, begrunnelse: false }));
                  }
                }}
                rows={3}
              />
            </div>
          </fieldset>

          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend className="sr-only">Aktiviteter per dag</legend>
            <FyllUtTabell
              dager={dager}
              setKorrigerteDager={handleSetKorrigerteDager}
              periode={periode.periode}
            />
          </fieldset>
          {visValideringsfeil.aktiviteter && (
            <div className="navds-error-message navds-error-message--medium" role="alert">
              Du må fylle ut minst én aktivitet
            </div>
          )}
          <div className={styles.handlinger}>
            <Button variant="secondary" size="small" onClick={handleAvbryt}>
              Avbryt utfylling
            </Button>
            <Button type="submit" variant="primary" size="small">
              Send inn meldekort
            </Button>
          </div>
          {/* Skjulte input felter for form data */}
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
    </section>
  );
}
