import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

export async function pasteFromClipboard(): Promise<string> {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (err) {
    console.error("Failed to paste text:", err);
    return "";
  }
}

const numCharsSuffixPrefix = 6;

export const truncateBtcAddress = (address: string) => {
  if (address.length <= numCharsSuffixPrefix * 2) return address;
  return `${address.slice(0, numCharsSuffixPrefix)}...${address.slice(
    -numCharsSuffixPrefix
  )}`;
};

/**
 * Returns true when the supplied string represents a valid USD amount.
 *
 * Valid examples: "0", "0.1", "1000", "1.23", "123,456.78" (commas are removed before validation).
 * Invalid examples: "1.234" (more than 2 decimals), "abc", "1.2.3".
 */
export function isValidAmount(
  value: string,
  currency: "USD" | "EUR" | "BTC"
): boolean {
  // Strip commas to allow already‑formatted strings
  const raw =
    currency === "EUR" ? value.replace(/\./g, "") : value.replace(/,/g, "");
  if (currency === "BTC") {
    return /^\d+(\.\d{0,8})?$/.test(raw);
  } else if (currency === "EUR") {
    return /^\d+(,\d{0,2})?$/.test(raw);
  } else {
    return /^\d+(\.\d{0,2})?$/.test(raw);
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
