// The Brand theme page (Figma 6773:21840): npm run brand in the browser. Pick a color, see the 13 brand steps it
// makes (the color lands on the step its lightness belongs on) and the 13 neutral steps tinted toward it (or pure
// gray), check them, preview them on components in both themes, apply them to the whole site, or go back to
// Bland's blue.
import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react';
import { Badge } from '../../src/components/badge/Badge';
import { Banner } from '../../src/components/banner/Banner';
import { Button } from '../../src/components/button/Button';
import { IconButton } from '../../src/components/button/IconButton';
import { Modal } from '../../src/components/modal/Modal';
import { Checkbox } from '../../src/components/checkbox/Checkbox';
import { useCopy } from '../../src/components/code-snippet/copy';
import { CodeSnippet } from '../../src/components/code-snippet/CodeSnippet';
import { EmptyState } from '../../src/components/empty-state/EmptyState';
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
import { CheckIcon, PlusIcon, TrashIcon } from '../../src/icons';
import {
  adjustColor,
  blandNeutrals,
  blandScale,
  CHART_COUNT,
  checkChart,
  check,
  contrast,
  EXTRA_PAIRS,
  EXTRA_ROLES,
  extraNameError,
  fixScale,
  generate,
  generateChart,
  generateNeutrals,
  harmonyColor,
  inherited,
  MAX_EXTRAS,
  PAIRS,
  placeStep,
  STEPS,
  toCss,
  type ChartFinding,
  type ChartSeries,
  type Finding,
  type Scale,
  type Step,
  type Tint,
} from '../../scripts/brand/core';
import { paletteStyle, setAppliedBrand, useAppliedBrand, type Palette } from './brandStore';
import { normalHex } from './colorFormats';
import { ColorPicker } from './ColorPicker';
import { highlight } from './highlight';
import { CopySimpleIcon, PencilSimpleLineIcon, SwatchesIcon } from './icons';
import { brandPage } from './pages';
import { PageHeader, Section } from './parts';

