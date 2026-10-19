import { useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import { Accordion, type AccordionSize } from './Accordion';

const sizes: AccordionSize[] = ['sm', 'md'];
const description = 'This is the description section of the Accordion. Write more details here.';

/** Figma's frame width, accordion/width; the item itself fills whatever holds it. */
function Frame({ children }: { children: ReactNode }) {
  return <div style={{ width: 'var(--accordion-width)' }}>{children}</div>;
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="pg-row" style={{ alignItems: 'flex-start' }}>
      {children}
    </div>
  );
}

/** Reports its state, so tests/accordion.spec.ts can check onOpenChange. */
function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <div className="pg-stack">
      <Frame>
        <Accordion title="Controlled" open={open} onOpenChange={setOpen} data-testid="controlled">
          {description}
        </Accordion>
      </Frame>
      <output className="pg-label" data-testid="controlled-state">
        {open ? 'open' : 'closed'}
      </output>
    </div>
  );
}

// Hover is a CSS state, so it shows on interaction, not here; tests/accordion.spec.ts covers it.
export default {
  title: 'Accordion',
  description:
    'Accordion item: a header button that shows or hides a content region. Flush removes the header fill and side padding so the item lines up with surrounding content; on hover its title underlines. Size sm has a 32px header, md a 40px header. States rest, hover and disabled. Expanded shows the description and an optional slot for custom content. Use Fill container for width in layouts.',
  components: ['Accordion'],
  demo: {
    component: 'Accordion',
    args: { title: 'Title of accordion', children: description, size: 'sm', flush: false, defaultOpen: true, disabled: false },
    controls: {
      title: { kind: 'text' },
      children: { kind: 'text' },
      defaultOpen: { kind: 'boolean' },
      disabled: { kind: 'boolean' },
      open: false,
      name: false,
    },
    // defaultOpen only counts on mount, so the key remounts the item when the control changes.
    render: ({ title, children, defaultOpen, ...args }) => (
      <Frame>
        <Accordion key={String(defaultOpen)} {...(args as object)} title={title} defaultOpen={defaultOpen}>
          {children}
        </Accordion>
      </Frame>
    ),
  },
  render: () => (
    <>
      {[false, true].map((flush) => (
        <div key={String(flush)} className="pg-stack">
          <span className="pg-label">
            {flush ? 'flush: no fill, no side padding' : 'Default'}: sm 32 and md 40 headers, closed then open
          </span>
          {sizes.map((size) => (
            <Row key={size}>
              <Frame>
                <Accordion title={`Closed, ${size}`} size={size} flush={flush} data-testid={`closed-${size}${flush ? '-flush' : ''}`}>
                  {description}
                </Accordion>
              </Frame>
              <Frame>
                <Accordion title={`Open, ${size}`} size={size} flush={flush} defaultOpen data-testid={`open-${size}${flush ? '-flush' : ''}`}>
                  {description}
                </Accordion>
              </Frame>
            </Row>
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Disabled: closed and open, default and flush</span>
        <Row>
          <Frame>
            <Accordion title="Disabled" disabled data-testid="disabled">
              {description}
            </Accordion>
          </Frame>
          <Frame>
            <Accordion title="Disabled, open" disabled defaultOpen>
              {description}
            </Accordion>
          </Frame>
          <Frame>
            <Accordion title="Disabled, flush" disabled flush defaultOpen>
              {description}
            </Accordion>
          </Frame>
        </Row>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <Row>
          <div className="pg-focus">
            <Frame>
              <Accordion title="Focused">{description}</Accordion>
            </Frame>
          </div>
          <div className="pg-focus">
            <Frame>
              <Accordion title="Focused, flush" flush>
                {description}
              </Accordion>
            </Frame>
          </div>
        </Row>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Slot: any content below the description</span>
        <Frame>
          <Accordion title="With a slot" size="md" defaultOpen>
            <p style={{ margin: 0 }}>{description}</p>
            <div className="pg-row">
              <Button size="sm">Confirm</Button>
              <Button size="sm" type="secondary">
                Cancel
              </Button>
            </div>
          </Accordion>
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A group with one name: opening one closes the others</span>
        <Frame>
          <div className="pg-stack" style={{ gap: 'var(--space-xs)' }}>
            {['First', 'Second', 'Third'].map((label, i) => (
              <Accordion key={label} name="faq" title={`${label} question`} defaultOpen={i === 0} data-testid={`group-${i}`}>
                {description}
              </Accordion>
            ))}
          </div>
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Controlled (used by the behaviour tests)</span>
        <Controlled />
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long title wraps; the caret stays on the first line</span>
        <Frame>
          <Accordion title="A title far too long to fit on one line of the header">{description}</Accordion>
        </Frame>
      </div>
    </>
  ),
} satisfies Story;
