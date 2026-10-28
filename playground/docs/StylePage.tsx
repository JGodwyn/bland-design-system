// Style pages, generated from tokens/tokens.json. Samples use the CSS variables themselves,
// so they follow the theme switch and always show what the generated CSS really holds.
import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { Button } from '../../src/components/button/Button';
import { CodeSnippet } from '../../src/components/code-snippet/CodeSnippet';
import { Icon } from '../../src/components/icon/Icon';
import * as BlandIcons from '../../src/icons';
import { groupBy, inCollection, tokens, stylePages, tokensExportedAt, type StylePageId, type Token } from './data';
import { highlight } from './highlight';
import { leads } from './leads';
import { PageHeader, Section, TokenName, TokenTable } from './parts';

const v = (t: Token) => `var(${t.css})`;
const px = (t: Token) => parseFloat(t.light);

export function StylePage({ id }: { id: StylePageId }) {
  const title = stylePages.find((p) => p.id === id)!.title;
  const Page = pages[id];
  return (
    <>
      <PageHeader title={title} href={`#/styles/${id}`}>
        {leads[id]}
      </PageHeader>
      <Page />
      <p className="docs-footnote">
        Generated from <code>tokens/tokens.json</code>, exported from Figma {new Date(tokensExportedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}. Copy a token name with the button beside it.
      </p>
    </>
  );
}

const pages: Record<StylePageId, () => ReactElement> = {
  colors: ColorsPage,
  typography: TypographyPage,
  spacing: () => (
    <Section title="Spacing">
      <TokenTable items={inCollection('Spacing').filter((t) => !t.name.startsWith('Layout/'))} sample={(t) => <span className="docs-bar" style={{ width: v(t) }} />} />
    </Section>
  ),
  radius: () => (
    <Section title="Corner radius">
      <TokenTable
        items={inCollection('Corner Radius')}
        sample={(t) => <span className="docs-radius bland-smooth" style={{ '--bland-radius': v(t) } as CSSProperties} />}
      />
    </Section>
  ),
  stroke: () => (
    <Section title="Stroke">
      <TokenTable items={inCollection('Stroke')} sample={(t) => <span className="docs-stroke" style={{ borderTopWidth: v(t) }} />} />
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
      <Section title="Elevation geometry" note="The offsets, blurs and spreads the styles are built from.">
        <TokenTable items={inCollection('Effects')} />
      </Section>
    </>
  ),
  motion: MotionPage,
  breakpoints: () => (
    <Section title="Breakpoints">
      <TokenTable items={inCollection('Breakpoints')} />
    </Section>
  ),
  grid: GridPage,
  sizing: () => (
    <>
      {groupBy(inCollection('Sizing'), (t) => t.name.split('/')[0]!).map(([group, items]) => (
        <Section key={group} title={group}>
          <TokenTable items={items} sample={(t) => (px(t) <= 640 ? <span className="docs-bar" style={{ width: v(t) }} /> : null)} />
        </Section>
      ))}
    </>
  ),
  icons: IconsPage,
};

function ColorsPage() {
  const theme = inCollection('Theme');
  const groups = groupBy(theme, (t) => t.name.split('/')[0]!);
  const semantic = ['Text', 'Icon', 'Surface', 'Border', 'Shadow', 'Scrollbar'];
  const ordered = [...groups.filter(([g]) => semantic.includes(g)).sort((a, b) => semantic.indexOf(a[0]) - semantic.indexOf(b[0])), ...groups.filter(([g]) => !semantic.includes(g))];
  return (
    <>
      <Section
        title="Brand"
        note={
          <>
            The 13 brand steps every brand-colored token is built on, in both themes. A project brings its own by overriding them at <code>:root</code> in a stylesheet loaded after Bland’s;
            components never use them directly. <code>npm run brand</code> makes a starting set from one color and checks the contrast (docs/brand.md).
          </>
        }
      >
        <TokenTable items={inCollection('Brand')} sampleLabel="Color" sample={(t) => <span className="docs-swatch bland-smooth" style={{ background: v(t) }} />} />
      </Section>
      {ordered.map(([group, items], i) => (
        <Section key={group} title={group} note={i === semantic.length ? 'Component colors follow. Each component has its own tokens so it can change without touching the others.' : undefined}>
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
      <Section title="Line height and letter spacing" note="Each text style's line height and letter spacing on their own. The font shorthand can't set letter spacing, so set it beside the style; use a line height to size something by lines of text. The raw type scale is a primitive in Figma and is not emitted.">
        <TokenTable items={parts} />
      </Section>
    </>
  );
}

function MotionPage() {
  const [run, setRun] = useState(0);
  const motion = inCollection('Motion');
  const durations = motion.filter((t) => t.type === 'TIMING');
  const easings = motion.filter((t) => t.type === 'EASING');
  const track = (style: CSSProperties) => (
    <span className="docs-motion-track">
      <span key={run} className="docs-motion-dot" data-run={run > 0 || undefined} style={style} />
    </span>
  );
  return (
    <>
      <div className="docs-actions">
        <Button size="sm" type="secondary" onClick={() => setRun((r) => r + 1)}>
          Play all
        </Button>
      </div>
      <Section title="Durations" note="Each dot travels with easing-out over the duration.">
        <TokenTable items={durations} sample={(t) => track({ animationDuration: v(t), animationTimingFunction: 'var(--easing-out)' })} />
      </Section>
      <Section title="Easings" note="Each dot travels over duration-xl with the easing.">
        <TokenTable items={easings} sample={(t) => track({ animationDuration: 'var(--duration-xl)', animationTimingFunction: v(t) })} />
      </Section>
    </>
  );
}

// The Figma frames each grid style was drawn on: Mobile at 375, Tablet at 768, Desktop/sm at 1440, and
// 1920 to show the cap. Each frame takes the values .bland-grid uses at that width, from the same tokens.
const GRID_FRAMES = [
  { name: 'Mobile', width: 375, columns: '--layout-columns-mobile', gutter: '--space-sm', margin: '--layout-margin-mobile', capped: false },
  { name: 'Tablet', width: 768, columns: '--layout-columns-tablet', gutter: '--space-lg', margin: '--layout-margin-mobile', capped: false },
  { name: 'Desktop', width: 1440, columns: '--layout-columns-desktop', gutter: '--space-lg', margin: '--layout-margin-desktop', capped: true },
  { name: 'Wide desktop', width: 1920, columns: '--layout-columns-desktop', gutter: '--space-lg', margin: '--layout-margin-desktop', capped: true },
] as const;

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
  const style = {
    '--frame-columns': `var(${frame.columns})`,
    '--frame-gutter': `var(${frame.gutter})`,
    '--frame-margin': `var(${frame.margin})`,
    width: frame.width,
    zoom,
  } as CSSProperties;
  return (
    <figure className="docs-grid-frame">
      <div ref={ref} className="docs-grid-fit">
        <div className="docs-grid-canvas" style={style} data-capped={frame.capped || undefined}>
          <div className="docs-grid-columns">
            {Array.from({ length: Number(tokens.find((t) => t.css === frame.columns)?.light ?? 0) }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
      </div>
      <figcaption>
        <strong>{frame.name}</strong>, {frame.width} wide: <code>{frame.columns}</code> columns, <code>{frame.gutter}</code> gutters, <code>{frame.margin}</code> sides
        {frame.capped && (
          <>
            , no wider than <code>--layout-max-width</code>
          </>
        )}
      </figcaption>
    </figure>
  );
}

function GridPage() {
  const layout = tokens.filter((t) => t.name.startsWith('Layout/'));
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
        title="At each breakpoint"
        note="The columns, gutters and side margins .bland-grid takes at each layout, drawn on the Figma grid frames. Columns stretch with the screen; from xl the grid stops growing at --layout-max-width and centres."
      >
        <div className="docs-grid-frames">
          {GRID_FRAMES.map((frame) => (
            <GridFrame key={frame.name} frame={frame} />
          ))}
        </div>
      </Section>
      <Section
        title="Live"
        note={
          <>
            A real <code>.bland-grid</code> with <code>data-inset</code> (no side margins, as inside a card), following this window: resize it to see the spans change at md and xl.
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
        title="Usage"
        note={
          <>
            Add <code>bland-grid</code> to a page’s main container. A child spans <code>--span</code> columns, <code>--span-md</code> from tablet and <code>--span-xl</code> from desktop, each
            falling back to the one before; with none it fills the row, so content stacks on mobile by default. A span larger than the grid is cut to the grid. <code>data-inset</code> drops the
            side margins and the cap for a grid nested in a card, a panel or the area beside a Sidebar. The grid is optional: components fill whatever holds them.
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
      <Section title="Tokens" note="Figma binds the Mobile, Tablet and Desktop/sm grid styles to these. The Desktop md and lg styles and the Dashboard styles stay in Figma only.">
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
