import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { TextArea, type TextAreaStatus } from './TextArea';

const statuses: TextAreaStatus[] = ['default', 'danger', 'success', 'warning'];
const helper: Record<TextAreaStatus, string> = {
  default: 'Helper text',
  danger: 'Tell us a little more',
  success: 'Looks good',
  warning: 'Close to the limit',
};
const column = { display: 'grid', gap: 16, width: '100%', maxWidth: 288 } as const;
const long =
  'Bland is a design system for client projects. Every value comes from a token, every component reads only tokens, and a new brand color is twelve steps away. This note is long enough to scroll, so the field shows its fade and its scrollbar.';

/** A controlled text area that counts characters, so tests/text-area.spec.ts can check it. */
function Controlled() {
  const [value, setValue] = useState('');
  return (
    <div style={column}>
      <TextArea label="Controlled" value={value} onChange={(e) => setValue(e.target.value)} helperText={`${value.length} characters`} data-testid="controlled" />
    </div>
  );
}

export default {
  title: 'Text Area',
  description:
    'A field for text that runs over several lines, such as a comment or a description.',
  usage: [
    'Give it a `label`, and put help or an error in `helperText`.',
    'When the text is invalid, set `status="danger"` and say why in `helperText`.',
    '`rows` sets the starting height (4 lines). People can drag it taller unless `resizable={false}`.',
    'For a single line, use TextInput.',
  ],
  components: ['TextArea'],
  demo: {
    component: 'TextArea',
    args: { label: 'Label', placeholder: 'Placeholder', helperText: 'Helper text', status: 'default', rows: 4, resizable: true, disabled: false },
    controls: {
      label: { kind: 'text' },
      placeholder: { kind: 'text' },
      helperText: { kind: 'text' },
      disabled: { kind: 'boolean' },
    },
    render: (args) => (
      <div style={column}>
        <TextArea {...(args as object)} />
      </div>
    ),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Empty with a <code>placeholder</code>, filled, overflowing, <code>disabled</code></span>
        <div style={column}>
          <TextArea label="Label" placeholder="Placeholder" helperText="Helper text" />
          <TextArea label="Label" defaultValue="User input" helperText="Helper text" />
          <TextArea label="Overflow" defaultValue={long} helperText="Scrolls inside the field" rows={3} />
          <TextArea label="Disabled" defaultValue="User input" helperText="Helper text" disabled />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>status</code>: <code>default</code>, <code>danger</code>, <code>success</code>, <code>warning</code>; then each <code>disabled</code></span>
        <div style={column}>
          {statuses.map((status) => (
            <TextArea key={status} status={status} label={status} defaultValue="User input" helperText={helper[status]} rows={2} />
          ))}
          {statuses.map((status) => (
            <TextArea key={status} status={status} label={`${status} disabled`} defaultValue="User input" helperText={helper[status]} rows={2} disabled />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring goes around the field (turned on here to show it)</span>
        <div className="pg-focus" style={column}>
          <TextArea label="Focused" placeholder="Placeholder" rows={2} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>resizable={false}</code>, no visible label (<code>aria-label</code>), <code>rows={1}</code></span>
        <div style={column}>
          <TextArea label="Not resizable" defaultValue="User input" resizable={false} rows={2} />
          <TextArea aria-label="No visible label" placeholder="No label: aria-label instead" rows={1} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div style={column}>
            <TextArea label="Uncontrolled" placeholder="Type here" helperText="Read with the field" data-testid="uncontrolled" rows={2} />
            <TextArea label="Invalid" status="danger" helperText="Required" data-testid="invalid" rows={2} />
          </div>
          <Controlled />
        </div>
      </div>
    </>
  ),
} satisfies Story;
