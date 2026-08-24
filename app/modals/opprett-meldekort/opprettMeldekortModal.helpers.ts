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
