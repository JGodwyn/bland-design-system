// The FAQ's copy (docs/landing-copy.md, "FAQ"; change it there first). Figma 7189:37802's twelve questions, in its
// order (Godwin's redesign, 2026-11-09); the first answer is Figma's own, the rest are written for them. Every
// answer is checked against the repo: package.json, docs/brand.md, docs/release.md, docs/agent-skill.md, CLAUDE.md.
import type { ReactNode } from 'react';
import { CodeText } from '../../../src';

/** The heading in its two lines, broken after "questions" at every width (Godwin 2026-11-09). */
export const FAQ_TITLE = ['Some questions', 'about Bland'];
export const FAQ_LINE =
  'Common questions about brand tokens, light and dark modes, and how the system behaves when you change the color.';

/** Inline code in an answer: Bland's own CodeText at the answer's size. */
const C = ({ children }: { children: string }) => <CodeText size="sm">{children}</CodeText>;

export const QUESTIONS: { q: string; a: ReactNode }[] = [
  {
    q: 'How do brand tokens work?',
    a: 'Change the brand token once, and every button, field, chart, and surface updates automatically. The system keeps the same names, sizes, and states, so your design stays consistent.',
  },
  {
    q: 'Do I need to write custom CSS?',
    a: (
      <>
        Not to use the components: sizes, colors and types are props. For your own layouts, use Bland's tokens (CSS
        variables such as <C>--space-md</C> or <C>--surface-raised</C>) instead of fixed values, so your parts rebrand
        with everything else.
      </>
    ),
  },
  {
    q: 'Can I use this in light and dark?',
    a: (
      <>
        Yes. Both come built in, and each is designed on its own rather than flipped. Bland follows the system setting
        until you set <C>{'data-theme="light"'}</C> or <C>{'"dark"'}</C>, on the whole page or on one section.
      </>
    ),
  },
  {
    q: 'Is this ready for production?',
    a: 'Bland is on npm at version 0.1, and every component is checked for keyboard use and accessibility in Chromium, WebKit and Firefox. Before 1.0 a minor release can change an API, but an old name keeps working, with a warning, for one minor version, so you can upgrade at your own pace.',
  },
  {
    q: 'How can I customize the spacing between elements?',
    a: (
      <>
        Use the spacing tokens, from <C>--space-2xs</C> up to <C>--space-9xl</C>, for the gaps in your own layouts, and
        the optional page grid for columns. Inside a component, spacing comes with its size: pick a smaller or larger
        size rather than changing its padding.
      </>
    ),
  },
  {
    q: 'What accessibility standards are supported?',
    a: "Bland follows WCAG where it applies to components: 4.5:1 contrast for text and 3:1 for controls (the Brand theme page checks your color against both), full keyboard use, a visible focus ring, and tooltips you can hover. Automated accessibility checks run on every component in Chromium, WebKit and Firefox. Right-to-left layouts aren't supported yet.",
  },
  {
    q: 'Can I override global tokens for specific components?',
    a: (
      <>
        Yes. Every component has its own tokens. Set one on a wrapper, such as <C>--button-brand-primary-rest</C>, and
        only the components inside it change.
      </>
    ),
  },
  {
    q: 'How do updates to tokens affect existing designs?',
    a: "When you upgrade Bland, everything that reads a token takes its new value, since nothing is hardcoded. Your brand file loads last, so your colors stay yours. A renamed token keeps its old name for one minor version, and the changelog names the replacement.",
  },
  {
    q: 'Is there version control for token sets?',
    a: 'Tokens are versioned with Bland itself: each npm release carries one set, and the changelog lists every token that changed. In Figma they are the same variables, synced to code in one step.',
  },
  {
    q: 'Can tokens be exported for other platforms?',
    a: (
      <>
        Not yet. Bland ships its tokens as CSS variables in <C>bland-ui/tokens.css</C>, for the web. The repo keeps
        them as JSON too, but there is no export for iOS, Android or other tools.
      </>
    ),
  },
  {
    q: 'How do tokens integrate with design systems?',
    a: "They are this one's foundation. Each Figma variable becomes a CSS token with the same name, and every component reads only tokens, so a change in Figma reaches the code in one sync. Use the same tokens in your own UI and it matches.",
  },
  {
    q: 'Are there performance considerations for token usage?',
    a: 'Very few. Tokens are CSS variables in one stylesheet, so light, dark and your brand are all applied by plain CSS, with no JavaScript doing the theming.',
  },
];
