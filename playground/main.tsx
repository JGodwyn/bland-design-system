// Bland playground. Routes: #/ lists stories; #/<id> shows one in both themes; #/<id>?theme=light|dark
// shows one theme only (what Playwright screenshots). <id> is the component's folder name.
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Story } from './story';
import '../src/tokens/tokens.css';
import '../src/styles/fonts.css';
import '../src/styles/base.css';
import './playground.css';

const modules = import.meta.glob<{ default: Story }>('../src/components/*/*.stories.tsx', { eager: true });
const stories = Object.entries(modules)
  .map(([path, m]) => ({ id: path.split('/').at(-2)!, story: m.default }))
  .sort((a, b) => a.story.title.localeCompare(b.story.title));

function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const theme = new URLSearchParams(query).get('theme');
  return { id: path || '', theme: theme === 'light' || theme === 'dark' ? theme : null };
}

function App() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const entry = stories.find((s) => s.id === route.id);
  if (!entry) {
    return (
      <main className="pg-index" data-theme="light">
        <h1>Bland playground</h1>
        <ul>
          {stories.map((s) => (
            <li key={s.id}>
              <a href={`#/${s.id}`}>{s.story.title}</a>
            </li>
          ))}
        </ul>
      </main>
    );
  }
  const themes = route.theme ? [route.theme] : (['light', 'dark'] as const);
  return (
    <div className="pg-themes">
      {themes.map((t) => (
        <section key={t} className="pg-frame" data-theme={t} data-testid={`frame-${t}`}>
          <h1 className="pg-title">
            {entry.story.title} <span>{t}</span>
          </h1>
          {entry.story.render()}
        </section>
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
