import { useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import portrait from '../../../playground/assets/avatar-portrait.jpg';
import { Avatar } from '../avatar/Avatar';
import { ChatListItem, type ChatListItemProps } from './ChatListItem';

/** A reset list at Figma's chat-list-item/width, as a project would place rows. Rows touch, as in Figma. */
function Chats({ children, label = 'Chats' }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} style={{ listStyle: 'none', margin: 0, padding: 0, width: 'var(--chat-list-item-width)', maxWidth: '100%' }}>
      {children}
    </ul>
  );
}

/** Rows that open their chat when pressed, so tests/chat-list-item.spec.ts can check aria-current moving. */
function OpenableChats() {
  const [open, setOpen] = useState('jane');
  const row = (id: string, name: string, initials: string, message: string) => (
    <ChatListItem
      name={name}
      date="09:41"
      message={message}
      avatar={<Avatar size="lg" initials={initials} />}
      current={open === id}
      onClick={() => setOpen(id)}
    />
  );
  return (
    <Chats label="Openable chats">
      {row('jane', 'Jane Doe', 'JD', 'See you tomorrow')}
      {row('ada', 'Ada Lovelace', 'AL', 'The notes are in the doc')}
    </Chats>
  );
}

const avatar = <Avatar size="lg" src={portrait} />;
const long = 'A last message far too long for the row it sits in, so it ends in an ellipsis';

export default {
  title: 'Chat list item',
  description:
    'A row in a list of conversations, with the other person\'s avatar, name, last message and date. Pressing it opens the chat.',
  usage: [
    'Give it `href` (a link) or `onClick` (a button), and set `current` on the open chat.',
    '`type="receiver"` when the last message came from the other person (it can show `unread`); `sender` when it came from you (it shows the delivery `status`).',
    'Put rows in a `<ul>`. They sit edge to edge, so the focus ring is drawn inside the row.',
  ],
  components: ['ChatListItem'],
  demo: {
    component: 'ChatListItem',
    args: {
      name: 'Jane Doe',
      date: '09:41',
      message: 'Here is a brief message',
      type: 'receiver',
      unread: true,
      status: 'delivered',
      current: false,
      row: 'button',
    },
    controls: {
      name: { kind: 'text' },
      date: { kind: 'text' },
      message: { kind: 'text' },
      row: { kind: 'select', options: ['plain', 'button', 'link'] },
      href: false,
      unreadLabel: false,
    },
    render: ({ row, ...args }) => (
      <Chats>
        <ChatListItem
          {...(args as ChatListItemProps)}
          avatar={avatar}
          href={row === 'link' ? '#/components/chat-list-item' : undefined}
          onClick={row === 'button' ? () => {} : undefined}
        />
      </Chats>
    ),
    code: ({ row, ...args }) => ({
      ...args,
      avatar: '<Avatar size="lg" src="/jane.jpg" />',
      href: row === 'link' ? '/chats/jane' : undefined,
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>receiver</code>: <code>unread</code>, read; <code>sender</code>: <code>sent</code>, <code>delivered</code>, <code>seen</code></span>
        <Chats label="Types">
          <ChatListItem name="Jane Doe" date="09:41" message="Here is a brief message" unread avatar={avatar} onClick={() => {}} />
          <ChatListItem name="Ada Lovelace" date="Yesterday" message="Here is a brief message" avatar={<Avatar size="lg" initials="AL" />} onClick={() => {}} />
          <ChatListItem type="sender" status="sent" name="Grace Hopper" date="Mon" message="Here is a brief message" avatar={<Avatar size="lg" initials="GH" />} onClick={() => {}} />
          <ChatListItem type="sender" status="delivered" name="Alan Turing" date="Sun" message="Here is a brief message" avatar={<Avatar size="lg" />} onClick={() => {}} />
          <ChatListItem type="sender" status="seen" name="Jane Doe" date="88/88/8888" message="Here is a brief message" avatar={avatar} onClick={() => {}} />
        </Chats>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>current</code>: the open chat, <code>receiver</code> and <code>sender</code></span>
        <Chats label="Selected">
          <ChatListItem current name="Jane Doe" date="09:41" message="Here is a brief message" unread avatar={avatar} onClick={() => {}} />
          <ChatListItem current type="sender" status="seen" name="Ada Lovelace" date="Yesterday" message="Here is a brief message" avatar={<Avatar size="lg" initials="AL" />} onClick={() => {}} />
        </Chats>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Name and message end in an ellipsis; the date never truncates</span>
        <Chats label="Truncation">
          <ChatListItem name="A group name far too long for the row it sits in" date="Yesterday" message={long} unread avatar={avatar} />
          <ChatListItem type="sender" status="seen" name="Jane Doe" date="09:41" message={long} avatar={avatar} />
        </Chats>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: press a row to make it the open chat</span>
        <OpenableChats />
        <Chats label="Links">
          <ChatListItem name="Jane Doe" date="09:41" message="A link row" href="#/components/chat-list-item" avatar={avatar} />
        </Chats>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring is drawn inside the row (turned on here to show it)</span>
        <div className="pg-focus">
          <Chats label="Focused">
            <ChatListItem name="Jane Doe" date="09:41" message="Here is a brief message" unread avatar={avatar} onClick={() => {}} />
          </Chats>
        </div>
      </div>
    </>
  ),
} satisfies Story;
