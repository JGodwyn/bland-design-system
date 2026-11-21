import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { Avatar } from '../avatar/Avatar';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { ModalContent } from '../modal/Modal';
import { TextInput } from '../text-input/TextInput';
import { Popover, type PopoverProps, type PopoverSize } from './Popover';

/**
 * The static popover: its inside drawn in the page, without the top layer, placement or behaviour, so every variant
 * can sit side by side in the docs and the screenshots.
 */
type PanelProps = Omit<Parameters<typeof ModalContent>[0], 'titleAs' | 'before'> & { size?: PopoverSize; style?: CSSProperties };

function Panel({ size = 'md', style, ...props }: PanelProps) {
  return (
    <div className="bland-popover bland-smooth" data-size={size} style={style}>
      <ModalContent titleAs="p" closeButton={false} actionsAlign="right" actionsOrientation="horizontal" {...props} />
    </div>
  );
}

const description = 'Show only conversations with unread messages from people you follow.';

const two = (close: () => void) => [
  <Button key="p" size="sm" onClick={close}>
    Apply
  </Button>,
  <Button key="s" size="sm" type="secondary" onClick={close}>
    Reset
  </Button>,
];

const filters = (
  <div className="pg-stack" style={{ gap: 0 }}>
    <Checkbox defaultChecked>Unread</Checkbox>
    <Checkbox>Mentions</Checkbox>
    <Checkbox>From people you follow</Checkbox>
  </div>
);

const shareLink = 'https://blandui.com/s/q3-report';

function Share() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="pg-row" style={{ alignItems: 'flex-end', flexWrap: 'nowrap' }}>
      <TextInput label="Link" readOnly value={shareLink} style={{ flex: '1 1 auto', minWidth: 0 }} />
      <Button
        size="sm"
        type="secondary"
        onClick={() => {
          void navigator.clipboard?.writeText(shareLink).catch(() => {});
          setCopied(true);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

const profile = (
  <div className="pg-row" style={{ flexWrap: 'nowrap' }}>
    <Avatar size="lg" initials="AL" />
    <div style={{ minWidth: 0 }}>
      <div style={{ font: 'var(--type-body-lg-bold)' }}>Ada Lovelace</div>
      <div style={{ font: 'var(--type-body-md)', color: 'var(--text-subtle)' }}>ada@example.com</div>
    </div>
  </div>
);

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

/** A controlled Popover: opened from its own button and closed when the filters are applied. */
function ControlledPopover() {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      size="sm"
      title="Filters"
      actions={two}
      trigger={<Button type="stroke" data-testid="controlled-trigger">Filters (controlled)</Button>}
      data-testid="controlled-popover"
    >
      {filters}
    </Popover>
  );
}

export default {
  title: 'Popover',
  description:
    'A small panel that opens beside the element that was pressed and holds any content: a short text, a form, a few options or a profile. The page stays usable; a press outside or Escape closes it.',
  usage: [
    'Pass the element that opens it as `trigger`; focus moves into the panel and back to the trigger when it closes.',
    'The title and the actions are off until you pass them. Without a `title`, name the panel with `aria-label`.',
    'Use sm Buttons in `actions`, primary first; a function gets `close` for a Cancel that only closes.',
    'Turn on `closeButton` for a panel with a form, where a stray press outside would lose the input.',
    'For a list of actions, use Menu; for a decision that needs an answer, use Modal.',
  ],
  components: ['Popover'],
  demo: {
    component: 'Popover',
    args: {
      titleBar: true,
      actionBar: true,
      title: 'Filters',
      description,
      size: 'md',
      placement: 'bottom-start',
      align: 'left',
      actionsAlign: 'right',
      closeButton: false,
      titleDivider: false,
      actionsDivider: false,
      dismissable: true,
    },
    controls: {
      titleBar: { kind: 'boolean' },
      actionBar: { kind: 'boolean' },
      title: { kind: 'text' },
      description: { kind: 'text' },
      open: false,
      defaultOpen: false,
      titleAs: false,
      closeLabel: false,
      icon: false,
    },
    render: ({ titleBar, actionBar, title, ...args }) => (
      <Popover
        {...(args as PopoverProps)}
        title={titleBar ? title : undefined}
        aria-label={titleBar ? undefined : 'Filters'}
        actions={actionBar ? two : undefined}
        trigger={<Button type="stroke">Open popover</Button>}
      />
    ),
    code: ({ titleBar, actionBar, title, ...args }) => ({
      ...(titleBar ? { title } : { 'aria-label': 'Filters' }),
      ...args,
      trigger: '<Button type="stroke">Open popover</Button>',
      ...(actionBar && {
        actions:
          '{(close) => [<Button size="sm" onClick={close}>Apply</Button>, <Button size="sm" type="secondary" onClick={close}>Reset</Button>]}',
      }),
    }),
  },
  render: () => (
    <>
      <Row label={<><code>size</code>: <code>sm</code> 256, <code>md</code> 320 (default); the body alone, as Figma's default</>}>
        <Panel size="sm" description={description} />
        <Panel description={description} />
      </Row>

      <Row label={<><code>title</code> and <code>actions</code> (sm Buttons, right); with <code>closeButton</code> for a panel with a field</>}>
        <Panel size="sm" title="Filters" actions={two}>
          {filters}
        </Panel>
        <Panel title="Share" closeButton description="Anyone with the link can view the report.">
          <Share />
        </Panel>
      </Row>

      <Row label={<>A profile panel (body only) and <code>titleDivider</code> / <code>actionsDivider</code></>}>
        <Panel size="sm">{profile}</Panel>
        <Panel title="Filters" titleDivider actionsDivider description={description} actions={two} />
      </Row>

      <Row label={<><code>align="center"</code>: the title centres too while there is no close button</>}>
        <Panel size="sm" align="center" title="Saved" description="Your changes are in the shared folder." actions={(close) => <Button size="sm" onClick={close}>Done</Button>} actionsAlign="fill" />
        <Panel size="sm" align="center" closeButton title="Saved" description="Your changes are in the shared folder." />
      </Row>

      <div className="pg-stack">
        <span className="pg-label">Try it: press a trigger, or focus it and press Enter</span>
        <div className="pg-row">
          <Popover
            title="Filters"
            description={description}
            actions={two}
            trigger={<Button type="stroke" data-testid="filters-trigger">Filters</Button>}
            data-testid="filters-popover"
          >
            {filters}
          </Popover>
          <Popover
            title="Share"
            closeButton
            description="Anyone with the link can view the report."
            trigger={<Button type="stroke" data-testid="share-trigger">Share</Button>}
            data-testid="share-popover"
          >
            <Share />
          </Popover>
          <Popover
            size="sm"
            placement="bottom-end"
            aria-label="Account"
            trigger={<Button type="stroke" data-testid="profile-trigger">Account</Button>}
            data-testid="profile-popover"
          >
            {profile}
          </Popover>
          <ControlledPopover />
        </div>
      </div>
    </>
  ),
} satisfies Story;
