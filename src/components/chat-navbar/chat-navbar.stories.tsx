import { useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import portrait from '../../../playground/assets/avatar-portrait.jpg';
import { Avatar } from '../avatar/Avatar';
import { ChatNavbar, type ChatNavbarProps } from './ChatNavbar';

/** Figma's chat-navbar/width frame, shrinking on narrow screens. */
function Frame({ children }: { children: ReactNode }) {
  return <div style={{ width: '100%', maxWidth: 'var(--chat-navbar-width)' }}>{children}</div>;
}

/** Records which button was pressed last, so tests/chat-navbar.spec.ts can check each one. */
function Pressed() {
  const [last, setLast] = useState('none');
  const press = (name: string) => () => setLast(name);
  return (
    <div className="pg-stack">
      <Frame>
        <ChatNavbar
          name="Jane Doe"
          description="Online"
          avatar={<Avatar size="md" src={portrait} />}
          onBack={press('back')}
          onSearch={press('search')}
          onVoiceCall={press('voice')}
          onVideoCall={press('video')}
          onClose={press('close')}
          moreItems={[
            { id: 'mute', label: 'Mute' },
            { id: 'block', label: 'Block', danger: true },
          ]}
          onMoreAction={(id) => setLast(id)}
          data-testid="pressed"
        />
      </Frame>
      <output data-testid="pressed-last">{last}</output>
    </div>
  );
}

const all = { onBack: () => {}, onSearch: () => {}, onVoiceCall: () => {}, onVideoCall: () => {}, onMore: () => {}, onClose: () => {} };

export default {
  title: 'Chat navbar',
  description:
    'The header of an open chat: the other person\'s avatar, name and status, with buttons for the chat\'s actions.',
  usage: [
    'Each button shows when you pass its handler: `onBack`, `onSearch`, `onVoiceCall`, `onVideoCall`, `onMore`, `onClose`.',
    'Show Back on mobile, where the chat replaces the list. Leave it out on desktop.',
    'Pass `moreItems` and `onMoreAction` to make More open a menu.',
    'The name is an `h2` by default; change it with `nameAs` to fit the page\'s headings.',
  ],
  components: ['ChatNavbar'],
  demo: {
    component: 'ChatNavbar',
    args: { name: 'Jane Doe', description: 'Online', back: true, search: true, voiceCall: true, videoCall: true, more: true, close: true },
    controls: {
      name: { kind: 'text' },
      description: { kind: 'text' },
      back: { kind: 'boolean' },
      search: { kind: 'boolean' },
      voiceCall: { kind: 'boolean' },
      videoCall: { kind: 'boolean' },
      more: { kind: 'boolean' },
      close: { kind: 'boolean' },
      nameAs: false,
      morePlacement: false,
    },
    render: ({ back, search, voiceCall, videoCall, more, close, ...args }) => (
      <Frame>
        <ChatNavbar
          {...(args as ChatNavbarProps)}
          avatar={<Avatar size="md" src={portrait} />}
          onBack={back ? () => {} : undefined}
          onSearch={search ? () => {} : undefined}
          onVoiceCall={voiceCall ? () => {} : undefined}
          onVideoCall={videoCall ? () => {} : undefined}
          onMore={more ? () => {} : undefined}
          onClose={close ? () => {} : undefined}
        />
      </Frame>
    ),
    code: ({ back, search, voiceCall, videoCall, more, close, ...args }) => ({
      ...args,
      avatar: '<Avatar size="md" src="/jane.jpg" />',
      onBack: back ? '{goBack}' : undefined,
      onSearch: search ? '{openSearch}' : undefined,
      onVoiceCall: voiceCall ? '{call}' : undefined,
      onVideoCall: videoCall ? '{videoCall}' : undefined,
      onMore: more ? '{openMenu}' : undefined,
      onClose: close ? '{closeChat}' : undefined,
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Every button, with Back for mobile</span>
        <Frame>
          <ChatNavbar name="Jane Doe" description="Online" avatar={<Avatar size="md" src={portrait} />} {...all} />
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Desktop: no Back, a few actions</span>
        <Frame>
          <ChatNavbar name="Ada Lovelace" description="Last seen 09:41" avatar={<Avatar size="md" initials="AL" />} onSearch={() => {}} onMore={() => {}} />
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Name only: no status line, no actions</span>
        <Frame>
          <ChatNavbar name="Design team" avatar={<Avatar size="md" />} />
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Name and status end in an ellipsis</span>
        <Frame>
          <ChatNavbar
            name="A group name far too long for the header it sits in"
            description="Jane, Ada, Grace, Alan and twelve others are in this group"
            avatar={<Avatar size="md" />}
            {...all}
          />
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: More opens a menu (<code>moreItems</code>)</span>
        <Pressed />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <Frame>
            <ChatNavbar name="Jane Doe" description="Online" avatar={<Avatar size="md" src={portrait} />} onBack={() => {}} onClose={() => {}} />
          </Frame>
        </div>
      </div>
    </>
  ),
} satisfies Story;
