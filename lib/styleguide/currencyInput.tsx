"use client";

import * as React from "react";

import { isValidAmount, cn } from "./utils";

const UNIT_SYMBOLS = {
  BTC: "₿",
  USD: "$",
  EUR: "€",
};

const UNIT_PLACEHOLDERS = {
  BTC: "0.000021",
  USD: "10.00",
  EUR: "10,00",
};

export type Currency = "USD" | "EUR" | "BTC";
export type Locale = "US" | "EU";

/**
 * CurrencyInput component wraps the input and prefixes the
 * field with a static currency symbol (ex. "$"). Useful for forms that accept currency values.
 *
 * This component keeps the same API surface as a regular <input> element, so
 * all native props including `type`, `value`, `onChange`, etc. can be passed
 * directly.
 */
export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    currency: Currency;
    locale?: Locale;
    label?: string;
  }
>(
  (
    {
      className,
      type = "text",
      onChange,
      value,
      defaultValue,
      placeholder,
      currency = "USD",
      locale: rawLocale,
      label,
      autoFocus = true,
      ...props
    },
    ref
  ) => {
    const locale = rawLocale ?? (currency === "EUR" ? "EU" : "US");
    const isControlled = value !== undefined;

    const formatNumber = React.useCallback(
      (numStr: string): string => {
        if (numStr === "") return "";

        // Separate integer and decimal parts
        const thousandSeparator = locale === "EU" ? "." : ",";
        const decimalSeparator = locale === "EU" ? "," : ".";
        const [intPart, decPart] = numStr.split(decimalSeparator);
        const withCommas = intPart.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          thousandSeparator
        );

        return decPart !== undefined
          ? `${withCommas}${decimalSeparator}${decPart}`
          : withCommas;
      },
      [locale]
    );

    const [internal, setInternal] = React.useState<string>(() => {
      const initial = isControlled
        ? (value as string) ?? ""
        : (defaultValue as string) ?? "";
      return formatNumber(initial.toString());
    });

    // Sync controlled value
    React.useEffect(() => {
      if (isControlled) {
        setInternal(formatNumber((value as string) ?? ""));
      }
    }, [value, isControlled, formatNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value.replace(
        locale === "EU" ? /\./g : /\,/g,
        ""
      );

      // Basic validation: use util
      if (
        rawInput !== "" &&
        !isValidAmount(rawInput, currency) &&
        !/^(\d+\.)?$/.test(rawInput)
      ) {
        return;
      }

      const formatted = formatNumber(rawInput);

      // Always update internal for immediate UI feedback
      setInternal(formatted);

      if (onChange) {
        // Mutate event target value to raw version before propagating
        (e.target as HTMLInputElement).value = rawInput;
        onChange(e);
      }
    };

    return (
      <div className="w-full flex items-center bg-white rounded px-3 py-2 border-2 border-gray-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-opacity-50">
        <span className="text-gray-400 text-4xl font-bold mr-2 select-none">
          {UNIT_SYMBOLS[currency]}
        </span>
        <input
          ref={ref}
          type={type}
          inputMode="decimal"
          className={cn(
            "text-4xl font-bold flex-1 bg-transparent border-none outline-none focus:outline-none",
            className
          )}
          value={internal}
          onChange={handleChange}
          placeholder={placeholder ?? UNIT_PLACEHOLDERS[currency]}
          autoFocus={autoFocus}
          aria-label={label}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
