import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QRCode } from "../qr";

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
});

describe("QRCode", () => {
  const value = "bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  it("renders with label and QR code", () => {
    render(<QRCode value={value} label="Bitcoin Address QR" />);
    expect(screen.getByLabelText("Bitcoin Address QR")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /click to copy bitcoin address qr/i })
    ).toBeInTheDocument();
  });

  it("shows copy feedback when clicked", async () => {
    render(<QRCode value={value} label="Bitcoin Address QR" />);
    const button = screen.getByRole("button", {
      name: /click to copy bitcoin address qr/i,
    });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });
});
