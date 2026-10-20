import { useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import photo from '../../../playground/assets/chat-photo.svg';
import { ChatBubble, type ChatBubbleProps, type ChatBubbleType, type ChatBubbleWho } from './ChatBubble';

/** Messages as a project would place them: an <ol> in a role="log", so new ones are announced. The gap is the docs' own. */
function Log({ children, label = 'Messages' }: { children: ReactNode; label?: string }) {
  return (
    <div role="log" aria-label={label} style={{ width: '100%', maxWidth: 'var(--chat-navbar-width)' }}>
      <ol style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', listStyle: 'none', margin: 0, padding: 0 }}>
        {children}
      </ol>
    </div>
  );
}

/** A voice message that plays when pressed, so tests/chat-bubble.spec.ts can check the button and its state. */
function VoiceMessage(props: ChatBubbleProps) {
  const [playing, setPlaying] = useState(false);
  return (
    <ChatBubble
      {...props}
      type="audio"
      playing={playing}
      onPlayingChange={setPlaying}
      progress={playing ? 0.5 : 0}
      duration={playing ? '0:14' : '0:28'}
    />
  );
}

const reply = { name: 'Jane Doe', message: 'Replying to this message' };
const types: ChatBubbleType[] = ['text', 'audio', 'image', 'video', 'document'];

/** Figma's example content for each type. */
function example(type: ChatBubbleType, who: ChatBubbleWho, extra: Partial<ChatBubbleProps> = {}) {
  const common: ChatBubbleProps = { who, type, time: '09:41', status: who === 'sender' ? 'sent' : undefined, ...extra };
  switch (type) {
    case 'audio':
      return <ChatBubble key={type} {...common} duration="0:28" />;
    case 'image':
    case 'video':
      return <ChatBubble key={type} {...common} src={photo} alt="" onPlay={type === 'video' ? () => {} : undefined}>I am a chat bubble 🫧</ChatBubble>;
    case 'document':
      return <ChatBubble key={type} {...common} fileType="PDF" fileSize="1 MB">Quarterly report.pdf</ChatBubble>;
    default:
      return <ChatBubble key={type} {...common}>I am a chat bubble 🫧</ChatBubble>;
  }
}

const long =
  'A longer message wraps at chat-bubble/max-width, and the bubble hugs its text below that.\nLine breaks are kept, and so are verylongwordswithoutanyspacesthatwouldotherwiseoverflow.';

export default {
  title: 'Chat bubble',
  description:
    'Chat message bubble. Who: receiver (left, neutral) or sender (right, brand). Type: text, audio, audio-playing (pause icon, bars up to the playhead in the played wave color, elapsed time), image, video, document, typing (the dots lift and brighten in turn, one wave per duration/typing, looping). The bubble hugs its text up to chat-bubble/max-width and wraps; image, video and document bubbles take the full width. Tail and bubble align to the bottom, so the curved tail joins the bubble\'s bottom corner. Bubbles are flat. Replying shows the quoted message. Time and delivery status sit under the bubble. In code each bubble is an li: put them in an ol inside a role="log" element.',
  components: ['ChatBubble'],
  demo: {
    component: 'ChatBubble',
    args: {
      who: 'receiver',
      type: 'text',
      children: 'I am a chat bubble 🫧',
      time: '09:41',
      status: 'seen',
      replying: false,
      playing: false,
      progress: 0.5,
      duration: '0:28',
      fileType: 'PDF',
      fileSize: '1 MB',
    },
    controls: {
      children: { kind: 'text' },
      time: { kind: 'text' },
      duration: { kind: 'text' },
      fileType: { kind: 'text' },
      fileSize: { kind: 'text' },
      replying: { kind: 'boolean' },
      status: { kind: 'select', options: ['none', 'sent', 'delivered', 'seen'] },
      progress: { kind: 'select', options: ['0', '0.25', '0.5', '1'] },
      defaultPlaying: false,
      src: false,
      alt: false,
      href: false,
      typingLabel: false,
      playLabel: false,
      pauseLabel: false,
    },
    render: ({ replying, status, progress, ...args }) => (
      <Log>
        <ChatBubble
          {...(args as ChatBubbleProps)}
          status={status === 'none' ? undefined : status}
          progress={Number(progress)}
          reply={replying ? reply : undefined}
          src={photo}
          alt=""
          onPlay={() => {}}
          onPlayingChange={() => {}}
        />
      </Log>
    ),
    code: ({ replying, status, progress, ...args }) => ({
      ...args,
      status: status === 'none' ? undefined : status,
      progress: args.type === 'audio' ? Number(progress) : undefined,
      reply: replying ? "{{ name: 'Jane Doe', message: 'Replying to this message' }}" : undefined,
      src: args.type === 'image' || args.type === 'video' ? '/photo.jpg' : undefined,
    }),
  },
  render: () => (
    <>
      {(['receiver', 'sender'] as const).map((who) => (
        <div key={who} className="pg-stack">
          <span className="pg-label">{who}: text, audio, image, video, document, typing (the dots lift and brighten in turn)</span>
          <Log label={`${who} types`}>
            {types.map((type) => example(type, who))}
            <ChatBubble who={who} type="typing" typingLabel={who === 'receiver' ? 'Jane is typing' : 'You are typing'} />
          </Log>
        </div>
      ))}

      {(['receiver', 'sender'] as const).map((who) => (
        <div key={who} className="pg-stack">
          <span className="pg-label">{who}, replying: the quoted message on top</span>
          <Log label={`${who} replies`}>{types.map((type) => example(type, who, { reply }))}</Log>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Audio playing: pause icon, played bars up to the playhead, elapsed time</span>
        <Log label="Playing">
          <ChatBubble type="audio" playing progress={0.5} duration="0:14" time="09:41" />
          <ChatBubble who="sender" type="audio" playing progress={0.5} duration="0:14" time="09:41" status="sent" />
        </Log>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Delivery status on sender bubbles: sent, delivered, seen</span>
        <Log label="Statuses">
          <ChatBubble who="sender" time="09:41" status="sent">Sent</ChatBubble>
          <ChatBubble who="sender" time="09:42" status="delivered">Delivered</ChatBubble>
          <ChatBubble who="sender" time="09:43" status="seen">Seen</ChatBubble>
        </Log>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Wrapping: hugs short text, wraps long text at chat-bubble/max-width; long file names end in an ellipsis</span>
        <Log label="Wrapping">
          <ChatBubble time="09:41">Hi</ChatBubble>
          <ChatBubble time="09:41">{long}</ChatBubble>
          <ChatBubble who="sender" time="09:41" status="seen">{long}</ChatBubble>
          <ChatBubble type="document" fileType="PDF" fileSize="12 MB" time="09:41">
            A file name far too long for the bubble it sits in, so it gives way.pdf
          </ChatBubble>
        </Log>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Interactive parts: the play button, a document link, the video play button</span>
        <Log label="Interactive">
          <VoiceMessage time="09:41" data-testid="voice" />
          <ChatBubble who="sender" type="document" href="#/components/chat-bubble" fileType="PDF" fileSize="1 MB" time="09:41" status="delivered">
            Quarterly report.pdf
          </ChatBubble>
        </Log>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); white inside a sender bubble; forced on here to show it</span>
        <div className="pg-focus">
          <Log label="Focused">
            <ChatBubble type="audio" duration="0:28" time="09:41" />
            <ChatBubble who="sender" type="audio" duration="0:28" time="09:41" />
            <ChatBubble who="sender" type="document" href="#/components/chat-bubble" fileType="PDF" fileSize="1 MB" time="09:41">
              Quarterly report.pdf
            </ChatBubble>
          </Log>
        </div>
      </div>
    </>
  ),
} satisfies Story;
