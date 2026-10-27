import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import { Notification, type NotificationOrientation, type NotificationStatus } from './Notification';

const statuses: NotificationStatus[] = ['info', 'danger', 'success', 'warning'];

/** Figma's actions: a primary Button, then a secondary one; xs on horizontal, md on vertical. */
function actionsFor(orientation: NotificationOrientation, count: number) {
  const size = orientation === 'vertical' ? 'md' : 'xs';
  return count === 0 ? undefined : (
    <>
      <Button size={size}>View</Button>
      {count > 1 && (
        <Button size={size} type="secondary">
          Undo
        </Button>
      )}
    </>
  );
}

const stamp = <time dateTime="2026-10-18T09:41">9:41 AM</time>;

export default {
  title: 'Notification',
  description:
    'Toast that reports the result of an action or a system event. Status sets the icon, colors and shadow: info, success, warning, danger. Colored uses the tinted status surface and border; uncolored uses surface-100 with border-bold. Horizontal is a single line with optional inline actions and an optional title above the description (👀 Title, off by default); vertical adds a title, timestamp and up to two actions. Width comes from notification/width (384) and text wraps inside it. Close and icon are optional.',
  components: ['Notification'],
  demo: {
    component: 'Notification',
    args: {
      children: 'Notifications float on the screen',
      title: 'Notification title',
      status: 'info',
      orientation: 'vertical',
      colored: true,
      timestamp: '9:41 AM',
      actions: 'two',
      onClose: true,
      icon: true,
    },
    controls: {
      children: { kind: 'text' },
      title: { kind: 'text' },
      timestamp: { kind: 'text' },
      actions: { kind: 'select', options: ['none', 'one', 'two'] },
      onClose: { kind: 'boolean' },
      icon: { kind: 'boolean' },
      closeLabel: false,
    },
    render: ({ actions, onClose, title, timestamp, ...args }) => (
      <Notification
        {...(args as object)}
        title={title === '' ? undefined : title}
        timestamp={timestamp === '' ? undefined : timestamp}
        actions={actionsFor(args.orientation, ['none', 'one', 'two'].indexOf(actions))}
        onClose={onClose ? () => {} : undefined}
      >
        {args.children}
      </Notification>
    ),
    code: ({ actions, ...args }) => ({ ...args, ...(actions !== 'none' && { actions: '<Button>View</Button>' }) }),
  },
  render: () => (
    <>
      {([true, false] as const).map((colored) => (
        <div key={String(colored)} className="pg-stack">
          <span className="pg-label">colored={String(colored)}: horizontal, then vertical</span>
          {statuses.map((status) => (
            <div key={status} className="pg-row" style={{ alignItems: 'flex-start' }}>
              <Notification status={status} colored={colored} onClose={() => {}}>
                Notifications float on the screen ({status})
              </Notification>
              <Notification status={status} colored={colored} orientation="vertical" title="Notification title" timestamp={stamp} onClose={() => {}}>
                Notifications float on the screen ({status})
              </Notification>
            </div>
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Actions (xs inline when horizontal, md below when vertical), timestamp, a horizontal title, no close, no icon</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div className="pg-stack">
            <Notification status="success" actions={actionsFor('horizontal', 1)} timestamp={stamp}>
              File deleted
            </Notification>
            <Notification status="success" title="File deleted" actions={actionsFor('horizontal', 1)} timestamp={stamp} onClose={() => {}}>
              Horizontal, with a title
            </Notification>
          </div>
          <Notification status="danger" orientation="vertical" title="Upload failed" timestamp={stamp} actions={actionsFor('vertical', 2)} onClose={() => {}}>
            report-final.pdf is larger than 20 MB. Compress it or split it into smaller files, then try again.
          </Notification>
          <Notification status="info" icon={false} colored={false}>
            Without the icon or close button
          </Notification>
          <Notification status="warning" orientation="vertical" title="A title long enough to wrap onto a second line" timestamp={stamp} onClose={() => {}}>
            The timestamp stays on the title's first line
          </Notification>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the actions and close button take keyboard focus; forced on here to show it</span>
        <div className="pg-row pg-focus">
          <Notification status="warning" actions={actionsFor('horizontal', 1)} onClose={() => {}}>
            Storage almost full
          </Notification>
        </div>
      </div>
    </>
  ),
} satisfies Story;
