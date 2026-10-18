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
    'Short, transient status message that floats above the page and dismisses on its own. Solid surface-{status}-strong fill with white content in both modes, and an elevation tinted to the status. Status: info, danger, success, warning. The text wraps at toast/max-width. For messages with a title, actions or a close button, use Notification.',
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
        <span className="pg-label">Status: info, danger, success, warning</span>
        {statuses.map((status) => (
          <Toast key={status} status={status}>
            Toasts display information only ({status})
          </Toast>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Without the icon, another icon, and long text wrapping at toast/max-width (384)</span>
        <Toast status="success" icon={false}>
          Copied
        </Toast>
        <Toast status="info" icon={<PlusIcon />}>
          Added to your library
        </Toast>
        <Toast status="danger">We could not reach the server. Check your connection; your changes are kept until it is back.</Toast>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Toaster: stacks toasts at the bottom of the screen, announces them and times them out (paused on hover and focus)</span>
        <Toaster>
          <Triggers />
        </Toaster>
      </div>
    </>
  ),
} satisfies Story;
