import { useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type RefObject } from 'react';
import {
  mergeProps,
  useFocusRing,
  useHover,
  useLocale,
  useNumberField,
  useNumberFormatter,
  useSlider,
  useSliderThumb,
  VisuallyHidden,
} from 'react-aria';
import { useNumberFieldState, useSliderState, type SliderState } from 'react-stately';
import { TextInput } from '../text-input/TextInput';
import { Tooltip } from '../tooltip/Tooltip';
import './slider.css';

export type SliderSize = 'sm' | 'md' | 'lg';
export type SliderType = 'single' | 'double';

interface SliderBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Figma `Size`: the thumb (slider/thumb-*, 16, 20, 24) and the row it sits in (control/xs, sm, md). Default sm, as in Figma. */
  size?: SliderSize;
  /** The lowest value. Default 0. */
  min?: number;
  /** The highest value. Default 100. */
  max?: number;
  /** The distance between values a thumb can take. Default 1. */
  step?: number;
  /**
   * Figma `👀 Labels`: the scale under the track. `true` (default, as in Figma) shows five values from `min` to
   * `max`, a number from 2 to 5 shows that many, an array shows exactly those values; `false` hides it.
   * Each label sits on its value; the ones at `min` and `max` line up with the track's ends.
   */
  labels?: boolean | number | readonly number[];
  /**
   * Figma `👀 Input field`: a value field (Text Input, slider/input-width wide) to type a value into, committed
   * on Enter or blur. A range gets two, the start before the track and the end after it.
   */
  inputField?: boolean;
  /** Figma `👀 Tooltip` on each thumb: the value over a thumb while it is hovered, focused from the keyboard or dragged. Default true. */
  tooltip?: boolean;
  /** How values read in the tooltip, the labels, the fields and to screen readers, as `Intl.NumberFormat` options (`{ style: 'percent' }` expects 0 to 1). */
  formatOptions?: Intl.NumberFormatOptions;
  /** Figma `State=disabled`: no dragging, no focus, the disabled colors. */
  disabled?: boolean;
  /** The form field name, given to each thumb's range input (a range submits two values under it). */
  name?: string;
  /** Names the slider (Figma has no visible label). Use this or `aria-labelledby`. */
  'aria-label'?: string;
  /** Names the slider by a visible element's id. */
  'aria-labelledby'?: string;
}

export interface SliderSingleProps extends SliderBaseProps {
  /** Figma `Type`: one thumb for a value (default), or two for a range. */
  type?: 'single';
  /** The value, controlled. Pair it with `onValueChange`. */
  value?: number;
  /** The value at first, uncontrolled. Defaults to `min`. */
  defaultValue?: number;
  /** Called with the value as it changes, while dragging too. */
  onValueChange?: (value: number) => void;
  /** Called with the value once a change ends: the pointer is let go, a key is pressed or a field commits. */
  onValueCommit?: (value: number) => void;
}

export interface SliderDoubleProps extends SliderBaseProps {
  /** Figma `Type`: one thumb for a value (default), or two for a range. */
  type: 'double';
  /** The range `[start, end]`, controlled. Pair it with `onValueChange`. */
  value?: readonly [number, number];
  /** The range at first, uncontrolled. Defaults to `[min, max]`. */
  defaultValue?: readonly [number, number];
  /** Called with the range as it changes, while dragging too. */
  onValueChange?: (value: [number, number]) => void;
  /** Called with the range once a change ends: the pointer is let go, a key is pressed or a field commits. */
  onValueCommit?: (value: [number, number]) => void;
  /** Names of the two thumbs, read after the slider's name. Default `['Minimum', 'Maximum']`. */
  thumbLabels?: readonly [string, string];
}

export type SliderProps = SliderSingleProps | SliderDoubleProps;

/** The values the scale shows: `count` evenly spread from min to max, snapped to the step. */
function scaleValues(labels: SliderBaseProps['labels'], min: number, max: number, step: number): number[] {
  if (labels === false || labels == null) return [];
  if (typeof labels !== 'boolean' && typeof labels !== 'number') return [...labels];
  const count = Math.min(5, Math.max(2, labels === true ? 5 : Math.round(labels)));
  return Array.from({ length: count }, (_, i) => {
    const raw = min + ((max - min) * i) / (count - 1);
    return Math.min(max, Math.max(min, min + Math.round((raw - min) / step) * step));
  });
}

