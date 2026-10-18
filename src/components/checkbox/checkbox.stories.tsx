import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { Checkbox, type CheckboxChecked, type CheckboxSize } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

const sizes: CheckboxSize[] = ['sm', 'md'];
const states: CheckboxChecked[] = [false, true, 'mixed'];
const toppings = ['Cheese', 'Olives', 'Basil'];

/** A parent checkbox that is mixed while some children are checked, so tests/checkbox.spec.ts can check it. */
function SelectAll() {
  const [picked, setPicked] = useState<string[]>(['Cheese']);
  const all = picked.length === toppings.length ? true : picked.length ? 'mixed' : false;
  return (
    <div className="pg-stack">
      <Checkbox checked={all} onCheckedChange={() => setPicked(all === true ? [] : toppings)} data-testid="all">
        All toppings
      </Checkbox>
      <CheckboxGroup aria-label="Toppings" style={{ paddingInlineStart: 24 }}>
        {toppings.map((t) => (
          <Checkbox
            key={t}
            checked={picked.includes(t)}
            onCheckedChange={(on) => setPicked((p) => (on ? [...p, t] : p.filter((x) => x !== t)))}
            data-testid={`topping-${t}`}
          >
            {t}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
}

export default {
  title: 'Checkbox',
  description:
    'Lets people select any number of options from a set. Checked is false, true, or mixed for a parent whose children are partly selected. Small is a 16px box in a 24px hit area with a body-md label. Medium is a 20px box in a 32px hit area with a body-lg label. Keyboard focus shows a 2px ring offset 2px from the box. Use Checkbox Group for lists of options: in vertical lists the hit areas touch, so rows have no extra gap.',
  components: ['Checkbox', 'CheckboxGroup'],
  demo: {
    component: 'Checkbox',
    args: { children: 'Label', size: 'sm', defaultChecked: false, disabled: false },
    controls: {
      children: { kind: 'text' },
      defaultChecked: { kind: 'select', options: [false, true, 'mixed'] },
      disabled: { kind: 'boolean' },
      checked: false,
    },
    // The key remounts the checkbox when defaultChecked changes in the controls.
    render: (args) => <Checkbox key={String(args.defaultChecked)} {...(args as object)} />,
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label">size={size}: false, true, mixed; then disabled; then without a label</span>
          <div className="pg-row">
            {states.map((c) => (
              <Checkbox key={String(c)} size={size} checked={c} readOnly>
                {String(c)}
              </Checkbox>
            ))}
            {states.map((c) => (
              <Checkbox key={String(c)} size={size} checked={c} readOnly disabled>
                Disabled
              </Checkbox>
            ))}
            {states.map((c) => (
              <Checkbox key={String(c)} size={size} checked={c} readOnly aria-label={`No label ${String(c)}`} />
            ))}
          </div>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-row pg-focus">
          <Checkbox>Focused</Checkbox>
          <Checkbox size="md" defaultChecked>
            Focused
          </Checkbox>
          <Checkbox defaultChecked="mixed" aria-label="Focused mixed" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Checkbox Group: vertical sm and md (rows touch), horizontal sm and md (16 apart)</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {sizes.map((size) => (
            <CheckboxGroup key={size} size={size} aria-label={`Vertical ${size}`}>
              {['One', 'Two', 'Three'].map((l, i) => (
                <Checkbox key={l} defaultChecked={i === 0}>
                  {l}
                </Checkbox>
              ))}
            </CheckboxGroup>
          ))}
        </div>
        {sizes.map((size) => (
          <CheckboxGroup key={size} size={size} orientation="horizontal" aria-label={`Horizontal ${size}`}>
            {['One', 'Two', 'Three', 'Four'].map((l, i) => (
              <Checkbox key={l} defaultChecked={i === 1}>
                {l}
              </Checkbox>
            ))}
          </CheckboxGroup>
        ))}
        <CheckboxGroup disabled aria-label="Disabled group">
          <Checkbox defaultChecked>A disabled group disables every checkbox</Checkbox>
          <Checkbox>Second</Checkbox>
        </CheckboxGroup>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Behaviour (used by the tests): uncontrolled, and a parent that is mixed</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <Checkbox data-testid="uncontrolled">Uncontrolled</Checkbox>
          <Checkbox defaultChecked="mixed" data-testid="default-mixed">
            Starts mixed
          </Checkbox>
          <Checkbox disabled data-testid="disabled">
            Disabled
          </Checkbox>
          <SelectAll />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long label wraps beside the box</span>
        <div style={{ maxWidth: 240 }}>
          <Checkbox size="md">Send me the weekly digest with every new design system update</Checkbox>
        </div>
      </div>
    </>
  ),
} satisfies Story;
