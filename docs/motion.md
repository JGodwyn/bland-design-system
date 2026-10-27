# Motion

How Bland components move. The rules come from Emil Kowalski's animation skills (vendored in `.claude/skills/`, see `animate` and `emil-design-eng`) and are summarized in `CLAUDE.md` under "Decisions code must follow". Token values live in the Figma `Motion` collection.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--duration-xs` | 125ms | Tooltips, hover and color changes |
| `--duration-sm` | 160ms | Press feedback |
| `--duration-md` | 200ms | Dropdowns, popovers, accordion |
| `--duration-lg` | 250ms | Modals. The ceiling for UI motion |
| `--duration-xl` | 400ms | Reserved for Toast |
| `--duration-2xl` | 500ms | Reserved for Sidebar and sheet slides, with `--easing-drawer` |
| `--duration-toast-visible` | 5000ms | Not an animation: how long a Toast stays on screen before it dismisses itself. The Toaster reads it. Added 2026-10-18 |
| `--duration-tooltip-delay` | 500ms | Not an animation: how long the pointer rests on a trigger before its Tooltip opens. Keyboard focus and a warm tooltip skip it. Added 2026-10-19 |
| `--duration-tooltip-close-delay` | 100ms | Not an animation: how long a Tooltip stays after the pointer leaves, so the pointer can cross onto it. Added 2026-10-19 |
| `--duration-spin` | 800ms | One full turn of a loading spinner, repeated, with `--easing-linear`. Added 2026-10-17 for the Button's loading state |
| `--duration-typing` | 1200ms | One wave of a typing Chat bubble's dots, repeated, with `--easing-in-out`: each dot brightens and lifts by space-xs in turn, a sixth of the cycle apart. A loop, like the spinner, so it sits above the 250ms UI limit. Reduced motion keeps the color wave and drops the lift. Added 2026-10-20 |
| `--easing-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Default. Anything entering or exiting |
| `--easing-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Moving or morphing while on screen |
| `--easing-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sidebar and sheets |
| `--easing-ease` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Hover and color changes |
| `--easing-linear` | `linear` | Progress fills, hold-to-confirm and spinner rotation only |

The lint rejects raw `ms`/`s` values, easing keywords, `cubic-bezier()`, `steps()` and `linear()` in component CSS, and names the token to use. `ease-in` is rejected outright.

## Rules

- **Never ease-in on UI.** It starts slow, so the interface feels late to respond. Entering and exiting use `--easing-out`.
- **Stay at or under 250ms** (`--duration-lg`). Only Toast (`xl`) and Sidebar or sheets (`2xl`) go above, because they travel further and are not on the hot path.
- **Don't animate what people do constantly.** No motion on keyboard-initiated actions (shortcuts, arrow-key navigation, command palettes) or anything used hundreds of times a day. Motion there reads as lag.
- **Never scale from 0.** Nothing in the world appears from nothing. Start at `scale(0.95)` to `scale(0.97)` with `opacity: 0`.
- **Scale from the origin.** Popovers, dropdowns and tooltips scale from their trigger (`transform-origin` set from Floating UI's placement). Modals stay centered.
- **Press feedback** is `transform: scale(0.97)` on `:active`, over `--duration-sm` with `--easing-out`.
- **Exit the way you came in, but quicker.** The exit runs the entrance in reverse, same path and curve, at a shorter duration: `--duration-xs` out against `--duration-md` in for popovers (Menu, Dropdown, date pickers) and the docs site's folds (Godwin 2026-10-27). The user has already moved on, so the system answers fast.
- **Reduced motion.** Every animation ships a `@media (prefers-reduced-motion: reduce)` fallback that keeps opacity and color changes and drops transform motion.
- **Hover motion only for real hover.** Gate it behind `@media (hover: hover) and (pointer: fine)`, so touch devices don't get stuck hover states.
- **Name the properties.** List exactly what transitions (`background-color, transform`), never `transition: all`. The lint rejects `all`.
- **Stagger** list items 30 to 80ms apart. There is no stagger token yet; add one in Figma when a component needs it.

## Pattern

```css
.popover {
  transform-origin: var(--popover-origin); /* set from the Floating UI placement */
  transition:
    opacity var(--duration-md) var(--easing-out),
    transform var(--duration-md) var(--easing-out);
}

.popover[data-state="closed"] {
  opacity: 0;
  transform: scale(0.96);
}

.button {
  transition: transform var(--duration-sm) var(--easing-out);
}

.button:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .button:hover {
    background: var(--button-brand-primary-hover);
  }
}

@media (prefers-reduced-motion: reduce) {
  .popover,
  .button {
    transition-property: opacity, background-color;
  }

  .popover[data-state="closed"],
  .button:active {
    transform: none;
  }
}
```