const same = (a: Scale | null | undefined, b: Scale) => !!a && STEPS.every((s) => a[s] === b[s]);
const samePalette = (a: Palette | null, b: Palette) => !!a && same(a.brand, b.brand) && same(a.neutrals, b.neutrals);

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
  // While a pointer drags in the picker the contrast message hides, and comes back once it is released.
  const [dragging, setDragging] = useState(false);
  const [extras, setExtras] = useState<ExtraState[]>(savedExtras);
  const [tab, setTab] = useState('brand');
  useEffect(() => saveExtras(extras), [extras]);

  // Bland's own blue is Bland's scale exactly (generating it again lands within 1/255).
  const isBlandColor = input === blandScale['600'];
  const generated = useMemo(() => (isBlandColor ? blandScale : generate(input)), [input, isBlandColor]);
  const scale = fixed ?? generated;
  const neutrals = useMemo(() => generateNeutrals(scale, tint), [scale, tint]);
  const palette = useMemo(() => ({ brand: scale, neutrals, color: input }), [scale, neutrals, input]);
  const findings = useMemo(() => check(scale, neutrals), [scale, neutrals]);
  const misses = findings.filter((f) => !inherited(f));
  // The brand steps are Bland's: its contrast result has nothing to say, whatever the neutral tint (the neutrals keep
  // Bland's contrast) or the extras (they have their own result).
  const brandIsBland = same(blandScale, scale);
  const isBland = brandIsBland && same(blandNeutrals, neutrals) && extras.length === 0;
  const isApplied = samePalette(applied, palette);
  // The step holding the color you entered: the fix never moves it, so your color stays exactly yours.
  const keep = isBlandColor ? undefined : placeStep(input);
  const fixedScale = useMemo(() => (misses.length ? fixScale(scale, neutrals, keep) : scale), [misses.length, scale, neutrals, keep]);
  const canFix = !same(fixedScale, scale);
  // Misses only your own color's step can fix: the fix leaves it, so offer to nudge the color itself.
  const colorFix = useMemo(() => (misses.length && !canFix && keep ? adjustColor(scale, neutrals, keep) : null), [misses.length, canFix, scale, neutrals, keep]);

  const edit = (hex: string) => {
    setInput(normalHex(hex));
    setFixed(null);
  };
  const resetAll = () => {
    edit(blandScale['600']);
    setTint('full');
    setExtras([]);
    setAppliedBrand(null);
  };
  // Extra colors: up to MAX_EXTRAS, each with a name that doesn't clash, made into a scale (fixed when asked).
  const extraScales = extras.map((x) => ({ ...x, scale: x.fixed ?? generate(x.color), error: extraNameError(x.name, extras.filter((o) => o.id !== x.id).map((o) => o.name)) }));
  const validExtras = extraScales.filter((x) => !x.error).map(({ name, scale }) => ({ name, scale }));
  // The chart palette follows the brand, the valid extras (in order) and the neutrals' page color.
  const chart = useMemo(() => generateChart(scale, validExtras, neutrals), [scale, neutrals, JSON.stringify(validExtras)]);
  const updateExtra = (id: string, patch: Partial<ExtraState>) => setExtras((all) => all.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addExtra = () =>
    setExtras((all) => {
      const name = EXTRA_NAMES.find((n) => !all.some((x) => x.name === n)) ?? `color-${all.length + 1}`;
      return [...all, { id: `${Date.now()}`, name, color: harmonyColor(input, all.length), fixed: null }];
    });

  return (
    <>
      <PageHeader title="Brand theme" href={brandPage.href}>
        <p>
          Bland’s brand is 13 color steps every brand-colored token is built on. Pick a project’s color to make a set from it, check its contrast, preview it in both themes
          and apply it across this site. Projects ship the result as a small CSS file loaded after Bland’s tokens. The same tool runs as <code>npm run brand</code>.
        </p>
      </PageHeader>

      {/* Figma 6806:6170: the tools sit in three tabs; the preview stays under them, whichever is open. */}
      <section className="docs-section docs-brand-tabs" id="colors" data-toc="Colors" aria-label="Colors">
        <SectionTabs
          aria-label="Brand theme"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              id: 'brand',
              label: 'Brand colors',
              panel: (
                <div className="docs-brand-panel">
                  <Section
                    title="Brand color"
                    toc={false}
                    className="docs-brand-section"
                    action={
                      <div className="docs-section-actions">
                        <ResetConfirm
                          disabled={isBland && !applied}
                          onReset={resetAll}
                          extras={extras.length}
                        />
                        <Button size="sm" disabled={isApplied || (isBland && !applied)} onClick={() => setAppliedBrand(palette)}>
                          {isApplied ? 'Applied to site' : 'Apply to site'}
                        </Button>
                      </div>
                    }
                  >
                    <ColorCard label="Brand color" pickerLabel="Pick a brand color" color={input} onChange={edit} onDraggingChange={setDragging}>
                      {/* Bland's own palette has nothing to report (hidden, so it leaves with its exit); a project's palette shows its result. */}
                      <Contrast misses={misses} keep={keep} hidden={dragging || (brandIsBland && misses.length === 0)} canFix={canFix} onFix={() => setFixed(fixedScale)} adjustTo={colorFix?.color} onAdjust={() => {
                        if (!colorFix) return;
                        setInput(colorFix.color);
                        setFixed(colorFix.scale);
                      }} />
                    </ColorCard>
                    <ScaleRow label="Brand steps" scale={scale} />
                  </Section>
                  <Section title="Neutral color" toc={false} className="docs-brand-section">
                    <SegmentedBar className="docs-brand-tint" aria-label="Neutrals" name="brand-tint" items={tintItems} value={tint} onValueChange={(id) => setTint(id as Tint)} />
                    <div className="docs-brand-card docs-brand-card-neutral bland-smooth">
                      <Swatch color={neutrals['400']}>
                        <span className="docs-brand-hex">{neutrals['400'].toUpperCase()}</span>
                      </Swatch>
                    </div>
                    <ScaleRow label="Neutral steps" scale={neutrals} />
                  </Section>
                </div>
              ),
            },
            {
              id: 'extras',
              label: 'Extra colors',
              panel: (
                <div className="docs-section docs-brand-section docs-brand-extras">
                  {/* No heading: the tab names it. The note and Add color share the row, the note's first line level with the button. */}
                  <div className="docs-brand-extras-intro">
                    <p className="docs-note">
                      Colors beside the brand, up to {MAX_EXTRAS}, for charts, illustrations or a part of your own UI. Bland’s components don’t use them; your code does,
                      through their roles, which switch in light and dark like the brand’s.
                    </p>
                    <Button size="sm" iconStart={<PlusIcon />} disabled={extras.length >= MAX_EXTRAS} onClick={addExtra}>
                      Add color
                    </Button>
                  </div>
                  {extras.length === 0 && (
                    <EmptyState
                      className="docs-brand-empty"
                      title="No colors added"
                      titleAs="h3"
                      description={`You can add up to ${MAX_EXTRAS} extra colors`}
                      illustration={<SwatchesIcon className="docs-brand-empty-icon" aria-hidden="true" />}
                      actions={
                        <Button size="sm" type="stroke" onClick={addExtra}>
                          Add a color
                        </Button>
                      }
                    />
                  )}
                  {extras.length > 0 && (
                  <div className="docs-brand-extras-list">
                  {extraScales.map((x) => (
                    <ExtraColor
                      key={x.id}
                      extra={x}
                      scale={x.scale}
                      error={x.error}
                      neutrals={neutrals}
                      onChange={(patch) => updateExtra(x.id, patch)}
                      onRemove={() => setExtras((all) => all.filter((o) => o.id !== x.id))}
                    />
                  ))}
                  </div>
                  )}
                </div>
              ),
            },
            {
              id: 'chart',
              label: 'Chart colors',
              panel: (
                <div className="docs-section docs-brand-section docs-brand-chart">
                  <p className="docs-note">
                    {CHART_COUNT} colors for data series, used in order: <code>--chart-1</code> is the brand, the extra colors follow, and the rest are made to sit with them, spread
                    round the color wheel. Each holds 3:1 on the page in both themes, and neighbours stay apart for color-blind readers too. Bland’s components don’t use them.
                  </p>
                  <ChartRow chart={chart} />
                  <ChartCheck findings={checkChart(chart, neutrals)} />
                </div>
              ),
            },
            {
              id: 'use',
              label: 'How to use',
              panel: (
                <Section title="Use in a project" toc={false} className="docs-brand-section">
                  <p className="docs-note">
                    Load it after Bland’s tokens. It overrides the brand and neutral steps at :root, and every brand-colored and neutral token follows in both themes. Extra colors
                    add their steps and their roles (<code>--name-surface</code>, <code>--name-text</code> and so on), which your own CSS uses. The chart palette,
                    <code>--chart-1</code> to <code>--chart-{CHART_COUNT}</code>, comes last.
                  </p>
                  <CodeSnippet
                    code={{ css: toCss(scale, isBland ? 'Bland’s own blue' : `made from ${input}, neutrals ${tint === 'none' ? 'pure gray' : `${tint} tint`}`, neutrals, validExtras, chart) }}
                    languages={[{ id: 'css', label: 'CSS' }]}
                    highlight={highlight}
                  />
                </Section>
              ),
            },
          ]}
        />
      </section>

      {/* Nothing of an extra's to preview until one is added (Figma 6806:7199 has no preview). */}
      {!(tab === 'extras' && validExtras.length === 0) && (
      <Section title="Preview" className="docs-brand-section">
        <p className="docs-note">This brand on components, before it is applied. Apply to site to see it on every page.</p>
        <div className="docs-brand-previews">
          {(['light', 'dark'] as const).map((theme) => (
            <div key={theme} className="docs-brand-preview bland-smooth" data-theme={theme} style={{ ...paletteStyle(palette), ...chartStyle(chart, theme) }}>
              <span className="docs-brand-preview-label">{theme === 'light' ? 'Light' : 'Dark'}</span>
              <Sample />
              {validExtras.length > 0 && <ExtraSample extras={validExtras} theme={theme} />}
              <ChartSample count={chart.length} />
            </div>
          ))}
        </div>
      </Section>
      )}


    </>
  );
}

