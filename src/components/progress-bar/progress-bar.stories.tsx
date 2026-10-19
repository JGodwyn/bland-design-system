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
    'Linear progress bar. Status: default (in progress), success and danger (complete). Size sm has a 4px track, md 8px. Width comes from progress/width and never exceeds its container; set the width to fill a layout. The value sits in a fixed column so the track never changes length. Cancel shows a close button (24px hit area) on default. Value, Label and Helper text are optional. Figma draws quarters; code takes any value.',
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
          <span className="pg-label">size="{size}": 0, 25, 50, 75 and 100%</span>
          {values.map((value) => (
            <ProgressBar key={value} size={size} value={value} aria-label={`Progress ${value}`} />
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">status: success and danger, with their icon and helper color</span>
        {sizes.map((size) => (
          <div key={size} className="pg-row">
            <ProgressBar size={size} status="success" value={100} label="Upload" helperText="Upload complete" />
            <ProgressBar size={size} status="danger" value={100} label="Upload" helperText="Upload failed" />
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Label, helper text, no value, and any value between quarters</span>
        <div className="pg-row">
          <ProgressBar value={62} label="Installing updates" helperText="About 2 minutes left" />
          <ProgressBar value={62} showValue={false} label="No value" />
          <ProgressBar value={3} label="Just started" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">onCancel: a close button after the value</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <ProgressBar key={size} size={size} value={50} label="Uploading" onCancel={() => {}} />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused cancel button: the ring shows on keyboard focus; forced on here to show it</span>
        <div className="pg-row pg-focus">
          <ProgressBar value={50} label="Uploading" onCancel={() => {}} />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">The fill slides between values (used by the behaviour tests)</span>
        <Stepper />
      </div>
    </>
  ),
} satisfies Story;
