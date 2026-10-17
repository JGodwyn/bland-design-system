// The Bland docs site: a sidebar of styles and components, the selected page, and a theme switch.
import { useEffect, useState } from 'react';
import { Button } from '../../src/components/button/Button';
import { ScrollArea } from '../../src/components/scroll-area/ScrollArea';
import { ComponentPage } from './ComponentPage';
import { stories, stylePages, type StylePageId } from './data';
import { Overview } from './Overview';
import { StylePage } from './StylePage';
import './docs.css';

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'bland-docs-theme';

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

/** System leaves data-theme off, so tokens.css follows prefers-color-scheme. */
function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* Private mode: the choice lasts for this visit only. */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

export type DocsRoute = { kind: 'overview' } | { kind: 'style'; id: StylePageId } | { kind: 'component'; id: string };

export function DocsApp({ route }: { route: DocsRoute }) {
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    document.querySelector('.docs-main')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [route]);

  const current = route.kind === 'overview' ? '#/' : route.kind === 'style' ? `#/styles/${route.id}` : `#/components/${route.id}`;
  const link = (href: string, label: string) => (
    <li key={href}>
      <a href={href} className="docs-nav-link bland-focus-ring" aria-current={href === current ? 'page' : undefined}>
        {label}
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
          <span className="docs-version">design system</span>
        </div>
        <ScrollArea className="docs-nav-scroll" fadeSize="sm">
          <nav aria-label="Docs">
            <ul className="docs-nav">{link('#/', 'Overview')}</ul>
            <h2 className="docs-nav-heading">Styles</h2>
            <ul className="docs-nav">{stylePages.map((p) => link(`#/styles/${p.id}`, p.title))}</ul>
            <h2 className="docs-nav-heading">Components</h2>
            <ul className="docs-nav">{stories.map((s) => link(`#/components/${s.id}`, s.story.title))}</ul>
          </nav>
        </ScrollArea>
        <div className="docs-theme" role="group" aria-label="Theme">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <Button key={t} size="xs" type={theme === t ? 'stroke' : 'ghost'} aria-pressed={theme === t} onClick={() => setTheme(t)}>
              {t[0]!.toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
      </aside>

      <main className="docs-main">
        <div className="docs-content">
          {route.kind === 'overview' && <Overview />}
          {route.kind === 'style' && <StylePage id={route.id} />}
          {route.kind === 'component' && (story ? <ComponentPage story={story} /> : <p>No component called “{route.id}”.</p>)}
        </div>
      </main>
    </div>
  );
}
