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
    'A field that opens a menu of options to pick from. Type basic picks one option from a button, filterable types into the field to narrow the options, and multi-select picks several, shown as Chips in the field with a checkbox on each option. The field is built like Text Input: Size sets its height (32, 40, 48), Status colors the border, helper text and status icon, and disabled uses the disabled colors. The menu opens 4px under the field, as wide as it, with rows of Menu size md; the chosen option shows a Check. Arrow keys move through the options, Escape closes the menu.',
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
          <span className="pg-label">type={type} at each size: empty, filled, disabled</span>
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
        <span className="pg-label">status: default, danger, success, warning (filled); then each disabled</span>
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
        <span className="pg-label">Focused: the ring shows while the field has keyboard focus; forced on here to show it</span>
        <div className="pg-focus" style={column}>
          <Dropdown label="Focused" items={fruits} />
          <Dropdown type="filterable" label="Focused filterable" items={fruits} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Icon, leading add-on, many chips (they wrap), long value, no visible label</span>
        <div style={column}>
          <Dropdown label="Icon" icon={<UserIcon />} items={fruits} />
          <Dropdown label="Leading add-on" leading="Fruit" items={fruits} defaultValue="fig" />
          <Dropdown type="multi-select" label="Many chips" items={fruits} defaultValue={['apple', 'banana', 'cherry', 'elderberry', 'fig']} />
          <Dropdown label="Long value" items={[{ id: 'long', label: 'A value much longer than the field is wide' }]} defaultValue="long" />
          <Dropdown aria-label="No visible label" items={fruits} placeholder="No label: aria-label instead" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Behaviour (used by the tests; open menus are screenshotted by tests/dropdown.spec.ts)</span>
        <Controlled />
      </div>
    </>
  ),
} satisfies Story;
