// The nine cards of the Components showcase (Figma 7071:32494, in Figma's order), each a real Bland component that
// works (annotation: "All components here should be interactible."). Where a component has no press of its own
// (the Alert, the Avatar, the chat bubble), a plain button lies over it, named for what it does, so the part stays
// valid markup and the press is reachable by keyboard.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Button,
  Calendar,
  ChatBubble,
  Checkbox,
  CheckboxGroup,
  Chip,
  CodeText,
  Dropdown,
  Menu,
  ProgressBar,
  SectionTabs,
  TimePicker,
  Toaster,
  useToaster,
  FileUpload,
  Indicator,
  NumericInputField,
  Pagination,
  Pill,
  Radio,
  RadioGroup,
  SearchInput,
  SegmentedBar,
  Slider,
  TextInput,
  Toggle,
  Tooltip,
  type FileUploadFile,
  type IndicatorEmotion,
  type BadgeType,
  type MessageStatus,
} from '../../../src';
import { ClockIcon, SmileyIcon, StickerIcon, WarningCircleIcon } from '../../../src/icons';

/** The Alert's icons, one per press: Figma's warning first, then any SVG (its line says so). */
const ALERT_ICONS: { icon: ReactNode; name: string }[] = [
  { icon: <WarningCircleIcon />, name: 'warning' },
  { icon: <SmileyIcon />, name: 'smiley' },
  { icon: <StickerIcon />, name: 'sticker' },
  { icon: <ClockIcon />, name: 'clock' },
];

function AlertCard() {
  const [at, setAt] = useState(0);
  const next = ALERT_ICONS[(at + 1) % ALERT_ICONS.length]!;
  return (
    <div className="showcase__tap">
      <Alert status="warning" icon={ALERT_ICONS[at]!.icon} role={undefined}>
        Tap to swap icons
      </Alert>
      <button type="button" className="showcase__tap-target" aria-label={`Use the ${next.name} icon`} onClick={() => setAt((i) => (i + 1) % ALERT_ICONS.length)} />
    </div>
  );
}

function ButtonCard({ loadingMs }: { loadingMs: number }) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), loadingMs);
    return () => clearTimeout(t);
  }, [loading, loadingMs]);
  // Figma's xs brand primary, full width.
  return (
    <Button size="xs" emotion="brand" type="primary" loading={loading} onClick={() => setLoading(true)}>
      Click me
    </Button>
  );
}

const SEGMENTS = [
  { id: 'one', label: 'Tab' },
  { id: 'two', label: 'Tab' },
  { id: 'three', label: 'Tab' },
];

/** The Avatar's status, one per press: Indicator dots in its bottom slot. */
const PRESENCE: { emotion: IndicatorEmotion; name: string }[] = [
  { emotion: 'success', name: 'Online' },
  { emotion: 'warning', name: 'Away' },
  { emotion: 'danger', name: 'Busy' },
  { emotion: 'neutral', name: 'Offline' },
];

function AvatarCard() {
  const [at, setAt] = useState(0);
  const now = PRESENCE[at]!;
  const next = PRESENCE[(at + 1) % PRESENCE.length]!;
  // Figma's photo is a raster image; the landing page is vectors only, so the avatar shows initials.
  return (
    <div className="showcase__tap showcase__tap--round">
      <Avatar size="xl" initials="JD" alt={`Jane Doe, ${now.name}`} bottomSlot={<Indicator ring size="lg" emotion={now.emotion} />} />
      <button type="button" className="showcase__tap-target" aria-label={`Set status to ${next.name}`} onClick={() => setAt((i) => (i + 1) % PRESENCE.length)} />
    </div>
  );
}

const CHECKS = ['one', 'two', 'three', 'four', 'five'];

