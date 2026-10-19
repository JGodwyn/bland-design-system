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

/** Figma: CaretRight (6080:106193). Breadcrumb's separator. */
export const CaretRightIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M12 6L22 16L12 26" />
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

/** Figma: User (6080:106234). Avatar's placeholder. */
export const UserIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 20C20.4183 20 24 16.4183 24 12C24 7.58172 20.4183 4 16 4C11.5817 4 8 7.58172 8 12C8 16.4183 11.5817 20 16 20Z" />
    <path d="M4 27C6.42125 22.8162 10.8187 20 16 20C21.1813 20 25.5787 22.8162 28 27" />
  </svg>
);

/** Figma: _Spinner (6065:1682). A filled three-quarter ring; the component that uses it rotates it. */
export const SpinnerIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...p}>
    <path d="M10 0C11.9778 0 13.9112 0.58649 15.5557 1.6853C17.2002 2.78412 18.4819 4.3459 19.2388 6.17317C19.9957 8.00043 20.1937 10.0111 19.8079 11.9509C19.422 13.8907 18.4696 15.6725 17.0711 17.0711C15.6725 18.4696 13.8907 19.422 11.9509 19.8079C10.0111 20.1937 8.00043 19.9957 6.17317 19.2388C4.3459 18.4819 2.78412 17.2002 1.6853 15.5557C0.586489 13.9112 0 11.9778 0 10H2C2 11.5822 2.46919 13.129 3.34824 14.4446C4.22729 15.7602 5.47672 16.7855 6.93853 17.391C8.40034 17.9965 10.0089 18.155 11.5607 17.8463C13.1126 17.5376 14.538 16.7757 15.6569 15.6569C16.7757 14.538 17.5376 13.1126 17.8463 11.5607C18.155 10.0089 17.9965 8.40034 17.391 6.93853C16.7855 5.47672 15.7602 4.22729 14.4446 3.34824C13.129 2.46919 11.5823 2 10 2V0Z" />
  </svg>
);

/** Figma: MagnifyingGlass (6080:106002). Search Input's leading icon. */
export const MagnifyingGlassIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M14 24C19.5228 24 24 19.5228 24 14C24 8.47715 19.5228 4 14 4C8.47715 4 4 8.47715 4 14C4 19.5228 8.47715 24 14 24Z" />
    <path d="M21.0713 21.0713L28 28" />
  </svg>
);

/** Figma: XCircle (6080:106607). Search Input's clear button. */
export const XCircleIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M20 12L12 20" />
    <path d="M12 12L20 20" />
    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" />
  </svg>
);

/** Figma: WarningOctagon (6080:106889). Text Input's danger status icon. */
export const WarningOctagonIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 17V10" />
    <path d="M20.5562 4H11.4438C11.3124 3.9999 11.1823 4.02568 11.0609 4.07586C10.9395 4.12605 10.8292 4.19967 10.7363 4.2925L4.2925 10.7363C4.19967 10.8292 4.12605 10.9395 4.07586 11.0609C4.02568 11.1823 3.9999 11.3124 4 11.4438V20.5562C3.9999 20.6876 4.02568 20.8177 4.07586 20.9391C4.12605 21.0605 4.19967 21.1708 4.2925 21.2638L10.7363 27.7075C10.8292 27.8003 10.9395 27.8739 11.0609 27.9241C11.1823 27.9743 11.3124 28.0001 11.4438 28H20.5562C20.6876 28.0001 20.8177 27.9743 20.9391 27.9241C21.0605 27.8739 21.1708 27.8003 21.2638 27.7075L27.7075 21.2638C27.8003 21.1708 27.8739 21.0605 27.9241 20.9391C27.9743 20.8177 28.0001 20.6876 28 20.5562V11.4438C28.0001 11.3124 27.9743 11.1823 27.9241 11.0609C27.8739 10.9395 27.8003 10.8292 27.7075 10.7363L21.2638 4.2925C21.1708 4.19967 21.0605 4.12605 20.9391 4.07586C20.8177 4.02568 20.6876 3.9999 20.5562 4Z" strokeMiterlimit={10} />
    <path d="M16 23C16.8284 23 17.5 22.3284 17.5 21.5C17.5 20.6716 16.8284 20 16 20C15.1716 20 14.5 20.6716 14.5 21.5C14.5 22.3284 15.1716 23 16 23Z" fill="currentColor" stroke="none" />
  </svg>
);

/** Figma: CheckCircle (6080:106863). Text Input's success status icon. */
export const CheckCircleIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M11 17L14 20L21 13" />
    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" />
  </svg>
);

/** Figma: WarningCircle (6080:106344). Text Input's warning status icon. */
export const WarningCircleIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" strokeMiterlimit={10} />
    <path d="M16 17V10" />
    <path d="M16 23C16.8284 23 17.5 22.3284 17.5 21.5C17.5 20.6716 16.8284 20 16 20C15.1716 20 14.5 20.6716 14.5 21.5C14.5 22.3284 15.1716 23 16 23Z" fill="currentColor" stroke="none" />
  </svg>
);

/** Figma: Info (6080:105939). The info status icon of Alert, Banner, Toast and Notification. */
export const InfoIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" />
    <path d="M15 15C15.2652 15 15.5196 15.1054 15.7071 15.2929C15.8946 15.4804 16 15.7348 16 16V21C16 21.2652 16.1054 21.5196 16.2929 21.7071C16.4804 21.8946 16.7348 22 17 22" />
    <path d="M15.5 12C16.3284 12 17 11.3284 17 10.5C17 9.67157 16.3284 9 15.5 9C14.6716 9 14 9.67157 14 10.5C14 11.3284 14.6716 12 15.5 12Z" fill="currentColor" stroke="none" />
  </svg>
);

/** Figma: ArrowUp (6080:105903). A Table header sorted ascending. */
export const ArrowUpIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 27V5" />
    <path d="M7 14L16 5L25 14" />
  </svg>
);

/** Figma: ArrowDown (6080:105456). A Table header sorted descending (Figma's default sort icon). */
export const ArrowDownIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 5V27" />
    <path d="M7 18L16 27L25 18" />
  </svg>
);

/** Figma: ArrowsDownUp (6080:105480). A sortable Table header that is not sorted yet. */
export const ArrowsDownUpIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M14 22L10 26L6 22" />
    <path d="M10 6V26" />
    <path d="M18 10L22 6L26 10" />
    <path d="M22 26V6" />
  </svg>
);

/** Figma: DotsThree (6080:105704). Filled. Table's option button. */
export const DotsThreeIcon = (p: P) => (
  <svg viewBox="0 0 32 32" fill="currentColor" {...p}>
    <path d="M16 17.5C16.8284 17.5 17.5 16.8284 17.5 16C17.5 15.1716 16.8284 14.5 16 14.5C15.1716 14.5 14.5 15.1716 14.5 16C14.5 16.8284 15.1716 17.5 16 17.5Z" />
    <path d="M24.5 17.5C25.3284 17.5 26 16.8284 26 16C26 15.1716 25.3284 14.5 24.5 14.5C23.6716 14.5 23 15.1716 23 16C23 16.8284 23.6716 17.5 24.5 17.5Z" />
    <path d="M7.5 17.5C8.32843 17.5 9 16.8284 9 16C9 15.1716 8.32843 14.5 7.5 14.5C6.67157 14.5 6 15.1716 6 16C6 16.8284 6.67157 17.5 7.5 17.5Z" />
  </svg>
);
