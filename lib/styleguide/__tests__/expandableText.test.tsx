import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExpandableText } from "../expandableText";

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
});

describe("ExpandableText", () => {
  const text = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  it("renders truncated text by default", () => {
    render(
      <ExpandableText text={text} label="Bitcoin Address" type="address" />
    );
    expect(screen.getByText(/View full address/i)).toBeInTheDocument();
    expect(screen.getByText(text.slice(0, 6))).toBeInTheDocument();
    expect(screen.getByText(text.slice(-6))).toBeInTheDocument();
  });

  it("expands and collapses text", () => {
    render(
      <ExpandableText text={text} label="Bitcoin Address" type="address" />
    );
    const button = screen.getByRole("button", { name: /view full address/i });
    fireEvent.click(button);
    expect(button).toHaveTextContent(/hide full address/i);
    fireEvent.click(button);
    expect(button).toHaveTextContent(/view full address/i);
  });

  it("shows copy feedback", async () => {
    render(
      <ExpandableText text={text} label="Bitcoin Address" type="address" />
    );
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    const copyButton = screen.getByLabelText(/copy bitcoin address/i);
    fireEvent.click(copyButton);

    // Wait for the feedback to appear (e.g., check icon or toast)
    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
  });
});
