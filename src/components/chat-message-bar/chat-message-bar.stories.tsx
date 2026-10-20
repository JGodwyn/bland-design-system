import { useEffect, useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { ChatMessageBar, type ChatMessageBarProps } from './ChatMessageBar';

/** Figma's message-bar/width frame: a fixed width (the width a wrapping message takes), shrinking only on narrow screens. */
function Frame({ children }: { children: ReactNode }) {
  return <div style={{ width: 'var(--message-bar-width)', maxWidth: '100%' }}>{children}</div>;
}

/** m:ss for a count of seconds. */
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * The playground's bar works like the real thing: record switches to the recording state with a running timer, delete
 * or send ends it, and the reply's close button closes the reply. The replying and recording controls set where it starts.
 */
function DemoBar({ replying, recording: startRecording, ...args }: ChatMessageBarProps & { replying: boolean }) {
  const [replyOpen, setReplyOpen] = useState(replying);
  const [recording, setRecording] = useState(!!startRecording);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    const id = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);
  return (
    <ChatMessageBar
      {...args}
      {...tools}
      reply={replyOpen ? reply : undefined}
      onReplyClose={() => setReplyOpen(false)}
      onRecordStart={() => setRecording(true)}
      recording={recording}
      recordingTime={clock(seconds)}
      onRecordCancel={() => setRecording(false)}
      onRecordSend={() => setRecording(false)}
    />
  );
}

const reply = { name: 'Jane Doe', message: 'Replying to this message' };
const tools = { onEmoji: () => {}, onSticker: () => {}, onAttach: () => {}, onRecordStart: () => {} };

/** A working composer: sends into a list, records, replies. tests/chat-message-bar.spec.ts drives it. */
function Composer() {
  const [sent, setSent] = useState<string[]>([]);
  const [replying, setReplying] = useState(true);
  const [recording, setRecording] = useState(false);
  return (
    <div className="pg-stack">
      <Frame>
        <ChatMessageBar
          data-testid="composer"
          {...tools}
          reply={replying ? reply : undefined}
          onReplyClose={() => setReplying(false)}
          onSend={(text) => setSent((s) => [...s, text])}
          onRecordStart={() => setRecording(true)}
          recording={recording}
          recordingTime="0:03"
          onRecordCancel={() => setRecording(false)}
          onRecordSend={() => {
            setRecording(false);
            setSent((s) => [...s, '(voice message)']);
          }}
        />
      </Frame>
      <ol data-testid="sent" aria-label="Sent">
        {sent.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ol>
    </div>
  );
}

export default {
  title: 'Chat message bar',
  description:
    'Composer at the bottom of a chat. State: rest (empty, the send button shows a microphone), filled (send), recording-audio (delete, label and a timer Chip). Replying shows the quoted message above the field, with a close button. The focus ring is the 2px ring on the field. Width message-bar/width; use Fill container in layouts. In code a textarea with a label and icon buttons with aria-labels; the send button switches to record while the field is empty. Enter sends, Shift+Enter starts a new line.',
  components: ['ChatMessageBar'],
  demo: {
    component: 'ChatMessageBar',
    args: { defaultValue: '', replying: true, recording: false, disabled: false },
    controls: {
      defaultValue: false,
      value: false,
      recordingTime: false,
      placeholder: { kind: 'text' },
      replying: { kind: 'boolean' },
    },
    render: ({ replying, recording, ...args }) => (
      <Frame>
        {/* A new key when a control changes, so the bar starts again from the controls. */}
        <DemoBar key={`${replying}-${recording}`} {...(args as ChatMessageBarProps)} replying={replying} recording={recording} />
      </Frame>
    ),
    code: ({ replying, recording, ...args }) => ({
      ...args,
      onSend: '{send}',
      onEmoji: '{openEmoji}',
      onSticker: '{openStickers}',
      onAttach: '{attach}',
      onRecordStart: '{startRecording}',
      reply: replying ? "{{ name: 'Jane Doe', message: 'Replying to this message' }}" : undefined,
      onReplyClose: replying ? '{cancelReply}' : undefined,
      recording: recording || undefined,
      recordingTime: recording ? '{recordingTime}' : undefined,
      onRecordCancel: recording ? '{deleteRecording}' : undefined,
      onRecordSend: recording ? '{sendRecording}' : undefined,
    }),
  },
  render: () => (
    <>
      {[false, true].map((replying) => (
        <div key={String(replying)} className="pg-stack">
          <span className="pg-label">{replying ? 'Replying: ' : ''}rest (record), filled (send), recording-audio</span>
          <Frame>
            <div className="pg-stack">
              <ChatMessageBar {...tools} reply={replying ? reply : undefined} onReplyClose={() => {}} />
              <ChatMessageBar {...tools} defaultValue="Hello" reply={replying ? reply : undefined} onReplyClose={() => {}} />
              <ChatMessageBar
                {...tools}
                recording
                recordingTime="1:00"
                onRecordCancel={() => {}}
                onRecordSend={() => {}}
                reply={replying ? reply : undefined}
                onReplyClose={() => {}}
              />
            </div>
          </Frame>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Long text grows the field; a long reply ends in an ellipsis; without onRecordStart send stays (disabled while empty)</span>
        <Frame>
          <div className="pg-stack">
            <ChatMessageBar
              {...tools}
              defaultValue={'A longer message that wraps onto a second line\nand a third after a line break'}
              reply={{ name: 'A name far too long for the panel it sits in', message: 'A quoted message far too long for the panel it sits in' }}
              onReplyClose={() => {}}
            />
            <ChatMessageBar onAttach={() => {}} />
          </div>
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Disabled</span>
        <Frame>
          <ChatMessageBar {...tools} disabled />
        </Frame>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Working: type and press Enter, record, cancel the reply</span>
        <Composer />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the buttons' rings, forced on here to show them; the field shows the same ring while its text field has focus</span>
        <div className="pg-focus">
          <Frame>
            <ChatMessageBar {...tools} reply={reply} onReplyClose={() => {}} />
          </Frame>
        </div>
      </div>
    </>
  ),
} satisfies Story;
