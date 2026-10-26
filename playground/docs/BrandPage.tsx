// The Brand theme page: npm run brand in the browser. Pick a color, see the 13 brand steps it makes and the 13
// neutral steps tinted toward it (or pure gray), check them, preview them on components in both themes, apply
// them to the whole site, or go back to Bland's blue.
import { useMemo, useState, type ChangeEvent } from 'react';
import { Alert } from '../../src/components/alert/Alert';
import { Badge } from '../../src/components/badge/Badge';
import { Button } from '../../src/components/button/Button';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { CodeSnippet } from '../../src/components/code-snippet/CodeSnippet';
import { Dropdown } from '../../src/components/dropdown/Dropdown';
import { Indicator } from '../../src/components/indicator/Indicator';
import { Pagination } from '../../src/components/pagination/Pagination';
import { ProgressBar } from '../../src/components/progress-bar/ProgressBar';
import { Radio } from '../../src/components/radio-button/Radio';
import { RadioGroup } from '../../src/components/radio-button/RadioGroup';
import { SectionTabs } from '../../src/components/section-tab/SectionTabs';
import { SegmentedBar } from '../../src/components/segmented-bar/SegmentedBar';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../src/components/table/Table';
import { TextInput } from '../../src/components/text-input/TextInput';
import { Toggle } from '../../src/components/toggle/Toggle';
import { PlusIcon } from '../../src/icons';
import {
  blandNeutrals,
  blandScale,
  check,
  fixScale,
  generate,
  generateNeutrals,
  PAIRS,
  parseHex,
  STEPS,
  toCss,
  type Finding,
  type Scale,
  type Step,
  type Tint,
} from '../../scripts/brand/core';
import { paletteStyle, setAppliedBrand, useAppliedBrand, type Palette } from './brandStore';
import { highlight } from './highlight';
import { brandPage } from './pages';
import { PageHeader, Section } from './parts';

