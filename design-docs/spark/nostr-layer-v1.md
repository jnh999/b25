# Draft Proposal: Nostr Integration Layer

**Author:** Jack Hudson

**Status:** Draft

**Type:** Standard: Interface

**Category:** Wallet / Privacy

**Created:** 2025-05-18

---

## 1. Summary

This SIP defines a **Nostr Integration Layer** for the Spark ecosystem. It introduces a set of Nostr-based events and protocols enabling:

- **Decentralized, censorship-resistant directory** for mapping human-friendly identifiers (e.g. NIP-05 names) or Nostr public keys → Spark deposit endpoints.
- **Encrypted peer-to-peer key exchange** for one-time deposit addresses or blind-transfer tickets (leveraging NIP-04 / NIP-47).
- **Event-based notifications** for transfer receipts and balance updates via Nostr replaceable or tagged events.

By leveraging Nostr’s open relay network, Spark gains a private discovery & messaging substrate without centralized servers, preserving self-custody and minimal on-chain cost. This can be introduced independently or in tandem with [Blind Statechain Transfers](https://github.com/buildonspark/sip/issues/2) to improve the privacy, resiliency, and accessibility of the Spark protocol.

---

## 2. Motivation

| Problem                                                                           | Impact                                                                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Central Spark directory is a single point of failure & censorship risk            | Downtime or takeover blocks address lookup & reduces censorship resistance             |
| Static, public deposit endpoints leak user balances & identifiers                 | Passive observers can link deposits → users and track balances across transfers        |
| Lack of a secure, decentralized messaging layer for Spark off-chain notifications | Wallets rely on direct websockets or polling; no unified standard for receipts/updates |

**Goal:** Use Nostr for

1. **Decentralized discovery** (public replaceable events + NIP-05)
2. **Private handshakes** (encrypted DMs for deposit/ticket exchange)
3. **Metadata notifications** (receipts, balance updates)

---

## 3. Specification

### 3.1 Identity & Directory

1. **NIP-05 Names**

   - Users register DNS-based identities (e.g. `alice@spark.net`) pointing to their Nostr pubkey via `/.well-known/nostr.json`.

2. **Spark-Directory Event (kind=30000)**

   - Tags:
     - `#d` = `spark-directory`
     - `#u` = user alias or NIP-05 name
     - `#e` = JSON payload (encrypted or plaintext) containing `{ endpoint_url, pubkey_hash }`.

3. **Publish/Subscribe**
   - Wallets write/overwrite kind=30000 to configured relays; clients filter by pubkey or tag.

### 3.2 Encrypted Deposit Handshake (NIP-04 / NIP-47)

1. **Request (DM)**
   - Sender sends kind=4 (or NIP-47) encrypted event:
     ```json
     {
       "type": "spark-deposit-request",
       "nonce": "...",
       "amount": 10000
     }
     ```
2. **Response**
   - Recipient replies with:
     ```json
     {
       "type": "spark-deposit-response",
       "uri": "https://spark.example.com/deposit/abcdef"
     }
     ```
3. **Ephemeral Keys**
   - Wallets generate per-session Nostr key pairs to prevent linking.

### 3.3 Transfer & Balance Notifications

1. **Receipt Event (kind=30001)**

   - Tags:
     - `#d` = `spark-receipt`
     - `#a` = amount in sats or token units
     - `#i` = invoice or ticket ID
   - Payload may be encrypted minimal proof.

2. **Publishing**
   - Clients emit kind=30001 on receipt of off-chain transfer; wallets listen to update UIs.

### 3.4 Relay Strategy

- **Default Relays:** Wallets connect to ≥3 public relays; broadcast critical events to all.
- **Fallback Cluster:** Spark operators may host a relay cluster for guaranteed availability.

---

## 4. Compatibility & Migration

- **Legacy wallets** ignore unknown kinds (30000/30001).
- **Feature bit** in Spark RPC (e.g. `supports_nostr=true`) indicates support.
- **Grace period:** 3 months from SIP finalization before deprecating centralized directory.

---

## 5. Security Considerations

- **Key custody:** Users must protect Nostr keys equivalently to Spark keys.
- **Event validation:** Clients must verify signatures on all Nostr events.
- **Privacy:** Encrypted DMs ensure only intended parties see sensitive endpoints.
- **Replay protection:** Nonces and unique URIs prevent replay attacks.
- **Relay trust:** Clients should write to multiple relays to mitigate censorship/failure.

---

## 6. Rationale & Alternatives

| Option                                 | Pros                                          | Cons                                            |
| -------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| Central directory (status quo)         | Simple, no new infra                          | Centralized, censorship-prone, leaks metadata   |
| Stealth addresses on-chain             | Unlinkable on-chain                           | Requires directory, still reveals on-chain keys |
| Full P2P gossip (e.g. libp2p)          | Decentralized, no relays                      | Complex, heavy protocols                        |
| **Nostr–Spark integration (this SIP)** | Leverages existing open network; low dev cost | Relay availability varies; UX complexity        |

Nostr strikes the best balance: decentralization + privacy with minimal Spark-specific changes.

---

## 7. Open Questions

1. Event kind IDs: register in Nostr NIP vs. Spark-defined range?
2. NIP-04 vs. NIP-47: which is best for deposit handshake?
3. Relay SLAs: rely on public relays vs. paid/enterprise services?
4. Alias collisions: how to manage NIP-05 subdomain conflicts?

---

## 8. References

- Nostr Protocol & NIPs (04, 05, 47)
- Spark Technical Overview (https://docs.spark.money/spark/spark-tldr)
- SIP-2: Spark Invoice (jack, 2025-05-12) [oai_citation:0‡sip-x.md](file-service://file-EV2vGbRtzrZXqD45UfSWgq)
