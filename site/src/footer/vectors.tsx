// The footer's own vectors, from the Figma frame 7100:36365. Colors are currentColor (Figma's exports hardcoded
// #0A0C10, #A8B0BE and #F1F2F3, which would not follow the theme). Wrap the 20 grid icons in Bland's <Icon>.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

/** Figma: ReadCvLogo (Phosphor, stroked, 20 grid), beside "Read the docs". */
export const ReadCvLogoIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6.18703 1.88618L16.363 3.68414C16.7029 3.7442 16.9298 4.06844 16.8697 4.40835L14.5373 17.6093C14.4772 17.9493 14.153 18.1761 13.8131 18.1161L3.6371 16.3181C3.29719 16.258 3.07032 15.9338 3.13038 15.5939L5.46282 2.3929C5.52288 2.05299 5.84712 1.82612 6.18703 1.88618Z" />
    <path d="M7.59531 4.67266L14.0781 5.81797" />
    <path d="M13.6453 8.27969L7.16172 7.13516" />
    <path d="M9.97031 10.1695L6.72891 9.59687" />
  </svg>
);

/** Figma: Log (Phosphor, stroked, 20 grid), beside "Changelog". Its dot is a small filled circle. */
export const LogIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="15.625" cy="10.625" r="0.9375" fill="currentColor" stroke="none" />
    <path d="M18.75 10.625C18.75 13.3864 17.3509 15.625 15.625 15.625C13.8991 15.625 12.5 13.3864 12.5 10.625C12.5 7.86358 13.8991 5.625 15.625 5.625C17.3509 5.625 18.75 7.86358 18.75 10.625Z" />
    <path d="M7.5 5.625L10.625 2.5H13.125" />
    <path d="M15.625 15.625H4.375C2.64922 15.625 1.25 13.3867 1.25 10.625C1.25 7.86328 2.64922 5.625 4.375 5.625H15.625" />
    <path d="M1.34844 9.375H8.125" />
    <path d="M6.25 12.5H12.7273" />
  </svg>
);

/** Figma: the MIT mark (filled), centred in the 20 grid as in Figma (20 x 10.3, inset 24.25% top and bottom). */
export const MitIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...p}>
    <g transform="translate(0 4.8498)">
      <path d="M2.17094 0H0V10.3004H2.17094V0Z" />
      <path d="M5.72748 0H3.55654V7.11308H5.72748V0Z" />
      <path d="M9.28402 0H7.11308V10.3004H9.28402V0Z" />
      <path d="M16.3974 3.27938H14.2262V10.3001H16.3974V3.27938Z" />
      <path d="M20 0H14.2262V2.17094H20V0Z" />
      <path d="M12.8406 3.27938H10.6698V10.3001H12.8406V3.27938Z" />
      <path d="M12.8406 0H10.6698V2.17094H12.8406V0Z" />
    </g>
  </svg>
);

/** Figma: the npm wordmark (filled), 44 x 17.2 inside a 48 x 20 frame. Sized by the footer's CSS, not <Icon>. */
export const NpmLogo = (p: P) => (
  <svg viewBox="0 0 48 20" fill="currentColor" {...p}>
    <g transform="translate(2 1)">
      <path d="M22 4.9H19.6V9.74H22V4.9Z" />
      <path d="M0 0V14.7H12.2V17.2H22V14.7H44V0H0ZM12.2 12.2H9.8V4.9H7.3V12.2H2.5V2.5H12.2V12.2ZM24.5 12.2H19.6V14.7H14.7V2.5H24.5V12.2ZM41.6 12.2H39.2V4.9H36.7V12.2H34.2V4.9H31.8V12.2H26.9V2.5H41.6V12.2Z" />
    </g>
  </svg>
);
