import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../icon/Icon';
import { Indicator } from '../indicator/Indicator';
import { Tab, TabPanel, TabScroll, useTabs, type TabItemBase, type TabsSelectionProps } from '../tabs/tabs';
import '../pills/pills.css';
import './pill-tab.css';

export type PillTabsSize = 'sm' | 'md' | 'lg';

/** One pill tab (a Figma `Pills` instance inside `Pill-tab`). */
export interface PillTabItem extends TabItemBase {
  /** Any SVG before the label. */
  icon?: ReactNode;
  /**
   * The count after the label. A number or string becomes an Indicator xl secondary, brand on
   * the selected tab and neutral otherwise (and when disabled), as on a Pill; any other node is shown as is.
   */
  count?: ReactNode;
  /** Show the icon alone; `label` stays as its accessible name. Needs `icon`. */
  hideLabel?: boolean;
}

export interface PillTabsProps
  extends TabsSelectionProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The tabs, in order. */
  items: PillTabItem[];
  /** The pill height. sm 32 (default), md 40, lg 48. */
  size?: PillTabsSize;
  /** Disables every tab. */
  disabled?: boolean;
  /** Names the tab list. Give it, or `aria-labelledby`. */
  'aria-label'?: string;
  /** Names the tab list from a visible heading. */
  'aria-labelledby'?: string;
}

/**
 * Tabs drawn as Pills, space-xs apart: the selected one takes the Control/checked fill. Unlike a filter Pill
 * (`aria-pressed`), each is a `role="tab"` with `aria-selected`. A row too long for its container scrolls
 * sideways (fade plus scrollbar). The selected tab's `panel` shows under the row. Figma: Pill tab page, set
 * "Pill-tab".
 */
export function PillTabs({
  items,
  size = 'sm',
  value,
  defaultValue,
  onValueChange,
  keyboardActivation,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  className,
  ...rest
}: PillTabsProps) {
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
  return (
    <div {...rest} className={`bland-pill-tabs${className ? ` ${className}` : ''}`}>
      <div className="bland-pill-tabs__row">
        <TabScroll listRef={listRef}>
          <div {...tabListProps} ref={listRef} className="bland-tabs__list bland-pill-tabs__list">
            {nodes.map((node) => (
              <Tab
                key={node.key}
                node={node}
                state={state}
                render={({ item, tabProps, ref, selected, disabled: off }) => {
                  const count = item.count;
                  const hasCount = count !== undefined && count !== null && count !== false;
                  return (
                    <div
                      {...tabProps}
                      ref={ref}
                      className="bland-pill bland-pill-tabs__tab bland-focus-ring"
                      data-size={size}
                      data-selected={selected || undefined}
                      aria-label={item.hideLabel ? (item.textValue ?? String(item.label)) : undefined}
                    >
                      {item.icon && <Icon className="bland-pill__icon">{item.icon}</Icon>}
                      {!item.hideLabel && <span className="bland-pill__label">{item.label}</span>}
                      {hasCount && (
                        <span className="bland-pill__count">
                          {typeof count === 'number' || typeof count === 'string' ? (
                            <Indicator size="xl" type="secondary" emotion={selected && !off ? 'brand' : 'neutral'}>
                              {count}
                            </Indicator>
                          ) : (
                            count
                          )}
                        </span>
                      )}
                    </div>
                  );
                }}
              />
            ))}
          </div>
        </TabScroll>
      </div>
      <TabPanel state={state} />
    </div>
  );
}
