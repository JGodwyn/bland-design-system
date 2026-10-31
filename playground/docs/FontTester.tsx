// The Brand theme page's Fonts tab (Figma: Brand theme / Fonts, 6907:11680): try a body and a heading font on the
// whole docs site before choosing them for a project. Each role is a card: the font in a Chip, a dark sample in the
// role's text style that opens the list of six self-hosted presets (fontStore.ts), and what the role covers. The
// pick is set on <html> and every page follows. How to use writes the same lines, plus the install and imports for
// the font files. Code stays Geist Mono.
import { useEffect, useId, useState } from 'react';
import { Button } from '../../src/components/button/Button';
import { Chip } from '../../src/components/chip/Chip';
import { Icon } from '../../src/components/icon/Icon';
import { ListItem } from '../../src/components/list/ListItem';
import { Radio } from '../../src/components/radio-button/Radio';
import { RadioGroup } from '../../src/components/radio-button/RadioGroup';
import { CaretDownIcon } from '../../src/icons';
import { FONT_PRESETS, PICK_ROLES, loadPreset, presetOf, presetStack, resetFonts, setFontPick, useFontPicks, type PickRole } from './fontStore';
import { TextAaIcon } from './icons';

type Role = PickRole | 'code';
const ROLES: Record<Role, { title: string; about: string; sample: string }> = {
  body: { title: 'Body', about: 'Every Body text style, in weights 400 and 500.', sample: 'Pack my box with five dozen liquor jugs, then read the small print twice.' },
  heading: { title: 'Heading', about: 'Display, Heading and Title, in weight 600.', sample: 'Headings set the tone' },
  code: { title: 'Code', about: 'Every Code text style stays in Geist Mono, Bland’s code font.', sample: 'const total = items.reduce((sum, x) => sum + x.price, 0);' },
};

const SAME = 'same';
/** Heading's first option: no font of its own, so it follows the body font. */
const SAME_ROW = { id: SAME, name: 'Same as body', kind: undefined };

export function FontTester() {
  const picks = useFontPicks();
  // The presets' @font-face rules, so each option can show in its own font; a font's files download only when
  // text uses it (an open list, or a pick).
  useEffect(() => FONT_PRESETS.forEach((p) => void loadPreset(p.id)), []);
  return (
    <div className="docs-section docs-brand-section docs-brand-extras">
      <div className="docs-brand-extras-intro">
        <p className="docs-note">
          Try your project’s fonts on this whole site. Every page uses them at once, until you reset or close this tab. How to use shows how to install the one you pick.
        </p>
        <Button size="sm" type="stroke" disabled={!Object.keys(picks).length} onClick={resetFonts}>
          Reset fonts
        </Button>
      </div>
      <div className="docs-font-list">
        {PICK_ROLES.map((role) => (
          <FontCard key={role} role={role} value={picks[role] ?? (role === 'body' ? 'inter' : SAME)} />
        ))}
        <FontCard role="code" value="geist-mono" />
      </div>
    </div>
  );
}

/** One role: its title, then a card with the font, the sample that opens the font list, and what the role covers. */
function FontCard({ role, value }: { role: Role; value: string }) {
  const { title, about, sample } = ROLES[role];
  const [open, setOpen] = useState(false);
  const listId = useId();
  const titleId = `font-${role}`;
  const pickable = role !== 'code';
  const current = role === 'code' ? 'Geist Mono' : value === SAME ? SAME_ROW.name : presetOf(value)!.name;
  const sampleContent = (
    <>
      <span className="docs-font-sample-text">
        <Icon size="md" className="docs-font-sample-icon">
          <TextAaIcon />
        </Icon>
        <span className="docs-font-sample-line">{sample}</span>
      </span>
      {pickable && (
        <Icon size="lg" className="docs-font-caret">
          <CaretDownIcon />
        </Icon>
      )}
    </>
  );
  return (
    <section className="docs-font" aria-labelledby={titleId}>
      <h3 id={titleId} className="docs-brand-chart-title">
        {title}
      </h3>
      <div className="docs-font-card bland-smooth">
        <div className="docs-font-head">
          <Chip size="md">{current}</Chip>
          {pickable && <span className="docs-font-hint">Tap to change</span>}
        </div>
        {pickable ? (
          <button
            type="button"
            className="docs-font-sample bland-smooth bland-focus-ring"
            data-role={role}
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`${title} font: ${current}. Tap to change`}
            onClick={() => setOpen((o) => !o)}
          >
            {sampleContent}
          </button>
        ) : (
          <div className="docs-font-sample bland-smooth" data-role={role}>
            {sampleContent}
          </div>
        )}
        {pickable && (
          <RadioGroup
            id={listId}
            className="docs-font-options"
            aria-labelledby={titleId}
            value={value}
            onValueChange={(id) => setFontPick(role, id === SAME ? null : id)}
            hidden={!open}
          >
            <ul className="docs-font-rows">
              {[...(role === 'heading' ? [SAME_ROW] : []), ...FONT_PRESETS].map((p) => (
                <FontRow key={p.id} role={role} id={p.id} name={p.name} kind={p.kind} />
              ))}
            </ul>
          </RadioGroup>
        )}
        <p className="docs-font-about">{about}</p>
      </div>
    </section>
  );
}

/** A font as a List row: its radio, its name in its own font, and whether it is sans or serif. */
function FontRow({ role, id, name, kind }: { role: PickRole; id: string; name: string; kind?: 'sans' | 'serif' }) {
  const inputId = useId();
  const preset = presetOf(id);
  return (
    <ListItem
      className="docs-font-row"
      leading={<Radio id={inputId} value={id} />}
      title={
        <label htmlFor={inputId} style={preset ? { fontFamily: presetStack(preset, role) } : undefined}>
          {name}
        </label>
      }
      altText={kind ? (kind === 'serif' ? 'Serif' : 'Sans') : undefined}
    />
  );
}
