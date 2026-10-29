// The Bland docs site: a sidebar of styles and components, a top bar with the theme switch and the
// search, the selected page, and a rail listing the page's sections.
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Button } from '../../src/components/button/Button';
import { Icon } from '../../src/components/icon/Icon';
import { ScrollArea } from '../../src/components/scroll-area/ScrollArea';
import { SegmentedBar } from '../../src/components/segmented-bar/SegmentedBar';
import { ComponentPage } from './ComponentPage';
import { stories, type DocsPage, type StylePageId } from './data';
import { CommandIcon, ListDashesIcon, MoonIcon, SunDimIcon } from './icons';
import { BrandPage } from './BrandPage';
import './brandStore'; // paints an applied brand on load, on every page
import { brandPage, componentPageList, overviewPage, PageIcon, stylePageList } from './pages';
import { isApple, SearchDialog } from './Search';
import { Overview } from './Overview';
import { StylePage } from './StylePage';
import './docs.css';

type Theme = 'light' | 'dark';
const THEME_KEY = 'bland-docs-theme';

function readTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

const darkQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : undefined;
const subscribeScheme = (on: () => void) => {
  darkQuery?.addEventListener('change', on);
  return () => darkQuery?.removeEventListener('change', on);
};
const systemTheme = (): Theme => (darkQuery?.matches ? 'dark' : 'light');

/**
 * Light or Dark, remembered per browser. Until one is picked the page follows the system (no
 * data-theme, so tokens.css reads prefers-color-scheme) and the switch shows the system's choice.
 */
function useTheme() {
  const [picked, setPicked] = useState<Theme | null>(readTheme);
  const system = useSyncExternalStore(subscribeScheme, systemTheme, () => 'light' as const);
  useEffect(() => {
    const root = document.documentElement;
    if (picked) root.setAttribute('data-theme', picked);
    else root.removeAttribute('data-theme');
    try {
      if (picked) localStorage.setItem(THEME_KEY, picked);
    } catch {
      /* Private mode: the choice lasts for this visit only. */
    }
  }, [picked]);
  return [picked ?? system, setPicked] as const;
}

/** Scrolling less than this (px) neither hides nor shows the phone toolbar, so a jittery thumb doesn't flicker it. */
const scrollSlack = 8;
/** Within this distance of the top (px, about the top bar and the toolbar) the phone toolbar always shows. */
const toolbarStays = 120;

export type DocsRoute = { kind: 'overview' } | { kind: 'brand' } | { kind: 'style'; id: StylePageId } | { kind: 'component'; id: string };

export function DocsApp({ route }: { route: DocsRoute }) {
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolbarAway, setToolbarAway] = useState(false);

  // The sticky toolbar shows its fade only once the page has scrolled under it. On a phone it also slides away
  // while the page scrolls down and comes back on any scroll up (CSS applies it below breakpoint/md only); a few
  // pixels either way are ignored, and it never leaves while the page is near the top.
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 0);
      if (y <= toolbarStays) setToolbarAway(false);
      else if (y > last + scrollSlack) setToolbarAway(true);
      else if (y < last - scrollSlack) setToolbarAway(false);
      else return; // within the slack: keep measuring from the same point
      last = y;
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0 });
  }, [route]);

  // ⌘K on Apple keyboards, Ctrl+K elsewhere, opens the search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (isApple ? e.metaKey : e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const current = route.kind === 'overview' ? '#/' : route.kind === 'brand' ? brandPage.href : route.kind === 'style' ? `#/styles/${route.id}` : `#/components/${route.id}`;
  const link = (page: DocsPage) => (
    <li key={page.href}>
      <a href={page.href} className="docs-nav-link bland-focus-ring bland-smooth" aria-current={page.href === current ? 'page' : undefined}>
        <PageIcon page={page} />
        <span className="docs-nav-label">{page.title}</span>
      </a>
    </li>
  );

  const story = route.kind === 'component' ? stories.find((s) => s.id === route.id)?.story : undefined;

  return (
    <div className="docs" data-menu-open={menuOpen || undefined}>
      <header className="docs-topbar">
        <a href="#/" className="docs-brand bland-focus-ring">
          Bland
        </a>
        <Button size="sm" type="ghost" aria-expanded={menuOpen} aria-controls="docs-sidebar" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? 'Close' : 'Menu'}
        </Button>
      </header>

      <aside className="docs-sidebar" id="docs-sidebar">
        <div className="docs-sidebar-head">
          <a href="#/" className="docs-brand bland-focus-ring">
            Bland
          </a>
          <span className="docs-descriptor">Design system</span>
        </div>
        <ScrollArea className="docs-nav-scroll" fadeSize="sm">
          <nav aria-label="Docs">
            <ul className="docs-nav">
              {link(overviewPage)}
              {link(brandPage)}
            </ul>
            <h2 className="docs-group-heading">Foundations</h2>
            <ul className="docs-nav">{stylePageList.map(link)}</ul>
            <h2 className="docs-group-heading">Components</h2>
            <ul className="docs-nav">{componentPageList.map(link)}</ul>
          </nav>
        </ScrollArea>
      </aside>

      <div className="docs-toolbar" data-stuck={scrolled || undefined} data-away={(toolbarAway && !menuOpen) || undefined}>
        <SegmentedBar
          className="docs-theme"
          aria-label="Theme"
          name="docs-theme"
          items={[
            { id: 'light', label: 'Light', icon: <SunDimIcon /> },
            { id: 'dark', label: 'Dark', icon: <MoonIcon /> },
          ]}
          value={theme}
          onValueChange={(id) => setTheme(id as Theme)}
        />
        <button type="button" className="docs-search-trigger bland-focus-ring bland-smooth" onClick={() => setSearchOpen(true)} aria-keyshortcuts={isApple ? 'Meta+K' : 'Control+K'}>
          <span className="docs-search-label bland-smooth">Search Bland</span>
          <span className="docs-keys" aria-hidden="true">
            <kbd className="docs-key bland-smooth">
              {isApple ? (
                <Icon size="md">
                  <CommandIcon />
                </Icon>
              ) : (
                'Ctrl'
              )}
            </kbd>
            <kbd className="docs-key bland-smooth">K</kbd>
          </span>
        </button>
      </div>

      <main className="docs-main">
        <div className="docs-content">
          {route.kind === 'overview' && <Overview />}
          {route.kind === 'brand' && <BrandPage />}
          {route.kind === 'style' && <StylePage id={route.id} />}
          {route.kind === 'component' && (story ? <ComponentPage id={route.id} story={story} /> : <p>No component called “{route.id}”.</p>)}
        </div>
      </main>

      <PageContents route={current} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

