import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { NumericInputField, type NumericInputFieldSize, type NumericInputFieldStatus } from './NumericInputField';

const sizes: NumericInputFieldSize[] = ['sm', 'md', 'lg'];
const statuses: NumericInputFieldStatus[] = ['default', 'danger', 'success', 'warning'];
const helper: Record<NumericInputFieldStatus, string> = {
  default: 'We sent a code to your phone',
  danger: 'That code is not right',
  success: 'Code accepted',
  warning: 'The code expires in 1 minute',
};

/** A controlled field that echoes its code and completions, so tests/numeric-input-field.spec.ts can check them. */
function Controlled() {
  const [code, setCode] = useState('');
  const [done, setDone] = useState('');
  return (
    <div className="pg-stack">
      <NumericInputField label="Controlled" value={code} onValueChange={setCode} onComplete={setDone} data-testid="controlled" />
      <output className="pg-label" data-testid="controlled-value">
        {code || '(empty)'} · complete: {done || 'no'}
      </output>
    </div>
  );
}

export default {
  title: 'Numeric Input Field',
  description:
    'A row of boxes for a one-time code or PIN, one digit per box.',
  usage: [
    '`length`: 4 or 6 digits. On mobile, use `size="sm"` for 6: the larger rows are wider than a phone screen\'s column.',
    '`onComplete` runs once every box is filled.',
    'Pasting a code, or the phone offering one from a text message, fills every box.',
    'Give it a `label`, or an `aria-label`.',
  ],
  components: ['NumericInputField'],
  demo: {
    component: 'NumericInputField',
    args: { label: 'Verification code', helperText: helper.default, size: 'sm', status: 'default', length: 4, disabled: false, defaultValue: '' },
    controls: {
      label: { kind: 'text' },
      helperText: { kind: 'text' },
      placeholder: { kind: 'text' },
      defaultValue: { kind: 'text' },
      disabled: { kind: 'boolean' },
      length: { kind: 'select', options: ['4', '6'] },
      name: false,
    },
    // The key remounts the field when the starting code or the length changes in the controls.
    render: ({ length, ...args }) => (
      <NumericInputField key={`${args.defaultValue}-${length}`} {...(args as object)} length={Number(length) === 6 ? 6 : 4} />
    ),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label"><code>size="{size}"</code>: empty with a <code>placeholder</code>, partly filled, filled, <code>disabled</code></span>
          <NumericInputField size={size} label="Code" placeholder="0" />
          <NumericInputField size={size} aria-label={`Partly filled ${size}`} defaultValue="27" />
          <NumericInputField size={size} aria-label={`Filled ${size}`} defaultValue="2741" />
          <NumericInputField size={size} aria-label={`Disabled ${size}`} defaultValue="27" placeholder="0" disabled />
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label"><code>length={6}</code> (<code>sm</code> fits a phone screen)</span>
        <NumericInputField length={6} label="Six digits" defaultValue="274" />
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>status</code>: <code>default</code>, <code>danger</code>, <code>success</code>, <code>warning</code>; then <code>disabled</code></span>
        {statuses.map((status) => (
          <NumericInputField key={status} status={status} label={status} defaultValue="2741" helperText={helper[status]} />
        ))}
        <NumericInputField status="danger" label="danger disabled" defaultValue="2741" helperText={helper.danger} disabled />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring goes around the focused box (turned on for every box here)</span>
        <div className="pg-focus">
          <NumericInputField aria-label="Focused" defaultValue="2" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <NumericInputField label="Uncontrolled" helperText="Check your messages" data-testid="uncontrolled" name="otp" />
          <Controlled />
        </div>
      </div>
    </>
  ),
} satisfies Story;
