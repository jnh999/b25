import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TransferPage from "../transfer/page";

describe("TransferPage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders TransferPage component with all required elements", async () => {
    await act(async () => {
      render(<TransferPage />);
    });

    // Check for main form elements
    expect(screen.getByLabelText("Recipient")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Memo (optional)")).toBeInTheDocument();

    // Check for buttons and toggles
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /transfer mode: send selected/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /currency: usd selected/i })
    ).toBeInTheDocument();
  });

  it("allows switching between send and receive modes", async () => {
    await act(async () => {
      render(<TransferPage />);
    });

    const sendReceiveToggle = screen.getByRole("switch", {
      name: /transfer mode: send selected/i,
    });
    expect(sendReceiveToggle).toBeInTheDocument();

    // Initially in send mode
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();

    // Switch to receive mode
    await act(async () => {
      fireEvent.click(sendReceiveToggle);
    });
    expect(
      screen.getByRole("button", { name: /request/i })
    ).toBeInTheDocument();
  });

  it("allows switching between USD and BTC", async () => {
    await act(async () => {
      render(<TransferPage />);
    });

    const currencyToggle = screen.getByRole("switch", {
      name: /currency: usd selected/i,
    });
    expect(currencyToggle).toBeInTheDocument();

    // Initially in USD mode
    expect(screen.getByLabelText("Amount in USD")).toBeInTheDocument();

    // Switch to BTC mode
    await act(async () => {
      fireEvent.click(currencyToggle);
    });
    expect(screen.getByLabelText("Amount in BTC")).toBeInTheDocument();
  });
});
