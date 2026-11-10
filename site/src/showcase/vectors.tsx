// The showcase toolbar's icons. TextT, CaretUpDown and Sun are the Figma frame's own (7071:32494, Phosphor on the
// 20 grid); Moon is the Figma Icons page's (6080:106055, 24 grid), the docs site's theme switch icon. Colors are
// currentColor (Figma's export hardcoded #576275 and #15181D). Wrap in <Icon>: it sizes them and sets the stroke.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const stroked20 = { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Figma: TextT. The font button. */
export const TextTIcon = (p: P) => (
  <svg {...stroked20} {...p}>
    <path d="M10 4.375V15.625" />
    <path d="M4.375 6.875V4.375H15.625V6.875" />
    <path d="M7.5 15.625H12.5" />
  </svg>
);

/** Figma: CaretUpDown. The font button's "more" mark. */
export const CaretUpDownIcon = (p: P) => (
  <svg {...stroked20} {...p}>
    <path d="M6.25 13.75L10 17.5L13.75 13.75" />
    <path d="M6.25 6.25L10 2.5L13.75 6.25" />
  </svg>
);

/** Figma: Sun. The theme button while the panel is light. */
export const SunIcon = (p: P) => (
  <svg {...stroked20} {...p}>
    <path d="M10 3.125V1.25" />
    <path d="M14.375 10C14.375 12.4162 12.4162 14.375 10 14.375C7.58375 14.375 5.625 12.4162 5.625 10C5.625 7.58375 7.58375 5.625 10 5.625C12.4162 5.625 14.375 7.58375 14.375 10Z" />
    <path d="M5 5L3.75 3.75" />
    <path d="M5 15L3.75 16.25" />
    <path d="M15 5L16.25 3.75" />
    <path d="M15 15L16.25 16.25" />
    <path d="M3.125 10H1.25" />
    <path d="M10 16.875V18.75" />
    <path d="M16.875 10H18.75" />
  </svg>
);

/** Figma Icons page: Moon. The theme button while the panel is dark. */
export const MoonIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M10.1353 2.63525C9.66385 4.19532 9.62441 5.85406 10.0212 7.43477C10.418 9.01548 11.2362 10.4589 12.3886 11.6113C13.541 12.7637 14.9845 13.5819 16.5652 13.9787C18.1459 14.3756 19.8047 14.3361 21.3647 13.8646C20.9124 15.3517 20.0828 16.6963 18.9565 17.7674C17.8302 18.8386 16.4457 19.5998 14.9378 19.9769C13.4299 20.354 11.8501 20.3342 10.3522 19.9194C8.85423 19.5045 7.48926 18.7088 6.39019 17.6098C5.29112 16.5107 4.49543 15.1457 4.0806 13.6478C3.66577 12.1499 3.64596 10.57 4.02308 9.06216C4.4002 7.55429 5.1614 6.16979 6.23255 5.0435C7.3037 3.91721 8.64828 3.08753 10.1353 2.63525Z" />
  </svg>
);
