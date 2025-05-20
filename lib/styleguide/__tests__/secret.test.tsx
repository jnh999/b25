import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Secret } from "../secret";

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
});

describe("Secret", () => {
  const secret = "correct horse battery staple";
  it("renders masked by default", () => {
    render(<Secret secret={secret} label="Secret Phrase" />);
    expect(screen.getByTestId("secret-text")).toBeInTheDocument();
    expect(screen.getByTestId("secret-text")).toHaveTextContent(
      "•••••••••••••••••••••"
    );
  });

  it("reveals and hides the secret", () => {
    render(<Secret secret={secret} label="Secret Phrase" />);
    const toggleButton = screen.getByRole("button", {
      name: /reveal secret phrase/i,
    });
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("secret-text")).toHaveTextContent(secret);
    fireEvent.click(
      screen.getByRole("button", { name: /hide secret phrase/i })
    );
    expect(screen.getByTestId("secret-text")).toHaveTextContent(
      "•••••••••••••••••••••"
    );
  });

  it("shows copy feedback when copy button is clicked", async () => {
    render(<Secret secret={secret} label="Secret Phrase" />);
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    const copyButton = screen.getByLabelText(/copy secret phrase/i);
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
  });
});
