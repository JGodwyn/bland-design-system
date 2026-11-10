import { useEffect, useLayoutEffect, useRef, type HTMLAttributes, type Key, type ReactNode, type Ref, type RefObject } from 'react';
import { mergeRefs, useTab, useTabList, useTabPanel } from 'react-aria';
import { Item, useTabListState, type Node, type TabListState } from 'react-stately';
import { ScrollArea } from '../scroll-area/ScrollArea';
import './tabs.css';

/**
 * The shared tab behaviour behind Section tab, Pill tab, File tab and Segmented bar (with panels): React Aria's
 * tab list (arrow keys, Home/End, roving focus, `role="tablist"` / `"tab"` / `"tabpanel"`), with every element
 * rendered and styled by the component. Not exported from the package.
 */

/** One tab. Each component adds its own fields (an icon, a count, a close button). */
export interface TabItemBase {
  /** Unique key: what `value` and `onValueChange` report. */
  id: string;
  /** The tab's text. */
  label: ReactNode;
  /** The text screen readers and typeahead use. Needed when `label` is not a string. */
  textValue?: string;
  /** Shown, skipped by the arrow keys, cannot be selected. */
  disabled?: boolean;
  /**
   * The content shown under the tabs while this tab is selected, in a `role="tabpanel"` the tab points at.
   * Leave it out when the tabs drive content you render elsewhere.
   */
  panel?: ReactNode;
}

/** Selection and naming props every tab row shares. */
export interface TabsSelectionProps {
  /** The selected tab's `id`, controlled. Pair it with `onValueChange`. */
  value?: string;
  /** The tab selected at first, uncontrolled. Defaults to the first tab that is not disabled. */
  defaultValue?: string;
  /** Called with the newly selected tab's `id`. */
  onValueChange?: (id: string) => void;
  /**
   * How the keyboard selects: `automatic` (default) selects the tab an arrow key moves to; `manual` moves focus
   * only, and Enter or Space selects. Use manual when showing a panel is slow.
   */
  keyboardActivation?: 'automatic' | 'manual';
}

const renderTab = (item: TabItemBase) => (
  <Item key={item.id} textValue={item.textValue ?? (typeof item.label === 'string' ? item.label : item.id)}>
    {item.label}
  </Item>
);

