import type { Story } from '../../../playground/story';
import { PlusIcon } from '../../icons';
import { TextInput } from '../text-input/TextInput';
import { Alert, type AlertStatus } from './Alert';

const statuses: AlertStatus[] = ['info', 'danger', 'success', 'warning'];

export default {
  title: 'Alert',
  description:
    'A short inline message tied to a field or element, such as validation feedback. It sits right next to what it describes and has no surface of its own.',
  usage: [
    '`status` sets the icon and text color: `info`, `danger`, `success` or `warning`.',
    'Link it to the field it describes with `aria-describedby`, so screen readers read the two together.',
    'For a message about a whole page or section, use Banner. For feedback after an action, use Toast or Notification.',
  ],
  components: ['Alert'],
  demo: {
    component: 'Alert',
    args: { children: 'Enter an email address like name@example.com', status: 'danger', icon: true },
    controls: { children: { kind: 'text' }, icon: { kind: 'boolean' }, role: false },
    render: (args) => <Alert {...(args as object)}>{args.children}</Alert>,
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>status</code>: <code>info</code>, <code>danger</code>, <code>success</code>, <code>warning</code></span>
        {statuses.map((status) => (
          <Alert key={status} status={status}>
            Alerts display messages about an element ({status})
          </Alert>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>icon={false}</code>, and another icon in its place</span>
        <Alert status="success" icon={false}>
          Username is available
        </Alert>
        <Alert status="warning" icon={<PlusIcon />}>
          Any SVG can replace the status icon
        </Alert>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Long text wraps at 384px</span>
        <Alert status="danger">
          The password needs at least twelve characters, one number and one symbol, and it cannot match any of your last five passwords.
        </Alert>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Under the field it describes, linked with <code>aria-describedby</code></span>
        <div className="pg-stack" style={{ maxWidth: 320 }}>
          <TextInput label="Email" aria-describedby="alert-email-error" aria-invalid defaultValue="name@" />
          <Alert id="alert-email-error" status="danger">
            Enter an email address like name@example.com
          </Alert>
        </div>
      </div>
    </>
  ),
} satisfies Story;
