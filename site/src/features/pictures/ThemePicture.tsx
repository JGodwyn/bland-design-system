// "Light and dark, built in": one component (Stageshow bento kind), a Notification drawn twice, light under and
// dark over, the dark copy clipped to the right of a dividing line (nested data-theme, Bland's real switch, so the
// dark half is Bland's own dark mode, not a filter). On a loop the line sweeps left, holds, sweeps back and holds.
// It is a real slider too (Godwin 2026-11-08): drag anywhere on the picture, or focus the grip and use the arrow
// keys, Home and End. The round grip on the line rides up and down it to the pointer's height (with a mouse, as
// it moves over the picture; on touch, where you touch) and grows while you drag, back to its size on release
// (Godwin 2026-11-09). What you set holds until the story's next move (the loop pauses while you are on the card).
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { Button, Icon, Notification, CaretLeftIcon, CaretRightIcon } from '../../../../src';
import { useLoop } from '../playback';
import { TRAVEL_MS } from '../timing';
import type { PictureProps } from '../cards';

/** Where the line sits, as a fraction of the picture's width, at each step of the loop. */
const SPLITS = [0.82, 0.3, 0.7];
const HOLD = [700, TRAVEL_MS + 2400, TRAVEL_MS + 2400];
const POSTER = 1;
/** The line never goes right to an edge, so the grip stays whole. */
const MIN = 0.06;
const MAX = 0.94;
/** One arrow key press. */
const STEP = 0.05;

const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));
const hoverQuery = '(hover: hover) and (pointer: fine)';
/** How far up and down the line the grip can ride, as fractions of the picture's height (it stays whole). */
const GRIP_MIN = 0.08;
const GRIP_MAX = 0.92;
/** Where the grip rests on the line when no pointer leads it (Figma's 84% of the height). */
const GRIP_REST = 0.84;
/** The grip follows its target with this much inertia, a time constant (Godwin 2026-11-09: it snapped). */
const GRIP_SMOOTHING_MS = 110;

function Scene() {
  return (
    <div className="theme-pic__scene">
      <Notification
        className="theme-pic__card"
        colored={false}
        icon={false}
        title="Mira commented"
        timestamp="2m"
        actions={
          <Button emotion="brand" type="primary" size="sm">
            Reply
          </Button>
        }
      >
        Love the new header.
      </Notification>
    </div>
  );
}

export function ThemePicture({ active, reduced }: PictureProps) {
  const step = useLoop(active, reduced, HOLD, 1, POSTER);
  // A split the person set, kept until the loop takes its next step.
  const [mine, setMine] = useState<{ value: number; step: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const split = mine && mine.step === step ? mine.value : (SPLITS[step] ?? SPLITS[0]!);

  // The grip's height on the line, a fraction of the picture's. Its target is the pointer's height (or its rest);
  // every frame it covers part of the way there, so it glides with the pointer instead of jumping to each new
  // point a pointer event reports. Set straight on the element (no React render per frame).
  const grip = useRef({ target: GRIP_REST, now: GRIP_REST, raf: 0, last: 0 });
  const gripTarget = (y: number) => {
    const g = grip.current;
    g.target = y;
    if (g.raf) return;
    g.last = performance.now();
    const frame = (t: number) => {
      const el = root.current;
      const tau = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : GRIP_SMOOTHING_MS;
      const dt = Math.min(t - g.last, 100);
      g.last = t;
      g.now = tau <= 0 ? g.target : g.now + (g.target - g.now) * (1 - Math.exp(-dt / tau));
      if (Math.abs(g.target - g.now) < 0.0005) g.now = g.target;
      el?.style.setProperty('--grip-y', g.now.toFixed(4));
      g.raf = g.now !== g.target ? requestAnimationFrame(frame) : 0;
    };
    g.raf = requestAnimationFrame(frame);
  };
  useEffect(() => () => cancelAnimationFrame(grip.current.raf), []);
  const gripTo = (e: PointerEvent<HTMLDivElement>) => {
    const r = root.current?.getBoundingClientRect();
    if (!r) return;
    gripTarget(Math.min(GRIP_MAX, Math.max(GRIP_MIN, (e.clientY - r.top) / r.height)));
  };
  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = root.current?.getBoundingClientRect();
    if (!r) return;
    setMine({ value: clamp((e.clientX - r.left) / r.width), step });
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    fromPointer(e);
    gripTo(e);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) fromPointer(e);
    // A drag carries the grip on any pointer; a mouse also leads it just by moving over the picture.
    if (dragging || (e.pointerType === 'mouse' && window.matchMedia(hoverQuery).matches)) gripTo(e);
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging && e.pointerType === 'mouse') gripTarget(GRIP_REST);
  };
  const onPointerUp = () => setDragging(false);
  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    const keys: Record<string, number> = {
      ArrowLeft: split - STEP,
      ArrowDown: split - STEP,
      ArrowRight: split + STEP,
      ArrowUp: split + STEP,
      Home: MIN,
      End: MAX,
    };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    setMine({ value: clamp(to), step });
  };
  // The slider's value is how much of the card is dark: the part right of the line.
  const dark = Math.round((1 - split) * 100);

  return (
    <div
      ref={root}
      className="theme-pic"
      data-step={step}
      data-dragging={dragging || undefined}
      style={{ '--split': split } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <div className="theme-pic__layer" data-theme="light" aria-hidden inert>
        <Scene />
      </div>
      <div className="theme-pic__layer theme-pic__layer--dark" data-theme="dark" aria-hidden inert>
        <Scene />
      </div>
      <div className="theme-pic__line">
        <span
          className="theme-pic__grip bland-focus-ring"
          role="slider"
          tabIndex={0}
          aria-label="Dark part of the card"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={dark}
          aria-valuetext={`${dark}% dark`}
          onKeyDown={onKeyDown}
        >
          <Icon size="xs">
            <CaretLeftIcon />
          </Icon>
          <Icon size="xs">
            <CaretRightIcon />
          </Icon>
        </span>
      </div>
    </div>
  );
}
