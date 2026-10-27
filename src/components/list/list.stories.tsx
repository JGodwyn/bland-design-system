import { useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { CaretRightIcon, InfoIcon, UserIcon } from '../../icons';
import { Avatar } from '../avatar/Avatar';
import { Badge } from '../badge/Badge';
import { Checkbox } from '../checkbox/Checkbox';
import { Icon } from '../icon/Icon';
import { Toggle } from '../toggle/Toggle';
import { ListItem, type ListItemProps } from './ListItem';

/** A reset list at Figma's list/width, as a project would place rows. The gap is the docs' own, so rows read apart in dark mode. */
function Rows({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        width: 'var(--list-width)',
        maxWidth: '100%',
      }}>
      {children}
    </ul>
  );
}

/** Counts its row's clicks, so tests/list.spec.ts can check keyboard activation and a disabled row. */
function CountedRow({ id, ...props }: { id: string } & Omit<ListItemProps, 'title' | 'onClick'>) {
  const [count, setCount] = useState(0);
  return (
    <ListItem
      {...props}
      data-testid={id}
      title={id}
      onClick={() => setCount((c) => c + 1)}
      trailing={<output data-testid={`${id}-count`}>{count}</output>}
    />
  );
}

const description = 'Description should take the whole space';
const long = 'A description long enough to need more than one line of text in a row at the default list width';

// Option names match the real usage, so the docs code snippet reads like it.
const leadings = {
  none: undefined,
  Avatar: 'avatar',
  Icon: <Icon><UserIcon /></Icon>,
} as const;
const trailings = {
  none: undefined,
  value: 'Value',
  Badge: <Badge emotion="brand">New</Badge>,
  Toggle: <Toggle aria-label="Setting" />,
  Caret: <Icon><CaretRightIcon /></Icon>,
} as const;
const leadingCode = { none: undefined, Avatar: '<Avatar initials="AL" size="lg" />', Icon: '<Icon><UserIcon /></Icon>' } as const;
const trailingCode = {
  none: undefined,
  value: 'Value',
  Badge: '<Badge emotion="brand">New</Badge>',
  Toggle: '<Toggle aria-label="Setting" />',
  Caret: '<Icon><CaretRightIcon /></Icon>',
} as const;

