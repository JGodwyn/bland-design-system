import type { CSSProperties } from 'react';
import type { Story } from '../../../playground/story';
import { CaretDownIcon, PlusIcon } from '../../icons';
import { Button } from '../button/Button';
import { IconButton } from '../button/IconButton';
import { Tooltip, type TooltipPlacement } from './Tooltip';

// One row per side. Open tooltips may cover neighbouring triggers; only one opens at a time.
const placementRows: TooltipPlacement[][] = [
  ['top-start', 'top', 'top-end'],
  ['bottom-start', 'bottom', 'bottom-end'],
  ['left-start', 'left', 'left-end'],
  ['right-start', 'right', 'right-end'],
];

const stage: CSSProperties = { display: 'grid', placeItems: 'center', minHeight: 200, minWidth: 280 };

// Options for the demo's `extra` control; the code snippet prints the same JSX.
const extras = {
  none: undefined,
  shortcut: <span>Shortcut: Ctrl + C</span>,
} as const;
const extraCode = { none: undefined, shortcut: '<span>Shortcut: Ctrl + C</span>' } as const;

export default {
  title: 'Tooltip',
  description:
    'A short hint that appears when people hover over or focus a control, such as the name of an icon-only button.',
  usage: [
    'Wrap one focusable element, such as an IconButton, and pass the hint in `text`.',
    'Keep it to a line or two. Never put links or buttons in a tooltip: it can\'t take focus.',
    'Don\'t hide information people need in a tooltip; touch screens can\'t hover.',
    '`placement` picks the side (`top-start` by default); it flips when there isn\'t room.',
  ],
  components: ['Tooltip'],
  demo: {
    component: 'Tooltip',
    args: { text: 'Copy link', placement: 'top-start', open: false, extra: 'none', disabled: false },
    controls: {
      text: { kind: 'text' },
      open: { kind: 'boolean' },
      extra: { kind: 'select', options: Object.keys(extras) },
      defaultOpen: false,
      delay: false,
      closeDelay: false,
      trigger: false,
    },
    // Unticked, `open` is left out (not false), so hover and focus open it; ticked, it is held open.
    render: ({ extra, open, ...args }) => (
      <div style={stage}>
        <Tooltip {...(args as { text: string })} open={open ? true : undefined} extra={extras[extra as keyof typeof extras]}>
          <Button type="stroke" iconStart={<PlusIcon />}>
            Hover or focus me
          </Button>
        </Tooltip>
      </div>
    ),
    code: ({ extra, open, ...args }) => ({ ...args, open: open || undefined, extra: extraCode[extra as keyof typeof extraCode] }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Try it: all twelve <code>placement</code>s; hover or tab to a trigger</span>
        {placementRows.map((row) => (
          <div key={row[0]} className="pg-row">
            {row.map((placement) => (
              <Tooltip key={placement} text={placement} placement={placement}>
                <Button type="secondary" size="sm">
                  {placement}
                </Button>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Long text wraps; <code>extra</code> holds more content under the text (hover to open)</span>
        <div className="pg-row">
          <Tooltip
            text="Saves a copy of this file to your device, with every comment and version kept"
            placement="top-start"
          >
            <IconButton type="stroke" icon={<CaretDownIcon />} aria-label="Download" />
          </Tooltip>
          <Tooltip text="Copy link" extra={<span>Shortcut: Ctrl + C</span>} placement="top">
            <IconButton type="stroke" icon={<PlusIcon />} aria-label="Copy" />
          </Tooltip>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus stays on the trigger; the tooltip never takes it</span>
        <div className="pg-row pg-focus">
          <Tooltip text="Add a member">
            <IconButton icon={<PlusIcon />} aria-label="Add" />
          </Tooltip>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Closed until hover or keyboard focus</span>
        <div className="pg-row">
          <Tooltip text="First hint" placement="top">
            <Button type="secondary" data-testid="first">
              First
            </Button>
          </Tooltip>
          <Tooltip text="Second hint" placement="top">
            <Button type="secondary" data-testid="second">
              Second
            </Button>
          </Tooltip>
          <Tooltip text="Focus only" trigger="focus" placement="top">
            <Button type="secondary" data-testid="focus-only">
              Focus only
            </Button>
          </Tooltip>
          <Tooltip text="Never shown" disabled placement="top">
            <Button type="secondary" data-testid="disabled-tooltip">
              Tooltip disabled
            </Button>
          </Tooltip>
        </div>
      </div>
    </>
  ),
} satisfies Story;
