import { format } from "date-fns";

import { getTodayIsoDate } from "~/utils/dato.utils";
import { addDemoParamsToURL } from "~/utils/demo-params.utils";

export interface IOpprettMeldekortResponse {
  success?: boolean;
  error?: string;
  detail?: string;
  perioder?: Array<{
    fraOgMed: string;
    tilOgMed: string;
  }>;
}

export interface IOpprettMeldekortPayload {
  personId: string;
  fraOgMed: string;
  tilOgMed: string;
  simulering: boolean;
}

export interface IPeriodeIntervall {
  fraOgMed: string;
  tilOgMed: string;
}

export function buildOpprettMeldekortFormData(payload: IOpprettMeldekortPayload): FormData {
  const formData = new FormData();
  formData.set("personId", payload.personId);
  formData.set("fraOgMed", payload.fraOgMed);
  formData.set("tilOgMed", payload.tilOgMed);
  formData.set("simulering", payload.simulering ? "true" : "false");

  return formData;
}

export function toOpprettMeldekortErrorMessage(response: IOpprettMeldekortResponse): string {
  const standardFeilmelding = "Kunne ikke opprette meldekort.";

  return response.detail
    ? `${response.error ?? standardFeilmelding}: ${response.detail}`
    : (response.error ?? standardFeilmelding);
}

export function utledGyldigPeriode(
  range: { from?: Date; to?: Date } | undefined,
): IPeriodeIntervall | null {
  if (!range?.from || !range.to) {
    return null;
  }

  const fraOgMed = format(range.from, "yyyy-MM-dd");
  const tilOgMed = format(range.to, "yyyy-MM-dd");
  const today = getTodayIsoDate();

  if (fraOgMed > tilOgMed || fraOgMed > today || tilOgMed > today) {
    return null;
  }

  return { fraOgMed, tilOgMed };
}

export function erSammePeriode(a: IPeriodeIntervall | null, b: IPeriodeIntervall | null): boolean {
  return a !== null && b !== null && a.fraOgMed === b.fraOgMed && a.tilOgMed === b.tilOgMed;
}

export function byggOpprettMeldekortActionUrl(): string {
  const actionUrl = new URL("/api/opprett-meldekort", window.location.origin);
  addDemoParamsToURL(actionUrl);
  return actionUrl.pathname + actionUrl.search;
}
