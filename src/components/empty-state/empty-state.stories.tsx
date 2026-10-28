import type { ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { PlusIcon, UserIcon } from '../../icons';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { EmptyState, type EmptyStateSize } from './EmptyState';

const sizes: EmptyStateSize[] = ['sm', 'lg'];
const title = 'This part is empty.';
const description = 'Here’s what you can do to make it less empty.';

/** Figma's frame width, empty-state/width-sm or -lg; the empty state itself fills whatever holds it. */
function Frame({ size, children }: { size: EmptyStateSize; children: ReactNode }) {
  return <div style={{ width: `var(--empty-state-width-${size})` }}>{children}</div>;
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="pg-row" style={{ alignItems: 'flex-start' }}>
      {children}
    </div>
  );
}

/**
 * A project's own illustration: Figma's placeholder (a Phosphor Package icon on a surface-200 disc,
 * 40 or 64 at stroke 2 or 4). Bland ships none, so its size is this story's choice, not a token.
 */
function PackageArt({ size = 'sm' }: { size?: EmptyStateSize }) {
  const lg = size === 'lg';
  return (
    <span
      style={{
        display: 'flex',
        padding: lg ? 'var(--space-2xl)' : 'var(--space-lg)',
        borderRadius: 'var(--rad-rd)',
        background: 'var(--surface-200)',
        color: 'var(--icon-subtle)',
      }}
    >
      <svg width={lg ? 64 : 40} height={lg ? 64 : 40} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={lg ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 16.1362V28.9962" />
        <path d="M4.0874 9.61499L15.9999 16.135L27.9124 9.61499" />
        <path d="M27.48 22.8551L16.48 28.8776C16.3328 28.9581 16.1678 29.0003 16 29.0003C15.8322 29.0003 15.6672 28.9581 15.52 28.8776L4.52 22.8551C4.36293 22.7691 4.23181 22.6426 4.14035 22.4887C4.04888 22.3347 4.00041 22.1591 4 21.9801V10.0226C4.00041 9.84351 4.04888 9.66786 4.14035 9.51394C4.23181 9.36003 4.36293 9.23349 4.52 9.14755L15.52 3.12505C15.6672 3.04453 15.8322 3.00232 16 3.00232C16.1678 3.00232 16.3328 3.04453 16.48 3.12505L27.48 9.14755C27.6371 9.23349 27.7682 9.36003 27.8597 9.51394C27.9511 9.66786 27.9996 9.84351 28 10.0226V21.9776C28 22.157 27.9518 22.3332 27.8603 22.4876C27.7688 22.642 27.6374 22.7689 27.48 22.8551Z" />
        <path d="M10.1951 6.0387L22.0001 12.4999V18.9999" />
      </svg>
    </span>
  );
}

const userIcon = (
  <Icon size="lg" style={{ color: 'var(--icon-subtle)' }}>
    <UserIcon />
  </Icon>
);

const illustrations = {
  none: () => undefined,
  PackageArt: (size: EmptyStateSize) => <PackageArt size={size} />,
  UserIcon: () => userIcon,
} as const;

const illustrationCode = {
  none: undefined,
  PackageArt: '<PackageArt />',
  UserIcon: '<Icon size="lg"><UserIcon /></Icon>',
} as const;

const actionSets = {
  none: undefined,
  one: <Button iconStart={<PlusIcon />}>Add item</Button>,
  two: (
    <>
      <Button iconStart={<PlusIcon />}>Add item</Button>
      <Button type="secondary">Import</Button>
    </>
  ),
} as const;

const actionCode = {
  none: undefined,
  one: '<Button iconStart={<PlusIcon />}>Add item</Button>',
  two: '<><Button iconStart={<PlusIcon />}>Add item</Button><Button type="secondary">Import</Button></>',
} as const;

export default {
  title: 'Empty State',
  description:
    'Fills a view, list or panel that has no content yet, and tells people what they can do next.',
  usage: [
    '`size="sm"` for cards, panels and table bodies; `lg` for a whole page.',
    'Keep `title` short, and the `description` to a line or two that says how to fill the space.',
    'Add one or two `actions`, primary first.',
    'Pick the heading level with `titleAs` (`h2` by default) to fit the page\'s outline.',
    'Bland ships no illustration: pass your own in `illustration`, or leave it out.',
  ],
  components: ['EmptyState'],
  demo: {
    component: 'EmptyState',
    args: { title, description, size: 'sm', titleAs: 'h2', illustration: 'PackageArt', actions: 'one' },
    controls: {
      title: { kind: 'text' },
      description: { kind: 'text' },
      illustration: { kind: 'select', options: ['none', 'PackageArt', 'UserIcon'] },
      actions: { kind: 'select', options: ['none', 'one', 'two'] },
    },
    render: ({ actions, illustration, size, ...args }) => (
      <Frame size={size}>
        <EmptyState
          {...(args as { title: string })}
          size={size}
          illustration={illustrations[illustration as keyof typeof illustrations](size)}
          actions={actionSets[actions as keyof typeof actionSets]}
        />
      </Frame>
    ),
    code: ({ actions, illustration, ...args }) => ({
      ...args,
      illustration: illustrationCode[illustration as keyof typeof illustrationCode],
      actions: actionCode[actions as keyof typeof actionCode],
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>sm</code> (default) for cards and panels, <code>lg</code> for whole pages, with your own illustration</span>
        <Row>
          {sizes.map((size) => (
            <Frame key={size} size={size}>
              <EmptyState size={size} illustration={<PackageArt size={size} />} title={title} description={description} data-testid={`plain-${size}`} />
            </Frame>
          ))}
        </Row>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>actions</code>: one, or two stacked with the primary first; the second has no illustration</span>
        <Row>
          {sizes.map((size) => (
            <Frame key={size} size={size}>
              <EmptyState size={size} illustration={<PackageArt size={size} />} title={title} description={description} actions={actionSets.one} />
            </Frame>
          ))}
        </Row>
        <Row>
          {sizes.map((size) => (
            <Frame key={size} size={size}>
              <EmptyState size={size} title={title} description={description} actions={actionSets.two} data-testid={`actions-${size}`} />
            </Frame>
          ))}
        </Row>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: only the actions take it (turned on here to show it)</span>
        <Row>
          <Frame size="sm">
            <div className="pg-focus">
              <EmptyState title={title} description={description} actions={actionSets.two} />
            </div>
          </Frame>
        </Row>
      </div>

      <div className="pg-stack">
        <span className="pg-label">No <code>illustration</code>, or an icon; a title alone (<code>titleAs="h3"</code>)</span>
        <Row>
          <Frame size="sm">
            <EmptyState title="No results" description="Try another search or clear the filters." data-testid="no-illustration" />
          </Frame>
          <Frame size="sm">
            <EmptyState illustration={userIcon} title="No members yet" description="Invite people to work on this project." />
          </Frame>
          <Frame size="sm">
            <EmptyState title="Nothing here" titleAs="h3" data-testid="title-only" />
          </Frame>
        </Row>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Long text wraps and stays centered</span>
        <Row>
          <Frame size="sm">
            <EmptyState
              title="There are no archived conversations in this workspace yet"
              description="Conversations you archive from the inbox appear here, so you can find them again later without cluttering the list."
            />
          </Frame>
        </Row>
      </div>
    </>
  ),
} satisfies Story;
