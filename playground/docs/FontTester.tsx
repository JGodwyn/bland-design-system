// The Brand theme page's Fonts tab: try a body, heading and code font on the whole docs site before choosing one
// for a project. A font comes from the viewer's computer (typed), from Google Fonts or from a file; once it renders
// it is set on <html> (fontStore.ts) and every page follows. The CSS under How to use writes the same lines.
import { useState, type FormEvent } from 'react';
import { Button } from '../../src/components/button/Button';
import { FileUpload, type FileUploadFile } from '../../src/components/file-upload/FileUpload';
import { SegmentedBar } from '../../src/components/segmented-bar/SegmentedBar';
import { TextInput, type TextInputStatus } from '../../src/components/text-input/TextInput';
import { FONT_ROLES, type FontRole } from '../../scripts/brand/core';
import {
  FONT_FILE_TYPES,
  fileLoaded,
  firstFamily,
  fontRenders,
  loadFontFiles,
  loadGoogleFont,
  resetFonts,
  setFontPick,
  useFontPicks,
  type FontPick,
  type FontSource,
} from './fontStore';

const ROLES: Record<FontRole, { title: string; bland: string; about: string; sample: string }> = {
  body: { title: 'Body', bland: 'Inter', about: 'Every Body text style, in weights 400 and 500.', sample: 'Pack my box with five dozen liquor jugs, then read the small print twice.' },
  heading: { title: 'Heading', bland: 'Same as body', about: 'Display, Heading and Title, in weight 600. Uses the body font until you set one.', sample: 'Headings set the tone' },
  code: { title: 'Code', bland: 'Geist Mono', about: 'Every Code text style, in weights 400 and 600.', sample: 'const total = items.reduce((sum, x) => sum + x.price, 0);' },
};

const SOURCES = [
  { id: 'local', label: 'Installed' },
  { id: 'google', label: 'Google' },
  { id: 'file', label: 'Upload' },
];
const FROM: Record<FontSource, string> = { local: 'installed', google: 'Google Fonts', file: 'uploaded' };

export function FontTester() {
  const picks = useFontPicks();
  return (
    <div className="docs-section docs-brand-section docs-brand-extras">
      <div className="docs-brand-extras-intro">
        <p className="docs-note">
          Try your project’s fonts on this whole site. Type the name of a font on your computer, load one from Google Fonts, or upload a font file. Every page uses it
          at once, until you reset or close this tab; uploaded files stay only until the page reloads.
        </p>
        <Button size="sm" type="stroke" disabled={!Object.keys(picks).length} onClick={resetFonts}>
          Reset fonts
        </Button>
      </div>
      <div className="docs-brand-extras-list">
        {FONT_ROLES.map((role) => (
          <FontField key={role} role={role} pick={picks[role]} />
        ))}
      </div>
    </div>
  );
}

type Note = { status: TextInputStatus; text: string };

