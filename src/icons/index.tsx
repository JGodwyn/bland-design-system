// Bland's own icons, exported from the Figma Icons page (Phosphor based, 32 grid, stroked).
// Only the ones Bland components use internally; projects bring any icon pack for the rest.
// Colors are currentColor and the stroke width is set by .bland-icon, so wrap them in <Icon>.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const stroked = { viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Figma: Check (6080:105599) */
export const CheckIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M5 18L12 25L28 9" />
  </svg>
);

/** Figma: X (6080:106499) */
export const XIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M25 7L7 25" />
    <path d="M25 25L7 7" />
  </svg>
);

/** Figma: CaretDown (6080:105561) */
export const CaretDownIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M26 12L16 22L6 12" />
  </svg>
);

/** Figma: Plus (6080:106833) */
export const PlusIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M5 16H27" />
    <path d="M16 5V27" />
  </svg>
);

/** Figma: Minus (6080:106048) */
export const MinusIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M5 16H27" />
  </svg>
);

/** Figma: _Spinner (6065:1682). A filled three-quarter ring; the component that uses it rotates it. */
export const SpinnerIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...p}>
    <path d="M10 0C11.9778 0 13.9112 0.58649 15.5557 1.6853C17.2002 2.78412 18.4819 4.3459 19.2388 6.17317C19.9957 8.00043 20.1937 10.0111 19.8079 11.9509C19.422 13.8907 18.4696 15.6725 17.0711 17.0711C15.6725 18.4696 13.8907 19.422 11.9509 19.8079C10.0111 20.1937 8.00043 19.9957 6.17317 19.2388C4.3459 18.4819 2.78412 17.2002 1.6853 15.5557C0.586489 13.9112 0 11.9778 0 10H2C2 11.5822 2.46919 13.129 3.34824 14.4446C4.22729 15.7602 5.47672 16.7855 6.93853 17.391C8.40034 17.9965 10.0089 18.155 11.5607 17.8463C13.1126 17.5376 14.538 16.7757 15.6569 15.6569C16.7757 14.538 17.5376 13.1126 17.8463 11.5607C18.155 10.0089 17.9965 8.40034 17.391 6.93853C16.7855 5.47672 15.7602 4.22729 14.4446 3.34824C13.129 2.46919 11.5823 2 10 2V0Z" />
  </svg>
);
