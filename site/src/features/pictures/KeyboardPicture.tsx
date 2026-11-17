// "Keyboard, screen reader tested": a small sign-in form, a keycap and a screen reader's caption (the panel
// VoiceOver shows with its caption on), as Figma 7249:44005 (2026-11-11): tabs over the form, a dot beside the
// control that has focus. On a loop: focus on the tabs; Tab to Email, to the checkbox; Space ticks it; Tab to the
// button; Shift+Tab back; Space clears it; Shift+Tab back to Email and the tabs. Each key goes down on the keycap, then the
// focus ring jumps (keyboard moves are never animated) and the caption reads what is focused. The scripted ring is
// Bland's focus ring (stroke-lg border-focused, 2px out) drawn as its own layer, since the script moves no real
// focus.
//
// The form is real too (Godwin 2026-11-08): Tab into it and the loop pauses, Bland's own focus ring shows, the
// keycap presses with your keys and the caption reads what you focus. Typing and ticking work; Sign in does nothing.
// The caption is aria-hidden: a screen reader reads the controls themselves.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Button, Checkbox, SectionTabs, TextInput } from '../../../../src';
import { useLoop } from '../playback';
import { Roll } from '../Roll';
import type { PictureProps } from '../cards';

type Key = 'tab' | 'shift tab' | 'space';
/** One frame of the loop: what has focus, what the keycap shows and whether it is down, the checkbox. */
// The stops (Figma 7249:44005, 2026-11-11): 0 the tabs, 1 the field, 2 the checkbox, 3 the button.
type Frame = { stop: 0 | 1 | 2 | 3; key: Key; down?: true; ticked?: true; hold: number };

const PRESS = 140;
const FRAMES: Frame[] = [
  { stop: 0, key: 'tab', hold: 1300 },
  { stop: 0, key: 'tab', down: true, hold: PRESS },
  { stop: 1, key: 'tab', hold: 1000 },
  { stop: 1, key: 'tab', down: true, hold: PRESS },
  { stop: 2, key: 'tab', hold: 1000 },
  { stop: 2, key: 'space', down: true, hold: PRESS },
  { stop: 2, key: 'space', ticked: true, hold: 1000 },
  { stop: 2, key: 'tab', down: true, ticked: true, hold: PRESS },
  { stop: 3, key: 'tab', ticked: true, hold: 1600 },
  { stop: 3, key: 'shift tab', down: true, ticked: true, hold: PRESS },
  { stop: 2, key: 'shift tab', ticked: true, hold: 900 },
  { stop: 2, key: 'space', down: true, ticked: true, hold: PRESS },
  { stop: 2, key: 'space', hold: 900 },
  { stop: 2, key: 'shift tab', down: true, hold: PRESS },
  { stop: 1, key: 'shift tab', hold: 900 },
  { stop: 1, key: 'shift tab', down: true, hold: PRESS },
];
/** The loop runs 30% slower than the other cards (Godwin 2026-11-16: it went too fast). */
const PACE = 1 / 0.7;
const HOLD = FRAMES.map((f) => Math.round(f.hold * PACE));
/** The poster: the button focused, the box ticked. */
const POSTER = 8;
const TABS = [
  { id: 'signup', label: 'Sign up' },
  { id: 'login', label: 'Login' },
  { id: 'others', label: 'Others' },
];
const KEY_LABEL: Record<Key, string> = { tab: 'tab ⇥', 'shift tab': 'shift ⇧ tab ⇥', space: 'space' };

// Short enough to fit the caption on a phone (Godwin 2026-11-16: it truncated): name, then role or state.
const caption = (stop: number, ticked: boolean) =>
  stop === 0
    ? 'Sign up, tab 1 of 3'
    : stop === 1
      ? 'Email, text field'
      : stop === 2
        ? `Remember me, ${ticked ? 'checked' : 'unchecked'}`
        : 'Sign in, button';

type Box = { x: number; y: number; w: number; h: number };

