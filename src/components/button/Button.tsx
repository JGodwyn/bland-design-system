import { createContext, useContext, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { SpinnerIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './button.css';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonEmotion = 'brand' | 'success' | 'danger' | 'warning';
export type ButtonType = 'primary' | 'secondary' | 'ghost' | 'stroke';

/**
 * A default size for the Buttons and Icon Buttons inside it, for components whose action slot
 * has a set button size (Banner's actions are sm). A button's own `size` always wins.
 */
export const ButtonSizeContext = createContext<ButtonSize | undefined>(undefined);

/** The button's size: its own, else the nearest ButtonSizeContext, else md. */
export function useButtonSize(size: ButtonSize | undefined): ButtonSize {
  const fromContext = useContext(ButtonSizeContext); // always called: hooks can't be conditional
  return size ?? fromContext ?? 'md';
}

/** Props shared by Button and IconButton. */
export interface ButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** lg 56, md 40, sm 32, xs 24 (dense desktop UI only, below the comfortable touch target). Default md, or the size a component sets for its action slot (Banner: sm). */
  size?: ButtonSize;
  /** brand for most actions, danger for destructive ones. */
  emotion?: ButtonEmotion;
  /** primary, secondary, ghost or stroke. The native button type is `htmlType`. */
  type?: ButtonType;
  /** The native `type` attribute. Defaults to `button`, so a Button inside a form never submits by accident. */
  htmlType?: 'button' | 'submit' | 'reset';
}

export interface ButtonProps extends ButtonBaseProps {
  /** For a button without a label, use IconButton. */
  children: ReactNode;
  /** Any SVG, sized and colored by the button. */
  iconStart?: ReactNode;
  /** Any SVG after the label. */
  iconEnd?: ReactNode;
  /**
   * A spinner replaces the icon on that side (`true` means start).
   * The button keeps its label and colors, sets `aria-busy`, and ignores clicks until loading ends.
   */
  loading?: boolean | 'start' | 'end';
}

/** Spinner in the icon slot; the button's CSS rotates it and colors it like the label. */
export function ButtonSpinner() {
  return (
    <Icon className="bland-button__spinner">
      <SpinnerIcon />
    </Icon>
  );
}

/** Blocks the click while loading, so an action that is running is not started twice. */
export function guardLoading(loading: boolean, onClick: ButtonProps['onClick']) {
  return (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
}

/** Triggers an action. Figma: Buttons page, set "Button". */
export function Button({
  children,
  size: sizeProp,
  emotion = 'brand',
  type = 'primary',
  htmlType = 'button',
  iconStart,
  iconEnd,
  loading = false,
  className,
  onClick,
  ...rest
}: ButtonProps) {
  const size = useButtonSize(sizeProp);
  const loadingSide = loading === true ? 'start' : loading || null;
  const slot = (side: 'start' | 'end', icon: ReactNode) =>
    loadingSide === side ? <ButtonSpinner /> : icon ? <Icon className="bland-button__icon">{icon}</Icon> : null;

  return (
    <button
      {...rest}
      type={htmlType}
      className={`bland-button bland-focus-ring bland-smooth${className ? ` ${className}` : ''}`}
      data-size={size}
      data-emotion={emotion}
      data-type={type}
      aria-busy={loadingSide ? true : undefined}
      onClick={guardLoading(!!loadingSide, onClick)}
    >
      {slot('start', iconStart)}
      <span className="bland-button__label">{children}</span>
      {slot('end', iconEnd)}
    </button>
  );
}
