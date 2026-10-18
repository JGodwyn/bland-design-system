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
    'Row of square digit boxes for one-time codes and PINs, with a label and helper text. Shows 4 boxes, or 6. Typing fills a box and moves to the next, Backspace moves back, the arrow keys move between boxes, and pasting a code (or the keyboard offering one) fills every box. Status sets every box border and the helper text color. On mobile, use sm for 6 digits: md and lg rows are wider than a 312px column. Keyboard focus shows a 2px ring offset 2px from the box.',
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
          <span className="pg-label">size={size}: empty with a placeholder, partly filled, filled, disabled</span>
          <NumericInputField size={size} label="Code" placeholder="0" />
          <NumericInputField size={size} aria-label={`Partly filled ${size}`} defaultValue="27" />
          <NumericInputField size={size} aria-label={`Filled ${size}`} defaultValue="2741" />
          <NumericInputField size={size} aria-label={`Disabled ${size}`} defaultValue="27" placeholder="0" disabled />
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">6 digits (sm fits a mobile column)</span>
        <NumericInputField length={6} label="Six digits" defaultValue="274" />
      </div>

      <div className="pg-stack">
        <span className="pg-label">status: default, danger, success, warning; then disabled</span>
        {statuses.map((status) => (
          <NumericInputField key={status} status={status} label={status} defaultValue="2741" helperText={helper[status]} />
        ))}
        <NumericInputField status="danger" label="danger disabled" defaultValue="2741" helperText={helper.danger} disabled />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on the focused box; forced on every box here to show it</span>
        <div className="pg-focus">
          <NumericInputField aria-label="Focused" defaultValue="2" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Behaviour (used by the tests)</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <NumericInputField label="Uncontrolled" helperText="Check your messages" data-testid="uncontrolled" name="otp" />
          <Controlled />
        </div>
      </div>
    </>
  ),
} satisfies Story;
