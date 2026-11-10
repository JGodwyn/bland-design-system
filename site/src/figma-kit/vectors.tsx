// The Figma kit section's vectors (Figma 7078:34292). Paths are Figma's exports (DiamondsFour, ToggleRight, Code, the
// 40px FigmaLogo) with their raw colors replaced by currentColor, so they follow the theme. The cursor and the
// component-set glyph are drawn here: Figma's own shapes, as the Figma file picture needs them. Wrap the 20 grid
// icons in <Icon>; the logo and the cursor size themselves from CSS.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

/** Figma: DiamondsFour (stroked, 20 grid). */
export const DiamondsFourIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6.876 5L10.001 1.875L13.126 5L10.001 8.125L6.876 5Z" />
    <path d="M6.876 15L10.001 11.875L13.126 15L10.001 18.126L6.876 15Z" />
    <path d="M11.876 10L15.001 6.875L18.126 10L15.001 13.125L11.876 10Z" />
    <path d="M1.876 10L5.001 6.875L8.126 10L5.001 13.126L1.876 10Z" />
  </svg>
);

/** Figma: ToggleRight (stroked, 20 grid). */
export const ToggleRightIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6.25 5H13.75C16.5114 5 18.75 7.23858 18.75 10C18.75 12.7614 16.5114 15 13.75 15H6.25C3.48858 15 1.25 12.7614 1.25 10C1.25 7.23858 3.48858 5 6.25 5Z" />
    <path d="M16.25 10C16.25 11.3807 15.1307 12.5 13.75 12.5C12.3693 12.5 11.25 11.3807 11.25 10C11.25 8.61929 12.3693 7.5 13.75 7.5C15.1307 7.5 16.25 8.61929 16.25 10Z" />
  </svg>
);

/** Figma: Code (stroked, 20 grid). */
export const CodeIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 6.875L1.25 10L5 13.125" />
    <path d="M15 6.875L18.75 10L15 13.125" />
    <path d="M12.5 3.125L7.5 16.875" />
  </svg>
);

/** Figma: the picture's 40px FigmaLogo (stroked, 40 grid, Figma's 1.875 stroke from landing-values.css). */
export const FigmaLogoLarge = (p: P) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M31.25 20C31.25 22.7614 29.0114 25 26.25 25C23.4886 25 21.25 22.7614 21.25 20C21.25 17.2386 23.4886 15 26.25 15C29.0114 15 31.25 17.2386 31.25 20Z" />
    <path d="M21.25 15H26.25C27.5761 15 28.8479 14.4732 29.7855 13.5355C30.7232 12.5979 31.25 11.3261 31.25 10C31.25 8.67392 30.7232 7.40215 29.7855 6.46447C28.8479 5.52678 27.5761 5 26.25 5H21.25" />
    <path d="M21.25 5H15C13.6739 5 12.4021 5.52678 11.4645 6.46447C10.5268 7.40215 10 8.67392 10 10C10 11.3261 10.5268 12.5979 11.4645 13.5355C12.4021 14.4732 13.6739 15 15 15H21.25V5Z" />
    <path d="M21.25 15H15C13.6739 15 12.4021 15.5268 11.4645 16.4645C10.5268 17.4021 10 18.6739 10 20C10 21.3261 10.5268 22.5979 11.4645 23.5355C12.4021 24.4732 13.6739 25 15 25H21.25V15Z" />
    <path d="M21.25 25H15.625C14.5125 25 13.4249 25.3299 12.4999 25.948C11.5749 26.5661 10.8539 27.4446 10.4282 28.4724C10.0024 29.5002 9.89104 30.6312 10.1081 31.7224C10.3251 32.8135 10.8609 33.8158 11.6475 34.6025C12.4342 35.3891 13.4365 35.9249 14.5276 36.1419C15.6188 36.359 16.7498 36.2476 17.7776 35.8218C18.8054 35.3961 19.6839 34.6751 20.302 33.7501C20.9201 32.8251 21.25 31.7375 21.25 30.625V25Z" />
  </svg>
);

/** Figma's component-set glyph (four diamonds, filled), for the layer row and the frame's label (12 grid). */
export const ComponentSetGlyph = (p: P) => (
  <svg viewBox="0 0 12 12" fill="currentColor" {...p}>
    <path d="M6 0.6L8 2.6L6 4.6L4 2.6Z M6 7.4L8 9.4L6 11.4L4 9.4Z M9.4 4L11.4 6L9.4 8L7.4 6Z M2.6 4L4.6 6L2.6 8L0.6 6Z" />
  </svg>
);

/** A pointer arrow, the picture's cursor (24 grid; its fill and edge colors come from figma-kit.css). */
export const CursorArrow = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M5 3L19 12.5L12.3 13.6L8.6 19.8Z" strokeLinejoin="round" />
  </svg>
);

/** Figma's frame glyph (a hash), for the Buttons frame's layer row (12 grid). */
export const FrameGlyph = (p: P) => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeLinecap="round" {...p}>
    <path d="M3.5 1V11 M8.5 1V11 M1 3.5H11 M1 8.5H11" />
  </svg>
);
