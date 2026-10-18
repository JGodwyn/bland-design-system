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
    'Badge labels a status, category or count next to content. It is static and not interactive. Emotion sets the color family and Type the weight: primary is a solid fill, secondary a soft tint, outline a border only. Icon only makes a circle that holds an icon and no label; it starts at md, since a 12px icon in a 16px circle is too small to read. Sizes sm 16, md 20, lg 24, xl 32. Colors alias the Indicator tokens, so badges and indicators always match. For a dot or a count on an avatar, use Indicator instead.',
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
          <span className="pg-label">type="{type}": label, with icons, icon only</span>
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
        <span className="pg-label">Sizes: sm 16 (default), md 20, lg 24, xl 32; icon only from md</span>
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
