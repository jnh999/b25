import React from "react";
import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import ApiDocsPage from "@/app/apiDocs/page";

describe("ApiDocsPage accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(<ApiDocsPage />);

    // Wait for any async operations to complete
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  });
});