/** Picked or dropped files become rows that climb to done; nothing is sent anywhere. One row at a time fits the card. */
function UploadCard({ stepMs }: { stepMs: number }) {
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const timer = useRef<number>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  const onFilesAdd = (added: File[]) => {
    const file = added[added.length - 1];
    if (!file) return;
    clearInterval(timer.current);
    const id = `${Date.now()}`;
    setFiles([{ id, name: file.name, status: 'uploading', progress: 0 }]);
    timer.current = window.setInterval(() => {
      setFiles((list) =>
        list.map((f) => {
          if (f.id !== id) return f;
          const progress = (f.progress ?? 0) + 25;
          if (progress < 100) return { ...f, progress };
          clearInterval(timer.current);
          return { ...f, progress: 100, status: 'success' };
        }),
      );
    }, stepMs);
  };
  return (
    <FileUpload
      className="showcase__fill"
      title="Upload file"
      instruction="Drop files here or click to upload"
      files={files}
      onFilesAdd={onFilesAdd}
      onRemove={() => {
        clearInterval(timer.current);
        setFiles([]);
      }}
    />
  );
}

const DELIVERY: MessageStatus[] = ['sent', 'delivered', 'seen'];

function ChatCard() {
  const [at, setAt] = useState(0);
  const next = DELIVERY[(at + 1) % DELIVERY.length]!;
  return (
    <div className="showcase__tap">
      <ol className="showcase__chat" aria-label="Messages">
        <ChatBubble who="sender" time="9:41 AM" status={DELIVERY[at]}>
          I am a chat bubble 🫧
        </ChatBubble>
      </ol>
      <button type="button" className="showcase__tap-target" aria-label={`Mark as ${next}`} onClick={() => setAt((i) => (i + 1) % DELIVERY.length)} />
    </div>
  );
}

/** The nine cards, Figma's reading order; `top` cards start at the top of their card (Figma's calendar and upload). */
export function cards({ buttonLoadingMs, uploadStepMs }: { buttonLoadingMs: number; uploadStepMs: number }): { id: string; top?: boolean; node: ReactNode }[] {
  return [
    { id: 'alert', node: <AlertCard /> },
    { id: 'calendar', top: true, node: <Calendar size="sm" aria-label="Date" /> },
    { id: 'button', node: <ButtonCard loadingMs={buttonLoadingMs} /> },
    { id: 'input', node: <TextInput className="showcase__fill" size="sm" label="Label" placeholder="User input" /> },
    { id: 'segments', node: <SegmentedBar className="showcase__fill" aria-label="Tabs" name="showcase-tabs" items={SEGMENTS} defaultValue="one" /> },
    { id: 'avatar', node: <AvatarCard /> },
    {
      id: 'checkboxes',
      node: (
        <CheckboxGroup aria-label="Checklist">
          {CHECKS.map((id, i) => (
            <Checkbox key={id} defaultChecked={i === 0}>
              You should check me
            </Checkbox>
          ))}
        </CheckboxGroup>
      ),
    },
    { id: 'upload', node: <UploadCard stepMs={uploadStepMs} /> },
    { id: 'chat', node: <ChatCard /> },
  ];
}

const TOPICS = ['Design', 'Code', 'Docs'];
const PLANS = [
  { id: 'free', label: 'Free' },
  { id: 'pro', label: 'Pro' },
  { id: 'team', label: 'Team' },
];

/**
 * The second set, behind the toolbar's switcher (Godwin 2026-11-09): nine more real components that work, chosen to
 * sit in a card as Figma's do (no Figma frame for them).
 */
export function moreCards(): { id: string; top?: boolean; node: ReactNode }[] {
  return [
    { id: 'toggle', node: <Toggle defaultChecked>Notifications</Toggle> },
    { id: 'slider', node: <Slider className="showcase__fill" aria-label="Volume" defaultValue={40} /> },
    {
      id: 'pills',
      node: (
        <div className="showcase__row" role="group" aria-label="Topics">
          {TOPICS.map((topic, i) => (
            <Pill key={topic} defaultSelected={i === 0}>
              {topic}
            </Pill>
          ))}
        </div>
      ),
    },
    { id: 'search', node: <SearchInput className="showcase__fill" clearable placeholder="Search" /> },
    { id: 'pagination', node: <Pagination pageCount={4} defaultPage={2} /> },
    {
      id: 'tooltip',
      node: (
        <Tooltip text="Tooltips name what they point at" placement="top">
          <Button size="sm" emotion="brand" type="secondary">
            Hover me
          </Button>
        </Tooltip>
      ),
    },
    {
      id: 'radios',
      node: (
        <RadioGroup aria-label="Plan" defaultValue="pro">
          {PLANS.map((plan) => (
            <Radio key={plan.id} value={plan.id}>
              {plan.label}
            </Radio>
          ))}
        </RadioGroup>
      ),
    },
    { id: 'code', node: <NumericInputField label="Verification code" length={4} /> },
    {
      id: 'accordion',
      node: (
        <Accordion className="showcase__fill" title="What is Bland?">
          A design system you make your own: your brand, your fonts, light and dark.
        </Accordion>
      ),
    },
  ];
}

