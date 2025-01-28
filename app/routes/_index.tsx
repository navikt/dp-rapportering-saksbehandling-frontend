import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort saksbehandlerflate" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return <div>Meldekort saksbehandlerflate</div>;
}
