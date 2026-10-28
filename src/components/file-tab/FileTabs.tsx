import { useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { XIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { Tab, TabPanel, TabScroll, useTabs, type TabItemBase, type TabsSelectionProps } from '../tabs/tabs';
import './file-tab.css';

export type FileTabsSize = 'sm' | 'md' | 'lg';

/** One file tab (Figma `_file-tab-item`). */
export interface FileTabItem extends TabItemBase {
  /** Leading content such as a file-type icon, sized icon/sm, md or lg by size. */
  leading?: ReactNode;
  /**
   * A square tab that shows only `leading` (a pinned tab). `label` stays as its accessible
   * name. Needs `leading`; a minimized tab has no close button.
   */
  minimized?: boolean;
  /** Whether this tab shows the close button. Defaults to true when the row has `onClose`. */
  closable?: boolean;
}

export interface FileTabsProps
  extends TabsSelectionProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The tabs, in order. */
  items: FileTabItem[];
  /** The tab height. sm 32 (default), md 40, lg 48. */
  size?: FileTabsSize;
  /**
   * Called with a tab's `id` when its close button is pressed, or Delete is pressed on it. Remove it from
   * `items` here. Closing the selected tab first selects its neighbour (the next tab, else the previous one).
   */
  onClose?: (id: string) => void;
  /** Disables every tab. */
  disabled?: boolean;
  /** Names the tab list. Give it, or `aria-labelledby`. */
  'aria-label'?: string;
  /** Names the tab list from a visible heading. */
  'aria-labelledby'?: string;
}

/**
 * Editor or browser style tabs on a surface-300 bar, 1px border-subtle lines between them. The selected tab is
 * surface-100, so it joins the content under the bar. Tabs can close (a button, or Delete) and be minimized to
 * their leading icon. A row too long for its container scrolls sideways (fade plus scrollbar). Figma: File tab
 * page, sets "File-tab" and "_file-tab-item".
 */
export function FileTabs({
  items,
  size = 'sm',
  value,
  defaultValue,
  onValueChange,
  keyboardActivation,
  onClose,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  className,
  ...rest
}: FileTabsProps) {
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
  const tabs = useRef(new Map<string, HTMLDivElement>());

  const close = (id: string) => {
    if (!onClose) return;
    const open = items.filter((i) => !i.disabled && !disabled);
    const at = open.findIndex((i) => i.id === id);
    const next = open[at + 1] ?? open[at - 1];
    const hadFocus = tabs.current.get(id)?.contains(document.activeElement) ?? false;
    if (state.selectedKey === id && next) state.setSelectedKey(next.id);
    onClose(id);
    // The closed tab leaves the DOM; keep keyboard focus in the row, on its neighbour.
    if (hadFocus && next) requestAnimationFrame(() => tabs.current.get(next.id)?.focus());
  };

  return (
    <div {...rest} className={`bland-file-tabs${className ? ` ${className}` : ''}`} data-size={size}>
      <div className="bland-file-tabs__bar">
        <TabScroll listRef={listRef}>
          <div {...tabListProps} ref={listRef} className="bland-tabs__list bland-file-tabs__list">
            {nodes.map((node) => (
              <Tab
                key={node.key}
                node={node}
                state={state}
                ref={(el: HTMLDivElement | null) => {
                  if (el) tabs.current.set(String(node.key), el);
                  else tabs.current.delete(String(node.key));
                }}
                render={({ item, tabProps, ref, selected, disabled: off }) => {
                  const minimized = Boolean(item.minimized && item.leading);
                  const closable = Boolean(onClose) && !minimized && (item.closable ?? true);
                  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
                    tabProps.onKeyDown?.(e);
                    if (e.key === 'Delete' && closable && !off) {
                      e.preventDefault();
                      close(item.id);
                    }
                  };
                  return (
                    // The close button cannot sit inside the tab (a tab's content is presentational), so the
                    // tab and the button share a presentational wrapper that draws the tab.
                    <div
                      role="presentation"
                      className="bland-file-tabs__item bland-focus-ring"
                      data-selected={selected || undefined}
                      data-disabled={off || undefined}
                      data-minimized={minimized || undefined}
                    >
                      <div
                        {...tabProps}
                        ref={ref}
                        onKeyDown={onKeyDown}
                        className="bland-file-tabs__tab"
                        aria-label={minimized ? (item.textValue ?? String(item.label)) : undefined}
                        aria-keyshortcuts={closable && !off ? 'Delete' : undefined}
                      >
                        {item.leading && <span className="bland-file-tabs__leading">{item.leading}</span>}
                        {!minimized && <span className="bland-file-tabs__label">{item.label}</span>}
                        {closable && <span className="bland-file-tabs__close-space" />}
                      </div>
                      {closable && (
                        // Pointer only: keyboard and screen reader users close with Delete (aria-keyshortcuts),
                        // so the button is not a Tab stop and stays out of the accessibility tree.
                        <button
                          type="button"
                          className="bland-file-tabs__close bland-smooth"
                          tabIndex={-1}
                          aria-hidden="true"
                          disabled={off}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => close(item.id)}
                        >
                          <Icon>
                            <XIcon />
                          </Icon>
                        </button>
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
