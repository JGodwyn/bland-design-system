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
    'Tabs for open files or documents, as in a code editor or a browser. People switch between them and can close them.',
  usage: [
    'Pass `onClose` to let people close tabs, with the close button or Delete. The closed tab\'s neighbour is selected. Set `closable: false` on a tab that must stay.',
    'Put a file-type icon in each item\'s `leading`. A `minimized` tab shows only that.',
    'Name the row with `aria-label`. Tabs that don\'t fit scroll sideways.',
  ],
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
          <span className="pg-label"><code>size="{size}"</code>: <code>minimized</code>, selected, rest, not <code>closable</code>, <code>disabled</code></span>
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
        <span className="pg-label">The whole row <code>disabled</code></span>
        <FileTabs aria-label="Disabled row" disabled onClose={noop} items={tabs(3)} />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Tabs that don't fit scroll sideways; the fade shows there is more</span>
        <div style={{ maxWidth: 400 }}>
          <FileTabs aria-label="Overflowing" items={tabs(8, { leading: <FileIcon /> })} />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Try it: close the selected tab and its neighbour takes over</span>
        <Closable />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <FileTabs aria-label="Focused" onClose={noop} items={tabs(2)} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
