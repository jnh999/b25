# SparkX — Global Bitcoin & Stablecoin Payments

SparkX is a **“Global Venmo”** built on the Spark SDK: users can send USD tokens or BTC anywhere in seconds, for < 1 % fees, with proof-of-reserves and an accessibility-first Bitcoin UI kit.

> **Not just a hackathon demo:** SparkX started at B25 Hackathon but will be an ongoing initiative to push Spark-based payments forward through open SIP proposals, reference code, and reusable design tooling.

---

## Table of Contents

0. [Quick links](#quick-links)
1. [Inspiration](#inspiration)
2. [Key Features](#key-features)
3. [Architecture Overview](#architecture-overview)
4. [Getting Started](#getting-started)
5. [Proof of Reserves](#proof-of-reserves)
6. [Lessons Learned](#lessons-learned)
7. [Roadmap](#roadmap)
8. [Contributing](#contributing)

---

## Quick links

1. [Live demo](https://sparkx-kappa.vercel.app)

   **NOTE: Test account credentials next to link in application**

2. A11y library [README](./lib/styleguide/README.md)
3. Demo Video can be found [here](https://www.youtube.com/watch?v=nrTBAzgfgIU)
4. Spark SDK feedback can be found [here](./SPARK.md)
5. Spark Improvement Proposals can be found [here](https://github.com/buildonspark/sip/issues)

---

## Inspiration

Moving money across borders is slow, opaque, and expensive - fees average **6-7 %** and users can’t verify solvency. SparkX tackles **cost, transparency, accessibility,** and **Spark protocol gaps**:

| Problem                                          | Why it matters                                          |
| ------------------------------------------------ | ------------------------------------------------------- |
| High remittance fees & hidden FX spreads         | Limits global commerce and remittances                  |
| No standard Bitcoin UI component kit             | Inconsistent UX & poor accessibility                    |
| Spark lacks cross-app payment requests & privacy | Users are locked to single apps and balances are public |
| Stablecoin backing is opaque                     | Limits trust in Spark-issued tokens                     |

---

## Key Features

| Category                                 | Details                                                              |
| ---------------------------------------- | -------------------------------------------------------------------- |
| **Instant, Borderless Payments**         | USD tokens or BTC in sub-second Spark transfers (< 1 % cost).        |
| **Double-Lock Proof-of-Reserves**        | Live Stripe balance + nightly Bitcoin-anchored Merkle tree.          |
| **Spark Invoices (New SIP)**             | Lightning-style request format for cross-app transfers.              |
| **Network-Wide Directories**             | Public **User** & **Issuer** registries for discovery & token trust. |
| **Blind Statechain Transfers (New SIP)** | Proposal to hide sender, receiver, and linkage from Spark operators. |
| **Bitcoin Design × Accessibility Kit**   | Reusable `bitcoin-ui` React components + jest-axe tests.             |

---

## Architecture Overview

_Full tech stack:_ Next.js • TypeScript • Spark Wallet/Issuer SDK • Prisma Postgres • Stripe API • jest-axe • Vercel

---

## Getting Started

```bash
npm install        # deps
# add DATABASE_URL & AUTH_SECRET to .env
npx prisma migrate dev --name init
npm run dev        # http://localhost:3000
```

---

## Proof of Reserves

1. Live Stripe balance exposed via read-only key
2. Nightly snapshot → hash Stripe JSON + user liabilities → Merkle root
3. Root anchored to Bitcoin (Testnet) via OP_RETURN
4. Self-Audit button lets any user verify their balance inclusion any time.

---

## Lessons Learned

1. Protocol vs Product — missing primitives became Spark Improvement Proposals (SIPs) once identified.
2. Transparency ≠ Privacy — Proof-of-Reserves is easy; blinded statechains are hard but essential.
3. Regulated Rails Matter — Brale integration surfaced real licensing trade-offs.
4. Design Kits Pay Off — bitcoin-ui cut front-end time in half.
5. AI Dev Tools Boost Velocity — Cursor AI sped up end-to-end delivery.

---

## Roadmap

### Launch Track

• [in progress] Brale onboarding for licensed USD/EUR issuance
• Flutter mobile clients (awaiting Spark Flutter SDK)
• Mainnet PoR dashboard w/ automated audits

### Ecosystem Track

• [in progress] Continue working with Spark on SIPs proposed
• Publish bitcoin-ui to npm & Storybook docs
• Nostr messaging layer for private directory lookups
• Corridor expansion: PIX, M-Pesa, UPI payout adapters

---

## Contributing

PRs welcome once the core API stabilises.

1. git checkout -b feature/my-feature
2. Add jest-axe tests for any new page/component.
3. Open pull request with clear description.
