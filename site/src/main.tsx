// Bland landing page (npm run site). Sections are built one at a time from the Figma frame 7079:35060.
import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/tokens/tokens.css';
import '../../src/styles/fonts.css';
import '../../src/styles/base.css';
// The headline is Inter Bold (700); Bland itself loads 400 to 600 only, so without this the browser fakes it from 600.
import '@fontsource/inter/700.css';
import './landing-values.css';
import './landing.css';
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';
import { Hero } from './hero/Hero';

// The hero is in this script; every section under it is one chunk (rest.tsx) loaded once the hero has painted, so the hero
// shows without waiting for the rest of the page (Godwin 2026-11-10). Both lazy parts share that chunk.
const BelowHero = lazy(() => import('./rest').then((m) => ({ default: m.BelowHero })));
const Footer = lazy(() => import('./rest').then((m) => ({ default: m.Footer })));

/**
 * True once the hero has painted (two frames after mount). The chunk for the rest of the page is only asked for
 * then, so on a slow phone it doesn't share the network with the hero's own files before the first paint
 * (landing audit 2026-11-10: fetched at once, it pushed Lighthouse's simulated phone LCP to 2.8 s).
 */
function useAfterFirstPaint() {
  const [painted, setPainted] = useState(false);
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setPainted(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return painted;
}

function Landing() {
  const painted = useAfterFirstPaint();
  return (
    <>
      <main className="landing">
        <Hero />
        <Suspense fallback={null}>{painted ? <BelowHero /> : null}</Suspense>
      </main>
      {/* Outside main, so it is the page's contentinfo landmark. */}
      <Suspense fallback={null}>{painted ? <Footer /> : null}</Suspense>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
    {/* DialKit's tuning panel (site/src/hero/tuning.ts): shown in npm run site only, hidden in builds. */}
    <DialRoot position="bottom-right" defaultOpen={false} />
  </StrictMode>,
);
