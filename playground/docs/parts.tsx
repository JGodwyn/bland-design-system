// Small pieces shared by the docs pages.
import type { ReactNode } from 'react';
import { CodeText } from '../../src/components/code-snippet/CodeText';
import { IconButton } from '../../src/components/button/IconButton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../src/components/table/Table';
import { CaretLeftIcon, CaretRightIcon } from '../../src/icons';
import type { Token } from './data';
import { docsPages } from './pages';

/**
 * Docs text with code in it: each `backtick` pair becomes Code text, so prop names and values read as code.
 * Story descriptions, usage rules, prop descriptions and style page leads are written this way.
 */
export function Prose({ children }: { children: string }) {
  return (
    <>
      {children.split(/`([^`]+)`/).map((part, i) =>
        i % 2 ? (
          <CodeText key={i} size="lg">
            {part}
          </CodeText>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** A CSS variable name as Code text, with its copy button. */
export function TokenName({ css }: { css: string }) {
  return (
    <CodeText size="md" copyable className="docs-token">
      {css}
    </CodeText>
  );
}

/**
 * A page's title with buttons to the previous and next page in sidebar order, then its lead text and
 * anything else that belongs to the introduction (a component's import line). The contents rail
 * lists it as Installation on component pages.
 */
export function PageHeader({ title, href, children }: { title: string; href: string; children?: ReactNode }) {
  const at = docsPages.findIndex((p) => p.href === href);
  const prev = at > 0 ? docsPages[at - 1] : undefined;
  const next = at >= 0 && at < docsPages.length - 1 ? docsPages[at + 1] : undefined;
  const go = (to: string) => () => {
    location.hash = to;
  };
  return (
    <header className="docs-page-header" id="installation" data-toc={href.startsWith('#/components/') ? 'Installation' : 'Introduction'}>
      <div className="docs-title-row">
        <h1>{title}</h1>
        <div className="docs-pager">
          <IconButton size="sm" type="stroke" icon={<CaretLeftIcon />} aria-label={prev ? `Previous: ${prev.title}` : 'Previous'} disabled={!prev} onClick={prev && go(prev.href)} />
          <IconButton size="sm" type="stroke" icon={<CaretRightIcon />} aria-label={next ? `Next: ${next.title}` : 'Next'} disabled={!next} onClick={next && go(next.href)} />
        </div>
      </div>
      {children && <div className="docs-lead">{children}</div>}
    </header>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** A titled section, listed in the page contents rail under its title. */
export function Section({ id, title, children, note, action, className, toc = true }: { id?: string; title: string; children: ReactNode; note?: ReactNode; action?: ReactNode; className?: string; toc?: boolean }) {
  return (
    <section className={`docs-section${className ? ` ${className}` : ''}`} id={id ?? slug(title)} data-toc={toc ? title : undefined}>
      {action ? (
        <div className="docs-section-heading">
          <h2>{title}</h2>
          {action}
        </div>
      ) : (
        <h2>{title}</h2>
      )}
      {note && <p className="docs-note">{note}</p>}
      {children}
    </section>
  );
}

/** Light and dark values side by side when they differ. */
export function Values({ token }: { token: Token }) {
  if (!token.dark || token.dark === token.light) return <code className="docs-value">{token.light}</code>;
  return (
    <span className="docs-values">
      <code className="docs-value">
        <span className="docs-mode">Light</span> {token.light}
      </code>
      <code className="docs-value">
        <span className="docs-mode">Dark</span> {token.dark}
      </code>
    </span>
  );
}

/** A table of tokens with a visual sample per row, in Bland's Table (as the props tables). */
export function TokenTable({ items, sample, sampleLabel = 'Sample' }: { items: Token[]; sample?: (t: Token) => ReactNode; sampleLabel?: string }) {
  return (
    <Table size="md" className="docs-data docs-tokens" data-sample={sample ? '' : undefined} aria-label={items[0] ? `${items[0].collection} tokens` : 'Tokens'}>
      <TableHead>
        <TableRow>
          {sample && <TableHeaderCell>{sampleLabel}</TableHeaderCell>}
          <TableHeaderCell>Token</TableHeaderCell>
          <TableHeaderCell>Value</TableHeaderCell>
          <TableHeaderCell>Use</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((t) => (
          <TableRow key={t.css}>
            {sample && <TableCell>{sample(t)}</TableCell>}
            <TableCell>
              <TokenName css={t.css} />
              <span className="docs-figma-name">{t.name}</span>
            </TableCell>
            <TableCell>
              <Values token={t} />
            </TableCell>
            <TableCell>{t.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
