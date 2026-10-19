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

/** Figma: CaretLeft (6080:106855). Pagination's previous page. */
export const CaretLeftIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M20 26L10 16L20 6" />
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

/** Figma: CalendarBlank (6080:106067). The Date pickers' calendar button. */
export const CalendarBlankIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M26 5H6C5.44772 5 5 5.44772 5 6V26C5 26.5523 5.44772 27 6 27H26C26.5523 27 27 26.5523 27 26V6C27 5.44772 26.5523 5 26 5Z" />
    <path d="M22 3V7" />
    <path d="M10 3V7" />
    <path d="M5 11H27" />
  </svg>
);

/** Figma: Clock (6080:105872). The Time picker's icon. */
export const ClockIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" />
    <path d="M16 9V16H23" />
  </svg>
);

/** Figma: CloudArrowUp (6080:106702). File Upload's drop zone icon. */
export const CloudArrowUpIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M14 26H9.00003C8.00748 25.9988 7.02654 25.7865 6.12229 25.3772C5.21805 24.9679 4.41118 24.3711 3.75522 23.6262C3.09927 22.8813 2.60922 22.0054 2.31761 21.0566C2.02599 20.1079 1.93947 19.108 2.06379 18.1232C2.18811 17.1385 2.52043 16.1915 3.03869 15.345C3.55695 14.4985 4.2493 13.7718 5.06981 13.2133C5.89032 12.6548 6.82022 12.2772 7.79781 12.1055C8.77539 11.9338 9.77832 11.972 10.74 12.2175" />
    <path d="M15 20L19 16L23 20" />
    <path d="M19 26V16" />
    <path d="M10 16C10.0004 14.1972 10.4882 12.428 11.4117 10.8797C12.3352 9.33142 13.6601 8.06157 15.2461 7.20455C16.8322 6.34752 18.6205 5.9352 20.4216 6.01121C22.2228 6.08723 23.97 6.64875 25.4782 7.63636C26.9864 8.62398 28.1996 10.0009 28.9894 11.6215C29.7791 13.2421 30.1161 15.0461 29.9646 16.8425C29.8132 18.639 29.1789 20.361 28.1289 21.8265C27.0789 23.292 25.6523 24.4464 24 25.1675" />
  </svg>
);

/** Figma: FileArrowUp (6080:106688). File Upload's file row icon. */
export const FileArrowUpIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M25 28H7C6.73478 28 6.48043 27.8946 6.29289 27.7071C6.10536 27.5196 6 27.2652 6 27V5C6 4.73478 6.10536 4.48043 6.29289 4.29289C6.48043 4.10536 6.73478 4 7 4H19L26 11V27C26 27.2652 25.8946 27.5196 25.7071 27.7071C25.5196 27.8946 25.2652 28 25 28Z" />
    <path d="M19 4V11H26" />
    <path d="M13 18L16 15L19 18" />
    <path d="M16 23V15" />
  </svg>
);

/** Figma: Copy (6080:106113). Code snippet and Code text copy buttons. */
export const CopyIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M21 21H27V5H11V11" />
    <path d="M21 11H5V27H21V11Z" />
  </svg>
);

/** Figma: Eye (6080:106819). Code snippet's Show more. */
export const EyeIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 7C6 7 2 16 2 16C2 16 6 25 16 25C26 25 30 16 30 16C30 16 26 7 16 7Z" />
    <path d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21Z" />
  </svg>
);

/** Figma: EyeClosed (6080:105744). Code snippet's Show less. */
export const EyeClosedIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M4 13C6.10125 15.6012 9.95375 19 16 19C22.0462 19 25.8988 15.6012 28 13" />
    <path d="M28 21L25.0775 15.8862" />
    <path d="M20 24L19.1138 18.6813" />
    <path d="M12 24L12.8862 18.6813" />
    <path d="M4 21L6.9225 15.8862" />
  </svg>
);

/** Figma: SidebarSimple (6080:106739). Sidebar's collapse button; mirrored, its expand button. */
export const SidebarSimpleIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M11 6V26" />
    <path d="M27 6H5C4.44772 6 4 6.44772 4 7V25C4 25.5523 4.44772 26 5 26H27C27.5523 26 28 25.5523 28 25V7C28 6.44772 27.5523 6 27 6Z" />
  </svg>
);