/** A thumb: Figma `_knob`, a circle with a dot, over a visually hidden range input that takes focus and keys. */
function Thumb({
  state,
  index,
  trackRef,
  name,
  label,
  tooltip,
}: {
  state: SliderState;
  index: number;
  trackRef: RefObject<HTMLSpanElement | null>;
  name?: string;
  label?: string;
  tooltip: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { thumbProps, inputProps, isDragging } = useSliderThumb({ index, trackRef, inputRef, name, 'aria-label': label }, state);
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: state.isDisabled });
  // Escape hides the tooltip (WCAG 1.4.13) until the next key, pointer entry or drag.
  const [dismissed, setDismissed] = useState(false);
  const show = !state.isDisabled && !dismissed && (isHovered || isFocusVisible || isDragging);
  // React Aria's own tooltip listens for Escape on the document in the capture phase and stops it there once its
  // tooltip is open, so the input may never see it: listen in the same place too.
  useEffect(() => {
    if (!show) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [show]);

  const thumb = (
    <div
      {...mergeProps(thumbProps, hoverProps, {
        onPointerEnter: () => setDismissed(false),
        onPointerDown: () => setDismissed(false),
      })}
      className="bland-slider__thumb bland-focus-ring"
      data-dragging={isDragging || undefined}
      style={{ '--_p': state.getThumbPercent(index) } as CSSProperties}
    >
      <span className="bland-slider__dot" />
      <VisuallyHidden>
        <input
          ref={inputRef}
          {...mergeProps(inputProps, focusProps, { onKeyDown: (event: { key: string }) => setDismissed(event.key === 'Escape') })}
        />
      </VisuallyHidden>
    </div>
  );

  if (!tooltip) return thumb;
  return (
    <Tooltip text={state.getThumbValueLabel(index)} placement="top" open={show}>
      {thumb}
    </Tooltip>
  );
}

/**
 * The value field: a Text Input that takes a number, committed on Enter or blur (React Aria NumberField), kept
 * between the slider's ends and, in a range, on its side of the other thumb.
 */
function ValueField({
  state,
  index,
  size,
  formatOptions,
  labelledBy,
}: {
  state: SliderState;
  index: number;
  size: SliderSize;
  formatOptions?: Intl.NumberFormatOptions;
  labelledBy: string;
}) {
  const { locale } = useLocale();
  const ref = useRef<HTMLInputElement>(null);
  const value = state.values[index];
  const props = {
    'aria-labelledby': labelledBy,
    value,
    // An empty or unreadable entry commits NaN: the field goes back to the thumb's value.
    onChange: (next: number) => {
      if (Number.isNaN(next) || next === value) return;
      // Marking the thumb as dragged around the change makes the slider report it as a finished change too.
      state.setThumbDragging(index, true);
      state.setThumbValue(index, next);
      state.setThumbDragging(index, false);
    },
    minValue: state.getThumbMinValue(index),
    maxValue: state.getThumbMaxValue(index),
    step: state.step,
    formatOptions,
    isDisabled: state.isDisabled,
    isWheelDisabled: true,
  };
  const fieldState = useNumberFieldState({ ...props, locale });
  const { inputProps } = useNumberField(props, fieldState, ref);
  // TextInput takes the native size attribute's place for its own size, so it never reaches the input.
  const { size: _size, ...input } = inputProps as typeof inputProps & { size?: number };
  return (
    <TextInput
      {...input}
      ref={ref}
      size={size === 'lg' ? 'md' : 'sm'}
      className="bland-slider__field"
      data-thumb={index}
    />
  );
}

/**
 * Picks a value (single) or a range (double) on a track. React Aria runs the behaviour (pointer and touch dragging,
 * arrows, Page Up and Down, Home and End, a visually hidden range input per thumb); each thumb shows its value in a
 * Tooltip while hovered, focused or dragged. Width slider/width (256), capped at its container. Figma: Slider page,
 * set "Slider", with `_knob` and `_slider-labels`.
 */
