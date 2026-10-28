import type { Story } from '../../../playground/story';
import { CheckIcon, PlusIcon, XIcon } from '../../icons';
import { Badge, type BadgeEmotion, type BadgeSize, type BadgeType } from './Badge';

const emotions: BadgeEmotion[] = ['brand', 'neutral', 'success', 'danger', 'warning'];
const types: BadgeType[] = ['primary', 'secondary', 'outline'];
const sizes: BadgeSize[] = ['sm', 'md', 'lg', 'xl'];

// Option names match the icon exports, so the docs code snippet reads like real usage.
const icons = { none: undefined, CheckIcon: <CheckIcon />, PlusIcon: <PlusIcon />, XIcon: <XIcon /> } as const;

export default {
  title: 'Badge',
  description:
    'A small label for a status, category or count next to content. Badges are static: nothing happens when people press one.',
  usage: [
    '`emotion` sets the color family. `type` sets the weight: `primary` is a solid fill, `secondary` a soft tint, `outline` a border only.',
    'Keep labels to a word or two.',
    'An icon-only badge needs an `aria-label`. It starts at size `md`, where the icon is large enough to read.',
    'For a dot or count on an avatar or icon, use Indicator. For a filter people press, use Pill; for a removable value, use Chip.',
  ],
  components: ['Badge'],
  demo: {
    component: 'Badge',
    args: { children: 'Active', size: 'md', emotion: 'success', type: 'secondary', iconStart: 'CheckIcon', iconEnd: 'none' },
    controls: {
      children: { kind: 'text' },
      size: { kind: 'select', options: sizes },
      iconStart: { kind: 'select', options: Object.keys(icons) },
      iconEnd: { kind: 'select', options: Object.keys(icons) },
      icon: false,
    },
    render: ({ iconStart, iconEnd, ...args }) => (
      <Badge {...(args as object)} iconStart={icons[iconStart as keyof typeof icons]} iconEnd={icons[iconEnd as keyof typeof icons]}>
        {args.children}
      </Badge>
    ),
  },
  render: () => (
    <>
      {types.map((type) => (
        <div key={type} className="pg-stack">
          <span className="pg-label"><code>type="{type}"</code>: label, with icons, icon only</span>
          {emotions.map((emotion) => (
            <div key={emotion} className="pg-row">
              <Badge type={type} emotion={emotion}>
                {emotion}
              </Badge>
              <Badge type={type} emotion={emotion} size="md" iconStart={<CheckIcon />}>
                {emotion}
              </Badge>
              <Badge type={type} emotion={emotion} size="md" iconEnd={<XIcon />}>
                {emotion}
              </Badge>
              <Badge type={type} emotion={emotion} icon={<CheckIcon />} aria-label={`Done (${emotion})`} />
            </div>
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>sm</code> (default), <code>md</code>, <code>lg</code>, <code>xl</code>; icon only from <code>md</code></span>
        {sizes.map((size) => (
          <div key={size} className="pg-row">
            <Badge size={size}>Badge {size}</Badge>
            <Badge size={size} type="secondary" iconStart={<PlusIcon />} iconEnd={<XIcon />}>
              Both icons
            </Badge>
            <Badge size={size} type="outline" emotion="neutral">
              12
            </Badge>
            {size !== 'sm' && <Badge size={size} type="secondary" icon={<PlusIcon />} aria-label="Add" />}
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">With one icon, the side without it gets a little more room, so the label looks centred</span>
        {sizes.map((size) => (
          <div key={size} className="pg-row">
            <Badge size={size} type="secondary" data-testid={`plain-${size}`}>
              No icon
            </Badge>
            <Badge size={size} type="secondary" iconStart={<CheckIcon />} data-testid={`start-${size}`}>
              Leading
            </Badge>
            <Badge size={size} type="secondary" iconEnd={<XIcon />} data-testid={`end-${size}`}>
              Trailing
            </Badge>
            <Badge size={size} type="secondary" iconStart={<CheckIcon />} iconEnd={<XIcon />} data-testid={`both-${size}`}>
              Both
            </Badge>
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long label truncates with an ellipsis</span>
        <div className="pg-row" style={{ maxWidth: 160 }}>
          <Badge size="md" type="secondary" iconStart={<CheckIcon />}>
            A label far too long for the space it has
          </Badge>
        </div>
      </div>
    </>
  ),
} satisfies Story;
