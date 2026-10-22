import { CodeSnippet } from '../../src/components/code-snippet/CodeSnippet';
import { Icon } from '../../src/components/icon/Icon';
import { inCollection, stories, tokens } from './data';
import { highlight } from './highlight';
import { ArrowUpRightIcon, FigmaLogo } from './icons';
import { componentPageList, overviewPage, PageIcon, stylePageList } from './pages';
import { PageHeader, Section } from './parts';

const FIGMA_URL = 'https://www.figma.com/design/32J76yQH71a7sENjf60RqD/Bland-Design-System';

const install = `import 'bland/tokens.css';
import 'bland/fonts.css';
import 'bland/base.css';
import 'bland/styles.css';
import { Button } from 'bland';

export function Example() {
  return <Button>Save</Button>;
}
`;

export function Overview() {
  const stats = [
    { n: tokens.length, label: 'Tokens' },
    { n: inCollection('Theme').length, label: 'Theme colors' },
    { n: stories.length, label: 'Components' },
  ];
  return (
    <>
      <PageHeader title="Bland Design System" href={overviewPage.href}>
        Bland is a reusable UI kit: light and dark themes, a brand color swapped per project, Inter and Geist Mono, and components built only on tokens.
        Figma is the source of truth; everything here is generated from the code.
      </PageHeader>
      <div className="docs-hero">
        <ul className="docs-stats docs-dots bland-smooth">
          {stats.map((s) => (
            <li key={s.label} className="docs-stat-frame bland-smooth">
              <span className="docs-stat bland-smooth">
                <span className="docs-stat-n">{s.n}</span>
                <span className="docs-stat-l">{s.label}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="docs-tile-frame bland-smooth">
          <a className="docs-tile docs-figma-link bland-focus-ring bland-smooth" href={FIGMA_URL} target="_blank" rel="noreferrer">
            <Icon size="md">
              <FigmaLogo />
            </Icon>
            <span>View Figma file</span>
            <Icon size="md" className="docs-tile-end">
              <ArrowUpRightIcon />
            </Icon>
          </a>
        </div>
      </div>
      <Section title="Styles">
        <ul className="docs-tile-frame docs-cards docs-style-cards bland-smooth">
          {stylePageList.map((p) => (
            <li key={p.href}>
              <a className="docs-tile docs-style-card bland-focus-ring bland-smooth" href={p.href}>
                <PageIcon page={p} />
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Components">
        <ul className="docs-tile-frame docs-cards bland-smooth">
          {componentPageList.map((p) => (
            <li key={p.href}>
              <a className="docs-tile bland-focus-ring bland-smooth" href={p.href}>
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Use it in a project">
        <CodeSnippet code={{ tsx: install }} languages={[{ id: 'tsx', label: 'React' }]} highlight={highlight} />
      </Section>
    </>
  );
}