const FRAMEWORKS = [
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
];
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'code', label: 'Code' },
  { id: 'props', label: 'Props' },
];
const MENU_ITEMS = [
  { id: 'edit', label: 'Edit' },
  { id: 'duplicate', label: 'Duplicate', divider: true },
  { id: 'delete', label: 'Delete', danger: true },
];
const TAGS = ['Tokens', 'Themes', 'Fonts'];
const BADGE_TYPES: BadgeType[] = ['secondary', 'primary', 'outline'];
const PROGRESS = [40, 65, 90, 100, 15];

function ToastButton() {
  const { toast } = useToaster();
  return (
    <Button size="sm" emotion="brand" type="secondary" onClick={() => toast('Saved. Toasts look like this.', { status: 'success' })}>
      Show a toast
    </Button>
  );
}

function ChipsCard() {
  const [tags, setTags] = useState(TAGS);
  if (!tags.length)
    return (
      <Button size="sm" emotion="brand" type="ghost" onClick={() => setTags(TAGS)}>
        Bring the chips back
      </Button>
    );
  return (
    <div className="showcase__row">
      {tags.map((tag) => (
        <Chip key={tag} size="md" onRemove={() => setTags((all) => all.filter((t) => t !== tag))}>
          {tag}
        </Chip>
      ))}
    </div>
  );
}

function BadgesCard() {
  const [at, setAt] = useState(0);
  const next = BADGE_TYPES[(at + 1) % BADGE_TYPES.length]!;
  return (
    <div className="showcase__tap">
      <div className="showcase__row">
        {(['brand', 'success', 'warning', 'danger'] as const).map((emotion) => (
          <Badge key={emotion} emotion={emotion} type={BADGE_TYPES[at]}>
            {emotion[0]!.toUpperCase() + emotion.slice(1)}
          </Badge>
        ))}
      </div>
      <button type="button" className="showcase__tap-target" aria-label={`Show ${next} badges`} onClick={() => setAt((i) => (i + 1) % BADGE_TYPES.length)} />
    </div>
  );
}

function ProgressCard() {
  const [at, setAt] = useState(0);
  const value = PROGRESS[at]!;
  return (
    <div className="showcase__tap showcase__fill">
      <ProgressBar label="Storage" value={value} status={value === 100 ? 'success' : 'default'} />
      <button type="button" className="showcase__tap-target" aria-label="Fill the bar" onClick={() => setAt((i) => (i + 1) % PROGRESS.length)} />
    </div>
  );
}

/** The third set (Godwin 2026-11-09): nine more, each working, chosen to sit in a card. */
export function lastCards(): { id: string; top?: boolean; node: ReactNode }[] {
  return [
    { id: 'dropdown', node: <Dropdown className="showcase__fill" label="Framework" items={FRAMEWORKS} defaultValue="react" /> },
    { id: 'tabs', node: <SectionTabs className="showcase__fill" aria-label="Sections" items={SECTIONS} /> },
    {
      id: 'toast',
      node: (
        <Toaster>
          <ToastButton />
        </Toaster>
      ),
    },
    { id: 'progress', node: <ProgressCard /> },
    { id: 'chips', node: <ChipsCard /> },
    { id: 'badges', node: <BadgesCard /> },
    { id: 'code-text', node: <CodeText size="md" copyable>
          npm install bland-ui
        </CodeText> },
    { id: 'time', node: <TimePicker className="showcase__fill" label="Time" defaultValue="09:41" /> },
    {
      id: 'menu',
      node: (
        <Menu items={MENU_ITEMS} aria-label="Actions">
          <Button size="sm" emotion="brand" type="secondary">
            Open a menu
          </Button>
        </Menu>
      ),
    },
  ];
}