export function KeyboardPicture({ active, reduced, engaged }: PictureProps) {
  const step = useLoop(active, reduced, HOLD, 0, POSTER);
  const frame = FRAMES[step] ?? FRAMES[0]!;

  // The person's own focus and checkbox, while they use the form; cleared once they leave the card.
  const [focusStop, setFocusStop] = useState<number | null>(null);
  const [ownTick, setOwnTick] = useState<boolean | null>(null);
  const [ownKey, setOwnKey] = useState<{ key: Key; down: boolean } | null>(null);
  useEffect(() => {
    if (!engaged) {
      setOwnTick(null);
      setOwnKey(null);
    }
  }, [engaged]);

  const stop = focusStop ?? frame.stop;
  const ticked = ownTick ?? !!frame.ticked;
  const key = ownKey ?? { key: frame.key, down: !!frame.down };

  const root = useRef<HTMLDivElement>(null);
  const targets = useRef<(HTMLElement | null)[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  useLayoutEffect(() => {
    const measure = () => {
      const el0 = root.current;
      const r = el0?.getBoundingClientRect();
      if (!el0 || !r) return;
      // In the feature row the card is scaled: measure in the picture's own (unscaled) pixels.
      const k = el0.offsetWidth ? r.width / el0.offsetWidth : 1;
      setBoxes(
        targets.current.map((el) => {
          const b = el?.getBoundingClientRect();
          return b
            ? { x: (b.left - r.left) / k, y: (b.top - r.top) / k, w: b.width / k, h: b.height / k }
            : { x: 0, y: 0, w: 0, h: 0 };
        }),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const box = boxes[stop];

  const keyOf = (e: KeyboardEvent): Key | null =>
    e.key === 'Tab' ? (e.shiftKey ? 'shift tab' : 'tab') : e.key === ' ' ? 'space' : null;
  const onKeyDown = (e: KeyboardEvent) => {
    const k = keyOf(e);
    if (k) setOwnKey({ key: k, down: true });
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = keyOf(e);
    if (k) setOwnKey({ key: k, down: false });
  };
  const at = (i: number) => ({
    ref: (el: HTMLDivElement | null) => {
      const sel = ['[role="tab"][aria-selected="true"]', '.bland-text-input__field', '.bland-checkbox__input', '.bland-button'][i]!;
      targets.current[i] = el?.querySelector<HTMLElement>(sel) ?? el;
    },
    onFocus: () => setFocusStop(i),
    onBlur: () => setFocusStop(null),
  });

  return (
    <div
      ref={root}
      className="keyboard-pic"
      data-step={step}
      data-own-focus={focusStop !== null || undefined}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      <form className="keyboard-pic__form bland-smooth" aria-label="Sign in, a keyboard demo" onSubmit={(e) => e.preventDefault()}>
        <div {...at(0)}>
          <SectionTabs size="sm" aria-label="Account" items={TABS} defaultValue="signup" />
        </div>
        <div {...at(1)}>
          <TextInput size="sm" label="Email" type="email" placeholder="you@studio.com" autoComplete="off" />
        </div>
        <div {...at(2)}>
          <Checkbox checked={ticked} onCheckedChange={(c) => setOwnTick(c === true)}>
            Remember me
          </Checkbox>
        </div>
        <div {...at(3)}>
          <Button emotion="brand" type="primary" size="sm">
            Sign in
          </Button>
        </div>
      </form>
      {box && (
        // Figma's indicator for the control with focus: a dot to the left of the form, level with it.
        <span className="keyboard-pic__dot" aria-hidden style={{ '--y': `${box.y + box.h / 2}px` } as CSSProperties} />
      )}
      {box && (
        <span
          className="keyboard-pic__ring"
          data-stop={stop}
          aria-hidden
          style={{ '--x': `${box.x}px`, '--y': `${box.y}px`, '--w': `${box.w}px`, '--h': `${box.h}px` } as CSSProperties}
        />
      )}
      <div className="keyboard-pic__bar" aria-hidden>
        <span className="keyboard-pic__key bland-smooth" data-pressed={key.down || undefined}>
          <Roll value={KEY_LABEL[key.key]} fit />
        </span>
        <span className="keyboard-pic__caption bland-smooth">
          <Roll value={caption(stop, ticked)} className="keyboard-pic__caption-text" fit />
        </span>
      </div>
    </div>
  );
}
