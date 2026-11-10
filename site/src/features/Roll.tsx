// Text that changes in place rolls (Stageshow, motion.md: "a status word that changes rolls"): the new value rises
// in from below as the old one leaves upward, always in that direction, so a story that loops back to an earlier
// value still rolls forward. Both share one grid cell; the box keeps the wider of the two while they pass, and the
// old one is dropped when its exit ends (so the box then fits the new value; under reduced motion at once).
import { useEffect, useRef, useState } from 'react';

export function Roll({ value, className }: { value: string; className?: string }) {
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
    <span className={`features-roll${className ? ` ${className}` : ''}`}>
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