/** One role: where its font comes from, the font, what happened, and a line in the role's text style. */
function FontField({ role, pick }: { role: FontRole; pick?: FontPick }) {
  const { title, bland, about, sample } = ROLES[role];
  const [source, setSource] = useState<FontSource>(pick?.source ?? 'local');
  const [text, setText] = useState(pick && pick.source !== 'file' ? pick.family : '');
  const [note, setNote] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);
  const label = `${title} font`;

  const use = (next: FontPick, text: string) => {
    setFontPick(role, next);
    setNote({ status: 'success', text });
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const typed = text.trim();
    if (!typed) return setNote({ status: 'danger', text: 'Type the name of a font.' });
    if (/[;{}]/.test(typed)) return setNote({ status: 'danger', text: 'A font name can’t contain ; { or }.' });
    setBusy(true);
    try {
      if (source === 'local') {
        if (await fontRenders(typed)) use({ family: typed, source }, 'Found on this computer. Every page uses it now.');
        else setNote({ status: 'danger', text: 'Not found on this computer; try Google Fonts or upload the file.' });
      } else {
        const name = firstFamily(typed);
        const result = await loadGoogleFont(name);
        if (result.ok)
          use(
            { family: name, source },
            result.allWeights ? 'Loaded from Google Fonts. Every page uses it now.' : 'Loaded from Google Fonts. It has fewer weights than Bland uses, so the browser fills in the rest.',
          );
        else
          setNote({
            status: 'danger',
            text: result.reason === 'offline' ? 'Couldn’t reach Google Fonts. Check your connection and try again.' : `Google Fonts has no font called “${name}”. Check the spelling on fonts.google.com.`,
          });
      }
    } finally {
      setBusy(false);
    }
  };
  const upload = async (files: File[]) => {
    try {
      const family = await loadFontFiles(files);
      use({ family, source: 'file', file: files.map((f) => f.name).join(', ') }, `Loaded as “${family}”. Every page uses it now.`);
    } catch {
      setNote({ status: 'danger', text: `This browser can’t read ${files.map((f) => f.name).join(', ')} as a font. Try a .woff2, .woff, .otf or .ttf file.` });
    }
  };

  const lost = pick?.source === 'file' && !fileLoaded(pick.family);
  const fileRows: FileUploadFile[] =
    pick?.source === 'file'
      ? [
          {
            id: 'file',
            name: pick.file ?? pick.family,
            status: lost ? 'danger' : 'uploaded',
            description: lost ? 'Upload this file again: files stay only until the page reloads.' : `Loaded as “${pick.family}”. Every page uses it now.`,
          },
        ]
      : [];

  return (
    <section className="docs-brand-extra docs-font" aria-labelledby={`font-${role}`}>
      <div className="docs-brand-extra-head">
        <h3 id={`font-${role}`} className="docs-brand-chart-title">
          {title}
        </h3>
        {pick ? (
          <Button size="sm" type="stroke" onClick={() => (setFontPick(role, null), setNote(null))} aria-label={`${title}: back to ${role === 'heading' ? 'the body font' : bland}`}>
            {role === 'heading' ? 'Same as body' : `Use ${bland}`}
          </Button>
        ) : (
          <span className="docs-brand-chart-source">{role === 'heading' ? bland : `${bland} (Bland’s)`}</span>
        )}
      </div>
      <p className="docs-font-about">
        {about}
        {pick && ` Now: ${pick.family}, ${FROM[pick.source]}.`}
      </p>
      <SegmentedBar aria-label={`Where the ${title.toLowerCase()} font comes from`} name={`font-source-${role}`} items={SOURCES} value={source} onValueChange={(id) => (setSource(id as FontSource), setNote(null))} />
      {source === 'file' ? (
        <FileUpload
          title={`${title} font file`}
          fileTypes="WOFF2, WOFF, OTF or TTF. One file per weight, or one variable font."
          accept={FONT_FILE_TYPES}
          multiple
          onFilesAdd={upload}
          onFilesReject={(files) => setNote({ status: 'danger', text: `${files.map((f) => f.name).join(', ')} isn’t a font file. Use .woff2, .woff, .otf or .ttf.` })}
          files={note?.status === 'danger' ? [...fileRows, { id: 'error', name: 'Not loaded', status: 'danger', description: note.text }] : fileRows}
          onRemove={(id) => (id === 'error' ? setNote(null) : (setFontPick(role, null), setNote(null)))}
        />
      ) : (
        <form className="docs-font-form" onSubmit={submit}>
          <TextInput
            className="docs-font-input"
            label={label}
            placeholder={source === 'google' ? 'Font name, as on fonts.google.com' : bland}
            value={text}
            onChange={(e) => (setText(e.target.value), setNote(null))}
            status={note?.status ?? 'default'}
            helperText={note?.text ?? (source === 'google' ? 'Loads the weights Bland uses from fonts.googleapis.com.' : 'A font installed on this computer, such as Georgia.')}
            spellCheck={false}
            autoComplete="off"
          />
          <Button htmlType="submit" size="sm" loading={busy}>
            {source === 'google' ? 'Load font' : 'Use font'}
          </Button>
        </form>
      )}
      <p className="docs-font-sample bland-smooth" data-role={role}>
        {sample}
      </p>
    </section>
  );
}
