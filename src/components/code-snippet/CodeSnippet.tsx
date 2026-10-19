import { useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { CaretDownIcon, CheckIcon, CopyIcon, EyeClosedIcon, EyeIcon } from '../../icons';
import { Button } from '../button/Button';
import { IconButton } from '../button/IconButton';
import { FileTabs } from '../file-tab/FileTabs';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';
import { tokenPx } from '../overlay/floating';
import { PillTabs } from '../pill-tab/PillTabs';
import { ScrollArea } from '../scroll-area/ScrollArea';
import { SectionTabs } from '../section-tab/SectionTabs';
import { useCopy } from './copy';
import './code-snippet.css';

/** A file's code: one string, or one string per language id. */
export type CodeSource = string | Record<string, string>;

/** One file, shown as a File tab. */
export interface CodeSnippetFile {
  /** Unique key: what `file` and `onFileChange` report. */
  id: string;
  /** The tab's label, usually a file name. */
  name: ReactNode;
  /** The text the tab is read as, when `name` is not a string. */
  textValue?: string;
  /** Leading content in the tab, such as a file-type icon. */
  leading?: ReactNode;
  /** The code: one string, or `{ [languageId]: string }` when the switcher picks between languages. */
  code: CodeSource;
}

/** One language in the switcher. */
export interface CodeSnippetLanguage {
  /** Unique key: what `language` and `onLanguageChange` report, the key into a file's `code`, and what `highlight` gets. */
  id: string;
  /** Shown in the switcher. Defaults to `id`. */
  label?: string;
}

export type CodeSnippetSwitcher = 'dropdown' | 'tabs' | 'pills';

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Figma `✏️ Code`, for a snippet without file tabs: a string, or `{ [languageId]: string }`. Ignored when `files` is set. */
  code?: CodeSource;
  /** Figma `👀 Tabs`: the files, one File tab each. Without it the snippet has no tabs and shows `code`. */
  files?: CodeSnippetFile[];
  /** The shown file (controlled). */
  file?: string;
  /** The file shown first (uncontrolled). Defaults to the first. */
  defaultFile?: string;
  /** Called with a file's id when its tab is picked. */
  onFileChange?: (id: string) => void;
  /**
   * The switcher's languages, in order. Defaults to the keys of the shown code when it is a record. A single
   * language shows as a label in the dropdown switcher, without a menu.
   */
  languages?: CodeSnippetLanguage[];
  /** The shown language (controlled). */
  language?: string;
  /** The language shown first (uncontrolled). Defaults to the first. */
  defaultLanguage?: string;
  /** Called with a language's id when the switcher picks it. */
  onLanguageChange?: (id: string) => void;
  /** Figma `_code-action-bar` `Switcher`: how the language is picked. dropdown (default, as in Figma), tabs or pills. */
  switcher?: CodeSnippetSwitcher;
  /** Figma `✏️ Description` (shown with `👀 Description`): text at the start of the action bar, dropdown switcher only. */
  description?: ReactNode;
  /** Figma `👀 Copy`: the copy button in the action bar. Default true. */
  copyable?: boolean;
  /** The copy button's accessible name. Defaults to "Copy code". */
  copyLabel?: string;
  /** What the live region announces after a copy. Defaults to "Copied". */
  copiedLabel?: string;
  /** Called with the copied code after a successful copy. */
  onCopied?: (code: string) => void;
  /** Figma `👀 Action bar`: the bar above the code. Default true; it hides by itself when it has nothing to show. */
  actionBar?: boolean;
  /** Figma `👀 Line numbers`: the line number gutter. Default true. */
  lineNumbers?: boolean;
  /**
   * Turns the code into nodes with your highlighter (Bland ships none). Its token classes take the Code colors:
   * highlight.js (`hljs-*`), Prism (`token`), Shiki's css-variables theme, or `<span data-token="keyword">`
   * (comment, keyword, function, string). Without it the code is plain text.
   */
  highlight?: (code: string, language: string | undefined) => ReactNode;
  /**
   * Figma `👀 Show more`: the Show more / Show less button, shown when the code is taller than
   * code-snippet/height-collapsed. Default true. Without it a long snippet stays collapsed and scrolls.
   */
  collapsible?: boolean;
  /** Figma `View` expanded (controlled): every line shows. */
  expanded?: boolean;
  /** Starts expanded (uncontrolled). Figma's default is collapsed. */
  defaultExpanded?: boolean;
  /** Called when Show more or Show less is pressed. */
  onExpandedChange?: (expanded: boolean) => void;
  /** The toggle's label while collapsed. Defaults to "Show more". */
  showMoreLabel?: string;
  /** The toggle's label while expanded. Defaults to "Show less". */
  showLessLabel?: string;
  /** Figma `View=fullscreen`: square corners, fills its container's height and scrolls inside, no toggle. */
  fullscreen?: boolean;
  /** Names the file tab list. Defaults to "Files". */
  filesLabel?: string;
  /** Names the language switcher. Defaults to "Language". */
  languageLabel?: string;
}