export default {
  title: 'List item',
  description:
    'Row for lists, menus and settings. Lines sets 1, 2 or 3+ lines of text: title (with optional alt text on the right) and description. Flush drops the resting fill and radius so rows sit edge to edge inside a container. Leading slot takes an Avatar, icon or coin (24 on 1 line rows, 40 otherwise); Trailing slot hugs its content, such as a button, toggle or value. Width defaults to list/width; use Fill container in layouts. In code a row with href or onClick is one link or button; a row whose trailing slot holds its own control stays a plain row.',
  components: ['ListItem'],
  demo: {
    component: 'ListItem',
    args: {
      title: 'The Title',
      description,
      lines: '2',
      altText: '',
      flush: false,
      disabled: false,
      row: 'button',
      leading: 'Avatar',
      trailing: 'Caret',
    },
    controls: {
      title: { kind: 'text' },
      description: { kind: 'text' },
      altText: { kind: 'text' },
      disabled: { kind: 'boolean' },
      row: { kind: 'select', options: ['plain', 'button', 'link'] },
      leading: { kind: 'select', options: Object.keys(leadings) },
      trailing: { kind: 'select', options: Object.keys(trailings) },
      href: false,
    },
    render: ({ row, leading, trailing, description: text, altText, ...args }) => {
      const oneLine = !text;
      const lead =
        leading === 'Avatar' ? <Avatar initials="AL" size={oneLine ? 'sm' : 'lg'} /> : leadings[leading as keyof typeof leadings];
      return (
        <Rows>
          <ListItem
            {...(args as ListItemProps)}
            description={text || undefined}
            altText={altText || undefined}
            leading={lead}
            trailing={trailings[trailing as keyof typeof trailings]}
            href={row === 'link' ? '#/components/list' : undefined}
            onClick={row === 'button' ? () => {} : undefined}
          />
        </Rows>
      );
    },
    code: ({ row, leading, trailing, description: text, altText, ...args }) => ({
      ...args,
      description: text || undefined,
      altText: altText || undefined,
      leading: leadingCode[leading as keyof typeof leadingCode],
      trailing: trailingCode[trailing as keyof typeof trailingCode],
      href: row === 'link' ? '/settings' : undefined,
    }),
  },
  render: () => (
    <>
      {[false, true].map((flush) => (
        <div key={String(flush)} className="pg-stack">
          <span className="pg-label">
            {flush ? 'flush: no resting fill, no radius' : 'Default'}: 1 line 32, 2 lines, 3+ lines; rest, then disabled
          </span>
          <Rows>
            <ListItem flush={flush} title="The Title" />
            <ListItem flush={flush} title="The Title" description={description} />
            <ListItem flush={flush} title="The Title" description={long} lines="3+" />
            <ListItem flush={flush} title="The Title" disabled onClick={() => {}} />
            <ListItem flush={flush} title="The Title" description={description} disabled onClick={() => {}} />
            <ListItem flush={flush} title="The Title" description={long} lines="3+" disabled onClick={() => {}} />
          </Rows>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Slots and alt text: leading 24 on 1 line rows, 40 otherwise; trailing hugs its content</span>
        <Rows>
          <ListItem title="Profile" leading={<Icon><UserIcon /></Icon>} trailing={<Icon><CaretRightIcon /></Icon>} />
          <ListItem title="Ada Lovelace" leading={<Avatar initials="AL" size="sm" />} altText="2m" />
          <ListItem
            title="Ada Lovelace"
            description="Sent you the notes from Tuesday"
            altText="09:41"
            leading={<Avatar initials="AL" size="lg" />}
            trailing={<Badge emotion="brand">New</Badge>}
          />
          <ListItem
            title="About this release"
            description={long}
            lines="3+"
            leading={<Icon><InfoIcon /></Icon>}
            trailing="Value"
          />
          <ListItem
            title="An icon in the trailing slot"
            description={long}
            lines="3+"
            leading={<Icon><InfoIcon /></Icon>}
            trailing={<Icon><CaretRightIcon /></Icon>}
            onClick={() => {}}
          />
          <ListItem title="Disabled with slots" description={description} altText="Alt" disabled leading={<Icon><UserIcon /></Icon>} trailing="Value" />
        </Rows>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Plain rows with their own control in the trailing slot (not a button, so controls never nest)</span>
        <Rows label="Settings">
          <ListItem title="Notifications" description="Push and email" trailing={<Toggle aria-label="Notifications" defaultChecked />} />
          <ListItem title="Sounds" trailing={<Toggle aria-label="Sounds" />} />
          <ListItem title="Keep me signed in" trailing={<Checkbox aria-label="Keep me signed in" defaultChecked />} />
        </Rows>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Button and link rows: hover and pressed fills, focusable</span>
        <Rows label="Actions">
          <CountedRow id="Counter" description="A button row" />
          <CountedRow id="Disabled counter" disabled />
          <ListItem title="Account" description="A link row" href="#/components/list" trailing={<Icon><CaretRightIcon /></Icon>} />
          <ListItem title="Billing" href="#/components/list" disabled trailing={<Icon><CaretRightIcon /></Icon>} />
          <CountedRow id="Flush counter" flush />
        </Rows>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-stack pg-focus">
          <Rows>
            <ListItem title="Default row" description={description} onClick={() => {}} />
          </Rows>
          <Rows>
            <ListItem title="Flush row" flush onClick={() => {}} />
          </Rows>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Text that does not fit ends in an ellipsis: the title always, the description on 2 line rows</span>
        <Rows>
          <ListItem title="A title far too long for the row it sits in, so it gives way" altText="Yesterday" />
          <ListItem title="A title far too long for the row it sits in, so it gives way" description={long} />
          <ListItem title="A title far too long for the row it sits in, so it gives way" description={long} lines="3+" />
        </Rows>
      </div>
    </>
  ),
} satisfies Story;
