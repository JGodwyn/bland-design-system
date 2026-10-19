import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { InfoIcon, WarningOctagonIcon } from '../../icons';
import { Button } from '../button/Button';
import { TextInput } from '../text-input/TextInput';
import { Modal, ModalContent, type ModalProps, type ModalSize } from './Modal';

/**
 * The static dialog: Modal's inside drawn in the page, without the top layer or behaviour, so every variant can sit
 * side by side in the docs and the screenshots.
 */
const staticBox: CSSProperties = {
  position: 'static',
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  opacity: 1,
  transform: 'none',
};

type PanelProps = Omit<Parameters<typeof ModalContent>[0], 'titleAs'> & { size?: ModalSize; style?: CSSProperties };

function Panel({ size = 'sm', style, ...props }: PanelProps) {
  return (
    <div className="bland-modal bland-smooth" data-size={size} style={{ ...staticBox, ...style }}>
      <ModalContent titleAs="p" {...props} />
    </div>
  );
}

const description = 'Your changes to this file will be lost. You can restore the last saved version from the history.';

const two = (close: () => void) => [
  <Button key="p" onClick={close}>
    Confirm
  </Button>,
  <Button key="s" type="secondary" onClick={close}>
    Cancel
  </Button>,
];
const three = [
  <Button key="p">Save</Button>,
  <Button key="s" type="secondary">
    Save as copy
  </Button>,
  <Button key="t" type="ghost">
    Cancel
  </Button>,
];

const paragraphs = Array.from({ length: 12 }, (_, i) => (
  <p key={i} style={{ margin: 0 }}>
    Paragraph {i + 1}. Long content scrolls inside the body, with the fade and the visible thumb, while the title and
    the actions stay where they are.
  </p>
));

// Options for the demo's `icon` control; the code snippet prints the same JSX.
const icons = { none: undefined, InfoIcon: <InfoIcon />, WarningOctagonIcon: <WarningOctagonIcon /> } as const;
const iconCode = { none: undefined, InfoIcon: '<InfoIcon />', WarningOctagonIcon: '<WarningOctagonIcon />' } as const;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pg-stack">
      <span className="pg-label">{label}</span>
      <div className="pg-row" style={{ alignItems: 'flex-start' }}>
        {children}
      </div>
    </div>
  );
}

/** A controlled Modal holding a form: the submit button sits in the action bar and names the form. */
function FormModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState('none');
  return (
    <>
      <Button type="stroke" data-testid="form-trigger" onClick={() => setOpen(true)}>
        Rename (form)
      </Button>
      <output className="pg-label" data-testid="saved-name">
        {saved}
      </output>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Rename file"
        description="Pick a name you will recognise later."
        actions={[
          <Button key="save" htmlType="submit" form="rename-form">
            Save
          </Button>,
          <Button key="cancel" type="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
        ]}
        actionsAlign="right"
        data-testid="form-modal"
      >
        <form
          id="rename-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(name || 'empty');
            setOpen(false);
          }}
        >
          <TextInput label="File name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </form>
      </Modal>
    </>
  );
}

