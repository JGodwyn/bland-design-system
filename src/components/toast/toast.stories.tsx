import type { Story } from '../../../playground/story';
import { PlusIcon } from '../../icons';
import { Button } from '../button/Button';
import { Notification } from '../notification/Notification';
import { Toast, type ToastStatus } from './Toast';
import { Toaster, useToaster } from './Toaster';

const statuses: ToastStatus[] = ['info', 'danger', 'success', 'warning'];

/** Buttons that show toasts through a Toaster, so tests/toast.spec.ts can check timing and announcements. */
function Triggers() {
  const { toast, show, dismiss } = useToaster();
  return (
    <div className="pg-row">
      <Button type="secondary" size="sm" onClick={() => toast('Changes saved', { status: 'success' })}>
        Show a toast
      </Button>
      <Button type="secondary" size="sm" onClick={() => toast('Kept until dismissed', { duration: null, id: 'sticky' })}>
        Show a lasting toast
      </Button>
      <Button type="stroke" size="sm" onClick={() => dismiss('sticky')}>
        Dismiss it
      </Button>
      <Button
        type="secondary"
        size="sm"
        onClick={() =>
          show(
            (close) => (
              <Notification status="info" orientation="vertical" title="Invitation sent" onClose={close}>
                Ada will get an email with a link to join.
              </Notification>
            ),
            { duration: null },
          )
        }
      >
        Show a notification
      </Button>
    </div>
  );
}

export default {
  title: 'Toast',
  description:
    'A short message that floats above the page and goes away on its own, such as Saved or Message sent.',
  usage: [
    'Wrap your app in `Toaster`, then show toasts with `useToaster()`.',
    'Keep it to one short sentence. People can miss a toast, so never put something they must act on in one.',
    'For a message with a title, actions or a close button, use Notification.',
  ],
  components: ['Toast', 'Toaster'],
  demo: {
    component: 'Toast',
    args: { children: 'Toasts display information only', status: 'info', icon: true },
    controls: { children: { kind: 'text' }, icon: { kind: 'boolean' } },
    render: (args) => <Toast {...(args as object)}>{args.children}</Toast>,
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>status</code>: <code>info</code>, <code>danger</code>, <code>success</code>, <code>warning</code></span>
        {statuses.map((status) => (
          <Toast key={status} status={status}>
            Toasts display information only ({status})
          </Toast>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>icon={false}</code>, another icon, and long text wrapping</span>
        <Toast status="success" icon={false}>
          Copied
        </Toast>
        <Toast status="info" icon={<PlusIcon />}>
          Added to your library
        </Toast>
        <Toast status="danger">We could not reach the server. Check your connection; your changes are kept until it is back.</Toast>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: Toaster stacks toasts at the bottom of the screen, announces them and hides them after a few seconds (not while hovered or focused)</span>
        <Toaster>
          <Triggers />
        </Toaster>
      </div>
    </>
  ),
} satisfies Story;
