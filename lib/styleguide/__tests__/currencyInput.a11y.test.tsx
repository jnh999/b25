import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { CurrencyInput } from "../currencyInput";

describe("CurrencyInput accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <CurrencyInput
        label="Label"
        placeholder="Enter value"
        currency="BTC"
        locale="US"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
