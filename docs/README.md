# Bland docs

Long-form notes on how Bland works in code. Rules every change must follow live in [`../CLAUDE.md`](../CLAUDE.md). This folder holds the detail behind them.

| Doc | Covers |
| --- | --- |
| [tokens.md](tokens.md) | The token pipeline: syncing from Figma, what the build does, CSS naming, light and dark |
| [lint.md](lint.md) | The token lint: what `bland/use-tokens` rejects and allows, and how it picks the token to suggest |
| Docs site | `npm run docs`: every style and component, live, in light and dark |
| [components.md](components.md) | How to build a component: files, CSS, props, icons, testing, and the order to build them in |
| [motion.md](motion.md) | Motion tokens and the rules every animation follows |
| [archive/](archive/) | Retired handoff documents, kept for history. The repo wins wherever they disagree. |

When a decision is made while coding, write it here or in `CLAUDE.md` in the same commit, and add a one-line pointer to the matching Figma description.
