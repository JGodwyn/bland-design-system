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
    'Header of an open chat: Back (a ghost Icon Button with CaretLeft, for mobile; turn it off on desktop), avatar, name and status line, then ghost Icon Buttons for search, voice call, video call, more and close, each on its own boolean. Width chat-navbar/width; use Fill container in layouts. The bottom divider is a row divider. In code a header with an h2 for the name; each button shows when its handler is given and has an aria-label.',
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
        <span className="pg-label">Every button (mobile, with Back)</span>
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
        <span className="pg-label">Buttons: More opens a Menu</span>
        <Pressed />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <Frame>
            <ChatNavbar name="Jane Doe" description="Online" avatar={<Avatar size="md" src={portrait} />} onBack={() => {}} onClose={() => {}} />
          </Frame>
        </div>
      </div>
    </>
  ),
} satisfies Story;
