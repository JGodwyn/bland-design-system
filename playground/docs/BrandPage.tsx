// The Brand theme page (Figma 6773:21840): npm run brand in the browser. Pick a color, see the 13 brand steps it
// makes (the color lands on the step its lightness belongs on) and the 13 neutral steps tinted toward it (or pure
// gray), check them, preview them on components in both themes, apply them to the whole site, or go back to
// Bland's blue.
import { useMemo, useRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react';
import { Badge } from '../../src/components/badge/Badge';
import { Banner } from '../../src/components/banner/Banner';
import { Button } from '../../src/components/button/Button';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { useCopy } from '../../src/components/code-snippet/copy';
import { CodeSnippet } from '../../src/components/code-snippet/CodeSnippet';
import { Icon } from '../../src/components/icon/Icon';
import { Indicator } from '../../src/components/indicator/Indicator';
import { Popover } from '../../src/components/overlay/Popover';
import { Pagination } from '../../src/components/pagination/Pagination';
import { ProgressBar } from '../../src/components/progress-bar/ProgressBar';
import { Radio } from '../../src/components/radio-button/Radio';
import { RadioGroup } from '../../src/components/radio-button/RadioGroup';
import { ScrollArea } from '../../src/components/scroll-area/ScrollArea';
import { SectionTabs } from '../../src/components/section-tab/SectionTabs';
import { SegmentedBar } from '../../src/components/segmented-bar/SegmentedBar';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../src/components/table/Table';
import { Toggle } from '../../src/components/toggle/Toggle';
import { CheckIcon, PlusIcon } from '../../src/icons';
import {
  blandNeutrals,
  blandScale,
  check,
  contrast,
  fixScale,
  generate,
  generateNeutrals,
  PAIRS,
  placeStep,
  STEPS,
  toCss,
  type Finding,
  type Scale,
  type Step,
  type Tint,
} from '../../scripts/brand/core';
import { paletteStyle, setAppliedBrand, useAppliedBrand, type Palette } from './brandStore';
import { normalHex } from './colorFormats';
import { ColorPicker } from './ColorPicker';
import { highlight } from './highlight';
import { ArrowClockwiseIcon, CopySimpleIcon } from './icons';
import { brandPage } from './pages';
import { PageHeader, Section } from './parts';

const same = (a: Scale | null | undefined, b: Scale) => !!a && STEPS.every((s) => a[s] === b[s]);
const samePalette = (a: Palette | null, b: Palette) => !!a && same(a.brand, b.brand) && same(a.neutrals, b.neutrals);
/** A miss Bland's own brand shares and this brand makes no worse (as in the command's report). */
const inherited = (f: Finding) => f.baseline < f.min && f.ratio >= f.baseline - 0.01;

const tintItems = [
  { id: 'full', label: 'Tinted' },
  { id: 'subtle', label: 'Subtle' },
  { id: 'none', label: 'Pure gray' },
];

export function BrandPage() {
  const applied = useAppliedBrand();
  const [input, setInput] = useState(applied?.color ?? blandScale['600']);
  const [tint, setTint] = useState<Tint>('full');
  const [fixed, setFixed] = useState<Scale | null>(null);
  const [picking, setPicking] = useState<{ instant: boolean } | null>(null);
  // The anchor in state, not a ref read during render: the popover needs it on the render that opens it.
  const [hero, setHero] = useState<HTMLDivElement | null>(null);
  const pick = useRef<HTMLButtonElement>(null);

  // Bland's own blue is Bland's scale exactly (generating it again lands within 1/255).
  const isBlandColor = input === blandScale['600'];
  const generated = useMemo(() => (isBlandColor ? blandScale : generate(input)), [input, isBlandColor]);
  const scale = fixed ?? generated;
  const neutrals = useMemo(() => generateNeutrals(scale, tint), [scale, tint]);
  const palette = useMemo(() => ({ brand: scale, neutrals, color: input }), [scale, neutrals, input]);
  const findings = useMemo(() => check(scale, neutrals), [scale, neutrals]);
  const misses = findings.filter((f) => !inherited(f));
  const known = findings.filter(inherited);
  const isBland = same(blandScale, scale) && same(blandNeutrals, neutrals);
  const isApplied = samePalette(applied, palette);
  // The step holding the color you entered: the fix never moves it, so your color stays exactly yours.
  const keep = isBlandColor ? undefined : placeStep(input);
  const fixedScale = useMemo(() => (misses.length ? fixScale(scale, neutrals, keep) : scale), [misses.length, scale, neutrals, keep]);

  const edit = (hex: string) => {
    setInput(normalHex(hex));
    setFixed(null);
  };
  const resetAll = () => {
    edit(blandScale['600']);
    setTint('full');
    setAppliedBrand(null);
  };

  return (
    <>
      <PageHeader title="Brand theme" href={brandPage.href}>
        <p>
          Bland’s brand is 13 color steps every brand-colored token is built on. Pick a project’s color to make a set from it, check its contrast, preview it in both themes
          and apply it across this site. Projects ship the result as a small CSS file loaded after Bland’s tokens. The same tool runs as <code>npm run brand</code>.
        </p>
      </PageHeader>

      <Section
        title="Brand color"
        className="docs-brand-section"
        action={
          <Button size="sm" type="stroke" iconStart={<ArrowClockwiseIcon />} disabled={isBlandColor && !fixed} onClick={() => edit(blandScale['600'])}>
            Reset
          </Button>
        }
      >
        <div className="docs-brand-card docs-brand-card-brand bland-smooth">
          <span className="docs-brand-card-label" aria-hidden="true">
            Tap to change
          </span>
          <Swatch color={input} ref={setHero}>
            <button
              ref={pick}
              type="button"
              className="docs-brand-pick bland-focus-ring"
              aria-label={`Brand color ${input.toUpperCase()}, change it`}
              aria-expanded={!!picking}
              aria-haspopup="dialog"
              onClick={(e: MouseEvent) => setPicking(picking ? null : { instant: e.detail === 0 })}
            >
              {input.toUpperCase()}
            </button>
          </Swatch>
          <Popover
            open={!!picking}
            reference={hero}
            placement="bottom-end"
            instant={picking?.instant ?? true}
            onClose={() => setPicking(null)}
            returnFocus={pick}
            role="dialog"
            aria-label="Pick a brand color"
          >
            <ColorPicker value={input} onChange={edit} />
          </Popover>
        </div>
        <ScaleRow label="Brand steps" scale={scale} />
        <Contrast misses={misses} known={known} keep={keep} />
      </Section>

      <Section title="Neutral color" className="docs-brand-section">
        <SegmentedBar className="docs-brand-tint" aria-label="Neutrals" name="brand-tint" items={tintItems} value={tint} onValueChange={(id) => setTint(id as Tint)} />
        <div className="docs-brand-card bland-smooth">
          <Swatch color={neutrals['400']}>
            <span className="docs-brand-hex">{neutrals['400'].toUpperCase()}</span>
          </Swatch>
        </div>
        <ScaleRow label="Neutral steps" scale={neutrals} />
      </Section>

      <Section title="Preview" className="docs-brand-section">
        <p className="docs-note">This brand on components, before it is applied. Apply to site to see it on every page.</p>
        <div className="docs-brand-previews">
          {(['light', 'dark'] as const).map((theme) => (
            <div key={theme} className="docs-brand-preview bland-smooth" data-theme={theme} style={paletteStyle(palette)}>
              <span className="docs-brand-preview-label">{theme === 'light' ? 'Light' : 'Dark'}</span>
              <Sample />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Use in a project" className="docs-brand-section">
        <p className="docs-note">Load it after Bland’s tokens. It overrides the brand and neutral steps at :root, and every brand-colored and neutral token follows in both themes.</p>
        <CodeSnippet
          code={{ css: toCss(scale, isBland ? 'Bland’s own blue' : `made from ${input}, neutrals ${tint === 'none' ? 'pure gray' : `${tint} tint`}`, neutrals) }}
          languages={[{ id: 'css', label: 'CSS' }]}
          highlight={highlight}
        />
      </Section>

      {/* Only while there is something to reset: a color or neutrals other than Bland's, or a brand on the site. */}
      <div className="docs-brand-bar bland-smooth" role="group" aria-label="Brand actions" hidden={isBland && !applied}>
        <div className="docs-brand-bar-start">
          <Button size="sm" emotion="danger" onClick={resetAll}>
            Reset to Bland
          </Button>
          <Button size="sm" type="secondary" disabled={same(fixedScale, scale)} onClick={() => setFixed(fixedScale)}>
            Fix contrast
          </Button>
        </div>
        <Button size="sm" disabled={isApplied} onClick={() => setAppliedBrand(palette)}>
          {isApplied ? 'Applied to site' : 'Apply to site'}
        </Button>
      </div>
    </>
  );
}

/** A big swatch of one color with its hex and a copy button. Its text is white on dark colors, dark on light ones. */
function Swatch({ color, children, ref }: { color: string; children: ReactNode; ref?: Ref<HTMLDivElement> }) {
  const { copied, copy, status } = useCopy('Copied');
  // Light colors take the light theme's bold text, so the hex reads on them in either theme.
  const light = contrast('#ffffff', color) < 3;
  return (
    <div ref={ref} className="docs-brand-swatch bland-smooth" data-theme={light ? 'light' : undefined} data-ink={light ? 'dark' : 'light'} style={{ background: color }}>
      {children}
      <button type="button" className="docs-brand-copy bland-focus-ring" aria-label={`Copy ${color.toUpperCase()}`} onClick={() => copy(color)}>
        <Icon size="lg">{copied ? <CheckIcon /> : <CopySimpleIcon />}</Icon>
      </button>
      {status}
    </div>
  );
}

function ScaleRow({ label, scale }: { label: string; scale: Scale }) {
  return (
    <ScrollArea axis="x" className="docs-brand-scale" viewportProps={{ role: 'group', 'aria-label': label } as HTMLAttributes<HTMLDivElement>}>
      <ol>
        {STEPS.map((s) => (
          <li key={s}>
            <span className="docs-brand-chip bland-smooth" style={{ background: scale[s] }} />
            <span className="docs-brand-step">{s}</span>
            <span className="docs-brand-step-hex">{scale[s]}</span>
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}

function Contrast({ misses, known, keep }: { misses: Finding[]; known: Finding[]; keep?: Step }) {
  const knownText = known.length > 0 ? `Below the minimum with Bland’s own brand too, and no worse here: ${known.map((f) => `${f.where} (${f.mode}, ${f.ratio.toFixed(2)}:1)`).join('; ')}.` : '';
  if (misses.length === 0) return <Banner status={knownText ? 'info' : 'success'}>{knownText || `All ${PAIRS.length} brand pairings pass in light and dark.`}</Banner>;
  return (
    <>
      <Banner status="warning">
        {misses.length} of {PAIRS.length * 2} pairings miss their minimum. Fix contrast moves the steps named, or keep a miss on purpose.
      </Banner>
      <Findings items={misses} keep={keep} />
      {knownText && <Banner status="info">{knownText}</Banner>}
    </>
  );
}

function Findings({ items, keep }: { items: Finding[]; keep?: Step }) {
  return (
    <Table size="md" className="docs-data" aria-label="Pairings below their minimum">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Theme</TableHeaderCell>
          <TableHeaderCell>Where</TableHeaderCell>
          <TableHeaderCell>Contrast</TableHeaderCell>
          <TableHeaderCell>Fix</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((f) => (
          <TableRow key={`${f.mode}${f.fg}${f.bg}`}>
            <TableCell>{f.mode === 'light' ? 'Light' : 'Dark'}</TableCell>
            <TableCell>{f.where}</TableCell>
            <TableCell>
              {f.ratio.toFixed(2)}:1 (needs {f.min}:1)
            </TableCell>
            <TableCell>{f.steps.every((step) => step === keep) ? `Step ${keep} is your color: keep the miss, or pick another color` : f.advice.replace(/^./, (c) => c.toUpperCase())}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Brand-colored parts of the kit, in one place. Interactive, so hover and pressed states show the brand too. */
function Sample() {
  return (
    <div className="docs-brand-sample">
      <div className="docs-brand-sample-row">
        <Button iconStart={<PlusIcon />}>Primary</Button>
        <Button type="secondary">Secondary</Button>
        <Button type="ghost">Ghost</Button>
      </div>
      <div className="docs-brand-sample-row">
        <Badge>Badge</Badge>
        <Badge type="secondary">Badge</Badge>
        <Indicator size="lg">3</Indicator>
        <a href="#/brand" className="docs-brand-link" onClick={(e) => e.preventDefault()}>
          A link
        </a>
      </div>
      <div className="docs-brand-sample-row">
        <Toggle defaultChecked>Toggle</Toggle>
        <Checkbox defaultChecked>Checkbox</Checkbox>
        <RadioGroup aria-label="Radio" defaultValue="a" orientation="horizontal">
          <Radio value="a">Radio</Radio>
        </RadioGroup>
      </div>
      <ProgressBar value={60} label="Progress" />
      <SectionTabs
        aria-label="Section tabs"
        items={[
          { id: 'one', label: 'Overview' },
          { id: 'two', label: 'Activity' },
          { id: 'three', label: 'Settings' },
        ]}
      />
      <Pagination pageCount={5} defaultPage={2} />
    </div>
  );
}