type ExtraState = { id: string; name: string; color: string; fixed: Scale | null };
const EXTRA_NAMES = ['accent', 'highlight', 'illustration'];
const EXTRAS_KEY = 'bland-docs-extras';

/** The extra colors are kept for the visit, like an applied brand (they don't change the site, so they aren't applied). */
function savedExtras(): ExtraState[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem(EXTRAS_KEY) ?? '[]') as ExtraState[];
    return Array.isArray(raw) ? raw.slice(0, MAX_EXTRAS) : [];
  } catch {
    return [];
  }
}
function saveExtras(extras: ExtraState[]) {
  try {
    if (extras.length) sessionStorage.setItem(EXTRAS_KEY, JSON.stringify(extras));
    else sessionStorage.removeItem(EXTRAS_KEY);
  } catch {
    /* Private mode: they last until the page reloads. */
  }
}

/**
 * A color you tap to change (Figma 6806:6170's brand card): the swatch, its hex, a copy button, and its contrast
 * result under them. The picker opens
 * where it was tapped (a zero-size anchor there), or under the hex from the keyboard. The anchor is in state, not a
 * ref read during render: the popover needs it on the render that opens it.
 */
function ColorCard({
  label,
  pickerLabel,
  color,
  onChange,
  onDraggingChange,
  children,
  tint,
}: {
  label: string;
  pickerLabel: string;
  color: string;
  onChange: (hex: string) => void;
  onDraggingChange: (dragging: boolean) => void;
  /** Under the swatch, inside the card: its contrast result (Figma 6806:8805). */
  children?: ReactNode;
  /** The card's fill in light and dark: an extra's own surface-light role. Omitted, the brand's (surface-brand-light). */
  tint?: { light: string; dark: string };
}) {
  const [picking, setPicking] = useState<{ instant: boolean; x: number; y: number } | null>(null);
  const [hero, setHero] = useState<HTMLDivElement | null>(null);
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  const pick = useRef<HTMLButtonElement>(null);
  return (
    <div
      className="docs-brand-card bland-smooth"
      data-tint={tint ? '' : undefined}
      style={tint ? ({ '--docs-tint-light': tint.light, '--docs-tint-dark': tint.dark } as CSSProperties) : undefined}
    >
      <span className="docs-brand-card-label" aria-hidden="true">
        Tap to change
      </span>
      <Swatch color={color} ref={setHero}>
        <span ref={setAnchor} className="docs-brand-anchor" style={{ left: picking?.x ?? 0, top: picking?.y ?? 0 }} aria-hidden="true" />
        <button
          ref={pick}
          type="button"
          className="docs-brand-pick bland-focus-ring"
          aria-label={`${label} ${color.toUpperCase()}, change it`}
          aria-expanded={!!picking}
          aria-haspopup="dialog"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            if (picking || !hero) return setPicking(null);
            const box = hero.getBoundingClientRect();
            const button = e.currentTarget;
            const keyboard = e.detail === 0;
            setPicking({
              instant: keyboard,
              x: keyboard ? button.offsetLeft : e.clientX - box.left,
              y: keyboard ? button.offsetTop + button.offsetHeight : e.clientY - box.top,
            });
          }}
        >
          {color.toUpperCase()}
        </button>
      </Swatch>
      <Popover
        open={!!picking}
        reference={anchor}
        placement="bottom"
        instant={picking?.instant ?? true}
        onClose={() => setPicking(null)}
        returnFocus={pick}
        role="dialog"
        aria-label={pickerLabel}
      >
        <ColorPicker value={color} onChange={onChange} onDraggingChange={onDraggingChange} />
      </Popover>
      {children}
    </div>
  );
}

