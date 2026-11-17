// Keep the reader's place on a refresh (Godwin 2026-11-11: "when I refresh the page, let me be where I was").
// The browser's own restore runs before the sections under the hero exist (they load after the hero paints,
// main.tsx), so the page is one screen tall at that moment and it lands at the top. Instead: remember the scroll
// in sessionStorage, and on a reload or back/forward put it back once the page is tall enough to hold it. If the
// reader scrolls first, or the page never grows that far, nothing moves.
const KEY = 'bland-landing-scroll';
const GIVE_UP_MS = 4000;

export function rememberScroll() {
  if (typeof window === 'undefined') return;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const returning = nav?.type === 'reload' || nav?.type === 'back_forward';
  let saved: number | null = null;
  try {
    const raw = sessionStorage.getItem(KEY);
    saved = raw === null ? null : Number(raw);
  } catch {
    saved = null;
  }
  try {
    history.scrollRestoration = 'manual';
  } catch {
    // Old browsers: their own restore stays.
  }

  const save = () => {
    try {
      sessionStorage.setItem(KEY, String(Math.round(window.scrollY)));
    } catch {
      // Private mode without storage: the place is simply not kept.
    }
  };
  let pending = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (!pending) pending = window.setTimeout(() => ((pending = 0), save()), 200);
    },
    { passive: true },
  );
  window.addEventListener('pagehide', save);

  if (!returning || !saved || !Number.isFinite(saved)) return;
  const target = saved;
  const root = document.documentElement;
  let done = false;
  const stop = () => {
    done = true;
    ro.disconnect();
    for (const e of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) window.removeEventListener(e, stop);
  };
  const tryRestore = () => {
    if (done) return;
    if (root.scrollHeight - window.innerHeight >= target) {
      window.scrollTo(0, target);
      stop();
    }
  };
  const ro = new ResizeObserver(tryRestore);
  ro.observe(document.body);
  for (const e of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) window.addEventListener(e, stop, { passive: true });
  window.setTimeout(stop, GIVE_UP_MS);
  tryRestore();
}
