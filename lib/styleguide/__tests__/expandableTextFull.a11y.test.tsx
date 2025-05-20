import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { ExpandableTextFullPage } from "../expandableTextFull";

describe("ExpandableText accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <ExpandableTextFullPage
        text="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
        label="Bitcoin Address"
        type="address"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
