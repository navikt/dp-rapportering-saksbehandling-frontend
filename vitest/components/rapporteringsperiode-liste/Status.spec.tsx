import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Status } from "~/components/rapporteringsperiode-liste/Status";
import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";

describe("Status", () => {
  test("skal vise info tag for status TilUtfylling", () => {
    const { container } = render(<Status status={RAPPORTERINGSPERIODE_STATUS.Klar} />);

    expect(container.querySelector(".navds-tag--info")).toBeInTheDocument();

    const text = screen.getByText("Klar til utfylling");
    expect(text).toBeInTheDocument();
  });

  test("skal vise success tag for status Innsendt", () => {
    const { container } = render(<Status status={RAPPORTERINGSPERIODE_STATUS.Innsendt} />);

    expect(container.querySelector(".navds-tag--success")).toBeInTheDocument();

    const text = screen.getByText("Innsendt");
    expect(text).toBeInTheDocument();
  });

  test("skal vise warning tag for status Korrigert", () => {
    const { container } = render(<Status status={RAPPORTERINGSPERIODE_STATUS.Korrigert} />);

    expect(container.querySelector(".navds-tag--warning")).toBeInTheDocument();

    const text = screen.getByText("Korrigert");
    expect(text).toBeInTheDocument();
  });

  test("skal vise success tag for status Ferdig", () => {
    const { container } = render(<Status status={RAPPORTERINGSPERIODE_STATUS.Ferdig} />);

    expect(container.querySelector(".navds-tag--success")).toBeInTheDocument();

    const text = screen.getByText("Beregning utført");
    expect(text).toBeInTheDocument();
  });

  test("skal vise error tag for status Feilet", () => {
    const { container } = render(<Status status={RAPPORTERINGSPERIODE_STATUS.Feilet} />);

    expect(container.querySelector(".navds-tag--error")).toBeInTheDocument();

    const text = screen.getByText("Feilet");
    expect(text).toBeInTheDocument();
  });
});
