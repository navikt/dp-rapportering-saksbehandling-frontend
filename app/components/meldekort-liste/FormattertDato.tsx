interface IProps {
  dato: string;
  kort?: boolean;
}

export function FormattertDato(props: IProps) {
  const locale = "nb-NO";

  const options: Intl.DateTimeFormatOptions = {
    month: props.kort ? "2-digit" : "long",
    day: props.kort ? "2-digit" : "numeric",
  };

  const formattertDato = new Date(props.dato).toLocaleDateString(locale, options);

  return <>{formattertDato}</>;
}
