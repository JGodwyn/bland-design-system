import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { Toggle, type ToggleSize } from './Toggle';

const sizes: ToggleSize[] = ['sm', 'md'];
const states = [false, true];

/** A controlled toggle that reports its state, so tests/toggle.spec.ts can check onCheckedChange. */
function Controlled() {
  const [on, setOn] = useState(false);
  return (
    <Toggle checked={on} onCheckedChange={setOn} data-testid="controlled">
      Wi-Fi is {on ? 'on' : 'off'}
    </Toggle>
  );
}

export default {
  title: 'Toggle',
  description:
    'Turns a single setting on or off, and takes effect at once.',
  usage: [
    'Use it for settings that apply immediately. In a form people submit, use Checkbox.',
    'Name the setting, not the action: Notifications, not Turn on notifications.',
    'Without a visible label, give it an `aria-label`.',
  ],
  components: ['Toggle'],
  demo: {
    component: 'Toggle',
    args: { children: 'Label', size: 'sm', defaultChecked: true, disabled: false },
    controls: {
      children: { kind: 'text' },
      defaultChecked: { kind: 'boolean' },
      disabled: { kind: 'boolean' },
      checked: false,
    },
    // The key remounts the toggle when defaultChecked changes in the controls.
    render: (args) => <Toggle key={String(args.defaultChecked)} {...(args as object)} />,
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label"><code>size="{size}"</code>: off, on; then <code>disabled</code>; then without a label</span>
          <div className="pg-row">
            {states.map((c) => (
              <Toggle key={String(c)} size={size} checked={c} readOnly>
                {c ? 'On' : 'Off'}
              </Toggle>
            ))}
            {states.map((c) => (
              <Toggle key={String(c)} size={size} checked={c} readOnly disabled>
                Disabled
              </Toggle>
            ))}
            {states.map((c) => (
              <Toggle key={String(c)} size={size} checked={c} readOnly aria-label={`No label ${c ? 'on' : 'off'}`} />
            ))}
          </div>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-row pg-focus">
          <Toggle>Focused</Toggle>
          <Toggle size="md" defaultChecked>
            Focused
          </Toggle>
          <Toggle defaultChecked aria-label="Focused without a label" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: uncontrolled, controlled, <code>disabled</code></span>
        <div className="pg-row">
          <Toggle data-testid="uncontrolled">Uncontrolled</Toggle>
          <Controlled />
          <Toggle size="md" data-testid="uncontrolled-md">
            Medium
          </Toggle>
          <Toggle disabled data-testid="disabled">
            Disabled
          </Toggle>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long label wraps beside the track</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {sizes.map((size) => (
            <div key={size} style={{ maxWidth: 240 }}>
              <Toggle size={size} defaultChecked>
                Notify me when someone mentions me in a comment
              </Toggle>
            </div>
          ))}
        </div>
      </div>
    </>
  ),
} satisfies Story;
