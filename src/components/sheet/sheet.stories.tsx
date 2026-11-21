import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { ModalContent } from '../modal/Modal';
import { TextInput } from '../text-input/TextInput';
import { Sheet, type SheetProps, type SheetSide, type SheetSize } from './Sheet';

/**
 * The static sheet: its inside drawn in the page, without the top layer, the slide or behaviour, so every variant
 * can sit side by side in the docs and the screenshots. Side sheets are cut to 400 tall here; live they fill the screen.
 */
const staticBox: CSSProperties = {
  position: 'static',
  display: 'flex',
  flexDirection: 'column',
  translate: 'none',
  maxWidth: '100%',
};

type PanelProps = Omit<Parameters<typeof ModalContent>[0], 'titleAs' | 'before'> & {
  side?: SheetSide;
  size?: SheetSize;
  floating?: boolean;
  handle?: boolean;
};

function Panel({ side = 'end', size = 'sm', floating, handle = true, ...props }: PanelProps) {
  const bottom = side === 'bottom';
  return (
    <div
      className="bland-sheet bland-smooth"
      data-side={side}
      data-size={bottom ? undefined : size}
      data-floating={floating || undefined}
      style={{ ...staticBox, height: bottom ? 'auto' : 400, width: bottom ? 384 : undefined }}
    >
      <ModalContent
        titleAs="p"
        before={bottom && handle ? <span className="bland-sheet__handle" aria-hidden /> : undefined}
        actionsAlign={bottom ? 'fill' : 'right'}
        actionsOrientation={bottom ? 'vertical' : 'horizontal'}
        {...props}
      />
    </div>
  );
}

const description = 'Narrow the list down. Changes apply when you press Apply.';

const two = (close: () => void) => [
  <Button key="p" onClick={close}>
    Apply
  </Button>,
  <Button key="s" type="secondary" onClick={close}>
    Cancel
  </Button>,
];

const filters = (
  <div className="pg-stack">
    <TextInput label="Search in titles" placeholder="Type a word" />
    <Checkbox defaultChecked>Open</Checkbox>
    <Checkbox>Closed</Checkbox>
    <Checkbox>Archived</Checkbox>
  </div>
);

const paragraphs = Array.from({ length: 16 }, (_, i) => (
  <p key={i} style={{ margin: 0 }}>
    Paragraph {i + 1}. Long content scrolls inside the body, while the title and the actions stay where they are.
  </p>
));

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="pg-stack">
      <span className="pg-label">{label}</span>
      <div className="pg-row" style={{ alignItems: 'flex-start' }}>
        {children}
      </div>
    </div>
  );
}

/** A controlled Sheet: a record opened from a list, edited, and saved. */
function EditSheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Quarterly report');
  return (
    <>
      <Button type="stroke" data-testid="edit-trigger" onClick={() => setOpen(true)}>
        Edit (controlled)
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        size="md"
        title="Edit file"
        description="The name shows in the list and in search."
        actions={[
          <Button key="save" onClick={() => setOpen(false)}>
            Save
          </Button>,
          <Button key="cancel" type="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
        ]}
        data-testid="edit-sheet"
      >
        <TextInput label="File name" value={name} onChange={(e) => setName(e.target.value)} />
      </Sheet>
    </>
  );
}

export default {
  title: 'Sheet',
  description:
    'A panel that slides in from an edge of the screen over the page, for details, editing a record or filters without leaving the page. The page behind it can\'t be used until it closes.',
  usage: [
    'Use `side="end"` (the default) for details, editing and filters, `side="start"` for navigation on a phone, and `side="bottom"` for short choices on a phone.',
    '`end` and `start` follow the reading direction: in a right-to-left language the end sheet comes in from the left.',
    'Set `floating` to detach it from the screen edges, with every corner rounded.',
    'Give it a `title`. Without one, name it with `aria-label`. List the primary action first in `actions`.',
    'For a decision that needs an answer before anything else, use Modal.',
  ],
  components: ['Sheet'],
  demo: {
    component: 'Sheet',
    args: {
      title: 'Filters',
      description,
      side: 'end',
      size: 'sm',
      floating: false,
      handle: true,
      titleDivider: false,
      actionsDivider: false,
      closeButton: true,
      dismissable: true,
    },
    controls: {
      title: { kind: 'text' },
      description: { kind: 'text' },
      open: false,
      defaultOpen: false,
      titleAs: false,
      closeLabel: false,
      icon: false,
    },
    render: (args) => (
      <Sheet {...(args as SheetProps)} trigger={<Button type="stroke">Open sheet</Button>} actions={two} />
    ),
    code: (args) => ({
      ...args,
      trigger: '<Button type="stroke">Open sheet</Button>',
      actions: '{(close) => [<Button onClick={close}>Apply</Button>, <Button type="secondary" onClick={close}>Cancel</Button>]}',
    }),
  },
  render: () => (
    <>
      <Row label={<><code>size</code>: <code>sm</code> 384, <code>md</code> 512, <code>lg</code> 640 (side sheets; cut short here, live they fill the screen height)</>}>
        <Panel title="Filters" description={description} actions={two}>
          {filters}
        </Panel>
        <Panel size="md" title="Filters" description={description} actions={two} />
        <Panel size="lg" title="Filters" description={description} actions={two} />
      </Row>

      <Row label={<><code>side="start"</code>: the border moves to the inner edge, the contents keep their order</>}>
        <Panel side="start" title="Menu" description="Navigation for a phone, where the sidebar is hidden." actions={two} />
      </Row>

      <Row label={<><code>side="bottom"</code>: rad-xl top corners, a grab handle, actions stacked full width; without the handle</>}>
        <Panel side="bottom" title="Sort by" description="Pick how the list is ordered." actions={two} />
        <Panel side="bottom" handle={false} title="Sort by" description="Pick how the list is ordered." actions={two} />
      </Row>

      <Row label={<><code>floating</code>: every corner rounded, a border all round; live it sits space-sm from every screen edge</>}>
        <Panel floating title="Filters" description={description} actions={two} />
        <Panel floating side="bottom" title="Sort by" description="Pick how the list is ordered." actions={two} />
      </Row>

      <Row label={<><code>titleDivider</code> and <code>actionsDivider</code> (off by default); long content scrolls between the title and the pinned action bar; no actions</>}>
        <Panel title="Terms" titleDivider actionsDivider actions={two}>
          {paragraphs}
        </Panel>
        <Panel title="Details" description={description} />
      </Row>

      <div className="pg-stack">
        <span className="pg-label">Try it: press a trigger, or focus it and press Enter</span>
        <div className="pg-row">
          <Sheet title="Filters" description={description} actions={two} trigger={<Button type="stroke" data-testid="end-trigger">End</Button>} data-testid="end-sheet">
            {filters}
          </Sheet>
          <Sheet side="start" title="Menu" description="Navigation for a phone." trigger={<Button type="stroke" data-testid="start-trigger">Start</Button>} data-testid="start-sheet" />
          <Sheet side="bottom" title="Sort by" description="Pick how the list is ordered." actions={two} trigger={<Button type="stroke" data-testid="bottom-trigger">Bottom</Button>} data-testid="bottom-sheet" />
          <Sheet floating size="md" title="Terms" actions={two} trigger={<Button type="stroke" data-testid="floating-trigger">Floating (long)</Button>} data-testid="floating-sheet">
            {paragraphs}
          </Sheet>
          <EditSheet />
        </div>
      </div>
    </>
  ),
} satisfies Story;
