import type { CSSProperties, OlHTMLAttributes, ReactNode } from 'react';
import { CheckIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './progress-wizard.css';

export type ProgressWizardLayout = 'inline' | 'centered' | 'stacked';
export type ProgressWizardStyle = 'bar' | 'connector';
export type ProgressWizardProgress = 'done' | 'current' | 'next';

export interface ProgressWizardStep {
  /** Figma `✏️ Title`. */
  title: ReactNode;
  /** Figma `✏️ Description` (shown with `👀 Description`). */
  description?: ReactNode;
  /** Figma `State=disabled` for this step only. */
  disabled?: boolean;
}

export interface ProgressWizardProps extends Omit<OlHTMLAttributes<HTMLOListElement>, 'children' | 'style'> {
  /** The steps, in order. Figma shows 2 to 5. */
  steps: ProgressWizardStep[];
  /**
   * Index of the current step, from 0. Steps before it are done, steps after it are next.
   * Pass `steps.length` when every step is done.
   */
  current: number;
  /** Figma `Layout`: inline (marker beside the text, default), centered (marker above, centered) or stacked (marker above, left aligned). */
  layout?: ProgressWizardLayout;
  /** Figma `Style`: bar (a 2px bar on top of each step, default) or connector (a line between markers). The native style attribute is `htmlStyle`. */
  style?: ProgressWizardStyle;
  /** The native `style` attribute, renamed because Figma's `Style` owns the name. */
  htmlStyle?: CSSProperties;
  /** Figma `State=disabled` for every step. */
  disabled?: boolean;
  /** What a screen reader hears for each step's marker. Defaults to "Completed", "Current" and "Not started". */
  progressLabels?: Record<ProgressWizardProgress, string>;
}

const defaultLabels: Record<ProgressWizardProgress, string> = {
  done: 'Completed',
  current: 'Current',
  next: 'Not started',
};

function progressOf(index: number, current: number): ProgressWizardProgress {
  return index < current ? 'done' : index === current ? 'current' : 'next';
}

/** Multi-step progress (stepper): done, current and upcoming steps. Not interactive. Figma: Progress indicators page, set "Progress-wizard". */
export function ProgressWizard({
  steps,
  current,
  layout = 'inline',
  style = 'bar',
  htmlStyle,
  disabled = false,
  progressLabels = defaultLabels,
  className,
  ...rest
}: ProgressWizardProps) {
  const last = steps.length - 1;

  return (
    <ol
      {...rest}
      style={htmlStyle}
      className={`bland-progress-wizard${className ? ` ${className}` : ''}`}
      data-layout={layout}
      data-style={style}
    >
      {steps.map((step, index) => {
        const progress = progressOf(index, current);
        // A line is brand once the step it leads into is reached (Figma's _progress-wizard-item).
        const line = (side: 'start' | 'end', shown: boolean) => (
          <span
            className="bland-progress-wizard__line"
            data-side={side}
            data-reached={(side === 'start' ? index <= current : index < current) || undefined}
            data-hidden={!shown || undefined}
          />
        );
        const connector = style === 'connector';
        const marker = (
          <span className="bland-progress-wizard__marker" role="img" aria-label={progressLabels[progress]}>
            {progress === 'done' && (
              <Icon>
                <CheckIcon />
              </Icon>
            )}
            {progress === 'current' && <span className="bland-progress-wizard__dot" />}
          </span>
        );

        return (
          <li
            key={index}
            className="bland-progress-wizard__step"
            data-progress={progress}
            data-disabled={disabled || step.disabled || undefined}
            aria-current={progress === 'current' ? 'step' : undefined}
          >
            {connector && layout !== 'inline' ? (
              <span className="bland-progress-wizard__marker-row">
                {layout === 'centered' && line('start', index > 0)}
                {marker}
                {line('end', index < last)}
              </span>
            ) : (
              <span className="bland-progress-wizard__marker-wrap">{marker}</span>
            )}
            <span className="bland-progress-wizard__text">
              {connector && layout === 'inline' ? (
                <span className="bland-progress-wizard__title-row">
                  <span className="bland-progress-wizard__title">{step.title}</span>
                  {index < last && <span className="bland-progress-wizard__connector">{line('end', true)}</span>}
                </span>
              ) : (
                <span className="bland-progress-wizard__title">{step.title}</span>
              )}
              {step.description != null && (
                <span className="bland-progress-wizard__description">{step.description}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
