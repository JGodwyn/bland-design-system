import { useState, type CSSProperties } from 'react';
import type { Story } from '../../../playground/story';
import { MagnifyingGlassIcon, UserIcon } from '../../icons';
import { Dropdown, type DropdownItem, type DropdownSize, type DropdownStatus, type DropdownType } from './Dropdown';

const sizes: DropdownSize[] = ['sm', 'md', 'lg'];
const statuses: DropdownStatus[] = ['default', 'danger', 'success', 'warning'];
const types: DropdownType[] = ['basic', 'filterable', 'multi-select'];
const helper: Record<DropdownStatus, string> = {
  default: 'Helper text',
  danger: 'Pick a country',
  success: 'Ships in two days',
  warning: 'Delivery may be late',
};
const column: CSSProperties = { display: 'grid', gap: 16, width: '100%', maxWidth: 288 };
const stage: CSSProperties = { display: 'grid', placeItems: 'start', minHeight: 320, minWidth: 280 };

const fruits: DropdownItem[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry' },
  { id: 'durian', label: 'Durian', disabled: true },
  { id: 'elderberry', label: 'Elderberry' },
  { id: 'fig', label: 'Fig' },
  { id: 'grape', label: 'Grape' },
];

const countries: DropdownItem[] = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'Denmark', 'Egypt', 'France', 'Germany', 'Ghana', 'India',
  'Japan', 'Kenya', 'Mexico', 'Nigeria', 'Norway', 'Peru', 'Portugal', 'Spain', 'Sweden',
].map((name) => ({ id: name.toLowerCase(), label: name }));

// Option names match the icon exports, so the docs code snippet reads like real usage.
const icons = { none: undefined, UserIcon: <UserIcon />, MagnifyingGlassIcon: <MagnifyingGlassIcon /> } as const;

/** Controlled dropdowns that echo their value, so tests/dropdown.spec.ts can check them. */
function Controlled() {
  const [single, setSingle] = useState<string | null>('banana');
  const [many, setMany] = useState<string[]>(['apple', 'cherry']);
  const [country, setCountry] = useState<string | null>(null);
  return (
    <div style={column}>
      <Dropdown label="Basic" items={fruits} value={single} onValueChange={setSingle} data-testid="basic" />
      <output className="pg-label" data-testid="basic-value">
        {single ?? 'none'}
      </output>
      <Dropdown type="multi-select" label="Multi-select" items={fruits} value={many} onValueChange={setMany} data-testid="multi" />
      <output className="pg-label" data-testid="multi-value">
        {many.join(', ') || 'none'}
      </output>
      <Dropdown type="filterable" label="Country" items={countries} value={country} onValueChange={setCountry} data-testid="filterable" />
      <output className="pg-label" data-testid="filterable-value">
        {country ?? 'none'}
      </output>
    </div>
  );
}

export default {
  title: 'Dropdown',
  description:
    'A field that opens a list of options to choose from. Use it when there are too many options for radios or a segmented bar.',
  usage: [
    '`type`: `basic` picks one option, `filterable` lets people type to narrow a long list, `multi-select` picks several and shows them as chips.',
    'Give it a `label`, and put help or an error in `helperText` with `status`.',
    'Keep options short and in a predictable order, such as alphabetical.',
    'For a list of actions rather than values, use Menu.',
  ],
  components: ['Dropdown'],
  demo: {
    component: 'Dropdown',
    args: {
      type: 'basic',
      label: 'Label',
      helperText: 'Helper text',
      placeholder: '',
      size: 'sm',
      status: 'default',
      menuSize: 'md',
      disabled: false,
      icon: 'none',
      leading: '',
    },
    controls: {
      type: { kind: 'select', options: types },
      label: { kind: 'text' },
      helperText: { kind: 'text' },
      placeholder: { kind: 'text' },
      leading: { kind: 'text' },
      disabled: { kind: 'boolean' },
      icon: { kind: 'select', options: Object.keys(icons) },
      items: false,
      value: false,
      defaultValue: false,
      inputValue: false,
      defaultInputValue: false,
      clearLabel: false,
      name: false,
    },
    render: ({ icon, leading, placeholder, type, ...args }) => (
      <div style={stage}>
        <Dropdown
          {...(args as object)}
          key={String(type)}
          type={type as 'basic'}
          items={type === 'filterable' ? countries : fruits}
          icon={icons[icon as keyof typeof icons]}
          leading={leading || undefined}
          placeholder={placeholder || undefined}
        />
      </div>
    ),
    code: ({ icon, leading, placeholder, ...args }) => ({
      ...args,
      icon: icon === 'none' ? undefined : `<${icon} />`,
      leading: leading || undefined,
      placeholder: placeholder || undefined,
      items: '{items}',
    }),
  },
  render: () => (
    <>
      {types.map((type) => (
        <div key={type} className="pg-stack">
          <span className="pg-label"><code>type="{type}"</code> at each size: empty, filled, <code>disabled</code></span>
          <div className="pg-row" style={{ alignItems: 'flex-start' }}>
            {sizes.map((size) => (
              <div key={size} style={column}>
                <Dropdown type={type as 'basic'} size={size} label={`Label ${size}`} helperText="Helper text" items={fruits} />
                {type === 'multi-select' ? (
                  <>
                    <Dropdown type="multi-select" size={size} label="Filled" items={fruits} defaultValue={['apple', 'banana']} />
                    <Dropdown type="multi-select" size={size} label="Disabled" items={fruits} defaultValue={['apple']} disabled />
                  </>
                ) : (
                  <>
                    <Dropdown type={type as 'basic'} size={size} label="Filled" items={fruits} defaultValue="cherry" />
                    <Dropdown type={type as 'basic'} size={size} label="Disabled" items={fruits} defaultValue="cherry" helperText="Helper text" disabled />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label"><code>status</code>: <code>default</code>, <code>danger</code>, <code>success</code>, <code>warning</code>; then each <code>disabled</code></span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div style={column}>
            {statuses.map((status) => (
              <Dropdown key={status} status={status} label={status} items={fruits} defaultValue="apple" helperText={helper[status]} />
            ))}
          </div>
          <div style={column}>
            {statuses.map((status) => (
              <Dropdown key={status} status={status} label={`${status} disabled`} items={fruits} defaultValue="apple" helperText={helper[status]} disabled />
            ))}
          </div>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring goes around the field (turned on here to show it)</span>
        <div className="pg-focus" style={column}>
          <Dropdown label="Focused" items={fruits} />
          <Dropdown type="filterable" label="Focused filterable" items={fruits} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>icon</code>, <code>leading</code>, many chips (they wrap), a long value, no visible label</span>
        <div style={column}>
          <Dropdown label="Icon" icon={<UserIcon />} items={fruits} />
          <Dropdown label="Leading add-on" leading="Fruit" items={fruits} defaultValue="fig" />
          <Dropdown type="multi-select" label="Many chips" items={fruits} defaultValue={['apple', 'banana', 'cherry', 'elderberry', 'fig']} />
          <Dropdown label="Long value" items={[{ id: 'long', label: 'A value much longer than the field is wide' }]} defaultValue="long" />
          <Dropdown aria-label="No visible label" items={fruits} placeholder="No label: aria-label instead" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it</span>
        <Controlled />
      </div>
    </>
  ),
} satisfies Story;
