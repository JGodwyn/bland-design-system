import type { Story } from '../../../playground/story';
import { CheckIcon, PlusIcon, XIcon } from '../../icons';
import { Icon } from './Icon';

// A filled icon in the shape of Phosphor's React output, to show filled packs keep their own weight.
const FilledDot = () => (
  <svg viewBox="0 0 256 256" fill="currentColor">
    <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Z" />
  </svg>
);

const sizes = ['xs', 'sm', 'md', 'lg'] as const;

// Option names match the icon exports, so the docs code snippet reads like real usage.
const glyphs = { CheckIcon: <CheckIcon />, XIcon: <XIcon />, PlusIcon: <PlusIcon /> } as const;

export default {
  title: 'Icon',
  description:
    'Sizes and colors one icon from any icon pack. Bland ships no icon set: use the pack your project prefers.',
  usage: [
    '`size`: `xs` 12, `sm` 16, `md` 20, `lg` 24. Icons passed to a component\'s icon prop don\'t need it: the component sizes them.',
    'The icon takes the color of the text around it.',
    'Give it a `label` only when it carries meaning on its own. Without one it is hidden from screen readers.',
  ],
  components: ['Icon'],
  demo: {
    component: 'Icon',
    args: { children: 'CheckIcon', size: 'lg', label: '' },
    controls: { children: { kind: 'select', options: Object.keys(glyphs) }, label: { kind: 'text' } },
    render: ({ children, label, size }) => (
      <Icon size={size} label={label || undefined}>
        {glyphs[children as keyof typeof glyphs]}
      </Icon>
    ),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Stroked icons: one stroke weight at every size</span>
        <div className="pg-row">
          {sizes.map((s) => (
            <Icon key={s} size={s}>
              <CheckIcon />
            </Icon>
          ))}
          {sizes.map((s) => (
            <Icon key={`x-${s}`} size={s}>
              <XIcon />
            </Icon>
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Filled icons keep their own weight</span>
        <div className="pg-row">
          {sizes.map((s) => (
            <Icon key={s} size={s}>
              <FilledDot />
            </Icon>
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">The color follows the text</span>
        <div className="pg-row" style={{ color: 'var(--icon-brand)' }}>
          <Icon size="lg" label="Add">
            <PlusIcon />
          </Icon>
        </div>
      </div>
    </>
  ),
} satisfies Story;
