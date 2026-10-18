import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import { Banner, type BannerOrientation, type BannerStatus } from './Banner';

const statuses: BannerStatus[] = ['info', 'danger', 'success', 'warning'];

/** Figma's actions: a primary Button, then a secondary one; xs on horizontal banners, md on vertical ones. */
function actionsFor(orientation: BannerOrientation, count: number) {
  const size = orientation === 'vertical' ? 'md' : 'xs';
  return count === 0 ? undefined : (
    <>
      <Button size={size}>Update</Button>
      {count > 1 && (
        <Button size={size} type="secondary">
          Later
        </Button>
      )}
    </>
  );
}

/** A banner that closes itself, so tests/banner.spec.ts can check the close button. */
function Dismissible() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Banner status="warning" data-testid="dismissible" onClose={() => setOpen(false)} closeLabel="Dismiss maintenance notice">
      Scheduled maintenance on Sunday from 02:00 to 04:00
    </Banner>
  ) : (
    <output className="pg-label" data-testid="dismissed">
      Dismissed
    </output>
  );
}

export default {
  title: 'Banner',
  description:
    'Persistent message that sits in the page layout, usually full width under a header, and stays until the user dismisses it or the condition clears. No elevation, so it reads as part of the page. Status sets the icon and its color: info, danger, success, warning. Set the instance to Fill container in layouts. For floating messages use Notification; for transient ones use Toast.',
  components: ['Banner'],
  demo: {
    component: 'Banner',
    args: { children: 'Banners display important announcements', title: 'Banner title', status: 'info', orientation: 'vertical', actions: 'two', onClose: true, icon: true },
    controls: {
      children: { kind: 'text' },
      title: { kind: 'text' },
      actions: { kind: 'select', options: ['none', 'one', 'two'] },
      onClose: { kind: 'boolean' },
      icon: { kind: 'boolean' },
      closeLabel: false,
    },
    render: ({ actions, onClose, title, ...args }) => (
      <Banner
        {...(args as object)}
        title={title === '' ? undefined : title}
        actions={actionsFor(args.orientation, ['none', 'one', 'two'].indexOf(actions))}
        onClose={onClose ? () => {} : undefined}
      >
        {args.children}
      </Banner>
    ),
    code: ({ actions, ...args }) => ({ ...args, ...(actions !== 'none' && { actions: '<Button>Update</Button>' }) }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">orientation="horizontal": status info, danger, success, warning</span>
        {statuses.map((status) => (
          <Banner key={status} status={status}>
            Banners display important announcements ({status})
          </Banner>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">orientation="vertical": a title over the description</span>
        {statuses.map((status) => (
          <Banner key={status} status={status} orientation="vertical" title="Banner title">
            Banners display important announcements ({status})
          </Banner>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Actions (xs inline when horizontal, md below when vertical) and close</span>
        <Banner status="info" actions={actionsFor('horizontal', 2)} onClose={() => {}}>
          A new version is available
        </Banner>
        <Banner status="danger" orientation="vertical" title="Payment failed" actions={actionsFor('vertical', 2)} onClose={() => {}}>
          We could not charge your card. Update your payment details to keep your plan.
        </Banner>
        <Banner status="success" orientation="vertical" title="Title only" icon={false} onClose={() => {}} />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the actions and close button take keyboard focus; forced on here to show it</span>
        <div className="pg-focus">
          <Banner status="info" actions={actionsFor('horizontal', 1)} onClose={() => {}}>
            A new version is available
          </Banner>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Long text wraps; the banner spans its container</span>
        <Banner status="warning" onClose={() => {}}>
          Your trial ends in three days. Add a payment method before then to keep your projects, your history and every teammate you invited.
        </Banner>
        <Dismissible />
      </div>
    </>
  ),
} satisfies Story;
