// Bland docs site and screenshot fixtures (npm run docs).
//   #/                      overview
//   #/styles/<id>           a style page, generated from tokens.json
//   #/components/<id>       a component page: demo, variants, props
//   #/raw/<id>?theme=dark   one story alone in one theme: what Playwright screenshots
// <id> for components is the component's folder name.
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/tokens/tokens.css';
import '../src/styles/fonts.css';
import '../src/styles/base.css';
import './playground.css';
import { stories, stylePages, type StylePageId } from './docs/data';
import { DocsApp, type DocsRoute } from './docs/DocsApp';

type Route = { kind: 'raw'; id: string; theme: 'light' | 'dark' } | DocsRoute;

function parseHash(): Route {
  const [path = '', query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [section, id = ''] = path.split('/');
  if (section === 'raw') return { kind: 'raw', id, theme: new URLSearchParams(query).get('theme') === 'dark' ? 'dark' : 'light' };
  if (section === 'styles' && stylePages.some((p) => p.id === id)) return { kind: 'style', id: id as StylePageId };
  if (section === 'components' && id) return { kind: 'component', id };
  if (section === 'brand') return { kind: 'brand' };
  return { kind: 'overview' };
}

function RawStory({ id, theme }: { id: string; theme: 'light' | 'dark' }) {
  const entry = stories.find((s) => s.id === id);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  if (!entry) return <p>No story called “{id}”.</p>;
  return (
    <section className="pg-frame" data-theme={theme} data-testid={`frame-${theme}`}>
      <h1 className="pg-title">
        {entry.story.title} <span>{theme}</span>
      </h1>
      {entry.story.render()}
    </section>
  );
}

function App() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route.kind === 'raw' ? <RawStory id={route.id} theme={route.theme} /> : <DocsApp route={route} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