/** One extra color: its name, the color, its steps, its roles in both modes and its own contrast check. */
function ExtraColor({
  extra,
  scale,
  error,
  neutrals,
  onChange,
  onRemove,
}: {
  extra: ExtraState;
  scale: Scale;
  error?: string;
  neutrals: Scale;
  onChange: (patch: Partial<ExtraState>) => void;
  onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const keep = placeStep(extra.color);
  const misses = useMemo(() => check(scale, neutrals, EXTRA_PAIRS).filter((f) => !inherited(f)), [scale, neutrals]);
  const fixed = useMemo(() => (misses.length ? fixScale(scale, neutrals, keep, EXTRA_PAIRS) : scale), [misses.length, scale, neutrals, keep]);
  const canFix = !same(fixed, scale);
  const colorFix = useMemo(() => (misses.length && !canFix ? adjustColor(scale, neutrals, keep, EXTRA_PAIRS) : null), [misses.length, canFix, scale, neutrals, keep]);
  const label = error ? 'Extra color' : `Extra color ${extra.name}`;
  const errorId = useId();
  // The card takes the extra's own quiet fill, as the brand's card takes the brand's: 50 in light, 1000 in dark.
  const lightRole = EXTRA_ROLES.find((r) => r.role === 'surface-light')!;
  return (
    <div className="docs-brand-extra">
      <div className="docs-brand-extra-head">
        {/* The name is its heading, edited in place (Figma 6806:8801: the name with a pencil). */}
        <label className="docs-brand-extra-name">
          <input
            aria-label="Name"
            value={extra.name}
            size={Math.max(extra.name.length, 1)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ name: e.target.value.trim().toLowerCase() })}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            spellCheck={false}
            autoComplete="off"
          />
          <Icon size="md" className="docs-brand-extra-pencil">
            <PencilSimpleLineIcon />
          </Icon>
        </label>
        <IconButton size="sm" type="stroke" emotion="danger" icon={<TrashIcon />} aria-label={`Remove ${error ? 'this color' : extra.name}`} onClick={onRemove} />
      </div>
      {error && (
        <p id={errorId} className="docs-brand-extra-error">
          {error}
        </p>
      )}
      <ColorCard
        label={label}
        pickerLabel={`Pick a color for ${error ? 'this extra color' : extra.name}`}
        color={extra.color}
        onChange={(hex) => onChange({ color: normalHex(hex), fixed: null })}
        onDraggingChange={setDragging}
        tint={{ light: scale[lightRole.light], dark: scale[lightRole.dark] }}
      >
        <Contrast misses={misses} keep={keep} hidden={dragging} total={EXTRA_PAIRS.length * 2} canFix={canFix} onFix={() => onChange({ fixed })} adjustTo={colorFix?.color} onAdjust={() => colorFix && onChange({ color: colorFix.color, fixed: colorFix.scale })} />
      </ColorCard>
      <ScaleRow label={`${label} steps`} scale={scale} />
      <RoleRow name={error ? 'name' : extra.name} scale={scale} />
    </div>
  );
}

