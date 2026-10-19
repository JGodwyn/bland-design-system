import type { CSSProperties } from 'react';
import type { Story } from '../../../playground/story';
import { CaretDownIcon, PlusIcon } from '../../icons';
import { Button } from '../button/Button';
import { IconButton } from '../button/IconButton';
import { Tooltip, type TooltipPlacement } from './Tooltip';

// Rows of placements; each cell is roomy enough for its tooltip to stay on its side.
const placementRows: TooltipPlacement[][] = [
  ['top-start', 'top', 'top-end'],
  ['bottom-start', 'bottom', 'bottom-end'],
  ['left-start', 'left', 'left-end'],
  ['right-start', 'right', 'right-end'],
];

const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 248px)', gridAutoRows: 136, alignItems: 'center', justifyItems: 'center' };
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
    'Short, non-interactive hint shown on hover or focus of a trigger. Placement follows Floating UI naming: the side of the trigger the tooltip sits on, then start, center or end alignment; the pointer sits on the opposite edge, aimed at the trigger. Colors come from Tooltip/surface and Tooltip/text: near black in light mode, a raised neutral in dark mode, white text in both. Content wraps at tooltip/max-width. Keep text to one or two short lines in body-md. Turn on the slot (extra) for richer content.',
  components: ['Tooltip'],
  demo: {
    component: 'Tooltip',
    args: { text: 'Copy link', placement: 'top-start', open: true, extra: 'none', disabled: false },
    controls: {
      text: { kind: 'text' },
      open: { kind: 'boolean' },
      extra: { kind: 'select', options: Object.keys(extras) },
      defaultOpen: false,
      delay: false,
      closeDelay: false,
      trigger: false,
    },
    render: ({ extra, ...args }) => (
      <div style={stage}>
        <Tooltip {...(args as { text: string })} extra={extras[extra as keyof typeof extras]}>
          <Button type="stroke" iconStart={<PlusIcon />}>
            Hover or focus me
          </Button>
        </Tooltip>
      </div>
    ),
    code: ({ extra, ...args }) => ({ ...args, extra: extraCode[extra as keyof typeof extraCode] }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">placement: all twelve, held open (the pointer aims at the trigger)</span>
        <div style={grid}>
          {placementRows.flat().map((placement) => (
            <Tooltip key={placement} text={placement} placement={placement} open>
              <Button type="secondary" size="sm">
                {placement}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Long text wraps at tooltip/max-width; extra holds a slot under the text</span>
        <div style={{ ...grid, gridTemplateColumns: 'repeat(2, 360px)', gridAutoRows: 128, alignItems: 'end' }}>
          <Tooltip
            text="Saves a copy of this file to your device, with every comment and version kept"
            placement="top-start"
            open
          >
            <IconButton type="stroke" icon={<CaretDownIcon />} aria-label="Download" />
          </Tooltip>
          <Tooltip text="Copy link" extra={<span>Shortcut: Ctrl + C</span>} placement="top" open>
            <IconButton type="stroke" icon={<PlusIcon />} aria-label="Copy" />
          </Tooltip>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: the trigger takes focus and shows the ring; the tooltip never does</span>
        <div className="pg-row pg-focus" style={{ paddingTop: 56 }}>
          <Tooltip text="Add a member" open>
            <IconButton icon={<PlusIcon />} aria-label="Add" />
          </Tooltip>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Closed until hover or keyboard focus (used by the behaviour tests)</span>
        <div className="pg-row" style={{ paddingTop: 56 }}>
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