export function Slider(props: SliderProps) {
  const {
    type = 'single',
    size = 'sm',
    min = 0,
    max = 100,
    step = 1,
    labels = true,
    inputField = false,
    tooltip = true,
    formatOptions,
    disabled = false,
    name,
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    thumbLabels: _thumbLabels,
    className,
    style,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  } = props as SliderBaseProps & {
    type?: SliderType;
    value?: number | readonly number[];
    defaultValue?: number | readonly number[];
    onValueChange?: (value: never) => void;
    onValueCommit?: (value: never) => void;
    thumbLabels?: readonly [string, string];
  };
  const double = type === 'double';
  const thumbLabels = _thumbLabels ?? ['Minimum', 'Maximum'];
  const autoId = useId();
  const groupId = id ?? `${autoId}slider`;
  const thumbNameId = `${autoId}thumb`;

  const toArray = (v: number | readonly number[] | undefined) => (v === undefined ? undefined : typeof v === 'number' ? [v] : [...v]);
  const fromArray = (v: number[]) => (double ? [v[0], v[1]] : v[0]) as never;
  const ariaProps = {
    id: groupId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    minValue: min,
    maxValue: max,
    step,
    isDisabled: disabled,
    value: toArray(value),
    defaultValue: toArray(defaultValue) ?? (double ? [min, max] : [min]),
    onChange: (next: number[]) => onValueChange?.(fromArray(next)),
    onChangeEnd: (next: number[]) => onValueCommit?.(fromArray(next)),
  };
  const numberFormatter = useNumberFormatter(formatOptions);
  const state = useSliderState({ ...ariaProps, numberFormatter });
  // The rail is the thumbs' travel: the track less half a thumb at each end, so a thumb's centre sits on its value
  // and never leaves the track. React Aria measures it to turn pointer moves into values.
  const railRef = useRef<HTMLSpanElement>(null);
  const { groupProps, trackProps } = useSlider(ariaProps, state, railRef);

  const scale = scaleValues(labels, min, max, step);
  const percent = (v: number) => (max === min ? 0 : (Math.min(max, Math.max(min, v)) - min) / (max - min));
  // The fields are named by the slider and, in a range, by their thumb.
  const fieldName = (index: number) => [ariaLabelledby ?? groupId, double ? `${thumbNameId}${index}` : null].filter(Boolean).join(' ');

  const bar = (part: 'active' | 'inactive', start?: number, end?: number) => (
    <span
      className="bland-slider__bar"
      data-part={part}
      data-start={start !== undefined || undefined}
      data-end={end !== undefined || undefined}
      style={{ '--_start': start, '--_end': end } as CSSProperties}
    />
  );
  const p = state.values.map((_, i) => state.getThumbPercent(i));

  return (
    <div
      {...mergeProps(rest, groupProps)}
      className={`bland-slider${className ? ` ${className}` : ''}`}
      style={style}
      data-size={size}
      data-type={double ? 'double' : 'single'}
      data-input={inputField ? (double ? 'both' : 'end') : undefined}
      data-disabled={disabled || undefined}
    >
      {inputField && double && <ValueField state={state} index={0} size={size} formatOptions={formatOptions} labelledBy={fieldName(0)} />}
      <div {...trackProps} className="bland-slider__track">
        <span ref={railRef} className="bland-slider__rail" />
        {double ? (
          <>
            {bar('inactive', undefined, p[0])}
            {bar('active', p[0], p[1])}
            {bar('inactive', p[1])}
          </>
        ) : (
          <>
            {bar('active', undefined, p[0])}
            {bar('inactive', p[0])}
          </>
        )}
        {state.values.map((_, i) => (
          <Thumb key={i} state={state} index={i} trackRef={railRef} name={name} label={double ? thumbLabels[i] : undefined} tooltip={tooltip} />
        ))}
      </div>
      {inputField && (
        <ValueField state={state} index={double ? 1 : 0} size={size} formatOptions={formatOptions} labelledBy={fieldName(double ? 1 : 0)} />
      )}
      {scale.length > 0 && (
        // The scale is a visual aid: each thumb already reads its value, minimum and maximum.
        <div className="bland-slider__labels" aria-hidden="true">
          {scale.map((v, i) => (
            <span
              key={i}
              className="bland-slider__label"
              data-edge={v <= min ? 'start' : v >= max ? 'end' : undefined}
              style={{ '--_p': percent(v) } as CSSProperties}
            >
              {numberFormatter.format(v)}
            </span>
          ))}
        </div>
      )}
      {double &&
        thumbLabels.map((text, i) => (
          <span key={i} id={`${thumbNameId}${i}`} hidden>
            {text}
          </span>
        ))}
    </div>
  );
}
