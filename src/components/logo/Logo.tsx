import { useId, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import './logo.css';

export type LogoSize = 'sm' | 'lg';
export type LogoColor = 'default' | 'on-color';

/** What `renderLink` receives: spread it onto your router's link. */
export interface LogoLinkProps {
  href: string;
  /** Bland's link classes (look and focus ring). Keep them on the rendered element. */
  className: string;
  'data-size': LogoSize;
  'data-color': LogoColor;
  'data-mono'?: true;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}

export interface LogoProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** sm (24 tall, for top bars) or lg (40 tall). */
  size?: LogoSize;
  /**
   * default is text-bold and follows the theme; on-color is white in both, for brand fills. Put it on
   * `--surface-brand-strong`: `--surface-brand` lightens in dark, where white on it is 2.7:1.
   */
  color?: LogoColor;
  /**
   * One color: the logomark takes the wordmark's color instead of the brand's. Use it with `color="on-color"`
   * on a brand fill, where the brand logomark disappears, and wherever the logo must be one color.
   */
  mono?: boolean;
  /**
   * The logomark before the wordmark. Bland's own by default; `false` shows the wordmark alone. Any image or SVG
   * replaces it, drawn in a square the height of the logo. Decorative: hidden from screen readers.
   */
  mark?: ReactNode;
  /**
   * @deprecated Since 0.2.0, removed in 0.3.0. The wordmark is a drawing of the word Bland, so a product with
   * another name draws its own logo. Until then, text passed here is shown in place of the wordmark.
   */
  children?: ReactNode;
  /** Makes the logo a link, usually to the home page, with Bland's focus ring. */
  href?: string;
  /**
   * Renders the link when `href` is set, so any router works: `(props) => <Link to={props.href}
   * className={props.className}>{props.children}</Link>`. Defaults to a plain `<a>`.
   */
  renderLink?: (props: LogoLinkProps) => ReactNode;
}

const defaultLink = (props: LogoLinkProps) => <a {...props} />;

/** Figma: Logomark, CutOut=true (7203:40154). The B and its ruler ticks are cut out of the tile; currentColor. */
function Logomark() {
  const clip = useId();
  return (
    <svg className="bland-logo__logomark" viewBox="0 0 32 32" fill="none">
      <defs>
        <clipPath id={clip}>
          <path d="M0 10.6667C0 5.63835 0 3.12419 1.5621 1.5621C3.12419 0 5.63835 0 10.6667 0H21.3333C26.3616 0 28.8758 0 30.4379 1.5621C32 3.12419 32 5.63835 32 10.6667V21.3333C32 26.3616 32 28.8758 30.4379 30.4379C28.8758 32 26.3616 32 21.3333 32H10.6667C5.63835 32 3.12419 32 1.5621 30.4379C0 28.8758 0 26.3616 0 21.3333V10.6667Z" />
        </clipPath>
      </defs>
      <path
        clipPath={`url(#${clip})`}
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.64556 0H32V7.2279L31.052 9.35717L32 9.77924V10.4188L30.8144 9.89094L29.768 12.2411L32 13.2349V13.8744L29.5303 12.7749L28.483 15.1272L30.3261 15.9478L30.0885 16.4816L28.2454 15.661L27.1985 18.0122L30.8836 19.6529L30.6459 20.1867L26.9609 18.546L25.914 20.8972L27.7571 21.7178L27.5195 22.2516L25.6764 21.431L24.6284 23.7849L28.3134 25.4256L28.0757 25.9594L24.3907 24.3187L23.3446 26.6684L25.1877 27.489L24.95 28.0227L23.1069 27.2021L22.0601 29.5534L25.7451 31.1941L25.5074 31.7278L21.8224 30.0871L20.9708 32H0V20.3636L12.3497 25.862C14.1663 26.6708 15.7959 26.8522 17.2384 26.406C18.7077 25.9496 19.7724 24.9799 20.4327 23.4969C21.0187 22.1808 21.0494 20.9395 20.5248 19.773C20.0084 18.588 18.9583 17.5541 17.3746 16.6713L17.6222 16.1152C19.2845 16.5221 20.6423 16.5158 21.6954 16.0962C22.7484 15.6766 23.5391 14.8736 24.0673 13.6872C24.7358 12.1857 24.7398 10.7548 24.0794 9.3946C23.4457 8.02409 22.1279 6.89316 20.1258 6.00181L6.64556 0ZM10.4569 18.589L0 13.9333V11.2679L11.4473 16.3645C11.781 16.5131 12.0044 16.7347 12.1175 17.0294C12.2574 17.3138 12.249 17.6321 12.0921 17.9843C11.9436 18.318 11.722 18.5414 11.4273 18.6545C11.1326 18.7676 10.8091 18.7458 10.4569 18.589ZM12.9089 11.8844L0 6.13692V3.47152L13.8993 9.65989C14.233 9.80845 14.4564 10.0301 14.5695 10.3248C14.7094 10.6092 14.701 10.9275 14.5442 11.2797C14.3956 11.6134 14.174 11.8368 13.8793 11.9499C13.5846 12.063 13.2611 12.0412 12.9089 11.8844Z"
      />
    </svg>
  );
}

