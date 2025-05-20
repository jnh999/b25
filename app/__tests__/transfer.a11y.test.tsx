import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import TransferPage from "../transfer/page";

describe("TransferPage accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have no a11y violations", async () => {
    // Render the component
    const { container } = render(<TransferPage />);

    // Wait for the form elements to be fully rendered
    await screen.findByLabelText("Recipient");
    await screen.findByLabelText("Amount");
    await screen.findByLabelText("Memo (optional)");
    await screen.findByRole("button", { name: /send/i });

    // Run accessibility checks
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(results.incomplete).toHaveLength(0);
  }, 15000);
});
