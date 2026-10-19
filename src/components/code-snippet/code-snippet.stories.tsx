import { useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { CodeSnippet, type CodeSnippetFile, type CodeSnippetSwitcher } from './CodeSnippet';
import { CodeText, type CodeTextSize } from './CodeText';

// Figma's sample code.
const python = `# Import the necessary modules
import datetime
import json

# Define an exception for invalid SKU numbers
class InvalidSKUException(Exception):
    pass
# Define a class for product items
class Product:
    def __init__(self, sku: str, name: str, price: float, quantity: int):
        self.sku = sku
        self.name = name
        self.price = price
        self.quantity = quantity

    def update_quantity(self, change: int):
        """
        Update the quantity of the product item.

        Args:
            change (int): The change in quantity
        """
        self.quantity += change

# Define a class for the inventory system
class InventorySystem:
    def __init__(self):
        self.products = {}  # Mapping of SKU to Product

    def add_product(self, sku: str, name: str, price: float, quantity: int):
        """
        Add a new product item to the inventory.
        """
        self.products[sku] = Product(sku, name, price, quantity)
`;

const javascript = `// Define a class for product items
class Product {
  constructor(sku, name, price, quantity) {
    this.sku = sku;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  updateQuantity(change) {
    this.quantity += change;
  }
}
`;

const short = `import { CodeSnippet } from 'bland';

function Example() {
  return <CodeSnippet code="print('hello')" />;
}
`;

const keywords =
  /^(import|from|export|class|def|pass|return|function|const|let|new|constructor|if|else|for|in|of)$/;

/**
 * A stand-in highlighter for the story, so the Code colors show (Bland ships none; projects bring Shiki, Prism or
 * highlight.js). It marks comments, strings, keywords and the names after def, class and function.
 */
function demoHighlight(code: string): ReactNode {
  const out: ReactNode[] = [];
  const re = /("""[\s\S]*?"""|"[^"\n]*"|'[^'\n]*'|`[^`]*`)|((?:#|\/\/)[^\n]*)|([A-Za-z_]\w*)/g;
  let last = 0;
  let next: 'function' | null = null;
  for (const m of code.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    const [all, str, comment, word] = m;
    let token: string | null = null;
    if (str) token = 'string';
    else if (comment) token = 'comment';
    else if (word && keywords.test(word)) {
      token = 'keyword';
      next = /^(def|class|function)$/.test(word) ? 'function' : null;
    } else if (word && (next || code[at + all.length] === '(')) {
      token = 'function';
      next = null;
    }
    out.push(token ? <span key={at} data-token={token}>{all}</span> : all);
    last = at + all.length;
  }
  out.push(code.slice(last));
  return out;
}

const files: CodeSnippetFile[] = [
  { id: 'index', name: 'index.py', code: { python, javascript } },
  { id: 'auth', name: 'Authentication.js', code: { python: '# Authentication\n', javascript: '// Authentication\n' } },
  { id: 'button', name: 'Button.html', code: '<button type="button">Save</button>\n' },
  { id: 'routes', name: 'routes.py', code: '# Routes\n' },
];
const languages = [
  { id: 'python', label: 'python' },
  { id: 'javascript', label: 'javascript' },
];
const tabLanguages = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'Javascript' },
];

/** Figma's frame, code-snippet/width; the snippet itself fills whatever holds it. */
function Frame({ children, height }: { children: ReactNode; height?: string }) {
  return <div style={{ width: 'var(--code-snippet-width)', maxWidth: '100%', height }}>{children}</div>;
}

/** Reports its state, so tests/code-snippet.spec.ts can check the callbacks. */
function Controlled() {
  const [language, setLanguage] = useState('python');
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="pg-stack">
      <Frame>
        <CodeSnippet
          data-testid="controlled"
          files={files}
          languages={languages}
          language={language}
          onLanguageChange={setLanguage}
          expanded={expanded}
          onExpandedChange={setExpanded}
          highlight={demoHighlight}
        />
      </Frame>
      <output className="pg-label" data-testid="controlled-state">
        {language} {expanded ? 'expanded' : 'collapsed'}
      </output>
    </div>
  );
}

const switchers: CodeSnippetSwitcher[] = ['dropdown', 'tabs', 'pills'];
const sizes: CodeTextSize[] = ['sm', 'md', 'lg'];
const bodyType: Record<CodeTextSize, string> = {
  sm: 'var(--type-body-sm)',
  md: 'var(--type-body-md)',
  lg: 'var(--type-body-lg)',
};

