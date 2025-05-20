# Draft Proposal: Blind Statechain Transfers

**Author:** Jack Hudson

**Status:** Draft

**Type:** Standard: Core

**Category:** Consensus / Privacy

**Created:** 2025-05-17

---

## 1. Purpose

Introduce **Blind Statechain Transfers**—a protocol upgrade that replaces today’s transparent Spark transfer messages with _blindly‑signed_ state updates. The goal is to eliminate Spark‑operator visibility into sender, receiver, and transfer linkage while retaining Spark’s core properties: instant finality, near‑zero fees, and self‑custody.

---

## 2. Motivation & Scope

### 2.1 Problem Statement

| Issue                                                                      | Impact                                                                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Spark Operators (SOs) learn full sender → receiver graph for every payment | User privacy compromised; exposes commercial flows & personal balances |
| Public Spark address ties all of a user’s balance & history together       | Third parties can passively track a wallet’s activity                  |

### 2.2 Threat model

- **Semi-trusted federation.** At least one SO behaves honestly (no collusion to steal funds) but any SO may log or leak metadata.
- **Passive network observer.** Can watch packet flow and timing but _not_ break TLS or Tor transport.

The proposal aims to hide:

| Metadata                              | Hidden?                            |
| ------------------------------------- | ---------------------------------- |
| Sender → Receiver linkage             | **Yes**                            |
| Per-transfer state-number progression | **Yes**                            |
| Amount (UTXO size)                    | No — still visible from deposit TX |
| Timing correlation                    | Partially (can be padded)          |

### 2.3 Out-of-scope

- Protecting against a _fully_ malicious federation (covered by watchtowers & exit paths).
- Obfuscating on-chain deposits or exits (handled by CoinJoin or equal-value swap layers).

---

## 3. Specification (High–Level)

TODO: Will add post-hackathon once I have more time

---

## 4. Performance & Fee Impact

| Metric                             | Legacy  | Blind transfer       |
| ---------------------------------- | ------- | -------------------- |
| On-chain footprint                 | 0       | 0                    |
| SO round-trips                     | 1       | 2 (blind + partials) |
| Curve operations / SO              | +0      | +1 mul               |
| Typical latency (8 SOs, 50 ms RTT) | ~150 ms | ~250 ms              |

No extra Bitcoin fees; negligible CPU overhead; UX impact << 1 s threshold.

---

## 5. Security Analysis

- **Sender privacy.** Unlinkable blind request prevents SOs from observing the graph. [source](https://medium.com/%40RubenSomsen/statechains-non-custodial-off-chain-bitcoin-transfer-1ae4845a4a39?utm_source=chatgpt.com)
- **Amount privacy.** Still reveals deposit size; wallets MAY enter equal-value swap pools before exit. [source](https://bitcoin-takeover.com/bitcoin-privacy-limitations/?utm_source=chatgpt.com)

TODO: Will add to this post-hackathon

---

## 6. Alternatives Considered

| Technique                           | Pros                                  | Cons                                                                         |
| ----------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| **Stealth addresses + Adaptor sig** | Simpler; no SO change                 | SO still learns sender & amount; only hides receiver until exit              |
| **Chaumian ecash sub-layer**        | Perfect unlinkability; lightning-fast | Fully custodial; breaks Spark’s self-custody, possible regulatory challenges |
| **Statechain CoinSwap pools**       | Hides amount _and_ linkage            | Requires synchronous liquidity, interactive protocol, higher latency         |
| **Do nothing (status quo)**         | Zero engineering effort               | SOs can trivially map balances & social graph                                |

Blind signing offers the _best privacy-to-complexity ratio_.

---

## 7. Compatibility & Deployment Idea

- **Soft-launch flag.** Wallets advertise `feature_bit=BLIND_SIG`; legacy wallets interoperate via fallback.
- **Grace period.** After 6 months all SOs _SHOULD_ reject non-blind transfers.
- **No base-layer changes.** Exit and deposit transactions stay unchanged.

---

## 8. Open Questions

TODO: Will add to this post-hackathon

---

## 9. References

- Somsen, R. _“Statechains: Non-Custodial Off-Chain Bitcoin Transfer.”_ 2019. [source](https://medium.com/%40RubenSomsen/statechains-non-custodial-off-chain-bitcoin-transfer-1ae4845a4a39)
- Blind Statechains discussion on bitcoin-dev, Feb 2024. [source](https://gnusha.org/pi/bitcoindev/CAPv7TjZ_MBCmWZ5CnUk0G0MhHL65cpGyt_dMDONDTzJBHpVUQg%40mail.gmail.com)
- _On the Limitations of Bitcoin Privacy_ — discussion of amount-linkability. [source](https://bitcoin-takeover.com/bitcoin-privacy-limitations)
