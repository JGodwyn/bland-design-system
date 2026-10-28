import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import { Banner, type BannerOrientation, type BannerStatus } from './Banner';

const statuses: BannerStatus[] = ['info', 'danger', 'success', 'warning'];

/** A primary Button, then a secondary one. No size: Banner's actions default to sm. */
function actionsFor(_orientation: BannerOrientation, count: number) {
  return count === 0 ? undefined : (
    <>
      <Button>Update</Button>
      {count > 1 && <Button type="secondary">Later</Button>}
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
    'A message that sits in the page layout, usually across the top of a page or section, and stays until it is dismissed or the condition clears.',
  usage: [
    '`status` sets the icon and its color. Turn on `colored` when the message needs more weight than the default neutral surface.',
    'Add up to two `actions` (Buttons, primary first). Add `onClose` to let people dismiss it; a banner never hides itself.',
    '`orientation="vertical"` gives the title its own line and puts the actions under the text.',
    'For a message that floats over the page, use Notification. For a short confirmation, use Toast.',
  ],
  components: ['Banner'],
  demo: {
    component: 'Banner',
    args: { children: 'Banners display important announcements', title: 'Banner title', status: 'info', orientation: 'vertical', colored: false, actions: 'two', onClose: true, icon: true },
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
        <span className="pg-label"><code>orientation="horizontal"</code>: <code>status</code> <code>info</code>, <code>danger</code>, <code>success</code>, <code>warning</code></span>
        {statuses.map((status) => (
          <Banner key={status} status={status}>
            Banners display important announcements ({status})
          </Banner>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>orientation="vertical"</code>: a title over the description</span>
        {statuses.map((status) => (
          <Banner key={status} status={status} orientation="vertical" title="Banner title">
            Banners display important announcements ({status})
          </Banner>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>colored</code>: a tinted surface and border, <code>horizontal</code> then <code>vertical</code></span>
        {statuses.map((status) => (
          <Banner key={status} status={status} colored>
            Banners display important announcements ({status})
          </Banner>
        ))}
        {statuses.map((status) => (
          <Banner key={status} status={status} colored orientation="vertical" title="Banner title" actions={status === 'info' ? actionsFor('vertical', 2) : undefined}>
            Banners display important announcements ({status})
          </Banner>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>actions</code> (inline when <code>horizontal</code>, under the text when <code>vertical</code>) and <code>onClose</code></span>
        <Banner status="info" actions={actionsFor('horizontal', 2)} onClose={() => {}}>
          A new version is available
        </Banner>
        <Banner status="info" title="Version 2.4" actions={actionsFor('horizontal', 1)} onClose={() => {}}>
          Horizontal, with a title
        </Banner>
        <Banner status="danger" orientation="vertical" title="Payment failed" actions={actionsFor('vertical', 2)} onClose={() => {}}>
          We could not charge your card. Update your payment details to keep your plan.
        </Banner>
        <Banner status="success" orientation="vertical" title="Title only" icon={false} onClose={() => {}} />
        <Banner status="warning" actions={<Button size="xs">Own size</Button>}>
          A Button's own size still wins
        </Banner>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the actions and close button take focus (turned on here to show it)</span>
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
