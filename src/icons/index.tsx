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

/** Figma: Checks (6080:106650). A delivered or seen message. */
export const ChecksIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M2 16.2862L6.8 21L18 10" />
    <path d="M15.745 18L18.8 21L30 10" />
  </svg>
);

/** Figma: Play (6080:106245). Audio and video chat bubbles. */
export const PlayIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M9 4.98497V27.015C9.00327 27.1908 9.05282 27.3626 9.14368 27.5131C9.23453 27.6637 9.36347 27.7876 9.51749 27.8724C9.67152 27.9572 9.84518 27.9999 10.021 27.9962C10.1967 27.9925 10.3684 27.9425 10.5188 27.8512L28.5287 16.8362C28.6726 16.7491 28.7916 16.6264 28.8741 16.4799C28.9567 16.3334 29.0001 16.1681 29.0001 16C29.0001 15.8318 28.9567 15.6665 28.8741 15.52C28.7916 15.3735 28.6726 15.2508 28.5287 15.1637L10.5188 4.14872C10.3684 4.05748 10.1967 4.00748 10.021 4.00376C9.84518 4.00005 9.67152 4.04275 9.51749 4.12755C9.36347 4.21236 9.23453 4.33628 9.14368 4.48681C9.05282 4.63734 9.00327 4.80917 9 4.98497Z" />
  </svg>
);

/** Figma: Pause (6080:106087). A playing audio chat bubble. */
export const PauseIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M25 5H20C19.4477 5 19 5.44772 19 6V26C19 26.5523 19.4477 27 20 27H25C25.5523 27 26 26.5523 26 26V6C26 5.44772 25.5523 5 25 5Z" />
    <path d="M12 5H7C6.44772 5 6 5.44772 6 6V26C6 26.5523 6.44772 27 7 27H12C12.5523 27 13 26.5523 13 26V6C13 5.44772 12.5523 5 12 5Z" />
  </svg>
);

/** Figma: File (6080:105762). A document chat bubble. */
export const FileIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M25 28H7C6.73478 28 6.48043 27.8946 6.29289 27.7071C6.10536 27.5196 6 27.2652 6 27V5C6 4.73478 6.10536 4.48043 6.29289 4.29289C6.48043 4.10536 6.73478 4 7 4H19L26 11V27C26 27.2652 25.8946 27.5196 25.7071 27.7071C25.5196 27.8946 25.2652 28 25 28Z" />
    <path d="M19 4V11H26" />
  </svg>
);

/** Figma: Phone (6080:106567). Chat navbar's voice call. */
export const PhoneIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M20.5488 18.1675C20.6872 18.0753 20.8465 18.0192 21.0122 18.0041C21.1779 17.989 21.3447 18.0156 21.4975 18.0812L27.3925 20.7225C27.5912 20.8074 27.757 20.9543 27.8651 21.1414C27.9733 21.3284 28.018 21.5454 27.9925 21.76C27.7983 23.2113 27.0836 24.5427 25.9813 25.5065C24.8791 26.4704 23.4642 27.0011 22 27C17.4913 27 13.1673 25.2089 9.97919 22.0208C6.79107 18.8327 5 14.5087 5 9.99997C4.99888 8.53573 5.5296 7.12091 6.49345 6.01864C7.45731 4.91637 8.78869 4.20167 10.24 4.00747C10.4545 3.98199 10.6716 4.02666 10.8586 4.13482C11.0456 4.24299 11.1926 4.40881 11.2775 4.60747L13.9188 10.5075C13.9836 10.659 14.0101 10.8242 13.9957 10.9885C13.9813 11.1527 13.9265 11.3108 13.8363 11.4487L11.165 14.625C11.0702 14.768 11.0142 14.9331 11.0024 15.1042C10.9906 15.2753 11.0233 15.4466 11.0975 15.6012C12.1313 17.7175 14.3188 19.8787 16.4413 20.9025C16.5967 20.9763 16.7688 21.0084 16.9404 20.9954C17.112 20.9825 17.2773 20.925 17.42 20.8287L20.5488 18.1675Z" />
  </svg>
);

/** Figma: VideoCamera (6080:106508). Chat navbar's video call. */
export const VideoCameraIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M24 8H4C3.44772 8 3 8.44772 3 9V23C3 23.5523 3.44772 24 4 24H24C24.5523 24 25 23.5523 25 23V9C25 8.44772 24.5523 8 24 8Z" />
    <path d="M25 14L31 10V22L25 18" />
  </svg>
);

/** Figma: ArrowBendUpLeft (6080:105465). Chat message bar's reply panel. */
export const ArrowBendUpLeftIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M10 19L4 13L10 7" />
    <path d="M28 25C28 21.8174 26.7357 18.7652 24.4853 16.5147C22.2348 14.2643 19.1826 13 16 13H4" />
  </svg>
);

