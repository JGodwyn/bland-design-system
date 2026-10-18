import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { Radio, type RadioSize } from './Radio';
import { RadioGroup } from './RadioGroup';

const sizes: RadioSize[] = ['sm', 'md'];

/** A controlled group that reports its value, so tests/radio-button.spec.ts can check it. */
function Controlled() {
  const [plan, setPlan] = useState('free');
  return (
    <div className="pg-stack">
      <RadioGroup aria-label="Plan" value={plan} onValueChange={setPlan} data-testid="controlled">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
      <output className="pg-label" data-testid="controlled-value">
        {plan}
      </output>
    </div>
  );
}

export default {
  title: 'Radio Button',
  description:
    'Lets people select exactly one option from a set. Small is a 16px circle in a 24px hit area with a body-md label. Medium is a 20px circle in a 32px hit area with a body-lg label. Keyboard focus shows a 2px ring offset 2px from the circle. Use Radio Button Group for lists of options: in vertical lists the hit areas touch, so rows have no extra gap.',
  components: ['Radio', 'RadioGroup'],
  demo: {
    component: 'Radio',
    args: { children: 'Label', value: 'a', size: 'sm', defaultChecked: false, disabled: false },
    controls: {
      children: { kind: 'text' },
      defaultChecked: { kind: 'boolean' },
      disabled: { kind: 'boolean' },
      value: false,
      checked: false,
    },
    // The key remounts the radio when defaultChecked changes in the controls.
    render: (args) => <Radio key={String(args.defaultChecked)} {...(args as { value: string })} />,
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label">size={size}: false, true; then disabled; then without a label</span>
          <div className="pg-row">
            {[false, true].map((c) => (
              <Radio key={String(c)} value={String(c)} size={size} checked={c} readOnly>
                {String(c)}
              </Radio>
            ))}
            {[false, true].map((c) => (
              <Radio key={String(c)} value={String(c)} size={size} checked={c} readOnly disabled>
                Disabled
              </Radio>
            ))}
            {[false, true].map((c) => (
              <Radio key={String(c)} value={String(c)} size={size} checked={c} readOnly aria-label={`No label ${String(c)}`} />
            ))}
          </div>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-row pg-focus">
          <Radio value="a" name="focus-a">
            Focused
          </Radio>
          <Radio value="b" name="focus-b" size="md" defaultChecked>
            Focused
          </Radio>
          <Radio value="c" name="focus-c" aria-label="Focused without a label" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Radio Button Group: vertical sm and md (rows touch), horizontal sm and md (16 apart)</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {sizes.map((size) => (
            <RadioGroup key={size} size={size} defaultValue="one" aria-label={`Vertical ${size}`}>
              <Radio value="one">One</Radio>
              <Radio value="two">Two</Radio>
              <Radio value="three">Three</Radio>
            </RadioGroup>
          ))}
        </div>
        {sizes.map((size) => (
          <RadioGroup key={size} size={size} orientation="horizontal" defaultValue="two" aria-label={`Horizontal ${size}`}>
            <Radio value="one">One</Radio>
            <Radio value="two">Two</Radio>
            <Radio value="three">Three</Radio>
            <Radio value="four">Four</Radio>
          </RadioGroup>
        ))}
        <RadioGroup disabled defaultValue="a" aria-label="Disabled group">
          <Radio value="a">A disabled group disables every radio</Radio>
          <Radio value="b">Second</Radio>
        </RadioGroup>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Behaviour (used by the tests): uncontrolled and controlled groups</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <RadioGroup aria-label="Size" data-testid="uncontrolled">
            <Radio value="s">Small</Radio>
            <Radio value="m">Medium</Radio>
            <Radio value="l" disabled>
              Large
            </Radio>
          </RadioGroup>
          <Controlled />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long label wraps beside the circle</span>
        <div style={{ maxWidth: 240 }}>
          <RadioGroup size="md" aria-label="Long label">
            <Radio value="long">Deliver to the address on file, and email me when it ships</Radio>
          </RadioGroup>
        </div>
      </div>
    </>
  ),
} satisfies Story;
