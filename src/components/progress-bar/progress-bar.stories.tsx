import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import { ProgressBar, type ProgressBarSize } from './ProgressBar';

const sizes: ProgressBarSize[] = ['sm', 'md'];
const values = [0, 25, 50, 75, 100];

/** Steps the value by a quarter, so the fill's linear slide can be seen and tested. */
function Stepper() {
  const [value, setValue] = useState(25);
  return (
    <div className="pg-row" data-testid="stepper">
      <ProgressBar label="Uploading" value={value} />
      <Button size="sm" type="secondary" onClick={() => setValue((v) => (v >= 100 ? 0 : v + 25))}>
        Step
      </Button>
    </div>
  );
}

export default {
  title: 'Progress-bar',
  description:
    'Shows how far a task has come, such as an upload or an import.',
  usage: [
    'Pass `value` from 0 to 100, or set your own `min` and `max`.',
    'Set `status` to `success` or `danger` when the task ends.',
    'Give it a `label`, or an `aria-label`. Add `onCancel` when people can stop the task.',
    'For the steps of a flow, use ProgressWizard.',
  ],
  components: ['ProgressBar'],
  demo: {
    component: 'ProgressBar',
    args: { label: 'Uploading', value: 40, size: 'sm', status: 'default', showValue: true, helperText: '', cancel: false },
    controls: { label: { kind: 'text' }, helperText: { kind: 'text' }, cancel: { kind: 'boolean' }, onCancel: false },
    render: ({ cancel, helperText, ...args }) => (
      <ProgressBar
        {...(args as { label: string; value: number })}
        helperText={helperText || undefined}
        onCancel={cancel ? () => {} : undefined}
      />
    ),
    code: ({ cancel, helperText, ...args }) => ({
      ...args,
      ...(helperText ? { helperText } : {}),
      ...(cancel ? { onCancel: '{() => {}}' } : {}),
    }),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label"><code>size="{size}"</code>: 0, 25, 50, 75 and 100%</span>
          {values.map((value) => (
            <ProgressBar key={value} size={size} value={value} aria-label={`Progress ${value}`} />
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label"><code>status</code>: <code>success</code> and <code>danger</code></span>
        {sizes.map((size) => (
          <div key={size} className="pg-row">
            <ProgressBar size={size} status="success" value={100} label="Upload" helperText="Upload complete" />
            <ProgressBar size={size} status="danger" value={100} label="Upload" helperText="Upload failed" />
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>label</code>, <code>helperText</code>, <code>showValue={false}</code>, and any value</span>
        <div className="pg-row">
          <ProgressBar value={62} label="Installing updates" helperText="About 2 minutes left" />
          <ProgressBar value={62} showValue={false} label="No value" />
          <ProgressBar value={3} label="Just started" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>onCancel</code>: a cancel button after the value</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <ProgressBar key={size} size={size} value={50} label="Uploading" onCancel={() => {}} />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus on the cancel button (turned on here to show it)</span>
        <div className="pg-row pg-focus">
          <ProgressBar value={50} label="Uploading" onCancel={() => {}} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: the fill slides between values</span>
        <Stepper />
      </div>
    </>
  ),
} satisfies Story;
