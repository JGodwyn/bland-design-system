import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { SpinnerIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './button.css';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonEmotion = 'brand' | 'success' | 'danger' | 'warning';
export type ButtonType = 'primary' | 'secondary' | 'ghost' | 'stroke';

/** Props shared by Button and IconButton. */
export interface ButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Figma `Size`. lg 56, md 40, sm 32, xs 24 (dense desktop UI only, below the comfortable touch target). */
  size?: ButtonSize;
  /** Figma `Emotion`: brand for most actions, danger for destructive ones. */
  emotion?: ButtonEmotion;
  /** Figma `Type`: primary, secondary, ghost or stroke. The native button type is `htmlType`. */
  type?: ButtonType;
  /** The native `type` attribute. Defaults to `button`, so a Button inside a form never submits by accident. */
  htmlType?: 'button' | 'submit' | 'reset';
}

export interface ButtonProps extends ButtonBaseProps {
  /** Figma `✏️ Label`. For a button without a label, use IconButton. */
  children: ReactNode;
  /** Figma `🌟 Icon (L)`: any SVG, sized and colored by the button. */
  iconStart?: ReactNode;
  /** Figma `🌟 Icon (R)`. */
  iconEnd?: ReactNode;
  /**
   * Figma `👀 Loading (L)` / `(R)`: a spinner replaces the icon on that side (`true` means start).
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
  size = 'md',
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
