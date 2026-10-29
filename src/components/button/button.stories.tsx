import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { CaretDownIcon, PlusIcon, XIcon } from '../../icons';
import { Button, type ButtonEmotion, type ButtonSize, type ButtonType } from './Button';
import { IconButton } from './IconButton';

/** Counts its clicks, so tests/button.spec.ts can check keyboard activation and blocked clicks. */
function ClickCounter({ id, loading, disabled }: { id: string; loading?: boolean; disabled?: boolean }) {
  const [count, setCount] = useState(0);
  return (
    <span className="pg-row">
      <Button type="secondary" loading={loading} disabled={disabled} data-testid={id} onClick={() => setCount((c) => c + 1)}>
        {id}
      </Button>
      <output className="pg-label" data-testid={`${id}-count`}>
        {count}
      </output>
    </span>
  );
}

const emotions: ButtonEmotion[] = ['brand', 'success', 'danger', 'warning'];
const types: ButtonType[] = ['primary', 'secondary', 'ghost', 'stroke'];
const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg'];

// Hover and pressed are CSS states, so they show on interaction, not here; tests/button.spec.ts covers them.
// Option names match the icon exports, so the docs code snippet reads like real usage.
const icons = { none: undefined, PlusIcon: <PlusIcon />, CaretDownIcon: <CaretDownIcon />, XIcon: <XIcon /> } as const;

export default {
  title: 'Button',
  description:
    'Starts an action, such as saving, sending or opening a dialog. Use one primary button for the main action in a view.',
  usage: [
    '`type`: `primary` for the main action, `secondary` for supporting actions, `ghost` for low-emphasis actions in dense areas, `stroke` when a button needs an edge without a fill.',
    '`emotion`: `brand` for most actions, `danger` for destructive ones, `success` and `warning` for actions tied to those states.',
    'Set `loading` while the action runs: the button shows a spinner and ignores presses.',
    '`xs` is smaller than a comfortable touch target; keep it for dense desktop UI.',
    'For a button without a label, use IconButton and give it an `aria-label`. To go to another page, use a link.',
  ],
  components: ['Button', 'IconButton'],
  demo: {
    component: 'Button',
    args: { children: 'Save changes', type: 'primary', emotion: 'brand', size: 'md', loading: false, disabled: false, iconStart: 'PlusIcon', iconEnd: 'none' },
    controls: {
      children: { kind: 'text' },
      loading: { kind: 'select', options: [false, true, 'start', 'end'] },
      disabled: { kind: 'boolean' },
      iconStart: { kind: 'select', options: Object.keys(icons) },
      iconEnd: { kind: 'select', options: Object.keys(icons) },
      htmlType: false,
    },
    render: ({ iconStart, iconEnd, ...args }) => (
      <Button {...(args as object)} iconStart={icons[iconStart as keyof typeof icons]} iconEnd={icons[iconEnd as keyof typeof icons]}>
        {args.children}
      </Button>
    ),
  },
  render: () => (
    <>
      {types.map((type) => (
        <div key={type} className="pg-stack">
          <span className="pg-label"><code>type="{type}"</code>: rest, then <code>disabled</code></span>
          {emotions.map((emotion) => (
            <div key={emotion} className="pg-row">
              <Button type={type} emotion={emotion} iconStart={<PlusIcon />}>
                {emotion}
              </Button>
              <Button type={type} emotion={emotion} iconStart={<PlusIcon />} disabled>
                {emotion}
              </Button>
              <IconButton type={type} emotion={emotion} icon={<PlusIcon />} aria-label={`Add (${emotion})`} />
              <IconButton type={type} emotion={emotion} icon={<PlusIcon />} aria-label={`Add (${emotion})`} disabled />
            </div>
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>xs</code>, <code>sm</code>, <code>md</code> (default), <code>lg</code></span>
        {sizes.map((size) => (
          <div key={size} className="pg-row">
            <Button size={size} iconStart={<PlusIcon />} iconEnd={<CaretDownIcon />}>
              Button {size}
            </Button>
            <Button size={size} type="stroke">
              Label only
            </Button>
            <IconButton size={size} icon={<PlusIcon />} aria-label="Add" />
            <IconButton size={size} type="ghost" icon={<XIcon />} aria-label="Close" />
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-row pg-focus">
          {types.map((type) => (
            <Button key={type} type={type} iconStart={<PlusIcon />}>
              {type}
            </Button>
          ))}
          <Button size="xs">xs</Button>
          <IconButton icon={<PlusIcon />} aria-label="Add" />
          <IconButton size="xs" type="stroke" icon={<PlusIcon />} aria-label="Add" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>loading</code>: a spinner replaces the icon on that side</span>
        <div className="pg-row">
          <Button loading iconStart={<PlusIcon />}>
            Saving
          </Button>
          <Button loading="end" type="secondary" iconEnd={<CaretDownIcon />}>
            Loading end
          </Button>
          <Button loading type="stroke" emotion="danger" size="sm">
            Deleting
          </Button>
          <IconButton loading icon={<PlusIcon />} aria-label="Add" />
          <IconButton loading type="secondary" size="sm" icon={<PlusIcon />} aria-label="Add" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: each press adds one</span>
        <div className="pg-row">
          <ClickCounter id="Counter" />
          <ClickCounter id="Loading counter" loading />
          <ClickCounter id="Disabled counter" disabled />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long label truncates with an ellipsis</span>
        <div className="pg-row" style={{ maxWidth: 200 }}>
          <Button iconStart={<PlusIcon />}>A label far too long for the space it has</Button>
        </div>
      </div>
    </>
  ),
} satisfies Story;
