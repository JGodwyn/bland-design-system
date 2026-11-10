// The six "What you get" slides: the main frame's (7066:29609) and its five states (Screen templates 7068:29845,
// 7068:30366, 7068:30959, 7071:31173, 7071:31734). Each has its sentence (Figma's copy, docs/landing-copy.md) and
// the parts around it, at Figma's place and tilt on its 1440 x 1024 frame: `box` is Figma's bounding box (x, y,
// width, height) and `tilt` Figma's rotation (CSS turns the other way, so it is negated where it is used). Parts are
// real Bland components, or Figma's vectors (vectors.tsx). Once a slide is on screen (`live`) some parts do one
// small thing on a loop, so the slide shows the components working, not a still.
import { useContext, useEffect, useState, type ReactNode } from 'react';
import {
  Accordion,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  ChatBubble,
  CheckCircleIcon,
  FileUpload,
  IconButton,
  SegmentedBar,
  TextInput,
  Toast,
  Toggle,
  XIcon,
} from '../../../src';
import {
  AccessFigure,
  ArrowsOutCardinalIcon,
  BlinkEye,
  CornersOutIcon,
  IconGrid,
  LucideLogo,
  PhosphorLogo,
  RectangleDashedIcon,
  RulerIcon,
  ShapesIcon,
  StackIcon,
  SwatchesIcon,
  TextAaIcon,
  TornadoIcon,
} from './vectors';
import { LiveTiming } from './tuning';

export type PartProps = { live: boolean };

export type Part = {
  id: string;
  /** Figma's bounding box on the 1440 x 1024 slide: x, y, width, height. */
  box: [number, number, number, number];
  /** Figma's rotation in degrees (counterclockwise). */
  tilt?: number;
  /** A vector part takes Icon/icon-brand. */
  vector?: boolean;
  render: (p: PartProps) => ReactNode;
  /** On a phone, an unseen copy at its largest (an open Accordion) keeps its room, so growing moves nothing. */
  reserve?: () => ReactNode;
};

export type Slide = {
  id: string;
  text: string;
  /** "Dark mode that thinks" turns the stage dark. */
  dark?: boolean;
  parts: Part[];
};

/** Steps 0 to count - 1, one every `ms` while `live`; back to 0 when it stops. */
function useCycle(live: boolean, ms: number, count: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!live) {
      setI(0);
      return;
    }
    const id = setInterval(() => setI((n) => (n + 1) % count), ms);
    return () => clearInterval(id);
  }, [live, ms, count]);
  return i;
}

/** The field types a few words, holds them, clears and types again. */
function TypingField({ live }: PartProps) {
  const WORDS = 'Ship it';
  // Steps: a pause, one per character, a hold, then cleared.
  const step = useCycle(live, useContext(LiveTiming).typeMs, WORDS.length + 14);
  const shown = Math.max(0, Math.min(WORDS.length, step - 4));
  return (
    <TextInput
      size="md"
      aria-label="User input"
      placeholder="User input"
      value={WORDS.slice(0, shown)}
      readOnly
      className="wyg-field"
    />
  );
}

