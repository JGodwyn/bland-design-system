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

export default {
  title: 'Icon',
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Stroked (Bland icons): stroke-md at every size</span>
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
        <span className="pg-label">Filled (any pack): keeps its own weight</span>
        <div className="pg-row">
          {sizes.map((s) => (
            <Icon key={s} size={s}>
              <FilledDot />
            </Icon>
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Color follows the text</span>
        <div className="pg-row" style={{ color: 'var(--icon-brand)' }}>
          <Icon size="lg" label="Add">
            <PlusIcon />
          </Icon>
        </div>
      </div>
    </>
  ),
} satisfies Story;
