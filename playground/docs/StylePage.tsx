// Style pages, generated from tokens/tokens.json. Samples use the CSS variables themselves,
// so they follow the theme switch and always show what the generated CSS really holds.
import { useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { Button } from '../../src/components/button/Button';
import { CodeSnippet } from '../../src/components/code-snippet/CodeSnippet';
import { Icon } from '../../src/components/icon/Icon';
import * as BlandIcons from '../../src/icons';
import { bySize, groupBy, inCollection, tokens, stylePages, type StylePageId, type Token } from './data';
import { highlight } from './highlight';
import { ArrowFatUpIcon } from './icons';
import { isApple } from './Search';
import { leads } from './leads';
import { PageHeader, Prose, Section, TokenName, TokenTable } from './parts';

const v = (t: Token) => `var(${t.css})`;
const px = (t: Token) => parseFloat(t.light);

export function StylePage({ id }: { id: StylePageId }) {
  const title = stylePages.find((p) => p.id === id)!.title;
  const Page = pages[id];
  const content = (
    <>
      <PageHeader title={title} href={`#/styles/${id}`}>
        <p>
          <Prose>{leads[id]}</Prose>
        </p>
      </PageHeader>
      <Page />
      <p className="docs-footnote">
        Copy a token name with the button beside it.
      </p>
    </>
  );
  // The Grid page is laid out on the grid it documents (inset: the docs column has its own padding).
  return id === 'grid' ? <GridLayout>{content}</GridLayout> : content;
}

const pages: Record<StylePageId, () => ReactElement> = {
  colors: ColorsPage,
  typography: TypographyPage,
  spacing: () => (
    <Section title="Spacing">
      <TokenTable items={bySize(inCollection('Spacing').filter((t) => !t.name.startsWith('Layout/')))} sample={(t) => <span className="docs-bar" style={{ width: v(t) }} />} />
    </Section>
  ),
  radius: () => (
    <Section title="Corner radius">
      <TokenTable
        items={bySize(inCollection('Corner Radius'))}
        sample={(t) => <span className="docs-radius bland-smooth" style={{ '--bland-radius': v(t) } as CSSProperties} />}
      />
    </Section>
  ),
  stroke: () => (
    <Section title="Stroke">
      <TokenTable items={bySize(inCollection('Stroke'))} sample={(t) => <span className="docs-stroke" style={{ borderTopWidth: v(t) }} />} />
    </Section>
  ),
  elevation: () => (
    <>
      <Section title="Elevation styles">
        <div className="docs-elevations">
          {inCollection('Effect styles').map((t) => (
            <figure key={t.css} className="docs-elevation bland-smooth" style={{ boxShadow: v(t) }}>
              <figcaption>
                <TokenName css={t.css} />
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Section title="Elevation geometry" note="The offsets, blurs and spreads the elevation styles are made of.">
        <TokenTable items={inCollection('Effects')} />
      </Section>
    </>
  ),
  motion: MotionPage,
  breakpoints: () => (
    <Section title="Breakpoints">
      <TokenTable items={bySize(inCollection('Breakpoints'))} />
    </Section>
  ),
  grid: GridPage,
  sizing: () => (
    <>
      {groupBy(bySize(inCollection('Sizing')), (t) => t.name.split('/')[0]!).map(([group, items]) => (
        <Section key={group} title={group}>
          <TokenTable items={items} sample={(t) => (px(t) <= 640 ? <span className="docs-bar" style={{ width: v(t) }} /> : null)} />
        </Section>
      ))}
    </>
  ),
  icons: IconsPage,
};

function ColorsPage() {
  const theme = bySize(inCollection('Theme'));
  const groups = groupBy(theme, (t) => t.name.split('/')[0]!);
  const semantic = ['Text', 'Icon', 'Surface', 'Border', 'Shadow', 'Scrollbar'];
  const ordered = [...groups.filter(([g]) => semantic.includes(g)).sort((a, b) => semantic.indexOf(a[0]) - semantic.indexOf(b[0])), ...groups.filter(([g]) => !semantic.includes(g))];
  return (
    <>
      <Section
        title="Brand"
        note={
          <>
            The 13 steps every brand-colored token is built on. A project swaps in its own brand by overriding them; make a set from one color on the{' '}
            <a href="#/brand">Brand theme</a> page. Components never use the steps directly.
          </>
        }
      >
        <TokenTable items={inCollection('Brand')} sampleLabel="Color" sample={(t) => <span className="docs-swatch bland-smooth" style={{ background: v(t) }} />} />
      </Section>
      {ordered.map(([group, items], i) => (
        <Section key={group} title={group} note={i === semantic.length ? 'Component colors follow. Each component has its own, so one can change without touching the others.' : undefined}>
          <TokenTable items={items} sampleLabel="Color" sample={(t) => <span className="docs-swatch bland-smooth" style={{ background: v(t) }} />} />
        </Section>
      ))}
    </>
  );
}

function TypographyPage() {
  const styles = inCollection('Text styles').filter((t) => t.type === 'FONT');
  const parts = inCollection('Text styles').filter((t) => t.type !== 'FONT');
  return (
    <>
      <Section
        title="Font families"
        note="The two families every text style reads: sans for UI text, mono for code. A project changes its fonts by setting them in its brand file, beside its brand colors, and loading the font files; every text style follows. Components use the text styles, never the families alone."
      >
        <TokenTable items={inCollection('Font families')} sample={(t) => <span style={{ fontFamily: v(t) }}>Aa</span>} />
      </Section>
      <Section title="Text styles">
        <div className="docs-type-list">
          {styles.map((t) => (
            <div key={t.css} className="docs-type-row">
              <div className="docs-type-sample" style={{ font: v(t), textDecoration: t.name.includes('underline') ? 'underline' : undefined }}>
                {t.name.startsWith('Code/') ? `const style = '${t.name.split('/')[1]}';` : t.name.split('/')[1]!.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())}
              </div>
              <div className="docs-type-meta">
                <TokenName css={t.css} />
                <code className="docs-value">{t.light}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Line height and letter spacing" note="Each text style's line height and letter spacing on their own. The font shorthand can't set letter spacing, so set it beside the style. Use a line height to size something by lines of text.">
        <TokenTable items={parts} />
      </Section>
    </>
  );
}

function MotionPage() {
  // Play all runs every dot; the Easings button replays only the easing dots.
  const [run, setRun] = useState(0);
  const [easingRun, setEasingRun] = useState(0);
  const motion = inCollection('Motion');
  // Shortest first, the delays and hold times among the animation durations.
  const durations = motion.filter((t) => t.type === 'TIMING').sort((a, b) => parseFloat(a.light) - parseFloat(b.light));
  const easings = motion.filter((t) => t.type === 'EASING');
  const track = (style: CSSProperties, runs = run) => (
    <span className="docs-motion-track">
      <span key={runs} className="docs-motion-dot" data-run={runs > 0 || undefined} style={style} />
    </span>
  );
  return (
    <>
      <Section
        title="Durations"
        note="Press Play all: each dot moves over its duration with the out easing."
        action={
          <Button size="sm" type="secondary" onClick={() => {
              setRun((r) => r + 1);
              setEasingRun((r) => r + 1);
            }}>
            Play all
          </Button>
        }
      >
        <TokenTable items={durations} className="docs-motion-tokens" sample={(t) => track({ animationDuration: v(t), animationTimingFunction: 'var(--easing-out)' })} />
      </Section>
      <Section
        title="Easings"
        note="Press Play: each dot moves over 400ms with its easing."
        action={
          <Button size="sm" type="secondary" onClick={() => setEasingRun((r) => r + 1)}>
            Play
          </Button>
        }
      >
        <TokenTable items={easings} className="docs-motion-tokens" sample={(t) => track({ animationDuration: 'var(--duration-xl)', animationTimingFunction: v(t) }, easingRun)} />
      </Section>
    </>
  );
}

// Screen widths from the Figma grid frames. Each frame is a real .bland-grid with that layout's
// count, gutter and minimum margin set inline (media queries follow the window, not the frame), so it
// shows the column width and margins the rule gives at that width.
const GRID_LAYOUTS = {
  'Mobile/sm': { columns: '--layout-columns-mobile', gutter: '--space-sm', margin: '--space-lg', cap: undefined },
  'Mobile/lg': { columns: '--layout-columns-mobile', gutter: '--space-sm', margin: '--space-lg', cap: undefined },
  'Tablet/sm': { columns: '--layout-columns-tablet', gutter: '--space-lg', margin: '--space-2xl', cap: undefined },
  'Tablet/lg': { columns: '--layout-columns-tablet', gutter: '--space-lg', margin: '--space-2xl', cap: undefined },
  'Desktop/sm': { columns: '--layout-columns-desktop', gutter: '--space-lg', margin: '--space-6xl', cap: '--layout-max-width-sm' },
  'Desktop/md': { columns: '--layout-columns-desktop', gutter: '--space-lg', margin: '--space-6xl', cap: '--layout-max-width-md' },
  'Desktop/lg': { columns: '--layout-columns-desktop', gutter: '--space-lg', margin: '--space-6xl', cap: '--layout-max-width-lg' },
} as const;
const GRID_FRAMES = [
  { layout: 'Mobile/sm', width: 375 },
  { layout: 'Mobile/lg', width: 412 },
  { layout: 'Tablet/sm', width: 768 },
  { layout: 'Tablet/lg', width: 1024 },
  { layout: 'Desktop/sm', width: 1280 },
  { layout: 'Desktop/sm', width: 1440 },
  { layout: 'Desktop/md', width: 1536 },
  { layout: 'Desktop/lg', width: 1920 },
] as const;

const tokenPx = (css: string) => parseFloat(tokens.find((t) => t.css === css)?.light ?? '0');

/** The rule .bland-grid follows, for the captions: columns on the 8 grid, the margins take what is left. */
function gridAt(layout: (typeof GRID_LAYOUTS)[keyof typeof GRID_LAYOUTS], width: number) {
  const n = tokenPx(layout.columns);
  const gutter = tokenPx(layout.gutter);
  const step = tokenPx('--space-sm');
  let inner = width - 2 * tokenPx(layout.margin);
  if (layout.cap) inner = Math.min(inner, tokenPx(layout.cap));
  const column = Math.floor((inner - (n - 1) * gutter) / (n * step)) * step;
  return { n, column, gutter, margin: (width - n * column - (n - 1) * gutter) / 2 };
}

const GRID_HTML = `<main class="bland-grid">
  <header>Full row: no span</header>
  <aside style="--span-md: 2; --span-xl: 2">Filters</aside>
  <section style="--span-md: 4; --span-xl: 6">Results</section>
</main>`;

const GRID_REACT = `export function Results() {
  return (
    <main className="bland-grid">
      <header>Full row: no span</header>
      <aside style={{ '--span-md': 2, '--span-xl': 2 } as React.CSSProperties}>Filters</aside>
      <section style={{ '--span-md': 4, '--span-xl': 6 } as React.CSSProperties}>Results</section>
    </main>
  );
}`;

const GRID_CSS = `/* Or give the spans to your own classes. */
.results-filters {
  --span-md: 2;
  --span-xl: 2;
}

/* Rows are yours: the grid sets column gaps only. */
.results {
  row-gap: var(--space-xl);
}

/* A landing page wants roomier sides on desktop: raise the minimum margin. */
@media (min-width: 1280px) {
  .landing.bland-grid {
    --bland-grid-margin: var(--layout-margin-desktop);
  }
}

/* A dashboard wants less: lower it, or use data-inset for none. */
@media (min-width: 1280px) {
  .dashboard.bland-grid {
    --bland-grid-margin: var(--space-xl);
  }
}`;

/** Scales a fixed-width frame down to fit its column, never up. */
function useFit(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry!.contentRect.width / width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);
  return { ref, zoom };
}

function GridFrame({ frame }: { frame: (typeof GRID_FRAMES)[number] }) {
  const { ref, zoom } = useFit(frame.width);
  const layout = GRID_LAYOUTS[frame.layout];
  const { n, column, gutter, margin } = gridAt(layout, frame.width);
  const style = {
    '--bland-grid-columns': `var(${layout.columns})`,
    '--bland-grid-gutter': `var(${layout.gutter})`,
    '--bland-grid-margin': `var(${layout.margin})`,
    maxWidth: layout.cap ? `calc(var(${layout.cap}) + var(${layout.margin}) * 2)` : 'none',
  } as CSSProperties;
  return (
    <figure className="docs-grid-frame" data-width={frame.width} style={{ '--span-md': 3, '--span-xl': 4 } as CSSProperties}>
      <div ref={ref} className="docs-grid-fit">
        <div className="docs-grid-canvas" style={{ width: frame.width, zoom }}>
          <div className="bland-grid docs-grid-columns" style={style}>
            {Array.from({ length: n }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
      </div>
      <figcaption>
        <strong>
          {frame.layout}, {frame.width}
        </strong>
        : {n} columns of {column}, gutters {gutter}, margins {margin}
      </figcaption>
    </figure>
  );
}

/**
 * The Grid page's own layout: an inset .bland-grid with a switch (and Shift+G, as in Figma) that lays
 * the columns over the page.
 */
function GridLayout({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable="true"]');
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'g' && !typing) setShow((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="bland-grid docs-grid-page" data-inset="">
      {children}
      {/* Drawn like the toolbar's Search Bland button: a label and the shortcut's keys. */}
      <div className="docs-grid-switch">
        <button type="button" className="docs-search-trigger bland-focus-ring bland-smooth" data-on={show || undefined} aria-keyshortcuts="Shift+G" onClick={() => setShow((v) => !v)}>
          {/* The label says what a press does, so no aria-pressed (a pressed state and a changing name contradict). */}
          <span className="docs-search-label bland-smooth">{show ? 'Hide columns' : 'Show columns'}</span>
          <span className="docs-keys" aria-hidden="true">
            <kbd className="docs-key bland-smooth">
              {isApple ? (
                <Icon size="md">
                  <ArrowFatUpIcon />
                </Icon>
              ) : (
                'Shift'
              )}
            </kbd>
            <kbd className="docs-key bland-smooth">G</kbd>
          </span>
        </button>
      </div>
      <div className="docs-grid-overlay" aria-hidden="true" hidden={!show}>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}

function GridPage() {
  const layout = bySize(tokens.filter((t) => t.name.startsWith('Layout/')));
  const cells = [
    { label: 'Full row', spans: {} },
    { label: '4 / 3 / 2', spans: { '--span': 4, '--span-md': 3, '--span-xl': 2 } },
    { label: '4 / 3 / 2', spans: { '--span': 4, '--span-md': 3, '--span-xl': 2 } },
    { label: '2 / 2 / 2', spans: { '--span': 2, '--span-md': 2, '--span-xl': 2 } },
    { label: '2 / 4 / 2', spans: { '--span': 2, '--span-md': 4, '--span-xl': 2 } },
  ];
  return (
    <>
      <Section
        className="bland-grid"
        title="At each breakpoint"
        note={
          <>
            Mobile has 4 columns, tablet 6 and desktop 8. Columns are as wide as fits in steps of 8px, inside a minimum side margin (16px on mobile, 32px on tablet, 64px on
            desktop); the margins take what is left. Desktop columns stop growing at 128px, at 144px from 1536 wide and at 160px from 1920; past that the margins grow.
          </>
        }
      >
        <div className="docs-grid-frames bland-grid">
          {GRID_FRAMES.map((frame) => (
            <GridFrame key={frame.width} frame={frame} />
          ))}
        </div>
      </Section>
      <Section
        className="bland-grid"
        title="Live"
        note={
          <>
            A real <code>bland-grid</code> with <code>data-inset</code> (no side margins, as inside a card). Resize the window to see the spans change at tablet and desktop widths.
            Each label reads mobile / tablet / desktop span.
          </>
        }
      >
        <div className="docs-grid-live">
          <div className="bland-grid" data-inset="">
            {cells.map((c, i) => (
              <div key={i} className="docs-grid-cell" style={c.spans as CSSProperties}>
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section
        className="bland-grid"
        title="Usage"
        note={
          <>
            Add <code>bland-grid</code> to a page’s main container. A child spans <code>--span</code> columns, <code>--span-md</code> from tablet and <code>--span-xl</code> from desktop, each
            falling back to the one before; with none it fills the row, so content stacks on mobile by default. A span larger than the grid is cut to the grid. <code>data-inset</code> drops the
            side margins and the cap for a grid nested in a card, a panel or the area beside a Sidebar. <code>--bland-grid-margin</code> is the minimum margin: raise it for a roomy landing
            page, lower it for a dense dashboard. The grid is optional: components fill whatever holds them.
          </>
        }
      >
        <CodeSnippet
          code={{ html: GRID_HTML, react: GRID_REACT, css: GRID_CSS }}
          languages={[
            { id: 'html', label: 'HTML' },
            { id: 'react', label: 'React' },
            { id: 'css', label: 'CSS' },
          ]}
          highlight={highlight}
        />
      </Section>
      <Section className="bland-grid" title="Tokens" note="The column count for each layout. Column widths aren’t tokens: they follow from the screen width.">
        <TokenTable items={layout} />
      </Section>
    </>
  );
}

function IconsPage() {
  const entries = Object.entries(BlandIcons) as [string, () => ReactElement][];
  return (
    <Section title="Bland icons">
      <div className="docs-icons">
        {entries.map(([name, Glyph]) => (
          <figure key={name} className="docs-icon">
            <Icon size="lg">
              <Glyph />
            </Icon>
            <figcaption title={name}>{name}</figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
