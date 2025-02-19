interface IProps {
  dato: string;
  kort?: boolean;
}

export function FormattertDato({ dato, kort }: IProps) {
  const locale = "nb-NO";

  const options: Intl.DateTimeFormatOptions = {
    month: kort ? "2-digit" : "long",
    day: kort ? "2-digit" : "numeric",
  };

  const formattertDato = new Date(dato).toLocaleDateString(locale, options);

  return <>{formattertDato}</>;
}
