import { inCollection, stories, stylePages, tokens } from './data';
import { PageHeader, Section } from './parts';

export function Overview() {
  const themed = inCollection('Theme').length;
  return (
    <>
      <PageHeader eyebrow="Overview" title="Bland design system">
        Bland is a reusable UI kit: light and dark themes, a brand color swapped per project, Inter and Geist Mono, and components built only on tokens.
        Figma is the source of truth; everything here is generated from the code.
      </PageHeader>
      <div className="docs-stats">
        <div className="docs-stat">
          <span className="docs-stat-n">{tokens.length}</span>
          <span className="docs-stat-l">tokens</span>
        </div>
        <div className="docs-stat">
          <span className="docs-stat-n">{themed}</span>
          <span className="docs-stat-l">theme colors</span>
        </div>
        <div className="docs-stat">
          <span className="docs-stat-n">{stories.length}</span>
          <span className="docs-stat-l">components built</span>
        </div>
      </div>
      <Section title="Styles">
        <ul className="docs-cards">
          {stylePages.map((p) => (
            <li key={p.id}>
              <a className="docs-card bland-focus-ring bland-smooth" href={`#/styles/${p.id}`}>
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Components">
        <ul className="docs-cards">
          {stories.map((s) => (
            <li key={s.id}>
              <a className="docs-card bland-focus-ring bland-smooth" href={`#/components/${s.id}`}>
                {s.story.title}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Use it in a project">
        <pre className="docs-code">
          <code>{`import 'bland/tokens.css';
import 'bland/fonts.css';
import 'bland/base.css';
import 'bland/styles.css';
import { Button } from 'bland';`}</code>
        </pre>
      </Section>
    </>
  );
}