/** A static Modal card: Modal's own markup and CSS (modal.css), without the dialog, which would open over the page. */
function ModalCard() {
  return (
    <div className="bland-modal bland-smooth wyg-modal" data-size="sm">
      <div className="bland-modal__content">
        <div className="bland-modal__header">
          <p className="bland-modal__title">Title</p>
          <IconButton className="bland-modal__close" size="xs" type="ghost" icon={<XIcon />} aria-label="Close" />
        </div>
        <div className="bland-modal__body" data-align="left">
          <div className="bland-modal__description">
            Description should take up as much space as possible. I added a slot above and below (hidden) for more
            customization.
          </div>
        </div>
        <div className="bland-modal__actions" data-align="left" data-orientation="horizontal">
          <Button size="md" emotion="brand" type="primary">
            Accept
          </Button>
          <Button size="md" emotion="brand" type="secondary">
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

const TABS = ['Tab', 'Tab', 'Tab', 'Tab'].map((label, k) => ({ id: `t${k}`, label }));

function CyclingTabs({ live }: PartProps) {
  const i = useCycle(live, useContext(LiveTiming).tabsMs, TABS.length);
  return <SegmentedBar size="lg" items={TABS} value={TABS[i]!.id} name="wyg-tabs" aria-label="Tabs" className="wyg-tabs" />;
}

function FlippingToggle({ live }: PartProps) {
  const i = useCycle(live, useContext(LiveTiming).toggleMs, 2);
  return <Toggle size="md" checked={i === 0} onChange={() => {}} aria-label="Dark mode" />;
}

function OpeningAccordion({ live }: PartProps) {
  const i = useCycle(live, useContext(LiveTiming).accordionMs, 2);
  return (
    <Accordion title="Title of accordion" size="sm" open={i === 1} className="wyg-accordion">
      This is the description section of the Accordion. Write more details here.
    </Accordion>
  );
}

const DAYS = ['2024-11-11', '2024-11-14', '2024-11-19', '2024-11-22'];

function PickingCalendar({ live }: PartProps) {
  const i = useCycle(live, useContext(LiveTiming).calendarMs, DAYS.length);
  return <Calendar size="md" value={DAYS[i]!} defaultFocusedValue="2024-11-11" readOnly aria-label="Calendar" />;
}

const CRUMBS = ['Crumb', 'Crumb', 'Crumb', 'Crumb', 'Crumb'].map((label) => ({ label, href: '#what-you-get' }));

export const SLIDES: Slide[] = [
  {
    id: 'parts',
    text: 'Every part a project needs. Buttons and fields, menus and modals, tables and date pickers, chat and file upload.',
    parts: [
      { id: 'field', box: [199, 191, 290, 89], tilt: 10, render: (p) => <TypingField {...p} /> },
      { id: 'modal', box: [806, 123, 414, 272], tilt: -10, render: () => <ModalCard /> },
      {
        id: 'bubble',
        box: [291, 747, 200, 91],
        tilt: -10,
        render: () => (
          <ol className="wyg-chat">
            <ChatBubble who="sender" type="text" time="9:41 AM" status="sent">
              I am a chat bubble 🫧
            </ChatBubble>
          </ol>
        ),
      },
      {
        id: 'button',
        box: [760, 755, 103, 56],
        tilt: 10,
        render: () => (
          <span className="wyg-press">
            <Button size="md" emotion="brand" type="primary">
              Click me
            </Button>
          </span>
        ),
      },
    ],
  },
  {
    id: 'dark',
    text: 'Dark mode that thinks. Not an inverted page: surfaces, shadows and colors each have a dark version made for it.',
    dark: true,
    parts: [
      { id: 'tabs', box: [247, 227, 259, 73], tilt: -7.5, render: (p) => <CyclingTabs {...p} /> },
      {
        id: 'upload',
        box: [833, 187, 395, 219],
        tilt: 3.4,
        render: () => <FileUpload className="wyg-upload" title="Upload file" fileTypes="SVG, PNG, JPG, or GIF" />,
      },
      { id: 'toggle', box: [1056, 675, 56, 32], render: (p) => <FlippingToggle {...p} /> },
      { id: 'crumbs', box: [318, 747, 386, 91], tilt: 10, render: () => <Breadcrumb items={CRUMBS} /> },
      {
        id: 'badge',
        box: [768, 755, 101, 41],
        tilt: -10,
        render: () => (
          <Badge size="lg" emotion="success" type="primary" iconStart={<CheckCircleIcon />}>
            Label
          </Badge>
        ),
      },
    ],
  },
  {
    id: 'motion',
    text: 'Motion with manners. Quick, quiet animations that step aside when someone asks for reduced motion.',
    parts: [
      {
        id: 'accordion',
        box: [223, 210, 258, 54],
        tilt: -5,
        render: (p) => <OpeningAccordion {...p} />,
        // Godwin 2026-11-09: on a phone its opening pushed the page down.
        reserve: () => (
          <Accordion title="Title of accordion" size="sm" open className="wyg-accordion">
            This is the description section of the Accordion. Write more details here.
          </Accordion>
        ),
      },
      { id: 'calendar', box: [805, 155, 248, 256], render: (p) => <PickingCalendar {...p} /> },
      {
        id: 'typing',
        box: [291, 739, 70, 47],
        tilt: -15,
        render: () => (
          <ol className="wyg-chat">
            <ChatBubble who="sender" type="typing" />
          </ol>
        ),
      },
      {
        id: 'toast',
        box: [759, 735, 292, 65],
        tilt: 5,
        render: () => <Toast status="danger">Toasts display information only</Toast>,
      },
    ],
  },
  {
    id: 'everyone',
    text: 'Works for everyone. Keyboard, focus and screen reader behaviour from React Aria, checked in Chromium, WebKit and Firefox.',
    parts: [
      { id: 'figure', box: [737, 221, 96, 96], vector: true, render: () => <AccessFigure /> },
      { id: 'eye', box: [325, 769, 72, 72], vector: true, render: () => <BlinkEye /> },
    ],
  },
  {
    id: 'tokens',
    text: 'Nothing hardcoded. Every color, size and space comes from a token, so a rebrand never touches component code.',
    parts: [
      { id: 'swatches', box: [752, 258, 52, 52], vector: true, render: () => <SwatchesIcon /> },
      { id: 'type', box: [836, 226, 52, 52], vector: true, render: () => <TextAaIcon /> },
      { id: 'ruler', box: [920, 258, 52, 52], vector: true, render: () => <RulerIcon /> },
      { id: 'corners', box: [1004, 226, 52, 52], vector: true, render: () => <CornersOutIcon /> },
      { id: 'dashed', box: [296, 697, 52, 52], vector: true, render: () => <RectangleDashedIcon /> },
      { id: 'stack', box: [380, 729, 52, 52], vector: true, render: () => <StackIcon /> },
      { id: 'tornado', box: [464, 697, 52, 52], vector: true, render: () => <TornadoIcon /> },
      { id: 'arrows', box: [548, 729, 52, 52], vector: true, render: () => <ArrowsOutCardinalIcon /> },
    ],
  },
  {
    id: 'icons',
    text: 'Your icons. Bring Phosphor, Lucide or your own SVGs. Bland sizes and colors them.',
    parts: [
      { id: 'grid', box: [912, 185, 200, 200], vector: true, render: () => <IconGrid /> },
      { id: 'shapes', box: [296, 776, 80, 80], vector: true, render: () => <ShapesIcon /> },
      { id: 'phosphor', box: [408, 788, 42, 56], vector: true, render: () => <PhosphorLogo /> },
      { id: 'lucide', box: [482, 790, 56, 56], vector: true, render: () => <LucideLogo /> },
    ],
  },
];