/**
 * Figma: Logo's "Bland" text layer (256:28531: Inter Bold 34 / 40, letter spacing -2), outlined, placed in its
 * 87 x 40 text box so it sits as the live text did. The sm logo draws the same shapes at 24 tall (Figma: 17 / 24, -1).
 */
function Wordmark() {
  return (
    <svg className="bland-logo__wordmark" viewBox="0 0 87 40" fill="none" role="img" aria-label="Bland">
      <path
        transform="translate(2.149 7.273)"
        fill="currentColor"
        d="M6.70552e-07 24.7273V0H9.90057C11.7197 0 13.237 0.26965 14.4524 0.808949C15.6679 1.34825 16.5814 2.09683 17.1932 3.05469C17.8049 4.0045 18.1108 5.0992 18.1108 6.33878C18.1108 7.30469 17.9176 8.15388 17.5313 8.88636C17.1449 9.6108 16.6136 10.2064 15.9375 10.6733C15.2694 11.1321 14.5047 11.4581 13.6435 11.6513V11.8928C14.5852 11.933 15.4666 12.1986 16.2876 12.6896C17.1167 13.1806 17.7888 13.8688 18.304 14.7543C18.8191 15.6316 19.0767 16.678 19.0767 17.8935C19.0767 19.2055 18.7507 20.3767 18.0987 21.407C17.4548 22.4292 16.5009 23.2382 15.2372 23.8338C13.9735 24.4295 12.416 24.7273 10.5646 24.7273H6.70552e-07ZM5.22798 20.4531H9.49006C10.947 20.4531 12.0095 20.1754 12.6776 19.62C13.3456 19.0566 13.6797 18.308 13.6797 17.3743C13.6797 16.6901 13.5147 16.0864 13.1847 15.5632C12.8546 15.04 12.3838 14.6295 11.772 14.3317C11.1683 14.0339 10.4479 13.8849 9.6108 13.8849H5.22798V20.4531ZM5.22798 10.3473H9.10369C9.82008 10.3473 10.456 10.2225 11.0114 9.97301C11.5748 9.71544 12.0175 9.35322 12.3395 8.88636C12.6695 8.41951 12.8345 7.86009 12.8345 7.2081C12.8345 6.31463 12.5166 5.59422 11.8807 5.04688C11.2528 4.49953 10.3594 4.22585 9.20029 4.22585H5.22798V10.3473ZM25.5254 0V24.7273H20.3819V0H25.5254ZM32.9339 25.0774C31.7507 25.0774 30.6963 24.8722 29.7706 24.4616C28.8449 24.0431 28.1125 23.4273 27.5732 22.6143C27.0419 21.7933 26.7763 20.7711 26.7763 19.5476C26.7763 18.5173 26.9654 17.652 27.3438 16.9517C27.7221 16.2514 28.2372 15.688 28.8892 15.2614C29.5412 14.8348 30.2817 14.5128 31.1108 14.2955C31.9479 14.0781 32.8253 13.9252 33.7429 13.8366C34.8215 13.724 35.6908 13.6193 36.3509 13.5227C37.0109 13.4181 37.4898 13.2652 37.7876 13.0639C38.0855 12.8627 38.2344 12.5649 38.2344 12.1705V12.098C38.2344 11.3333 37.9929 10.7417 37.5099 10.3232C37.035 9.90459 36.3589 9.69531 35.4815 9.69531C34.5559 9.69531 33.8194 9.90057 33.272 10.3111C32.7247 10.7135 32.3625 11.2206 32.1854 11.8324L27.4283 11.446C27.6697 10.3191 28.1447 9.34517 28.853 8.52415C29.5613 7.69508 30.4749 7.05918 31.5938 6.61648C32.7206 6.16572 34.0246 5.94034 35.5057 5.94034C36.536 5.94034 37.522 6.06108 38.4638 6.30256C39.4136 6.54403 40.2547 6.91832 40.9872 7.42543C41.7277 7.93253 42.3113 8.58452 42.7379 9.38139C43.1645 10.1702 43.3778 11.116 43.3778 12.2188V24.7273H38.5V22.1555H38.3551C38.0573 22.7351 37.6589 23.2462 37.1598 23.6889C36.6607 24.1236 36.0611 24.4657 35.3608 24.7152C34.6605 24.9567 33.8516 25.0774 32.9339 25.0774ZM34.407 21.5277C35.1636 21.5277 35.8317 21.3788 36.4112 21.081C36.9908 20.7751 37.4455 20.3646 37.7756 19.8494C38.1056 19.3343 38.2706 18.7507 38.2706 18.0987V16.1307C38.1096 16.2353 37.8883 16.3319 37.6065 16.4205C37.3329 16.5009 37.023 16.5774 36.6768 16.6499C36.3307 16.7143 35.9846 16.7746 35.6385 16.831C35.2924 16.8793 34.9785 16.9235 34.6967 16.9638C34.093 17.0523 33.5658 17.1932 33.1151 17.3864C32.6643 17.5795 32.3142 17.8411 32.0646 18.1712C31.8151 18.4931 31.6903 18.8956 31.6903 19.3786C31.6903 20.0788 31.9439 20.6141 32.451 20.9844C32.9661 21.3466 33.6181 21.5277 34.407 21.5277ZM50.5117 14.0057V24.7273H45.3683V6.18182H50.2702V9.45384H50.4876C50.8981 8.37524 51.5863 7.52202 52.5522 6.89418C53.5181 6.25829 54.6893 5.94034 56.0657 5.94034C57.3536 5.94034 58.4764 6.22207 59.4343 6.78551C60.3922 7.34896 61.1367 8.15388 61.668 9.20028C62.1992 10.2386 62.4648 11.4782 62.4648 12.919V24.7273H57.3214V13.8366C57.3294 12.7017 57.0397 11.8163 56.4521 11.1804C55.8645 10.5365 55.0555 10.2145 54.0252 10.2145C53.333 10.2145 52.7212 10.3634 52.19 10.6612C51.6668 10.959 51.2563 11.3937 50.9585 11.9652C50.6687 12.5286 50.5198 13.2088 50.5117 14.0057ZM71.3525 25.0291C69.9438 25.0291 68.668 24.6669 67.525 23.9425C66.3901 23.21 65.4886 22.1354 64.8205 20.7188C64.1605 19.294 63.8304 17.5473 63.8304 15.4787C63.8304 13.3537 64.1725 11.5869 64.8567 10.1783C65.5409 8.7616 66.4505 7.70313 67.5854 7.00284C68.7284 6.29451 69.9801 5.94034 71.3404 5.94034C72.3787 5.94034 73.244 6.11743 73.9363 6.47159C74.6365 6.81771 75.2 7.25237 75.6266 7.77557C76.0613 8.29072 76.3913 8.79782 76.6167 9.29688H76.7736V0H81.905V24.7273H76.834V21.7571H76.6167C76.3752 22.2723 76.0331 22.7834 75.5904 23.2905C75.1557 23.7895 74.5882 24.2041 73.888 24.5341C73.1957 24.8641 72.3506 25.0291 71.3525 25.0291ZM72.9824 20.9361C73.8115 20.9361 74.5118 20.7107 75.0833 20.2599C75.6628 19.8011 76.1055 19.1612 76.4114 18.3402C76.7253 17.5192 76.8823 16.5573 76.8823 15.4545C76.8823 14.3518 76.7293 13.3939 76.4235 12.581C76.1176 11.768 75.6749 11.1402 75.0953 10.6974C74.5158 10.2547 73.8115 10.0334 72.9824 10.0334C72.1373 10.0334 71.4249 10.2628 70.8453 10.7216C70.2658 11.1804 69.8271 11.8163 69.5293 12.6293C69.2315 13.4422 69.0826 14.384 69.0826 15.4545C69.0826 16.5331 69.2315 17.487 69.5293 18.3161C69.8352 19.1371 70.2739 19.781 70.8453 20.2479C71.4249 20.7067 72.1373 20.9361 72.9824 20.9361Z"
      />
    </svg>
  );
}