/** Figma: Smiley (6080:106103). Chat message bar's emoji button; the eyes are filled. */
export const SmileyIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" />
    <path d="M11.5 15C12.3284 15 13 14.3284 13 13.5C13 12.6716 12.3284 12 11.5 12C10.6716 12 10 12.6716 10 13.5C10 14.3284 10.6716 15 11.5 15Z" fill="currentColor" stroke="none" />
    <path d="M20.5 15C21.3284 15 22 14.3284 22 13.5C22 12.6716 21.3284 12 20.5 12C19.6716 12 19 12.6716 19 13.5C19 14.3284 19.6716 15 20.5 15Z" fill="currentColor" stroke="none" />
    <path d="M21 19C19.9625 20.7938 18.2213 22 16 22C13.7787 22 12.0375 20.7938 11 19" />
  </svg>
);

/** Figma: Sticker (6080:106309). Chat message bar's sticker button. */
export const StickerIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M17 27H11C9.4087 27 7.88258 26.3679 6.75736 25.2426C5.63214 24.1174 5 22.5913 5 21V11C5 9.4087 5.63214 7.88258 6.75736 6.75736C7.88258 5.63214 9.4087 5 11 5H21C22.5913 5 24.1174 5.63214 25.2426 6.75736C26.3679 7.88258 27 9.4087 27 11V17C26 20 20 26 17 27Z" />
    <path d="M17 27V23C17 21.4087 17.6321 19.8826 18.7574 18.7574C19.8826 17.6321 21.4087 17 23 17H27" />
  </svg>
);

/** Figma: PlusCircle (6080:106266). Chat message bar's attach button. */
export const PlusCircleIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" />
    <path d="M11 16H21" />
    <path d="M16 11V21" />
  </svg>
);

/** Figma: Microphone (6080:106044). Chat message bar's record button. */
export const MicrophoneIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M21 8C21 5.23858 18.7614 3 16 3C13.2386 3 11 5.23858 11 8V16C11 18.7614 13.2386 21 16 21C18.7614 21 21 18.7614 21 16V8Z" />
    <path d="M16 25V30" />
    <path d="M25 16C25 18.3869 24.0518 20.6761 22.364 22.364C20.6761 24.0518 18.3869 25 16 25C13.6131 25 11.3239 24.0518 9.63604 22.364C7.94821 20.6761 7 18.3869 7 16" />
  </svg>
);

/** Figma: PaperPlaneRight (6080:106152). Chat message bar's send button. */
export const PaperPlaneRightIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M18 16H10" />
    <path d="M6.06121 27.6601C5.9909 27.8521 5.98115 28.0611 6.03328 28.2588C6.08541 28.4566 6.19691 28.6336 6.35275 28.766C6.50859 28.8984 6.70128 28.9799 6.90484 28.9994C7.10841 29.0189 7.31306 28.9755 7.49121 28.8751L28.4912 16.8639C28.6475 16.7774 28.7778 16.6506 28.8685 16.4967C28.9592 16.3428 29.0071 16.1675 29.0071 15.9889C29.0071 15.8102 28.9592 15.6349 28.8685 15.481C28.7778 15.3271 28.6475 15.2003 28.4912 15.1139L7.49121 3.1326C7.31359 3.03326 7.1099 2.99048 6.90732 3.00997C6.70475 3.02945 6.51295 3.11028 6.35753 3.24166C6.2021 3.37303 6.09046 3.5487 6.03752 3.7452C5.98457 3.9417 5.99283 4.14967 6.06121 4.34135L9.99996 16.0001L6.06121 27.6601Z" />
  </svg>
);

/** Figma: Trash (6080:106687). Chat message bar's delete recording button. */
export const TrashIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M27 7H5" />
    <path d="M13 13V21" />
    <path d="M19 13V21" />
    <path d="M25 7V26C25 26.2652 24.8946 26.5196 24.7071 26.7071C24.5196 26.8946 24.2652 27 24 27H8C7.73478 27 7.48043 26.8946 7.29289 26.7071C7.10536 26.5196 7 26.2652 7 26V7" />
    <path d="M21 7V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H13C12.4696 3 11.9609 3.21071 11.5858 3.58579C11.2107 3.96086 11 4.46957 11 5V7" />
  </svg>
);

/** Figma: List (6080:106319). The Calendar title toggle's icon. */
export const ListIcon = (p: P) => (
  <svg {...stroked} {...p}>
    <path d="M5 16H27" />
    <path d="M5 8H27" />
    <path d="M5 24H27" />
  </svg>
);
