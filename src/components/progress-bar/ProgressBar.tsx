import { useId, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { CheckCircleIcon, WarningOctagonIcon, XIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './progress-bar.css';

export type ProgressBarSize = 'sm' | 'md';
export type ProgressBarStatus = 'default' | 'success' | 'danger';

interface ProgressBarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The current value, from `min` to `max`. Figma shows quarters; code takes any value. */
  value: number;
  /** The value at which the bar is full. Defaults to 100. */
  max?: number;
  /** The value at which the bar is empty. Defaults to 0. */
  min?: number;
  /** Figma `Size`: sm has a 4px track (default, as in Figma), md 8px. */
  size?: ProgressBarSize;
  /**
   * Figma `Status`: default while in progress; success and danger when it has finished, with a status icon
   * after the value. Say what happened in `helperText`: the icon is decorative.
   */
  status?: ProgressBarStatus;
  /** Figma `👀 Value`: the percentage after the track, in a fixed column so the track never changes length. */
  showValue?: boolean;
  /** Figma `✏️ Helper text` (shown with `👀 Helper text`): below the bar, colored by the status. */
  helperText?: ReactNode;
  /**
   * Figma `👀 Cancel`: shows a close button after the value (default status only) and is called when it is pressed.
   * Stopping the work is the app's job.
   */
  onCancel?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name of the cancel button. Defaults to "Cancel". */
  cancelLabel?: string;
}

/** A progress bar needs a name: a visible `label`, or `aria-label` / `aria-labelledby`. */
export type ProgressBarProps = ProgressBarBaseProps &
  (
    | {
        /** Figma `✏️ Label` (shown with `👀 Label`): above the bar, and the progress bar's accessible name. */
        label: ReactNode;
      }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-labelledby': string }
  );

const statusIcon = { success: <CheckCircleIcon />, danger: <WarningOctagonIcon /> } as const;

/** Determinate linear progress, with an optional label, value, helper text and cancel button. Figma: Progress indicators page, set "Progress-bar". */
export function ProgressBar({
  value,
  max = 100,
  min = 0,
  size = 'sm',
  status = 'default',
  showValue = true,
  label,
  helperText,
  onCancel,
  cancelLabel = 'Cancel',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...rest
}: ProgressBarProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;
  const clamped = Math.min(Math.max(value, min), max);
  const percent = max > min ? ((clamped - min) / (max - min)) * 100 : 0;
  const describedBy = [ariaDescribedby, helperText != null ? helperId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div
      {...rest}
      className={`bland-progress-bar${className ? ` ${className}` : ''}`}
      data-size={size}
      data-status={status}
    >
      {label != null && (
        <span id={labelId} className="bland-progress-bar__label">
          {label}
        </span>
      )}
      <div className="bland-progress-bar__row">
        <div
          role="progressbar"
          className="bland-progress-bar__track"
          aria-valuenow={clamped}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={ariaLabel}
          aria-labelledby={label != null ? labelId : ariaLabelledby}
          aria-describedby={describedBy}
        >
          <span className="bland-progress-bar__fill" style={{ '--_value': `${percent}%` } as CSSProperties} />
        </div>
        {showValue && (
          <span className="bland-progress-bar__value" aria-hidden="true">
            {Math.round(percent)}%
          </span>
        )}
        {status !== 'default' && <Icon className="bland-progress-bar__status-icon">{statusIcon[status]}</Icon>}
        {status === 'default' && onCancel && (
          <button
            type="button"
            className="bland-progress-bar__cancel bland-focus-ring bland-smooth"
            aria-label={cancelLabel}
            onClick={onCancel}
          >
            <Icon>
              <XIcon />
            </Icon>
          </button>
        )}
      </div>
      {helperText != null && (
        <span id={helperId} className="bland-progress-bar__helper">
          {helperText}
        </span>
      )}
    </div>
  );
}
