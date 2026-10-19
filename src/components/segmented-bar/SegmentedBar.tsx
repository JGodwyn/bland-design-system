import { useId, useRef, useState, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { Icon } from '../icon/Icon';
import { Tab, TabPanel, useSelectionIndicator, useTabs, type TabItemBase, type TabsSelectionProps } from '../tabs/tabs';
import './segmented-bar.css';

export type SegmentedBarSize = 'md' | 'lg';

/** One segment (Figma `_segmented-bar-item`). */
export interface SegmentedBarItem extends TabItemBase {
  /** Figma `🌟 Icon` (shown with `👀 Icon`): any SVG before the label, icon/sm in md, icon/md in lg. */
  icon?: ReactNode;
  /** Figma `👀 Label` off: show the icon alone; `label` stays as its accessible name. Needs `icon`. */
  hideLabel?: boolean;
}

export interface SegmentedBarProps
  extends TabsSelectionProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The segments, in order, 2 to 4 in Figma (`Tabs`). Give each a `panel` to make the bar tabs. */
  items: SegmentedBarItem[];
  /** Figma `Size`: the bar height. md 32 (default, as in Figma), lg 40. */
  size?: SegmentedBarSize;
  /** Disables every segment. */
  disabled?: boolean;
  /** The radios' form name, for a bar without panels inside a form. Generated when left out. */
  name?: string;
  /** Names the group (or the tab list). Give it, or `aria-labelledby`. */
  'aria-label'?: string;
  /** Names the group (or the tab list) from a visible heading. */
  'aria-labelledby'?: string;
}

/**
 * A row of equal segments on a track; the selected one is a raised, bold segment. Figma: Segmented bar page,
 * sets "Segmented-bar" and "_segmented-bar-item". It is a radio group (native radios: arrow keys move and select,
 * `name` reaches forms), or, when the items carry `panel`s, a tab list whose selected panel shows under the bar.
 * It fills its container (segment/width is Figma's frame).
 */
export function SegmentedBar(props: SegmentedBarProps) {
  return props.items.some((i) => i.panel !== undefined) ? <SegmentedTabs {...props} /> : <SegmentedRadios {...props} />;
}

function Content({ item }: { item: SegmentedBarItem }) {
  return (
    <>
      {item.icon && <Icon className="bland-segmented-bar__icon">{item.icon}</Icon>}
      {!item.hideLabel && <span className="bland-segmented-bar__label">{item.label}</span>}
    </>
  );
}

/** The raised segment under the selected one; it slides between segments (tabs.css). */
function Thumb({ ref, disabled }: { ref: RefObject<HTMLSpanElement | null>; disabled: boolean }) {
  return (
    <span
      ref={ref}
      className="bland-tabs__indicator bland-segmented-bar__thumb bland-smooth"
      data-disabled={disabled || undefined}
      aria-hidden="true"
    />
  );
}

function SegmentedRadios({
  items,
  size = 'md',
  value,
  defaultValue,
  onValueChange,
  keyboardActivation: _keyboardActivation,
  disabled,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  className,
  ...rest
}: SegmentedBarProps) {
  const generated = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(defaultValue ?? items.find((i) => !i.disabled)?.id);
  const selected = value ?? own;
  // In the bar, not the Thumb: a child's layout effect runs before its parent's ref is attached.
  const thumb = useSelectionIndicator(trackRef, selected);
  const select = (id: string) => {
    if (value === undefined) setOwn(id);
    onValueChange?.(id);
  };
  return (
    <div {...rest} className={`bland-segmented-bar${className ? ` ${className}` : ''}`} data-size={size}>
      <div
        ref={trackRef}
        role="radiogroup"
        className="bland-segmented-bar__track bland-smooth"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      >
        <Thumb
          ref={thumb}
          disabled={Boolean(disabled || items.find((i) => i.id === selected)?.disabled)}
        />
        {items.map((item) => {
          const off = disabled || item.disabled;
          const on = item.id === selected;
          return (
            <label
              key={item.id}
              className="bland-segmented-bar__item bland-smooth"
              data-selected={on || undefined}
              data-disabled={off || undefined}
            >
              <input
                type="radio"
                className="bland-segmented-bar__input bland-focus-ring bland-smooth"
                name={name ?? generated}
                value={item.id}
                checked={on}
                disabled={off}
                onChange={() => select(item.id)}
                aria-label={item.hideLabel ? (item.textValue ?? String(item.label)) : undefined}
              />
              <Content item={item} />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SegmentedTabs({
  items,
  size = 'md',
  value,
  defaultValue,
  onValueChange,
  keyboardActivation,
  disabled,
  name: _name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  className,
  ...rest
}: SegmentedBarProps) {
  const { state, listRef, tabListProps, nodes } = useTabs({
    items,
    value,
    defaultValue,
    onValueChange,
    keyboardActivation,
    disabled,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  });
  const thumb = useSelectionIndicator(listRef, state.selectedKey);
  return (
    <div {...rest} className={`bland-segmented-bar${className ? ` ${className}` : ''}`} data-size={size}>
      <div {...tabListProps} ref={listRef} className="bland-segmented-bar__track bland-smooth">
        <Thumb
          ref={thumb}
          disabled={Boolean(disabled || state.selectedItem?.value?.disabled)}
        />
        {nodes.map((node) => (
          <Tab
            key={node.key}
            node={node}
            state={state}
            render={({ item, tabProps, ref, selected, disabled: off }) => (
              <div
                {...tabProps}
                ref={ref}
                className="bland-segmented-bar__item bland-focus-ring bland-smooth"
                data-selected={selected || undefined}
                data-disabled={off || undefined}
                aria-label={item.hideLabel ? (item.textValue ?? String(item.label)) : undefined}
              >
                <Content item={item} />
              </div>
            )}
          />
        ))}
      </div>
      <TabPanel state={state} />
    </div>
  );
}
