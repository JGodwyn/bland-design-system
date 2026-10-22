// A small highlighter for the docs' code views: Bland's CodeSnippet ships none and colors any
// `data-token` span (comment, keyword, function, string) with the Code/* tokens. Enough for the
// TSX and CSS the docs show; not a parser.
import type { ReactNode } from 'react';

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'function', 'return', 'const', 'let', 'type', 'interface',
  'true', 'false', 'null', 'undefined', 'new', 'if', 'else', 'async', 'await',
]);

// Comments, strings, JSX tag names (after < or </), names followed by "(", then words.
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|(?<=<\/?)([A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)(?=\()|([A-Za-z_$][\w$]*)/g;

export function highlight(code: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of code.matchAll(TOKEN)) {
    const [text, comment, string, tag, call, word] = m;
    const kind = comment ? 'comment' : string ? 'string' : tag || call ? 'function' : word && KEYWORDS.has(word) ? 'keyword' : undefined;
    if (!kind) continue;
    if (m.index > last) out.push(code.slice(last, m.index));
    out.push(
      <span key={key++} data-token={kind}>
        {text}
      </span>,
    );
    last = m.index + text.length;
  }
  out.push(code.slice(last));
  return out;
}