export default {
  title: 'Modal',
  description:
    'Dialog that asks for a decision or shows focused content above the page. Size sets the width: sm 384, md 512; a layout can make it wider. Title, body and action bar can each be hidden. The dialog takes focus when it opens, keeps it inside while open, closes on Escape and returns focus to the trigger. Put the primary action first in actions; right alignment draws it last, on the trailing edge, and on narrow screens the actions stack with the primary on top.',
  components: ['Modal'],
  demo: {
    component: 'Modal',
    args: {
      title: 'Discard changes?',
      description,
      size: 'sm',
      icon: 'none',
      align: 'left',
      actionsAlign: 'left',
      actionsOrientation: 'auto',
      closeButton: true,
      titleDivider: false,
      actionsDivider: false,
      dismissable: true,
      backdrop: 'subtle',
    },
    controls: {
      title: { kind: 'text' },
      description: { kind: 'text' },
      icon: { kind: 'select', options: Object.keys(icons) },
      open: false,
      defaultOpen: false,
      titleAs: false,
      closeLabel: false,
    },
    render: ({ icon, ...args }) => (
      <Modal
        {...(args as ModalProps)}
        icon={icons[icon as keyof typeof icons]}
        trigger={<Button type="stroke">Open modal</Button>}
        actions={two}
      />
    ),
    code: ({ icon, ...args }) => ({
      ...args,
      icon: iconCode[icon as keyof typeof iconCode],
      trigger: '<Button type="stroke">Open modal</Button>',
      actions: '{(close) => [<Button onClick={close}>Confirm</Button>, <Button type="secondary" onClick={close}>Cancel</Button>]}',
    }),
  },
  render: () => (
    <>
      <Row label="size: sm (modal/width-sm, 384) and md (modal/width-md, 512); actions left, primary first">
        <Panel title="Discard changes?" description={description} actions={two} />
        <Panel size="md" title="Discard changes?" description={description} actions={two} />
      </Row>

      <Row label="icon, titleDivider and actionsDivider; body align center with no close button">
        <Panel
          icon={<InfoIcon />}
          title="A title long enough to wrap onto a second line beside its icon"
          titleDivider
          description={description}
          actions={two}
          actionsDivider
        />
        <Panel title="Saved" closeButton={false} align="center" description="Your file is saved." actions={<Button>Done</Button>} actionsAlign="fill" />
      </Row>

      <Row label="actionsAlign: left (primary first), right (primary last, on the trailing edge), fill">
        <Panel title="Left" actions={three} />
        <Panel title="Right" actions={three} actionsAlign="right" />
        <Panel title="Fill" actions={two} actionsAlign="fill" />
      </Row>

      <Row label="actionsOrientation vertical (auto below breakpoint/sm): full width, primary on top; one button">
        <Panel title="Vertical" actions={three} actionsOrientation="vertical" />
        <Panel title="One action" description={description} actions={<Button>Got it</Button>} />
      </Row>

      <Row label="top and children slots (Figma 🧩 Top / 🧩 Bottom); no title, close only; no actions">
        <Panel
          title="Invite people"
          top={<div className="pg-label">Top slot: an image or a summary</div>}
          description="They will get an email with a link to this file."
          actions={two}
          actionsAlign="right"
        >
          <TextInput label="Email" placeholder="name@example.com" />
        </Panel>
        <Panel description={description} />
        <Panel title="No actions" description={description} />
      </Row>

      <Row label="Long content: the body scrolls (fade and thumb) between a fixed title and action bar (drawn here at 320 high)">
        <Panel title="Terms" titleDivider actions={two} actionsDivider style={{ maxHeight: 320 }}>
          {paragraphs}
        </Panel>
      </Row>

      <div className="pg-stack">
        <span className="pg-label">Real modals: press a trigger, or focus it and press Enter. The alert dims the page with backdrop bold, the others subtle (tests/modal.spec.ts screenshots them open)</span>
        <div className="pg-row">
          <Modal
            title="Discard changes?"
            description={description}
            actions={two}
            trigger={
              <Button type="stroke" data-testid="basic-trigger">
                Discard (basic)
              </Button>
            }
            data-testid="basic-modal"
          />
          <Modal
            title="Delete project?"
            icon={<WarningOctagonIcon />}
            description="This deletes every file in the project. It cannot be undone."
            role="alertdialog"
            dismissable={false}
            backdrop="bold"
            actionsAlign="right"
            actions={(close) => [
              <Button key="d" emotion="danger" onClick={close}>
                Delete
              </Button>,
              <Button key="c" type="secondary" onClick={close}>
                Cancel
              </Button>,
            ]}
            trigger={
              <Button type="stroke" emotion="danger" data-testid="alert-trigger">
                Delete (alert)
              </Button>
            }
            data-testid="alert-modal"
          />
          <Modal
            size="md"
            title="Terms"
            titleDivider
            actionsDivider
            actions={two}
            trigger={
              <Button type="stroke" data-testid="long-trigger">
                Terms (long)
              </Button>
            }
            data-testid="long-modal"
          >
            {paragraphs}
          </Modal>
          <FormModal />
        </div>
      </div>
    </>
  ),
} satisfies Story;
