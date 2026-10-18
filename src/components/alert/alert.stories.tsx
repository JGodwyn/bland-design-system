import type { Story } from '../../../playground/story';
import { PlusIcon } from '../../icons';
import { TextInput } from '../text-input/TextInput';
import { Alert, type AlertStatus } from './Alert';

const statuses: AlertStatus[] = ['info', 'danger', 'success', 'warning'];

export default {
  title: 'Alert',
  description:
    'Inline message tied to a field or element, such as validation feedback. Status sets the icon and its color: info, danger, success, warning. The text wraps at alert/max-width; set the instance to Fill container to match the width of the element it describes. Has no surface or elevation.',
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
        <span className="pg-label">Status: info, danger, success, warning</span>
        {statuses.map((status) => (
          <Alert key={status} status={status}>
            Alerts display messages about an element ({status})
          </Alert>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Without the icon, and with another icon in its place</span>
        <Alert status="success" icon={false}>
          Username is available
        </Alert>
        <Alert status="warning" icon={<PlusIcon />}>
          Any SVG can replace the status icon
        </Alert>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Long text wraps at alert/max-width (384)</span>
        <Alert status="danger">
          The password needs at least twelve characters, one number and one symbol, and it cannot match any of your last five passwords.
        </Alert>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Under the element it describes, linked with aria-describedby</span>
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
