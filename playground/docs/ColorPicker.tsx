// The Brand theme page's color picker (Figma 6773:22102): a saturation and brightness area, a hue slider and the
// hex, in one panel. Docs site only. The gradients are the color space itself, so they are computed, not tokens.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Icon } from '../../src/components/icon/Icon';
import { Menu } from '../../src/components/menu/Menu';
import { CaretDownIcon } from '../../src/icons';
import { channelsOf, CHANNELS, clamp, FORMAT_KEY, FORMATS, formatColor, fromChannels, normalHex, parseColor, toHex, toHsv, type ColorFormat, type Hsv } from './colorFormats';
import { KnobMark } from './icons';

function savedFormat(): ColorFormat {
  try {
    const f = localStorage.getItem(FORMAT_KEY);
    return FORMATS.some((x) => x.id === f) ? (f as ColorFormat) : 'hex';
  } catch {
    return 'hex';
  }
}

export function ColorPicker({ value, onChange, onDraggingChange }: { value: string; onChange: (hex: string) => void; onDraggingChange?: (dragging: boolean) => void }) {
  // The hue lives here too: a gray or black has none of its own, and the slider should not jump to red.
  const [hsv, setHsv] = useState(() => toHsv(value));
  // The field's format, kept for the next visit (a per-viewer convenience).
  const [format, setFormatState] = useState(savedFormat);
  const [text, setText] = useState(() => formatColor(value, format));
  const setFormat = (f: ColorFormat) => {
    setFormatState(f);
    setText(formatColor(value, f));
    try {
      localStorage.setItem(FORMAT_KEY, f);
    } catch {
      /* Not kept: it starts at HEX next time. */
    }
  };
  const area = useRef<HTMLDivElement>(null);
  // Focus starts on the area when the picker opens (React's autoFocus only reaches form controls).
  useEffect(() => area.current?.focus({ preventScroll: true }), []);
  useEffect(() => {
    if (toHex(hsv) !== normalHex(value)) setHsv(toHsv(value));
    // Keep what is being typed while it reads as this color (so "0.7 0.2 40" isn't reflowed mid-edit).
    setText((t) => (parseColor(t, format) === normalHex(value) ? t : formatColor(value, format)));
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

  // A pointer drag in the area or on the hue: true from press to release, wherever the pointer is let go.
  const startDrag = () => {
    onDraggingChange?.(true);
    const end = () => {
      onDraggingChange?.(false);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };
  useEffect(() => () => onDraggingChange?.(false), [onDraggingChange]);

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
          startDrag();
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
        onPointerDown={startDrag}
        onChange={(e) => set({ ...hsv, h: Number(e.target.value) })}
      />
      <div className="docs-picker-field bland-smooth">
        <Menu
          items={FORMATS}
          size="md"
          className="docs-picker-format-menu"
          selectionMode="single"
          selectedKeys={[format]}
          onSelectionChange={(ids) => ids[0] && setFormat(ids[0] as ColorFormat)}
          aria-label="Color format"
        >
          <button type="button" className="docs-picker-format bland-focus-ring" aria-label={`Color format: ${FORMATS.find((f) => f.id === format)!.label}`}>
            {FORMATS.find((f) => f.id === format)!.label}
            <Icon size="xs">
              <CaretDownIcon />
            </Icon>
          </button>
        </Menu>
        {format === 'hex' ? (
          <input
            aria-label="HEX color"
            value={text}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => {
              setText(e.target.value);
              const hex = parseColor(e.target.value, format);
              if (hex) onChange(hex);
            }}
            onBlur={() => setText(formatColor(value, format))}
          />
        ) : (
          <Channels key={format} format={format} value={value} onChange={onChange} />
        )}
        <span className="docs-picker-swatch" style={{ background: value }} aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * RGB, HSL and OKLCH as one field per number, so a value can't run into the next one. Each field keeps what is
 * typed while it reads as a number, clamps to its range, and tidies on blur; arrow keys step it (Shift: ten steps).
 * Pasting a whole color (CSS, a hex or the three numbers) into any of them takes the lot.
 */
function Channels({ format, value, onChange }: { format: Exclude<ColorFormat, 'hex'>; value: string; onChange: (hex: string) => void }) {
  const channels = CHANNELS[format];
  const show = (n: number, i: number) => String(Number(n.toFixed(channels[i]!.places)));
  const [texts, setTexts] = useState(() => channelsOf(value, format).map(show));
  const editing = useRef<number | null>(null);
  useEffect(() => {
    const fresh = channelsOf(value, format);
    // The field being typed in keeps its text; the others follow the color.
    setTexts((t) => fresh.map((n, i) => (i === editing.current ? t[i]! : show(n, i))));
  }, [value, format]);

  const commit = (i: number, text: string) => {
    const next = texts.map((t, j) => (j === i ? text : t));
    setTexts(next);
    const numbers = next.map((t) => parseFloat(t));
    if (numbers.every((n) => Number.isFinite(n))) onChange(fromChannels(numbers, format));
  };
  return (
    <div className="docs-picker-channels" role="group" aria-label={`${FORMATS.find((f) => f.id === format)!.label} color`}>
      {channels.map((ch, i) => (
        <label key={ch.id} className="docs-picker-channel">
          <input
            aria-label={ch.label}
            value={texts[i]}
            size={Math.max(texts[i]!.length, 1)}
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            onFocus={() => (editing.current = i)}
            onBlur={() => {
              editing.current = null;
              setTexts(channelsOf(value, format).map(show));
            }}
            onPaste={(e) => {
              const pasted = parseColor(e.clipboardData.getData('text'), format);
              if (!pasted || !/[\s,#(]/.test(e.clipboardData.getData('text').trim())) return;
              e.preventDefault();
              editing.current = null;
              onChange(pasted);
            }}
            onChange={(e) => commit(i, e.target.value.replace(/[^\d.]/g, ''))}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
              e.preventDefault();
              const by = ch.step * (e.shiftKey ? 10 : 1) * (e.key === 'ArrowUp' ? 1 : -1);
              commit(i, show(clamp((parseFloat(texts[i]!) || 0) + by, ch.min, ch.max), i));
            }}
          />
          {ch.unit && <span className="docs-picker-unit" aria-hidden="true">{ch.unit}</span>}
        </label>
      ))}
    </div>
  );
}

