import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { MagnifyingGlassIcon, UserIcon, XIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { TextInput, type TextInputSize, type TextInputStatus } from './TextInput';

const sizes: TextInputSize[] = ['sm', 'md', 'lg'];
const statuses: TextInputStatus[] = ['default', 'danger', 'success', 'warning'];
const helper: Record<TextInputStatus, string> = {
  default: 'Helper text',
  danger: 'Enter a valid email address',
  success: 'This username is free',
  warning: 'Caps Lock is on',
};
const column = { display: 'grid', gap: 16, width: '100%', maxWidth: 288 } as const;

// Option names match the icon exports, so the docs code snippet reads like real usage.
const icons = { none: undefined, UserIcon: <UserIcon />, MagnifyingGlassIcon: <MagnifyingGlassIcon />, XIcon: <XIcon /> } as const;

/** A controlled field that echoes its value, so tests/text-input.spec.ts can check it. */
function Controlled() {
  const [value, setValue] = useState('Ada');
  return (
    <div style={column}>
      <TextInput label="Controlled" value={value} onChange={(e) => setValue(e.target.value)} data-testid="controlled" />
      <output className="pg-label" data-testid="controlled-value">
        {value}
      </output>
    </div>
  );
}

export default {
  title: 'Text Input',
  description:
    'Single-line text field with a label, the input and helper text. Status sets the border, the helper text color and a status icon: default, danger, success or warning. Danger marks the input invalid for screen readers; put the error in the helper text. Sizes are 32, 40 and 48 tall with body-lg text. Optional leading and trailing add-ons, start and end icons, and alt text such as a unit. Keyboard focus shows a 2px ring offset 2px from the field.',
  components: ['TextInput'],
  demo: {
    component: 'TextInput',
    args: {
      label: 'Label',
      placeholder: 'Placeholder',
      helperText: 'Helper text',
      size: 'sm',
      status: 'default',
      disabled: false,
      iconStart: 'none',
      iconEnd: 'none',
      altText: '',
      leading: '',
      trailing: '',
    },
    controls: {
      label: { kind: 'text' },
      placeholder: { kind: 'text' },
      helperText: { kind: 'text' },
      altText: { kind: 'text' },
      leading: { kind: 'text' },
      trailing: { kind: 'text' },
      disabled: { kind: 'boolean' },
      iconStart: { kind: 'select', options: Object.keys(icons) },
      iconEnd: { kind: 'select', options: Object.keys(icons) },
    },
    render: ({ iconStart, iconEnd, altText, leading, trailing, ...args }) => (
      <div style={column}>
        <TextInput
          {...(args as object)}
          iconStart={icons[iconStart as keyof typeof icons]}
          iconEnd={icons[iconEnd as keyof typeof icons]}
          altText={altText || undefined}
          leading={leading || undefined}
          trailing={trailing || undefined}
        />
      </div>
    ),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label">size={size}: empty (placeholder), filled, disabled</span>
          <div style={column}>
            <TextInput size={size} label="Label" placeholder="Placeholder" helperText="Helper text" />
            <TextInput size={size} label="Label" defaultValue="User input" helperText="Helper text" />
            <TextInput size={size} label="Label" defaultValue="User input" helperText="Helper text" disabled />
          </div>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">status: default, danger, success, warning; then each disabled</span>
        <div style={column}>
          {statuses.map((status) => (
            <TextInput key={status} status={status} label={status} defaultValue="User input" helperText={helper[status]} />
          ))}
          {statuses.map((status) => (
            <TextInput key={status} status={status} label={`${status} disabled`} defaultValue="User input" helperText={helper[status]} disabled />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows while the input has focus; forced on here to show it</span>
        <div className="pg-focus" style={column}>
          <TextInput label="Focused" placeholder="Placeholder" />
          <TextInput label="Focused danger" status="danger" defaultValue="User input" helperText={helper.danger} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Icons, alt text and add-ons (empty, filled, disabled) at each size</span>
        <div style={column}>
          <TextInput label="Icons" iconStart={<UserIcon />} iconEnd={<XIcon />} placeholder="Name" />
          <TextInput label="Alt text" altText="kg" defaultValue="72" inputMode="decimal" />
          {sizes.map((size) => (
            <TextInput key={size} size={size} label={`Add-ons ${size}`} leading="https://" trailing=".com" placeholder="example" />
          ))}
          <TextInput label="Filled add-ons" leading="https://" trailing=".com" defaultValue="bland" />
          <TextInput label="Disabled add-ons" leading="https://" trailing=".com" defaultValue="bland" disabled />
          <TextInput
            label="Icon add-on"
            leading={
              <Icon>
                <UserIcon />
              </Icon>
            }
            placeholder="Username"
          />
          <TextInput aria-label="No visible label" placeholder="No label: aria-label instead" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Behaviour (used by the tests)</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div style={column}>
            <TextInput label="Uncontrolled" placeholder="Type here" helperText="Read with the input" data-testid="uncontrolled" leading="@" />
            <TextInput label="Invalid" status="danger" helperText="Required" data-testid="invalid" />
          </div>
          <Controlled />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Long label, value and helper text</span>
        <div style={{ ...column, maxWidth: 240 }}>
          <TextInput
            label="A long label that wraps onto a second line"
            defaultValue="A value much longer than the field is wide"
            helperText="Helper text wraps under the field when it is longer than the field"
          />
        </div>
      </div>
    </>
  ),
} satisfies Story;
