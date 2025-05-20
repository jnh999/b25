# Plan

User Journey

- User signs up

  - username, first name, last name, email, password, [v2] spark address (optional, expand)
  - [next page] US (default)/EUR (can use flag icons), twitter profile (optional, verify btn x.ts)
  - on BE use db unique to verify username/spark address/email uniqueness
  - [v5, next page] set up bank account

- User sign in

  - username, password

- Dashboard: history of YOUR transfers (with memos w/ emojis - like Venmo)

  - Header has Dashboard, Users, Issuers, notification icon w/ number

- Btn(s) for Send / Request (same modal, just diff actions)
  - Request lets you request funds via:
    - User (default, like venmo), enter USD amount (default), [v2] EUR/BTC for spark, [v3] BTC for LN/BTC
    - Spark Address alternative (expand into txtbox), shows QR AND text for Spark Invoice
  - Send lets you send via:
    - User (default, like venmo), enter USD amount (default), [v2] EUR/BTC for spark, [v3] BTC for LN/BTC
    - Spark Address alternative (expand into txtbox)
    - Bank account (USD/EUR) default
    - Spark Wallet funds (If existing funds in same currency)

User dashboard

- Alphabetized table of users (Name, Username, Spark Address, Verified details)

Issuers dashboard

- Alphabetized table of issuers (Token details - name, ticket pubkey, Verified details, Proof of reserves)

Notifications dashboard

- list pending payment requests, approve/deny receiving requests

APIs

Proof of Reserves

User Settings
