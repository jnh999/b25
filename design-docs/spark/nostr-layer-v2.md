# Draft Proposal: Nostr Integration Layer

**Author:** Jack Hudson

**Status:** Draft

**Type:** Standard: Interface

**Category:** Wallet / Privacy

**Created:** 2025-05-18

---

## 1. Purpose

Introduce a **Nostr Integration Layer** for Spark that provides a decentralized, private discovery and messaging fabric for off-chain payments. Leveraging Nostr’s open relay network and identity system (NIP-05, NIP-04/47), Spark can improve on its centralized directory and non-private entrypoints. This SIP adds three key capabilities:

1. **Decentralized Directory:** Enhance Spark's [central registry](https://sparkscan.io) with Nostr replaceable events and NIP-05 DNS identities for Spark deposit endpoints.
2. **Encrypted Handshake:** Exchange one-time deposit URIs or blind-transfer tickets via end-to-end encrypted Nostr messages.
3. **Event Notifications:** Publish Spark receipts and balance updates as Nostr events.

These features hide transfer metadata at the operator layer, enhancing privacy, resiliency, and accessibility without new on-chain transactions. Furthermore, they can be deployed independently or together with [Blind Statechain Transfers](https://github.com/buildonspark/sip/issues/2). While the Blind Statechain Transfers proposal poses a Core protocol privacy enhancement, a Nostr Integration Layer enables an interaction-layer enhanacment.

---

## 2. Problem Statement

| Issue                                                    | Impact                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| Central directory is a single point of failure           | Downtime or takeover blocks address lookup; censorship risk |
| Static, public endpoints leak balances & links           | Observers can correlate deposits to user activity           |
| No standardized off-chain messaging for receipts/updates | Wallets rely on polling or proprietary channels; UX varies  |

**Goal:** Replace centralized lookup and polling with a decentralized, private, and unified messaging layer using Nostr.

---

## 3. Proposed Solution

### 3.1 Decentralized Directory

- **NIP-05 Identities:** Users publish `/.well-known/nostr.json` records mapping names (e.g. `alice@spark.net`) to their Nostr pubkeys.
- **Spark Directory Event (kind=30000):** Replaceable Nostr event tagged:
  - `#d="spark-directory"`
  - `#u=<NIP-05 name or alias>`
  - `#e=<JSON payload>` with `{ "endpoint_url", "pubkey_hash" }`.
- **Lookup:** Wallets resolve NIP-05 or subscribe to kind=30000 by pubkey to discover endpoints.

### 3.2 Encrypted Deposit Handshake

- **Request (kind=4 / NIP-04):** Sender sends encrypted DM:
  ```json
  {
    "type": "spark-deposit-request",
    "amount": 12345,
    "nonce": "..."
  }
  ```
- **Response:** Recipient replies with `spark-deposit-response` containing a one-time URI.
- **Ephemeral Keys:** Wallets can use per-session Nostr keypairs to avoid linkability.

### 3.3 Event Notifications

- **Receipt Event (kind=30001):** Tagged:
  - `#d="spark-receipt"`
  - `#a=<amount>`
  - `#i=<invoice_or_ticket_id>`
- **Balance Update (kind=30002):** Replaceable event with latest balance.
- **Subscription:** Wallets subscribe to these kinds for real-time updates.

### 3.4 Relay Strategy

- Connect to **≥3 public relays** for redundancy.
- Optionally use a **Spark Operator relay cluster** for critical interactions.

---

## 4. Benefits

| Stakeholder           | Benefit                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **End users**         | Discover/pay via human-friendly NIP-05 names; receive real-time notifications; retain custody. |
| **Wallet developers** | Reuse standard Nostr libraries; no custom servers or polling; unified messaging API.           |
| **Spark Operators**   | Offload directory and notifications; reduce infrastructure risk; no extra on-chain fees.       |
| **Ecosystem**         | Enhanced privacy; censorship-resistance; interoperability with Nostr wallets.                  |

---

## 5. Compatibility & Migration

- **Backward-compatible:** Wallet enhancement rather than wallet requirement.
- **Feature bit:** `supports_nostr` in Spark RPC signals support.
- **Interaction layer:** No changes to on-chain or statechain protocols; all logic resides in wallets/Nostr layer.

---

## 6. Security Considerations

- **Key custody:** Protect Nostr keys as securely as Spark keys.
- **Event validation:** Verify signatures and NIP-05 DNS records.
- **Encrypted data:** Use NIP-04/NIP-47 to hide sensitive payloads.
- **Relay redundancy:** Write to and read from multiple relays to mitigate censorship or failure.
- **DoS protection:** Use replaceable events and signature checks to limit spam.

---

## 7. Alternatives Considered

| Option                                     | Pros                                          | Cons                                                              |
| ------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------- |
| Central directory (status quo)             | Simple; no new tech                           | Centralized; single point of failure; leaks metadata              |
| Stealth addresses (on-chain)               | Unlinkable on-chain                           | Requires directory; static once created                           |
| P2P gossip (libp2p, etc.)                  | Fully decentralized; no relays                | Complex; heavy networking                                         |
| Blind Statechain Transfers                 | Hides operator metadata; preserves Spark UX   | Protocol changes required; does not cover directory/notifications |
| **Nostr Integration (i.e. this proposal)** | Leverages open network; low dev cost; private | Relay availability varies; added client complexity                |

Both Nostr integration and Blind Statechain Transfers can be adopted independently or in tandem for layered privacy.

---

## 8. Open Questions

1. Should we register event kinds in a Nostr NIP or use Spark-defined ranges?
2. NIP-04 vs. NIP-47 for deposit handshake — which to standardize?
3. What SLAs are acceptable for relay availability?
4. How to manage NIP-05 subdomain collisions and disputes?

---

## 9. References

- Nostr Protocol & NIPs (04, 05, 47)
- Spark Technical Overview - [source](https://docs.spark.money/spark/spark-tldr)
- SIP Draft Proposal 1: Spark Invoice - [source](https://github.com/buildonspark/sip/issues/1)
- SIP Draft Proposal 2: Blind Statechain Transfers - [source](https://github.com/buildonspark/sip/issues/2)
- Somsen, R. “Statechains: Non-Custodial Off-Chain Bitcoin Transfer,” - [source](https://medium.com/@RubenSomsen/statechains-non-custodial-off-chain-bitcoin-transfer-1ae4845a4a39)
- Tilley, S. How to Set Up a Verified Nostr Address - [source](https://wedistribute.org/2024/05/nostr-nip-05/)