/**
 * An extra color's roles: the token a project uses and its color in the mode the page is in; switch the theme and
 * they switch (Figma 6806:9008's note). Both values are set, and CSS picks the one for the page's theme.
 */
function RoleRow({ name, scale }: { name: string; scale: Scale }) {
  return (
    <ul className="docs-brand-roles" aria-label={`Roles of ${name}`}>
      {EXTRA_ROLES.map((r) => (
        <li key={r.role} title={r.about} style={{ '--docs-role-light': scale[r.light], '--docs-role-dark': scale[r.dark] } as CSSProperties}>
          <span className="docs-brand-chip bland-smooth" />
          <span className="docs-brand-role-name">
            --{name}-{r.role}
          </span>
          <span className="docs-brand-step-hex" data-mode="light">
            {scale[r.light]}
          </span>
          <span className="docs-brand-step-hex" data-mode="dark">
            {scale[r.dark]}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Reset asks first (Figma 6819:11620): what goes, that it can't be undone, and an info Banner pointing to the CSS
 * to copy before it goes. Reset colors is the danger action.
 */
function ResetConfirm({ disabled, onReset, extras }: { disabled: boolean; onReset: () => void; extras: number }) {
  const description = [
    'Reset this color to Bland’s default color.',
    extras > 0 && (extras === 1 ? 'Your extra accent color will also be removed.' : `Your ${extras} extra accent colors will also be removed.`),
    'You can’t undo this.',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Modal
      title="Reset to Bland’s colors?"
      description={description}
      trigger={
        <Button size="sm" type="stroke" disabled={disabled}>
          Reset
        </Button>
      }
      actions={(close) => (
        <>
          <Button
            emotion="danger"
            onClick={() => {
              onReset();
              close();
            }}
          >
            Reset colors
          </Button>
          <Button type="secondary" onClick={close}>
            Cancel
          </Button>
        </>
      )}
    >
      <Banner status="info" colored>
        Copy the CSS under How to use first if you want to keep this palette.
      </Banner>
    </Modal>
  );
}

/** The extra colors' roles in use, inside a preview: their values are set inline for that preview's theme. */
function ExtraSample({ extras, theme }: { extras: { name: string; scale: Scale }[]; theme: 'light' | 'dark' }) {
  return (
    <div className="docs-brand-sample-row">
      {extras.map(({ name, scale }) => {
        const role = (r: string) => scale[EXTRA_ROLES.find((x) => x.role === r)![theme]];
        return (
          <span key={name} className="docs-brand-extra-sample">
            <span className="docs-brand-extra-pill bland-smooth" style={{ background: role('surface-light'), color: role('text'), boxShadow: `inset 0 0 0 var(--stroke-sm) ${role('border')}` }}>
              {name}
            </span>
            <span className="docs-brand-extra-pill bland-smooth" style={{ background: role('surface-strong'), color: 'var(--text-on-color)' }}>
              {name}
            </span>
            <span className="docs-brand-extra-dot" style={{ background: role('surface') }} aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

/** The chart tokens for one theme, set inline on a preview so its sample chart shows this palette. */
const chartStyle = (chart: ChartSeries[], theme: 'light' | 'dark') => Object.fromEntries(chart.map((s, i) => [`--chart-${i + 1}`, s[theme]])) as CSSProperties;

/** Each series: its token, where it comes from, and its color in both themes side by side. */
function ChartRow({ chart }: { chart: ChartSeries[] }) {
  return (
    <ol className="docs-brand-chart-list" aria-label="Chart colors">
      {chart.map((s, i) => (
        <li key={i}>
          <span className="docs-brand-role-name">--chart-{i + 1}</span>
          <span className="docs-brand-step-hex">{s.from === 'generated' ? 'Generated' : s.from === 'brand' ? 'Brand' : `Extra: ${s.from}`}</span>
          <span className="docs-brand-chart-modes">
            {(['light', 'dark'] as const).map((mode) => (
              <span key={mode} className="docs-brand-chart-mode">
                <span className="docs-brand-chip bland-smooth" style={{ background: s[mode] }} />
                <span className="docs-brand-step-hex">
                  {mode === 'light' ? 'Light' : 'Dark'}
                  <br />
                  {s[mode]}
                </span>
              </span>
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The chart palette's check: a pass, or each miss (fails) and near miss (label those series) in a list. */
function ChartCheck({ findings }: { findings: ChartFinding[] }) {
  const fails = findings.filter((f) => f.level === 'fail');
  if (findings.length === 0) {
    return (
      <Banner className="docs-brand-chart-check" status="success" colored>
        Chart colors check out: 3:1 on the page and neighbours apart, in both themes
      </Banner>
    );
  }
  return (
    <Banner
      className="docs-brand-chart-check"
      status={fails.length ? 'warning' : 'info'}
      colored
      orientation="vertical"
      title={fails.length ? 'Chart colors warning' : 'Label these series'}
    >
      <ul className="docs-brand-chart-findings">
        {findings.map((f, i) => (
          <li key={i}>
            {f.mode === 'light' ? 'Light' : 'Dark'}: {f.text}.
          </li>
        ))}
      </ul>
    </Banner>
  );
}

/** A small stacked bar chart in the preview: every series in order, so neighbours touch as they do in a chart. */
const CHART_ROWS = [
  { label: 'North', values: [18, 14, 12, 10, 9, 8, 6, 5] },
  { label: 'South', values: [12, 16, 8, 12, 10, 6, 9, 7] },
  { label: 'West', values: [20, 9, 13, 7, 12, 10, 5, 8] },
];
function ChartSample({ count }: { count: number }) {
  const series = Array.from({ length: count }, (_, i) => i);
  return (
    <figure className="docs-brand-chart-sample" aria-label="Sample chart">
      {CHART_ROWS.map((row) => (
        <div key={row.label} className="docs-brand-chart-bar">
          <span className="docs-brand-step-hex">{row.label}</span>
          <span className="docs-brand-chart-track">
            {series.map((i) => (
              <span key={i} style={{ flexGrow: row.values[i] ?? 1, background: `var(--chart-${i + 1})` }} title={`Series ${i + 1}: ${row.values[i]}`} />
            ))}
          </span>
        </div>
      ))}
      <figcaption className="docs-brand-chart-legend">
        {series.map((i) => (
          <span key={i}>
            <span className="docs-brand-chart-dot" style={{ background: `var(--chart-${i + 1})` }} aria-hidden="true" />
            Series {i + 1}
          </span>
        ))}
      </figcaption>
    </figure>
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

/**
 * The contrast check. Misses Bland's own brand shares (and this brand makes no worse) count as passing: they are
 * Bland's to fix, not a project's. Hidden (a drag in the picker, or Bland's own palette) it fades and scales down
 * while its space folds away; it comes back the same path, and each new result eases in.
 */
function Contrast({
  misses: current,
  keep,
  hidden,
  total = PAIRS.length * 2,
  canFix,
  onFix,
  adjustTo,
  onAdjust,
}: {
  misses: Finding[];
  keep?: Step;
  hidden: boolean;
  total?: number;
  canFix: boolean;
  onFix: () => void;
  /** Your color moved just enough to clear the misses only it can fix (when the fix has nothing else to move). */
  adjustTo?: string;
  onAdjust: () => void;
}) {
  const [open, setOpen] = useState(false);
  const breakdown = useId();
  // While hidden it keeps showing the last result, so the exit plays out on what was there, not on a new result.
  const shown = useRef(current);
  if (!hidden) shown.current = current;
  const misses = shown.current;
  const result = misses.length === 0 ? 'ok' : `miss-${misses.length}`;
  return (
    <div className="docs-brand-contrast docs-fold" hidden={hidden}>
      <div className="docs-fold-inner">
      <div key={result} className="docs-brand-contrast-result">
        {misses.length === 0 ? (
          <Banner status="success" colored>
            Contrast checks out
          </Banner>
        ) : (
          <Banner
            status="warning"
            colored
            orientation="vertical"
            title="Contrast warning"
            actions={
              <>
                {canFix || !adjustTo ? (
                  <Button size="sm" disabled={!canFix} onClick={onFix}>
                    Fix contrast
                  </Button>
                ) : (
                  <Button size="sm" onClick={onAdjust}>
                    Adjust my color
                  </Button>
                )}
                <Button size="sm" type="stroke" aria-expanded={open} aria-controls={breakdown} onClick={() => setOpen(!open)}>
                  {open ? 'Hide breakdown' : 'Show breakdown'}
                </Button>
              </>
            }
          >
            {canFix || !adjustTo
              ? `${misses.length} of ${total} pairings miss their minimum. Fix contrast moves the steps named, or keep a miss on purpose.`
              : `${misses.length} of ${total} pairings miss their minimum, and only your color can fix ${misses.length === 1 ? 'it' : 'them'}. Adjust my color moves it to ${adjustTo.toUpperCase()}, a small change in lightness, or keep the miss on purpose.`}
          </Banner>
        )}
      </div>
      {misses.length > 0 && (
        <div id={breakdown} className="docs-fold" hidden={!open}>
          <div className="docs-fold-inner">
            <Findings items={misses} keep={keep} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function Findings({ items, keep }: { items: Finding[]; keep?: Step }) {
  return (
    <Table size="md" className="docs-data bland-smooth" aria-label="Pairings below their minimum">
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
            <TableCell>{f.steps.every((step) => step === keep) ? `Step ${keep} is your color: adjust it, keep the miss, or pick another color` : f.advice.replace(/^./, (c) => c.toUpperCase())}</TableCell>
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
