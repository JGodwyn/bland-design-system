// "Over 45 components": a collection (Stageshow bento kind). Real Bland parts at real size on seven rows,
// each wider than the card and centred, so every row runs off both sides and it reads as more than fits.
// The parts at the ends of a row have no words (icon buttons, toggles, avatars): only they are cut by the crop. They settle in row by row; then, on a loop, a Toggle
// switches, a Checkbox ticks and a Slider moves, and back. Few words: the parts are the subject.
import type { CSSProperties } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Chip,
  CopyIcon,
  EyeIcon,
  IconButton,
  Indicator,
  Pagination,
  Pill,
  PlusIcon,
  ProgressBar,
  Radio,
  SearchInput,
  SegmentedBar,
  Slider,
  Toggle,
  TrashIcon,
} from '../../../../src';
import { useLoop } from '../playback';
import { ARRIVE_MS, ARRIVE_STAGGER_MS } from '../timing';
import type { PictureProps } from '../cards';

const noop = () => {};
const SEGMENTS = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

// Rows of parts; each part's place in the arrival order is its --i.
const PARTS = 45;
const LAST_ARRIVAL = ARRIVE_MS + (PARTS - 1) * ARRIVE_STAGGER_MS;

/**
 * 0 nothing yet; 1 the parts arrive (once); then the loop: 2 the Toggle switches on, 3 the Checkbox ticks, 4 the
 * Slider moves up and holds, 5 the Toggle switches off, 6 the Checkbox clears, 7 the Slider moves back and holds.
 */
const HOLD = [0, LAST_ARRIVAL + 400, 600, 600, 2000, 600, 600, 2000];
const POSTER = 4;

export function ComponentsPicture({ active, reduced }: PictureProps) {
  const step = useLoop(active, reduced, HOLD, 2, POSTER);
  const toggleOn = step >= 2 && step <= 4;
  const ticked = step >= 3 && step <= 5;
  const sliderUp = step >= 4 && step <= 6;
  let n = 0;
  const part = (extra?: { width?: string }) => ({
    className: 'components-pic__part',
    style: { '--i': n++ } as CSSProperties,
    'data-width': extra?.width,
  });
  return (
    <div className="components-pic" data-step={step} aria-hidden inert>
      <div className="components-pic__wall">
        <div className="components-pic__row">
          <span {...part()}>
            <IconButton icon={<CopyIcon />} aria-label="" emotion="brand" type="ghost" size="sm" />
          </span>
          <span {...part()}>
            <IconButton icon={<PlusIcon />} aria-label="" emotion="brand" type="stroke" size="sm" />
          </span>
          <span {...part()}>
            <Badge emotion="brand" type="secondary" size="md">Beta</Badge>
          </span>
          <span {...part()}>
            <Button emotion="brand" type="stroke" size="sm">Cancel</Button>
          </span>
          <span {...part()}>
            <Chip size="md">Design</Chip>
          </span>
          <span {...part()}>
            <Avatar size="md" initials="JL" />
          </span>
          <span {...part()}>
            <IconButton icon={<EyeIcon />} aria-label="" emotion="brand" type="ghost" size="sm" />
          </span>
        </div>
        <div className="components-pic__row">
          <span {...part()}>
            <Radio value="a" checked readOnly aria-label="" tabIndex={-1} />
          </span>
          <span {...part()}>
            <Toggle checked={toggleOn} onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
          <span {...part({ width: 'slider' })}>
            <Slider aria-label="" value={sliderUp ? 68 : 30} onValueChange={noop} tooltip={false} labels={false} />
          </span>
          <span {...part()}>
            <Checkbox checked={ticked} onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
          <span {...part()}>
            <Indicator size="xl" emotion="danger" type="primary">3</Indicator>
          </span>
          <span {...part()}>
            <Toggle checked onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
          <span {...part()}>
            <Radio value="b" checked={false} readOnly aria-label="" tabIndex={-1} />
          </span>
        </div>
        <div className="components-pic__row">
          <span {...part()}>
            <Pagination pageCount={5} page={2} onPageChange={noop} />
          </span>
          <span {...part()}>
            <Button emotion="brand" type="primary" size="sm">Get started</Button>
          </span>
          <span {...part()}>
            <Pill size="sm" selected onSelectedChange={noop} tabIndex={-1}>Popular</Pill>
          </span>
          <span {...part()}>
            <Avatar size="md" />
          </span>
          <span {...part()}>
            <Toggle checked={false} onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
        </div>
        <div className="components-pic__row">
          <span {...part()}>
            <Avatar size="md" initials="RM" />
          </span>
          <span {...part()}>
            <Checkbox checked={false} onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
          <span {...part({ width: 'search' })}>
            <SearchInput aria-label="" placeholder="Search" tabIndex={-1} readOnly />
          </span>
          <span {...part()}>
            <Badge emotion="success" type="secondary" size="md">Live</Badge>
          </span>
          <span {...part()}>
            <Avatar size="md" initials="AK" />
          </span>
          <span {...part()}>
            <Indicator size="sm" emotion="success" type="primary" />
          </span>
        </div>
        <div className="components-pic__row">
          <span {...part()}>
            <IconButton icon={<TrashIcon />} aria-label="" emotion="danger" type="secondary" size="sm" />
          </span>
          <span {...part()}>
            <Checkbox checked onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
          <span {...part({ width: 'segments' })}>
            <SegmentedBar aria-label="" items={SEGMENTS} value="week" onValueChange={noop} />
          </span>
          <span {...part({ width: 'progress' })}>
            <ProgressBar value={72} showValue={false} aria-label="" />
          </span>
          <span {...part()}>
            <IconButton icon={<CopyIcon />} aria-label="" emotion="brand" type="stroke" size="sm" />
          </span>
        </div>
        <div className="components-pic__row">
          <span {...part()}>
            <Avatar size="md" initials="TS" />
          </span>
          <span {...part()}>
            <IconButton icon={<PlusIcon />} aria-label="" emotion="brand" type="ghost" size="sm" />
          </span>
          <span {...part()}>
            <Toggle checked={false} onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
          <span {...part()}>
            <Indicator size="xl" emotion="brand" type="secondary">12</Indicator>
          </span>
          <span {...part()}>
            <Radio value="c" checked readOnly aria-label="" tabIndex={-1} />
          </span>
          <span {...part()}>
            <Checkbox checked onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
          <span {...part()}>
            <Avatar size="md" />
          </span>
          <span {...part()}>
            <IconButton icon={<TrashIcon />} aria-label="" emotion="danger" type="ghost" size="sm" />
          </span>
        </div>
        <div className="components-pic__row">
          <span {...part()}>
            <Radio value="d" checked={false} readOnly aria-label="" tabIndex={-1} />
          </span>
          <span {...part()}>
            <Avatar size="md" initials="NO" />
          </span>
          <span {...part()}>
            <Button emotion="brand" type="secondary" size="sm">Share</Button>
          </span>
          <span {...part()}>
            <Badge emotion="warning" type="secondary" size="md">Draft</Badge>
          </span>
          <span {...part()}>
            <Chip size="md">Figma</Chip>
          </span>
          <span {...part()}>
            <IconButton icon={<CopyIcon />} aria-label="" emotion="brand" type="ghost" size="sm" />
          </span>
          <span {...part()}>
            <Toggle checked onCheckedChange={noop} aria-label="" tabIndex={-1} />
          </span>
        </div>
      </div>
    </div>
  );
}
