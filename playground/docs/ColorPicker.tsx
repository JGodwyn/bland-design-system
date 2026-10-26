// The Brand theme page's color picker (Figma 6773:22102): a saturation and brightness area, a hue slider and the
// hex, in one panel. Docs site only. The gradients are the color space itself, so they are computed, not tokens.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { KnobMark } from './icons';

type Hsv = { h: number; s: number; v: number };

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const isHex = (s: string) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());

function toHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return `#${[f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`;
}

function toHsv(hex: string): Hsv {
  let t = hex.trim().replace('#', '');
  if (t.length === 3) t = [...t].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(t.slice(i, i + 2), 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : d / max, v: max };
}

/** Normalises a typed or picked hex to lowercase #rrggbb. */
export const normalHex = (s: string) => toHex(toHsv(s));

export function ColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  // The hue lives here too: a gray or black has none of its own, and the slider should not jump to red.
  const [hsv, setHsv] = useState(() => toHsv(value));
  const [text, setText] = useState(value);
  const area = useRef<HTMLDivElement>(null);
  // Focus starts on the area when the picker opens (React's autoFocus only reaches form controls).
  useEffect(() => area.current?.focus({ preventScroll: true }), []);
  useEffect(() => {
    if (toHex(hsv) !== normalHex(value)) setHsv(toHsv(value));
    setText(value);
  }, [value]);

  const set = (next: Hsv) => {
    setHsv(next);
    onChange(toHex(next));
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    set({ ...hsv, s: clamp((e.clientX - r.left) / r.width), v: clamp(1 - (e.clientY - r.top) / r.height) });
  };
  const onAreaKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.01;
    const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const m = move[e.key];
    if (!m) return;
    e.preventDefault();
    set({ ...hsv, s: clamp(hsv.s + m[0]), v: clamp(hsv.v + m[1]) });
  };

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const hue = `hsl(${hsv.h} 100% 50%)`;
  return (
    <div className="docs-picker bland-smooth">
      <div
        className="docs-picker-area bland-smooth bland-focus-ring"
        style={{ backgroundColor: hue }}
        role="slider"
        ref={area}
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s * 100)}
        aria-valuetext={`Saturation ${pct(hsv.s)}, brightness ${pct(hsv.v)}`}
        onKeyDown={onAreaKey}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e)}
      >
        <KnobMark className="docs-picker-knob" style={{ left: pct(hsv.s), top: pct(1 - hsv.v) }} />
      </div>
      <input
        type="range"
        className="docs-picker-hue"
        aria-label="Hue"
        min={0}
        max={359}
        value={Math.round(hsv.h)}
        style={{ color: hue }}
        onChange={(e) => set({ ...hsv, h: Number(e.target.value) })}
      />
      <div className="docs-picker-field bland-smooth">
        <input
          aria-label="Hex color"
          value={text}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setText(e.target.value);
            if (isHex(e.target.value)) onChange(normalHex(e.target.value));
          }}
          onBlur={() => setText(value)}
        />
        <span className="docs-picker-swatch" style={{ background: value }} aria-hidden="true" />
      </div>
    </div>
  );
}
