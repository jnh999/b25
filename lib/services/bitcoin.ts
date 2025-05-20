import * as bitcoin from "bitcoinjs-lib";
import { bech32m } from "bech32";
import { NETWORK, NetworkType } from "./spark";

const detectBitcoinAddress = (
  address: string
): {
  isBitcoin: boolean;
  network: NetworkType | null;
} => {
  try {
    // Try Base58Check decoding (P2PKH/P2SH)
    const { version } = bitcoin.address.fromBase58Check(address);
    switch (version) {
      case bitcoin.networks.bitcoin.pubKeyHash:
      case bitcoin.networks.bitcoin.scriptHash:
        return { isBitcoin: true, network: "MAINNET" };
      case bitcoin.networks.testnet.pubKeyHash:
      case bitcoin.networks.testnet.scriptHash:
        // POSTHACK: This could also be TESTNET
        return { isBitcoin: true, network: "REGTEST" };
    }
  } catch {}

  try {
    // Try Bech32 decoding (SegWit)
    const { prefix } = bech32m.decode(address);
    if (prefix === "bc") return { isBitcoin: true, network: "MAINNET" };
    // if (prefix === "tb") return { isBitcoin: true, network: "TESTNET" };
    if (prefix === "bcrt") return { isBitcoin: true, network: "REGTEST" };
  } catch {}

  return { isBitcoin: false, network: null };
};

export const detectLightning = (
  input: string
): {
  isLightning: boolean;
  type: "invoice" | "lnurl" | null;
  network: NetworkType | null;
} => {
  const invoiceMatch = input.match(/^ln(bc|tb|bcrt)[0-9]{1,}[a-z0-9]+$/i);
  if (invoiceMatch) {
    const prefix = invoiceMatch[1];
    const network = prefix === "bc" ? "MAINNET" : "REGTEST";
    return { isLightning: true, type: "invoice", network };
  }

  const lnurlMatch = input.match(/^[^@]+@[^@]+\.[^@]+$/);
  if (lnurlMatch) {
    return { isLightning: true, type: "lnurl", network: null }; // Lightning addresses don't encode network
  }

  return { isLightning: false, type: null, network: null };
};

export const determineSendInputType = (input: string) => {
  if (input.startsWith("spi")) {
    return { type: "spark", network: NETWORK };
  }

  const btc = detectBitcoinAddress(input);
  if (btc.isBitcoin) return { type: "bitcoin", network: btc.network };

  const ln = detectLightning(input);
  if (ln.isLightning)
    return { type: `lightning ${ln.type}`, network: ln.network };

  return { type: "unknown", network: null };
};