/**
 * The page's sections (every element marked data-toc). The current one is bold: the last whose top has
 * reached the sticky toolbar, or the one just clicked while the page glides to it. A bar slides to it, and
 * the list scrolls to keep it in view, both over duration/md (at once under reduced motion). Buttons, not
 * links: the router owns the hash.
 */
function PageContents({ route }: { route: string }) {
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState<string>();
  const gliding = useRef(false);
  const list = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLLIElement>(null);

  // Slide the bar to the current entry and keep that entry in view inside the rail's scroll area.
  useLayoutEffect(() => {
    const ul = list.current;
    const marker = bar.current;
    const current = ul?.querySelector<HTMLElement>('[aria-current]');
    if (!ul || !marker || !current) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    marker.style.transform = `translateY(${current.offsetTop}px)`;
    marker.style.height = `${current.offsetHeight}px`;
    // The first placement on a page is not a movement: show the bar there, then animate from the next one.
    requestAnimationFrame(() => ul.setAttribute('data-ready', ''));
    const viewport = ul.closest<HTMLElement>('.bland-scroll-area__viewport');
    if (!viewport) return;
    const top = current.offsetTop;
    const bottom = top + current.offsetHeight;
    if (top < viewport.scrollTop || bottom > viewport.scrollTop + viewport.clientHeight) {
      viewport.scrollTo({ top: top - (viewport.clientHeight - current.offsetHeight) / 2, behavior: reduced ? 'auto' : 'smooth' });
    }
  }, [active, items]);

  useLayoutEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.docs-content [data-toc]')];
    setItems(els.map((el) => ({ id: el.id, label: el.dataset.toc! })));
    const update = () => {
      if (gliding.current) return;
      const toolbar = document.querySelector('.docs-toolbar')?.getBoundingClientRect().bottom ?? 0;
      const line = toolbar + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--space-2xl'));
      let at = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) at = el.id;
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1) at = els.at(-1)?.id;
      setActive(at);
    };
    update();
    const settle = () => {
      gliding.current = false;
      update();
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('scrollend', settle);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('scrollend', settle);
      window.removeEventListener('resize', update);
    };
  }, [route]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActive(id);
    // Glides to the section; jumps under reduced motion. scrollend clears the hold; if the page is already
    // there, the entry simply stays current until the next scroll ends.
    gliding.current = !reduced;
    el.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  };

  if (items.length < 2) return <aside className="docs-toc" />;
  return (
    <aside className="docs-toc">
      <nav className="docs-toc-inner" aria-label="On this page">
        <h2 className="docs-toc-heading">
          <Icon size="sm">
            <ListDashesIcon />
          </Icon>
          Content
        </h2>
        <ScrollArea className="docs-toc-scroll" fadeSize="sm" scrollbar={false}>
          <ul ref={list} className="docs-toc-list" key={route}>
            <li ref={bar} className="docs-toc-bar" aria-hidden="true" />
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="docs-toc-link bland-focus-ring"
                  aria-current={item.id === active ? 'location' : undefined}
                  onClick={() => go(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </nav>
    </aside>
  );
}
