// Style pages, generated from tokens/tokens.json. Samples use the CSS variables themselves,
// so they follow the theme switch and always show what the generated CSS really holds.
import { useState, type CSSProperties, type ReactElement } from 'react';
import { Button } from '../../src/components/button/Button';
import { Icon } from '../../src/components/icon/Icon';
import * as BlandIcons from '../../src/icons';
import { groupBy, inCollection, stylePages, tokensExportedAt, type StylePageId, type Token } from './data';
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
      <TokenTable items={inCollection('Spacing')} sample={(t) => <span className="docs-bar" style={{ width: v(t) }} />} />
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
