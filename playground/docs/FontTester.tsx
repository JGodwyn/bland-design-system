// The Brand theme page's Fonts tab: try a body and a heading font on the whole docs site before choosing them for
// a project. Each role picks one of six self-hosted presets (fontStore.ts); the pick is set on <html> and every
// page follows. How to use writes the same lines, plus the install and imports for the font files. Code stays
// Geist Mono.
import { useEffect } from 'react';
import { Button } from '../../src/components/button/Button';
import { Dropdown, type DropdownItem } from '../../src/components/dropdown/Dropdown';
import { FONT_PRESETS, PICK_ROLES, loadPreset, presetStack, resetFonts, setFontPick, useFontPicks, type PickRole } from './fontStore';

const ROLES: Record<PickRole | 'code', { title: string; about: string; sample: string }> = {
  body: { title: 'Body', about: 'Every Body text style, in weights 400 and 500.', sample: 'Pack my box with five dozen liquor jugs, then read the small print twice.' },
  heading: { title: 'Heading', about: 'Display, Heading and Title, in weight 600.', sample: 'Headings set the tone' },
  code: { title: 'Code', about: 'Every Code text style stays in Geist Mono, Bland’s code font.', sample: 'const total = items.reduce((sum, x) => sum + x.price, 0);' },
};

const SAME = 'same';
/** The six fonts as Dropdown rows, each in its own font, sans then serif with a line between. */
const fontItems = (role: PickRole): DropdownItem[] =>
  FONT_PRESETS.map((p, i) => ({
    id: p.id,
    label: <span style={{ fontFamily: presetStack(p, role) }}>{p.name}</span>,
    textValue: p.name,
    trailing: <span className="docs-font-kind">{p.kind === 'serif' ? 'Serif' : 'Sans'}</span>,
    divider: p.kind === 'sans' && FONT_PRESETS[i + 1]?.kind === 'serif',
  }));
const ITEMS: Record<PickRole, DropdownItem[]> = {
  body: fontItems('body'),
  heading: [{ id: SAME, label: 'Same as body', divider: true }, ...fontItems('heading')],
};

export function FontTester() {
  const picks = useFontPicks();
  // The presets' @font-face rules, so each option can show in its own font; a font's files download only when
  // text uses it (the open menu, or a pick).
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
      <div className="docs-brand-extras-list">
        {PICK_ROLES.map((role) => (
          <FontField key={role} role={role} value={picks[role] ?? (role === 'body' ? 'inter' : SAME)} />
        ))}
        <section className="docs-brand-extra docs-font" aria-labelledby="font-code">
          <h3 id="font-code" className="docs-brand-chart-title">
            {ROLES.code.title}
          </h3>
          <p className="docs-font-about">{ROLES.code.about}</p>
          <p className="docs-font-sample bland-smooth" data-role="code">
            {ROLES.code.sample}
          </p>
        </section>
      </div>
    </div>
  );
}

/** One role: what it covers, the font, and a line in the role's text style. */
function FontField({ role, value }: { role: PickRole; value: string }) {
  const { title, about, sample } = ROLES[role];
  return (
    <section className="docs-brand-extra docs-font" aria-labelledby={`font-${role}`}>
      <h3 id={`font-${role}`} className="docs-brand-chart-title">
        {title}
      </h3>
      <p className="docs-font-about">{about}</p>
      <Dropdown
        className="docs-font-select"
        label={`${title} font`}
        items={ITEMS[role]}
        value={value}
        onValueChange={(id) => id !== null && setFontPick(role, id === SAME ? null : id)}
      />
      <p className="docs-font-sample bland-smooth" data-role={role}>
        {sample}
      </p>
    </section>
  );
}
