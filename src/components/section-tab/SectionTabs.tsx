import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../icon/Icon';
import {
  Tab,
  TabPanel,
  TabScroll,
  useSelectionIndicator,
  useTabs,
  type TabItemBase,
  type TabsSelectionProps,
} from '../tabs/tabs';
import './section-tab.css';

export type SectionTabsSize = 'sm' | 'md' | 'lg';

/** One section tab (Figma `_section-tab-item`). */
export interface SectionTabItem extends TabItemBase {
  /** Any SVG before the label. */
  icon?: ReactNode;
  /** A number or short text in a square box after the label. */
  count?: ReactNode;
  /** Show the icon alone; `label` stays as its accessible name. Needs `icon`. */
  hideLabel?: boolean;
}

export interface SectionTabsProps
  extends TabsSelectionProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The tabs, in order. */
  items: SectionTabItem[];
  /** The tab height. sm 40 (default), md 48, lg 56. */
  size?: SectionTabsSize;
  /** Disables every tab. */
  disabled?: boolean;
  /** Names the tab list. Give it, or `aria-labelledby`. */
  'aria-label'?: string;
  /** Names the tab list from a visible heading. */
  'aria-labelledby'?: string;
}

/**
 * Underline tabs that switch between sections of a page. A 1px divider runs under the row and the selected tab's
 * 2px brand underline covers it. A row too long for its container scrolls sideways (fade plus scrollbar). The
 * selected tab's `panel` shows under the row. Figma: Section tab page, sets "Section-tab" and "_section-tab-item".
 */
export function SectionTabs({
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
}: SectionTabsProps) {
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
  const indicator = useSelectionIndicator(listRef, state.selectedKey);
  const selectedOff = disabled || Boolean(state.selectedItem?.value?.disabled);
  return (
    <div {...rest} className={`bland-section-tabs${className ? ` ${className}` : ''}`} data-size={size}>
      <div className="bland-section-tabs__row">
        <TabScroll listRef={listRef}>
          <div {...tabListProps} ref={listRef} className="bland-tabs__list bland-section-tabs__list">
            <span
              ref={indicator}
              className="bland-tabs__indicator bland-section-tabs__underline"
              data-disabled={selectedOff || undefined}
              aria-hidden="true"
            />
            {nodes.map((node) => (
              <Tab
                key={node.key}
                node={node}
                state={state}
                render={({ item, tabProps, ref, selected }) => (
                  <div
                    {...tabProps}
                    ref={ref}
                    className="bland-section-tabs__tab bland-focus-ring bland-smooth"
                    data-selected={selected || undefined}
                    aria-label={item.hideLabel ? (item.textValue ?? String(item.label)) : undefined}
                  >
                    <span className="bland-section-tabs__inner bland-smooth">
                      {item.icon && <Icon className="bland-section-tabs__icon">{item.icon}</Icon>}
                      {!item.hideLabel && <span className="bland-section-tabs__label">{item.label}</span>}
                      {item.count != null && item.count !== false && (
                        <span className="bland-section-tabs__count bland-smooth">{item.count}</span>
                      )}
                    </span>
                  </div>
                )}
              />
            ))}
          </div>
        </TabScroll>
      </div>
      <TabPanel state={state} />
    </div>
  );
}