/** Controlled or uncontrolled state, the Bland way: `value` wins, else the component keeps its own. */
function useControlled<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [own, setOwn] = useState(initial);
  const current = value !== undefined ? value : own;
  const set = (v: T) => {
    if (value === undefined) setOwn(v);
    onChange?.(v);
  };
  return [current, set] as const;
}

/**
 * A block of code with optional file tabs, an action bar (language switcher, description, copy) and line numbers.
 * Collapsed, it is capped at code-snippet/height-collapsed and scrolls, with Show more under the code; expanded
 * shows every line. Long lines scroll sideways while the line numbers stay. Figma: Code snippet page, sets
 * "Code-snippet" and "_code-action-bar".
 */
export function CodeSnippet({
  code,
  files,
  file,
  defaultFile,
  onFileChange,
  languages,
  language,
  defaultLanguage,
  onLanguageChange,
  switcher = 'dropdown',
  description,
  copyable = true,
  copyLabel = 'Copy code',
  copiedLabel = 'Copied',
  onCopied,
  actionBar = true,
  lineNumbers = true,
  highlight,
  collapsible = true,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
  fullscreen = false,
  filesLabel = 'Files',
  languageLabel = 'Language',
  className,
  ...rest
}: CodeSnippetProps) {
  const [fileId, setFileId] = useControlled(file, defaultFile ?? files?.[0]?.id ?? '', onFileChange);
  const current = files ? (files.find((f) => f.id === fileId) ?? files[0]) : undefined;
  const source: CodeSource = current ? current.code : (code ?? '');

  const langs: CodeSnippetLanguage[] =
    languages ??
    (typeof source === 'object' ? Object.keys(source).map((id) => ({ id })) : language ? [{ id: language }] : []);
  const [langId, setLangId] = useControlled(language, defaultLanguage ?? langs[0]?.id ?? '', onLanguageChange);
  const lang = langs.find((l) => l.id === langId) ?? langs[0];

  const text =
    typeof source === 'string' ? source : ((lang && source[lang.id]) ?? Object.values(source)[0] ?? '');
  const lines = text.replace(/\n$/, '').split('\n').length;

  const [isExpanded, setExpanded] = useControlled(expanded, defaultExpanded, onExpandedChange);
  const { copied, copy, resetProps, status } = useCopy(copiedLabel, onCopied);

  // The toggle only shows when the code is taller than the collapsed height.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [tall, setTall] = useState(false);
  // A scroll area with nothing focusable inside still has to be reachable by keyboard (as Table's), so each
  // scrolling element takes focus while it overflows.
  const fileKey = current?.id;
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const viewports = [body.closest<HTMLElement>('.bland-scroll-area__viewport'), ...body.querySelectorAll<HTMLElement>('.bland-scroll-area__viewport')];
    const update = () => {
      setTall(!fullscreen && collapsible && body.offsetHeight > tokenPx(body, '--code-snippet-height-collapsed') + 1);
      for (const vp of viewports) {
        if (!vp) continue;
        const scrolls = vp.scrollHeight > vp.clientHeight + 1 || vp.scrollWidth > vp.clientWidth + 1;
        if (scrolls) vp.tabIndex = 0;
        else vp.removeAttribute('tabindex');
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body);
    for (const vp of viewports) if (vp) observer.observe(vp);
    return () => observer.disconnect();
  }, [fullscreen, collapsible, fileKey]);
  const toggle = collapsible && !fullscreen && tall;
  const bodyId = useId();

  const label = (l: CodeSnippetLanguage) => l.label ?? l.id;
  const tabsItems = langs.map((l) => ({ id: l.id, label: label(l) }));

  let picker: ReactNode = null;
  if (lang && switcher === 'tabs') {
    picker = (
      <SectionTabs
        className="bland-code-snippet__tabs"
        items={tabsItems}
        value={lang.id}
        onValueChange={setLangId}
        aria-label={languageLabel}
      />
    );
  } else if (lang && switcher === 'pills') {
    picker = (
      <PillTabs
        className="bland-code-snippet__tabs"
        items={tabsItems}
        value={lang.id}
        onValueChange={setLangId}
        aria-label={languageLabel}
      />
    );
  } else if (lang && langs.length === 1) {
    picker = <span className="bland-code-snippet__language bland-smooth">{label(lang)}</span>;
  } else if (lang) {
    picker = (
      <Menu
        items={langs.map((l) => ({ id: l.id, label: label(l) }))}
        selectionMode="single"
        selectedKeys={[lang.id]}
        onSelectionChange={(ids) => ids[0] && setLangId(ids[0])}
        placement="bottom-end"
        aria-label={languageLabel}
      >
        <button
          type="button"
          className="bland-code-snippet__language bland-focus-ring bland-smooth"
          aria-label={`${languageLabel}: ${label(lang)}`}
        >
          {label(lang)}
          <Icon className="bland-code-snippet__caret">
            <CaretDownIcon />
          </Icon>
        </button>
      </Menu>
    );
  }

  const showDescription = switcher === 'dropdown' && description != null && description !== false;
  const bar = actionBar && (picker || showDescription || copyable);

  const main = (
    <div className="bland-code-snippet__main">
      {bar && (
        <div className="bland-code-snippet__bar" data-switcher={lang ? switcher : undefined}>
          {showDescription && <span className="bland-code-snippet__description">{description}</span>}
          {picker}
          {copyable && (
            <IconButton
              className="bland-code-snippet__copy"
              size="sm"
              type="ghost"
              icon={copied ? <CheckIcon /> : <CopyIcon />}
              aria-label={copyLabel}
              onClick={() => copy(text)}
              {...resetProps}
            />
          )}
          {copyable && status}
        </div>
      )}
      <ScrollArea className="bland-code-snippet__scroll" data-toggle={toggle || undefined}>
        <div ref={bodyRef} id={bodyId} className="bland-code-snippet__body">
          {lineNumbers && (
            <div className="bland-code-snippet__gutter" aria-hidden="true">
              {Array.from({ length: lines }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          )}
          <ScrollArea axis="x" className="bland-code-snippet__code-scroll">
            <pre className="bland-code-snippet__pre">
              <code className="bland-code-snippet__code" data-language={lang?.id}>
                {highlight ? highlight(text, lang?.id) : text}
              </code>
            </pre>
          </ScrollArea>
        </div>
      </ScrollArea>
      {toggle && (
        <Button
          className="bland-code-snippet__toggle"
          size="sm"
          iconStart={isExpanded ? <EyeClosedIcon /> : <EyeIcon />}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          onClick={() => setExpanded(!isExpanded)}
        >
          {isExpanded ? showLessLabel : showMoreLabel}
        </Button>
      )}
    </div>
  );

  return (
    <div
      {...rest}
      className={`bland-code-snippet${fullscreen ? '' : ' bland-smooth'}${className ? ` ${className}` : ''}`}
      data-fullscreen={fullscreen || undefined}
      data-expanded={(!fullscreen && (isExpanded || !tall)) || undefined}
    >
      {files ? (
        <FileTabs
          className="bland-code-snippet__files"
          items={files.map((f) => ({
            id: f.id,
            label: f.name,
            textValue: f.textValue,
            leading: f.leading,
            panel: f.id === current?.id ? main : null,
          }))}
          value={current?.id}
          onValueChange={setFileId}
          aria-label={filesLabel}
        />
      ) : (
        main
      )}
    </div>
  );
}
