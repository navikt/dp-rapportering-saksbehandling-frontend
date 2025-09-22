export function maskerVerdi(verdi: string | number): string {
  const strInput = verdi.toString();
  return strInput.replace(/\S/g, "*");
}
