// Text that changes in place rolls (Stageshow, motion.md: "a status word that changes rolls"): the new value rises
// in from below as the old one leaves upward, always in that direction, so a story that loops back to an earlier
// value still rolls forward. Both share one grid cell; the box keeps the wider of the two while they pass, and the
// old one is dropped when its exit ends (so the box then fits the new value; under reduced motion at once).
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * `fit`: the box eases to the new value's width instead of keeping the wider one and then snapping (Godwin
 * 2026-11-16: the keyboard card's chips were snappy). A hidden copy of the value is measured in layout pixels, so a
 * scaled card measures right.
 */
export function Roll({ value, className, fit = false }: { value: string; className?: string; fit?: boolean }) {
  const sizer = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = sizer.current;
    if (!fit || !el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit, value]);
  const [shown, setShown] = useState({ now: value, before: null as string | null, turn: 0 });
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setShown((s) => (s.now === value ? s : { now: value, before: s.now, turn: s.turn + 1 }));
  }, [value]);
  const turn = shown.turn;
  return (
    <span
      className={`features-roll${className ? ` ${className}` : ''}`}
      data-fit={fit || undefined}
      style={fit && width !== null ? ({ '--roll-w': `${width}px` } as CSSProperties) : undefined}
    >
      {fit && (
        <span ref={sizer} className="features-roll__sizer" aria-hidden>
          {value}
        </span>
      )}
      {shown.before !== null && (
        <span
          key={`b${shown.turn}`}
          className="features-roll__value"
          data-roll="out"
          onAnimationEnd={() => setShown((s) => (s.turn === turn ? { ...s, before: null } : s))}
        >
          {shown.before}
        </span>
      )}
      <span key={`n${shown.turn}`} className="features-roll__value" data-roll={shown.turn > 0 ? 'in' : undefined}>
        {shown.now}
      </span>
    </span>
  );
}
