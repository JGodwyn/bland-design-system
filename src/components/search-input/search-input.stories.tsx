import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { SearchInput, type SearchInputSize } from './SearchInput';

const sizes: SearchInputSize[] = ['sm', 'md', 'lg'];
const column = { display: 'grid', gap: 16, width: '100%', maxWidth: 288 } as const;

/** A controlled search that echoes its value and counts clears, so tests/search-input.spec.ts can check them. */
function Controlled() {
  const [value, setValue] = useState('Bland');
  const [clears, setClears] = useState(0);
  return (
    <div style={column}>
      <SearchInput
        clearable
        aria-label="Controlled search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setClears((c) => c + 1)}
        data-testid="controlled"
      />
      <output className="pg-label" data-testid="controlled-value">
        {value || '(empty)'} · {clears} cleared
      </output>
    </div>
  );
}

export default {
  title: 'Search Input',
  description:
    'Search field with a search icon and an optional clear button, which shows while the field has a value. Escape clears it from the keyboard. Sizes are 32, 40 and 48 tall. It is named "Search" for screen readers unless given its own label. Keyboard focus shows a 2px ring offset 2px from the field.',
  components: ['SearchInput'],
  demo: {
    component: 'SearchInput',
    args: { placeholder: 'Search here', size: 'sm', clearable: true, disabled: false, defaultValue: '' },
    controls: { placeholder: { kind: 'text' }, defaultValue: { kind: 'text' }, disabled: { kind: 'boolean' }, clearLabel: false },
    // The key remounts the field when defaultValue changes in the controls.
    render: (args) => (
      <div style={column}>
        <SearchInput key={String(args.defaultValue)} {...(args as object)} />
      </div>
    ),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label">size={size}: empty, filled with clear, disabled</span>
          <div style={column}>
            <SearchInput size={size} placeholder="Search here" />
            <SearchInput size={size} placeholder="Search here" defaultValue="Design tokens" clearable />
            <SearchInput size={size} placeholder="Search here" defaultValue="Design tokens" clearable disabled />
          </div>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows while the input has focus; forced on here to show it</span>
        <div className="pg-focus" style={column}>
          <SearchInput placeholder="Search here" defaultValue="Design tokens" clearable />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Behaviour (used by the tests)</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div style={column}>
            <SearchInput placeholder="Search here" clearable data-testid="uncontrolled" />
          </div>
          {/* Sized by its content, like the docs demo: the width must not change as you type. */}
          <div style={{ display: 'inline-block' }}>
            <SearchInput placeholder="Search here" clearable aria-label="Shrink to fit" data-testid="shrink-to-fit" />
          </div>
          <Controlled />
        </div>
      </div>
    </>
  ),
} satisfies Story;
