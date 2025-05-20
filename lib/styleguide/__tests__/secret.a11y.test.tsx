import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Secret } from "../secret";

describe("Secret accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <Secret secret="correct horse battery staple" label="Secret Phrase" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
