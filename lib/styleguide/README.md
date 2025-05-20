# Bitcoin Design × Accessibility Styleguide

A reusable React component library and developer toolkit that brings the [Bitcoin Design Guide](https://bitcoin.design/guide/) together with the [Bitcoin Universal Design accessibility standards](https://jason-me.github.io/bitcoin-universal-design/) - so building clean, inclusive Bitcoin UIs is the _default,_ not an after-thought.

> **Vision**  
> Peer-to-peer payments should be globally accessible; the UX that enables them should be globally accessible too.

---

## Why this library exists 🧐

| Pain-point                              | Impact                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------- |
| **No standard UI kit for Bitcoin apps** | Every team reinvents buttons, address boxes, and fee pickers.          |
| **Inconsistent a11y practices**         | Screen-reader & keyboard users get left behind; audits are expensive.  |
| **Hidden solvency of “stable” tokens**  | Designers need components that surface proof-of-reserves data clearly. |

---

## What’s inside 🚀

- **A11y UX:** simple and easy to follow web design - accessible to non-Bitcoiners and Bitcoin novices
- **A11y Dev Kit** – Type-safe, shadcn-based React component library that adhere to Bitcoin Design/a11y standards and pass jest-axe out-of-the-box. _(to be open-sourced & published as an npm package after Bitcoin Design community review)_
- **A11y Testing** - platform-wide a11y unit tests (component-specific styleguide tests and page-specific tests) with a CI gate to prevent violations/regressions

---

## Design & Interaction Standards 🎨

_Based on the Bitcoin Design Guide, refined for accessibility._

- Consistent iconography, spacing, and typographic hierarchy
- shadcn/ui primitives under the hood for solid keyboard focus states
- Monospace fonts for addresses & hashes
- High-contrast colour palette & WCAG-AA defaults
- Clear copy/reveal feedback—visible & screen-reader accessible

### Accessibility must-haves

| Area                      | Key rules enforced                                               |
| ------------------------- | ---------------------------------------------------------------- |
| **Semantic HTML**         | Heading hierarchy, ARIA roles & live regions                     |
| **Keyboard nav**          | Logical tab order, visible focus, Esc to close modal             |
| **Screen-reader support** | Descriptive labels, alt text, status announcements               |
| **Colour & vision**       | ≥ 4.5 : 1 text contrast, dark-mode & high-contrast theme roadmap |

---

## Testing & CI ✅

| Level                 | What runs                                                                  |
| --------------------- | -------------------------------------------------------------------------- |
| **Unit**              | jest + jest-axe → every component must have zero critical a11y violations. |
| **CI Gate**           | `npm run test` on PR; fails build on contrast / role / label issues.       |
| **Chrome Lighthouse** | Review lighthouse tool for violations and manual improvements.             |

---

## Roadmap 🗓️

| Phase              | Goals                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **P0** (hackathon) | Seed components ✓ • Jest-axe baseline ✓ • Publish draft docs ✓                                 |
| **P1**             | Discuss idea with Bitcoin Design Community • Storybook + Headless / theme-agnostic props       |
| **P2**             | Dark-mode & high-contrast themes • Expanded Bitcoin patterns (payment requests, notifications) |
| **P3+**            | Full WCAG audit • npm release under `@bitcoin-design` • Community contributions guide          |

---

## Acknowledgements 🙏

- **[Bitcoin Design Guide](https://bitcoin.design/guide/)** for foundational UX patterns.
- **Jason Meyerson’s BTC ++ A11y work** and the [Universal Design site](https://jason-me.github.io/bitcoin-universal-design/) for accessibility inspiration.
- **shadcn/ui** for composable, accessible primitives.

---

## Contributing 🤝

Once reviewed by the Bitcoin Design community, we'll open-source and welcome PRs.

- Open an issue tagged **a11y**, **design**, or **component-request**.
- Follow the coding-style in `CONTRIBUTING.md` (coming soon).
- All new components **must** include jest-axe tests and Storybook docs.

---

> **Next stop:** share this repo with the Bitcoin Design & Accessibility communities, gather feedback, and—once blessed—publish as `@bitcoin-design/bitcoin-ui` on npm so every Bitcoin app can start accessible by default.
