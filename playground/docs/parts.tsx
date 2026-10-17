// Small pieces shared by the docs pages.
import { useState, type ReactNode } from 'react';
import type { Token } from './data';

/** A CSS variable name that copies itself on click. */
export function TokenName({ css }: { css: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`var(${css})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* Clipboard refused: the name stays selectable. */
    }
  };
  return (
    <button type="button" className="docs-token bland-focus-ring" onClick={copy} title={`Copy var(${css})`}>
      {copied ? 'Copied' : css}
    </button>
  );
}

export function PageHeader({ title, eyebrow, children }: { title: string; eyebrow: string; children?: ReactNode }) {
  return (
    <header className="docs-page-header">
      <div className="docs-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children && <div className="docs-lead">{children}</div>}
    </header>
  );
}

export function Section({ title, children, note }: { title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <section className="docs-section">
      <h2>{title}</h2>
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

/** A table of tokens with a visual sample per row. */
export function TokenTable({ items, sample, sampleLabel = 'Sample' }: { items: Token[]; sample?: (t: Token) => ReactNode; sampleLabel?: string }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            {sample && <th scope="col">{sampleLabel}</th>}
            <th scope="col">Token</th>
            <th scope="col">Value</th>
            <th scope="col">Use</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.css}>
              {sample && <td className="docs-sample-cell">{sample(t)}</td>}
              <td>
                <TokenName css={t.css} />
                <div className="docs-figma-name">{t.name}</div>
              </td>
              <td>
                <Values token={t} />
              </td>
              <td className="docs-desc">{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