interface UseTabsOptions<T extends TabItemBase> extends TabsSelectionProps {
  items: T[];
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** State and tablist props for a row of tabs built from `items`. */
export function useTabs<T extends TabItemBase>({
  items,
  value,
  defaultValue,
  onValueChange,
  keyboardActivation = 'automatic',
  disabled,
  ...aria
}: UseTabsOptions<T>) {
  const state = useTabListState<T>({
    items,
    children: renderTab,
    selectedKey: value,
    defaultSelectedKey: defaultValue,
    onSelectionChange: onValueChange ? (key) => onValueChange(String(key)) : undefined,
    disabledKeys: items.filter((i) => i.disabled).map((i) => i.id),
    isDisabled: disabled,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const { tabListProps } = useTabList({ ...aria, keyboardActivation, isDisabled: disabled }, state, listRef);
  const nodes = [...state.collection] as Node<T>[];
  return { state, listRef, tabListProps, nodes };
}

/** What a component's tab renderer receives. */
export interface TabRenderProps<T extends TabItemBase> {
  item: T;
  /** Spread on the tab element: role, id, tabIndex, aria-selected, aria-controls and the press handlers. */
  tabProps: HTMLAttributes<HTMLElement>;
  ref: Ref<HTMLDivElement>;
  selected: boolean;
  disabled: boolean;
}

interface TabProps<T extends TabItemBase> {
  node: Node<T>;
  state: TabListState<T>;
  render: (props: TabRenderProps<T>) => ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/** One tab: React Aria's props for it, drawn by the component's `render`. */
export function Tab<T extends TabItemBase>({ node, state, render, ref }: TabProps<T>) {
  const own = useRef<HTMLDivElement>(null);
  const item = node.value!;
  const { tabProps, isSelected, isDisabled } = useTab({ key: node.key }, state, own);
  // A tab without a panel points at nothing, so it drops React Aria's aria-controls.
  const props = item.panel === undefined ? { ...tabProps, 'aria-controls': undefined } : tabProps;
  return render({ item, tabProps: props, ref: mergeRefs(own, ref), selected: isSelected, disabled: isDisabled });
}

interface TabPanelProps<T extends TabItemBase> extends HTMLAttributes<HTMLDivElement> {
  state: TabListState<T>;
}

/**
 * The selected tab's `panel`, in a `role="tabpanel"` labelled by its tab. Renders nothing when that tab has no
 * panel. It is a Tab stop only while it holds nothing focusable (React Aria), and shows the focus ring then.
 */
export function TabPanel<T extends TabItemBase>(props: TabPanelProps<T>) {
  const selected = props.state.selectedItem?.value;
  if (!selected || selected.panel === undefined) return null;
  // One panel per tab: React Aria's panel keeps the id it first got, so a new tab needs a new panel.
  return <SelectedPanel key={selected.id} {...props} />;
}

function SelectedPanel<T extends TabItemBase>({ state, className, ...rest }: TabPanelProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const { tabPanelProps } = useTabPanel({}, state, ref);
  return (
    <div
      {...rest}
      {...tabPanelProps}
      ref={ref}
      className={`bland-tab-panel bland-focus-ring${className ? ` ${className}` : ''}`}
    >
      {state.selectedItem?.value?.panel}
    </div>
  );
}

/**
 * A tab row that scrolls sideways when it overflows: the fade alone shows there is more (no thumb, Godwin
 * 2026-10-19), so a vertical mouse wheel scrolls it sideways too. Arrow keys move focus, which scrolls the
 * focused tab clear of the fade.
 */
export function TabScroll({ listRef, children }: { listRef: RefObject<HTMLElement | null>; children: ReactNode }) {
  useEffect(() => {
    const viewport = listRef.current?.closest<HTMLElement>('.bland-scroll-area__viewport');
    if (!viewport) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const next = Math.min(max, Math.max(0, viewport.scrollLeft + delta));
      // At either end (or with nothing hidden) the wheel scrolls the page as usual.
      if (max <= 1 || Math.abs(next - viewport.scrollLeft) < 1) return;
      e.preventDefault();
      viewport.scrollLeft = next;
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [listRef]);
  return (
    <ScrollArea axis="x" fadeSize="sm" scrollbar={false} className="bland-tabs__scroll">
      {children}
    </ScrollArea>
  );
}

/**
 * Places a row's selection indicator (an underline, a segment, a pill fill) over the element marked
 * `data-selected` inside `listRef`, which must be positioned. It slides there when the selection changes from a
 * pointer (`data-moving` turns its transition on); arrow keys, the first render and resizes move it at once,
 * since motion on keyboard navigation reads as lag (docs/motion.md). Spread the returned ref on the indicator.
 */
export function useSelectionIndicator(listRef: RefObject<HTMLElement | null>, selectedKey: Key | null | undefined) {
  const ref = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  // How the last selection was made: a pointer press slides, a key (arrows, Home, End, Space) jumps.
  const byPointer = useRef(false);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const pointer = () => (byPointer.current = true);
    const key = () => (byPointer.current = false);
    list.addEventListener('pointerdown', pointer, true);
    list.addEventListener('keydown', key, true);
    return () => {
      list.removeEventListener('pointerdown', pointer, true);
      list.removeEventListener('keydown', key, true);
    };
  }, [listRef]);
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = ref.current;
    if (!list || !indicator) return;
    const place = (animate: boolean) => {
      const el = list.querySelector<HTMLElement>('[data-selected]');
      indicator.hidden = !el;
      if (!el) return;
      indicator.toggleAttribute('data-moving', animate);
      // Dropping the transition should cancel a slide already running (CSS Transitions); WebKit lets it finish,
      // so a key right after a click would glide on to the old tab and snap back.
      if (!animate) for (const a of indicator.getAnimations()) a.cancel();
      // Rects keep fractions (offsetLeft rounds); divide by how much larger the list draws than its own layout
      // width, since the indicator's own lengths are drawn at that size again. That covers CSS zoom (the docs'
      // zoom control) and any scale transform on an ancestor (a tab row inside a card that is scaled, 2026-11-08:
      // measured while small, the indicator sat off its tab once the card grew). currentCSSZoom where the list
      // has no width yet.
      const box = el.getBoundingClientRect();
      const origin = list.getBoundingClientRect();
      const zoom =
        list.offsetWidth > 0
          ? origin.width / list.offsetWidth
          : ((list as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom ?? 1);
      // A turned ancestor (the landing page tilts a tab row, 2026-11-08) makes every rect the turned shape's upright
      // bounding box, so the rects no longer say where the tab is: then layout offsets, which no transform touches
      // (whole pixels; the tab is inside the list, its offset parent, as the indicator is).
      const turned =
        Math.abs(box.width / zoom - el.offsetWidth) > 1 || Math.abs(box.height / zoom - el.offsetHeight) > 1;
      if (turned && el.offsetParent === list) {
        indicator.style.setProperty('--_ind-x', `${el.offsetLeft}px`);
        indicator.style.setProperty('--_ind-y', `${el.offsetTop}px`);
        indicator.style.setProperty('--_ind-w', `${el.offsetWidth}px`);
        indicator.style.setProperty('--_ind-h', `${el.offsetHeight}px`);
        return;
      }
      indicator.style.setProperty('--_ind-x', `${(box.left - origin.left) / zoom - list.clientLeft}px`);
      indicator.style.setProperty('--_ind-y', `${(box.top - origin.top) / zoom - list.clientTop}px`);
      indicator.style.setProperty('--_ind-w', `${box.width / zoom}px`);
      indicator.style.setProperty('--_ind-h', `${box.height / zoom}px`);
    };
    place(placed.current && byPointer.current);
    placed.current = true;
    // A ResizeObserver reports once as it starts; skip that, or it would cut the slide short.
    let started = false;
    const ro = new ResizeObserver(() => {
      if (started) place(false);
      started = true;
    });
    // The list, and each tab: a tab grows when its font loads or its label changes, inside a list of the same width.
    ro.observe(list);
    // Never the indicator itself: its own sliding width would stop the slide.
    for (const child of list.children) if (child !== indicator) ro.observe(child);
    return () => ro.disconnect();
  }, [listRef, selectedKey]);
  return ref;
}
