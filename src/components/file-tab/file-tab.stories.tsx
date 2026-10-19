import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { FileTabs, type FileTabItem, type FileTabsSize } from './FileTabs';

const sizes: FileTabsSize[] = ['sm', 'md', 'lg'];
// A stand-in file icon for the story (Bland ships no icon pack; projects bring their own).
const FileIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 4H8a1 1 0 0 0-1 1v22a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V10l-6-6Z" />
    <path d="M19 4v6h6" />
  </svg>
);
const files = ['index.tsx', 'Button.tsx', 'button.css', 'tokens.css', 'README.md', 'package.json', 'vite.config.ts', 'CLAUDE.md'];
const tabs = (n: number, extra: Partial<FileTabItem> = {}): FileTabItem[] =>
  files.slice(0, n).map((label) => ({ id: label, label, ...extra }));
const noop = () => {};

/** Closable tabs that really close, for tests/file-tab.spec.ts. */
function Closable() {
  const [items, setItems] = useState(() =>
    tabs(4).map((t) => ({ ...t, panel: <p className="pg-label">{t.label} contents</p> })),
  );
  const [value, setValue] = useState('index.tsx');
  return (
    <div className="pg-stack">
      <FileTabs
        aria-label="Open files"
        data-testid="closable"
        items={items}
        value={value}
        onValueChange={setValue}
        onClose={(id) => setItems((all) => all.filter((t) => t.id !== id))}
      />
      <output className="pg-label" data-testid="closable-value">
        {value} of {items.length}
      </output>
    </div>
  );
}

export default {
  title: 'File tab',
  description:
    'Editor or browser style tabs. Tabs sets the number of tabs (1 to 8); the first is selected. Tabs are separated by a 1px border-subtle gap. The selected tab uses surface-100 so it joins the content below the row; unselected tabs are surface-300 like the bar, hover surface-400. The slot holds leading content such as a file-type icon. Minimized is a square tab that shows only the slot. Close: a pointer button on the tab, or Delete on a focused tab. The row scrolls sideways when the tabs do not fit, with the fade alone. In code: role="tab" with aria-selected.',
  components: ['FileTabs'],
  demo: {
    component: 'FileTabs',
    args: { tabs: '3', size: 'sm', slot: true, close: true, disabled: false },
    controls: {
      tabs: { kind: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
      slot: { kind: 'boolean' },
      close: { kind: 'boolean' },
      items: false,
      value: false,
      defaultValue: false,
    },
    render: ({ tabs: n, slot, close, ...args }) => (
      <FileTabs
        {...(args as object)}
        aria-label="Demo"
        items={tabs(Number(n), { leading: slot ? <FileIcon /> : undefined })}
        onClose={close ? noop : undefined}
      />
    ),
    code: ({ tabs: n, slot, close, ...args }) => ({
      ...args,
      'aria-label': 'Open files',
      items: tabs(Number(n)).map((t) => ({ ...t, ...(slot ? { leading: '<FileIcon />' } : {}) })),
    }),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label">size={size}: minimized, selected, rest, no close, disabled, minimized disabled</span>
          <FileTabs
            aria-label={`Files ${size}`}
            size={size}
            onClose={noop}
            defaultValue="index.tsx"
            items={[
              { id: 'pinned', label: 'Pinned', leading: <FileIcon />, minimized: true },
              { id: 'index.tsx', label: 'index.tsx', leading: <FileIcon /> },
              { id: 'button', label: 'Button.tsx', leading: <FileIcon /> },
              { id: 'readme', label: 'README.md', closable: false },
              { id: 'locked', label: 'locked.ts', disabled: true },
              { id: 'pinned-off', label: 'Pinned locked', leading: <FileIcon />, minimized: true, disabled: true },
            ]}
          />
        </div>
      ))}
      <div className="pg-stack">
        <span className="pg-label">The whole row disabled: the selected tab stays surface-100</span>
        <FileTabs aria-label="Disabled row" disabled onClose={noop} items={tabs(3)} />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Overflow: eight tabs in 400px scroll sideways; the fade shows there is more (no scrollbar)</span>
        <div style={{ maxWidth: 400 }}>
          <FileTabs aria-label="Overflowing" items={tabs(8, { leading: <FileIcon /> })} />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Closing (used by the behaviour tests): the selected tab's neighbour takes over</span>
        <Closable />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <FileTabs aria-label="Focused" onClose={noop} items={tabs(2)} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