export default {
  title: 'Code snippet',
  description:
    'Block of code with optional file tabs, action bar and line numbers. Collapsed clips the code to code-snippet/height-collapsed (18 lines) and shows a Show more button; expanded shows every line with Show less; fullscreen has square corners and no toggle. The action bar picks the language with a dropdown (with an optional description), Section tabs or Pill tabs, and has a copy button that announces "Copied". Syntax colors use the Code/* tokens; Bland ships no highlighter, so pass highlight. Code text is the inline version, inside running text. In code: pre > code, a tablist for the files, line numbers aria-hidden, the toggle a button with aria-expanded; long lines scroll sideways while the line numbers stay.',
  components: ['CodeSnippet', 'CodeText'],
  demo: {
    component: 'CodeSnippet',
    args: {
      tabs: true,
      switcher: 'dropdown',
      description: 'Extra information can come here',
      copyable: true,
      actionBar: true,
      lineNumbers: true,
      collapsible: true,
      fullscreen: false,
      highlighted: true,
    },
    controls: {
      tabs: { kind: 'boolean' },
      highlighted: { kind: 'boolean' },
      description: { kind: 'text' },
      code: false,
      files: false,
      file: false,
      defaultFile: false,
      languages: false,
      language: false,
      defaultLanguage: false,
      expanded: false,
    },
    render: ({ tabs, highlighted, fullscreen, ...args }) => (
      <Frame height={fullscreen ? 'var(--code-snippet-height-collapsed)' : undefined}>
        <CodeSnippet
          {...(args as object)}
          fullscreen={fullscreen}
          {...(tabs ? { files } : { code: { python, javascript } })}
          languages={languages}
          highlight={highlighted ? demoHighlight : undefined}
        />
      </Frame>
    ),
    code: ({ tabs, highlighted, ...args }) => ({
      ...args,
      ...(tabs ? { files: '<files>' } : { code: '<code>' }),
      languages: '<languages>',
      ...(highlighted ? { highlight: '<highlight>' } : {}),
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Collapsed (Figma default): file tabs, dropdown switcher with a description, copy, Show more</span>
        <Frame>
          <CodeSnippet
            data-testid="collapsed"
            files={files}
            languages={languages}
            description="Extra information can come here"
            highlight={demoHighlight}
          />
        </Frame>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Expanded: every line, Show less</span>
        <Frame>
          <CodeSnippet
            data-testid="expanded"
            files={files}
            languages={languages}
            description="Extra information can come here"
            defaultExpanded
            highlight={demoHighlight}
          />
        </Frame>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Fullscreen: square corners, fills its container (here 384 tall) and scrolls, no toggle</span>
        <Frame height="var(--code-snippet-height-collapsed)">
          <CodeSnippet data-testid="fullscreen" files={files} languages={languages} fullscreen highlight={demoHighlight} />
        </Frame>
      </div>
      {switchers.map((switcher) => (
        <div key={switcher} className="pg-stack">
          <span className="pg-label">Switcher {switcher}, no file tabs, short code (no toggle)</span>
          <Frame>
            <CodeSnippet
              data-testid={`switcher-${switcher}`}
              code={{ python: '# Python\nprint("hello")\n', javascript: '// Javascript\nconsole.log("hello");\n' }}
              languages={switcher === 'dropdown' ? languages : tabLanguages}
              switcher={switcher}
              highlight={demoHighlight}
            />
          </Frame>
        </div>
      ))}
      <div className="pg-stack">
        <span className="pg-label">One language: a label, no menu; long lines scroll sideways</span>
        <Frame>
          <CodeSnippet
            data-testid="single"
            code={'const message = "A line long enough to scroll sideways, while the line numbers stay where they are.";\n'}
            language="javascript"
            highlight={demoHighlight}
          />
        </Frame>
      </div>
      <div className="pg-stack">
        <span className="pg-label">No action bar, no line numbers, no highlighter (plain Code/text)</span>
        <Frame>
          <CodeSnippet data-testid="plain" code={short} actionBar={false} lineNumbers={false} />
        </Frame>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Focused: copy button</span>
        <Frame>
          <div className="pg-focus">
            <CodeSnippet code={short} highlight={demoHighlight} />
          </div>
        </Frame>
      </div>
      <Controlled />
      <div className="pg-stack">
        <span className="pg-label">Code text: sm, md and lg in body-sm, -md and -lg text, then with copy</span>
        {sizes.map((size) => (
          <p key={size} style={{ font: bodyType[size], color: 'var(--text-bold)', margin: 0 }}>
            Install it with <CodeText size={size}>npm install bland</CodeText> and import{' '}
            <CodeText size={size} copyable data-testid={`code-text-${size}`}>
              bland/tokens.css
            </CodeText>{' '}
            once.
          </p>
        ))}
      </div>
    </>
  ),
} satisfies Story;