let warnedChildren = false;

/**
 * The Bland logo: the logomark and the wordmark, both drawings. A static `<span>`, or the home link with `href`.
 * Figma: Brand elements page, sets "Logo" and "Logomark".
 */
// The library builds without Node types; bundlers replace `process.env.NODE_ENV`.
declare const process: { env: { NODE_ENV?: string } } | undefined;

export function Logo({
  size = 'lg',
  color = 'default',
  mono = false,
  mark,
  children,
  href,
  renderLink = defaultLink,
  className,
  onClick,
  ...rest
}: LogoProps) {
  if (children != null && !warnedChildren && typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    warnedChildren = true;
    console.warn('bland-ui: Logo `children` is deprecated and goes in 0.3.0. The wordmark is a drawing of "Bland"; draw your own logo for another name.');
  }
  const content = (
    <>
      {mark !== false && mark !== null && (
        <span className="bland-logo__mark" aria-hidden>
          {mark === undefined || mark === true ? <Logomark /> : mark}
        </span>
      )}
      {children != null ? <span className="bland-logo__text">{children}</span> : <Wordmark />}
    </>
  );
  if (href !== undefined) {
    return renderLink({
      ...(rest as HTMLAttributes<HTMLAnchorElement>),
      href,
      className: `bland-logo bland-logo--link bland-focus-ring bland-smooth${className ? ` ${className}` : ''}`,
      'data-size': size,
      'data-color': color,
      'data-mono': mono || undefined,
      onClick: onClick as LogoLinkProps['onClick'],
      children: content,
    });
  }
  return (
    <span
      {...rest}
      onClick={onClick}
      className={`bland-logo${className ? ` ${className}` : ''}`}
      data-size={size}
      data-color={color}
      data-mono={mono || undefined}
    >
      {content}
    </span>
  );
}
