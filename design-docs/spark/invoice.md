# Draft Proposal: Spark Invoice

**Author:** Jack Hudson

**Status:** Draft

**Type:** Standard: Interface

**Category:** Wallet / Payments

**Created:** 2025‑05‑17

---

## 1. Purpose

Introduce **Spark Invoices** ― a bech32m‑encoded payment request format that bundles destination, asset, amount, memo, expiry, and optional Lightning fallback into a single, QR‑friendly string for the Spark network. The goal is to 1) standardize how Spark payments are requested and fulfilled across wallets and applications, and 2) better facilitate cross-platform Spark payment requests.

## 2. Problem Statement

| Issue                                                      | Impact                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| Fragmented, ad‑hoc payment links across apps               | User error & duplicated dev effort                          |
| No cryptographic binding between destination and amount    | Susceptible to clipboard & man‑in‑the‑middle attacks        |
| Lack of unified request string that supports BTC fallbacks | Inconsistent UX; wallets can’t present a single “Pay” input |

## 3. Proposed Solution (High‑Level)

1. **Envelope** – Use bech32m with network‑specific HRPs (spi / spt / spr).
2. **TLV Tag Set** – Embed required tags for payment ID (`p`), Spark address (`s`), amount (`a`), and asset ID (`t`).
3. **Optional Tags** – Description (`d` or `h`), expiry (`x`), Lightning fallback (`fl`)
4. **Optional Schnorr Signature** – Adds authenticity; required when fallback is present.

### Minimum Viable Tags

| Tag | Meaning                                   |
| --- | ----------------------------------------- |
| p   | Payment hash (uniqueness & idempotency)   |
| s   | Spark address destination                 |
| a   | Amount (uint‑64 of asset’s smallest unit) |
| t   | Asset identifier ("BTC" or token pubkey)  |

### Optional Tags

Description, description hash, expiry, Lightning fallback.

## 4. Design Highlights

- **Bech32m checksum** for error‑detection and QR friendliness.
- **Distinct HRPs** prevent collision with Lightning invoices.
- **Extensible TLV** allows future tags without breaking old wallets.
- **Signature optionality** supports both wallet-initiated invoices (signed) and third party-initiated invoices (unsigned).
- **Fallback path** enables payers to settle in LN/BTC if they prefer or lack Spark balance.

## 5. Benefits

| Stakeholder | Benefit                                              |
| ----------- | ---------------------------------------------------- |
| End‑users   | Single scan/copy to pay; reduced risk of mis‑payment |
| Developers  | One canonical spec; eliminates bespoke parsing       |
| Ecosystem   | Early interoperability across Spark apps & wallets   |

## 6. Compatibility & Migration

Legacy Spark apps can keep accepting raw addresses or JSON links. Wallets that do not recognize the new HRPs can display a friendly “Unsupported invoice” error. The spec is strictly additive; no change to existing transaction flows is required.

## 7. Security Considerations

- **Checksum + signature** guard against tampering.
- **Unique `p` tag** prevents replay/probing attacks.
- **Expiry (`x`)** limits the useful lifetime of an invoice.
- **Signed fallbacks** ensure only the address owner authorizes alternative payment rails.

## 8. Open Questions

1. Should signatures become mandatory for **all** invoices to simplify validation logic?
2. Recommended default for `x` (expiry) when omitted.
3. Privacy implications of exposing Spark addresses in public invoices.
4. Maximum practical invoice length before wallets should fall back to deep‑link/NFC.

## 9. Example

<img width="793" alt="Image" src="https://github.com/user-attachments/assets/c3274af3-8a66-4d3f-9702-395a68e002bc" />
