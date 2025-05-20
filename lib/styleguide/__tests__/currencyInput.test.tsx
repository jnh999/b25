import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencyInput, Currency } from "../currencyInput";

describe("CurrencyInput", () => {
  for (const currency of ["BTC", "USD", "EUR"] as Currency[]) {
    it(`renders with correct label and currency symbol for ${currency}`, () => {
      render(<CurrencyInput label="Amount" currency={currency} locale="US" />);
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
      expect(
        screen.getByText(
          currency === "BTC" ? "₿" : currency === "USD" ? "$" : "€"
        )
      ).toBeInTheDocument();
    });
  }

  it("accepts input and formats value", () => {
    render(<CurrencyInput label="Amount" currency="USD" locale="US" />);
    const input = screen.getByLabelText("Amount");
    fireEvent.change(input, { target: { value: "1234.56" } });
    expect(input).toHaveValue("1,234.56");
  });
});