const isHex = (s: string) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());
const normal = (s: string) => `#${parseHex(s).map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
const same = (a: Scale | null | undefined, b: Scale) => !!a && STEPS.every((s) => a[s] === b[s]);
const samePalette = (a: Palette | null, b: Palette) => !!a && same(a.brand, b.brand) && same(a.neutrals, b.neutrals);
/** A miss Bland's own brand shares and this brand makes no worse (as in the command's report). */
const inherited = (f: Finding) => f.baseline < f.min && f.ratio >= f.baseline - 0.01;

const tintItems = [
  { id: 'full', label: 'Tinted' },
  { id: 'subtle', label: 'Subtle' },
  { id: 'none', label: 'Pure gray' },
];
const tintNote: Record<Tint, string> = {
  full: 'Grays lean toward the brand as much as Bland’s lean toward its blue (less for warm and yellow hues).',
  subtle: 'Grays lean toward the brand half as much.',
  none: 'Pure gray, with no hue.',
};

const anchorItems = STEPS.filter((s) => s !== '0').map((s) => ({ id: s, label: s === '600' ? '600 (primary fills)' : s, textValue: s }));

export function BrandPage() {
  const applied = useAppliedBrand();
  const [input, setInput] = useState(applied?.brand['600'] ?? blandScale['600']);
  const [at, setAt] = useState<Step>('600');
  const [tint, setTint] = useState<Tint>('full');
  const [fixed, setFixed] = useState<Scale | null>(null);

  const valid = isHex(input);
  // Bland's own blue on 600 is Bland's scale exactly (generating it again lands within 1/255).
  const generated = useMemo(
    () => (!valid ? null : normal(input) === blandScale['600'] && at === '600' ? blandScale : generate(normal(input), at)),
    [input, at, valid],
  );
  const scale = fixed ?? generated ?? blandScale;
  const neutrals = useMemo(() => generateNeutrals(scale, tint), [scale, tint]);
  const palette = useMemo(() => ({ brand: scale, neutrals }), [scale, neutrals]);
  const findings = useMemo(() => check(scale, neutrals), [scale, neutrals]);
  const misses = findings.filter((f) => !inherited(f));
  const known = findings.filter(inherited);
  const isBland = same(blandScale, scale) && same(blandNeutrals, neutrals);

  const edit = (value: string) => {
    setInput(value);
    setFixed(null);
  };
  const reset = () => {
    setInput(blandScale['600']);
    setAt('600');
    setTint('full');
    setFixed(null);
    setAppliedBrand(null);
  };

  return (
    <>
      <PageHeader title="Brand theme" href={brandPage.href}>
        <p>
          Bland’s brand is 13 color steps every brand-colored token is built on, and its 13 neutral steps lean toward it. Pick a project’s color to make both sets from it,
          check their contrast, preview them in both themes and apply them across this site. Projects ship the result as a small CSS file loaded after Bland’s tokens.
          The same tool runs as <code>npm run brand</code>.
        </p>
      </PageHeader>

      <Section title="Pick a color">
        <div className="docs-brand-form">
          <TextInput
            label="Brand color"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => edit(e.target.value)}
            status={valid ? 'default' : 'danger'}
            helperText={valid ? 'A hex color, typed or picked.' : 'Enter a hex color such as #ff5a1f.'}
            spellCheck={false}
            leading={
              <input
                type="color"
                className="docs-color-picker bland-focus-ring"
                aria-label="Pick a brand color"
                value={valid ? normal(input) : blandScale['600']}
                onChange={(e) => edit(e.target.value)}
              />
            }
          />
          <Dropdown
            label="Color sits on step"
            helperText="600 is the step primary fills use. Very dark or light brands sit better lower or higher."
            items={anchorItems}
            value={at}
            onValueChange={(id) => {
              if (typeof id === 'string') {
                setAt(id as Step);
                setFixed(null);
              }
            }}
          />
        </div>
        <div className="docs-brand-tint">
          <span className="docs-brand-tint-label" id="brand-tint-label">
            Neutrals
          </span>
          <SegmentedBar aria-labelledby="brand-tint-label" name="brand-tint" items={tintItems} value={tint} onValueChange={(id) => setTint(id as Tint)} />
          <p className="docs-note">{tintNote[tint]}</p>
        </div>
        <div className="docs-brand-actions">
          <Button disabled={samePalette(applied, palette) || (isBland && !applied)} onClick={() => setAppliedBrand(palette)}>
            {samePalette(applied, palette) ? 'Applied to the site' : 'Apply to the site'}
          </Button>
          <Button type="secondary" disabled={misses.length === 0} onClick={() => setFixed(fixScale(scale, neutrals))}>
            Fix contrast
          </Button>
          <Button type="stroke" disabled={isBland && !applied && at === '600' && tint === 'full'} onClick={reset}>
            Reset to Bland
          </Button>
        </div>
      </Section>

      <Section title="Scale">
        <p className="docs-note">{fixed ? 'With the contrast fixes applied.' : isBland ? 'Bland’s own blue.' : `Made from ${normal(input)} on step ${at}.`} Bland’s scales are underneath for comparison.</p>
        <ScaleRow label="This brand" scale={scale} />
        <ScaleRow label="Its neutrals" scale={neutrals} />
        <ScaleRow label="Bland" scale={blandScale} />
        <ScaleRow label="Bland’s neutrals" scale={blandNeutrals} />
      </Section>

      <Section title="Contrast">
        {misses.length === 0 ? (
          <Alert status="success">All {PAIRS.length} brand pairings pass in light and dark.</Alert>
        ) : (
          <>
            <Alert status="warning">
              {misses.length} of {PAIRS.length * 2} pairings miss their minimum. Fix contrast moves the steps named, or keep a miss on purpose.
            </Alert>
            <Findings items={misses} />
          </>
        )}
        {known.length > 0 && (
          <p className="docs-note">
            Below the minimum with Bland’s own brand too, and no worse here:{' '}
            {known.map((f) => `${f.where} (${f.mode}, ${f.ratio.toFixed(2)}:1)`).join('; ')}.
          </p>
        )}
      </Section>

      <Section title="Preview">
        <p className="docs-note">This brand on components, before it is applied. Apply to the site to see it on every page.</p>
        <div className="docs-brand-previews">
          {(['light', 'dark'] as const).map((theme) => (
            <div key={theme} className="docs-brand-preview bland-smooth" data-theme={theme} style={paletteStyle(palette)}>
              <span className="docs-brand-preview-label">{theme === 'light' ? 'Light' : 'Dark'}</span>
              <Sample />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Use it in a project">
        <p className="docs-note">Load it after Bland’s tokens. It overrides the brand and neutral steps at :root, and every brand-colored and neutral token follows in both themes.</p>
        <CodeSnippet code={{ css: toCss(scale, isBland ? 'Bland’s own blue' : `made from ${normal(input)}, neutrals ${tint === 'none' ? 'pure gray' : `${tint} tint`}`, neutrals) }} languages={[{ id: 'css', label: 'CSS' }]} highlight={highlight} />
      </Section>
    </>
  );
}

function ScaleRow({ label, scale }: { label: string; scale: Scale }) {
  return (
    <figure className="docs-brand-scale">
      <figcaption>{label}</figcaption>
      <ol>
        {STEPS.map((s) => (
          <li key={s}>
            <span className="docs-brand-chip bland-smooth" style={{ background: scale[s] }} />
            <span className="docs-brand-step">{s}</span>
            <code className="docs-value">{scale[s]}</code>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function Findings({ items }: { items: Finding[] }) {
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
            <TableCell>{f.advice.replace(/^./, (c) => c.toUpperCase())}</TableCell>
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
